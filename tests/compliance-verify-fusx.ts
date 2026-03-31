/**
 * fUSX Compliance Verification Test Suite
 * Validates Token-2022 Mint Initialization and Transfer Hook Enforcement.
 */
import { describe, it, beforeAll } from "vitest";
import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet, BN } from "@coral-xyz/anchor";
import { ComplianceVault } from "../target/types/compliance_vault";
import { 
    PublicKey, 
    Keypair, 
    SystemProgram, 
    Connection, 
    SYSVAR_RENT_PUBKEY,
    Transaction,
    sendAndConfirmTransaction
} from "@solana/web3.js";
import { 
    TOKEN_2022_PROGRAM_ID, 
    getAssociatedTokenAddressSync, 
    createAssociatedTokenAccountInstruction,
    createTransferCheckedWithTransferHookInstruction,
    addExtraAccountMetasForExecute,
    createTransferCheckedInstruction
} from "@solana/spl-token";
import { assert } from "chai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

// ─── Setup ───────────────────────────────────────────────────────────────────

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Load local keypair for devnet ops from environments
const adminKeypair = Keypair.fromSecretKey(
    anchor.utils.bytes.bs58.decode(process.env.SOLANA_PRIVATE_KEY || "")
);

const provider = new AnchorProvider(connection, new Wallet(adminKeypair), { 
    commitment: "confirmed",
    skipPreflight: true 
});
anchor.setProvider(provider);

import idl from "../target/idl/compliance_vault.json";
const program = new Program(idl as any, provider) as Program<ComplianceVault>;

const HOOK_PROGRAM_ID = new PublicKey("DeyUc9UHQzs21xz92ayh4qcu7P9XaZdASUYnKR6GuUmG");

describe("fUSX Institutional Compliance Verification", () => {
    let vaultState: PublicKey;
    let fusxMint = Keypair.generate();
    let extraMetas: PublicKey;
    let adminAta: PublicKey;
    let recipient = Keypair.generate();
    let recipientAta: PublicKey;
    let userAccountPDA: PublicKey;

    beforeAll(async () => {
        console.log("■ Admin:", adminKeypair.publicKey.toBase58());
        console.log("■ Vault:", program.programId.toBase58());
        console.log("■ Hook:", HOOK_PROGRAM_ID.toBase58());

        [vaultState] = PublicKey.findProgramAddressSync(
            [Buffer.from("vault"), adminKeypair.publicKey.toBuffer()],
            program.programId
        );
        [extraMetas] = PublicKey.findProgramAddressSync(
            [Buffer.from("extra-account-metas"), fusxMint.publicKey.toBuffer()],
            HOOK_PROGRAM_ID
        );
        [userAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("depositor"), vaultState.toBuffer(), adminKeypair.publicKey.toBuffer()],
            program.programId
        );

        adminAta = getAssociatedTokenAddressSync(fusxMint.publicKey, adminKeypair.publicKey, false, TOKEN_2022_PROGRAM_ID);
        recipientAta = getAssociatedTokenAddressSync(fusxMint.publicKey, recipient.publicKey, false, TOKEN_2022_PROGRAM_ID);
    });

    it("1. Initializes fUSX Mint with Transfer Hook extension", async () => {
        console.log("■ Minting fUSX:", fusxMint.publicKey.toBase58());
        const tx = await program.methods
            .initializeFortisToken()
            .accounts({
                admin: adminKeypair.publicKey,
                fusxMint: fusxMint.publicKey,
                vaultState: vaultState,
                extraAccountMetas: extraMetas,
                tokenHookProgram: HOOK_PROGRAM_ID,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY,
            } as any)
            .signers([fusxMint])
            .rpc();
        console.log("✔ fUSX Mint Initialized:", tx);
    });

    it("2. Verifies User KYC in Compliance Vault", async () => {
        console.log("■ Verifying Admn KYC...");
        const tx = await program.methods
            .verifyUser(true, 1, false, 1)
            .accounts({
                vaultState: vaultState,
                authority: adminKeypair.publicKey,
                userAccount: userAccountPDA,
                user: adminKeypair.publicKey,
                systemProgram: SystemProgram.programId,
            } as any)
            .rpc();
        console.log("✔ Admin Verified:", tx);
    });

    it("3. Issues Vault Shares (Mints fUSX to Verified User)", async () => {
        console.log("■ Issuing Shares...");
        
        // Create ATA first
        const ataTx = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                adminKeypair.publicKey,
                adminAta,
                adminKeypair.publicKey,
                fusxMint.publicKey,
                TOKEN_2022_PROGRAM_ID
            )
        );
        await sendAndConfirmTransaction(connection, ataTx, [adminKeypair]);

        const tx = await program.methods
            .issueVaultShares(new BN(1000 * 10**6))
            .accounts({
                authority: adminKeypair.publicKey,
                vaultState: vaultState,
                fusxMint: fusxMint.publicKey,
                userAta: adminAta,
                userAccount: userAccountPDA,
                user: adminKeypair.publicKey,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
            } as any)
            .rpc();
        console.log("✔ 1000 fUSX Issued:", tx);
    });

    it("4. Blocks transfer to unverified recipient (Transfer Hook Enforcement)", async () => {
        console.log("■ Attempting transfer to unverified recipient...");
        
        // Create recipient ATA
        const ataTx = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                adminKeypair.publicKey,
                recipientAta,
                recipient.publicKey,
                fusxMint.publicKey,
                TOKEN_2022_PROGRAM_ID
            )
        );
        await sendAndConfirmTransaction(connection, ataTx, [adminKeypair]);

        try {
            // Build transfer instruction with extra accounts for hook
            const transferIx = await createTransferCheckedWithTransferHookInstruction(
                connection,
                adminAta,
                fusxMint.publicKey,
                recipientAta,
                adminKeypair.publicKey,
                BigInt(100 * 10**6),
                6,
                [],
                "confirmed",
                TOKEN_2022_PROGRAM_ID
            );

            const tx = new Transaction().add(transferIx);
            await sendAndConfirmTransaction(connection, tx, [adminKeypair]);
            assert.fail("Transfer should have been blocked by hook");
        } catch (err: any) {
            console.log("✔ Transfer blocked as expected:", err.message);
            assert.include(err.message, "0x1", "Expected Hook Error (RecipientNotRegistered)");
        }
    });

    it("5. Allows transfer after recipient is verified", async () => {
        console.log("■ Verifying recipient...");
        const recipientPDA = PublicKey.findProgramAddressSync(
            [Buffer.from("depositor"), vaultState.toBuffer(), recipient.publicKey.toBuffer()],
            program.programId
        )[0];

        await program.methods
            .verifyUser(true, 1, false, 1)
            .accounts({
                vaultState: vaultState,
                authority: adminKeypair.publicKey,
                userAccount: recipientPDA,
                user: recipient.publicKey,
                systemProgram: SystemProgram.programId,
            } as any)
            .rpc();

        console.log("■ Retrying transfer...");
        const transferIx = await createTransferCheckedWithTransferHookInstruction(
            connection,
            adminAta,
            fusxMint.publicKey,
            recipientAta,
            adminKeypair.publicKey,
            BigInt(100 * 10**6),
            6,
            [],
            "confirmed",
            TOKEN_2022_PROGRAM_ID
        );

        const tx = await sendAndConfirmTransaction(connection, new Transaction().add(transferIx), [adminKeypair]);
        console.log("✔ Institutional Transfer Successful:", tx);
    });
});
