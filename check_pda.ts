import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as dotenv from "dotenv";
dotenv.config();

const rpcUrl = process.env.VITE_HELIUS_RPC_URL || "https://api.devnet.solana.com";
const connection = new Connection(rpcUrl, "confirmed");
const secretKey = anchor.utils.bytes.bs58.decode(process.env.SOLANA_PRIVATE_KEY || "");
const wallet = new Wallet(Keypair.fromSecretKey(secretKey));
const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
anchor.setProvider(provider);

import idl from "./target/idl/compliance_vault.json";

async function check() {
    const programId = new PublicKey("ENuZVnZoFVWVtsdQesJ5BU8phX5yCZ7GEFRmRELd3dRK");
    const program = new Program(idl as any, provider);

    const [vaultPDA] = PublicKey.findProgramAddressSync([Buffer.from("vault"), wallet.publicKey.toBuffer()], programId);
    const [depositorPDA] = PublicKey.findProgramAddressSync([Buffer.from("depositor"), vaultPDA.toBuffer(), wallet.publicKey.toBuffer()], programId);

    console.log("Checking Depositor PDA:", depositorPDA.toBase58());
    try {
        const acc = await (program.account as any).depositorAccount.fetch(depositorPDA);
        console.log("KYC Verified:", acc.kycVerified);
    } catch (e) {
        console.log("Account not found or error:", e.message);
    }
}
check();
