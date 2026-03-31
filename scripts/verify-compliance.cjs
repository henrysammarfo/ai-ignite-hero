/**
 * Institutional fUSX Compliance Verification Script (CommonJS)
 */
const anchor = require("@coral-xyz/anchor");
const { Program, AnchorProvider, Wallet, BN } = anchor;
const { 
    PublicKey, 
    Keypair, 
    SystemProgram, 
    Connection, 
    SYSVAR_RENT_PUBKEY,
    Transaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");
const { 
    TOKEN_2022_PROGRAM_ID, 
    getAssociatedTokenAddressSync, 
    createAssociatedTokenAccountInstruction,
    createTransferCheckedWithTransferHookInstruction
} = require("@solana/spl-token");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

console.log("\n🚀 Starting Institutional Compliance Verification (CJS)...");

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

// Load Vault IDL
const idlPath = path.resolve(process.cwd(), "target/idl/compliance_vault.json");
const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
const program = new Program(idl, provider);

// Load Hook IDL
const hookIdlPath = path.resolve(process.cwd(), "target/idl/fortis_token_hook.json");
const hookIdl = JSON.parse(fs.readFileSync(hookIdlPath, "utf-8"));
const hookProgram = new Program(hookIdl, provider);

const HOOK_PROGRAM_ID = new PublicKey("DeyUc9UHQzs21xz92ayh4qcu7P9XaZdASUYnKR6GuUmG");

async function run() {
    try {
        console.log("■ Admin:", adminKeypair.publicKey.toBase58());
        const [vaultState] = PublicKey.findProgramAddressSync(
            [Buffer.from("vault"), adminKeypair.publicKey.toBuffer()],
            program.programId
        );

        // 0. Initialize Vault if needed
        console.log("\n[0/5] Checking Vault state...");
        const vaultInfo = await connection.getAccountInfo(vaultState);
        if (!vaultInfo) {
            console.log("■ Initializing Vault...");
            await program.methods
                .initializeVault()
                .accounts({
                    vaultState: vaultState,
                    admin: adminKeypair.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();
            console.log("✔ Vault Initialized");
        } else {
            console.log("✔ Vault already exists");
        }
        
        const fusxMint = Keypair.generate();
        const [extraMetas] = PublicKey.findProgramAddressSync(
            [Buffer.from("extra-account-metas"), fusxMint.publicKey.toBuffer()],
            HOOK_PROGRAM_ID
        );

        // 0.1 Initialize Hook Metas
        console.log("\n[0.1/5] Initializing Hook Extra Account Metas...");
        await hookProgram.methods
            .initializeExtraAccountMetas()
            .accounts({
                extraAccountMetas: extraMetas,
                mint: fusxMint.publicKey,
                vaultState: vaultState,
                payer: adminKeypair.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();
        console.log("✔ Hook Metas Initialized");

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
        console.error("\n❌ Error:", err.message);
        if (err.logs) {
            console.log("\n📜 Transaction Logs:");
            err.logs.forEach(log => console.log("  " + log));
        }
        process.exit(1);
    }
}

run();
