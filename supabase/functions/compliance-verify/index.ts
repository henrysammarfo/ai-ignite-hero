// Compliance Verification Edge Function
// =====================================
// This function handles compliance verification requests for the 4 pillars
// by orchestrating calls to specific sub-functions and the database.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SB_SERVICE_ROLE_KEY")!
);

interface VerificationRequest {
  stepId: "kyc" | "aml" | "travel" | "sof";
  walletAddress: string;
}

interface VerificationResult {
  status: "verified" | "failed" | "pending" | "under_review" | "expired";
  verification: {
    hash: string | null;
    timestamp: string | null;
    expiresAt: string | null;
    riskScore: string | null;
    errorMessage: string | null;
  };
}



/**
 * KYC — Connected to kyc-internal sub-service
 */
async function verifyKYC(walletAddress: string): Promise<VerificationResult> {
  const { data, error } = await supabase.functions.invoke('kyc-internal', {
    body: { action: 'get_status', walletAddress }
  });

  if (error || !data) {
    return {
      status: "failed",
      verification: {
        hash: null, timestamp: null, expiresAt: null, riskScore: null,
        errorMessage: "Failed to connect to KYC service"
      }
    };
  }

  // Map kyc-internal status to orchestrator status
  let status: VerificationResult["status"] = "pending";
  if (data.status === "approved") status = "verified";
  else if (data.status === "under_review") status = "under_review";
  else if (data.status === "rejected") status = "failed";

  return {
    status,
    verification: {
      hash: data.applicantId || null,
      timestamp: data.approvedAt || null,
      expiresAt: null,
      riskScore: data.riskScore?.toString() || null,
      errorMessage: data.status === "rejected" ? "KYC Rejected" : null
    }
  };
}

/**
 * AML — Connected to ofac-screening sub-service
 */
async function verifyAML(walletAddress: string): Promise<VerificationResult> {
  const { data, error } = await supabase.functions.invoke('ofac-screening', {
    body: { action: 'screen_address', walletAddress }
  });

  if (error || !data) {
    return {
      status: "failed",
      verification: {
        hash: null, timestamp: null, expiresAt: null, riskScore: null,
        errorMessage: "Failed to connect to AML service"
      }
    };
  }

  return {
    status: data.blocked ? "failed" : "verified",
    verification: {
      hash: `ofac_${crypto.randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      expiresAt: null,
      riskScore: data.riskScore.toString(),
      errorMessage: data.blocked ? data.reason : null
    }
  };
}

/**
 * Travel Rule — Check database for existing submissions
 */
async function verifyTravelRule(walletAddress: string): Promise<VerificationResult> {
  // We check if this wallet has ever submitted a travel rule payload
  const { data, error } = await supabase
    .from('travel_rule_submissions')
    .select('*')
    .eq('sender_wallet', walletAddress)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return {
      status: "pending",
      verification: {
        hash: null, timestamp: null, expiresAt: null, riskScore: null,
        errorMessage: "No Travel Rule submission found for this wallet"
      }
    };
  }

  return {
    status: "verified",
    verification: {
      hash: data.payload_hash,
      timestamp: data.created_at,
      expiresAt: null,
      riskScore: null,
      errorMessage: null
    }
  };
}

/**
 * Source of Funds — Real Solana RPC check (placeholder until program is deployed)
 */
async function verifySourceOfFunds(walletAddress: string): Promise<VerificationResult> {
  // In production, we'd check for a PDA on-chain. 
  // For now, we check the audit logs for a 'sof_verified' action
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('wallet_address', walletAddress)
    .eq('action', 'sof_verified')
    .single();

  if (error || !data) {
    return {
      status: "pending",
      verification: {
        hash: null, timestamp: null, expiresAt: null, riskScore: null,
        errorMessage: "Source of Funds attestation not found"
      }
    };
  }

  return {
    status: "verified",
    verification: {
      hash: data.tx_signature || "legacy_pda_attestation",
      timestamp: data.timestamp,
      expiresAt: null,
      riskScore: null,
      errorMessage: null
    }
  };
}

const verifiers: Record<string, (addr: string) => Promise<VerificationResult>> = {
  kyc: verifyKYC,
  aml: verifyAML,
  travel: verifyTravelRule,
  sof: verifySourceOfFunds,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });

    const body: VerificationRequest = await req.json();
    if (!body.stepId || !body.walletAddress) return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders });

    const verifier = verifiers[body.stepId];
    if (!verifier) return new Response(JSON.stringify({ error: "Unknown step" }), { status: 400, headers: corsHeaders });

    const result = await verifier(body.walletAddress);
    return new Response(JSON.stringify({ stepId: body.stepId, ...result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
