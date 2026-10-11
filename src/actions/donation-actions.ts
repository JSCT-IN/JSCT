'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface SubmitDonationResult {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * Server action to validate UTR, upload receipt slip to Supabase Storage ('payment-slips'),
 * insert donation record, and update the appeal's collected amount.
 */
export async function submitDonationAction(formData: FormData): Promise<SubmitDonationResult> {
  try {
    const appealId = formData.get('appeal_id') as string;
    const donorId = (formData.get('donor_id') as string) || 'a1111111-1111-1111-1111-111111111111';
    const utrNumber = formData.get('utr_number') as string;
    const amount = parseFloat((formData.get('amount') as string) || '50.00');
    const slipFile = formData.get('slip_file') as File | null;

    if (!appealId || !utrNumber) {
      return { success: false, message: 'आवश्यक विवरण (Appeal ID या UTR) अनुपलब्ध हैं।' };
    }

    // Validate 12-digit numeric UTR format
    const utrRegex = /^\d{12}$/;
    if (!utrRegex.test(utrNumber.trim())) {
      return {
        success: false,
        message: 'अमान्य UTR क्रमांक! UTR ठीक 12 अंकों का वैध संख्यात्मक नंबर होना चाहिए।',
      };
    }

    const supabase = createServerClient();

    // Check for duplicate UTR number in donation_records
    const { data: existingRecord } = await supabase
      .from('donation_records')
      .select('id, utr_number')
      .eq('utr_number', utrNumber.trim())
      .single();

    if (existingRecord) {
      return {
        success: false,
        message: `यह UTR क्रमांक (${utrNumber}) पहले ही पोर्टल पर दर्ज किया जा चुका है!`,
      };
    }

    // Handle payment slip file upload
    let slipUrl = '';
    if (slipFile && slipFile.size > 0) {
      const arrayBuffer = await slipFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const ext = slipFile.name.split('.').pop() || 'jpg';
      const fileName = `slips/${utrNumber}_${Date.now()}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-slips')
        .upload(fileName, buffer, {
          contentType: slipFile.type || 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload Error:', uploadError);
        // Fallback check in case bucket was named donation-slips
        const { data: altData, error: altError } = await supabase.storage
          .from('donation-slips')
          .upload(fileName, buffer, {
            contentType: slipFile.type || 'image/jpeg',
            upsert: true,
          });
        if (altError) {
          return { success: false, message: `रसीद अपलोड त्रुटि: ${uploadError.message}` };
        }
        const { data: publicData } = supabase.storage.from('donation-slips').getPublicUrl(altData.path);
        slipUrl = publicData.publicUrl;
      } else {
        const { data: publicData } = supabase.storage.from('payment-slips').getPublicUrl(uploadData.path);
        slipUrl = publicData.publicUrl;
      }
    } else {
      slipUrl = `https://placehold.co/600x800/262421/FAF8F5?text=UTR+${utrNumber}`;
    }

    // Insert donation record with SUBMITTED status
    const { data: insertedRecord, error: insertError } = await supabase
      .from('donation_records')
      .insert({
        appeal_id: appealId,
        donor_id: donorId,
        amount: amount,
        utr_number: utrNumber.trim(),
        slip_url: slipUrl,
        status: 'SUBMITTED',
      })
      .select()
      .single();

    if (insertError) {
      return { success: false, message: `डेटाबेस प्रविष्टि त्रुटि: ${insertError.message}` };
    }

    // Increment appeal collected_amount
    const { data: currentAppeal } = await supabase
      .from('appeals')
      .select('collected_amount')
      .eq('id', appealId)
      .single();

    if (currentAppeal) {
      const newAmount = (Number(currentAppeal.collected_amount) || 0) + amount;
      await supabase
        .from('appeals')
        .update({ collected_amount: newAmount })
        .eq('id', appealId);
    }

    revalidatePath('/appeals');
    revalidatePath(`/appeals/${appealId}`);
    revalidatePath('/dashboard');
    revalidatePath('/admin/inspector');

    return {
      success: true,
      message: 'सहयोग रसीद व UTR सफलतापूर्वक दर्ज हो गया है!',
      data: insertedRecord,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'अज्ञात त्रुटि उत्पन्न हुई।',
    };
  }
}

/**
 * Server action for District Inspector to verify or reject a donation
 */
export async function updateDonationStatusAction(
  donationId: string,
  newStatus: 'VERIFIED' | 'REJECTED',
  inspectorNotes?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const supabase = createServerClient();

    const { error } = await supabase
      .from('donation_records')
      .update({
        status: newStatus,
        inspector_notes: inspectorNotes || null,
        verified_at: new Date().toISOString(),
      })
      .eq('id', donationId);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath('/admin/inspector');
    revalidatePath('/dashboard');
    return { success: true, message: `स्थिति को ${newStatus} में अद्यतन किया गया।` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
