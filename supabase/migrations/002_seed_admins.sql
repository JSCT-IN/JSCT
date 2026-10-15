-- ==============================================================================
-- 002_seed_admins.sql
-- Seed Administrator Accounts for Jan Sewa Charitable Trust (JSCT)
-- Target Project: kghwzliszsfcmzhpcjpu (JSCT_2.0)
-- ==============================================================================

-- 1. Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
DECLARE
  ambrish_uid UUID := 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d';
  irfan_uid   UUID := 'b2c3d4e5-f6a1-4b2c-9d3e-4f5a6b7c8d9e';
BEGIN

  -- ----------------------------------------------------------------------------
  -- ADMIN 1: Ambrish Kumar (Ambrish@jsct.com / Ambrish@123)
  -- ----------------------------------------------------------------------------
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'Ambrish@jsct.com') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      ambrish_uid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'Ambrish@jsct.com',
      crypt('Ambrish@123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Ambrish Kumar","role":"admin"}'::jsonb,
      now(),
      now()
    );
  ELSE
    SELECT id INTO ambrish_uid FROM auth.users WHERE email = 'Ambrish@jsct.com';
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('Ambrish@123', gen_salt('bf')),
      raw_user_meta_data = '{"full_name":"Ambrish Kumar","role":"admin"}'::jsonb,
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
    WHERE id = ambrish_uid;
  END IF;

  -- Upsert Ambrish Kumar in public.members
  INSERT INTO public.members (
    id,
    member_id,
    role,
    full_name,
    father_or_husband_name,
    dob,
    gender,
    marital_status,
    department,
    designation,
    mobile,
    email,
    state,
    district,
    block,
    pin_code,
    permanent_address,
    nominee_name,
    nominee_relation,
    nominee_age,
    nominee_mobile,
    transaction_id,
    payment_receipt_url,
    payment_status,
    photo_url,
    is_active,
    registration_date,
    lock_in_end_date
  ) VALUES (
    ambrish_uid,
    'JSCT-ADMIN-001',
    'admin',
    'Ambrish Kumar',
    'Trustee Parent',
    '1985-05-15',
    'male',
    'married',
    'Trust Administration',
    'Chief Executive Administrator',
    '9876543210',
    'Ambrish@jsct.com',
    'Uttar Pradesh',
    'Gorakhpur',
    'Sadar',
    '273001',
    'JSCT Central Office, Civil Lines, Gorakhpur, UP',
    'Family Nominee',
    'Spouse',
    38,
    '9876543219',
    'ADMIN-INIT-001',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    'verified',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    true,
    now() - INTERVAL '1 year',
    now() - INTERVAL '6 months'
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    full_name = 'Ambrish Kumar',
    email = 'Ambrish@jsct.com',
    payment_status = 'verified',
    is_active = true;

  -- ----------------------------------------------------------------------------
  -- ADMIN 2: Irfan Khan (Irfan@jsct.com / Irfan@jsct.com)
  -- ----------------------------------------------------------------------------
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'Irfan@jsct.com') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      irfan_uid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'Irfan@jsct.com',
      crypt('Irfan@jsct.com', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Irfan Khan","role":"admin"}'::jsonb,
      now(),
      now()
    );
  ELSE
    SELECT id INTO irfan_uid FROM auth.users WHERE email = 'Irfan@jsct.com';
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('Irfan@jsct.com', gen_salt('bf')),
      raw_user_meta_data = '{"full_name":"Irfan Khan","role":"admin"}'::jsonb,
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
    WHERE id = irfan_uid;
  END IF;

  -- Upsert Irfan Khan in public.members
  INSERT INTO public.members (
    id,
    member_id,
    role,
    full_name,
    father_or_husband_name,
    dob,
    gender,
    marital_status,
    department,
    designation,
    mobile,
    email,
    state,
    district,
    block,
    pin_code,
    permanent_address,
    nominee_name,
    nominee_relation,
    nominee_age,
    nominee_mobile,
    transaction_id,
    payment_receipt_url,
    payment_status,
    photo_url,
    is_active,
    registration_date,
    lock_in_end_date
  ) VALUES (
    irfan_uid,
    'JSCT-ADMIN-002',
    'admin',
    'Irfan Khan',
    'Trustee Parent',
    '1988-08-20',
    'male',
    'married',
    'Trust Operations & Security',
    'Principal Security Officer',
    '9876543211',
    'Irfan@jsct.com',
    'Uttar Pradesh',
    'Lucknow',
    'Hazratganj',
    '226001',
    'JSCT Operations Wing, Hazratganj, Lucknow, UP',
    'Family Nominee',
    'Spouse',
    35,
    '9876543218',
    'ADMIN-INIT-002',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    'verified',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    true,
    now() - INTERVAL '1 year',
    now() - INTERVAL '6 months'
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    full_name = 'Irfan Khan',
    email = 'Irfan@jsct.com',
    payment_status = 'verified',
    is_active = true;

END $$;
