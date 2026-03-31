import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WALLET = '2PFg1fhfNBhqr7wLados3PB46rmwNrjTCcTeNHaFNABz';
const VAULT  = 'AuUJq1XN3whkUgNqqvXVswHLqjxrtkjnLzU3ZTLFFzoU';

async function seed() {
  console.log('');
  console.log('=== Seeding Compliance Records (compliance_records table) ===');
  console.log('Wallet:', WALLET);
  console.log('');

  const steps = [
    {
      step_id: 'kyc',
      status: 'verified',
      verification_hash: 'civic-pass-amina-whitelist-' + Date.now(),
      risk_score: '12',
      verified_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 365*24*60*60*1000).toISOString(),
      error_message: null
    },
    {
      step_id: 'aml',
      status: 'verified',
      verification_hash: 'ofac-clear-trm-' + Date.now(),
      risk_score: '5',
      verified_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 90*24*60*60*1000).toISOString(),
      error_message: null
    },
    {
      step_id: 'travel',
      status: 'verified',
      verification_hash: 'ivms101-notabene-' + Date.now(),
      risk_score: null,
      verified_at: new Date().toISOString(),
      expires_at: null,
      error_message: null
    },
    {
      step_id: 'sof',
      status: 'verified',
      verification_hash: 'on-chain-pda-' + VAULT,
      risk_score: null,
      verified_at: new Date().toISOString(),
      expires_at: null,
      error_message: null
    },
  ];

  for (const step of steps) {
    const label = step.step_id.toUpperCase();
    process.stdout.write('[' + label + '] Upserting... ');
    const { error } = await supabase
      .from('compliance_records')
      .upsert({
        ...step,
        wallet_address: WALLET,
      }, { onConflict: 'wallet_address,step_id' });
    if (error) {
      // Try without onConflict — table may not have unique constraint yet
      const { error: err2 } = await supabase
        .from('compliance_records')
        .insert({ ...step, wallet_address: WALLET });
      if (err2) console.log('FAIL — ' + err2.message);
      else console.log('PASS (inserted)');
    } else {
      console.log('PASS (upserted)');
    }
  }

  // Also seed yield position for the wallet
  console.log('');
  console.log('[YIELD] Seeding yield position (3000 USDC)...');
  const { error: ypErr } = await supabase
    .from('yield_positions')
    .upsert({
      wallet_address: WALLET,
      usdc_deposited: 3000,
      eusx_balance: 3006.9,
      status: 'active',
      provider: 'solstice_eusx',
      last_updated: new Date().toISOString()
    }, { onConflict: 'wallet_address' });
  if (ypErr) {
    // insert instead
    const { error: ypErr2 } = await supabase.from('yield_positions').insert({
      wallet_address: WALLET, usdc_deposited: 3000, eusx_balance: 3006.9,
      status: 'active', provider: 'solstice_eusx'
    });
    if (ypErr2) console.log('  [FAIL] Yield position:', ypErr2.message);
    else console.log('  [PASS] Yield position inserted (3000 USDC, 3006.9 eUSX)');
  } else {
    console.log('  [PASS] Yield position upserted (3000 USDC, 3006.9 eUSX)');
  }

  console.log('');
  console.log('=== Done. Refresh http://localhost:8080 to see all 4 checks pass. ===');
  console.log('');
}

seed();