'use server';

import { getSupabaseAdminClient, Member } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export interface CsvMemberRow {
  full_name: string;
  mobile: string;
  father_or_husband_name?: string;
  dob?: string;
  gender?: string;
  marital_status?: string;
  department?: string;
  designation?: string;
  district?: string;
  block?: string;
  pin_code?: string;
  permanent_address?: string;
  nominee_name?: string;
  nominee_relation?: string;
  nominee_age?: string | number;
  nominee_mobile?: string;
  transaction_id?: string;
}

export interface ImportResult {
  success: boolean;
  totalParsed: number;
  importedCount: number;
  skippedCount: number;
  errors: string[];
  importedMembers: Partial<Member>[];
}

export async function bulkImportMembersAction(rows: CsvMemberRow[]): Promise<ImportResult> {
  const supabase = getSupabaseAdminClient();

  const result: ImportResult = {
    success: false,
    totalParsed: rows.length,
    importedCount: 0,
    skippedCount: 0,
    errors: [],
    importedMembers: [],
  };

  if (!rows || rows.length === 0) {
    result.errors.push('कोई वैध CSV डेटा प्रदान नहीं किया गया।');
    return result;
  }

  try {
    // 1. Fetch all existing mobiles and transaction IDs to skip duplicates
    const { data: existingRecords } = await supabase
      .from('members')
      .select('mobile, transaction_id');

    const existingMobiles = new Set((existingRecords || []).map((m) => m.mobile));
    const existingUtrs = new Set((existingRecords || []).map((m) => m.transaction_id));

    const toInsert = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // considering header as row 1

      // Validation
      const fullName = (row.full_name || '').trim();
      const rawMobile = (row.mobile || '').replace(/\D/g, '').slice(-10);

      if (!fullName) {
        result.errors.push(`पंक्ति ${rowNum}: पूरा नाम (full_name) अनुपस्थित है।`);
        result.skippedCount++;
        continue;
      }

      if (rawMobile.length !== 10) {
        result.errors.push(`पंक्ति ${rowNum} (${fullName}): अमान्य मोबाइल नंबर (${row.mobile || 'खाली'})।`);
        result.skippedCount++;
        continue;
      }

      if (existingMobiles.has(rawMobile)) {
        result.errors.push(`पंक्ति ${rowNum} (${fullName}): मोबाइल ${rawMobile} पहले से पंजीकृत है (छोड़ा गया)।`);
        result.skippedCount++;
        continue;
      }

      const utr = (row.transaction_id || '').trim() || `BULK-${rawMobile}-${Date.now().toString().slice(-4)}`;
      if (existingUtrs.has(utr)) {
        result.errors.push(`पंक्ति ${rowNum} (${fullName}): UTR ${utr} पहले से प्रयुक्त है (छोड़ा गया)।`);
        result.skippedCount++;
        continue;
      }

      const mockUserId = crypto.randomUUID();
      const regDate = new Date().toISOString();
      const lockInDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();

      toInsert.push({
        id: mockUserId,
        full_name: fullName,
        father_or_husband_name: (row.father_or_husband_name || 'अभिभावक').trim(),
        dob: row.dob || '1990-01-01',
        gender: (row.gender?.toLowerCase() === 'female' ? 'female' : 'male') as 'male' | 'female',
        marital_status: 'married' as const,
        department: (row.department || 'शिक्षा विभाग').trim(),
        designation: (row.designation || 'सहायक अध्यापक').trim(),
        mobile: rawMobile,
        email: `${rawMobile}@dpswt.com`,
        state: 'Uttar Pradesh',
        district: (row.district || 'Gorakhpur').trim(),
        block: (row.block || 'Sadar').trim(),
        pin_code: (row.pin_code || '273001').toString().slice(0, 6),
        permanent_address: (row.permanent_address || 'उत्तर प्रदेश').trim(),
        nominee_name: (row.nominee_name || 'आश्रित नॉमिनी').trim(),
        nominee_relation: (row.nominee_relation || 'जीवनसाथी').trim(),
        nominee_age: Number(row.nominee_age) || 30,
        nominee_mobile: (row.nominee_mobile || rawMobile).toString().slice(-10),
        transaction_id: utr,
        payment_receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        payment_status: 'verified' as const,
        photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        is_active: true,
        registration_date: regDate,
        lock_in_end_date: lockInDate,
      });

      existingMobiles.add(rawMobile);
      existingUtrs.add(utr);
    }

    if (toInsert.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from('members')
        .insert(toInsert)
        .select('id, member_id, full_name, mobile, district');

      if (insertError) {
        result.errors.push(`डेटाबेस बल्क इन्सर्ट त्रुटि: ${insertError.message}`);
      } else {
        result.importedCount = (inserted || []).length;
        result.importedMembers = inserted || [];
      }
    }

    result.success = result.importedCount > 0;
    revalidatePath('/console-secure-admin/dashboard');
    revalidatePath('/admin');
    return result;
  } catch (err: any) {
    result.errors.push(`प्रक्रियात्मक अपवाद: ${err.message}`);
    return result;
  }
}
