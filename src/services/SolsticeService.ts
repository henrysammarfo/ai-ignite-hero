import { supabase } from '../integrations/supabase/client';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

const MOCK_MODE = import.meta.env.VITE_SOLSTICE_MOCK === 'true';
const SOLSTICE_API = 'https://instructions.solstice.finance/v1/instructions';
const SOLSTICE_KEY = import.meta.env.VITE_SOLSTICE_API_KEY;

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
      throw new Error(`Solstice API error ${res.status}: ${err}`);
    }

    const payload = await res.json();
    const ix = payload.instruction;

    if (!ix || !ix.program_id) throw new Error("Invalid Solstice instruction payload format");

    // Reconstruct instruction from raw API numeric arrays
    return new TransactionInstruction({
      programId: new PublicKey(new Uint8Array(ix.program_id)),
      keys: ix.accounts.map((acc: any) => ({
        pubkey: new PublicKey(new Uint8Array(acc.pubkey)),
        isSigner: acc.is_signer,
        isWritable: acc.is_writable
      })),
      data: Buffer.from(new Uint8Array(ix.data))
    });
  }

  // Mint USX from USDC collateral
  static async requestMint(userWallet: string, amountUsdc: number) {
    if (MOCK_MODE) throw new Error("Mock mode disabled for MVP E2E trades.");
    return this.callSolsticeAPI('RequestMint', {
      amount: amountUsdc,     // Standard format (usually parsed dynamically on API end)
      collateral: 'usdc',
      user: userWallet
    });
  }

  static async confirmMint(userWallet: string, requestId: string) {
    if (MOCK_MODE) throw new Error("Mock mode disabled.");
    return this.callSolsticeAPI('ConfirmMint', { requestId, user: userWallet });
  }

  // Redeem USX back to USDC collateral
  static async requestRedeem(userWallet: string, amountUsx: number) {
    if (MOCK_MODE) throw new Error("Mock mode disabled.");
    return this.callSolsticeAPI('RequestRedeem', {
      amount: amountUsx,
      collateral: 'usdc',
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
