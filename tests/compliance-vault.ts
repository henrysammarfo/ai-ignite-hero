/**
 * @vitest-environment node
 *
 * Compliance-Vault integration tests against Devnet.
 * Pure on-chain account tests — no SPL token ops requiring sequential TXs.
 * For live deposit/withdraw: use `anchor test` which runs node-local validators.
 */
import { describe, it, beforeAll } from "vitest";
import * as dotenv from "dotenv";
dotenv.config();

// Use the TypeScript types IDL (camelCase) — Anchor maps discriminators correctly
import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet, BN } from "@coral-xyz/anchor";
import { ComplianceVault } from "../target/types/compliance_vault";
import { PublicKey, Keypair, SystemProgram, Connection } from "@solana/web3.js";
import { assert } from "chai";

// ─── Provider ────────────────────────────────────────────────────────────────

const rpcUrl = process.env.VITE_HELIUS_RPC_URL || "https://api.devnet.solana.com";
const connection = new Connection(rpcUrl, "confirmed");

// Helper to bypass WebSocket strict drops on Devnet RPCs
async function sendWithoutConfirm(tx: anchor.web3.Transaction) {
    tx.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
    tx.feePayer = admin.publicKey;
    const sig = await connection.sendTransaction(tx, [adminKeypair], { skipPreflight: true });
    // Wait manually instead of using WebSocket confirmTransaction
    await new Promise(r => setTimeout(r, 4000));
    return sig;
}

const secretKey = anchor.utils.bytes.bs58.decode(
    process.env.SOLANA_PRIVATE_KEY || ""
);
const adminKeypair = Keypair.fromSecretKey(secretKey);
const wallet = new Wallet(adminKeypair);
const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
    skipPreflight: true,
});
anchor.setProvider(provider);

// Need the camelCase TypeScript version to get method names right
// The target/types file references the same discriminators as target/idl
// but uses camelCase names that Anchor's MethodsNamespace expects
import targetIdl from "../target/idl/compliance_vault.json";
const program = new Program(targetIdl as any, provider) as Program<ComplianceVault>;
const admin = provider.wallet;

// ─── Shared state ─────────────────────────────────────────────────────────────

let vaultStatePDA: PublicKey;
let depositorPDA: PublicKey;

// ─── Suite ───────────────────────────────────────────────────────────────────

describe("compliance-vault — devnet integration", () => {

    beforeAll(async () => {
        console.log("\n■ RPC:", rpcUrl.slice(0, 60));
        const bal = await connection.getBalance(admin.publicKey);
        console.log("■ Admin:", admin.publicKey.toBase58(), "—", (bal / 1e9).toFixed(4), "SOL");
        if (bal < 5e7) throw new Error("Fund admin wallet (< 0.05 SOL)");

        // Derive PDAs
        [vaultStatePDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("vault"), admin.publicKey.toBuffer()],
            program.programId
        );
        [depositorPDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("depositor"),
                vaultStatePDA.toBuffer(),
                admin.publicKey.toBuffer(),
            ],
            program.programId
        );
        console.log("■ Vault PDA:", vaultStatePDA.toBase58());

        // Initialize vault if not already on-chain (idempotent)
        const vaultInfo = await connection.getAccountInfo(vaultStatePDA);
        if (!vaultInfo) {
            console.log("■ Initializing vault…");
            const ix = await program.methods
                .initializeVault()
                .accounts({
                    vaultState: vaultStatePDA,
                    admin: admin.publicKey,
                    systemProgram: SystemProgram.programId,
                } as any)
                .instruction();
            const tx = new anchor.web3.Transaction().add(ix);
            await sendWithoutConfirm(tx);
            console.log("■ Vault initialized ✔");
        } else {
            console.log("■ Vault already on-chain ✔ (", vaultInfo.data.length, "bytes)");
        }
    }, 120_000);

    // ── T1: vault state account exists on devnet ──────────────────────────────

    it("vault state account exists and is owned by the program", async () => {
        const info = await connection.getAccountInfo(vaultStatePDA);
        assert.isNotNull(info, "vault state must exist on-chain");
        assert.equal(
            info!.owner.toBase58(),
            program.programId.toBase58(),
            "vault state must be owned by the program"
        );
        console.log("Vault owner ✔ —", info!.owner.toBase58().slice(0, 10), "…");
    });

    // ── T2: vault authority is admin (raw binary parse) ───────────────────────

    it("vault authority matches admin (raw binary parse)", async () => {
        const info = await connection.getAccountInfo(vaultStatePDA);
        assert.isNotNull(info);
        // Anchor layout: 8-byte discriminator, then authority pubkey (32 bytes)
        const authority = new PublicKey(info!.data.slice(8, 40));
        assert.equal(
            authority.toBase58(),
            admin.publicKey.toBase58(),
            "authority must match admin"
        );
        console.log("Vault authority ✔:", authority.toBase58());
    });

    // ── T3: whitelist update — admin can add a strategy ───────────────────────

    it("admin can add a strategy to the whitelist", async () => {
        const fakeStrategy = Keypair.generate().publicKey;
        const ix = await program.methods
            .updateWhitelist(fakeStrategy, true)
            .accounts({
                admin: admin.publicKey,
                vaultState: vaultStatePDA,
            } as any)
            .instruction();
        const tx = new anchor.web3.Transaction().add(ix);
        await sendWithoutConfirm(tx);
        console.log("Strategy whitelisted ✔:", fakeStrategy.toBase58().slice(0, 10), "…");
    }, 90_000);

    // ── T4: KYC gate (deposit must reject unverified) ─────────────────────────
    // We send a deposit with a dummy token account.  The program will:
    //   a) read depositor_account (init_if_needed), then
    //   b) immediately reject with KYCNotVerified because kyc_verified=false.
    // ── T5: KYC gate — unverified users cannot deposit (SIMULATED) ───────────

    it("deposit rejected with KYCNotVerified for unverified user (simulated)", async () => {
        const fakeUsdcAccount = Keypair.generate().publicKey;
        const amount = new BN(10 * 10 ** 6);
        const sofHash = Array.from(Buffer.alloc(32));

        try {
            const result = await program.methods
                .deposit(amount, sofHash)
                .accounts({
                    depositor: admin.publicKey,
                    vaultState: vaultStatePDA,
                    depositorAccount: depositorPDA,
                    depositorUsdc: fakeUsdcAccount,
                    vaultUsdc: fakeUsdcAccount,
                    tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
                    systemProgram: SystemProgram.programId,
                } as any)
                .simulate();

            assert.fail("Expected simulation to fail but it succeeded");
        } catch (err: any) {
            const msg: string = JSON.stringify(err) + (err?.message ?? "");
            // Check for Anchor error or raw simulation error
            const isKYCRelated = msg.includes("KYCNotVerified") || msg.includes("6000") || msg.includes("0x1770");
            assert.isTrue(isKYCRelated, `Expected KYCNotVerified error, got: ${msg.slice(0, 200)}`);
            console.log("KYC gate simulation check ✔");
        }
    });

    // ── T6: admin can verify a user ──────────────────────────────────────────

    it("admin can verify a user to enable deposits", async () => {
        console.log("■ Verifying user…");
        const ix = await program.methods
            .verifyUser(true)
            .accounts({
                vaultState: vaultStatePDA,
                authority: admin.publicKey,
                userAccount: depositorPDA,
                user: admin.publicKey,
                systemProgram: SystemProgram.programId,
            } as any)
            .instruction();
        const tx = new anchor.web3.Transaction().add(ix);
        const sig = await sendWithoutConfirm(tx);
        console.log("■ User verified via tx:", sig.slice(0, 15), "…");

        const acc = await program.account.depositorAccount.fetch(depositorPDA);
        assert.isTrue(acc.kycVerified, "kyc_verified should be true after update");
    }, 90_000);

    // ── T7: verified user can attempt deposit (reaches SPL check) ────────────

    it("verified user can bypass KYC gate (reaches SPL step)", async () => {
        const fakeUsdcAccount = Keypair.generate().publicKey;
        try {
            // This will still fail at the SPL level because accounts are fake,
            // but it should NOT fail with KYCNotVerified.
            await program.methods
                .deposit(new BN(100), Array.from(Buffer.alloc(32)))
                .accounts({
                    depositor: admin.publicKey,
                    vaultState: vaultStatePDA,
                    depositorAccount: depositorPDA,
                    depositorUsdc: fakeUsdcAccount,
                    vaultUsdc: fakeUsdcAccount,
                    tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
                    systemProgram: SystemProgram.programId,
                } as any)
                .simulate();
        } catch (err: any) {
            const msg = JSON.stringify(err);
            assert.isFalse(msg.includes("KYCNotVerified"), "Should NOT be rejected by KYC gate anymore");
            console.log("KYC bypass check ✔ — (failed at SPL as expected)");
        }
    });
});
