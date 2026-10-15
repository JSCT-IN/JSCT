'use server';

import { getSupabaseAdminClient, WelfareClaim } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export interface SubmitClaimInput {
  memberId: string;
  schemeId: string;
  claimAmount: number;
  supportingDocs: string[];
}

export async function submitWelfareClaimAction(input: SubmitClaimInput) {
  const supabase = getSupabaseAdminClient();

  try {
    // 1. Fetch member to check eligibility
    const { data: member, error: memError } = await supabase
      .from('members')
      .select('id, full_name, is_active, lock_in_end_date, registration_date')
      .eq('id', input.memberId)
      .single();

    if (memError || !member) {
      return {
        success: false,
        message: 'सदस्य रिकॉर्ड नहीं मिला।',
      };
    }

    if (!member.is_active) {
      return {
        success: false,
        message: 'आपका सदस्यता खाता अभी सत्यापन प्रतीक्षारत (Inactive) है। खाता सत्यापन के बाद ही दावा स्वीकार्य है।',
      };
    }

    // 2. Strict 6-Month Lock-in Check
    const lockInTime = new Date(member.lock_in_end_date).getTime();
    const nowTime = Date.now();

    if (nowTime < lockInTime) {
      const remainingDays = Math.ceil((lockInTime - nowTime) / (1000 * 60 * 60 * 24));
      const formattedDate = new Date(member.lock_in_end_date).toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return {
        success: false,
        message: `सख्त अनुपालन नियम: 6-माह की सदस्यता लॉक-इन अवधि अभी समाप्त नहीं हुई है। आप ${remainingDays} दिन बाद (${formattedDate}) दावा प्रस्तुत कर सकेंगे।`,
      };
    }

    // 3. Insert claim
    const { data: claim, error: insertError } = await supabase
      .from('welfare_claims')
      .insert({
        member_id: input.memberId,
        scheme_id: input.schemeId,
        claim_amount: input.claimAmount,
        supporting_docs: input.supportingDocs,
        status: 'pending',
        admin_remarks: 'सदस्य द्वारा पोर्टल से सहायता आवेदन दर्ज किया गया।',
      })
      .select()
      .single();

    if (insertError) {
      console.error('[SUBMIT CLAIM ERROR]:', insertError);
      return {
        success: false,
        message: `दावा पंजीकरण में समस्या आई: ${insertError.message}`,
      };
    }

    revalidatePath('/member-card');
    revalidatePath('/admin');
    return {
      success: true,
      message: `कल्याणकारी दावा सफलतापूर्वक दर्ज किया गया! सन्दर्भ संख्या: ${claim.id.slice(0, 8).toUpperCase()}`,
      claim: claim as WelfareClaim,
    };
  } catch (err: any) {
    console.error('[SUBMIT CLAIM EXCEPTION]:', err);
    return {
      success: false,
      message: err.message || 'दावा आवेदन प्रक्रिया में अप्रत्याशित समस्या आई।',
    };
  }
}
