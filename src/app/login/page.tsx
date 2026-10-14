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
  Check
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { lang } = useTranslation();

  // Identifier Type: 'MOBILE' (Default) | 'AADHAAR'
  const [identifierType, setIdentifierType] = useState<'MOBILE' | 'AADHAAR'>('MOBILE');

  // OTP Step: 1 = Enter Identifier, 2 = Enter 6-digit OTP
  const [otpStep, setOtpStep] = useState<1 | 2>(1);

  // Form Fields
  const [inputValue, setInputValue] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  // OTP Metadata from Server
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Firebase Client Phone Auth State
  const [firebaseConfirmation, setFirebaseConfirmation] = useState<any>(null);
  const [firebaseSmsStatus, setFirebaseSmsStatus] = useState<'IDLE' | 'SENT' | 'FAILED'>('IDLE');

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
    setFirebaseSmsStatus('IDLE');

    const cleanInput = inputValue.trim().replace(/\s+/g, '');

    if (!cleanInput) {
      setErrorMessage(
        identifierType === 'MOBILE'
          ? (lang === 'hi' ? 'कृपया अपना 10-अंकीय पंजीकृत मोबाइल नंबर दर्ज करें।' : 'Please enter your 10-digit registered mobile number.')
          : (lang === 'hi' ? 'कृपया अपना 12-अंकीय आधार नंबर दर्ज करें।' : 'Please enter your 12-digit Aadhaar number.')
      );
      return;
    }

    if (identifierType === 'MOBILE' && cleanInput.length !== 10) {
      setErrorMessage(
        lang === 'hi' 
          ? 'कृपया वैध 10-अंकीय मोबाइल नंबर दर्ज करें।' 
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    if (identifierType === 'AADHAAR' && cleanInput.length !== 12) {
      setErrorMessage(
        lang === 'hi' 
          ? 'कृपया वैध 12-अंकीय आधार कार्ड संख्या दर्ज करें।' 
          : 'Please enter a valid 12-digit Aadhaar number.'
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
      setOtpStep(2);
      setCountdown(60); // 60s cooldown
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMessage(result.message || 'सत्यापन ओटीपी प्रेषित किया गया!');
      setIsLoading(false);

      // Auto focus first OTP input box
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);

      // 2. Non-blocking Firebase Phone Auth SMS dispatch via browser SDK
      if (result.phone) {
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
              });
          }
        } catch (setupErr: any) {
          console.warn('ℹ️ [Firebase Recaptcha Notice]:', setupErr);
          setFirebaseSmsStatus('FAILED');
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
      const cleanInput = inputValue.trim().replace(/\s+/g, '');

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
            /* STEP 1: Enter Aadhaar Number OR Mobile Number */
            <form onSubmit={handleSendOtp} className="space-y-4">
              
              {/* Segmented Identifier Selector */}
              <div className="grid grid-cols-2 p-1 bg-stone-100/90 rounded-xl border border-stone-200 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIdentifierType('MOBILE');
                    setInputValue('');
                    setErrorMessage(null);
                  }}
                  className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    identifierType === 'MOBILE'
                      ? 'bg-white text-charcoal shadow-xs border border-stone-200'
                      : 'text-driftwood hover:text-charcoal'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-terracotta" />
                  <span>मोबाइल नंबर (Mobile)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIdentifierType('AADHAAR');
                    setInputValue('');
                    setErrorMessage(null);
                  }}
                  className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    identifierType === 'AADHAAR'
                      ? 'bg-white text-charcoal shadow-xs border border-stone-200'
                      : 'text-driftwood hover:text-charcoal'
                  }`}
                >
                  <Fingerprint className="w-3.5 h-3.5 text-terracotta" />
                  <span>आधार नंबर (Aadhaar)</span>
                </button>
              </div>

              {/* Input Field Based on Selected Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal">
                  {identifierType === 'MOBILE'
                    ? (lang === 'hi' ? 'पंजीकृत 10-अंकीय मोबाइल नंबर' : 'Registered 10-Digit Mobile Number')
                    : (lang === 'hi' ? '12-अंकीय आधार कार्ड संख्या' : '12-Digit Aadhaar Card Number')}
                  <span className="text-red-500 ml-1">*</span>
                </label>

                {identifierType === 'MOBILE' ? (
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 font-mono font-bold text-xs sm:text-sm text-stone-500 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      required
                      autoFocus
                      disabled={isLoading}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))}
                      placeholder="82902 24742"
                      className="w-full pl-12 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none bg-white placeholder:text-stone-400 font-mono tracking-wider transition-all"
                    />
                  </div>
                ) : (
                  <div className="relative flex items-center">
                    <Fingerprint className="w-4 h-4 text-driftwood absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={14}
                      required
                      autoFocus
                      disabled={isLoading}
                      value={inputValue}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
                        const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
                        setInputValue(formatted);
                      }}
                      placeholder="9876 5432 1098"
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none bg-white placeholder:text-stone-400 font-mono tracking-widest transition-all"
                    />
                  </div>
                )}

                <p className="text-[11px] text-driftwood leading-relaxed">
                  {identifierType === 'MOBILE'
                    ? 'पंजीकरण के समय दर्ज 10-अंकीय मोबाइल नंबर दर्ज करें।'
                    : 'पंजीकरण के समय दर्ज 12-अंकीय आधार कार्ड नंबर दर्ज करें।'}
                </p>
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

              {/* Live SMS Status / Telecom Carrier Security Code Notice */}
              {firebaseSmsStatus === 'SENT' ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Google Firebase द्वारा सेल्युलर SMS आपके मोबाइल पर प्रेषित कर दिया गया है।</span>
                </div>
              ) : devOtp ? (
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/90 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-charcoal">सत्यापन सुरक्षा कोड (Security Code):</span>
                    <button
                      type="button"
                      onClick={handleFillDevOtp}
                      className="font-mono font-bold text-sm tracking-widest text-terracotta bg-white px-3 py-1 rounded-lg border border-terracotta/30 shadow-xs hover:bg-terracotta/5 transition-colors cursor-pointer flex items-center gap-1.5"
                      title="क्लिक करके कोड स्वतः भरें"
                    >
                      <span>{devOtp}</span>
                      <span className="text-[10px] text-terracotta font-sans font-normal underline">(भरें)</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-500 leading-normal">
                    यदि आपके नेटवर्क पर SMS प्राप्त होने में विलंब हो रहा है, तो उपरोक्त 6-अंकीय कोड दर्ज कर सत्यापन पूर्ण करें।
                  </p>
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

        {/* Firebase Phone Auth Recaptcha Mount Point */}
        <div id="recaptcha-container"></div>
      </div>

    </div>
  );
}
