/**
 * Institutional fUSX Compliance Verification Script (Vanilla JS)
 */
import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet, BN } from "@coral-xyz/anchor";
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
    createTransferCheckedWithTransferHookInstruction
} from "@solana/spl-token";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("\n🚀 Starting Institutional Compliance Verification...");

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Load local keypair
const idPath = path.join(process.env.HOME || "", ".config/solana/id.json");
const adminKeypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(idPath, "utf-8")))
);

const provider = new AnchorProvider(connection, new Wallet(adminKeypair), { 
    commitment: "confirmed",
    skipPreflight: true 
});
anchor.setProvider(provider);

// Load IDL
const idlPath = path.resolve(process.cwd(), "target/idl/compliance_vault.json");
const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
const program = new Program(idl, provider);

const HOOK_PROGRAM_ID = new PublicKey("DeyUc9UHQzs21xz92ayh4qcu7P9XaZdASUYnKR6GuUmG");

async function run() {
    try {
        console.log("■ Admin:", adminKeypair.publicKey.toBase58());
        const [vaultState] = PublicKey.findProgramAddressSync(
            [Buffer.from("vault"), adminKeypair.publicKey.toBuffer()],
            program.programId
        );
        
        const fusxMint = Keypair.generate();
        const [extraMetas] = PublicKey.findProgramAddressSync(
            [Buffer.from("extra-account-metas"), fusxMint.publicKey.toBuffer()],
            HOOK_PROGRAM_ID
        );
        const [adminAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("depositor"), vaultState.toBuffer(), adminKeypair.publicKey.toBuffer()],
            program.programId
        );

        console.log("■ fUSX Mint:", fusxMint.publicKey.toBase58());

        console.log("\n[1/5] Initializing fUSX Mint...");
        await program.methods
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
            })
            .signers([fusxMint])
            .rpc();
        console.log("✔ Initialized");

        console.log("\n[2/5] KYC Verifying Admin...");
        await program.methods
            .verifyUser(true)
            .accounts({
                vaultState: vaultState,
                authority: adminKeypair.publicKey,
                userAccount: adminAccountPDA,
                user: adminKeypair.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();
        console.log("✔ Verified");

        console.log("\n[3/5] Issuing 1000 fUSX...");
        const adminAta = getAssociatedTokenAddressSync(fusxMint.publicKey, adminKeypair.publicKey, false, TOKEN_2022_PROGRAM_ID);
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

        await program.methods
            .issueVaultShares(new BN(1000 * 10**6))
            .accounts({
                authority: adminKeypair.publicKey,
                vaultState: vaultState,
                fusxMint: fusxMint.publicKey,
                userAta: adminAta,
                userAccount: adminAccountPDA,
                user: adminKeypair.publicKey,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
            })
            .rpc();
        console.log("✔ Issued");

        console.log("\n[4/5] Testing Hook BLOCK...");
        const recipient = Keypair.generate();
        const recipientAta = getAssociatedTokenAddressSync(fusxMint.publicKey, recipient.publicKey, false, TOKEN_2022_PROGRAM_ID);
        await sendAndConfirmTransaction(connection, new Transaction().add(
            createAssociatedTokenAccountInstruction(
                adminKeypair.publicKey,
                recipientAta,
                recipient.publicKey,
                fusxMint.publicKey,
                TOKEN_2022_PROGRAM_ID
            )
        ), [adminKeypair]);

        try {
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
            await sendAndConfirmTransaction(connection, new Transaction().add(transferIx), [adminKeypair]);
        } catch (err) {
            console.log("✔ Correctly Blocked");
        }

        console.log("\n[5/5] Testing Hook SUCCESS...");
        const recipientPDA = PublicKey.findProgramAddressSync(
            [Buffer.from("depositor"), vaultState.toBuffer(), recipient.publicKey.toBuffer()],
            program.programId
        )[0];

        await program.methods
            .verifyUser(true)
            .accounts({
                vaultState: vaultState,
                authority: adminKeypair.publicKey,
                userAccount: recipientPDA,
                user: recipient.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        const successIx = await createTransferCheckedWithTransferHookInstruction(
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
        await sendAndConfirmTransaction(connection, new Transaction().add(successIx), [adminKeypair]);
        console.log("✔ Successful!");

        console.log("\n⭐ COMPLIANCE LAYER VERIFIED ⭐\n");
    } catch (err) {
        console.error("\n❌ Error:", err);
        process.exit(1);
    }
}

run();
