-- AMINA Bank Feature Addition Migrations

-- 1. Reconciliation Log (Proof of Reserves)
CREATE TABLE IF NOT EXISTS reconciliation_log (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz default now(),
  slot bigint,
  usdc_balance numeric,
  eusx_balance numeric,
  fusx_total_supply numeric,
  backing_ratio numeric,
  publisher text,
  tx_signature text,
  on_chain_pda text
);

DROP POLICY IF EXISTS "allow_all" ON reconciliation_log;
CREATE POLICY "allow_all" ON reconciliation_log FOR ALL USING (true);
ALTER TABLE reconciliation_log ENABLE ROW LEVEL SECURITY;

-- 2. Solstice Yield Positions
CREATE TABLE IF NOT EXISTS yield_positions (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  eusx_balance numeric default 0,
  usdc_deposited numeric not null,
  status text default 'active',
  deposited_at timestamptz default now(),
  provider text default 'solstice_eusx',
  last_updated timestamptz default now()
);

DROP POLICY IF EXISTS "allow_all" ON yield_positions;
CREATE POLICY "allow_all" ON yield_positions FOR ALL USING (true);
ALTER TABLE yield_positions ENABLE ROW LEVEL SECURITY;

-- 3. Vault Configuration (Grid API)
ALTER TABLE vault_config 
ADD COLUMN IF NOT EXISTS grid_account_id text,
ADD COLUMN IF NOT EXISTS grid_account_address text;
