import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";
import * as dotenv from "dotenv";
import * as anchor from "@coral-xyz/anchor";
dotenv.config();

const connection = new Connection(process.env.VITE_HELIUS_RPC_URL || "https://api.devnet.solana.com", "confirmed");

async function main() {
    console.log("Attaching Metaplex Metadata to fUSX (Legacy SDK)...");
    const secretKey = anchor.utils.bytes.bs58.decode(process.env.SOLANA_PRIVATE_KEY || "");
    const admin = Keypair.fromSecretKey(secretKey);
    console.log("Admin:", admin.publicKey.toBase58());

    // The current mint on Solscan
    const mint = new PublicKey("M8i1LcDEJ9bKgfZE8sM13fCJMVgsjRJ4YtwiKCWEeTP");
    const METADATA_PROGRAM_ID = new PublicKey("metaqbxxGycY6q7iBRBXveUdmsJC95N7Spx4WnBySNo");

    const [metadataPDA] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("metadata"),
            METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
        ],
        METADATA_PROGRAM_ID
    );

    console.log("Metadata PDA:", metadataPDA.toBase58());

    const tx = new Transaction().add(
        createCreateMetadataAccountV3Instruction(
            {
                metadata: metadataPDA,
                mint: mint,
                mintAuthority: admin.publicKey,
                payer: admin.publicKey,
                updateAuthority: admin.publicKey,
            },
            {
                createMetadataAccountArgsV3: {
                    data: {
                        name: "Fortis USX",
                        symbol: "fUSX",
                        uri: "https://teal-tough-bandicoot-90.mypinata.cloud/ipfs/bafybeicgclzck775tmsyv22o4ksszptg4o4j35ltdkiv72rcehh2r577ye",
                        sellerFeeBasisPoints: 0,
                        creators: null,
                        collection: null,
                        uses: null,
                    },
                    isMutable: true,
                    collectionDetails: null,
                },
            }
        )
    );

    tx.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
    tx.feePayer = admin.publicKey;

    console.log("Executing transaction...");
    try {
        const sig = await sendAndConfirmTransaction(connection, tx, [admin]);
        console.log("SUCCESS! Metaplex Metadata Attached!");
        console.log("Signature:", sig);
        console.log("Check Solscan now for:", mint.toBase58());
    } catch (err: any) {
        console.error("FAILED.");
        if (err.logs) console.error("Logs:", err.logs);
        else console.error(err);
        process.exit(1);
    }
}

main().catch(console.error);
