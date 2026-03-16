import { supabase } from '../integrations/supabase/client'
import { buildIvms101, validateIvms101, hashIvms101 } from '../lib/ivms101'

export const TRAVEL_RULE_THRESHOLD = 1000

export interface TravelRuleParams {
  senderWallet: string
  senderFirstName: string
  senderLastName: string
  receiverWallet: string
  receiverFirstName: string
  receiverLastName: string
  amount: number
}

export class TravelRuleService {
  static checkRequired(amount: number): boolean {
    return amount >= TRAVEL_RULE_THRESHOLD
  }

  static async submit(params: TravelRuleParams) {
    const { data, error } = await supabase.functions.invoke('travel-rule', {
      body: { action: 'submit', ...params }
    })
    if (error) throw error
    return data as { hash: string, referenceId: string }
  }

  static async validate(payload: any) {
    const { data, error } = await supabase.functions.invoke('travel-rule', {
      body: { action: 'validate', payload }
    })
    if (error) throw error
    return data as { valid: boolean, errors: string[] }
  }
  
  // Preview hash without submitting (for UI display before confirm)
  static async previewHash(params: TravelRuleParams): Promise<string> {
    const payload = buildIvms101(params)
    return hashIvms101(payload)
  }
}
