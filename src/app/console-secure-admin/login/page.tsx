'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminLoginAction } from '@/actions/admin-auth-actions';
import { useTranslation } from '@/lib/i18n';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '/console-secure-admin/dashboard';
  const errorParam = searchParams.get('error');
  const { lang } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam === 'access_denied' 
      ? (lang === 'hi' 
          ? 'पहुंच अस्वीकृत: केवल अधिकृत व्यवस्थापकों को प्रवेश की अनुमति है।' 
          : 'Access Denied: Only authorized administrators are permitted.')
      : null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage(
        lang === 'hi' 
          ? 'कृपया व्यवस्थापक ईमेल एवं सुरक्षा पासवर्ड दर्ज करें।' 
          : 'Please enter administrator email and security password.'
      );
      return;
    }

    try {
      setIsLoading(true);
      const res = await adminLoginAction({
        email: cleanEmail,
        password: cleanPassword,
        rememberMe,
      });

      if (!res.success) {
        setErrorMessage(
          res.message || 
          (lang === 'hi' 
            ? 'प्रमाणीकरण विफल। कृपया सही ईमेल व पासवर्ड जांचें।' 
            : 'Authentication failed. Please verify credentials.')
        );
        setIsLoading(false);
      } else {
        setSuccessMessage(
          res.message || 
          (lang === 'hi' 
            ? 'प्रमाणीकरण सफल! प्रशासनिक कंसोल लोड हो रहा है...' 
            : 'Authentication successful! Loading admin console...')
        );
        setTimeout(() => {
          router.push(redirectParam);
          router.refresh();
        }, 500);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 
        (lang === 'hi' 
          ? 'सुरक्षा सर्वर से संपर्क नहीं हो सका।' 
          : 'Could not connect to security authentication server.')
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-canvas-inset/40 flex flex-col items-center justify-center py-4 sm:py-6 px-4 font-sans">
      <div className="w-full max-w-sm sm:max-w-md space-y-3 sm:space-y-4">

        {/* Top Back Link & Security Badge */}
        <div className="flex items-center justify-between text-xs text-driftwood px-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-terracotta font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-terracotta/10 text-terracotta border border-terracotta/20 font-bold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-terracotta" />
            <span>{lang === 'hi' ? 'सुरक्षित प्रशासनिक पोर्टल' : 'Secure Admin Portal'}</span>
          </div>
        </div>

        {/* Main Clean Card (Fitted & Compact, No Unnecessary Scroll) */}
        <div className="bg-white rounded-2xl border border-stone-border shadow-warm p-5 sm:p-6 space-y-4">
          
          {/* Header with Official Trust Emblem */}
          <div className="text-center space-y-1.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta via-terracotta to-terracotta-hover text-white flex items-center justify-center mx-auto shadow-warm">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>

            <h1 className="font-editorial text-xl sm:text-2xl font-black text-charcoal tracking-tight">
              {lang === 'hi' ? 'व्यवस्थापक प्रमाणीकरण' : 'Administrator Sign In'}
            </h1>
            <p className="text-xs text-driftwood font-medium">
              {lang === 'hi' ? 'जन सेवा चैरिटेबल ट्रस्ट (JSCT)' : 'Jan Sewa Charitable Trust (JSCT)'}
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="font-semibold">{successMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-charcoal tracking-wide">
                {lang === 'hi' ? 'व्यवस्थापक ईमेल' : 'Admin Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-driftwood absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@jsct.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-canvas-inset/50 border border-stone-border text-charcoal text-xs sm:text-sm placeholder:text-driftwood focus:outline-none focus:bg-white focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-charcoal tracking-wide">
                {lang === 'hi' ? 'सुरक्षा पासवर्ड' : 'Security Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-driftwood absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2 rounded-xl bg-canvas-inset/50 border border-stone-border text-charcoal text-xs sm:text-sm placeholder:text-driftwood focus:outline-none focus:bg-white focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-driftwood hover:text-charcoal absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
                  aria-label={
                    showPassword 
                      ? (lang === 'hi' ? 'पासवर्ड छुपाएं' : 'Hide password') 
                      : (lang === 'hi' ? 'पासवर्ड देखें' : 'Show password')
                  }
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-stone-border text-terracotta accent-terracotta focus:ring-terracotta/20"
                />
                <span className="text-xs text-charcoal font-medium">
                  {lang === 'hi' ? 'सत्र सुरक्षित रखें' : 'Remember Session'}
                </span>
              </label>
              <span className="text-[10px] text-driftwood font-mono uppercase tracking-wider">
                {lang === 'hi' ? 'एन्क्रिप्टेड सत्र' : 'ENCRYPTED SESSION'}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-terracotta hover:bg-terracotta-hover active:scale-[0.99] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-warm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{lang === 'hi' ? 'प्रमाणीकरण जारी है...' : 'Authenticating...'}</span>
                </>
              ) : (
                <>
                  <span>{lang === 'hi' ? 'प्रशासनिक कंसोल में प्रवेश करें' : 'Enter Admin Console'}</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>

          </form>

          {/* Bottom Member Portal Link */}
          <div className="pt-2 border-t border-stone-border/60 text-center">
            <Link
              href="/login"
              className="text-xs text-driftwood hover:text-terracotta font-medium transition-colors inline-flex items-center gap-1"
            >
              <span>{lang === 'hi' ? '← सामान्य सदस्य लॉगिन' : '← Member Login Portal'}</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-140px)] bg-canvas-inset/40 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-terracotta border-t-transparent animate-spin" />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
