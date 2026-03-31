import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ComplianceVault } from "../target/types/compliance_vault";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, createAccount, mintTo } from "@solana/spl-token";
import { assert } from "chai";

describe("compliance-vault", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.ComplianceVault as Program<ComplianceVault>;
    const admin = provider.wallet;

    let vaultStatePDA: PublicKey;
    let vaultStateBump: number;
    let usdcMint: PublicKey;
    let adminUsdcAccount: PublicKey;
    let vaultUsdcAccount: PublicKey;

    before(async () => {
        // 1. Derive Vault PDA
        [vaultStatePDA, vaultStateBump] = await PublicKey.findProgramAddress(
            [Buffer.from("vault"), admin.publicKey.toBuffer()],
            program.programId
        );

        // 2. Setup Test Mint (Simulating USDC)
        usdcMint = await createMint(
            provider.connection,
            (admin as any).payer,
            admin.publicKey,
            null,
            6
        );

        // 3. Setup Admin Token Account
        adminUsdcAccount = await createAccount(
            provider.connection,
            (admin as any).payer,
            usdcMint,
            admin.publicKey
        );

        // 4. Setup Vault Token Account (Owned by Vault PDA)
        vaultUsdcAccount = await createAccount(
            provider.connection,
            (admin as any).payer,
            usdcMint,
            vaultStatePDA
        );

        // 5. Mint some test tokens to Admin
        await mintTo(
            provider.connection,
            (admin as any).payer,
            usdcMint,
            adminUsdcAccount,
            admin.publicKey,
            1000 * 10 ** 6 // 1000 USDC
        );
    });

    it("Is initialized!", async () => {
        const tx = await program.methods
            .initializeVault()
            .accounts({
                vaultState: vaultStatePDA,
                admin: admin.publicKey,
                systemProgram: SystemProgram.programId,
            } as any)
            .rpc();

        const state = await program.account.vaultState.fetch(vaultStatePDA);
        assert.equal(state.authority.toBase58(), admin.publicKey.toBase58());
        assert.equal(state.totalAum.toNumber(), 0);
        assert.isFalse(state.paused);
    });

    it("Can deposit funds", async () => {
        const amount = new anchor.BN(100 * 10 ** 6); // 100 USDC
        const sofHash = Array.from(Buffer.alloc(32));

        const [depositorPDA] = await PublicKey.findProgramAddress(
            [Buffer.from("depositor"), vaultStatePDA.toBuffer(), admin.publicKey.toBuffer()],
            program.programId
        );

        await program.methods
            .deposit(amount, sofHash)
            .accounts({
                depositor: admin.publicKey,
                vaultState: vaultStatePDA,
                depositorAccount: depositorPDA,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            } as any)
            .preInstructions([
                // In a real scenario, we might need to transfer tokens into the vault or similar
                // For this test, we just ensure the instruction logic works
            ])
            .rpc();

        const depositorState = await program.account.depositorAccount.fetch(depositorPDA);
        assert.equal(depositorState.balanceUsdc.toNumber(), amount.toNumber());
    });

    it("Can withdraw funds", async () => {
        const amount = new anchor.BN(50 * 10 ** 6); // 50 USDC

        const [depositorPDA] = await PublicKey.findProgramAddress(
            [Buffer.from("depositor"), vaultStatePDA.toBuffer(), admin.publicKey.toBuffer()],
            program.programId
        );

        await program.methods
            .withdraw(amount)
            .accounts({
                depositor: admin.publicKey,
                vaultState: vaultStatePDA,
                depositorAccount: depositorPDA,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            } as any)
            .rpc();

        const depositorState = await program.account.depositorAccount.fetch(depositorPDA);
        assert.equal(depositorState.balanceUsdc.toNumber(), 50 * 10 ** 6);
    });
});
