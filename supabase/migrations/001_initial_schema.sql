-- ==============================================================================
-- 001_initial_schema.sql
-- Production Database Schema for JSCT Welfare Platform
-- Target Supabase Project: kghwzliszsfcmzhpcjpu (JSCT_2.0)
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Sequence for auto-generating unique member IDs: JSCT-2026-XXXX
CREATE SEQUENCE IF NOT EXISTS public.member_id_seq START WITH 1001;

-- 3. Profiles Table (Users & Membership)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  father_or_husband_name TEXT,
  phone TEXT UNIQUE NOT NULL,
  gender TEXT DEFAULT 'male',
  dob DATE,
  district TEXT,
  block TEXT,
  address TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  lock_in_end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_member_id ON public.profiles(member_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON public.profiles(is_verified);

-- 4. Trigger Function: Automatically set member_id and 6-month lock-in date
CREATE OR REPLACE FUNCTION public.handle_new_profile_defaults()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-generate member_id if not provided: JSCT-2026-XXXX
  IF NEW.member_id IS NULL OR NEW.member_id = '' THEN
    NEW.member_id := 'JSCT-2026-' || LPAD(nextval('public.member_id_seq')::TEXT, 4, '0');
  END IF;

  -- Auto-calculate 6-month lock-in date (strictly 6 months)
  IF NEW.registration_date IS NULL THEN
    NEW.registration_date := now();
  END IF;
  NEW.lock_in_end_date := NEW.registration_date + INTERVAL '6 months';

  -- Updated timestamp
  NEW.updated_at := now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_profiles_defaults ON public.profiles;
CREATE TRIGGER trg_profiles_defaults
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile_defaults();

-- 5. Schemes Table (Welfare Rules & Programs)
CREATE TABLE IF NOT EXISTS public.schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  assistance_limit NUMERIC NOT NULL,
  lock_in_period_months INTEGER NOT NULL DEFAULT 6,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed strictly with updated active programs:
-- 1. "दिवंगत के स्थिति में सहयोग" (Limit up to ₹15,00,000, Lock-in 6 months)
-- 2. "बेटी विवाह सहयोग" (Limit up to ₹5,00,000, Lock-in 6 months)
-- ("बेटा विवाह बधाई योजना" is completely omitted/deleted)
INSERT INTO public.schemes (name, description, assistance_limit, lock_in_period_months, is_active)
VALUES
  (
    'दिवंगत के स्थिति में सहयोग',
    'आकस्मिक सहायता: दिवंगत साथी के आश्रित परिवार को गरिमामय आर्थिक संबल (6 माह की सदस्यता अनिवार्य)',
    1500000,
    6,
    true
  ),
  (
    'बेटी विवाह सहयोग',
    'कल्याणकारी संबल: समर्पित सदस्य की पुत्री के पाणिग्रहण संस्कार हेतु आर्थिक सहयोग (6 माह की सदस्यता अनिवार्य)',
    500000,
    6,
    true
  )
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  assistance_limit = EXCLUDED.assistance_limit,
  lock_in_period_months = EXCLUDED.lock_in_period_months,
  is_active = EXCLUDED.is_active;

-- Remove legacy beta vivah scheme if present
DELETE FROM public.schemes WHERE name ILIKE '%बेटा विवाह%';

-- 6. Reports and Claims Table (Welfare Claims & Assistance)
CREATE TABLE IF NOT EXISTS public.reports_and_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheme_name TEXT NOT NULL,
  claim_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  supporting_docs TEXT[] DEFAULT ARRAY[]::TEXT[],
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_claims_user_id ON public.reports_and_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.reports_and_claims(status);

-- 7. Trigger to automatically create profile on Auth User signup
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_phone TEXT;
  v_father_name TEXT;
  v_gender TEXT;
  v_district TEXT;
  v_block TEXT;
  v_address TEXT;
  v_avatar TEXT;
  v_role TEXT;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, '+91 ' || LPAD((floor(random() * 9000000000) + 1000000000)::text, 10, '0'));
  v_father_name := NEW.raw_user_meta_data->>'father_or_husband_name';
  v_gender := COALESCE(NEW.raw_user_meta_data->>'gender', 'male');
  v_district := COALESCE(NEW.raw_user_meta_data->>'district', 'Gorakhpur');
  v_block := NEW.raw_user_meta_data->>'block';
  v_address := COALESCE(NEW.raw_user_meta_data->>'address', '');
  v_avatar := COALESCE(NEW.raw_user_meta_data->>'avatar_url', '');
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'member');

  INSERT INTO public.profiles (
    id,
    full_name,
    father_or_husband_name,
    phone,
    gender,
    district,
    block,
    address,
    avatar_url,
    role,
    is_verified
  ) VALUES (
    NEW.id,
    v_full_name,
    v_father_name,
    v_phone,
    v_gender,
    v_district,
    v_block,
    v_address,
    v_avatar,
    v_role,
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    district = EXCLUDED.district,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();

-- 8. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports_and_claims ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: Profiles Policies
DROP POLICY IF EXISTS "Members can view own profile" ON public.profiles;
CREATE POLICY "Members can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Members can update own profile" ON public.profiles;
CREATE POLICY "Members can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow user profile self insert" ON public.profiles;
CREATE POLICY "Allow user profile self insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin() OR auth.uid() IS NULL);

-- RLS: Schemes Policies
DROP POLICY IF EXISTS "Public and members can view active schemes" ON public.schemes;
CREATE POLICY "Public and members can view active schemes"
  ON public.schemes FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage schemes" ON public.schemes;
CREATE POLICY "Admins can manage schemes"
  ON public.schemes FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RLS: Reports and Claims Policies
DROP POLICY IF EXISTS "Members can view own claims" ON public.reports_and_claims;
CREATE POLICY "Members can view own claims"
  ON public.reports_and_claims FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Members can submit claims" ON public.reports_and_claims;
CREATE POLICY "Members can submit claims"
  ON public.reports_and_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update claims" ON public.reports_and_claims;
CREATE POLICY "Admins can update claims"
  ON public.reports_and_claims FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete claims" ON public.reports_and_claims;
CREATE POLICY "Admins can delete claims"
  ON public.reports_and_claims FOR DELETE
  USING (public.is_admin());
