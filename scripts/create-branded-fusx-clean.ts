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
    TokenMetadata
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
    console.log("New Mint:", mint.publicKey.toBase58());

    const VAULT_PDA = new PublicKey("Gkt9h4QWpPBDtbaF5HvYKCc87H5WCRTUtMf77HdTGHBt");
    const TRANSFER_HOOK_PROGRAM_ID = new PublicKey("4XUZxbjx6rc7LQNgEDYYLUf6DiYz79nqytUwwgzJ8kFX");

    const metaData: TokenMetadata = {
        updateAuthority: admin.publicKey,
        mint: mint.publicKey,
        name: "Fortis USX",
        symbol: "fUSX",
        uri: "https://teal-tough-bandicoot-90.mypinata.cloud/ipfs/bafybeicgclzck775tmsyv22o4ksszptg4o4j35ltdkiv72rcehh2r577ye",
        additionalMetadata: [],
    };

    // Calculate space: Mint (165) + Extensions headers + metadata content
    // We'll just use a safe buffer of 1024 bytes.
    const space = 1024;
    const lamports = await connection.getMinimumBalanceForRentExemption(space);

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
        createInitializeInstruction({
            programId: TOKEN_2022_PROGRAM_ID,
            metadata: mint.publicKey,
            updateAuthority: admin.publicKey,
            mint: mint.publicKey,
            mintAuthority: admin.publicKey,
            name: metaData.name,
            symbol: metaData.symbol,
            uri: metaData.uri,
        })
    );

    console.log("Broadcasting creation transaction...");
    const sig = await sendAndConfirmTransaction(connection, tx, [admin, mint], { commitment: "confirmed" });
    console.log("SUCCESS! Mint Created with On-Chain Metadata.");
    console.log("Signature:", sig);
    console.log("New Mint Address:", mint.publicKey.toBase58());
    
    // Transfer Mint Authority to Vault PDA at the end
    // (Optional, or done in the same tx if using SetAuthority)
}

main().catch(console.error);
