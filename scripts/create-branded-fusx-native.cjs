const { 
    Connection, 
    Keypair, 
    SystemProgram, 
    Transaction, 
    sendAndConfirmTransaction, 
    PublicKey 
} = require("@solana/web3.js");
const { 
    ExtensionType, 
    createInitializeMintInstruction, 
    createInitializeMintCloseAuthorityInstruction,
    createInitializeMetadataPointerInstruction,
    TOKEN_2022_PROGRAM_ID,
    getMintLen,
    createInitializeTransferHookInstruction,
    tokenMetadataInitialize
} = require("@solana/spl-token");
const bs58 = require("bs58");
require("dotenv").config();

async function main() {
    const connection = new Connection(process.env.VITE_HELIUS_RPC_URL || "https://api.devnet.solana.com", "confirmed");
    const secretKey = bs58.decode(process.env.SOLANA_PRIVATE_KEY || "");
    const admin = Keypair.fromSecretKey(secretKey);
    console.log("Admin:", admin.publicKey.toBase58());

    const mint = Keypair.generate();
    console.log("New Branded Mint (Native Metadata):", mint.publicKey.toBase58());

    const VAULT_PDA = new PublicKey("Gkt9h4QWpPBDtbaF5HvYKCc87H5WCRTUtMf77HdTGHBt");
    const TRANSFER_HOOK_PROGRAM_ID = new PublicKey("4XUZxbjx6rc7LQNgEDYYLUf6DiYz79nqytUwwgzJ8kFX");

    const name = "Fortis USX";
    const symbol = "fUSX";
    const uri = "https://teal-tough-bandicoot-90.mypinata.cloud/ipfs/bafybeicgclzck775tmsyv22o4ksszptg4o4j35ltdkiv72rcehh2r577ye";

    const extensions = [
        ExtensionType.MintCloseAuthority,
        ExtensionType.TransferHook,
        ExtensionType.MetadataPointer,
        ExtensionType.TokenMetadata,
    ];

    const mintLen = getMintLen(extensions);
    const space = mintLen + 512; // Extra space for metadata fields
    const lamports = await connection.getMinimumBalanceForRentExemption(space);

    console.log("Creating account with space:", space);

    const tx = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: admin.publicKey,
            newAccountPubkey: mint.publicKey,
            space,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMintCloseAuthorityInstruction(
            mint.publicKey,
            VAULT_PDA,
            TOKEN_2022_PROGRAM_ID
        ),
        createInitializeTransferHookInstruction(
            mint.publicKey,
            VAULT_PDA,
            TRANSFER_HOOK_PROGRAM_ID,
            TOKEN_2022_PROGRAM_ID
        ),
        createInitializeMetadataPointerInstruction(
            mint.publicKey,
            admin.publicKey,
            mint.publicKey,
            TOKEN_2022_PROGRAM_ID
        ),
        createInitializeMintInstruction(
            mint.publicKey,
            6,
            admin.publicKey,
            VAULT_PDA,
            TOKEN_2022_PROGRAM_ID
        ),
        // Definitively correct helper for Token-2022 branding
        tokenMetadataInitialize({
            programId: TOKEN_2022_PROGRAM_ID,
            metadata: mint.publicKey,
            updateAuthority: admin.publicKey,
            mint: mint.publicKey,
            mintAuthority: admin.publicKey,
            name,
            symbol,
            uri,
        })
    );

    console.log("Broadcasting transaction...");
    try {
        const sig = await sendAndConfirmTransaction(connection, tx, [admin, mint], { commitment: "confirmed" });
        console.log("SUCCESS! Branded fUSX Created!");
        console.log("Mint Address:", mint.publicKey.toBase58());
        console.log("Signature:", sig);
        console.log("Solscan/Explorer will show 'Fortis USX' and 'fUSX' perfectly.");
    } catch (err) {
        console.error("FAILED.");
        if (err.logs) console.error("Logs:", err.logs);
        else console.error(err);
    }
}

main().catch(console.error);
