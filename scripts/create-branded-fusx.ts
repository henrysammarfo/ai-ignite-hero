import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, Transaction, SystemProgram } from "@solana/web3.js";
import { 
    createInitializeMintInstruction, 
    createInitializeTransferHookInstruction, 
    createInitializeMintCloseAuthorityInstruction, 
    TOKEN_2022_PROGRAM_ID, 
    setAuthority, 
    AuthorityType,
    createInitializeMetadataPointerInstruction
} from "@solana/spl-token";
import { createInitializeInstruction as createInitMetadata, pack as packMetadata, TokenMetadata } from "@solana/spl-token-metadata";
import * as dotenv from "dotenv";
import * as anchor from "@coral-xyz/anchor";
dotenv.config();

const connection = new Connection(process.env.VITE_HELIUS_RPC_URL || "https://api.devnet.solana.com", "confirmed");

async function main() {
    console.log("Starting Branded fUSX Deployment (Final Attempt - Token-2022 Metadata)...");
    const secretKey = anchor.utils.bytes.bs58.decode(process.env.SOLANA_PRIVATE_KEY || "");
    const admin = Keypair.fromSecretKey(secretKey);
    const PROGRAM_ID = new PublicKey("4XUZxbjx6rc7LQNgEDYYLUf6DiYz79nqytUwwgzJ8kFX");
    const HOOK_PROGRAM_ID = new PublicKey("Cpy2AHinth8dZqUciDAem2DWi45GsoY6VrT4ARTgMBSb");
    const [vaultPDA] = PublicKey.findProgramAddressSync([Buffer.from("vault"), admin.publicKey.toBuffer()], PROGRAM_ID);
    
    const mint = Keypair.generate();
    console.log("NEW BRANDED MINT ADDRESS:", mint.publicKey.toBase58());

    const metadata: TokenMetadata = {
        updateAuthority: admin.publicKey,
        mint: mint.publicKey,
        name: "Fortis USX",
        symbol: "fUSX",
        uri: "https://teal-tough-bandicoot-90.mypinata.cloud/ipfs/bafybeicgclzck775tmsyv22o4ksszptg4o4j35ltdkiv72rcehh2r577ye",
        additionalMetadata: [],
    };

    // 4 Extensions: CloseAuth, TransferHook, MetadataPointer, TokenMetadata
    // Size = 166 (base) + 16 (headers) + 32 (close) + 64 (hook) + 64 (pointer) = 342
    const mintLen = 342;
    const metadataLen = packMetadata(metadata).length;
    const totalLen = mintLen + metadataLen;
    const lamports = await connection.getMinimumBalanceForRentExemption(totalLen);

    console.log(`Total Length: ${totalLen}`);

    const tx = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: admin.publicKey,
            newAccountPubkey: mint.publicKey,
            space: totalLen,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMintCloseAuthorityInstruction(mint.publicKey, admin.publicKey, TOKEN_2022_PROGRAM_ID),
        createInitializeTransferHookInstruction(mint.publicKey, vaultPDA, HOOK_PROGRAM_ID, TOKEN_2022_PROGRAM_ID),
        // Point the metadata to the MINT ITSELF for the extension
        createInitializeMetadataPointerInstruction(mint.publicKey, admin.publicKey, mint.publicKey, TOKEN_2022_PROGRAM_ID),
        
        // CRITICAL: Initialize the Metadata Extension *BEFORE* InitializeMint
        createInitMetadata({
            programId: TOKEN_2022_PROGRAM_ID,
            metadata: mint.publicKey,
            updateAuthority: admin.publicKey,
            mint: mint.publicKey,
            mintAuthority: admin.publicKey,
            name: metadata.name,
            symbol: metadata.symbol,
            uri: metadata.uri,
        }),

        // FINALLY Initialize the Mint
        createInitializeMintInstruction(mint.publicKey, 6, admin.publicKey, admin.publicKey, TOKEN_2022_PROGRAM_ID)
    );

    tx.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
    tx.feePayer = admin.publicKey;
    
    console.log("Executing transaction...");
    try {
        const sig = await sendAndConfirmTransaction(connection, tx, [admin, mint]);
        console.log("SUCCESS! Mint Generated & Branded! Signature:", sig);

        console.log("Transferring Authorities to Vault PDA...");
        await setAuthority(connection, admin, mint.publicKey, admin, AuthorityType.MintTokens, vaultPDA, undefined, undefined, TOKEN_2022_PROGRAM_ID);
        await setAuthority(connection, admin, mint.publicKey, admin, AuthorityType.FreezeAccount, vaultPDA, undefined, undefined, TOKEN_2022_PROGRAM_ID);
        await setAuthority(connection, admin, mint.publicKey, admin, AuthorityType.CloseAccount, vaultPDA, undefined, undefined, TOKEN_2022_PROGRAM_ID);

        console.log("=========================================");
        console.log("NEW BRANDED MINT:", mint.publicKey.toBase58());
        console.log("=========================================");
    } catch (err: any) {
        console.error("FAILED.");
        if (err.logs) console.error("Logs:", err.logs);
        else console.error(err);
        process.exit(1);
    }
}

main().catch(console.error);
