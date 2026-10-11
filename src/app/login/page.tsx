'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DPSWTStore } from '@/lib/store';
import { INITIAL_MEMBERS } from '@/lib/mockData';
import { Member } from '@/types';
import { useTranslation } from '@/lib/i18n';
import { loginAction } from '@/actions/auth-actions';
import { 
  HeartHandshake, 
  Loader2, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { lang } = useTranslation();

  // Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showQuickAccess, setShowQuickAccess] = useState(false);

  // Real JSCT Members list for 1-click testing
  const allMembers: Member[] = INITIAL_MEMBERS;

  // Handle Login Submission via Server Action
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId) {
      setErrorMessage(
        lang === 'hi' 
          ? 'कृपया आधार संख्या या सदस्यता क्रमांक दर्ज करें।' 
          : 'Please enter Aadhaar number or Member ID.'
      );
      return;
    }

    if (!cleanPass) {
      setErrorMessage(
        lang === 'hi' 
          ? 'कृपया अपना पासवर्ड दर्ज करें।' 
          : 'Please enter your password.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginAction(cleanId, cleanPass, 'AUTO');

      if (!result.success || !result.user) {
        setErrorMessage(result.message || (lang === 'hi' ? 'लॉगिन असफल रहा।' : 'Login failed. Please try again.'));
        setIsLoading(false);
        return;
      }

      // Successfully authenticated with secure HTTP-only cookies
      DPSWTStore.setCurrentUser(result.user.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', result.user.token || 'jsct_token_' + result.user.id);
        localStorage.setItem('user', JSON.stringify(result.user));
      }

      setSuccessMessage(
        lang === 'hi'
          ? `सफलतापूर्वक लॉगिन संपन्न! स्वागत है ${result.user.full_name}`
          : `Login successful! Welcome ${result.user.full_name}`
      );

      setTimeout(() => {
        router.push(result.redirectTo || '/dashboard');
      }, 500);

    } catch (err: any) {
      setErrorMessage(err.message || 'लॉगिन प्रक्रिया में त्रुटि हुई।');
      setIsLoading(false);
    }
  };

  // 1-Click Fast Persona Login
  const handleQuickPersonaLogin = async (member: Member) => {
    setIdentifier(member.membership_id);
    setPassword('••••••••');
    setErrorMessage(null);
    setIsLoading(true);
    setSuccessMessage(
      lang === 'hi' 
        ? `${member.full_name} (${member.role}) के रूप में प्रवेश हो रहा है...` 
        : `Logging in as ${member.full_name}...`
    );

    try {
      const result = await loginAction(member.membership_id, 'Password@123', 'AUTO');

      if (!result.success || !result.user) {
        setErrorMessage(result.message || 'प्रमाणीकरण विफल।');
        setIsLoading(false);
        return;
      }

      DPSWTStore.setCurrentUser(result.user.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', result.user.token || 'jsct_token_' + result.user.id);
        localStorage.setItem('user', JSON.stringify(result.user));
      }

      setTimeout(() => {
        router.push(result.redirectTo || '/dashboard');
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'त्रुटि हुई।');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-[#f6f7fb]">
      
      {/* Compact & Clean Login Card (Matching dpswt.com/login) */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-stone-200/90 relative">
        
        {/* Top Header: Back To Home */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'मुख्य पृष्ठ (Back To Home)' : 'Back To Home'}</span>
          </Link>
        </div>

        {/* Centered Brand Emblem & Heading */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-terracotta to-amber-600 text-white flex items-center justify-center mx-auto shadow-sm mb-2">
            <HeartHandshake className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-charcoal">
            {lang === 'hi' ? 'सदस्य पोर्टल लॉगिन' : 'Member Login'}
          </h1>
          <p className="text-[11px] text-driftwood mt-0.5">
            {lang === 'hi' ? 'जन सेवा चैरिटेबल ट्रस्ट (JSCT)' : 'Jan Sewa Charitable Trust (JSCT)'}
          </p>
        </div>

        {/* Error / Success Alerts */}
        {errorMessage && (
          <div className="p-2.5 mb-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium leading-snug">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-2.5 mb-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium leading-snug">{successMessage}</span>
          </div>
        )}

        {/* Streamlined Form (Directly matching dpswt.com) */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          
          {/* Field 1: Aadhaar Card Number / Member ID */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-charcoal">
              {lang === 'hi' ? 'आधार कार्ड संख्या / सदस्यता क्रमांक' : 'Enter Aadhar Card Number / Member ID'}
              <span className="text-red-500 font-bold ml-1">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="उदा. 8912 / JSCT-UP-001 / 9876500001"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none bg-white placeholder:text-stone-400 disabled:opacity-50 transition-all"
            />
          </div>

          {/* Field 2: Password with integrated Eye Toggle */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-charcoal">
              {lang === 'hi' ? 'पासवर्ड (Password)' : 'Password'}
              <span className="text-red-500 font-bold ml-1">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="अपना पासवर्ड दर्ज करें"
                className="w-full px-3 py-2 pr-9 text-xs sm:text-sm rounded-lg border border-stone-300 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none bg-white placeholder:text-stone-400 disabled:opacity-50 transition-all"
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

          {/* Remember Me & Forgot Password in Single Row */}
          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <label className="flex items-center gap-1.5 cursor-pointer text-driftwood">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-terracotta focus:ring-terracotta"
              />
              <span>{lang === 'hi' ? 'याद रखें' : 'Remember me'}</span>
            </label>
            <a
              href="tel:9264946875"
              className="text-terracotta hover:underline font-medium"
            >
              {lang === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
            </a>
          </div>

          {/* Submit Button */}
          <div className="pt-1.5">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{lang === 'hi' ? 'प्रतीक्षा करें...' : 'Logging in...'}</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'लॉग इन करें (Log In)' : 'Log In'}</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* Bottom Link: Register */}
        <div className="text-center mt-4 pt-3 border-t border-stone-200/80">
          <p className="text-xs text-driftwood">
            {lang === 'hi' ? 'पंजीकृत नहीं हैं?' : "Don't have an account?"}{' '}
            <Link
              href="/register"
              className="font-bold text-terracotta hover:underline ml-1"
            >
              {lang === 'hi' ? 'नया पंजीकरण करें (₹50) →' : 'Register Here (₹50) →'}
            </Link>
          </p>
        </div>

        {/* Collapsed Fast 1-Click Persona Access (Unobtrusive) */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setShowQuickAccess(!showQuickAccess)}
            className="text-[11px] text-driftwood hover:text-charcoal inline-flex items-center gap-1 font-medium transition-colors"
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>{lang === 'hi' ? 'त्वरित 1-क्लिक टेस्ट' : 'Quick 1-Click Access'}</span>
            {showQuickAccess ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showQuickAccess && (
            <div className="mt-2.5 p-2 rounded-lg bg-stone-50 border border-stone-200/80 text-left space-y-1.5 animate-in fade-in duration-150">
              <div className="text-[10px] font-semibold text-driftwood uppercase tracking-wider px-1">
                Official Office Bearers:
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {allMembers.slice(0, 4).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleQuickPersonaLogin(m)}
                    className="p-1.5 rounded-md bg-white hover:bg-stone-100 border border-stone-200 text-[10px] flex items-center justify-between transition-colors text-left"
                  >
                    <span className="font-semibold text-charcoal truncate">
                      {m.full_name.split(' ')[0]}
                    </span>
                    <span className="text-[8px] px-1 py-0.5 rounded font-mono font-bold bg-stone-100 text-stone-600">
                      {m.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
