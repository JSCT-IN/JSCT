-- ==============================================================================
-- 001_core_schema.sql
-- Enterprise Schema for Jan Sewa Charitable Trust (JSCT) Welfare Platform
-- Target Project: kghwzliszsfcmzhpcjpu (JSCT_2.0)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Storage Buckets Configuration
-- Bucket 1: member-photos (Public read for digital ID cards)
-- Bucket 2: payment-receipts (Restricted to member & admin audit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'member-photos',
    'member-photos',
    true,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  ),
  (
    'payment-receipts',
    'payment-receipts',
    false,
    10485760, -- 10 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'image/jpg']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS
CREATE POLICY "Public Read Member Photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'member-photos');

CREATE POLICY "Allow Upload Member Photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'member-photos');

CREATE POLICY "Allow Upload Payment Receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-receipts');

CREATE POLICY "Member and Admin Read Payment Receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-receipts' AND (
      auth.role() = 'service_role' OR
      auth.uid() IS NOT NULL
    )
  );

-- 3. Sequence for auto-generating unique member IDs: JSCT-2026-00001
CREATE SEQUENCE IF NOT EXISTS public.member_seq START WITH 1;

-- 4. Primary Entity: members
CREATE TABLE IF NOT EXISTS public.members (
  -- Primary Key & Auth Link
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),

  -- Personal Details
  full_name TEXT NOT NULL,
  father_or_husband_name TEXT NOT NULL,
  mother_name TEXT,
  dob DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  blood_group TEXT,
  marital_status TEXT DEFAULT 'married' CHECK (marital_status IN ('unmarried', 'married', 'widow', 'separated', 'divorced', 'not_specified')),
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  joining_date DATE DEFAULT CURRENT_DATE,

  -- Address & Contact
  mobile TEXT UNIQUE NOT NULL,
  email TEXT,
  state TEXT NOT NULL DEFAULT 'Uttar Pradesh',
  district TEXT NOT NULL,
  block TEXT NOT NULL,
  pin_code TEXT NOT NULL,
  permanent_address TEXT NOT NULL,

  -- Nominee & Family
  nominee_name TEXT NOT NULL,
  nominee_relation TEXT NOT NULL,
  nominee_age INTEGER NOT NULL,
  nominee_mobile TEXT NOT NULL,
  family_members JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Payment & Transaction
  transaction_id TEXT UNIQUE NOT NULL,
  ration_card_id TEXT,
  payment_receipt_url TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,

  -- Identity Assets & Compliance
  photo_url TEXT NOT NULL,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  lock_in_end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for rapid lookup
CREATE INDEX IF NOT EXISTS idx_members_mobile ON public.members(mobile);
CREATE INDEX IF NOT EXISTS idx_members_member_id ON public.members(member_id);
CREATE INDEX IF NOT EXISTS idx_members_role ON public.members(role);
CREATE INDEX IF NOT EXISTS idx_members_payment_status ON public.members(payment_status);
CREATE INDEX IF NOT EXISTS idx_members_is_active ON public.members(is_active);

-- 5. Trigger Function: Auto Sequential member_id & 6-Month Lock-in
CREATE OR REPLACE FUNCTION public.handle_member_defaults()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-generate member_id if missing: JSCT-2026-00001
  IF NEW.member_id IS NULL OR NEW.member_id = '' THEN
    NEW.member_id := 'JSCT-2026-' || LPAD(nextval('public.member_seq')::TEXT, 5, '0');
  END IF;

  -- Ensure registration_date
  IF NEW.registration_date IS NULL THEN
    NEW.registration_date := now();
  END IF;

  -- Strict 6-Month Lock-in calculation
  NEW.lock_in_end_date := NEW.registration_date + INTERVAL '6 months';

  -- Auto-sync is_active with verified payment status
  IF NEW.payment_status = 'verified' THEN
    NEW.is_active := true;
  END IF;

  NEW.updated_at := now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_members_defaults ON public.members;
CREATE TRIGGER trg_members_defaults
  BEFORE INSERT OR UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_member_defaults();

-- 6. Welfare Schemes Table
CREATE TABLE IF NOT EXISTS public.welfare_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  max_coverage NUMERIC NOT NULL,
  lock_in_months INTEGER NOT NULL DEFAULT 6,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Strictly Active Programs (Omitting legacy "बेटा विवाह बधाई योजना"):
-- 1. दिवंगत के स्थिति में सहयोग: Up to ₹15,00,000.
-- 2. बेटी विवाह सहयोग: Up to ₹5,00,000.
INSERT INTO public.welfare_schemes (name, description, max_coverage, lock_in_months, is_active)
VALUES
  (
    'दिवंगत के स्थिति में सहयोग',
    'आकस्मिक सहायता: दिवंगत साथी के आश्रित परिवार को गरिमामय आर्थिक संबल (6 माह की निरंतर सदस्यता अनिवार्य)',
    1500000,
    6,
    true
  ),
  (
    'बेटी विवाह सहयोग',
    'कल्याणकारी संबल: समर्पित सदस्य की सुपुत्री के पाणिग्रहण संस्कार हेतु आर्थिक सहयोग (6 माह की निरंतर सदस्यता अनिवार्य)',
    500000,
    6,
    true
  )
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  max_coverage = EXCLUDED.max_coverage,
  lock_in_months = EXCLUDED.lock_in_months,
  is_active = EXCLUDED.is_active;

-- Remove legacy beta vivah if present
DELETE FROM public.welfare_schemes WHERE name ILIKE '%बेटा विवाह%';

-- 7. Welfare Claims Table
CREATE TABLE IF NOT EXISTS public.welfare_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  scheme_id UUID NOT NULL REFERENCES public.welfare_schemes(id) ON DELETE RESTRICT,
  claim_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  supporting_docs TEXT[] DEFAULT ARRAY[]::TEXT[],
  admin_remarks TEXT,
  disbursed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_welfare_claims_member ON public.welfare_claims(member_id);
CREATE INDEX IF NOT EXISTS idx_welfare_claims_status ON public.welfare_claims(status);

-- 8. Enforce 6-Month Lock-in Database Constraint Trigger
CREATE OR REPLACE FUNCTION public.check_welfare_claim_eligibility()
RETURNS TRIGGER AS $$
DECLARE
  v_lock_in_end TIMESTAMPTZ;
  v_is_active BOOLEAN;
  v_member_name TEXT;
BEGIN
  SELECT lock_in_end_date, is_active, full_name 
  INTO v_lock_in_end, v_is_active, v_member_name
  FROM public.members
  WHERE id = NEW.member_id;

  IF v_is_active IS NOT TRUE THEN
    RAISE EXCEPTION 'सदस्य खाता (% ) अभी सक्रिय व सत्यापित नहीं है। सहायता दावा केवल शुल्क सत्यापन के उपरांत प्रस्तुत किया जा सकता है।', v_member_name;
  END IF;

  IF now() < v_lock_in_end THEN
    RAISE EXCEPTION '6-माह की सुरक्षा लॉक-इन अवधि अभी सक्रिय है। सदस्य % की लॉक-इन अवधि % को समाप्त होगी। इस तिथि से पूर्व दावा अमान्य है।', v_member_name, v_lock_in_end;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_claim_lock_in ON public.welfare_claims;
CREATE TRIGGER trg_check_claim_lock_in
  BEFORE INSERT ON public.welfare_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.check_welfare_claim_eligibility();

-- 9. Row Level Security (RLS) Configuration
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.welfare_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.welfare_claims ENABLE ROW LEVEL SECURITY;

-- Helper to check if caller is an admin
CREATE OR REPLACE FUNCTION public.is_trust_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.members
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: members table
DROP POLICY IF EXISTS "Members can view own profile" ON public.members;
CREATE POLICY "Members can view own profile"
  ON public.members FOR SELECT
  USING (auth.uid() = id OR public.is_trust_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Members can update own profile" ON public.members;
CREATE POLICY "Members can update own profile"
  ON public.members FOR UPDATE
  USING (auth.uid() = id OR public.is_trust_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow registration insert" ON public.members;
CREATE POLICY "Allow registration insert"
  ON public.members FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_trust_admin() OR auth.role() = 'service_role' OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Admins have full CRUD on members" ON public.members;
CREATE POLICY "Admins have full CRUD on members"
  ON public.members FOR ALL
  USING (public.is_trust_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_trust_admin() OR auth.role() = 'service_role');

-- RLS: welfare_schemes
DROP POLICY IF EXISTS "Public and members can view active schemes" ON public.welfare_schemes;
CREATE POLICY "Public and members can view active schemes"
  ON public.welfare_schemes FOR SELECT
  USING (is_active = true OR public.is_trust_admin());

DROP POLICY IF EXISTS "Admins can manage schemes" ON public.welfare_schemes;
CREATE POLICY "Admins can manage schemes"
  ON public.welfare_schemes FOR ALL
  USING (public.is_trust_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_trust_admin() OR auth.role() = 'service_role');

-- RLS: welfare_claims
DROP POLICY IF EXISTS "Members can view own claims" ON public.welfare_claims;
CREATE POLICY "Members can view own claims"
  ON public.welfare_claims FOR SELECT
  USING (auth.uid() = member_id OR public.is_trust_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Members can insert own claims" ON public.welfare_claims;
CREATE POLICY "Members can insert own claims"
  ON public.welfare_claims FOR INSERT
  WITH CHECK (auth.uid() = member_id OR public.is_trust_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins can review and update claims" ON public.welfare_claims;
CREATE POLICY "Admins can review and update claims"
  ON public.welfare_claims FOR ALL
  USING (public.is_trust_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_trust_admin() OR auth.role() = 'service_role');
