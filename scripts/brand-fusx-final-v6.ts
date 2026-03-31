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
    createInitializeTransferHookInstruction,
    tokenMetadataInitialize
} from "@solana/spl-token";
import bs58 from "bs58";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    const connection = new Connection(process.env.VITE_HELIUS_RPC_URL || "https://api.devnet.solana.com", "confirmed");
    const secretKey = bs58.decode(process.env.SOLANA_PRIVATE_KEY || "");
    const admin = Keypair.fromSecretKey(secretKey);
    console.log("Admin:", admin.publicKey.toBase58());

    const mint = Keypair.generate();
    console.log("New Branded Mint (V6 Native Helper):", mint.publicKey.toBase58());

    const VAULT_PDA = new PublicKey("Gkt9h4QWpPBDtbaF5HvYKCc87H5WCRTUtMf77HdTGHBt");
    const TRANSFER_HOOK_PROGRAM_ID = new PublicKey("4XUZxbjx6rc7LQNgEDYYLUf6DiYz79nqytUwwgzJ8kFX");

    const name = "Fortis USX";
    const symbol = "fUSX";
    const uri = "https://teal-tough-bandicoot-90.mypinata.cloud/ipfs/bafybeicgclzck775tmsyv22o4ksszptg4o4j35ltdkiv72rcehh2r577ye";

    const baseExtensions = [
        ExtensionType.MintCloseAuthority,
        ExtensionType.TransferHook,
        ExtensionType.MetadataPointer,
    ];

    const baseLen = getMintLen(baseExtensions);
    const metadataExtra = 512; 
    const totalLen = baseLen + 4 + metadataExtra; 
    const lamports = await connection.getMinimumBalanceForRentExemption(totalLen);

    console.log("Creating Mint account...");
    const initTx = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: admin.publicKey,
            newAccountPubkey: mint.publicKey,
            space: totalLen,
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
        )
    );

    await sendAndConfirmTransaction(connection, initTx, [admin, mint], { commitment: "confirmed" });
    console.log("Mint Initialized. Now attaching Metadata...");

    // This executes a SECOND transaction to populate metadata
    const sig = await tokenMetadataInitialize(
        connection,
        admin,
        mint.publicKey,
        admin.publicKey,
        admin.publicKey,
        name,
        symbol,
        uri,
        [],
        { commitment: "confirmed" },
        TOKEN_2022_PROGRAM_ID
    );

    console.log("SUCCESS! Branded fUSX Created with On-Chain Metadata!");
    console.log("NEW MINT ADDRESS:", mint.publicKey.toBase58());
    console.log("Metadata Signature:", sig);
    console.log("Solscan/Explorer will show 'Fortis USX' and 'fUSX' now.");
}

main().catch(console.error);
