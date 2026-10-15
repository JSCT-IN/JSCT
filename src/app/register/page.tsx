'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  registerEnterpriseMemberAction 
} from '@/actions/member-actions';
import { 
  uploadMemberPhoto, 
  uploadPaymentReceipt, 
  Member 
} from '@/lib/supabase';
import MemberCard from '@/components/MemberCard';
import {
  HeartHandshake,
  User,
  ShieldCheck,
  Building,
  UploadCloud,
  FileCheck2,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Camera,
  CheckCircle2,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Phone,
  QrCode
} from 'lucide-react';

// Form Validation Schema using Zod
const registerSchema = z.object({
  // Personal & Job
  fullName: z.string().min(3, 'पूरा नाम कम से कम 3 अक्षरों का होना चाहिए'),
  fatherOrHusbandName: z.string().min(3, 'पिता/पति का नाम अनिवार्य है'),
  motherName: z.string().optional(),
  dob: z.string().min(1, 'जन्म तिथि अनिवार्य है'),
  gender: z.enum(['male', 'female', 'other']),
  bloodGroup: z.string().optional(),
  maritalStatus: z.enum(['unmarried', 'married', 'widow', 'separated', 'divorced', 'not_specified']),
  department: z.string().min(2, 'विभाग का नाम अनिवार्य है'),
  designation: z.string().min(2, 'पदनाम अनिवार्य है'),
  joiningDate: z.string().optional(),

  // Location & Contact
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'कृपया 10-अंकीय वैध भारतीय मोबाइल नंबर दर्ज करें'),
  email: z.string().email('कृपया वैध ईमेल दर्ज करें').optional().or(z.literal('')),
  state: z.string().default('Uttar Pradesh'),
  district: z.string().min(2, 'जनपद का नाम अनिवार्य है'),
  block: z.string().min(2, 'ब्लॉक/तहसील का नाम अनिवार्य है'),
  pinCode: z.string().regex(/^\d{6}$/, 'कृपया 6-अंकीय पिन कोड दर्ज करें'),
  permanentAddress: z.string().min(5, 'पूरा स्थायी पता दर्ज करें'),

  // Nominee & Family
  nomineeName: z.string().min(3, 'नामिनी का पूरा नाम अनिवार्य है'),
  nomineeRelation: z.string().min(2, 'नामिनी से संबंध अनिवार्य है'),
  nomineeAge: z.coerce.number().min(18, 'नामिनी की आयु न्यूनतम 18 वर्ष होनी चाहिए'),
  nomineeMobile: z.string().regex(/^[6-9]\d{9}$/, 'नामिनी का वैध 10-अंकीय मोबाइल नंबर दर्ज करें'),
  familyMembers: z.array(
    z.object({
      name: z.string().min(2, 'नाम दर्ज करें'),
      relation: z.string().min(2, 'संबंध दर्ज करें'),
      age: z.coerce.number().min(1, 'आयु दर्ज करें'),
    })
  ).default([]),

  // Payment Proof
  transactionId: z.string().min(8, 'कृपया 12-अंकीय बैंक UTR / Transaction ID दर्ज करें'),
  rationCardId: z.string().optional(),

  // Credentials & Consent
  password: z.string().min(6, 'पासवर्ड न्यूनतम 6 अक्षरों का होना चाहिए'),
  confirmPassword: z.string().min(6, 'पासवर्ड पुष्टि अनिवार्य है'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'कृपया ट्रस्ट नियमावली व 6-माह लॉक-इन सहमति स्वीकार करें',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'पासवर्ड और पासवर्ड पुष्टि मेल नहीं खाते',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [registeredMember, setRegisteredMember] = useState<Member | null>(null);

  const trustUpiId = 'dpswt.trust@sbi';

  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      gender: 'male',
      maritalStatus: 'married',
      state: 'Uttar Pradesh',
      district: 'Gorakhpur',
      block: 'Harpur Luhasi',
      department: 'बेसिक शिक्षा परिषद (Basic Education)',
      designation: 'सहायक अध्यापक (Assistant Teacher)',
      familyMembers: [],
      acceptTerms: false as any,
    },
    mode: 'onTouched',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'familyMembers',
  });

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(trustUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const nextToStep2 = async () => {
    const isValid = await trigger([
      'fullName',
      'fatherOrHusbandName',
      'dob',
      'gender',
      'maritalStatus',
      'department',
      'designation',
      'mobile'
    ]);
    if (isValid) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nextToStep3 = async () => {
    const isValid = await trigger([
      'state',
      'district',
      'block',
      'pinCode',
      'permanentAddress',
      'nomineeName',
      'nomineeRelation',
      'nomineeAge',
      'nomineeMobile'
    ]);
    if (isValid) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);

    if (!photoFile) {
      setServerError('कृपया पहचान पत्र हेतु सदस्य की फ़ोटो (Passport Photo) अपलोड करें।');
      return;
    }
    if (!receiptFile) {
      setServerError('कृपया बैंक/UPI ₹50 शुल्क भुगतान रसीद का स्क्रीनशॉट अपलोड करें।');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload photo to 'member-photos'
      const photoUrl = await uploadMemberPhoto(photoFile, values.mobile);

      // 2. Upload receipt to 'payment-receipts'
      const paymentReceiptUrl = await uploadPaymentReceipt(receiptFile, values.transactionId);

      // 3. Invoke Server Action
      const result = await registerEnterpriseMemberAction({
        fullName: values.fullName,
        fatherOrHusbandName: values.fatherOrHusbandName,
        motherName: values.motherName,
        dob: values.dob,
        gender: values.gender,
        bloodGroup: values.bloodGroup,
        maritalStatus: values.maritalStatus,
        department: values.department,
        designation: values.designation,
        joiningDate: values.joiningDate,
        mobile: values.mobile,
        email: values.email,
        password: values.password,
        state: values.state,
        district: values.district,
        block: values.block,
        pinCode: values.pinCode,
        permanentAddress: values.permanentAddress,
        nomineeName: values.nomineeName,
        nomineeRelation: values.nomineeRelation,
        nomineeAge: values.nomineeAge,
        nomineeMobile: values.nomineeMobile,
        familyMembers: values.familyMembers || [],
        transactionId: values.transactionId,
        rationCardId: values.rationCardId,
        paymentReceiptUrl,
        photoUrl,
      });

      if (!result.success || !result.member) {
        setServerError(result.message || 'पंजीकरण असफल रहा।');
        setIsSubmitting(false);
        return;
      }

      setRegisteredMember(result.member);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Registration submission error:', err);
      setServerError(err.message || 'सर्वर से संपर्क करने में समस्या आई।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Screen with Rendered Digital Card
  if (registeredMember) {
    return (
      <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 text-center shadow-lg space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">
              बधाई हो! सदस्यता पंजीकरण सफलतापूर्वक संपन्न
            </h1>
            <p className="text-sm text-stone-600 max-w-lg mx-auto">
              आपका आधिकारिक सदस्यता क्रमांक <span className="font-mono font-bold text-[#0B5C9E] text-base">{registeredMember.member_id}</span> जारी कर दिया गया है।
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
              <span>शुल्क सत्यापन लंबित: न्यास समिति द्वारा 24 घंटे में पुष्टिकरण</span>
            </div>
          </div>

          {/* Render Member Card Component with Download Buttons */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-md">
            <MemberCard member={registeredMember} />
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="px-6 py-3 rounded-2xl bg-[#0B5C9E] hover:bg-[#084b82] text-white text-xs font-bold inline-flex items-center gap-2 shadow-md"
            >
              <span>सदस्य पोर्टल में लॉगिन करें</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Editorial Trust Branding Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B5C9E]/10 border border-[#0B5C9E]/20 text-[#0B5C9E] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>जन सेवा चैरिटेबल ट्रस्ट (JSCT) • आधिकारिक सदस्यता प्रपत्र</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight font-serif">
            नया आजीवन सदस्य पंजीकरण (Membership Registration)
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
            कल्याणकारी योजनाओं (₹15 लाख आकस्मिक व ₹5 लाख बेटी विवाह संबल) हेतु सदस्यता ग्रहण करें।
          </p>
        </div>

        {/* UPI Payment Info Bar */}
        <div className="bg-[#0B5C9E]/5 border border-[#0B5C9E]/20 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="px-2.5 py-0.5 rounded-full bg-[#0B5C9E] text-white text-[10px] font-bold uppercase tracking-wider">
              वार्षिक सदस्यता अंशदान: ₹50 मात्र
            </span>
            <p className="text-xs text-stone-600 mt-1">
              आधिकारिक ट्रस्ट UPI ID: <span className="font-mono font-bold text-stone-900">{trustUpiId}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyUpi}
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs font-bold text-stone-800 hover:bg-stone-50 flex items-center gap-1.5 shadow-xs"
            >
              {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
              <span>{copiedUpi ? 'UPI कॉपी हो गया' : 'Copy UPI ID'}</span>
            </button>
            <div className="w-12 h-12 bg-white rounded-xl border border-stone-200 flex items-center justify-center p-1 text-[#0B5C9E]">
              <QrCode className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Stepper Navigation */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 font-mono text-xs">
          <div className={`p-3 rounded-2xl border text-center transition-all ${
            step === 1 
              ? 'bg-[#0B5C9E] text-white border-[#0B5C9E] font-bold shadow-xs' 
              : 'bg-white text-stone-600 border-stone-200'
          }`}>
            <span className="block text-[10px] uppercase opacity-80">चरण 1</span>
            <span className="truncate block font-sans">व्यक्तिगत व सेवा</span>
          </div>
          <div className={`p-3 rounded-2xl border text-center transition-all ${
            step === 2 
              ? 'bg-[#0B5C9E] text-white border-[#0B5C9E] font-bold shadow-xs' 
              : 'bg-white text-stone-600 border-stone-200'
          }`}>
            <span className="block text-[10px] uppercase opacity-80">चरण 2</span>
            <span className="truncate block font-sans">निवास व नामिनी</span>
          </div>
          <div className={`p-3 rounded-2xl border text-center transition-all ${
            step === 3 
              ? 'bg-[#0B5C9E] text-white border-[#0B5C9E] font-bold shadow-xs' 
              : 'bg-white text-stone-600 border-stone-200'
          }`}>
            <span className="block text-[10px] uppercase opacity-80">चरण 3</span>
            <span className="truncate block font-sans">फ़ोटो व रसीद</span>
          </div>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-warm space-y-6">
          
          {/* ============================================================== */}
          {/* STEP 1: Personal & Occupation Information                      */}
          {/* ============================================================== */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200 text-xs font-bold uppercase tracking-wider text-stone-800 font-mono">
                <User className="w-4 h-4 text-[#0B5C9E]" />
                <span>चरण 1: व्यक्तिगत एवं सेवा विवरण</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    पूरा नाम (Full Name) *
                  </label>
                  <input
                    {...register('fullName')}
                    placeholder="उदा. सत्यनारायण यादव"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                  />
                  {errors.fullName && <p className="text-[11px] text-rose-600 mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    पिता अथवा पति का नाम *
                  </label>
                  <input
                    {...register('fatherOrHusbandName')}
                    placeholder="उदा. स्वर्गीय कैलाश नाथ"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                  />
                  {errors.fatherOrHusbandName && <p className="text-[11px] text-rose-600 mt-1">{errors.fatherOrHusbandName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    माता का नाम (Mother Name)
                  </label>
                  <input
                    {...register('motherName')}
                    placeholder="उदा. राधा देवी"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    जन्म तिथि (DOB) *
                  </label>
                  <input
                    type="date"
                    {...register('dob')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                  />
                  {errors.dob && <p className="text-[11px] text-rose-600 mt-1">{errors.dob.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    रक्त समूह (Blood Group)
                  </label>
                  <select
                    {...register('bloodGroup')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                  >
                    <option value="">रक्त समूह चुनें</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">लिंग (Gender) *</label>
                  <select
                    {...register('gender')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                  >
                    <option value="male">पुरुष (Male)</option>
                    <option value="female">महिला (Female)</option>
                    <option value="other">अन्य (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">वैवाहिक स्थिति *</label>
                  <select
                    {...register('maritalStatus')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                  >
                    <option value="married">विवाहित (Married)</option>
                    <option value="unmarried">अविवाहित (Unmarried)</option>
                    <option value="widow">विधवा / विधुर (Widow)</option>
                    <option value="separated">परित्यक्ता (Separated)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    कार्यरत विभाग (Department) *
                  </label>
                  <input
                    {...register('department')}
                    placeholder="उदा. बेसिक शिक्षा परिषद / स्वास्थ्य विभाग"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                  />
                  {errors.department && <p className="text-[11px] text-rose-600 mt-1">{errors.department.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    पदनाम (Designation) *
                  </label>
                  <input
                    {...register('designation')}
                    placeholder="उदा. सहायक अध्यापक / कनिष्ठ सहायक"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                  />
                  {errors.designation && <p className="text-[11px] text-rose-600 mt-1">{errors.designation.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    मोबाइल नंबर (Mobile) *
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    {...register('mobile')}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                  />
                  {errors.mobile && <p className="text-[11px] text-rose-600 mt-1">{errors.mobile.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ईमेल आईडी (वैकल्पिक)
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="member@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                  />
                  {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={nextToStep2}
                  className="px-6 py-2.5 rounded-xl bg-[#0B5C9E] hover:bg-[#084b82] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <span>आगे बढ़ें (Next Step)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 2: Address & Nominee Information                          */}
          {/* ============================================================== */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200 text-xs font-bold uppercase tracking-wider text-stone-800 font-mono">
                <Building className="w-4 h-4 text-[#0B5C9E]" />
                <span>चरण 2: निवास एवं नामिनी/पारिवारिक विवरण</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">राज्य *</label>
                  <input
                    {...register('state')}
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-xs text-stone-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">जनपद (District) *</label>
                  <input
                    {...register('district')}
                    placeholder="उदा. देवरिया / गोरखपुर"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                  />
                  {errors.district && <p className="text-[11px] text-rose-600 mt-1">{errors.district.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">ब्लॉक / तहसील *</label>
                  <input
                    {...register('block')}
                    placeholder="उदा. गौरी बाजार"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                  />
                  {errors.block && <p className="text-[11px] text-rose-600 mt-1">{errors.block.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">स्थायी पता (Complete Address) *</label>
                  <textarea
                    rows={2}
                    {...register('permanentAddress')}
                    placeholder="ग्राम, पोस्ट, तहसील, जनपद..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                  />
                  {errors.permanentAddress && <p className="text-[11px] text-rose-600 mt-1">{errors.permanentAddress.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">पिन कोड (PIN Code) *</label>
                  <input
                    maxLength={6}
                    {...register('pinCode')}
                    placeholder="274202"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                  />
                  {errors.pinCode && <p className="text-[11px] text-rose-600 mt-1">{errors.pinCode.message}</p>}
                </div>
              </div>

              {/* Nominee Details Section */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-mono">
                  नामिनी विवरण (Nominee Details - ₹15 लाख सहायता के सीधे अधिकृत प्राप्तकर्ता)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">नामिनी का नाम *</label>
                    <input
                      {...register('nomineeName')}
                      placeholder="उदा. श्रीमती सुशीला देवी"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                    />
                    {errors.nomineeName && <p className="text-[11px] text-rose-600 mt-1">{errors.nomineeName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">नामिनी से संबंध *</label>
                    <input
                      {...register('nomineeRelation')}
                      placeholder="उदा. Wife (धर्मपत्नी) / Son / Daughter"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                    />
                    {errors.nomineeRelation && <p className="text-[11px] text-rose-600 mt-1">{errors.nomineeRelation.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">नामिनी की आयु (वर्ष में) *</label>
                    <input
                      type="number"
                      {...register('nomineeAge')}
                      placeholder="52"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                    />
                    {errors.nomineeAge && <p className="text-[11px] text-rose-600 mt-1">{errors.nomineeAge.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">नामिनी का मोबाइल नंबर *</label>
                    <input
                      type="tel"
                      maxLength={10}
                      {...register('nomineeMobile')}
                      placeholder="7084237422"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                    />
                    {errors.nomineeMobile && <p className="text-[11px] text-rose-600 mt-1">{errors.nomineeMobile.message}</p>}
                  </div>
                </div>
              </div>

              {/* Dynamic Family Members Repeater */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 font-mono">
                    अन्य आश्रित परिवार सदस्य (+ Add Family Members)
                  </span>
                  <button
                    type="button"
                    onClick={() => append({ name: '', relation: '', age: 18 })}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold inline-flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>सदस्य जोड़ें</span>
                  </button>
                </div>

                {fields.map((field, idx) => (
                  <div key={field.id} className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <input
                      {...register(`familyMembers.${idx}.name` as const)}
                      placeholder="नाम"
                      className="flex-2 px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                    />
                    <input
                      {...register(`familyMembers.${idx}.relation` as const)}
                      placeholder="संबंध"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                    />
                    <input
                      type="number"
                      {...register(`familyMembers.${idx}.age` as const)}
                      placeholder="आयु"
                      className="w-16 px-2 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold inline-flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>पिछला चरण</span>
                </button>

                <button
                  type="button"
                  onClick={nextToStep3}
                  className="px-6 py-2.5 rounded-xl bg-[#0B5C9E] hover:bg-[#084b82] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <span>आगे बढ़ें (Next Step)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: Photo, Payment Proof & Credentials                     */}
          {/* ============================================================== */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200 text-xs font-bold uppercase tracking-wider text-stone-800 font-mono">
                <FileCheck2 className="w-4 h-4 text-[#0B5C9E]" />
                <span>चरण 3: फ़ोटो, अंशदान रसीद एवं लॉगिन पासवर्ड</span>
              </div>

              {/* File Dropzones: Headshot & Payment Receipt */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Member Headshot Photo Dropzone */}
                <div className="p-4 rounded-2xl border-2 border-dashed border-[#0B5C9E]/30 bg-[#0B5C9E]/5 text-center space-y-2">
                  <div className="w-24 h-28 mx-auto rounded-xl border-2 border-[#0B5C9E] bg-white overflow-hidden flex items-center justify-center relative shadow-xs">
                    {photoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-stone-400 flex flex-col items-center">
                        <Camera className="w-7 h-7 text-[#0B5C9E]" />
                        <span className="text-[10px] font-bold text-stone-500 mt-1 uppercase font-serif">PHOTO</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-[#0B5C9E] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs hover:bg-[#084b82]">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{photoFile ? 'फ़ोटो बदलें' : 'पासपोर्ट फ़ोटो अपलोड करें *'}</span>
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/webp" 
                        onChange={handlePhotoChange} 
                        className="hidden" 
                      />
                    </label>
                    <p className="text-[10px] text-stone-500 mt-1">यह फ़ोटो आपके डिजिटल पहचान पत्र पर अंकित होगी</p>
                  </div>
                </div>

                {/* 2. Payment Receipt Slip Dropzone */}
                <div className="p-4 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 text-center space-y-2">
                  <div className="w-24 h-28 mx-auto rounded-xl border border-stone-300 bg-white overflow-hidden flex items-center justify-center relative shadow-xs">
                    {receiptPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={receiptPreview} alt="Receipt Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-stone-400 flex flex-col items-center">
                        <FileCheck2 className="w-7 h-7 text-stone-400" />
                        <span className="text-[10px] font-bold text-stone-500 mt-1 uppercase">रसीद SLIP</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs hover:bg-stone-50">
                      <UploadCloud className="w-3.5 h-3.5 text-stone-600" />
                      <span>{receiptFile ? 'रसीद बदलें' : '₹50 भुगतान रसीद अपलोड करें *'}</span>
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        onChange={handleReceiptChange} 
                        className="hidden" 
                      />
                    </label>
                    <p className="text-[10px] text-stone-500 mt-1">बैंक/UPI ऐप में प्रदर्शित 12-अंकीय UTR रसीद</p>
                  </div>
                </div>

              </div>

              {/* Transaction ID & Ration Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    12-अंकीय बैंक UTR / Transaction ID *
                  </label>
                  <input
                    {...register('transactionId')}
                    placeholder="उदा. 429081298401"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                  />
                  {errors.transactionId && <p className="text-[11px] text-rose-600 mt-1">{errors.transactionId.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    राशन कार्ड क्रमांक (Ration Card ID - वैकल्पिक)
                  </label>
                  <input
                    {...register('rationCardId')}
                    placeholder="उदा. 219840192840"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                  />
                </div>
              </div>

              {/* Set Login Password */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900 uppercase font-mono">
                  <Lock className="w-4 h-4 text-[#0B5C9E]" />
                  <span>लॉगिन पासवर्ड निर्धारित करें (Set Login Password)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">पासवर्ड (न्यूनतम 6 अक्षर) *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-[11px] text-rose-600 mt-1">{errors.password.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">पासवर्ड की पुष्टि करें *</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                    />
                    {errors.confirmPassword && <p className="text-[11px] text-rose-600 mt-1">{errors.confirmPassword.message}</p>}
                  </div>
                </div>
              </div>

              {/* Legal Checkbox & Compliance Agreement */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('acceptTerms')}
                    className="mt-1 w-4 h-4 rounded border-amber-300 text-[#0B5C9E] focus:ring-[#0B5C9E]"
                  />
                  <span className="text-xs text-amber-950 leading-relaxed font-medium">
                    मैं शपथपूर्वक घोषणा करता/करती हूँ कि मेरे द्वारा दी गई समस्त जानकारी पूर्णतः सत्य है। मैं जन सेवा चैरिटेबल ट्रस्ट (JSCT) की नियमावली, ₹50 प्रति अपील सूक्ष्म सहयोग नियम तथा <strong>छह (6) माह की अनिवार्य सुरक्षा लॉक-इन अवधि</strong> के नियम को पूर्णतः स्वीकार करता/करती हूँ।
                  </span>
                </label>
                {errors.acceptTerms && <p className="text-[11px] text-rose-600 font-bold pl-7">{errors.acceptTerms.message}</p>}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold inline-flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>पिछला चरण</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-3 rounded-2xl bg-[#0B5C9E] hover:bg-[#084b82] text-white text-xs font-bold inline-flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>प्रक्रियाधीन है...</span>
                    </>
                  ) : (
                    <>
                      <span>पंजीकरण पूर्ण करें व कार्ड प्राप्त करें</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </form>

      </div>
    </div>
  );
}
