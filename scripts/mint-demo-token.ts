import {
    Connection,
    Keypair,
    PublicKey,
    clusterApiUrl,
} from "@solana/web3.js";
import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
} from "@solana/spl-token";
import bs58 from "bs58";
import * as dotenv from "dotenv";

// Load environment variables if needed
dotenv.config();

// Default to devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// The user must provide their base58 private key here or in their env
// For demo purposes, we'll prompt the user to replace this or use env var
const PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY || "";

async function main() {
    if (!PRIVATE_KEY) {
        console.error("❌ Please set your SOLANA_PRIVATE_KEY in your .env file or export it as an environment variable.");
        console.error("You can export your Phantom wallet private key (Base58 string).");
        process.exit(1);
    }

    try {
        const payer = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
        console.log("Wallet connected:", payer.publicKey.toBase58());

        // Check balance and airdrop if needed
        const balance = await connection.getBalance(payer.publicKey);
        if (balance < 0.01 * 1e9) {
            console.log("⚠️ Low balance detected. Attempting automatic airdrop...");
            try {
                const signature = await connection.requestAirdrop(payer.publicKey, 1 * 1e9);
                await connection.confirmTransaction(signature);
                console.log("✅ Airdrop confirmed.");
            } catch (err) {
                console.log("\n❌ Devnet Faucet Error: The automatic airdrop failed (this is common when the faucet is rate-limited).");
                console.log("👉 Please manually get some SOL from: https://solfaucet.com/");
                console.log(`   Address: ${payer.publicKey.toBase58()}`);
                console.log("\nOnce you have ~0.1 SOL, run this script again.");
                return;
            }
        }

        console.log("\n🚀 Creating a new Demo USDC Mint on Devnet...");
        // 6 decimals is standard for USDC
        const mint = await createMint(
            connection,
            payer, // payer
            payer.publicKey, // mintAuthority
            payer.publicKey, // freezeAuthority
            6 // decimals
        );

        console.log("✅ Mint created! Address:", mint.toBase58());

        console.log("\n💳 Creating associated token account for your wallet...");
        const tokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            mint,
            payer.publicKey
        );

        console.log("✅ Token account created:", tokenAccount.address.toBase58());

        // Mint 100,000 Demo USDC
        const amountToMint = 100_000 * Math.pow(10, 6);
        console.log(`\n💰 Minting 100,000 Demo USDC to your wallet...`);

        await mintTo(
            connection,
            payer,
            mint,
            tokenAccount.address,
            payer.publicKey,
            amountToMint
        );

        console.log("\n🎉 Success! You now have 100,000 Demo USDC.");
        console.log("--------------------------------------------------");
        console.log("Save this Token Mint Address to use in your app tests:");
        console.log(mint.toBase58());
        console.log("--------------------------------------------------");

    } catch (error) {
        console.error("\n❌ Error:", error);
    }
}

main();
