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
  QrCode,
  CheckCircle
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
      <div className="min-h-screen bg-canvas py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 text-center shadow-warm-md space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-charcoal font-serif">
              बधाई हो! सदस्यता पंजीकरण सफलतापूर्वक संपन्न
            </h1>
            <p className="text-xs sm:text-sm text-driftwood max-w-lg mx-auto">
              आपका आधिकारिक सदस्यता क्रमांक <span className="font-mono font-bold text-terracotta text-sm sm:text-base">{registeredMember.member_id}</span> जारी कर दिया गया है।
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>शुल्क सत्यापन लंबित: न्यास समिति द्वारा 24 घंटे में पुष्टिकरण</span>
            </div>
          </div>

          {/* Render Member Card Component with Download Buttons */}
          <div className="bg-white p-4 sm:p-8 rounded-3xl border border-stone-200 shadow-warm">
            <MemberCard member={registeredMember} />
          </div>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-warm transition-all"
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
    <div className="min-h-screen bg-canvas py-5 sm:py-10 px-3.5 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-5 sm:space-y-7">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 border border-terracotta/20 text-terracotta text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>जन सेवा चैरिटेबल ट्रस्ट (JSCT) • आधिकारिक सदस्यता प्रपत्र</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-charcoal tracking-tight font-serif leading-tight">
            नया आजीवन सदस्य पंजीकरण
          </h1>
          <p className="text-xs sm:text-sm text-driftwood max-w-xl mx-auto">
            ₹15 लाख आकस्मिक व ₹5 लाख बेटी विवाह संबल हेतु सदस्यता ग्रहण करें।
          </p>
        </div>

        {/* Stepper Progress Bar (Clean on Mobile & Desktop) */}
        <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-stone-200 shadow-xs">
          <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`p-2 sm:p-2.5 rounded-xl text-center transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                step === 1 
                  ? 'bg-terracotta text-white font-bold shadow-xs' 
                  : step > 1
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                  : 'bg-canvas-inset text-driftwood'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 1 ? 'bg-white text-terracotta' : step > 1 ? 'bg-emerald-600 text-white' : 'bg-stone-300 text-charcoal'
              }`}>
                {step > 1 ? '✓' : '1'}
              </span>
              <span className="text-[11px] sm:text-xs font-medium truncate">व्यक्तिगत विवरण</span>
            </button>

            {/* Step 2 */}
            <button
              type="button"
              onClick={() => {
                if (step > 2) setStep(2);
              }}
              className={`p-2 sm:p-2.5 rounded-xl text-center transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                step === 2 
                  ? 'bg-terracotta text-white font-bold shadow-xs' 
                  : step > 2
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                  : 'bg-canvas-inset text-driftwood'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 2 ? 'bg-white text-terracotta' : step > 2 ? 'bg-emerald-600 text-white' : 'bg-stone-300 text-charcoal'
              }`}>
                {step > 2 ? '✓' : '2'}
              </span>
              <span className="text-[11px] sm:text-xs font-medium truncate">नामिनी व निवास</span>
            </button>

            {/* Step 3 */}
            <div
              className={`p-2 sm:p-2.5 rounded-xl text-center transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                step === 3 
                  ? 'bg-terracotta text-white font-bold shadow-xs' 
                  : 'bg-canvas-inset text-driftwood'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 3 ? 'bg-white text-terracotta' : 'bg-stone-300 text-charcoal'
              }`}>
                3
              </span>
              <span className="text-[11px] sm:text-xs font-medium truncate">शुल्क व फ़ोटो</span>
            </div>
          </div>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-4 sm:p-7 rounded-3xl border border-stone-200 shadow-warm space-y-5">
          
          {/* ============================================================== */}
          {/* STEP 1: Personal & Occupation Information                      */}
          {/* ============================================================== */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-xs font-bold text-charcoal">
                <User className="w-4 h-4 text-terracotta" />
                <span>चरण 1: आवेदक का व्यक्तिगत एवं सेवा विवरण</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    पूरा नाम (Full Name) *
                  </label>
                  <input
                    {...register('fullName')}
                    placeholder="उदा. सत्यनारायण यादव"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-charcoal placeholder:text-driftwood/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                  />
                  {errors.fullName && <p className="text-[11px] text-rose-600 mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    पिता अथवा पति का नाम *
                  </label>
                  <input
                    {...register('fatherOrHusbandName')}
                    placeholder="उदा. स्वर्गीय कैलाश नाथ"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-charcoal placeholder:text-driftwood/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                  />
                  {errors.fatherOrHusbandName && <p className="text-[11px] text-rose-600 mt-1">{errors.fatherOrHusbandName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    माता का नाम (वैकल्पिक)
                  </label>
                  <input
                    {...register('motherName')}
                    placeholder="उदा. राधा देवी"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-charcoal placeholder:text-driftwood/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    जन्म तिथि (DOB) *
                  </label>
                  <input
                    type="date"
                    {...register('dob')}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all bg-white"
                  />
                  {errors.dob && <p className="text-[11px] text-rose-600 mt-1">{errors.dob.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    रक्त समूह (Blood Group)
                  </label>
                  <select
                    {...register('bloodGroup')}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all bg-white"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">लिंग (Gender) *</label>
                  <select
                    {...register('gender')}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all bg-white"
                  >
                    <option value="male">पुरुष (Male)</option>
                    <option value="female">महिला (Female)</option>
                    <option value="other">अन्य (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">वैवाहिक स्थिति *</label>
                  <select
                    {...register('maritalStatus')}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all bg-white"
                  >
                    <option value="married">विवाहित (Married)</option>
                    <option value="unmarried">अविवाहित (Unmarried)</option>
                    <option value="widow">विधवा / विधुर (Widow)</option>
                    <option value="separated">परित्यक्ता (Separated)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    कार्यरत विभाग (Department) *
                  </label>
                  <input
                    {...register('department')}
                    placeholder="उदा. बेसिक शिक्षा परिषद / स्वास्थ्य विभाग"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-charcoal placeholder:text-driftwood/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                  />
                  {errors.department && <p className="text-[11px] text-rose-600 mt-1">{errors.department.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    पदनाम (Designation) *
                  </label>
                  <input
                    {...register('designation')}
                    placeholder="उदा. सहायक अध्यापक / कनिष्ठ सहायक"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-charcoal placeholder:text-driftwood/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                  />
                  {errors.designation && <p className="text-[11px] text-rose-600 mt-1">{errors.designation.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    मोबाइल नंबर (Mobile) *
                  </label>
                  <div className="flex rounded-xl border border-stone-300 bg-white focus-within:ring-2 focus-within:ring-terracotta/20 focus-within:border-terracotta transition-all overflow-hidden">
                    <span className="px-3 py-2 bg-canvas-inset border-r border-stone-200 text-xs font-mono font-bold text-charcoal flex items-center">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      {...register('mobile')}
                      placeholder="9876543210"
                      className="w-full px-3 py-2 text-xs sm:text-sm font-mono font-medium text-charcoal focus:outline-none bg-transparent"
                    />
                  </div>
                  {errors.mobile && <p className="text-[11px] text-rose-600 mt-1">{errors.mobile.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    ईमेल आईडी (वैकल्पिक)
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="member@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-charcoal placeholder:text-driftwood/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                  />
                  {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={nextToStep2}
                  className="w-full sm:w-auto sm:ml-auto h-11 px-6 rounded-xl bg-terracotta hover:bg-terracotta-hover active:bg-terracotta-dark text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <span>अगला चरण (Next Step)</span>
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
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-xs font-bold text-charcoal">
                <Building className="w-4 h-4 text-terracotta" />
                <span>चरण 2: निवास एवं नामिनी/पारिवारिक विवरण</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">राज्य *</label>
                  <input
                    {...register('state')}
                    readOnly
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs text-driftwood font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">जनपद (District) *</label>
                  <input
                    {...register('district')}
                    placeholder="उदा. देवरिया / गोरखपुर"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                  />
                  {errors.district && <p className="text-[11px] text-rose-600 mt-1">{errors.district.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">ब्लॉक / तहसील *</label>
                  <input
                    {...register('block')}
                    placeholder="उदा. गौरी बाजार"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                  />
                  {errors.block && <p className="text-[11px] text-rose-600 mt-1">{errors.block.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-charcoal mb-1">स्थायी पता (Complete Address) *</label>
                  <textarea
                    rows={2}
                    {...register('permanentAddress')}
                    placeholder="ग्राम, पोस्ट, तहसील, जनपद..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                  />
                  {errors.permanentAddress && <p className="text-[11px] text-rose-600 mt-1">{errors.permanentAddress.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">पिन कोड (PIN Code) *</label>
                  <input
                    maxLength={6}
                    {...register('pinCode')}
                    placeholder="274202"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-mono font-bold text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                  />
                  {errors.pinCode && <p className="text-[11px] text-rose-600 mt-1">{errors.pinCode.message}</p>}
                </div>
              </div>

              {/* Nominee Details Section */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-canvas-inset border border-stone-200/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal">
                  <ShieldCheck className="w-4 h-4 text-terracotta shrink-0" />
                  <span>नामिनी विवरण (₹15 लाख सहायता के सीधे अधिकृत प्राप्तकर्ता)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">नामिनी का नाम *</label>
                    <input
                      {...register('nomineeName')}
                      placeholder="उदा. श्रीमती सुशीला देवी"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                    />
                    {errors.nomineeName && <p className="text-[11px] text-rose-600 mt-1">{errors.nomineeName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">नामिनी से संबंध *</label>
                    <input
                      {...register('nomineeRelation')}
                      placeholder="उदा. Wife (धर्मपत्नी) / Son / Daughter"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                    />
                    {errors.nomineeRelation && <p className="text-[11px] text-rose-600 mt-1">{errors.nomineeRelation.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">नामिनी की आयु (वर्ष में) *</label>
                    <input
                      type="number"
                      {...register('nomineeAge')}
                      placeholder="52"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                    />
                    {errors.nomineeAge && <p className="text-[11px] text-rose-600 mt-1">{errors.nomineeAge.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">नामिनी का मोबाइल नंबर *</label>
                    <input
                      type="tel"
                      maxLength={10}
                      {...register('nomineeMobile')}
                      placeholder="7084237422"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-mono font-medium bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                    />
                    {errors.nomineeMobile && <p className="text-[11px] text-rose-600 mt-1">{errors.nomineeMobile.message}</p>}
                  </div>
                </div>
              </div>

              {/* Dynamic Family Members Repeater (Mobile-Optimized) */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-charcoal">
                    अन्य आश्रित परिवार सदस्य (+ Add Family Members)
                  </span>
                  <button
                    type="button"
                    onClick={() => append({ name: '', relation: '', age: 18 })}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-charcoal text-xs font-semibold inline-flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>सदस्य जोड़ें</span>
                  </button>
                </div>

                {fields.map((field, idx) => (
                  <div key={field.id} className="p-2.5 rounded-xl bg-canvas-inset border border-stone-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-driftwood uppercase">सदस्य #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        {...register(`familyMembers.${idx}.name` as const)}
                        placeholder="पूरा नाम"
                        className="px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-charcoal focus:outline-none focus:border-terracotta"
                      />
                      <input
                        {...register(`familyMembers.${idx}.relation` as const)}
                        placeholder="संबंध (उदा. पुत्र / पुत्री)"
                        className="px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-charcoal focus:outline-none focus:border-terracotta"
                      />
                      <input
                        type="number"
                        {...register(`familyMembers.${idx}.age` as const)}
                        placeholder="आयु (वर्ष)"
                        className="px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-charcoal font-mono focus:outline-none focus:border-terracotta"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-11 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-charcoal text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>पिछला चरण</span>
                </button>

                <button
                  type="button"
                  onClick={nextToStep3}
                  className="h-11 px-6 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <span>अगला चरण (Next Step)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: Photo, Payment Proof & Credentials                     */}
          {/* ============================================================== */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-xs font-bold text-charcoal">
                <FileCheck2 className="w-4 h-4 text-terracotta" />
                <span>चरण 3: शुल्क भुगतान, फ़ोटो व खाता पासवर्ड</span>
              </div>

              {/* UPI Payment Instruction Card (Displayed here where payment is required) */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-terracotta text-white text-[10px] font-bold uppercase tracking-wider">
                      वार्षिक सदस्यता अंशदान: ₹50 मात्र
                    </span>
                    <p className="text-xs text-charcoal mt-1">
                      आधिकारिक ट्रस्ट UPI ID: <strong className="font-mono text-terracotta">{trustUpiId}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs font-bold text-charcoal hover:bg-stone-50 flex items-center gap-1.5 shadow-2xs transition-all"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-driftwood" />}
                    <span>{copiedUpi ? 'UPI कॉपी हो गया' : 'Copy UPI ID'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-driftwood leading-tight">
                  1. किसी भी UPI ऐप (GPay, PhonePe, Paytm) से ₹50 भेजें → 2. 12-अंकीय बैंक UTR दर्ज करें → 3. रसीद का स्क्रीनशॉट अपलोड करें।
                </p>
              </div>

              {/* File Uploads: Passport Photo & Payment Receipt */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* 1. Member Photo Upload */}
                <div className="p-3.5 rounded-2xl border-2 border-dashed border-stone-300 bg-canvas-inset/60 text-center space-y-2">
                  <div className="w-20 h-24 mx-auto rounded-xl border border-stone-300 bg-white overflow-hidden flex items-center justify-center relative shadow-xs">
                    {photoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-driftwood flex flex-col items-center">
                        <Camera className="w-6 h-6 text-terracotta" />
                        <span className="text-[9px] font-bold text-driftwood mt-1 uppercase">PHOTO</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-terracotta text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs hover:bg-terracotta-hover transition-all">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{photoFile ? 'फ़ोटो बदलें' : 'पासपोर्ट फ़ोटो अपलोड करें *'}</span>
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/webp" 
                        onChange={handlePhotoChange} 
                        className="hidden" 
                      />
                    </label>
                    <p className="text-[10px] text-driftwood mt-1">पहचान पत्र पर अंकित होगी</p>
                  </div>
                </div>

                {/* 2. Payment Receipt Slip Upload */}
                <div className="p-3.5 rounded-2xl border-2 border-dashed border-stone-300 bg-canvas-inset/60 text-center space-y-2">
                  <div className="w-20 h-24 mx-auto rounded-xl border border-stone-300 bg-white overflow-hidden flex items-center justify-center relative shadow-xs">
                    {receiptPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={receiptPreview} alt="Receipt Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-driftwood flex flex-col items-center">
                        <FileCheck2 className="w-6 h-6 text-driftwood" />
                        <span className="text-[9px] font-bold text-driftwood mt-1 uppercase">SLIP</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-charcoal text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs hover:bg-stone-50 transition-all">
                      <UploadCloud className="w-3.5 h-3.5 text-driftwood" />
                      <span>{receiptFile ? 'रसीद बदलें' : '₹50 रसीद अपलोड करें *'}</span>
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        onChange={handleReceiptChange} 
                        className="hidden" 
                      />
                    </label>
                    <p className="text-[10px] text-driftwood mt-1">12-अंकीय UTR वाली रसीद</p>
                  </div>
                </div>

              </div>

              {/* Transaction ID & Ration Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    12-अंकीय बैंक UTR / Transaction ID *
                  </label>
                  <input
                    {...register('transactionId')}
                    placeholder="उदा. 429081298401"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-mono font-bold text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                  />
                  {errors.transactionId && <p className="text-[11px] text-rose-600 mt-1">{errors.transactionId.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    राशन कार्ड क्रमांक (वैकल्पिक)
                  </label>
                  <input
                    {...register('rationCardId')}
                    placeholder="उदा. 219840192840"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-mono text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                  />
                </div>
              </div>

              {/* Set Login Password */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-canvas-inset border border-stone-200/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal">
                  <Lock className="w-4 h-4 text-terracotta" />
                  <span>लॉगिन पासवर्ड निर्धारित करें (Set Password)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">पासवर्ड (न्यूनतम 6 अक्षर) *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-driftwood hover:text-charcoal"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-[11px] text-rose-600 mt-1">{errors.password.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">पासवर्ड पुष्टि *</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                    />
                    {errors.confirmPassword && <p className="text-[11px] text-rose-600 mt-1">{errors.confirmPassword.message}</p>}
                  </div>
                </div>
              </div>

              {/* Legal Checkbox & Compliance Agreement */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('acceptTerms')}
                    className="mt-1 w-4 h-4 rounded border-amber-300 text-terracotta focus:ring-terracotta accent-terracotta"
                  />
                  <span className="text-xs text-amber-950 leading-relaxed font-medium">
                    मैं शपथपूर्वक घोषणा करता/करती हूँ कि मेरे द्वारा दी गई जानकारी पूर्णतः सत्य है। मैं जन सेवा चैरिटेबल ट्रस्ट (JSCT) की नियमावली, ₹50 प्रति अपील सूक्ष्म सहयोग नियम तथा <strong>छह (6) माह की अनिवार्य सुरक्षा लॉक-इन अवधि</strong> के नियम को पूर्णतः स्वीकार करता/करती हूँ।
                  </span>
                </label>
                {errors.acceptTerms && <p className="text-[11px] text-rose-600 font-bold pl-6">{errors.acceptTerms.message}</p>}
              </div>

              <div className="pt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="h-11 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-charcoal text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>पिछला चरण</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-6 rounded-xl bg-terracotta hover:bg-terracotta-hover active:bg-terracotta-dark text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-all shadow-warm disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>प्रक्रियाधीन है...</span>
                    </>
                  ) : (
                    <>
                      <span>पंजीकरण पूर्ण करें</span>
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
