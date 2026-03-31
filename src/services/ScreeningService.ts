import { supabase } from '../integrations/supabase/client'

export interface ScreeningResult {
  blocked: boolean
  riskScore: number
  reason: string
  ofacMatch: boolean
}

export class ScreeningService {
  private static readonly FUNCTION = 'ofac-screening'
  private static get headers() {
    const key =
      (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
      (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
    return key
      ? {
          apikey: key,
          Authorization: `Bearer ${key}`,
        }
      : {};
  }

  static async screenWallet(walletAddress: string): Promise<ScreeningResult> {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION, {
      headers: this.headers,
      body: { action: 'screen_address', walletAddress }
    })
    if (error) throw error
    return data
  }

  // Throws if blocked — use this before any deposit/transfer
  static async requireClear(walletAddress: string): Promise<ScreeningResult> {
    const result = await this.screenWallet(walletAddress)
    if (result.blocked) {
      throw new Error(`Transaction blocked: ${result.reason}`)
    }
    return result
  }

  static async batchScreen(addresses: string[]) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION, {
      headers: this.headers,
      body: { action: 'batch_screen', addresses }
    })
    if (error) throw error
    return data
  }

  static async getStats() {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION, {
      headers: this.headers,
      body: { action: 'get_stats' }
    })
    if (error) throw error
    return data
  }
}
