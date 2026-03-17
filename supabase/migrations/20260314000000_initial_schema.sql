-- Organizations table to manage institutional entities
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own organizations" 
  ON organizations FOR SELECT 
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own organizations" 
  ON organizations FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

-- Compliance Records for tracking KYC/AML steps
CREATE TABLE IF NOT EXISTS compliance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL, -- 'kyc', 'aml', 'travel', 'sof'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  verification_hash TEXT,
  risk_score TEXT,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for compliance records
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own compliance records" 
  ON compliance_records FOR SELECT 
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can manage their own compliance records" 
  ON compliance_records FOR ALL 
  USING (auth.uid() = owner_id);

-- Transactions table for historical tracking
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  vault_id TEXT NOT NULL, -- On-chain PDA address
  type TEXT NOT NULL, -- 'deposit', 'withdrawal', 'yield'
  amount NUMERIC NOT NULL,
  token TEXT DEFAULT 'USDC',
  tx_signature TEXT UNIQUE,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  from_address TEXT,
  to_address TEXT,
  network_fee NUMERIC,
  block_number BIGINT,
  confirmations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" 
  ON transactions FOR SELECT 
  USING (auth.uid() = owner_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_compliance_owner_step ON compliance_records(owner_id, step_id);
CREATE INDEX IF NOT EXISTS idx_transactions_owner ON transactions(owner_id);
