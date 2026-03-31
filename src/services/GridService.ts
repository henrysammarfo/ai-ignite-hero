import { supabase } from '../integrations/supabase/client';

const MOCK_MODE = import.meta.env.VITE_GRID_MOCK !== 'false';
const GRID_API = 'https://grid.squads.xyz/grid/v1';
const GRID_KEY = import.meta.env.VITE_SQUADS_GRID_API_KEY;

export class GridService {
  static async createVaultAccount(name: string, ownerWallet: string) {
    if (MOCK_MODE) {
      console.log(`[GRID MOCK] Creating vault account for ${name}`);
      const mockResult = {
        accountId: 'grd_mock_acc_' + Date.now(),
        address: 'BbqT...mock',
        status: 'active'
      };

      // Ensure a config row exists
      const { data: config } = await supabase.from('vault_config').select('id').single();
      if (config) {
        await supabase.from('vault_config')
          .update({
            grid_account_id: mockResult.accountId,
            grid_account_address: mockResult.address
          }).eq('id', config.id);
      }
      
      return mockResult;
    }

    // LIVE API Call (requires properly registered Grid Key)
    const res = await fetch(`${GRID_API}/accounts`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GRID_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, owner: ownerWallet })
    });
    return res.json();
  }

  static async getAccountBalance(accountId: string) {
    if (MOCK_MODE) {
      return {
        usdc: 500000,
        usdt: 125000,
        totalUsd: 625000
      };
    }

    const res = await fetch(`${GRID_API}/accounts/${accountId}/balances`, {
        headers: { 'Authorization': `Bearer ${GRID_KEY}` }
    });
    return res.json();
  }

  static async initiatePayment(params: { fromAccountId: string, toAddress: string, amount: number, currency: 'USDC' | 'USDT', memo: string, travelRuleHash?: string }) {
    if (MOCK_MODE) {
        return {
            paymentId: 'pay_mock_' + Date.now(),
            txSignature: 'mock-tx-' + Date.now(),
            status: params.amount >= 1000 && !params.travelRuleHash ? 'travel_rule_blocked' : 'completed'
        };
    }

    const res = await fetch(`${GRID_API}/payments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GRID_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    });
    return res.json();
  }

  static async getTransactionHistory(accountId: string, limit: number = 10) {
      if (MOCK_MODE) {
          return {
              data: Array(limit).fill(0).map((_, i) => ({
                  id: `tx_${Date.now() - i*1000}`,
                  type: i % 2 === 0 ? 'deposit' : 'withdrawal',
                  amount: 10000 - i * 500,
                  currency: 'USDC',
                  status: 'completed',
                  timestamp: new Date(Date.now() - i * 86400000).toISOString()
              }))
          };
      }
      const res = await fetch(`${GRID_API}/accounts/${accountId}/transactions?limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${GRID_KEY}` }
      });
      return res.json();
  }
}
