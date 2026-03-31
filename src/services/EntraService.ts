import { supabase } from '../integrations/supabase/client'

export interface EntraIdentity {
  linked: boolean
  entraOid?: string
  name?: string
  email?: string
  provider?: string
}

export class EntraService {
  /**
   * Real Entra B2C Login - Triggers the Supabase OAuth flow for Microsoft.
   * This requires Azure AD / Entra B2C to be configured in the Supabase Dashboard.
   */
  static async login() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'openid email profile',
        redirectTo: window.location.origin + '/dashboard/onboarding'
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Link Wallet - Links a validated Entra OIDC token to a Solana wallet address.
   */
  static async linkWallet(entraToken: string, walletAddress: string) {
    const { data, error } = await supabase.functions.invoke('entra-adapter', {
      body: { 
        action: 'link_wallet',
        entraToken,
        walletAddress
      }
    })

    if (error) throw error
    return data
  }

  /**
   * Get Linked Identity - Retrieves the Microsoft identity associated with a wallet.
   */
  static async getLinkedIdentity(walletAddress: string): Promise<EntraIdentity> {
    const { data, error } = await supabase.functions.invoke('entra-adapter', {
      body: { 
        action: 'get_identity',
        walletAddress
      }
    })

    if (error) throw error
    return data
  }

  /**
   * Verify Institutional Investor - Mock check for sophisticated investor status.
   */
  static async verifyInstitutionalInvestor(walletAddress: string) {
    const { data, error } = await supabase.functions.invoke('entra-adapter', {
      body: { 
        action: 'verify_institutional_investor',
        walletAddress
      }
    })

    if (error) throw error
    return data
  }
}
