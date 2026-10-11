'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { DPSWTStore } from '@/lib/store';
import { INITIAL_MEMBERS } from '@/lib/mockData';
import { Member } from '@/types';
import { useTranslation } from '@/lib/i18n';
import { loginAction } from '@/actions/auth-actions';
import { 
  HeartHandshake, 
  User, 
  SearchCheck, 
  ShieldCheck, 
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
  const searchParams = useSearchParams();
  const { lang } = useTranslation();

  // Active Login Module: 'MEMBER' | 'INSPECTOR' | 'ADMIN'
  const initialModule = searchParams.get('tab') === 'admin' 
    ? 'ADMIN' 
    : searchParams.get('tab') === 'inspector' 
    ? 'INSPECTOR' 
    : 'MEMBER';
  const [activeModule, setActiveModule] = useState<'MEMBER' | 'INSPECTOR' | 'ADMIN'>(initialModule);

  // Form State (matching dpswt.com clean aadhaarNumber + password authentication)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPersonas, setShowPersonas] = useState(false);

  // Real JSCT Members list for fast testing
  const allMembers: Member[] = INITIAL_MEMBERS;

  // Handle Real Login Submission via Server Action
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId) {
      setErrorMessage(
        activeModule === 'ADMIN'
          ? (lang === 'hi' ? 'कृपया एडमिन यूजरनेम या मोबाइल दर्ज करें।' : 'Please enter Admin username or mobile.')
          : (lang === 'hi' ? 'कृपया आधार संख्या या सदस्यता क्रमांक दर्ज करें।' : 'Please enter Aadhaar Number or Member ID.')
      );
      return;
    }

    if (!cleanPass) {
      setErrorMessage(lang === 'hi' ? 'कृपया अपना पासवर्ड दर्ज करें।' : 'Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginAction(cleanId, cleanPass, activeModule);

      if (!result.success || !result.user) {
        setErrorMessage(result.message || (lang === 'hi' ? 'लॉगिन असफल रहा।' : 'Login failed. Please try again.'));
        setIsLoading(false);
        return;
      }

      // Successfully authenticated via Server Action with secure HTTP-only cookies!
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

      // Redirect based on server action return route
      setTimeout(() => {
        router.push(result.redirectTo || '/dashboard');
      }, 600);

    } catch (err: any) {
      setErrorMessage(err.message || 'लॉगिन प्रक्रिया में त्रुटि हुई।');
      setIsLoading(false);
    }
  };

  // 1-Click Persona Login for official bearers & testing
  const handleQuickPersonaLogin = async (member: Member) => {
    setIdentifier(member.membership_id);
    setPassword('••••••••');
    setErrorMessage(null);
    setIsLoading(true);
    setSuccessMessage(
      lang === 'hi' 
        ? `${member.full_name} (${member.role}) के रूप में सुरक्षित प्रवेश हो रहा है...` 
        : `Authenticating securely as ${member.full_name}...`
    );

    try {
      const targetModule = (member.role === 'ADMIN' && activeModule === 'ADMIN')
        ? 'ADMIN'
        : (member.role === 'INSPECTOR' || member.role === 'ADMIN') && activeModule === 'INSPECTOR'
        ? 'INSPECTOR'
        : 'MEMBER';

      const result = await loginAction(member.membership_id, 'Password@123', targetModule);

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
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'त्रुटि हुई।');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-8 bg-[#f6f7fb]">
      
      {/* Clean Centered Login Card (Styled cleanly like dpswt.com/login) */}
      <div className="w-full max-w-[480px] bg-white rounded-2xl p-6 sm:p-9 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-stone-200/80 relative">
        
        {/* Top Header: Back To Home Link */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta hover:text-terracotta-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'hi' ? 'मुख्य पृष्ठ (Back To Home)' : 'Back To Home'}</span>
          </Link>
          <span className="text-[11px] font-mono font-bold text-driftwood uppercase tracking-wider">
            JSCT Portal
          </span>
        </div>

        {/* Centered Logo & Trust Branding */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-terracotta to-amber-600 text-white flex items-center justify-center mx-auto shadow-md shadow-terracotta/20 mb-3">
            <HeartHandshake className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-charcoal">
            {activeModule === 'ADMIN'
              ? (lang === 'hi' ? 'व्यवस्थापक कक्ष लॉगिन' : 'Admin Portal Login')
              : activeModule === 'INSPECTOR'
              ? (lang === 'hi' ? 'जिला सत्यापन लॉगिन' : 'Inspector Desk Login')
              : (lang === 'hi' ? 'सदस्य पोर्टल लॉगिन' : 'Member Portal Login')}
          </h1>
          <p className="text-xs text-driftwood mt-1">
            {lang === 'hi'
              ? 'जन सेवा चैरिटेबल ट्रस्ट (JSCT)'
              : 'Jan Sewa Charitable Trust (JSCT)'}
          </p>
        </div>

        {/* Clean Segmented Role Switcher */}
        <div className="p-1 rounded-xl bg-canvas-inset border border-stone-200 grid grid-cols-3 gap-1 text-xs font-bold mb-5">
          <button
            type="button"
            onClick={() => { setActiveModule('MEMBER'); setErrorMessage(null); }}
            className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeModule === 'MEMBER'
                ? 'bg-white text-terracotta shadow-xs font-bold border border-stone-200'
                : 'text-driftwood hover:text-charcoal'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'सदस्य' : 'Member'}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveModule('INSPECTOR'); setErrorMessage(null); }}
            className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeModule === 'INSPECTOR'
                ? 'bg-white text-sage shadow-xs font-bold border border-stone-200'
                : 'text-driftwood hover:text-charcoal'
            }`}
          >
            <SearchCheck className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'निरीक्षक' : 'Inspector'}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveModule('ADMIN'); setErrorMessage(null); }}
            className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeModule === 'ADMIN'
                ? 'bg-white text-charcoal shadow-xs font-bold border border-stone-200'
                : 'text-driftwood hover:text-charcoal'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'व्यवस्थापक' : 'Admin'}</span>
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="font-semibold leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Clean Login Form (Exact dpswt.com Field Structure) */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Field 1: Aadhaar Card Number / Member ID */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-charcoal">
              {activeModule === 'ADMIN'
                ? (lang === 'hi' ? 'एडमिन यूजरनेम या मोबाइल नंबर' : 'Enter Admin Username or Mobile')
                : (lang === 'hi' ? 'आधार कार्ड संख्या / सदस्यता क्रमांक' : 'Enter Aadhar Card Number')}
              <span className="text-red-500 font-bold ml-1">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={
                activeModule === 'ADMIN'
                  ? 'उदा. admin या JSCT-UP-001'
                  : activeModule === 'INSPECTOR'
                  ? 'उदा. JSCT-UP-003 या 9876500003'
                  : 'Enter Aadhar Card Number (उदा. 8912 या JSCT-UP-004)'
              }
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none text-xs sm:text-sm bg-white placeholder:text-stone-400 disabled:opacity-50 transition-all"
            />
          </div>

          {/* Field 2: Password with Eye Toggle (matches dpswt eyeBtn) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-charcoal">
                {lang === 'hi' ? 'पासवर्ड (Password)' : 'Password'}
                <span className="text-red-500 font-bold ml-1">*</span>
              </label>
              <a
                href="tel:9264946875"
                className="text-[11px] text-terracotta hover:underline font-semibold"
              >
                {lang === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
              </a>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lang === 'hi' ? 'अपना पासवर्ड दर्ज करें' : 'Enter password'}
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-stone-300 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none text-xs sm:text-sm bg-white placeholder:text-stone-400 disabled:opacity-50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 text-stone-400 hover:text-charcoal p-1 transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Option */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-driftwood">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-terracotta focus:ring-terracotta"
              />
              <span>{lang === 'hi' ? 'इस डिवाइस पर याद रखें' : 'Remember me'}</span>
            </label>
            <span className="text-[11px] font-mono text-sage font-semibold">
              256-bit SSL Secure
            </span>
          </div>

          {/* Clean Submit Button (matching dpswt .loginBtn) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto sm:min-w-[140px] px-6 py-2.5 rounded-lg bg-terracotta hover:bg-terracotta-hover text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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

        {/* Collapsible Fast Persona Login Drawer (Clean & Unobtrusive) */}
        <div className="mt-6 pt-5 border-t border-stone-200/80">
          <button
            type="button"
            onClick={() => setShowPersonas(!showPersonas)}
            className="w-full flex items-center justify-between text-xs text-driftwood hover:text-charcoal font-semibold py-1 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'hi' ? 'त्वरित परीक्षण पदाधिकारी (1-Click Bearers)' : 'Quick Test Personas (1-Click)'}</span>
            </span>
            {showPersonas ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showPersonas && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-left pt-1">
              {allMembers.slice(0, 6).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleQuickPersonaLogin(m)}
                  className="p-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-charcoal group-hover:text-terracotta truncate text-[11px]">
                      {m.full_name.split(' ')[0]}
                    </span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                        m.role === 'ADMIN'
                          ? 'bg-charcoal text-white'
                          : m.role === 'INSPECTOR'
                          ? 'bg-sage text-white'
                          : 'bg-terracotta text-white'
                      }`}
                    >
                      {m.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-driftwood font-mono mt-0.5">
                    {m.membership_id}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Register & Help Links */}
        <div className="text-center mt-5 pt-4 border-t border-stone-200/60 space-y-2">
          <p className="text-xs text-driftwood">
            {lang === 'hi' ? 'अभी तक पंजीकृत नहीं हैं?' : "Don't have an account yet?"}{' '}
            <Link
              href="/register"
              className="font-bold text-terracotta hover:underline ml-1"
            >
              {lang === 'hi' ? 'नया सदस्य पंजीकरण करें (₹50) →' : 'Register Here (₹50) →'}
            </Link>
          </p>
          <p className="text-[11px] text-driftwood">
            {lang === 'hi' ? 'सहायता केंद्र:' : 'Helpline:'}{' '}
            <a href="tel:9264946875" className="font-mono text-charcoal hover:underline">
              +91 9264946875
            </a>
          </p>
        </div>

      </div>

    </div>
  );
}
