import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import fs from "fs";

// Usage:
// USER_PUBKEY=<user> MULTISIG_SECRET='[1,2,...]' ANCHOR_PROVIDER_URL=https://api.devnet.solana.com \
//   npm run verify:user
//
// Optional overrides:
// PROGRAM_ID=<compliance_vault_program_id>
// VAULT_AUTHORITY=<multisig_pubkey>  (defaults to multisig key from secret)

const user = process.env.USER_PUBKEY;
if (!user) throw new Error("Set USER_PUBKEY to the user's wallet address");

const multisigSecret = process.env.MULTISIG_SECRET;
if (!multisigSecret) throw new Error("Set MULTISIG_SECRET to the multisig keypair array JSON");

const PROGRAM_ID = new PublicKey(
  process.env.PROGRAM_ID || "Ho3b8pA9EMwmYZQj83FakdgpMU3DiZUkVxMdMoxYCv3"
);

const riskScore = Number(process.env.RISK_SCORE || 5);

const MULTISIG = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(multisigSecret)));
const vaultAuthority = new PublicKey(process.env.VAULT_AUTHORITY || MULTISIG.publicKey);

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

// load IDL from local build
const idl = JSON.parse(fs.readFileSync("target/idl/compliance_vault.json", "utf8"));
const program = new anchor.Program(idl, PROGRAM_ID, provider);

const userPk = new PublicKey(user);

const [vaultPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("vault"), vaultAuthority.toBuffer()],
  PROGRAM_ID
);

const [depositorPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("depositor"), vaultPda.toBuffer(), userPk.toBuffer()],
  PROGRAM_ID
);

const main = async () => {
  console.log("Verifying user on-chain...");
  console.log("Program:", PROGRAM_ID.toBase58());
  console.log("Vault authority (multisig):", vaultAuthority.toBase58());
  console.log("User:", userPk.toBase58());
  const tx = await program.methods
    .verifyUser(true, 2, false, riskScore) // approved, status=2, not sanctioned
    .accounts({
      vaultState: vaultPda,
      authority: vaultAuthority,
      userAccount: depositorPda,
      user: userPk,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([MULTISIG])
    .rpc();
  console.log("verify_user tx:", tx);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
