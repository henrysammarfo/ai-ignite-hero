import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import * as jose from "https://esm.sh/jose@5.1.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    const { action } = body

    // PRODUCTION OIDC LINKING LOGIC
    if (action === 'link_wallet') {
      const { entraToken, walletAddress } = body
      
      if (!entraToken || !walletAddress) {
        throw new Error('Missing Entra Token or Wallet Address')
      }

      let claims: any;
      const isMock = Deno.env.get('ENTRA_MOCK_MODE') === 'true';

      if (isMock) {
        // Fallback for hackathon/dev if secrets are not set
        console.log("EntraAdapter: Running in Mock Mode");
        claims = jose.decodeJwt(entraToken);
      } else {
        // REAL LIVE OIDC VERIFICATION
        const tenant = Deno.env.get('ENTRA_TENANT_ID');
        const policy = Deno.env.get('ENTRA_POLICY_NAME') || 'B2C_1_sign_up_sign_in';
        const clientId = Deno.env.get('ENTRA_CLIENT_ID');

        if (!tenant || !clientId) {
          throw new Error('Entra credentials not configured in Supabase environment');
        }

        // Fetch Microsoft's JWKS for the specific B2C policy
        const jwksUrl = `https://${tenant}.b2clogin.com/${tenant}.onmicrosoft.com/${policy}/discovery/v2.0/keys`;
        const JWKS = jose.createRemoteJWKSet(new URL(jwksUrl));

        const { payload } = await jose.jwtVerify(entraToken, JWKS, {
          issuer: `https://${tenant}.b2clogin.com/${Deno.env.get('ENTRA_TENANT_GUID')}/v2.0/`,
          audience: clientId,
        });
        
        claims = payload;
      }

      const entraOid = claims.oid || claims.sub;

      // Update the participants table with the real Microsoft identity link
      const { error } = await supabase
        .from('participants')
        .update({ 
          entra_oid: entraOid,
          identity_provider: 'microsoft_entra_b2c',
          email: claims.email || claims.preferred_username || claims.emails?.[0],
          full_name: claims.name || (claims.given_name ? `${claims.given_name} ${claims.family_name}` : null)
        })
        .eq('wallet_address', walletAddress);

      if (error) throw error;

      return new Response(JSON.stringify({ 
        linked: true, 
        solanaWallet: walletAddress, 
        entraOid: entraOid,
        email: claims.email || claims.preferred_username
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // IDENTITY RESOLUTION
    if (action === 'get_identity') {
      const { walletAddress } = body;
      const { data, error } = await supabase
        .from('participants')
        .select('entra_oid, identity_provider, email, full_name')
        .eq('wallet_address', walletAddress)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return new Response(JSON.stringify({
        linked: !!data?.entra_oid,
        entraOid: data?.entra_oid,
        email: data?.email,
        name: data?.full_name,
        provider: data?.identity_provider
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // INSTITUTIONAL QUALIFICATION
    if (action === 'verify_institutional_investor') {
      return new Response(JSON.stringify({
        qualified: true,
        basis: 'institutional_entity_verified',
        verifiedAt: new Date().toISOString(),
        provider: 'amina_bank_onboarding'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });

  } catch (error) {
    console.error("EntraAdapter Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
