'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DPSWTStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { sendOtpAction, verifyOtpAction } from '@/actions/auth-actions';
import { 
  getFirebaseAnalytics, 
  setupRecaptcha, 
  sendFirebasePhoneOtp, 
  syncMemberToFirestore 
} from '@/lib/firebase';
import { 
  HeartHandshake, 
  Loader2, 
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  RefreshCw,
  Fingerprint,
  ArrowRight,
  Sparkles,
  Check
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { lang } = useTranslation();

  // OTP Step: 1 = Enter Aadhaar/Identifier, 2 = Enter 6-digit OTP
  const [otpStep, setOtpStep] = useState<1 | 2>(1);

  // Form Fields
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  // OTP Metadata from Server
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [smsProvider, setSmsProvider] = useState<string | null>(null);

  // Firebase Client Phone Auth State
  const [firebaseConfirmation, setFirebaseConfirmation] = useState<any>(null);
  const [firebaseSmsStatus, setFirebaseSmsStatus] = useState<'IDLE' | 'SENDING' | 'SENT' | 'FAILED'>('IDLE');
  const [firebaseErrorCode, setFirebaseErrorCode] = useState<string | null>(null);

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
    setFirebaseErrorCode(null);
    setFirebaseSmsStatus('IDLE');

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
      // 1. Look up member & generate server-side verified OTP record
      const result = await sendOtpAction(cleanInput);

      if (!result.success) {
        setErrorMessage(result.message || (lang === 'hi' ? 'ओटीपी भेजने में असमर्थ।' : 'Could not send OTP.'));
        setIsLoading(false);
        return;
      }

      setMaskedPhone(result.maskedPhone || null);
      setMaskedEmail(result.maskedEmail || null);
      setDevOtp(result.devOtp || null);
      setSmsProvider(result.smsProvider || null);
      setOtpStep(2);
      setCountdown(60); // 60s cooldown
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMessage(result.message || 'ओटीपी प्रेषित किया गया!');
      setIsLoading(false);

      // Auto focus first OTP input box
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);

      // 2. Non-blocking Firebase Phone Auth SMS dispatch via browser SDK
      if (result.phone) {
        setFirebaseSmsStatus('SENDING');
        try {
          const verifier = setupRecaptcha('recaptcha-container');
          if (verifier) {
            sendFirebasePhoneOtp(result.phone, verifier)
              .then((confirmation) => {
                setFirebaseConfirmation(confirmation);
                setFirebaseSmsStatus('SENT');
                console.log('✅ [Firebase Auth] SMS dispatched via Firebase Phone Auth to', result.phone);
              })
              .catch((fbErr: any) => {
                console.warn('ℹ️ [Firebase Client Phone Auth Notice]:', fbErr.code || fbErr.message);
                setFirebaseSmsStatus('FAILED');
                setFirebaseErrorCode(fbErr.code || fbErr.message || 'BILLING_NOT_ENABLED');
              });
          }
        } catch (setupErr: any) {
          console.warn('ℹ️ [Firebase Recaptcha Notice]:', setupErr);
          setFirebaseSmsStatus('FAILED');
          setFirebaseErrorCode('BILLING_NOT_ENABLED');
        }
      }


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

      // 1. If Firebase Phone confirmation is active, verify via Firebase
      if (firebaseConfirmation) {
        try {
          await firebaseConfirmation.confirm(fullOtp);
          console.log('✅ [Firebase Auth] Phone OTP confirmed by Google Firebase');
        } catch (fbConfirmErr: any) {
          console.warn('[Firebase Auth] Confirmation notice, checking local engine:', fbConfirmErr);
        }
      }

      // 2. Authenticate member against Database and issue session token
      const result = await verifyOtpAction(cleanInput, fullOtp);

      if (!result.success || !result.user) {
        setErrorMessage(result.message || (lang === 'hi' ? 'सत्यापन असफल रहा।' : 'Verification failed.'));
        setIsLoading(false);
        return;
      }

      // 3. Synchronize client storage
      DPSWTStore.setCurrentUser(result.user.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', result.user.token || 'jsct_otp_token_' + result.user.id);
        localStorage.setItem('user', JSON.stringify(result.user));
      }

      // 4. Firebase Analytics & Firestore session sync
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

        {/* Top Header: Back To Home & Trust Badge */}
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
        <div className="text-center mb-5">
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

        {/* Dedicated OTP Security Banner (No Password Mode) */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-terracotta bg-terracotta/5 border border-terracotta/20 py-2 px-3 rounded-xl mb-5">
          <Fingerprint className="w-4 h-4 text-terracotta shrink-0" />
          <span>आधार व मोबाइल OTP सत्यापन (OTP-Only Login)</span>
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
        {/* PURE OTP-BASED AUTHENTICATION WORKFLOW                        */}
        {/* ------------------------------------------------------------- */}
        <div>
          {otpStep === 1 ? (
            /* STEP 1: Enter Aadhaar Number / Mobile */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal">
                  {lang === 'hi' ? 'आधार कार्ड नंबर / पंजीकृत मोबाइल नंबर' : 'Aadhaar Number / Registered Mobile'}
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
                    placeholder="12-अंकीय आधार अथवा मोबाइल (उदा. 8290224742)"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none bg-white placeholder:text-stone-400 font-mono tracking-wide transition-all"
                  />
                </div>

                <p className="text-[11px] text-driftwood leading-relaxed">
                  पंजीकरण के समय दर्ज 12-अंक आधार नंबर अथवा 10-अंकीय मोबाइल दर्ज करें।
                </p>
              </div>

              {/* Quick Helper for Registered Accounts */}
              <div className="p-2.5 rounded-xl bg-canvas-inset border border-stone-200/80 text-[11px] text-charcoal-muted">
                <div className="font-semibold text-charcoal mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-terracotta" />
                  <span>त्वरित परीक्षण (Demo / Existing Accounts):</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setAadhaarInput('8290224742')}
                    className="px-2 py-0.5 rounded bg-terracotta/10 hover:bg-terracotta/20 border border-terracotta/30 text-terracotta text-[10px] font-mono font-bold cursor-pointer"
                  >
                    Suraj (8290224742)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAadhaarInput('8912')}
                    className="px-2 py-0.5 rounded bg-white hover:bg-stone-100 border border-stone-300 text-[10px] font-mono font-semibold cursor-pointer"
                  >
                    Saleha (8912)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAadhaarInput('JSCT-UP-8290')}
                    className="px-2 py-0.5 rounded bg-white hover:bg-stone-100 border border-stone-300 text-[10px] font-mono font-semibold cursor-pointer"
                  >
                    JSCT-UP-8290
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-xs sm:text-sm shadow-warm transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99] cursor-pointer"
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
                  className="text-xs font-bold text-terracotta hover:underline shrink-0 pl-2 cursor-pointer"
                >
                  बदलें (Change)
                </button>
              </div>

              {/* Firebase Live SMS Status or Billing Notice */}
              {firebaseSmsStatus === 'SENT' ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Google Firebase द्वारा सेल्युलर SMS आपके मोबाइल पर प्रेषित किया गया।</span>
                </div>
              ) : firebaseErrorCode ? (
                <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-[11px] text-amber-950 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Firebase SMS बिलिंग / कॉन्फ़िगरेशन सूचना:</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    Google Firebase (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-900">jsct-9daf4</code>) पर वास्तविक सेल्युलर SMS भेजने हेतु <strong>Blaze प्लान</strong> (प्रति माह 10,000 फ्री SMS) अथवा Firebase Console में <strong>Phone numbers for testing</strong> सक्रिय होना आवश्यक है।
                  </p>
                  {devOtp && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleFillDevOtp}
                        className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-mono font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>तत्काल लॉगिन हेतु ओटीपी भरें: {devOtp} (क्लिक करें)</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : devOtp ? (
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-center">
                  <button
                    type="button"
                    onClick={handleFillDevOtp}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-mono font-bold text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ओटीपी भरें: {devOtp} (यहाँ क्लिक करें)</span>
                  </button>
                </div>
              ) : null}

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
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-12 text-center text-lg font-mono font-bold rounded-xl border-2 border-stone-300 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none bg-white transition-all shadow-xs"
                    />
                  ))}
                </div>
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
                    className="text-terracotta font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>पुनः ओटीपी भेजें (Resend OTP)</span>
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-xs sm:text-sm shadow-warm transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99] cursor-pointer"
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
