const { Connection, Keypair, PublicKey, sendAndConfirmTransaction, Transaction, SystemProgram } = require("@solana/web3.js");
const { createMint, MINT_SIZE, TOKEN_PROGRAM_ID, createInitializeMintInstruction } = require("@solana/spl-token");
const { createCreateMetadataAccountV3Instruction } = require("@metaplex-foundation/mpl-token-metadata");
const bs58 = require("bs58");
require("dotenv").config();

async function main() {
    console.log("Creating Branded Standard SPL Token...");
    const connection = new Connection(process.env.VITE_HELIUS_RPC_URL || "https://api.devnet.solana.com", "confirmed");
    const secretKey = bs58.decode(process.env.SOLANA_PRIVATE_KEY || "");
    const admin = Keypair.fromSecretKey(secretKey);
    console.log("Admin:", admin.publicKey.toBase58());

    const mint = Keypair.generate();
    console.log("New Mint:", mint.publicKey.toBase58());

    const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

    const [metadataPDA] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("metadata"),
            METADATA_PROGRAM_ID.toBuffer(),
            mint.publicKey.toBuffer(),
        ],
        METADATA_PROGRAM_ID
    );

    const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

    const tx = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: admin.publicKey,
            newAccountPubkey: mint.publicKey,
            space: MINT_SIZE,
            lamports,
            programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(mint.publicKey, 6, admin.publicKey, admin.publicKey, TOKEN_PROGRAM_ID),
        createCreateMetadataAccountV3Instruction(
            {
                metadata: metadataPDA,
                mint: mint.publicKey,
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

    console.log("Executing transaction...");
    try {
        const sig = await sendAndConfirmTransaction(connection, tx, [admin, mint], { commitment: "confirmed" });
        console.log("SUCCESS! Branded SPL Token Created!");
        console.log("MINT_ADDRESS:", mint.publicKey.toBase58());
        console.log("Signature:", sig);
    } catch (err) {
        console.error("FAILED.");
        if (err.logs) console.error("Logs:", err.logs);
        else console.error(err);
    }
}

main().catch(console.error);
