'use server';

import { getSupabaseAdminClient, Member, WelfareClaim, WelfareScheme } from '@/lib/supabase';
import { verifyAdminServerGuard } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export interface AdminStats {
  totalMembers: number;
  activeMembers: number;
  pendingVerifications: number;
  pendingClaims: number;
  approvedDisbursements: number;
}

/**
 * Fetch all admin data using Service Role (strictly guarded by verifyAdminServerGuard)
 */
export async function getAdminDashboardData() {
  const guard = await verifyAdminServerGuard();
  if (!guard.authorized) {
    return {
      success: false,
      error: 'पहुंच अस्वीकृत: केवल अधिकृत व्यवस्थापक ही डेटा देख सकते हैं (Unauthorized).',
      members: [] as Member[],
      schemes: [] as WelfareScheme[],
      claims: [] as WelfareClaim[],
      stats: {
        totalMembers: 0,
        activeMembers: 0,
        pendingVerifications: 0,
        pendingClaims: 0,
        approvedDisbursements: 0,
      },
    };
  }

  const supabase = getSupabaseAdminClient();

  try {
    // 1. Fetch Members
    const { data: members, error: memError } = await supabase
      .from('members')
      .select('*')
      .order('registration_date', { ascending: false });

    if (memError) throw memError;

    // 2. Fetch Welfare Schemes
    const { data: schemes, error: schError } = await supabase
      .from('welfare_schemes')
      .select('*')
      .order('created_at', { ascending: true });

    if (schError) throw schError;

    // 3. Fetch Welfare Claims with member and scheme info
    const { data: claims, error: clmError } = await supabase
      .from('welfare_claims')
      .select('*, member:members(id, member_id, full_name, mobile, photo_url), scheme:welfare_schemes(id, name, max_coverage)')
      .order('created_at', { ascending: false });

    if (clmError) throw clmError;

    const memberList = (members || []) as Member[];
    const claimList = (claims || []) as WelfareClaim[];
    const schemeList = (schemes || []) as WelfareScheme[];

    const stats: AdminStats = {
      totalMembers: memberList.length,
      activeMembers: memberList.filter((m) => m.is_active).length,
      pendingVerifications: memberList.filter((m) => m.payment_status === 'pending').length,
      pendingClaims: claimList.filter((c) => c.status === 'pending').length,
      approvedDisbursements: claimList
        .filter((c) => c.status === 'approved')
        .reduce((sum, c) => sum + Number(c.claim_amount || 0), 0),
    };

    return {
      success: true,
      members: memberList,
      schemes: schemeList,
      claims: claimList,
      stats,
    };
  } catch (err: any) {
    console.error('[ADMIN GET DATA ERROR]:', err);
    return {
      success: false,
      error: err.message,
      members: [] as Member[],
      schemes: [] as WelfareScheme[],
      claims: [] as WelfareClaim[],
      stats: {
        totalMembers: 0,
        activeMembers: 0,
        pendingVerifications: 0,
        pendingClaims: 0,
        approvedDisbursements: 0,
      },
    };
  }
}

/**
 * Approve or Reject a Member's Payment Receipt
 */
export async function verifyMemberPaymentAction(
  memberId: string,
  approved: boolean,
  notes?: string
) {
  const guard = await verifyAdminServerGuard();
  if (!guard.authorized) {
    return {
      success: false,
      message: 'पहुंच अस्वीकृत: केवल अधिकृत व्यवस्थापक ही भुगतान सत्यापित कर सकते हैं (Unauthorized).',
    };
  }

  const supabase = getSupabaseAdminClient();

  try {
    const updatePayload: any = {
      payment_status: approved ? 'verified' : 'rejected',
      is_active: approved,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('members')
      .update(updatePayload)
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin');
    revalidatePath('/member-card');
    return {
      success: true,
      message: approved 
        ? 'सदस्य भुगतान व सदस्यता सफलतापूर्वक सत्यापित एवं सक्रिय कर दी गई है।' 
        : 'सदस्य भुगतान अस्वीकृत कर दिया गया है।',
      member: data as Member,
    };
  } catch (err: any) {
    console.error('[ADMIN VERIFY PAYMENT ERROR]:', err);
    return {
      success: false,
      message: err.message || 'सत्यापन प्रक्रिया में त्रुटि आई।',
    };
  }
}

/**
 * Update Welfare Claim Status (Approve / Reject)
 */
export async function updateClaimStatusAction(
  claimId: string,
  status: 'approved' | 'rejected',
  adminRemarks?: string
) {
  const guard = await verifyAdminServerGuard();
  if (!guard.authorized) {
    return {
      success: false,
      message: 'पहुंच अस्वीकृत: केवल अधिकृत व्यवस्थापक ही दावे की समीक्षा कर सकते हैं (Unauthorized).',
    };
  }

  const supabase = getSupabaseAdminClient();

  try {
    const updatePayload: any = {
      status,
      admin_remarks: adminRemarks || (status === 'approved' 
        ? 'सत्यापन अधिकारी द्वारा दावा स्वीकृत (Approved) किया गया।' 
        : 'आवश्यक पात्रता अथवा दस्तावेजों के अभाव में दावा अस्वीकृत (Rejected) किया गया।'),
      updated_at: new Date().toISOString(),
      disbursed_at: status === 'approved' ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from('welfare_claims')
      .update(updatePayload)
      .eq('id', claimId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin');
    revalidatePath('/member-card');
    return {
      success: true,
      message: status === 'approved' ? 'कल्याणकारी दावा स्वीकृत किया गया।' : 'कल्याणकारी दावा अस्वीकृत किया गया।',
      claim: data as WelfareClaim,
    };
  } catch (err: any) {
    console.error('[ADMIN UPDATE CLAIM ERROR]:', err);
    return {
      success: false,
      message: err.message || 'दावा समीक्षा अद्यतन में त्रुटि आई।',
    };
  }
}
