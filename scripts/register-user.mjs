import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ahxldlrxpejnyekeiajw.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function registerSuraj() {
  const memberId = '82902247-4200-4000-8000-829022474200';
  const membershipId = 'JSCT-UP-8290';
  const fullName = 'Suraj Kumar (सूरज कुमार)';
  const phone = '+91 82902 24742';
  const email = 'suraj.kumar@jsct.org.in';
  const cleanPhone = '8290224742';
  const last4 = '4742';
  
  // Default 12-digit Aadhaar placeholder matching phone digits: 8290 2247 4742
  const defaultAadhaar12 = '829022474742';
  const sha256 = crypto.createHash('sha256').update(defaultAadhaar12).digest('hex');

  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  console.log('Inserting/Upserting member into Supabase...');
  const { data: member, error: memberErr } = await supabase
    .from('members')
    .upsert({
      id: memberId,
      membership_id: membershipId,
      full_name: fullName,
      phone: phone,
      email: email,
      aadhaar_last4: last4,
      aadhaar_hash: sha256,
      department: 'सामान्य सदस्य (General Member)',
      district: 'Gorakhpur (गोरखपुर)',
      state: 'Uttar Pradesh',
      role: 'MEMBER',
      fee_expires_at: expiryDate.toISOString(),
      is_active: true,
      registration_utr: 'UTR-SUR8290224742',
      registration_slip_url: 'https://placehold.co/600x800/262421/FAF8F5?text=UTR+SUR8290224742',
    })
    .select()
    .single();

  if (memberErr) {
    console.error('Error inserting member:', memberErr);
    return;
  }
  console.log('✅ Member registered successfully in Supabase:', member);

  // Nominee insertion
  const { error: nomErr } = await supabase
    .from('nominees')
    .upsert({
      id: '82902247-4200-4000-8000-829022474201',
      member_id: memberId,
      full_name: 'पारिवारिक नॉमिनी (Nominee)',
      relationship: 'Family Member',
      nominee_age: 28,
      nominee_phone: phone,
      bank_name: 'State Bank of India',
      account_number: '829022474201',
      ifsc_code: 'SBIN0001000',
      upi_id: '8290224742@upi',
      is_primary: true,
    });

  if (nomErr) {
    console.warn('Nominee notice:', nomErr.message);
  } else {
    console.log('✅ Nominee record attached successfully');
  }
}

registerSuraj();
