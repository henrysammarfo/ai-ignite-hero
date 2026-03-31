import { supabase } from '../integrations/supabase/client'

export interface KycFormData {
  firstName: string
  lastName: string
  dateOfBirth: string
  country: string
  documentType: 'passport' | 'drivers_license' | 'national_id'
  documentNumber: string
}

export interface KycStatus {
  status: 'not_registered' | 'pending' | 'under_review' | 'approved' | 'rejected'
  applicantId?: string
  riskScore?: number
  isSanctioned?: boolean
}

export class KycService {
  private static readonly FUNCTION = 'kyc-internal'

  static async submitKyc(walletAddress: string, form: KycFormData) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION, {
      body: { action: 'submit_kyc', walletAddress, ...form }
    })
    if (error) throw error
    return data
  }

  static async runAutoReview(walletAddress: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION, {
      body: { action: 'auto_review', walletAddress }
    })
    if (error) throw error
    return data
  }

  static async getStatus(walletAddress: string): Promise<KycStatus> {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION, {
      body: { action: 'get_status', walletAddress }
    })
    if (error) throw error
    return data
  }

  static async adminApprove(walletAddress: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION, {
      body: { action: 'admin_approve', walletAddress }
    })
    if (error) throw error
    return data
  }
}
