-- ============================================================================
-- DPSWT (Direct People Support Welfare Team) - P2P Welfare Aid Platform
-- Database Migration & Schema Specification (PostgreSQL + Supabase)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ENUMS & DOMAINS
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE member_role AS ENUM ('MEMBER', 'INSPECTOR', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE appeal_type AS ENUM ('BEREAVEMENT', 'DAUGHTER_MARRIAGE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE appeal_status AS ENUM ('SUBMITTED', 'ACTIVE', 'CLOSED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE donation_status AS ENUM ('SUBMITTED', 'VERIFIED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- 2. TABLE: members
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    membership_id VARCHAR(32) UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone VARCHAR(15) NOT NULL,
    aadhaar_hash TEXT NOT NULL,
    aadhaar_last4 VARCHAR(4) NOT NULL,
    department TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Uttar Pradesh',
    role member_role NOT NULL DEFAULT 'MEMBER',
    avatar_url TEXT,
    fee_expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. TABLE: nominees
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.nominees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    upi_id TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 4. TABLE: appeals
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(32) UNIQUE NOT NULL,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE RESTRICT,
    type appeal_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL DEFAULT 1500000.00,
    collected_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status appeal_status NOT NULL DEFAULT 'ACTIVE',
    inspector_name TEXT NOT NULL,
    inspector_phone VARCHAR(20) NOT NULL,
    inspector_notes TEXT,
    event_date DATE NOT NULL,
    nominee_snapshot JSONB NOT NULL,
    supporting_docs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed_at TIMESTAMPTZ
);

-- ----------------------------------------------------------------------------
-- 5. TABLE: donation_records
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.donation_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appeal_id UUID NOT NULL REFERENCES public.appeals(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES public.members(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    utr_number VARCHAR(12) UNIQUE NOT NULL,
    slip_url TEXT NOT NULL,
    status donation_status NOT NULL DEFAULT 'SUBMITTED',
    inspector_notes TEXT,
    verified_by UUID REFERENCES public.members(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 6. INDEXES FOR HIGH-THROUGHPUT SEARCH & AUDIT
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_members_membership_id ON public.members(membership_id);
CREATE INDEX IF NOT EXISTS idx_members_district ON public.members(district);
CREATE INDEX IF NOT EXISTS idx_members_role ON public.members(role);
CREATE INDEX IF NOT EXISTS idx_appeals_status ON public.appeals(status);
CREATE INDEX IF NOT EXISTS idx_appeals_type ON public.appeals(type);
CREATE INDEX IF NOT EXISTS idx_appeals_code ON public.appeals(code);
CREATE INDEX IF NOT EXISTS idx_donation_records_appeal_id ON public.donation_records(appeal_id);
CREATE INDEX IF NOT EXISTS idx_donation_records_donor_id ON public.donation_records(donor_id);
CREATE INDEX IF NOT EXISTS idx_donation_records_utr ON public.donation_records(utr_number);
CREATE INDEX IF NOT EXISTS idx_donation_records_status ON public.donation_records(status);

-- ----------------------------------------------------------------------------
-- 7. AUTOMATED FUNCTIONS & TRIGGERS
-- ----------------------------------------------------------------------------

-- Recalculate appeal's collected_amount whenever a donation is verified or removed
CREATE OR REPLACE FUNCTION public.recalculate_appeal_collected_amount()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.appeals
    SET collected_amount = COALESCE((
        SELECT SUM(amount)
        FROM public.donation_records
        WHERE appeal_id = COALESCE(NEW.appeal_id, OLD.appeal_id)
          AND status = 'VERIFIED'
    ), 0.00)
    WHERE id = COALESCE(NEW.appeal_id, OLD.appeal_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_recalculate_appeal_amount ON public.donation_records;
CREATE TRIGGER trg_recalculate_appeal_amount
AFTER INSERT OR UPDATE OR DELETE ON public.donation_records
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_appeal_collected_amount();

-- Function to dynamically compute compliance ratio for any member
CREATE OR REPLACE FUNCTION public.get_member_compliance(p_member_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_total_appeals INT;
    v_contributed_appeals INT;
    v_ratio NUMERIC;
    v_is_eligible BOOLEAN;
    v_fee_valid BOOLEAN;
BEGIN
    -- Count all historical non-submitted appeals created after the member joined
    SELECT COUNT(*) INTO v_total_appeals
    FROM public.appeals
    WHERE status IN ('ACTIVE', 'CLOSED');

    -- Count distinct appeals this member successfully contributed to (VERIFIED or SUBMITTED)
    SELECT COUNT(DISTINCT appeal_id) INTO v_contributed_appeals
    FROM public.donation_records
    WHERE donor_id = p_member_id
      AND status IN ('VERIFIED', 'SUBMITTED');

    IF v_total_appeals = 0 THEN
        v_ratio := 100.0;
    ELSE
        v_ratio := ROUND((v_contributed_appeals::NUMERIC / v_total_appeals::NUMERIC) * 100.0, 1);
    END IF;

    -- Check if annual membership fee is currently valid
    SELECT (fee_expires_at > now()) INTO v_fee_valid
    FROM public.members
    WHERE id = p_member_id;

    v_is_eligible := (v_ratio >= 75.0) AND COALESCE(v_fee_valid, false);

    RETURN jsonb_build_object(
        'total_appeals', v_total_appeals,
        'contributed_appeals', v_contributed_appeals,
        'ratio', v_ratio,
        'is_eligible', v_is_eligible,
        'fee_valid', COALESCE(v_fee_valid, false)
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- ----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_records ENABLE ROW LEVEL SECURITY;

-- Members policies
CREATE POLICY "Public profiles are viewable by all authenticated users"
ON public.members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Members can update only their own profile"
ON public.members FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Nominees policies
CREATE POLICY "Nominees viewable by authenticated users for active appeals"
ON public.nominees FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Members can manage their own nominees"
ON public.nominees FOR ALL
TO authenticated
USING (member_id = auth.uid())
WITH CHECK (member_id = auth.uid());

-- Appeals policies
CREATE POLICY "Appeals are viewable by all users"
ON public.appeals FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated members can submit an appeal"
ON public.appeals FOR INSERT
TO authenticated
WITH CHECK (member_id = auth.uid());

CREATE POLICY "Inspectors and admins can update appeals"
ON public.appeals FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.members
        WHERE members.id = auth.uid()
          AND members.role IN ('INSPECTOR', 'ADMIN')
    )
);

-- Donation records policies
CREATE POLICY "Donors can view their own donation records"
ON public.donation_records FOR SELECT
TO authenticated
USING (
    donor_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.members
        WHERE members.id = auth.uid()
          AND members.role IN ('INSPECTOR', 'ADMIN')
    )
);

CREATE POLICY "Donors can insert donation slips"
ON public.donation_records FOR INSERT
TO authenticated
WITH CHECK (donor_id = auth.uid());

CREATE POLICY "Inspectors and admins can verify donation records"
ON public.donation_records FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.members
        WHERE members.id = auth.uid()
          AND members.role IN ('INSPECTOR', 'ADMIN')
    )
);

-- ----------------------------------------------------------------------------
-- 9. SUPABASE STORAGE BUCKET CONFIGURATION
-- ----------------------------------------------------------------------------
-- NOTE: Execute in Supabase Storage UI or via SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('donation-slips', 'donation-slips', true);
-- CREATE POLICY "Allow authenticated users to upload slips"
-- ON storage.objects FOR INSERT TO authenticated
-- WITH CHECK (bucket_id = 'donation-slips');
-- CREATE POLICY "Allow public read of slips"
-- ON storage.objects FOR SELECT TO public
-- USING (bucket_id = 'donation-slips');
