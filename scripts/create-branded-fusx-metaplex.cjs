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
    TOKEN_2022_PROGRAM_ID,
    getMintLen,
    createInitializeTransferHookInstruction
} = require("@solana/spl-token");
const { 
    createCreateMetadataAccountV3Instruction 
} = require("@metaplex-foundation/mpl-token-metadata");
const bs58 = require("bs58");
require("dotenv").config();

async function main() {
    const connection = new Connection(process.env.VITE_HELIUS_RPC_URL || "https://api.devnet.solana.com", "confirmed");
    const secretKey = bs58.decode(process.env.SOLANA_PRIVATE_KEY || "");
    const admin = Keypair.fromSecretKey(secretKey);
    console.log("Admin:", admin.publicKey.toBase58());

    const mint = Keypair.generate();
    console.log("New Branded Mint (Token-2022):", mint.publicKey.toBase58());

    const VAULT_PDA = new PublicKey("Gkt9h4QWpPBDtbaF5HvYKCc87H5WCRTUtMf77HdTGHBt");
    const TRANSFER_HOOK_PROGRAM_ID = new PublicKey("4XUZxbjx6rc7LQNgEDYYLUf6DiYz79nqytUwwgzJ8kFX");
    const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

    const [metadataPDA] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("metadata"),
            METADATA_PROGRAM_ID.toBuffer(),
            mint.publicKey.toBuffer(),
        ],
        METADATA_PROGRAM_ID
    );

    const name = "Fortis USX";
    const symbol = "fUSX";
    const uri = "https://teal-tough-bandicoot-90.mypinata.cloud/ipfs/bafybeicgclzck775tmsyv22o4ksszptg4o4j35ltdkiv72rcehh2r577ye";

    const extensions = [
        ExtensionType.MintCloseAuthority,
        ExtensionType.TransferHook,
    ];

    const mintLen = getMintLen(extensions);
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

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
        createInitializeMintInstruction(
            mint.publicKey,
            6,
            admin.publicKey,
            VAULT_PDA,
            TOKEN_2022_PROGRAM_ID
        ),
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
                        name,
                        symbol,
                        uri,
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

    console.log("Broadcasting transaction...");
    try {
        const sig = await sendAndConfirmTransaction(connection, tx, [admin, mint], { commitment: "confirmed" });
        console.log("SUCCESS! Branded fUSX Created!");
        console.log("Mint Address:", mint.publicKey.toBase58());
        console.log("Signature:", sig);
        console.log("Solscan/Explorer will show 'Fortis USX' instantly.");
    } catch (err) {
        console.error("FAILED.");
        if (err.logs) console.error("Logs:", err.logs);
        else console.error(err);
    }
}

main().catch(console.error);
