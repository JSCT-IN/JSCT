import { createClient } from '@supabase/supabase-js';

import fs from 'fs';
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kghwzliszsfcmzhpcjpu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const admins = [
  {
    email: 'Ambrish@jsct.com',
    password: 'Ambrish@123',
    fullName: 'Ambrish Kumar',
    memberId: 'JSCT-ADMIN-001',
    mobile: '9876543210',
    designation: 'Chief Executive Administrator',
    department: 'Trust Administration',
    district: 'Gorakhpur',
    block: 'Sadar',
    state: 'Uttar Pradesh',
    pinCode: '273001',
    address: 'JSCT Central Office, Civil Lines, Gorakhpur, UP',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },
  {
    email: 'Irfan@jsct.com',
    password: 'Irfan@jsct.com',
    fullName: 'Irfan Khan',
    memberId: 'JSCT-ADMIN-002',
    mobile: '9876543211',
    designation: 'Principal Security Officer',
    department: 'Trust Operations & Security',
    district: 'Lucknow',
    block: 'Hazratganj',
    state: 'Uttar Pradesh',
    pinCode: '226001',
    address: 'JSCT Operations Wing, Hazratganj, Lucknow, UP',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  }
];

async function seedAdmins() {
  console.log('--- SEEDING ADMINISTRATOR ACCOUNTS ---');

  for (const admin of admins) {
    try {
      let userId;

      // 1. Check if user exists in auth.users
      const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) console.error('Error listing users:', listError);

      const existingUser = listData?.users?.find(
        (u) => u.email?.toLowerCase() === admin.email.toLowerCase()
      );

      if (existingUser) {
        userId = existingUser.id;
        console.log(`Found existing auth user for ${admin.email} (ID: ${userId}), updating password & metadata...`);
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: admin.password,
          email_confirm: true,
          user_metadata: {
            full_name: admin.fullName,
            role: 'admin',
          },
        });
        if (updateError) console.error(`Error updating user ${admin.email}:`, updateError);
      } else {
        console.log(`Creating new auth user for ${admin.email}...`);
        const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: admin.email,
          password: admin.password,
          email_confirm: true,
          user_metadata: {
            full_name: admin.fullName,
            role: 'admin',
          },
        });

        if (createError) {
          console.error(`Failed to create ${admin.email}:`, createError);
          continue;
        }
        userId = created.user.id;
        console.log(`Created auth user for ${admin.email} (ID: ${userId})`);
      }

      // 2. Upsert into public.members
      const now = new Date();
      const regDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
      const lockInEnd = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString();

      const { data: mem, error: memError } = await supabaseAdmin
        .from('members')
        .upsert(
          {
            id: userId,
            member_id: admin.memberId,
            role: 'admin',
            full_name: admin.fullName,
            father_or_husband_name: 'Senior Trustee Parent',
            dob: '1985-05-15',
            gender: 'male',
            marital_status: 'married',
            department: admin.department,
            designation: admin.designation,
            mobile: admin.mobile,
            email: admin.email,
            state: admin.state,
            district: admin.district,
            block: admin.block,
            pin_code: admin.pinCode,
            permanent_address: admin.address,
            nominee_name: 'Trust Nominee',
            nominee_relation: 'Spouse',
            nominee_age: 35,
            nominee_mobile: admin.mobile,
            transaction_id: `ADMIN-${admin.memberId}`,
            payment_receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
            payment_status: 'verified',
            photo_url: admin.photoUrl,
            is_active: true,
            registration_date: regDate,
            lock_in_end_date: lockInEnd,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
        .select();

      if (memError) {
        console.error(`Error upserting member record for ${admin.email}:`, memError);
      } else {
        console.log(`Successfully synced member record for ${admin.fullName} (${admin.email}) -> Role: admin, Active: true, Verified: true`);
      }
    } catch (e) {
      console.error(`Exception processing admin ${admin.email}:`, e);
    }
  }

  console.log('--- ADMIN SEEDING COMPLETED ---');
}

seedAdmins();
