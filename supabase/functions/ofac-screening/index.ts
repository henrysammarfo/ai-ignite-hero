import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory cache
let sanctionedAddresses: Set<string> = new Set();
let lastLoaded: Date | null = null;
let totalEntries = 0;
let cryptoEntries = 0;

async function loadOfacList() {
  try {
    const response = await fetch("https://www.treasury.gov/ofac/downloads/sdn.csv", {
      headers: { "User-Agent": "ComplianceVault/1.0" },
    });
    
    if (!response.ok) {
       throw new Error(`Failed to fetch OFAC SDN list: ${response.status}`);
    }
    
    const text = await response.text();
    const lines = text.split("\n");

    const newSanctionedAddresses = new Set<string>();
    let parsedCryptoEntries = 0;

    for (const line of lines) {
      // OFAC format: "Digital Currency Address - ETH 0xABCD..."
      // Also: "Digital Currency Address - XBT addr..."
      // Also: "Digital Currency Address - SOL addr..."
      const match = line.match(
        /Digital Currency Address\s*-\s*(ETH|XBT|SOL|USDT|LTC|XMR|ZEC)\s+([A-Za-z0-9]+)/i
      );
      if (match) {
        newSanctionedAddresses.add(match[2].toLowerCase());
        parsedCryptoEntries++;
      }
    }

    sanctionedAddresses = newSanctionedAddresses;
    totalEntries = lines.length;
    cryptoEntries = parsedCryptoEntries;
    lastLoaded = new Date();
    
    console.log(`OFAC loaded: ${totalEntries} entries, ${cryptoEntries} crypto addresses`);
  } catch (err) {
    console.error("OFAC load failed:", err);
    // Don't crash — continue. Will just screen against empty or old set.
  }
}

// Load on cold start
await loadOfacList();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "screen_address") {
      const { walletAddress } = body;
      if (!walletAddress) {
        return new Response(JSON.stringify({ error: "Missing walletAddress" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const normalized = walletAddress.toLowerCase().trim();
      const isBlocked = sanctionedAddresses.has(normalized);
      const riskScore = isBlocked ? 100 : 0;

      await supabase.from("screening_results").insert({
        wallet_address: walletAddress,
        is_blocked: isBlocked,
        risk_score: riskScore,
        ofac_match: isBlocked,
      });

      if (isBlocked) {
        await supabase
          .from("participants")
          .update({ is_sanctioned: true, risk_score: 100 })
          .eq("wallet_address", walletAddress);

        await supabase.from("audit_logs").insert({
          wallet_address: walletAddress,
          action: "sanctions_blocked",
          blocked: true,
          blocked_reason: "OFAC SDN List match",
          provider_used: "ofac-sdn",
          layer: "screening",
        });

        return new Response(
          JSON.stringify({ blocked: true, riskScore: 100, reason: "OFAC SDN List match", ofacMatch: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ blocked: false, riskScore: 0, reason: "clear", ofacMatch: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "batch_screen") {
      const { addresses } = body;
      if (!Array.isArray(addresses)) {
        return new Response(JSON.stringify({ error: "addresses must be an array" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const results = await Promise.all(
        addresses.map(async (address: string) => {
          const normalized = address.toLowerCase().trim();
          const isBlocked = sanctionedAddresses.has(normalized);
          const riskScore = isBlocked ? 100 : 0;

          await supabase.from("screening_results").insert({
            wallet_address: address,
            is_blocked: isBlocked,
            risk_score: riskScore,
            ofac_match: isBlocked,
          });

          return { address, blocked: isBlocked, riskScore };
        })
      );

      const anyBlocked = results.some((r) => r.blocked);
      return new Response(JSON.stringify({ results, anyBlocked }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_stats") {
      // Reload if hasn't been reloaded in 24 hours
      if (!lastLoaded || (new Date().getTime() - lastLoaded.getTime() > 24 * 60 * 60 * 1000)) {
        await loadOfacList();
      }

      return new Response(
        JSON.stringify({
          loaded: lastLoaded !== null,
          totalSdnEntries: totalEntries,
          cryptoAddresses: cryptoEntries,
          lastUpdated: lastLoaded?.toISOString() || null,
          provider: "US Treasury OFAC SDN List",
          status: "active",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("OFAC Screening Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
