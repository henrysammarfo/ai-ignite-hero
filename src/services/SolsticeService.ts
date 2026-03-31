import { supabase } from '../integrations/supabase/client';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

const MOCK_MODE = import.meta.env.VITE_SOLSTICE_MOCK === 'true';
const SOLSTICE_API =
  import.meta.env.VITE_SOLSTICE_API_URL
    || (import.meta.env.DEV ? '/api/solstice/v1/instructions' : 'https://instructions.solstice.finance/v1/instructions');
// Fall back to the shared hackathon key if env is missing so devnet calls don't silently fail
const SOLSTICE_KEY = import.meta.env.VITE_SOLSTICE_API_KEY || '5aJUZP9ebCApZm%2BVMIvGQLZlRr9E';

type Collateral = 'usdc' | 'usdt' | 'usdg';

export class SolsticeService {
  /**
   * Translates the raw byte arrays returned by Solstice into a proper Solana Web3 TransactionInstruction.
   */
  static async callSolsticeAPI(type: string, data: object): Promise<TransactionInstruction> {
    const res = await fetch(SOLSTICE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SOLSTICE_KEY
      },
      body: JSON.stringify({ type, data })
    });
    
    if (!res.ok) {
      const err = await res.text();
      // Most common failure during hackathon is missing whitelist, so surface it clearly.
      throw new Error(`Solstice API error ${res.status}: ${err || 'unknown error'}. ` +
        `If this is a devnet wallet/PDA, confirm it is whitelisted with Solstice.`);
    }

    const payload = await res.json();
    const ix = payload.instruction || payload.txn || payload.tx || payload;

    if (!ix || !ix.program_id) throw new Error("Invalid Solstice instruction payload format");

    const toPubkey = (v: any) => {
      if (Array.isArray(v)) return new PublicKey(new Uint8Array(v));
      if (typeof v === 'string') return new PublicKey(v);
      throw new Error('Unexpected pubkey format from Solstice API');
    };

    const toBuffer = (v: any) => {
      if (Array.isArray(v)) return Buffer.from(new Uint8Array(v));
      if (typeof v === 'string') return Buffer.from(v, 'base64');
      throw new Error('Unexpected data format from Solstice API');
    };

    // Reconstruct instruction from raw API numeric arrays
    return new TransactionInstruction({
      programId: toPubkey(ix.program_id),
      keys: ix.accounts.map((acc: any) => ({
        pubkey: toPubkey(acc.pubkey),
        isSigner: acc.is_signer,
        isWritable: acc.is_writable
      })),
      data: toBuffer(ix.data)
    });
  }

  // Mint USX from USDC collateral
  static async requestMint(userWallet: string, amount: number, collateral: Collateral = 'usdc') {
    if (MOCK_MODE) throw new Error("Mock mode disabled for MVP E2E trades.");
    return this.callSolsticeAPI('RequestMint', {
      amount,                 // Amount in base units (API handles decimals)
      collateral,
      user: userWallet
    });
  }

  static async confirmMint(userWallet: string, requestId: string) {
    if (MOCK_MODE) throw new Error("Mock mode disabled.");
    return this.callSolsticeAPI('ConfirmMint', { requestId, user: userWallet });
  }

  // Redeem USX back to USDC collateral
  static async requestRedeem(userWallet: string, amountUsx: number, collateral: Collateral = 'usdc') {
    if (MOCK_MODE) throw new Error("Mock mode disabled.");
    return this.callSolsticeAPI('RequestRedeem', {
      amount: amountUsx,
      collateral,
      user: userWallet
    });
  }

  // YieldVault interactions for eUSX
  static async lockToYieldVault(userWallet: string, usxAmount: number) {
    if (MOCK_MODE) throw new Error("Mock mode disabled.");
    return this.callSolsticeAPI('Lock', { amount: usxAmount, user: userWallet });
  }

  static async unlockFromYieldVault(userWallet: string, eusxAmount: number) {
    if (MOCK_MODE) throw new Error("Mock mode disabled.");
    return this.callSolsticeAPI('Unlock', { amount: eusxAmount, user: userWallet });
  }

  static async withdrawYield(userWallet: string) {
    return this.callSolsticeAPI('Withdraw', { user: userWallet });
  }

  // Original UI Read method - keeps dashboard functional
  static async getYieldPosition(walletAddress: string) {
    if (MOCK_MODE) {
      const { data, error } = await supabase
        .from('yield_positions')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle();
      
      const deposited = data?.usdc_deposited || 0;
      const yieldEarned = deposited * 0.0023;

      return {
        eusxBalance: data?.eusx_balance || deposited,
        currentValueUsdc: deposited + yieldEarned,
        yieldEarned,
        apy: 13.96,
        provider: 'Solstice Finance YieldVault',
        mockMode: true,
        loaded: !error
      };
    }
    
    // LIVE
    const { data, error } = await supabase.functions.invoke('solstice-yield', {
      body: { action: 'get_position', walletAddress }
    });
    
    if (error) throw error;
    return data;
  }
}
