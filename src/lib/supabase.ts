import { createClient } from '@supabase/supabase-js';

// Project: JSCT_2.0 (kghwzliszsfcmzhpcjpu)
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kghwzliszsfcmzhpcjpu.supabase.co';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnaHd6bGlzenNmY216aHBjanB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMDMxNTMsImV4cCI6MjEwNzU3OTE1M30.cA-p2cMUYsf3Kqq5eZgPVTPNTMexJUicEDFFaMhNBk0';
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * 1. Client-side Supabase Client (Browser Context)
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const getSupabaseBrowserClient = () => supabase;

/**
 * 2. Admin Service Role Client (Server-side Only)
 * Bypasses Row Level Security for admin workflows & atomic registration actions
 */
export function getSupabaseAdminClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// ==============================================================================
// TYPE-SAFE DATABASE ENTITIES
// ==============================================================================

export interface FamilyMemberItem {
  name: string;
  relation: string;
  age: number;
}

export interface Member {
  id: string;
  member_id: string;
  role: 'member' | 'admin';

  // Personal
  full_name: string;
  father_or_husband_name: string;
  mother_name?: string | null;
  dob: string;
  gender: 'male' | 'female' | 'other';
  blood_group?: string | null;
  marital_status: 'unmarried' | 'married' | 'widow' | 'separated' | 'divorced' | 'not_specified';
  department: string;
  designation: string;
  joining_date?: string | null;

  // Address & Contact
  mobile: string;
  email?: string | null;
  state: string;
  district: string;
  block: string;
  pin_code: string;
  permanent_address: string;

  // Nominee & Family
  nominee_name: string;
  nominee_relation: string;
  nominee_age: number;
  nominee_mobile: string;
  family_members: FamilyMemberItem[];

  // Payment & Transaction
  transaction_id: string;
  ration_card_id?: string | null;
  payment_receipt_url: string;
  payment_status: 'pending' | 'verified' | 'rejected';
  verified_by?: string | null;
  verified_at?: string | null;

  // Assets & Compliance
  photo_url: string;
  registration_date: string;
  lock_in_end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WelfareScheme {
  id: string;
  name: string;
  description: string;
  max_coverage: number;
  lock_in_months: number;
  is_active: boolean;
  created_at: string;
}

export interface WelfareClaim {
  id: string;
  member_id: string;
  scheme_id: string;
  claim_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  supporting_docs: string[];
  admin_remarks?: string | null;
  disbursed_at?: string | null;
  created_at: string;
  updated_at: string;
  member?: Member;
  scheme?: WelfareScheme;
}

// ==============================================================================
// STORAGE UPLOAD HELPERS
// ==============================================================================

/**
 * Upload headshot photo to public bucket 'member-photos'
 */
export async function uploadMemberPhoto(file: File, identifier: string): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const cleanId = identifier.replace(/[^a-zA-Z0-9]/g, '_');
  const filePath = `photos/${cleanId}_${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('member-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Member photo storage error, fallback to local URL:', error);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  const { data: publicData } = supabase.storage
    .from('member-photos')
    .getPublicUrl(data.path);

  return publicData.publicUrl;
}

/**
 * Upload payment receipt proof to secure bucket 'payment-receipts'
 */
export async function uploadPaymentReceipt(file: File, transactionId: string): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const cleanUtr = transactionId.replace(/[^a-zA-Z0-9]/g, '_');
  const filePath = `receipts/${cleanUtr}_${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('payment-receipts')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.warn('Payment receipt storage notice:', error);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  // Get signed URL or storage path
  const { data: signedData } = await supabase.storage
    .from('payment-receipts')
    .createSignedUrl(data.path, 60 * 60 * 24 * 365); // 1 year access

  return signedData?.signedUrl || data.path;
}

// Backward Compatibility Aliases for components and legacy pages
export type Profile = Member;
export type Scheme = WelfareScheme;
export const uploadReceiptSlip = uploadPaymentReceipt;
