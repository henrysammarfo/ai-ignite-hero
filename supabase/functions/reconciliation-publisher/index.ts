import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Fetch live metrics from RPC or DB
    // For this Proof of Reserves demonstration, we read vault total supply
    // Real-world implementation calls the blockchain program directly:
    // const program = new anchor.Program(idl, PROGRAM_ID, provider);
    // await program.methods.publishReconciliation(eusxBalance)...
    
    // In Edge Function simulation before whitelist completes:
    const usdc_balance_mock = 500000;
    const eusx_balance_mock = 250000;
    const fusx_total_supply_mock = 700000;
    
    const backing_ratio = fusx_total_supply_mock > 0 
      ? ((usdc_balance_mock + eusx_balance_mock) * 100 / fusx_total_supply_mock) 
      : 100;

    // Insert the snapshot into the database
    const { data, error } = await supabase
      .from('reconciliation_log')
      .insert({
        usdc_balance: usdc_balance_mock,
        eusx_balance: eusx_balance_mock,
        fusx_total_supply: fusx_total_supply_mock,
        backing_ratio: backing_ratio,
        publisher: 'AMINA_ORACLE_EDGE_FUNCTION',
        tx_signature: 'simulated_tx_signature_' + Date.now(), // Simulated on-chain interaction
        slot: Math.floor(Date.now() / 400) // pseudo slot estimate
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      published_data: data
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
