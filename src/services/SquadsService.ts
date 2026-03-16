import * as multisig from '@sqds/multisig'
import { 
  Connection, Keypair, PublicKey, 
  Transaction, SystemProgram 
} from '@solana/web3.js'
import { supabase } from '../integrations/supabase/client'

const RPC_URL = import.meta.env.VITE_HELIUS_RPC_URL 
  || 'https://api.devnet.solana.com'

const connection = new Connection(RPC_URL, 'confirmed')

export interface VaultInfo {
  multisigPda: string
  threshold: number
  members: string[]
  transactionIndex: number
}

export class SquadsService {

  // Creates a new Squads v4 multisig vault
  // For demo: creates with provided member keys
  // threshold: min approvals needed (default 2-of-3)
  static async createVault(params: {
    creatorKeypair: Keypair
    members: PublicKey[]
    threshold: number
    vaultName: string
  }): Promise<{ multisigPda: string, txSignature: string }> {
    
    const createKey = Keypair.generate()
    const [multisigPda] = multisig.getMultisigPda({
      createKey: createKey.publicKey
    })

    const signature = await multisig.rpc.multisigCreateV2({
      connection,
      createKey,
      creator: params.creatorKeypair,
      multisigPda,
      configAuthority: null,
      threshold: params.threshold,
      members: params.members.map((key: PublicKey) => ({
        key,
        permissions: multisig.types.Permissions.all()
      })),
      timeLock: 0,
      rentCollector: null,
    })

    // Save to Supabase vault_config
    await supabase.from('vault_config').upsert({
      multisig_pda: multisigPda.toString(),
      vault_name: params.vaultName,
      custody_provider: 'squads'
    })

    // Log to audit
    await supabase.from('audit_logs').insert({
      wallet_address: params.creatorKeypair.publicKey.toString(),
      action: 'vault_created',
      provider_used: 'squads-v4',
      layer: 'custody',
      tx_signature: signature
    })

    return { 
      multisigPda: multisigPda.toString(), 
      txSignature: signature 
    }
  }

  // Get vault info and balance
  static async getVaultInfo(multisigPdaStr: string): Promise<VaultInfo> {
    const multisigPda = new PublicKey(multisigPdaStr)
    const multisigAccount = await multisig.accounts.Multisig.fromAccountAddress(
      connection, multisigPda
    )
    return {
      multisigPda: multisigPdaStr,
      threshold: multisigAccount.threshold,
      members: multisigAccount.members.map((m: any) => m.key.toString()),
      transactionIndex: Number(multisigAccount.transactionIndex)
    }
  }

  // Get SOL balance of vault
  static async getVaultBalance(multisigPdaStr: string): Promise<number> {
    const balance = await connection.getBalance(new PublicKey(multisigPdaStr))
    return balance / 1e9  // Convert lamports to SOL
  }

  // Get stored vault config from Supabase
  static async getSavedVaultConfig() {
    const { data } = await supabase
      .from('vault_config')
      .select('*')
      .single()
    return data
  }

  // Check if Squads SDK is available (for UI status display)
  static async isAvailable(): Promise<boolean> {
    try {
      await connection.getVersion()
      return true
    } catch {
      return false
    }
  }
}
