// Compliance Verification Edge Function
// =====================================
// This function handles compliance verification requests for the 4 pillars:
// - KYC (Civic Pass)
// - AML (TRM Labs)
// - Travel Rule (Notabene)
// - Source of Funds (On-Chain PDA)
//
// INTEGRATION GUIDE:
// Each step calls its respective provider SDK. Replace the TODO blocks
// with real API calls. The response shape is already defined — your
// teammates just fill in the provider logic.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VerificationRequest {
  stepId: "kyc" | "aml" | "travel" | "sof";
  walletAddress: string;
  organizationName?: string;
}

interface VerificationResult {
  status: "verified" | "failed" | "expired";
  verification: {
    hash: string | null;
    timestamp: string | null;
    expiresAt: string | null;
    riskScore: string | null;
    errorMessage: string | null;
  };
}

// ──────────────────────────────────────────────
// KYC — Civic Pass
// Docs: https://docs.civic.com
// ──────────────────────────────────────────────
async function verifyKYC(walletAddress: string): Promise<VerificationResult> {
  // TODO: Replace with real Civic Pass SDK call
  //
  // Example integration:
  // ```
  // const CIVIC_API_KEY = Deno.env.get("CIVIC_API_KEY");
  // if (!CIVIC_API_KEY) throw new Error("CIVIC_API_KEY not configured");
  //
  // const response = await fetch("https://api.civic.com/partner/pass", {
  //   method: "POST",
  //   headers: {
  //     "Authorization": `Bearer ${CIVIC_API_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     walletAddress,
  //     gatekeeperNetwork: "your-gatekeeper-network",
  //     chain: "solana",
  //   }),
  // });
  //
  // const data = await response.json();
  // return {
  //   status: data.state === "ACTIVE" ? "verified" : "failed",
  //   verification: {
  //     hash: data.passId,
  //     timestamp: new Date().toISOString(),
  //     expiresAt: data.expiry,
  //     riskScore: null,
  //     errorMessage: data.state !== "ACTIVE" ? data.reason : null,
  //   },
  // };
  // ```

  return {
    status: "verified",
    verification: {
      hash: `civic_${crypto.randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      riskScore: null,
      errorMessage: null,
    },
  };
}

// ──────────────────────────────────────────────
// AML — TRM Labs
// Docs: https://documentation.trmlabs.com
// ──────────────────────────────────────────────
async function verifyAML(walletAddress: string): Promise<VerificationResult> {
  // TODO: Replace with real TRM Labs API call
  //
  // Example integration:
  // ```
  // const TRM_API_KEY = Deno.env.get("TRM_API_KEY");
  // if (!TRM_API_KEY) throw new Error("TRM_API_KEY not configured");
  //
  // const response = await fetch("https://api.trmlabs.com/public/v2/screening/addresses", {
  //   method: "POST",
  //   headers: {
  //     "Authorization": `Basic ${btoa(TRM_API_KEY + ":")}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify([{
  //     address: walletAddress,
  //     chain: "solana",
  //   }]),
  // });
  //
  // const [result] = await response.json();
  // const riskLevel = result.entities?.[0]?.riskScoreCategory || "Low";
  // const isClear = riskLevel !== "Severe" && riskLevel !== "High";
  //
  // return {
  //   status: isClear ? "verified" : "failed",
  //   verification: {
  //     hash: result.externalId || crypto.randomUUID().slice(0, 8),
  //     timestamp: new Date().toISOString(),
  //     expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  //     riskScore: riskLevel,
  //     errorMessage: isClear ? null : `Wallet flagged: ${riskLevel} risk`,
  //   },
  // };
  // ```

  return {
    status: "verified",
    verification: {
      hash: `trm_${crypto.randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      riskScore: "Low",
      errorMessage: null,
    },
  };
}

// ──────────────────────────────────────────────
// Travel Rule — Notabene
// Docs: https://docs.notabene.id
// ──────────────────────────────────────────────
async function verifyTravelRule(walletAddress: string): Promise<VerificationResult> {
  // TODO: Replace with real Notabene API call
  //
  // Example integration:
  // ```
  // const NOTABENE_API_KEY = Deno.env.get("NOTABENE_API_KEY");
  // if (!NOTABENE_API_KEY) throw new Error("NOTABENE_API_KEY not configured");
  //
  // const response = await fetch("https://api.notabene.id/tf/transfer", {
  //   method: "POST",
  //   headers: {
  //     "Authorization": `Bearer ${NOTABENE_API_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     originator: {
  //       accountNumber: [{ accountNumber: walletAddress, accountNumberType: "MISC" }],
  //     },
  //     beneficiary: { /* beneficiary details */ },
  //     transactionBlockchainInfo: {
  //       origin: walletAddress,
  //       network: "SOL",
  //     },
  //   }),
  // });
  //
  // const data = await response.json();
  // return {
  //   status: data.status === "APPROVED" ? "verified" : "failed",
  //   verification: {
  //     hash: data.id,
  //     timestamp: new Date().toISOString(),
  //     expiresAt: null,
  //     riskScore: null,
  //     errorMessage: data.status !== "APPROVED" ? data.statusReason : null,
  //   },
  // };
  // ```

  return {
    status: "verified",
    verification: {
      hash: `ntb_${crypto.randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      expiresAt: null,
      riskScore: null,
      errorMessage: null,
    },
  };
}

// ──────────────────────────────────────────────
// Source of Funds — On-Chain PDA Hash
// Uses Solana PDA for attestation storage
// ──────────────────────────────────────────────
async function verifySourceOfFunds(walletAddress: string): Promise<VerificationResult> {
  // TODO: Replace with real Solana PDA lookup / attestation creation
  //
  // Example integration:
  // ```
  // import { Connection, PublicKey } from "@solana/web3.js";
  //
  // const connection = new Connection(
  //   Deno.env.get("SOLANA_RPC_URL") || "https://api.devnet.solana.com"
  // );
  //
  // const PROGRAM_ID = new PublicKey(Deno.env.get("FORTIS_PROGRAM_ID")!);
  // const [pdaAddress] = PublicKey.findProgramAddressSync(
  //   [Buffer.from("sof"), new PublicKey(walletAddress).toBuffer()],
  //   PROGRAM_ID
  // );
  //
  // const accountInfo = await connection.getAccountInfo(pdaAddress);
  //
  // if (accountInfo) {
  //   // Attestation exists on-chain
  //   const hash = Buffer.from(accountInfo.data).toString("hex").slice(0, 16);
  //   return {
  //     status: "verified",
  //     verification: {
  //       hash: `0x${hash}`,
  //       timestamp: new Date().toISOString(),
  //       expiresAt: null,
  //       riskScore: null,
  //       errorMessage: null,
  //     },
  //   };
  // }
  //
  // return {
  //   status: "failed",
  //   verification: {
  //     hash: null,
  //     timestamp: null,
  //     expiresAt: null,
  //     riskScore: null,
  //     errorMessage: "No source-of-funds attestation found on-chain for this wallet.",
  //   },
  // };
  // ```

  return {
    status: "verified",
    verification: {
      hash: `pda_${crypto.randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      expiresAt: null,
      riskScore: null,
      errorMessage: null,
    },
  };
}

// ──────────────────────────────────────────────
// Main handler
// ──────────────────────────────────────────────
const verifiers: Record<string, (addr: string) => Promise<VerificationResult>> = {
  kyc: verifyKYC,
  aml: verifyAML,
  travel: verifyTravelRule,
  sof: verifySourceOfFunds,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: VerificationRequest = await req.json();

    if (!body.stepId || !body.walletAddress) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: stepId, walletAddress" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const verifier = verifiers[body.stepId];
    if (!verifier) {
      return new Response(
        JSON.stringify({ error: `Unknown step: ${body.stepId}. Valid: kyc, aml, travel, sof` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[compliance] Verifying ${body.stepId} for wallet ${body.walletAddress}`);
    const result = await verifier(body.walletAddress);
    console.log(`[compliance] ${body.stepId} result: ${result.status}`);

    return new Response(
      JSON.stringify({ stepId: body.stepId, ...result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[compliance] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
