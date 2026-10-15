'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { DPSWTStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { loginAction } from '@/actions/auth-actions';
import {
  HeartHandshake,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || searchParams.get('returnUrl') || '/dashboard';
  const { lang } = useTranslation();

  const [identifierType, setIdentifierType] = useState<'MOBILE' | 'AADHAAR'>('MOBILE');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId) {
      setErrorMessage(
        identifierType === 'MOBILE'
          ? (lang === 'hi' ? 'कृपया अपना 10-अंकीय मोबाइल नंबर दर्ज करें।' : 'Please enter your 10-digit mobile number.')
          : (lang === 'hi' ? 'कृपया अपना आधार अथवा सदस्य आईडी दर्ज करें।' : 'Please enter your Aadhaar or Member ID.')
      );
      return;
    }

    if (!cleanPass) {
      setErrorMessage(
        lang === 'hi' ? 'कृपया पासवर्ड दर्ज करें।' : 'Please enter your password.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginAction(cleanId, cleanPass, 'MEMBER');

      if (!res.success) {
        setErrorMessage(
          res.message ||
            (lang === 'hi'
              ? 'अमान्य मोबाइल/पहचान अथवा गलत पासवर्ड।'
              : 'Invalid credentials. Please verify and try again.')
        );
        setIsLoading(false);
        return;
      }

      setSuccessMessage(
        res.message ||
          (lang === 'hi'
            ? 'लॉगिन सफल! भेजा जा रहा है...'
            : 'Login successful! Redirecting...')
      );

      if (res.user) {
        DPSWTStore.setCurrentUser(res.user.id);
      }

      setTimeout(() => {
        router.push(redirectParam);
        router.refresh();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || (lang === 'hi' ? 'सर्वर त्रुटि हुई।' : 'Server communication error.'));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-6 px-4">
      <div className="w-full max-w-[390px]">
        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6 space-y-4">
          
          {/* Header */}
          <div className="text-center">
            <div className="w-9 h-9 rounded-lg bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto mb-1.5">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-charcoal tracking-tight">
              {lang === 'hi' ? 'सदस्य लॉगिन' : 'Member Sign In'}
            </h1>
            <p className="text-[11px] text-driftwood mt-0.5">
              {lang === 'hi'
                ? 'अपने पंजीकृत विवरण से खाते में प्रवेश करें'
                : 'Enter your credentials to access your account'}
            </p>
          </div>

          {/* Toggle Method */}
          <div className="grid grid-cols-2 p-0.5 bg-stone-100 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setIdentifierType('MOBILE');
                setErrorMessage(null);
              }}
              className={`py-1.5 rounded-md transition-all text-xs ${
                identifierType === 'MOBILE'
                  ? 'bg-white text-charcoal font-semibold shadow-xs'
                  : 'text-driftwood hover:text-charcoal'
              }`}
            >
              {lang === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIdentifierType('AADHAAR');
                setErrorMessage(null);
              }}
              className={`py-1.5 rounded-md transition-all text-xs ${
                identifierType === 'AADHAAR'
                  ? 'bg-white text-charcoal font-semibold shadow-xs'
                  : 'text-driftwood hover:text-charcoal'
              }`}
            >
              {lang === 'hi' ? 'आधार / सदस्य ID' : 'Aadhaar / Member ID'}
            </button>
          </div>

          {/* Error / Success Alerts */}
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Identifier */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-charcoal">
                {identifierType === 'MOBILE'
                  ? (lang === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number')
                  : (lang === 'hi' ? 'आधार अथवा सदस्य ID' : 'Aadhaar or Member ID')}
              </label>

              {identifierType === 'MOBILE' ? (
                <div className="h-9 flex rounded-lg border border-stone-200 bg-white focus-within:ring-2 focus-within:ring-terracotta/20 focus-within:border-terracotta transition-all overflow-hidden text-xs sm:text-sm">
                  <span className="px-2.5 bg-stone-50 border-r border-stone-200 text-xs font-medium text-driftwood flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="98765 43210"
                    autoFocus
                    required
                    className="w-full px-2.5 text-xs sm:text-sm text-charcoal focus:outline-none bg-transparent"
                  />
                </div>
              ) : (
                <div className="h-9 flex items-center">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={lang === 'hi' ? 'उदा. 123456789012 या JSCT-2026-00001' : 'e.g. 123456789012 or JSCT-2026-00001'}
                    autoFocus
                    required
                    className="w-full h-9 px-2.5 rounded-lg border border-stone-200 bg-white text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                  />
                </div>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold text-charcoal">
                  {lang === 'hi' ? 'पासवर्ड' : 'Password'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotNotice(!showForgotNotice)}
                  className="text-[11px] text-terracotta hover:underline font-medium"
                >
                  {lang === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot password?'}
                </button>
              </div>

              <div className="h-9 relative flex items-center rounded-lg border border-stone-200 bg-white focus-within:ring-2 focus-within:ring-terracotta/20 focus-within:border-terracotta transition-all text-xs sm:text-sm">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-full px-2.5 text-xs sm:text-sm text-charcoal focus:outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="pr-2.5 text-driftwood hover:text-charcoal focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {showForgotNotice && (
                <div className="p-2 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-driftwood mt-1">
                  {lang === 'hi' ? (
                    <span>
                      पासवर्ड रीसेट के लिए कृपया हेल्पलाइन{' '}
                      <a href="tel:9264945875" className="font-semibold text-terracotta hover:underline">
                        9264945875
                      </a>{' '}
                      पर संपर्क करें।
                    </span>
                  ) : (
                    <span>
                      For password reset, please contact support at{' '}
                      <a href="tel:9264945875" className="font-semibold text-terracotta hover:underline">
                        9264945875
                      </a>
                      .
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center text-xs pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-driftwood">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-stone-300 text-terracotta focus:ring-terracotta/20 accent-terracotta"
                />
                <span className="text-[11px]">{lang === 'hi' ? 'मुझे याद रखें' : 'Remember me'}</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-9 rounded-lg bg-terracotta hover:bg-terracotta-hover active:bg-terracotta-dark text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed mt-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{lang === 'hi' ? 'सत्यापित हो रहा है...' : 'Signing in...'}</span>
                </>
              ) : (
                <span>{lang === 'hi' ? 'साइन इन करें' : 'Sign In'}</span>
              )}
            </button>
          </form>

          {/* Footer CTA */}
          <div className="pt-3 border-t border-stone-100 text-center text-xs text-driftwood">
            {lang === 'hi' ? 'खाता नहीं है?' : "Don't have an account?"}{' '}
            <Link href="/register" className="text-terracotta hover:underline font-semibold">
              {lang === 'hi' ? 'नया पंजीकरण करें (₹50)' : 'Register here (₹50)'}
            </Link>
          </div>

        </div>

        {/* Minimal Support Link below card */}
        <p className="text-center text-[11px] text-driftwood mt-3">
          {lang === 'hi' ? 'सहायता चाहिए?' : 'Need assistance?'}{' '}
          <a href="tel:9264945875" className="hover:text-charcoal underline">
            9264945875
          </a>
        </p>

        <p className="text-center text-[10px] text-driftwood/60 mt-2">
          © 2026 JSCT • Jan Sewa Charitable Trust
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-terracotta border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
