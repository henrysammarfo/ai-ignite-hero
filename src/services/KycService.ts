import { supabase } from '../integrations/supabase/client'

export interface KycFormData {
  firstName: string
  lastName: string
  dateOfBirth: string
  country: string
  documentType: 'passport' | 'drivers_license' | 'national_id'
  documentNumber: string
  documentUrl?: string
}

export interface KycStatus {
  status: 'not_registered' | 'pending' | 'under_review' | 'approved' | 'rejected'
  applicantId?: string
  riskScore?: number
  isSanctioned?: boolean
}

export class KycService {
  private static readonly FUNCTION = 'kyc-internal'
  private static readonly BUCKET = 'kyc-docs'
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

  static async uploadDocument(walletAddress: string, file: File) {
    const ext = file.name.split('.').pop() || 'pdf'
    const path = `${walletAddress}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(this.BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'application/octet-stream',
    })
    if (error) throw error
    const { data } = supabase.storage.from(this.BUCKET).getPublicUrl(path)
    return { path, publicUrl: data.publicUrl }
  }

  static async submitKyc(walletAddress: string, form: KycFormData) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION, {
      headers: this.headers,
      body: { action: 'submit_kyc', walletAddress, ...form }
    })
    if (error) throw error
    return data
  }

  static async runAutoReview(walletAddress: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION, {
      headers: this.headers,
      body: { action: 'auto_review', walletAddress }
    })
    if (error) throw error
    return data
  }

  static async syncOnchain(walletAddress: string, riskScore?: number) {
    const { data, error } = await supabase.functions.invoke('kyc-onchain', {
      headers: this.headers,
      body: { userWallet: walletAddress, riskScore }
    });
    if (error) throw error;
    return data;
  }

  static async getStatus(walletAddress: string): Promise<KycStatus> {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION, {
      headers: this.headers,
      body: { action: 'get_status', walletAddress }
    })
    if (error) throw error
    return data
  }

  static async adminApprove(walletAddress: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION, {
      headers: this.headers,
      body: { action: 'admin_approve', walletAddress }
    })
    if (error) throw error
    return data
  }
}
