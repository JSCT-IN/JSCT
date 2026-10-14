'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DPSWTStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { sendOtpAction, verifyOtpAction, loginAction } from '@/actions/auth-actions';
import { getFirebaseAnalytics, setupRecaptcha, syncMemberToFirestore } from '@/lib/firebase';
import { 
  HeartHandshake, 
  Loader2, 
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Smartphone,
  RefreshCw,
  Fingerprint,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { lang } = useTranslation();

  // Login Mode: 'OTP' (Default) or 'PASSWORD'
  const [loginMode, setLoginMode] = useState<'OTP' | 'PASSWORD'>('OTP');

  // OTP Step: 1 = Enter Aadhaar/Identifier, 2 = Enter 6-digit OTP
  const [otpStep, setOtpStep] = useState<1 | 2>(1);

  // Form Fields
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP Metadata from Server
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Status & Timers
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Refs for 6 OTP input boxes
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown effect for Resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Initialize Firebase Analytics & invisible reCAPTCHA for Phone Auth
  useEffect(() => {
    getFirebaseAnalytics();
    setupRecaptcha('recaptcha-container');
  }, []);

  // Handle Send OTP (Step 1)
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanInput = aadhaarInput.trim().replace(/\s+/g, '');

    if (!cleanInput) {
      setErrorMessage(
        lang === 'hi' 
          ? 'कृपया अपना 12-अंकीय आधार नंबर अथवा पंजीकृत मोबाइल दर्ज करें।' 
          : 'Please enter your 12-digit Aadhaar number or registered mobile.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await sendOtpAction(cleanInput);

      if (!result.success) {
        setErrorMessage(result.message || (lang === 'hi' ? 'ओटीपी भेजने में असमर्थ।' : 'Could not send OTP.'));
        setIsLoading(false);
        return;
      }

      setMaskedPhone(result.maskedPhone || null);
      setMaskedEmail(result.maskedEmail || null);
      setDevOtp(result.devOtp || null);
      setOtpStep(2);
      setCountdown(60); // 60s cooldown
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMessage(result.message || 'ओटीपी प्रेषित किया गया!');
      setIsLoading(false);

      // Auto focus first OTP input box
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);

    } catch (err: any) {
      setErrorMessage(err.message || 'सर्वर से संपर्क करने में असमर्थ।');
      setIsLoading(false);
    }
  };

  // Handle OTP digit box input
  const handleOtpChange = (index: number, value: string) => {
    // Handle paste of full 6 digits
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      if (pasted) {
        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = pasted[i] || '';
        }
        setOtpDigits(newDigits);
        const nextIndex = Math.min(pasted.length, 5);
        otpInputRefs.current[nextIndex]?.focus();
      }
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto focus next box
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace navigation in OTP boxes
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Verify OTP (Step 2)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const fullOtp = otpDigits.join('');

    if (fullOtp.length !== 6) {
      setErrorMessage(
        lang === 'hi' 
          ? 'कृपया पूर्ण 6-अंकीय ओटीपी दर्ज करें।' 
          : 'Please enter the complete 6-digit OTP.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const cleanInput = aadhaarInput.trim().replace(/\s+/g, '');
      const result = await verifyOtpAction(cleanInput, fullOtp);

      if (!result.success || !result.user) {
        setErrorMessage(result.message || (lang === 'hi' ? 'सत्यापन असफल रहा।' : 'Verification failed.'));
        setIsLoading(false);
        return;
      }

      // Synchronize client storage
      DPSWTStore.setCurrentUser(result.user.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', result.user.token || 'jsct_otp_token_' + result.user.id);
        localStorage.setItem('user', JSON.stringify(result.user));
      }

      // Firebase Analytics & Firestore session sync
      getFirebaseAnalytics().then(async (analytics) => {
        if (analytics) {
          const { logEvent } = await import('firebase/analytics');
          logEvent(analytics, 'login', { method: 'aadhaar_otp' });
        }
      }).catch(() => {});

      syncMemberToFirestore({
        id: result.user.id,
        membership_id: result.user.membership_id,
        full_name: result.user.full_name,
        phone: result.user.phone,
        department: result.user.department,
        status: 'ACTIVE',
      }).catch(() => {});

      setSuccessMessage(
        lang === 'hi'
          ? `सफलतापूर्वक लॉगिन संपन्न! स्वागत है ${result.user.full_name}`
          : `Login successful! Welcome ${result.user.full_name}`
      );

      setTimeout(() => {
        router.push(result.redirectTo || '/dashboard');
      }, 500);

    } catch (err: any) {
      setErrorMessage(err.message || 'सत्यापन में त्रुटि हुई।');
      setIsLoading(false);
    }
  };

  // Handle Password Login Submission (Tab 2)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanId = aadhaarInput.trim();
    const cleanPass = passwordInput.trim();

    if (!cleanId || !cleanPass) {
      setErrorMessage(
        lang === 'hi' 
          ? 'कृपया पहचान क्रमांक एवं पासवर्ड दोनों दर्ज करें।' 
          : 'Please enter identification and password.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginAction(cleanId, cleanPass, 'AUTO');

      if (!result.success || !result.user) {
        setErrorMessage(result.message || 'लॉगिन असफल रहा। कृपया पासवर्ड जांचें।');
        setIsLoading(false);
        return;
      }

      DPSWTStore.setCurrentUser(result.user.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', result.user.token || 'jsct_token_' + result.user.id);
        localStorage.setItem('user', JSON.stringify(result.user));
      }

      // Firebase Analytics sync
      getFirebaseAnalytics().then(async (analytics) => {
        if (analytics) {
          const { logEvent } = await import('firebase/analytics');
          logEvent(analytics, 'login', { method: 'password' });
        }
      }).catch(() => {});

      syncMemberToFirestore({
        id: result.user.id,
        membership_id: result.user.membership_id,
        full_name: result.user.full_name,
        phone: result.user.phone,
        department: result.user.department,
        status: 'ACTIVE',
      }).catch(() => {});

      setSuccessMessage(
        lang === 'hi'
          ? `स्वागत है ${result.user.full_name}!`
          : `Welcome ${result.user.full_name}!`
      );

      setTimeout(() => {
        router.push(result.redirectTo || '/dashboard');
      }, 500);

    } catch (err: any) {
      setErrorMessage(err.message || 'लॉगिन में त्रुटि हुई।');
      setIsLoading(false);
    }
  };

  // Quick helper to fill dev OTP
  const handleFillDevOtp = () => {
    if (devOtp && devOtp.length === 6) {
      setOtpDigits(devOtp.split(''));
      setErrorMessage(null);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 bg-[#FAF8F5]">
      
      {/* Enterprise Authentication Card */}
      <div className="w-full max-w-[440px] bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(38,36,33,0.08)] border border-stone-200/90 relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-terracotta/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header: Back To Home */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}</span>
          </Link>

          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-sage bg-sage-light px-2.5 py-0.5 rounded-full border border-sage/20">
            <ShieldCheck className="w-3 h-3 text-sage" />
            <span>सुरक्षित पोर्टल</span>
          </span>
        </div>

        {/* Centered Brand Emblem & Heading */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-terracotta to-amber-600 text-white flex items-center justify-center mx-auto shadow-sm mb-2.5">
            <HeartHandshake className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="font-editorial text-xl sm:text-2xl font-extrabold text-charcoal">
            {lang === 'hi' ? 'सदस्य पोर्टल लॉगिन' : 'Member Portal Login'}
          </h1>
          <p className="text-xs text-driftwood mt-0.5">
            {lang === 'hi' ? 'जन सेवा चैरिटेबल ट्रस्ट (JSCT)' : 'Jan Sewa Charitable Trust (JSCT)'}
          </p>
        </div>

        {/* Dual Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-canvas-inset rounded-xl border border-stone-border mb-5">
          <button
            type="button"
            onClick={() => {
              setLoginMode('OTP');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              loginMode === 'OTP'
                ? 'bg-white text-charcoal shadow-xs border border-stone-200'
                : 'text-driftwood hover:text-charcoal'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-terracotta" />
            <span>आधार OTP लॉगिन</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMode('PASSWORD');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              loginMode === 'PASSWORD'
                ? 'bg-white text-charcoal shadow-xs border border-stone-200'
                : 'text-driftwood hover:text-charcoal'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-terracotta" />
            <span>पासवर्ड लॉगिन</span>
          </button>
        </div>

        {/* Error / Success Alerts */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODE 1: AADHAAR OTP LOGIN (DEFAULT & USER-REQUESTED)           */}
        {/* ------------------------------------------------------------- */}
        {loginMode === 'OTP' && (
          <div>
            {otpStep === 1 ? (
              /* STEP 1: Enter Aadhaar Number */
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-charcoal">
                    {lang === 'hi' ? 'आधार कार्ड नंबर / मोबाइल नंबर' : 'Aadhaar Number / Registered Mobile'}
                    <span className="text-red-500 ml-1">*</span>
                  </label>

                  <div className="relative flex items-center">
                    <Fingerprint className="w-4 h-4 text-driftwood absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      disabled={isLoading}
                      value={aadhaarInput}
                      onChange={(e) => setAadhaarInput(e.target.value)}
                      placeholder="12-अंकीय आधार (उदा. 9876 5432 1098)"
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none bg-white placeholder:text-stone-400 font-mono tracking-wide transition-all"
                    />
                  </div>

                  <p className="text-[11px] text-driftwood leading-relaxed">
                    पंजीकरण के समय दर्ज 12-अंक आधार नंबर दर्ज करें। आपके पंजीकृत नंबर पर OTP भेजा जाएगा।
                  </p>
                </div>

                {/* Quick Helper for Founders/Admins */}
                <div className="p-2.5 rounded-xl bg-canvas-inset border border-stone-200/80 text-[11px] text-charcoal-muted">
                  <div className="font-semibold text-charcoal mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-terracotta" />
                    <span>त्वरित परीक्षण (Demo / Existing Accounts):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setAadhaarInput('8290224742')}
                      className="px-2 py-0.5 rounded bg-terracotta/10 hover:bg-terracotta/20 border border-terracotta/30 text-terracotta text-[10px] font-mono font-bold"
                    >
                      Suraj (8290224742)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAadhaarInput('8912')}
                      className="px-2 py-0.5 rounded bg-white hover:bg-stone-100 border border-stone-300 text-[10px] font-mono font-semibold"
                    >
                      Saleha (8912)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAadhaarInput('JSCT-UP-8290')}
                      className="px-2 py-0.5 rounded bg-white hover:bg-stone-100 border border-stone-300 text-[10px] font-mono font-semibold"
                    >
                      JSCT-UP-8290
                    </button>
                  </div>
                </div>


                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-xs sm:text-sm shadow-warm transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>ओटीपी भेज रहे हैं...</span>
                    </>
                  ) : (
                    <>
                      <span>ओटीपी प्राप्त करें (Send OTP)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* STEP 2: Enter 6-Digit OTP */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                
                {/* Destination Confirmation Strip */}
                <div className="p-3 rounded-xl bg-canvas-inset border border-stone-border flex items-center justify-between text-xs">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[11px] text-driftwood block">ओटीपी प्रेषित किया गया:</span>
                    <span className="font-bold text-charcoal font-mono block truncate">
                      {maskedPhone || 'पंजीकृत मोबाइल'}
                    </span>
                    {maskedEmail && (
                      <span className="text-[10px] text-driftwood font-mono block truncate">
                        ईमेल: {maskedEmail}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep(1);
                      setErrorMessage(null);
                    }}
                    className="text-xs font-bold text-terracotta hover:underline shrink-0 pl-2"
                  >
                    बदलें (Change)
                  </button>
                </div>

                {/* 6 Digit Input Boxes */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-charcoal text-center">
                    6-अंकीय ओटीपी कोड दर्ज करें (Enter 6-digit OTP)
                  </label>

                  <div className="flex items-center justify-center gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6} // Allow paste into any box
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-12 text-center text-lg font-mono font-bold rounded-xl border-2 border-stone-300 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none bg-white transition-all shadow-xs"
                      />
                    ))}
                  </div>

                  {/* Dev / Demo Mode Direct Fill Badge */}
                  {devOtp && (
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={handleFillDevOtp}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-mono font-bold transition-colors border border-amber-300"
                        title="Click to auto-fill OTP"
                      >
                        <Sparkles className="w-3 h-3 text-amber-700" />
                        <span>डेमो ओटीपी: {devOtp} (क्लिक करके भरें)</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Resend Cooldown Timer */}
                <div className="text-center text-xs">
                  {countdown > 0 ? (
                    <span className="text-driftwood font-medium">
                      पुनः ओटीपी भेजें ({countdown}s)
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleSendOtp()}
                      className="text-terracotta font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>पुनः ओटीपी भेजें (Resend OTP)</span>
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-xs sm:text-sm shadow-warm transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>सत्यापित कर रहे हैं...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>सत्यापित करें और लॉगिन करें</span>
                    </>
                  )}
                </button>

              </form>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODE 2: PASSWORD LOGIN (FOR STAFF / ADMINS / MASTERS)         */}
        {/* ------------------------------------------------------------- */}
        {loginMode === 'PASSWORD' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            
            {/* Field 1: Identifier */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-charcoal">
                {lang === 'hi' ? 'आधार संख्या / सदस्यता क्रमांक / फोन' : 'Aadhaar / Member ID / Phone'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isLoading}
                value={aadhaarInput}
                onChange={(e) => setAadhaarInput(e.target.value)}
                placeholder="उदा. 8912 / JSCT-UP-001 / +91 9876500001"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none bg-white placeholder:text-stone-400 disabled:opacity-50 transition-all"
              />
            </div>

            {/* Field 2: Password with Eye toggle */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-charcoal">
                {lang === 'hi' ? 'पासवर्ड (Password)' : 'Password'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="अपना पासवर्ड दर्ज करें"
                  className="w-full px-3 py-2 pr-9 text-xs sm:text-sm rounded-xl border border-stone-300 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none bg-white placeholder:text-stone-400 disabled:opacity-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 text-stone-400 hover:text-charcoal p-1 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer text-driftwood">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-terracotta focus:ring-terracotta"
                />
                <span>याद रखें (Remember me)</span>
              </label>
              <a
                href="tel:9264945875"
                className="text-terracotta hover:underline font-medium"
              >
                पासवर्ड सहायता
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-charcoal hover:bg-charcoal-deep text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>प्रतीक्षा करें...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>लॉग इन करें (Log In)</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Bottom Link: Register */}
        <div className="text-center mt-6 pt-4 border-t border-stone-200/80">
          <p className="text-xs text-driftwood">
            {lang === 'hi' ? 'क्या आपका पंजीकरण नहीं हुआ है?' : "Don't have an account?"}{' '}
            <Link
              href="/register"
              className="font-bold text-terracotta hover:underline ml-1 inline-flex items-center gap-1"
            >
              <span>{lang === 'hi' ? 'नया सदस्य पंजीकरण (₹50) →' : 'Register Here (₹50) →'}</span>
            </Link>
          </p>
        </div>

        {/* Firebase Phone Auth Invisible Recaptcha Mount Point */}
        <div id="recaptcha-container" className="hidden"></div>
      </div>


    </div>
  );
}
