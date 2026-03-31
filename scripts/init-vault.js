// Initialize the ComplianceVault PDA for the admin authority.
// Usage: node -r dotenv/config scripts/init-vault.js
import bs58 from "bs58";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { createHash } from "crypto";

const RPC_URL =
  process.env.RPC_URL ||
  process.env.VITE_HELIUS_RPC_URL ||
  "https://api.devnet.solana.com";

if (!process.env.SOLANA_PRIVATE_KEY) {
  console.error("SOLANA_PRIVATE_KEY is required (base58).");
  process.exit(1);
}

const admin = Keypair.fromSecretKey(bs58.decode(process.env.SOLANA_PRIVATE_KEY));
const connection = new Connection(RPC_URL, "confirmed");
const programId = new PublicKey(
  process.env.PROGRAM_ID || "Ho3b8pA9EMwmYZQj83FakdgpMU3DiZUkVxMdMoxYCv3"
);

function sighash(name) {
  const preimage = `global:${name}`;
  const hash = createHash("sha256").update(preimage).digest();
  return hash.subarray(0, 8);
}

async function main() {
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), admin.publicKey.toBuffer()],
    programId
  );

  const ix = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: admin.publicKey, isSigner: true, isWritable: true }, // payer/admin
      { pubkey: admin.publicKey, isSigner: false, isWritable: false }, // multisig_authority
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: sighash("initialize_vault"), // no args
  });

  console.log("Initializing vault...");
  console.log("Program:", programId.toBase58());
  console.log("Admin/Authority:", admin.publicKey.toBase58());
  console.log("Vault PDA:", vaultPda.toBase58());

  const tx = new Transaction().add(ix);
  tx.feePayer = admin.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.sign(admin);

  const sig = await connection.sendRawTransaction(tx.serialize(), { skipPreflight: false });
  console.log("Initialization tx:", sig);
  // Poll status without websocket (some RPCs disable signatureSubscribe)
  let status = null;
  for (let i = 0; i < 12; i++) {
    const resp = await connection.getSignatureStatuses([sig]);
    status = resp && resp.value && resp.value[0];
    if (status && status.confirmations !== null) break;
    await new Promise((r) => setTimeout(r, 2500));
  }
  console.log("Confirmation status:", status?.confirmationStatus || "unknown");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
