-- ============================================================================
-- DPSWT Platform - Comprehensive Mock Seed Data for Demonstration
-- ============================================================================

-- Note: In production Supabase, UUIDs correspond to auth.users.
-- For direct SQL testing, we insert mock member rows.

INSERT INTO public.members (
    id, membership_id, full_name, phone, aadhaar_hash, aadhaar_last4,
    department, district, state, role, fee_expires_at, is_active
) VALUES
(
    'a1111111-1111-1111-1111-111111111111', 'DPSWT-UP-9042', 'Ramesh Chandra Verma',
    '+919876543210', 'hash_sha256_8291', '4129', 'Secondary Education Dept',
    'Prayagraj', 'Uttar Pradesh', 'MEMBER', now() + interval '8 months', true
),
(
    'a2222222-2222-2222-2222-222222222222', 'DPSWT-UP-1024', 'Smt. Shanti Devi',
    '+919876543211', 'hash_sha256_1042', '9812', 'Revenue Department',
    'Lucknow', 'Uttar Pradesh', 'MEMBER', now() + interval '11 months', true
),
(
    'a3333333-3333-3333-3333-333333333333', 'DPSWT-UP-0058', 'Inspector Arvind Kumar Singh',
    '+919450123456', 'hash_sha256_5521', '7634', 'DPSWT Verification Cell',
    'Varanasi', 'Uttar Pradesh', 'INSPECTOR', now() + interval '12 months', true
),
(
    'a4444444-4444-4444-4444-444444444444', 'DPSWT-ADMIN-01', 'Dr. Alok Nath Tripathi',
    '+919415000001', 'hash_sha256_9901', '3301', 'DPSWT Central Advisory',
    'Kanpur', 'Uttar Pradesh', 'ADMIN', now() + interval '24 months', true
),
(
    'a5555555-5555-5555-5555-555555555555', 'DPSWT-UP-7814', 'Late Surendra Yadav (Family)',
    '+919792001122', 'hash_sha256_3102', '1256', 'Irrigation & Water Resources',
    'Gorakhpur', 'Uttar Pradesh', 'MEMBER', now() + interval '2 months', true
),
(
    'a6666666-6666-6666-6666-666666666666', 'DPSWT-UP-4521', 'Rajesh Kumar Saxena',
    '+919839445566', 'hash_sha256_7718', '5543', 'Health & Family Welfare',
    'Bareilly', 'Uttar Pradesh', 'MEMBER', now() + interval '6 months', true
)
ON CONFLICT (id) DO NOTHING;

-- Nominees
INSERT INTO public.nominees (
    id, member_id, full_name, relationship, bank_name, account_number, ifsc_code, upi_id, is_primary
) VALUES
(
    'b1111111-1111-1111-1111-111111111111', 'a5555555-5555-5555-5555-555555555555',
    'Smt. Meena Yadav', 'Wife', 'State Bank of India', '30492817482', 'SBIN0001248',
    'meena.yadav92@sbi', true
),
(
    'b2222222-2222-2222-2222-222222222222', 'a6666666-6666-6666-6666-666666666666',
    'Km. Pooja Saxena', 'Daughter', 'Punjab National Bank', '019200010049281', 'PUNB0019200',
    'pooja.saxena@pnb', true
)
ON CONFLICT (id) DO NOTHING;

-- Active & Historical Appeals
INSERT INTO public.appeals (
    id, code, member_id, type, title, description, target_amount, collected_amount,
    status, inspector_name, inspector_phone, inspector_notes, event_date, nominee_snapshot
) VALUES
(
    'c1111111-1111-1111-1111-111111111111',
    'DPSWT-2026-B081',
    'a5555555-5555-5555-5555-555555555555',
    'BEREAVEMENT',
    'आकस्मिक निधन: स्वर्गीय सुरेंद्र यादव जी के आश्रित परिवार को संबल सहायता',
    'गोरखपुर मंडल के सिंचन विभाग में कार्यरत श्री सुरेंद्र यादव जी का 28 सितंबर को हृदयगति रुकने से निधन हुआ। परिवार में वृद्ध माता, पत्नी मीना यादव और 2 नाबालिग बच्चे हैं। जिला सत्यापन दल द्वारा भौतिक सत्यापन पूर्ण कर लिया गया है। सभी साथी सीधे बैंक खाते अथवा UPI में ₹50 सहयोग प्रेषित करें।',
    2000000.00,
    1482950.00,
    'ACTIVE',
    'अरविंद कुमार सिंह (क्षेत्रीय निरीक्षक, गोरखपुर-वाराणसी मंडल)',
    '+919450123456',
    'मृत्यु प्रमाणपत्र क्रमांक DMC/2026/90218 तथा बैंक पासबुक का भौतिक मिलान पूर्ण। खाता सक्रिय है।',
    '2026-09-28',
    '{"full_name": "Smt. Meena Yadav", "relationship": "Wife", "bank_name": "State Bank of India", "account_number": "30492817482", "ifsc_code": "SBIN0001248", "upi_id": "meena.yadav92@sbi"}'::jsonb
),
(
    'c2222222-2222-2222-2222-222222222222',
    'DPSWT-2026-M043',
    'a6666666-6666-6666-6666-666666666666',
    'DAUGHTER_MARRIAGE',
    'पुत्री वैवाहिक संबल: सुपुत्री पूजा सक्सेना के शुभ विवाह हेतु समुदाय सहयोग',
    'बरेली जनपद के स्वास्थ्य विभाग में चतुर्थ श्रेणी कर्मचारी श्री राजेश सक्सेना की ज्येष्ठ सुपुत्री पूजा का शुभ विवाह 24 नवंबर 2026 को तय हुआ है। न्यूनतम 75% अनुपालन वाले नियमित सदस्य परिवार को कल्याण नियमावली के अंतर्गत ₹50 प्रति सदस्य सहयोग आमंत्रित है।',
    500000.00,
    384500.00,
    'ACTIVE',
    'सत्य प्रकाश मिश्रा (जिला नोडल अधिकारी, बरेली)',
    '+919839112233',
    'विवाह निमंत्रण पत्र एवं कन्या के बैंक विवरण का सत्यापन संपन्न।',
    '2026-11-24',
    '{"full_name": "Km. Pooja Saxena", "relationship": "Daughter", "bank_name": "Punjab National Bank", "account_number": "019200010049281", "ifsc_code": "PUNB0019200", "upi_id": "pooja.saxena@pnb"}'::jsonb
),
(
    'c3333333-3333-3333-3333-333333333333',
    'DPSWT-2026-B079',
    'a1111111-1111-1111-1111-111111111111',
    'BEREAVEMENT',
    'दिवंगत शिक्षक राम प्रकाश त्रिपाठी के शोकाकुल परिवार को पूर्ण सहायता',
    'प्रयागराज के राजकीय इंटर कॉलेज के सहायक अध्यापक स्वर्गीय राम प्रकाश त्रिपाठी जी के आकस्मिक निधन पर 40,000 साथियों द्वारा पूर्ण ₹20,00,000 की सहयोग राशि सीधे नामिनी के खाते में पहुंचाई गई।',
    2000000.00,
    2000000.00,
    'CLOSED',
    'राज किशोर गुप्त (प्रभारी निरीक्षक, प्रयागराज)',
    '+919415443322',
    'लक्ष्य शत-प्रतिशत पूर्ण। नामिनी पासबुक में सभी प्रविष्टियों का सत्यापन समाप्त। अपील सफलतापूर्वक बंद की गई।',
    '2026-08-15',
    '{"full_name": "Smt. Saroj Tripathi", "relationship": "Wife", "bank_name": "Bank of Baroda", "account_number": "04920100039201", "ifsc_code": "BARB0ALLAHA", "upi_id": "saroj.tripathi@barodampay"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
