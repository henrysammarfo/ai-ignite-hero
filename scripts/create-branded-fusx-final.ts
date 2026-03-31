import { 
    Connection, 
    Keypair, 
    SystemProgram, 
    Transaction, 
    sendAndConfirmTransaction, 
    PublicKey 
} from "@solana/web3.js";
import { 
    ExtensionType, 
    createInitializeMintInstruction, 
    createInitializeMintCloseAuthorityInstruction,
    createInitializeMetadataPointerInstruction,
    TOKEN_2022_PROGRAM_ID,
    getMintLen,
    createInitializeTransferHookInstruction
} from "@solana/spl-token";
import { 
    createInitializeInstruction, 
    pack 
} from "@solana/spl-token-metadata";
import bs58 from "bs58";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    const connection = new Connection(process.env.VITE_HELIUS_RPC_URL || "https://api.devnet.solana.com", "confirmed");
    const secretKey = bs58.decode(process.env.SOLANA_PRIVATE_KEY || "");
    const admin = Keypair.fromSecretKey(secretKey);
    console.log("Admin:", admin.publicKey.toBase58());

    const mint = Keypair.generate();
    console.log("New Branded Mint:", mint.publicKey.toBase58());

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

    // For TokenMetadata, we need to account for the variable size.
    // Base mint len for these extensions is usually around 300-400.
    // We'll calculate the metadata size manually to be safe.
    const metadataSize = 512; // More than enough for name/symbol/uri
    const mintLen = getMintLen(extensions) + metadataSize;
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

    console.log("Creating account with space:", mintLen);

    const tx = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: admin.publicKey,
            newAccountPubkey: mint.publicKey,
            space: mintLen,
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
        createInitializeInstruction({
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

    console.log("Broadcasting creation transaction...");
    try {
        const sig = await sendAndConfirmTransaction(connection, tx, [admin, mint], { commitment: "confirmed" });
        console.log("SUCCESS! Branded fUSX Created!");
        console.log("Mint Address:", mint.publicKey.toBase58());
        console.log("Signature:", sig);
        console.log("Check Solscan/Explorer now. It WILL show 'Fortis USX'.");
    } catch (err: any) {
        console.error("FAILED.");
        if (err.logs) console.error("Logs:", err.logs);
        else console.error(err);
    }
}

main().catch(console.error);
