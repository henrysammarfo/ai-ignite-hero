// Run on-chain KYC verify_user using the admin key locally (no edge dependency).
// Usage: node -r dotenv/config scripts/run-kyc-onchain.js <userWallet> [riskScore]
import bs58 from "bs58";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { createHash } from "crypto";

const USER_WALLET = process.argv[2];
const RISK = Number(process.argv[3] ?? 5);

if (!USER_WALLET) {
  console.error("Usage: node -r dotenv/config scripts/run-kyc-onchain.js <userWallet> [riskScore]");
  process.exit(1);
}

const PROGRAM_ID = new PublicKey(process.env.PROGRAM_ID || "Ho3b8pA9EMwmYZQj83FakdgpMU3DiZUkVxMdMoxYCv3");
const RPC_URL =
  process.env.RPC_URL ||
  process.env.VITE_HELIUS_RPC_URL ||
  "https://api.devnet.solana.com";

if (!process.env.SOLANA_PRIVATE_KEY) {
  console.error("SOLANA_PRIVATE_KEY env is required (base58).");
  process.exit(1);
}

const admin = Keypair.fromSecretKey(bs58.decode(process.env.SOLANA_PRIVATE_KEY));

function sighash(name) {
  const preimage = `global:${name}`;
  const hash = createHash("sha256").update(preimage).digest();
  return hash.subarray(0, 8);
}

function buildVerifyIx(userWallet, riskScore) {
  const authority = admin.publicKey;
  const user = new PublicKey(userWallet);

  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), authority.toBuffer()],
    PROGRAM_ID
  );
  const [depositorPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("depositor"), vaultPda.toBuffer(), user.toBuffer()],
    PROGRAM_ID
  );

  const data = Buffer.alloc(8 + 4);
  sighash("verify_user").copy(data, 0);
  data[8] = 1;               // is_verified = true
  data[9] = 2;               // kyc_status = approved
  data[10] = 0;              // is_sanctioned = false
  data[11] = riskScore & 0xff; // risk_score u8

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: depositorPda, isSigner: false, isWritable: true },
      { pubkey: user, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

async function main() {
  const ix = buildVerifyIx(USER_WALLET, RISK);
  const connection = new Connection(RPC_URL, "confirmed");
  const tx = new Transaction().add(ix);
  tx.feePayer = admin.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.sign(admin);

  const sig = await connection.sendRawTransaction(tx.serialize(), { skipPreflight: false });
  console.log("Submitted verify_user tx:", sig);
  const conf = await connection.confirmTransaction(sig, "confirmed");
  console.log("Confirmation status:", conf?.value?.err ? "error" : "confirmed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
