// Trigger on-chain KYC approval after backend KYC passes.
// Invoke with POST { userWallet: string, riskScore?: number }
// Secrets required (Supabase Settings -> Secrets):
//   PROGRAM_ID               (compliance_vault program id)
//   MULTISIG_SECRET          (JSON array of multisig keypair bytes)
//   VAULT_AUTHORITY          (multisig pubkey; defaults to key from secret)
//   RPC_URL                  (optional; defaults to SUPABASE_URL RPC or main devnet)
//
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "https://esm.sh/@solana/web3.js@1.98.0";

type Req = { userWallet: string; riskScore?: number };

function sha256(data: Uint8Array): Uint8Array {
  const hash = crypto.subtle.digestSync("SHA-256", data);
  return new Uint8Array(hash);
}

function getSighash(name: string) {
  const preimage = new TextEncoder().encode(`global:${name}`);
  const hash = sha256(preimage);
  return hash.slice(0, 8);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors() });
  try {
    const body = (await req.json()) as Req;
    if (!body?.userWallet) {
      return json({ error: "userWallet required" }, 400);
    }

    const sendTx = (Deno.env.get("SEND_TX") ?? "false").toLowerCase() === "true";

    // Env
    const PROGRAM_ID = new PublicKey(
      Deno.env.get("PROGRAM_ID") ??
        "Ho3b8pA9EMwmYZQj83FakdgpMU3DiZUkVxMdMoxYCv3",
    );

    const multisigSecret = Deno.env.get("MULTISIG_SECRET");
    if (!multisigSecret) return json({ error: "MULTISIG_SECRET not set" }, 500);
    const multisig = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(multisigSecret)),
    );

    const vaultAuthority = new PublicKey(
      Deno.env.get("VAULT_AUTHORITY") ?? multisig.publicKey,
    );

    const user = new PublicKey(body.userWallet);
    const riskScore = body.riskScore ?? 5;

    // PDAs
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), vaultAuthority.toBuffer()],
      PROGRAM_ID,
    );
    const [depositorPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("depositor"), vaultPda.toBuffer(), user.toBuffer()],
      PROGRAM_ID,
    );

    // Instruction data: sighash + bool + u8 + bool + u8
    const data = new Uint8Array(8 + 1 + 1 + 1 + 1);
    data.set(getSighash("verify_user"), 0);
    data[8] = 1; // is_verified = true
    data[9] = 2; // kyc_status = 2 (approved)
    data[10] = 0; // is_sanctioned = false
    data[11] = riskScore & 0xff; // risk_score u8

    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: vaultPda, isWritable: true, isSigner: false },
        { pubkey: vaultAuthority, isWritable: true, isSigner: true },
        { pubkey: depositorPda, isWritable: true, isSigner: false },
        { pubkey: user, isWritable: false, isSigner: false },
        { pubkey: SystemProgram.programId, isWritable: false, isSigner: false },
      ],
      data,
    });

    // If SEND_TX is not explicitly enabled, return the instruction so the client can send it.
    if (!sendTx) {
      return json({
        success: true,
        mode: "dry_run",
        instruction: {
          program_id: ix.programId.toBase58(),
          accounts: ix.keys.map((k) => ({
            pubkey: k.pubkey.toBase58(),
            is_signer: k.isSigner,
            is_writable: k.isWritable,
          })),
          data: Array.from(ix.data),
        },
      }, 200);
    }

    const RPC_URL =
      Deno.env.get("RPC_URL") ??
      "https://api.devnet.solana.com"; // fallback

    const connection = new Connection(RPC_URL, "confirmed");

    const tx = new Transaction().add(ix);
    tx.feePayer = multisig.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.sign(multisig);

    const sig = await connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
    });

    // Skip confirm to stay within edge compute limits; clients can poll/confirm later.
    return json({ success: true, tx: sig, mode: "submitted" }, 200);
  } catch (err) {
    return json({ error: err?.message ?? String(err) }, 500);
  }
});

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}
function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors() },
  });
}
