-- Add Microsoft Entra B2C support to participants
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS entra_oid TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS identity_provider TEXT DEFAULT 'internal';

-- Add index for fast lookups by Entra OID
CREATE INDEX IF NOT EXISTS idx_participants_entra_oid ON participants(entra_oid);
