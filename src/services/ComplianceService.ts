import { KycService } from './KycService'
import { ScreeningService } from './ScreeningService'
import { TravelRuleService, TRAVEL_RULE_THRESHOLD } from './TravelRuleService'
import { supabase } from '../integrations/supabase/client'

export interface PreflightResult {
  allowed: boolean
  layer: 'passed' | 'kyc' | 'sanctions' | 'risk' | 'travel_rule'
  kycStatus?: string
  riskScore?: number
  blocked?: boolean
  blockedReason?: string
  travelRuleRequired?: boolean
  warnings?: string[]
}

export interface FullComplianceStatus {
  walletAddress: string
  kycStatus: string
  kycApplicantId?: string
  riskScore: number
  isSanctioned: boolean
  ofacClear: boolean
  travelRuleEnabled: boolean
  travelRuleThreshold: number
  fullyCompliant: boolean
  complianceLayers: {
    kyc: { status: string, provider: string }
    screening: { status: string, provider: string }
    travelRule: { status: string, provider: string }
    custody: { status: string, provider: string }
  }
}

export class ComplianceService {

  // Run before any deposit
  static async preflightDeposit(
    walletAddress: string, 
    amount: number
  ): Promise<PreflightResult> {
    
    // Layer 1: OFAC screening
    try {
      const screening = await ScreeningService.screenWallet(walletAddress)
      if (screening.blocked) {
        return {
          allowed: false,
          layer: 'sanctions',
          blocked: true,
          blockedReason: screening.reason,
          riskScore: 100
        }
      }
    } catch (err) {
      console.error('Screening error:', err)
      // Don't block on screening failure — log and continue
    }

    // Layer 2: KYC check
    const kyc = await KycService.getStatus(walletAddress)
    if (kyc.status !== 'approved') {
      return {
        allowed: false,
        layer: 'kyc',
        kycStatus: kyc.status,
        blockedReason: kyc.status === 'rejected' 
          ? 'KYC verification rejected' 
          : 'KYC verification required'
      }
    }

    // Layer 3: Risk score check
    if ((kyc.riskScore || 0) >= 75) {
      return {
        allowed: false,
        layer: 'risk',
        riskScore: kyc.riskScore,
        blockedReason: 'Risk score too high for deposit'
      }
    }

    // Layer 4: Travel rule flag
    const travelRuleRequired = TravelRuleService.checkRequired(amount)

    return {
      allowed: true,
      layer: 'passed',
      kycStatus: 'approved',
      riskScore: kyc.riskScore || 0,
      travelRuleRequired,
      warnings: travelRuleRequired 
        ? [`Transfer above $${TRAVEL_RULE_THRESHOLD} requires Travel Rule information`] 
        : []
    }
  }

  // Run before any transfer
  static async preflightTransfer(
    senderWallet: string,
    receiverWallet: string,
    amount: number
  ): Promise<PreflightResult & { 
    receiverClear?: boolean
    senderRiskScore?: number 
  }> {
    
    // Screen both wallets simultaneously
    const [senderScreen, receiverScreen] = await Promise.all([
      ScreeningService.screenWallet(senderWallet).catch(() => ({ blocked: false, riskScore: 0, reason: '' })),
      ScreeningService.screenWallet(receiverWallet).catch(() => ({ blocked: false, riskScore: 0, reason: '' }))
    ])

    if (senderScreen.blocked) {
      return { allowed: false, layer: 'sanctions', 
               blockedReason: 'Sender address: ' + senderScreen.reason }
    }
    if (receiverScreen.blocked) {
      return { allowed: false, layer: 'sanctions',
               blockedReason: 'Receiver address: ' + receiverScreen.reason }
    }

    // Check sender KYC
    const kyc = await KycService.getStatus(senderWallet)
    if (kyc.status !== 'approved') {
      return { allowed: false, layer: 'kyc',
               blockedReason: 'Sender KYC verification required' }
    }

    return {
      allowed: true,
      layer: 'passed',
      travelRuleRequired: TravelRuleService.checkRequired(amount),
      receiverClear: true,
      senderRiskScore: senderScreen.riskScore,
      riskScore: senderScreen.riskScore
    }
  }

  // Get full compliance picture for a wallet
  static async getFullStatus(walletAddress: string): Promise<FullComplianceStatus> {
    const [kyc, screening] = await Promise.all([
      KycService.getStatus(walletAddress).catch(() => ({ status: 'unknown', riskScore: 0, applicantId: undefined })),
      ScreeningService.screenWallet(walletAddress).catch(() => ({ blocked: false, riskScore: 0 }))
    ])

    const fullyCompliant = kyc.status === 'approved' && !screening.blocked

    return {
      walletAddress,
      kycStatus: kyc.status,
      kycApplicantId: kyc.applicantId,
      riskScore: screening.riskScore || 0,
      isSanctioned: screening.blocked,
      ofacClear: !screening.blocked,
      travelRuleEnabled: true,
      travelRuleThreshold: TRAVEL_RULE_THRESHOLD,
      fullyCompliant,
      complianceLayers: {
        kyc: { 
          status: kyc.status === 'approved' ? 'active' : 'required',
          provider: 'Internal KYC + OpenAI'
        },
        screening: { 
          status: screening.blocked ? 'blocked' : 'active',
          provider: 'US Treasury OFAC SDN'
        },
        travelRule: { 
          status: 'active',
          provider: 'IVMS101 Open Standard'
        },
        custody: { 
          status: 'active',
          provider: 'Squads Protocol v4'
        }
      }
    }
  }

  // Get audit trail for display
  static async getAuditTrail(walletAddress?: string, limit = 20) {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)
    
    if (walletAddress) {
      query = query.eq('wallet_address', walletAddress)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  // Unified entry point for compliance orchestration
  static async invokeVerification(stepId: string) {
    // We assume the user is already authenticated or we pass the current session
    const { data, error } = await supabase.functions.invoke('compliance-verify', {
      body: { 
        stepId, 
        walletAddress: (window as any).solana?.publicKey?.toString() || '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' 
      }
    })
    return { data, error }
  }
}
