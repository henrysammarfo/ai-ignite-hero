const anchor = require("@coral-xyz/anchor");
const { Program, AnchorProvider, Wallet } = anchor;
const { PublicKey, Keypair, Connection, SystemProgram, SYSVAR_RENT_PUBKEY } = require("@solana/web3.js");
const { TOKEN_2022_PROGRAM_ID } = require("@solana/spl-token");
const fs = require("fs");
const path = require("path");

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const idPath = path.join(process.env.HOME || "", ".config/solana/id.json");
    const adminKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(idPath, "utf-8"))));
    
    const provider = new AnchorProvider(connection, new Wallet(adminKeypair), { commitment: "confirmed" });
    anchor.setProvider(provider);

    const idl = JSON.parse(fs.readFileSync("./target/idl/compliance_vault.json", "utf-8"));
    const program = new Program(idl, provider);

    const hookProgramId = new PublicKey("DeyUc9UHQzs21xz92ayh4qcu7P9XaZdASUYnKR6GuUmG");
    
    // Load STABLE mint keypair
    const mintKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync("./fusx-mint-keypair.json", "utf-8"))));
    console.log(" Mint Address:", mintKeypair.publicKey.toBase58());

    const [vaultState] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), adminKeypair.publicKey.toBuffer()],
        program.programId
    );

    const [extraMetas] = PublicKey.findProgramAddressSync(
        [Buffer.from("extra-account-metas"), mintKeypair.publicKey.toBuffer()],
        hookProgramId
    );

    console.log(" Initializing fUSX Mint on Devnet...");
    try {
        const tx = await program.methods
            .initializeFortisToken()
            .accounts({
                admin: adminKeypair.publicKey,
                fusxMint: mintKeypair.publicKey,
                vaultState: vaultState,
                extraAccountMetas: extraMetas,
                tokenHookProgram: hookProgramId,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY,
            })
            .signers([mintKeypair])
            .rpc();
        
        console.log("✔ SUCCESS! Mint is live.");
        console.log(" Transaction:", tx);
    } catch (err) {
        console.error(" Error:", err.message);
        if (err.logs) console.log(err.logs);
    }
}

main();
