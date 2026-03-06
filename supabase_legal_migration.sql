-- NIRIUM PROTOCOL - LEGAL SHIELD MIGRATION
-- Run this in your Supabase SQL Editor to enable cryptographic term signatures.

CREATE TABLE IF NOT EXISTS public.user_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL,
    signature_hash TEXT NOT NULL,
    message_signed TEXT NOT NULL,
    network TEXT NOT NULL DEFAULT 'stellar:testnet',
    accepted_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for fast lookup by wallet address
CREATE INDEX IF NOT EXISTS idx_user_signatures_wallet ON public.user_signatures(wallet_address);

-- RLS Policies (Security)
ALTER TABLE public.user_signatures ENABLE ROW LEVEL SECURITY;

-- Allow anyone to check signatures (Read-only for validation)
CREATE POLICY "Allow public read access to signatures" 
ON public.user_signatures FOR SELECT 
USING (true);

-- Allow users to insert their own signatures
CREATE POLICY "Allow insertion of signatures" 
ON public.user_signatures FOR INSERT 
WITH CHECK (true);

COMMENT ON TABLE public.user_signatures IS 'Stores cryptographic proof of terms acceptance for Nirium Protocol users.';
