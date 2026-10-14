'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DPSWTStore } from '@/lib/store';
import { triggerCelebrationConfetti } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { syncMemberToFirestore, getFirebaseAnalytics } from '@/lib/firebase';
import {
  HeartHandshake,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  User,
  CreditCard,
  Building,
  UploadCloud,
  FileCheck2,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  ArrowLeft
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { lang, t } = useTranslation();

  // Multi-step form: Step 1 (Personal & Profession), Step 2 (Nominee & Address), Step 3 (Fee UTR Slip)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Personal & Profession
  const [applicantName, setApplicantName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('MALE');
  const [maritalStatus, setMaritalStatus] = useState('MARRIED');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [occupation, setOccupation] = useState('GOVERNMENT_JOB');
  const [departmentName, setDepartmentName] = useState('Basic Education Department (बेसिक शिक्षा परिषद)');
  const [officeAddress, setOfficeAddress] = useState('');

  // Step 2: Address & Nominee
  const [stateName, setStateName] = useState('Uttar Pradesh');
  const [districtName, setDistrictName] = useState('Prayagraj');
  const [blockName, setBlockName] = useState('Bahariya (बहरिया)');
  const [addressFull, setAddressFull] = useState('');
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState('Wife (धर्मपत्नी)');
  const [nomineeAge, setNomineeAge] = useState('32');
  const [nomineeMobile, setNomineeMobile] = useState('');
  const [bankName, setBankName] = useState('State Bank of India');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');

  // Step 3: Registration Fee & Payment Proof
  const [transactionId, setTransactionId] = useState('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const trustUpiId = 'dpswt.trust@sbi';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(trustUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSlipFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aadhaarNumber.length < 12) {
      alert(lang === 'hi' ? 'कृपया 12-अंकों का वैध आधार नंबर दर्ज करें।' : 'Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    if (mobileNumber.length < 10) {
      alert(lang === 'hi' ? 'कृपया 10-अंकों का वैध मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomineeName.trim()) {
      alert(lang === 'hi' ? 'कृपया नामिनी का पूरा नाम दर्ज करें।' : 'Please enter nominee name.');
      return;
    }
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (transactionId.length < 12) {
      setErrorMessage(
        lang === 'hi'
          ? 'कृपया बैंक / UPI ऐप में प्रदर्शित पूर्ण 12-अंकीय UTR / Transaction ID दर्ज करें।'
          : 'Please enter the full 12-digit UTR transaction ID.'
      );
      return;
    }

    if (!declarationAccepted) {
      setErrorMessage(
        lang === 'hi'
          ? 'कृपया शपथ पत्र व नियमावली घोषणा को स्वीकार करें।'
          : 'Please accept the declaration to proceed.'
      );
      return;
    }

    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const generatedId = `JSCT-UP-${randomSuffix}`;
    const last4 = aadhaarNumber.slice(-4) || '9999';
    const formattedPhone = mobileNumber.startsWith('+91') ? mobileNumber : `+91 ${mobileNumber.trim()}`;

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
    let deterministicAadhaarHash = `hash_${cleanAadhaar}`;
    try {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(cleanAadhaar));
        deterministicAadhaarHash = Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
      }
    } catch {
      deterministicAadhaarHash = `hash_${cleanAadhaar}`;
    }

    try {
      const { supabase } = await import('@/lib/supabase/client');

      // Upload receipt file if provided
      let uploadedSlipUrl = `https://placehold.co/600x800/262421/FAF8F5?text=UTR+${transactionId}`;
      if (slipFile) {
        const ext = slipFile.name.split('.').pop() || 'jpg';
        const fileName = `registration_slips/${transactionId}_${Date.now()}.${ext}`;
        const { data: uploadData } = await supabase.storage
          .from('payment-slips')
          .upload(fileName, slipFile, { upsert: true });

        if (uploadData) {
          const { data: publicData } = supabase.storage.from('payment-slips').getPublicUrl(uploadData.path);
          uploadedSlipUrl = publicData.publicUrl;
        }
      }

      // 1. Insert into Supabase 'members'
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .insert({
          membership_id: generatedId,
          full_name: applicantName.trim(),
          father_name: fatherName.trim(),
          dob: dob || null,
          gender: gender,
          marital_status: maritalStatus,
          phone: formattedPhone,
          email: email.trim(),
          aadhaar_hash: deterministicAadhaarHash,
          aadhaar_last4: last4,
          occupation: occupation,
          department: departmentName,
          district: districtName,
          block_name: blockName,
          address_full: addressFull,
          state: stateName,
          role: 'MEMBER',
          registration_utr: transactionId.trim(),
          registration_slip_url: uploadedSlipUrl,
          fee_expires_at: expiryDate.toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (memberError) {
        console.warn('Supabase member insert notice:', memberError.message);
      }

      const newMemberId = memberData?.id || `usr_${Date.now()}`;

      // 2. Insert into Supabase 'nominees'
      const { error: nomineeError } = await supabase
        .from('nominees')
        .insert({
          member_id: newMemberId,
          full_name: nomineeName.trim(),
          relationship: nomineeRelation,
          nominee_age: parseInt(nomineeAge) || 30,
          nominee_phone: nomineeMobile.trim(),
          bank_name: bankName,
          account_number: accountNumber.trim(),
          ifsc_code: ifscCode.toUpperCase().trim(),
          upi_id: upiId.toLowerCase().trim(),
          is_primary: true,
        });

      if (nomineeError) {
        console.warn('Supabase nominee insert notice:', nomineeError.message);
      }

      // 3. Fallback Local Storage update
      DPSWTStore.registerMember({
        membership_id: generatedId,
        full_name: applicantName,
        phone: formattedPhone,
        aadhaar_last4: last4,
        department: departmentName,
        district: districtName,
        state: stateName,
        role: 'MEMBER',
        fee_expires_at: expiryDate.toISOString(),
        is_active: true,
        nominee: {
          id: `nom-${Date.now()}`,
          member_id: newMemberId,
          full_name: nomineeName,
          relationship: nomineeRelation,
          bank_name: bankName,
          account_number: accountNumber,
          ifsc_code: ifscCode.toUpperCase(),
          upi_id: upiId.toLowerCase(),
        },
      });

      // 4. Synchronize with Firebase Firestore & Analytics
      try {
        await syncMemberToFirestore({
          id: newMemberId,
          membership_id: generatedId,
          full_name: applicantName.trim(),
          phone: formattedPhone,
          email: email.trim(),
          aadhaar_last4: last4,
          aadhaar_hash: deterministicAadhaarHash,
          department: departmentName,
          district: districtName,
          state: stateName,
          status: 'ACTIVE',
        });

        const analytics = await getFirebaseAnalytics();
        if (analytics) {
          const { logEvent } = await import('firebase/analytics');
          logEvent(analytics, 'sign_up', {
            method: 'aadhaar_registration',
            membership_id: generatedId,
          });
        }
      } catch (fbErr) {
        console.warn('Firebase registration sync notice:', fbErr);
      }

      triggerCelebrationConfetti();
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Registration submit error:', err);
      // Fallback
      DPSWTStore.registerMember({
        membership_id: generatedId,
        full_name: applicantName,
        phone: formattedPhone,
        aadhaar_last4: last4,
        department: departmentName,
        district: districtName,
        state: stateName,
        role: 'MEMBER',
        fee_expires_at: expiryDate.toISOString(),
        is_active: true,
        nominee: {
          id: `nom-${Date.now()}`,
          member_id: '',
          full_name: nomineeName,
          relationship: nomineeRelation,
          bank_name: bankName,
          account_number: accountNumber,
          ifsc_code: ifscCode.toUpperCase(),
          upi_id: upiId.toLowerCase(),
        },
      });

      // Sync fallback to Firebase Firestore as well
      try {
        await syncMemberToFirestore({
          membership_id: generatedId,
          full_name: applicantName.trim(),
          phone: formattedPhone,
          email: email.trim(),
          aadhaar_last4: last4,
          aadhaar_hash: deterministicAadhaarHash,
          department: departmentName,
          district: districtName,
          state: stateName,
          status: 'ACTIVE',
        });
      } catch (fbErr) {
        console.warn('Firebase fallback sync notice:', fbErr);
      }

      triggerCelebrationConfetti();
      router.push('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const occupationsList = [
    { label: 'Government Job (शासकीय सेवा)', value: 'GOVERNMENT_JOB' },
    { label: 'Private Job (निजी क्षेत्र)', value: 'PRIVATE_JOB' },
    { label: 'Business (व्यवसाय)', value: 'BUSINESS' },
    { label: 'Agriculture (कृषि)', value: 'AGRICULTURE' },
    { label: 'Contract Worker (संविदा कर्मी)', value: 'CONTRACT_WORKERS' },
    { label: 'Other (अन्य)', value: 'OTHER' },
  ];

  const upDistricts = [
    'Prayagraj', 'Lucknow', 'Varanasi', 'Kanpur Nagar', 'Gorakhpur',
    'Bareilly', 'Agra', 'Meerut', 'Aligarh', 'Moradabad', 'Ayodhya',
    'Jhansi', 'Azamgarh', 'Saharanpur', 'Basti', 'Mirzapur', 'Ghazipur'
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-14 space-y-8">
      {/* Brand & Editorial Banner */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-terracotta to-terracotta-hover text-white flex items-center justify-center mx-auto shadow-warm">
          <HeartHandshake className="w-6 h-6 stroke-[2.2]" />
        </div>
        <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-charcoal">
          {lang === 'hi' ? 'सदस्य पंजीकरण फॉर्म' : 'Member Registration'}
        </h1>
        <p className="text-xs sm:text-sm text-driftwood max-w-lg mx-auto">
          {lang === 'hi'
            ? 'जन सेवा चैरिटेबल ट्रस्ट (JSCT) - जन से जन तक, सहयोग हर जरूरतमंद तक'
            : 'JSCT Mutual Welfare Solidarity Platform - Direct ₹50 Mutual Support Network'}
        </p>

        {/* 3-Step Indicator matching dpswt.com flow */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-3">
          <div className="flex items-center gap-1.5">
            <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${step >= 1 ? 'bg-terracotta text-white' : 'bg-stone-border text-driftwood'}`}>
              1
            </span>
            <span className="text-[11px] font-semibold text-charcoal hidden sm:inline">
              {lang === 'hi' ? 'व्यक्तिगत व सेवा' : 'Personal & Job'}
            </span>
          </div>

          <span className="w-4 sm:w-10 h-0.5 bg-stone-border" />

          <div className="flex items-center gap-1.5">
            <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${step >= 2 ? 'bg-terracotta text-white' : 'bg-stone-border text-driftwood'}`}>
              2
            </span>
            <span className="text-[11px] font-semibold text-charcoal hidden sm:inline">
              {lang === 'hi' ? 'नामिनी व पता' : 'Nominee & Address'}
            </span>
          </div>

          <span className="w-4 sm:w-10 h-0.5 bg-stone-border" />

          <div className="flex items-center gap-1.5">
            <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${step === 3 ? 'bg-terracotta text-white' : 'bg-stone-border text-driftwood'}`}>
              3
            </span>
            <span className="text-[11px] font-semibold text-charcoal hidden sm:inline">
              {lang === 'hi' ? 'अंशदान व शपथ' : 'Fee & Declaration'}
            </span>
          </div>
        </div>
      </div>

      {/* Trust Registration Fee Info Card */}
      <div className="bg-gradient-to-br from-white via-canvas-inset to-white p-4 sm:p-6 rounded-3xl border border-stone-border shadow-warm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-terracotta/10 text-terracotta text-[10px] font-bold uppercase tracking-wider">
              <span>वार्षिक सदस्यता अंशदान: ₹50 मात्र</span>
            </div>
            <h3 className="font-editorial text-base sm:text-lg font-bold text-charcoal">
              JSCT ट्रस्ट आधिकारिक खाता
            </h3>
            <p className="text-xs text-driftwood">
              UPI ID: <span className="font-mono font-bold text-charcoal">{trustUpiId}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyUpi}
              className="px-3 py-2 rounded-xl bg-white border border-stone-border text-xs font-semibold text-charcoal hover:bg-canvas-inset flex items-center gap-1.5 shadow-xs touch-target"
            >
              {copiedUpi ? <Check className="w-3.5 h-3.5 text-sage" /> : <Copy className="w-3.5 h-3.5 text-driftwood" />}
              <span>{copiedUpi ? 'UPI कॉपी हो गया' : 'Copy UPI'}</span>
            </button>

            <div className="w-14 h-14 bg-white p-1 rounded-xl border border-stone-border shadow-xs flex items-center justify-center text-charcoal">
              <QrCode className="w-11 h-11 text-charcoal stroke-[1.8]" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Registration Form Container */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-border shadow-warm">
        
        {/* ============================================================== */}
        {/* STEP 1: Personal & Occupation Information                      */}
        {/* ============================================================== */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-border/60 text-xs font-bold uppercase tracking-wider text-charcoal font-mono">
              <User className="w-4 h-4 text-terracotta" />
              <span>चरण 1: आवेदक का व्यक्तिगत व सेवा विवरण</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  पूरा नाम (आधार कार्ड के अनुसार) *
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="उदा. रमेश चंद्र वर्मा"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  पिता अथवा पति का नाम *
                </label>
                <input
                  type="text"
                  required
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="उदा. स्वर्गीय कैलाश नाथ वर्मा"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  12-अंकीय आधार नंबर *
                </label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="1234 5678 9012"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  जन्म तिथि (DOB) *
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  लिंग (Gender) *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
                >
                  <option value="MALE">पुरुष (Male)</option>
                  <option value="FEMALE">महिला (Female)</option>
                  <option value="OTHER">अन्य (Other)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  मोबाइल नंबर (WhatsApp सक्षम) *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal font-mono focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  ईमेल आईडी (वैकल्पिक)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh.verma@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
                />
              </div>
            </div>

            {/* Occupation Radio list matching dpswt.com */}
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                व्यवसाय / पद (Occupation) *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {occupationsList.map((occ) => (
                  <label
                    key={occ.value}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center gap-2 transition-all ${
                      occupation === occ.value
                        ? 'border-terracotta bg-terracotta/5 font-bold text-terracotta'
                        : 'border-stone-border bg-canvas-inset/30 text-charcoal hover:bg-canvas-inset'
                    }`}
                  >
                    <input
                      type="radio"
                      name="occupation"
                      value={occ.value}
                      checked={occupation === occ.value}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="text-terracotta focus:ring-terracotta"
                    />
                    <span className="text-[11px] leading-tight">{occ.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                विभाग / संस्थान का नाम *
              </label>
              <input
                type="text"
                required
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder="उदा. बेसिक शिक्षा परिषद / उत्तर प्रदेश पुलिस"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-terracotta to-terracotta-hover text-white font-bold text-xs shadow-warm hover:shadow-warm-md flex items-center justify-center gap-2 mt-4 touch-target"
            >
              <span>अगला चरण: नामिनी व पता विवरण</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ============================================================== */}
        {/* STEP 2: Nominee & Address Details                              */}
        {/* ============================================================== */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-border/60">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal font-mono">
                <CreditCard className="w-4 h-4 text-sage" />
                <span>चरण 2: नामिनी व पता विवरण</span>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-driftwood hover:text-charcoal flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>पिछला</span>
              </button>
            </div>

            {/* Address Block */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">राज्य (State) *</label>
                <input
                  type="text"
                  readOnly
                  value={stateName}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-canvas-inset text-xs text-charcoal font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">जिला (District) *</label>
                <select
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal"
                >
                  {upDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">विकास खंड / तहसील *</label>
                <input
                  type="text"
                  required
                  value={blockName}
                  onChange={(e) => setBlockName(e.target.value)}
                  placeholder="उदा. बहरिया / सदर"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">स्थायी निवास पता *</label>
              <textarea
                required
                rows={2}
                value={addressFull}
                onChange={(e) => setAddressFull(e.target.value)}
                placeholder="मकान संख्या, मोहल्ला/ग्राम, पोस्ट ऑफिस, पिन कोड"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal"
              />
            </div>

            {/* Nominee Details Sub-Card */}
            <div className="p-4 rounded-2xl bg-canvas-inset/50 border border-stone-border space-y-3">
              <div className="text-xs font-bold text-terracotta uppercase tracking-wider font-mono">
                नामिनी (Nominee) विवरण
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">नामिनी का नाम *</label>
                  <input
                    type="text"
                    required
                    value={nomineeName}
                    onChange={(e) => setNomineeName(e.target.value)}
                    placeholder="उदा. मीना वर्मा"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-charcoal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">संबंध (Relation) *</label>
                  <select
                    value={nomineeRelation}
                    onChange={(e) => setNomineeRelation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-charcoal"
                  >
                    <option value="Wife (धर्मपत्नी)">Wife (धर्मपत्नी)</option>
                    <option value="Husband (पति)">Husband (पति)</option>
                    <option value="Son (सुपुत्र)">Son (सुपुत्र)</option>
                    <option value="Daughter (सुपुत्री)">Daughter (सुपुत्री)</option>
                    <option value="Mother (माता जी)">Mother (माता जी)</option>
                    <option value="Father (पिता जी)">Father (पिता जी)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">नामिनी की आयु *</label>
                  <input
                    type="number"
                    value={nomineeAge}
                    onChange={(e) => setNomineeAge(e.target.value)}
                    placeholder="32"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-charcoal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">बैंक का नाम *</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-charcoal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">खाता संख्या (Account No) *</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="30492817482"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-charcoal font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">IFSC Code *</label>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="SBIN0001248"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-charcoal font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">नामिनी UPI ID *</label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                    placeholder="meena.verma@sbi"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-charcoal font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-2xl bg-canvas-inset border border-stone-border text-xs font-semibold text-charcoal hover:bg-canvas-card"
              >
                पिछला
              </button>

              <button
                type="submit"
                className="w-2/3 py-3.5 rounded-2xl bg-gradient-to-r from-terracotta to-terracotta-hover text-white font-bold text-xs shadow-warm hover:shadow-warm-md flex items-center justify-center gap-2"
              >
                <span>अगला चरण: अंशदान रसीद व शपथ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* STEP 3: Fee Payment Slip & Declaration (Final Submit)          */}
        {/* ============================================================== */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-border/60">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal font-mono">
                <FileCheck2 className="w-4 h-4 text-terracotta" />
                <span>चरण 3: ₹50 सदस्यता अंशदान रसीद व शपथ पत्र</span>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-driftwood hover:text-charcoal flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>पिछला</span>
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-terracotta-light border border-terracotta/20 text-terracotta text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                बैंक / UPI 12-अंकीय UTR / Transaction ID *
              </label>
              <input
                type="text"
                required
                maxLength={12}
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
                placeholder="उदा. 402918274019"
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs font-mono font-bold tracking-widest text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
              />
              <p className="text-[11px] text-driftwood mt-1">
                GPay, PhonePe, या PayTM रसीद पर प्रदर्शित 12 अंकों का UTR नंबर दर्ज करें।
              </p>
            </div>

            {/* Slip Screenshot Upload */}
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                भुगतान स्क्रीनशॉट / रसीद अपलोड (Payment Receipt)
              </label>
              <div className="border-2 border-dashed border-stone-border rounded-2xl p-5 text-center bg-canvas-inset/40 hover:bg-canvas-inset/70 transition-colors">
                {previewUrl ? (
                  <div className="space-y-2">
                    <img src={previewUrl} alt="Receipt preview" className="max-h-40 mx-auto rounded-xl shadow-xs" />
                    <p className="text-xs text-sage font-semibold">रसीद सफलतापूर्वक चयनित!</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <UploadCloud className="w-8 h-8 text-driftwood mx-auto" />
                    <div className="text-xs text-charcoal font-medium">रसीद की फोटो चुनें या यहाँ खींचें</div>
                    <div className="text-[10px] text-driftwood">PNG, JPG 5MB तक</div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-3 block w-full text-xs text-driftwood file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-terracotta file:text-white hover:file:bg-terracotta-hover cursor-pointer"
                />
              </div>
            </div>

            {/* Official DPSWT Declaration Checkbox */}
            <div className="p-4 rounded-2xl bg-canvas-inset border border-stone-border/80">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-terracotta rounded border-stone-300 focus:ring-terracotta cursor-pointer"
                />
                <span className="text-[11px] text-charcoal leading-relaxed">
                  <strong>शपथ पत्र व घोषणा:</strong> मैं प्रमाणित करता/करती हूँ कि मेरे द्वारा दी गई समस्त जानकारी सत्य है। मैं DPSWT के नियमों व 75% अनुपालन शर्त का निष्ठापूर्वक पालन करूँगा/करूँगी। आपातकाल में साथी सदस्यों को ₹50 का सीधा सहयोग करने हेतु प्रतिबद्ध हूँ।
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-3 rounded-2xl bg-canvas-inset border border-stone-border text-xs font-semibold text-charcoal hover:bg-canvas-card"
              >
                पिछला
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !declarationAccepted}
                className="w-2/3 py-4 rounded-2xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-xs shadow-warm-md hover:shadow-warm-lg disabled:opacity-50 flex items-center justify-center gap-2 touch-target"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>पंजीकरण पूर्ण करें (Complete Registration)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
