import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MOCK_MODE = Deno.env.get('SOLSTICE_MOCK') === 'true';
const SOLSTICE_API = 'https://instructions.solstice.finance/v1/instructions';
const SOLSTICE_KEY = Deno.env.get('SOLSTICE_API_KEY');

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, walletAddress, amountUsdc, amountEusx, requestId, type, payloadData } = await req.json();

    if (action === 'proxy_solstice_instruction') {
      const res = await fetch(SOLSTICE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': SOLSTICE_KEY!
        },
        body: JSON.stringify({ type, data: payloadData })
      });
      
      if (!res.ok) {
        const errText = await res.text();
        return new Response(JSON.stringify({ error: `Solstice API Error: ${errText}` }), { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
      const result = await res.json();
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'deposit_to_yield') {
      if (MOCK_MODE) {
        console.log(`[SOLSTICE MOCK] deposit_to_yield: ${amountUsdc} USDC for ${walletAddress}`);
        const mockResult = {
          requestId: 'mock-req-' + Date.now(),
          txSignature: 'mock-request-mint-' + Date.now(),
          status: 'pending'
        };
        await supabase.from('yield_positions').upsert({
          wallet_address: walletAddress,
          usdc_deposited: amountUsdc,
          eusx_balance: amountUsdc * 0.9998,
          status: 'active',
          provider: 'solstice_eusx_mock',
          last_updated: new Date().toISOString()
        }, { onConflict: 'wallet_address' });

        return new Response(JSON.stringify(mockResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        const res = await fetch(SOLSTICE_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': SOLSTICE_KEY!
          },
          body: JSON.stringify({ type: 'RequestMint', data: { amount: amountUsdc, collateral: 'usdc', user: walletAddress } })
        });
        const result = await res.json();
        return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    if (action === 'get_position') {
      const { data } = await supabase
        .from('yield_positions')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle();
      
      const deposited = data?.usdc_deposited || 0;
      const yieldEarned = deposited * 0.0023; // simulated rate until live hookup
      
      const result = {
        eusxBalance: data?.eusx_balance || deposited,
        currentValueUsdc: deposited + yieldEarned,
        yieldEarned,
        apy: 13.96,
        provider: 'Solstice Finance YieldVault',
        mockMode: MOCK_MODE
      };
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'withdraw_from_yield') {
      if (MOCK_MODE) {
        return new Response(JSON.stringify({ success: true, mockMode: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: corsHeaders });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
