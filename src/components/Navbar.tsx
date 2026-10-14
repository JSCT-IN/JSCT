'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { DPSWTStore } from '@/lib/store';
import { Member } from '@/types';
import { useTranslation } from '@/lib/i18n';
import { logoutAction } from '@/actions/auth-actions';
import { 
  HeartHandshake, 
  Menu, 
  X, 
  ShieldCheck, 
  User, 
  SearchCheck, 
  ChevronDown,
  Sparkles,
  BookOpen,
  PhoneCall,
  RotateCcw,
  Languages,
  LogOut,
  LogIn
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { lang, t, toggleLanguage } = useTranslation();
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  useEffect(() => {
    const syncUser = () => {
      setCurrentUser(DPSWTStore.getCurrentUser());
      setAllMembers(DPSWTStore.getMembers());
    };
    syncUser();

    window.addEventListener('dpswt_state_change', syncUser);
    return () => window.removeEventListener('dpswt_state_change', syncUser);
  }, []);

  const handleSwitchUser = (userId: string) => {
    DPSWTStore.setCurrentUser(userId);
    setRoleDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (e) {
      console.warn('Logout action error:', e);
    }
    DPSWTStore.logout();
    setRoleDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push('/login');
  };

  const navLinks = [
    { href: '/', label: t.home },
    { href: '/member', label: lang === 'hi' ? 'सदस्य सूची' : 'Member List' },
    { href: '/appeals', label: t.appeals, hasBadge: true },
    { href: '/rules', label: t.rules },
    { href: '/contact', label: t.directory },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-border transition-all">
      {/* Top Banner: Zero-Custody & Trust Metrics */}
      <div className="bg-canvas-inset border-b border-stone-border/60 px-4 py-1.5 text-xs text-driftwood">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-terracotta/10 text-terracotta tracking-wider uppercase">
              {t.zeroCustody}
            </span>
            <span className="hidden sm:inline text-charcoal font-medium text-[11px]">
              {t.zeroCustodySub}
            </span>
            <span className="sm:hidden font-medium text-charcoal text-[11px]">
              {lang === 'hi' ? 'सीधे नामिनी के खाते में ₹50 सहयोग' : 'Direct ₹50 to Nominee'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] shrink-0 whitespace-nowrap">
            <span className="text-sage font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
              {t.verifiedMembersCount}
            </span>
            <span className="text-stone-border">•</span>
            <Link 
              href="/rules" 
              className="hover:text-charcoal transition-colors font-medium underline decoration-dotted text-charcoal-muted"
            >
              {t.understand75Rule}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-3">
          
          {/* Logo & Brand Identity (JSCT - Jan Sewa Charitable Trust) */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-terracotta via-terracotta to-terracotta-hover flex items-center justify-center text-white shadow-warm group-hover:shadow-warm-md transition-all shrink-0">
              <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-editorial text-xl sm:text-2xl font-black tracking-tight text-charcoal leading-none">
                  JSCT
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 bg-terracotta/10 text-terracotta border border-terracotta/20 rounded-md tracking-wider hidden sm:inline-block">
                  {lang === 'hi' ? 'उत्तर प्रदेश' : 'UP'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-driftwood font-medium tracking-tight mt-0.5 whitespace-nowrap hidden md:block">
                Jan Sewa Charitable Trust
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links - Strict Uniform Height (h-9), Laser-Straight Baseline */}
          <nav className="hidden xl:flex items-center gap-1.5 shrink-0">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`h-9 px-3 rounded-xl text-xs font-semibold whitespace-nowrap inline-flex items-center justify-center gap-1.5 border transition-all shrink-0 ${
                    isActive
                      ? 'text-terracotta bg-terracotta/10 border-terracotta/20 font-bold'
                      : 'text-charcoal-muted hover:text-charcoal hover:bg-canvas-inset border-transparent'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.hasBadge && (
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
                  )}
                </Link>
              );
            })}

            {/* Portal Direct Links: Dashboard & Audit */}
            <Link
              href="/dashboard"
              className={`h-9 px-3 rounded-xl text-xs font-semibold whitespace-nowrap inline-flex items-center justify-center gap-1.5 border transition-all shrink-0 ${
                pathname.startsWith('/dashboard') && !pathname.includes('admin')
                  ? 'text-charcoal bg-canvas-inset border-stone-border font-bold'
                  : 'text-charcoal-muted hover:text-charcoal hover:bg-canvas-inset border-transparent'
              }`}
            >
              <User className="w-3.5 h-3.5 text-terracotta" />
              <span>{t.dashboard}</span>
            </Link>

            <Link
              href="/admin/inspector"
              className={`h-9 px-3 rounded-xl text-xs font-semibold whitespace-nowrap inline-flex items-center justify-center gap-1.5 border transition-all shrink-0 ${
                pathname.includes('/admin/inspector')
                  ? 'text-sage font-bold bg-sage-light border-sage/20'
                  : 'text-charcoal-muted hover:text-charcoal hover:bg-canvas-inset border-transparent'
              }`}
            >
              <SearchCheck className="w-3.5 h-3.5 text-sage" />
              <span>{t.inspectorPanel}</span>
            </Link>
          </nav>

          {/* Right Action Cluster: Strict Uniform Height (h-9), Flawless Horizontal Alignment */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Register CTA Pill (Prominent, High-Priority, Never Wraps) */}
            <Link
              href="/register"
              className={`hidden sm:inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all shrink-0 ${
                pathname === '/register'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-500/10 text-amber-800 hover:bg-amber-600 hover:text-white border-amber-300/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'नया पंजीकरण' : 'Register Now'}</span>
            </Link>

            {/* 1-Click Language Switcher (हिन्दी | English) */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center justify-center gap-1 sm:gap-1.5 h-9 px-2 sm:px-3 rounded-xl border border-stone-border bg-canvas-inset/60 hover:bg-canvas-inset text-charcoal text-xs font-bold whitespace-nowrap transition-all shadow-xs shrink-0"
              title="भाषा बदलें / Switch Language"
            >
              <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terracotta" />
              <span>{lang === 'hi' ? 'EN' : 'हिन्दी'}</span>
            </button>

            {/* Primary Action: Contribute (₹50) */}
            <Link
              href="/appeals"
              className="hidden md:inline-flex items-center justify-center gap-1.5 h-9 px-3.5 sm:px-4 rounded-xl text-xs font-bold whitespace-nowrap bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white shadow-warm hover:shadow-warm-md transition-all active:scale-[0.98] shrink-0"
            >
              <span>{t.contribute50}</span>
              <Sparkles className="w-3.5 h-3.5 text-white/90" />
            </Link>

            {/* User Profile / Role Dropdown OR Login Button */}
            {currentUser ? (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="inline-flex items-center gap-2 h-9 px-2 sm:px-2.5 rounded-xl border border-stone-border bg-white hover:bg-canvas-inset text-left whitespace-nowrap transition-all shadow-xs shrink-0"
                  title="प्रोफाइल व रोल बदलें (User Profile)"
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] text-white shrink-0 ${
                      currentUser?.role === 'ADMIN'
                        ? 'bg-charcoal'
                        : currentUser?.role === 'INSPECTOR'
                        ? 'bg-sage'
                        : 'bg-terracotta'
                    }`}
                  >
                    {currentUser?.role === 'ADMIN' ? 'AD' : currentUser?.role === 'INSPECTOR' ? 'IN' : 'ME'}
                  </div>
                  <div className="hidden lg:flex flex-col justify-center leading-none">
                    <span className="text-xs font-bold text-charcoal truncate max-w-[85px] leading-tight">
                      {currentUser?.full_name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-driftwood font-mono leading-none mt-0.5">
                      {currentUser?.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-driftwood shrink-0" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-stone-border shadow-warm-lg p-3 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-2 py-1.5 border-b border-stone-border/60 mb-2">
                      <div className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                        {t.switchRole}
                      </div>
                      <div className="text-[11px] text-driftwood mt-0.5">
                        {lang === 'hi' ? 'परीक्षण हेतु सदस्य, निरीक्षक या एडमिन चुनें:' : 'Select persona to test permissions:'}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {allMembers.map((m) => {
                        const isSelected = currentUser?.id === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleSwitchUser(m.id)}
                            className={`w-full text-left p-2.5 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
                              isSelected
                                ? 'bg-canvas-inset text-charcoal font-semibold border border-stone-border shadow-xs'
                                : 'text-driftwood hover:bg-canvas-inset/60 hover:text-charcoal'
                            }`}
                          >
                            <span
                              className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                                m.role === 'ADMIN'
                                  ? 'bg-charcoal'
                                  : m.role === 'INSPECTOR'
                                  ? 'bg-sage'
                                  : 'bg-terracotta'
                              }`}
                            />
                            <div className="flex-1">
                              <div className="text-charcoal font-bold flex items-center justify-between">
                                <span>{m.full_name}</span>
                                {isSelected && (
                                  <span className="text-[9px] px-1.5 py-0.2 bg-sage-light text-sage rounded font-mono font-bold">
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-driftwood font-mono mt-0.5">
                                {m.membership_id} • {m.role}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2.5 mt-2 border-t border-stone-border/60 px-2 flex justify-between text-xs">
                      <Link
                        href="/dashboard"
                        onClick={() => setRoleDropdownOpen(false)}
                        className="text-terracotta hover:underline font-semibold"
                      >
                        {lang === 'hi' ? 'डैशबोर्ड देखें →' : 'View Dashboard →'}
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          DPSWTStore.resetToInitial();
                          setRoleDropdownOpen(false);
                        }}
                        className="text-driftwood hover:text-charcoal flex items-center gap-1 text-[11px]"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{lang === 'hi' ? 'रीसेट डेटा' : 'Reset Data'}</span>
                      </button>
                    </div>

                    {/* Dedicated Logout Button */}
                    <div className="pt-2 mt-2 border-t border-stone-border/60">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 border border-rose-200 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'लॉगआउट करें (Log Out)' : 'Log Out'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-1 sm:gap-1.5 h-9 px-2.5 sm:px-3.5 rounded-xl border border-stone-border bg-white hover:bg-canvas-inset text-charcoal text-xs font-bold whitespace-nowrap transition-all shadow-xs shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terracotta" />
                <span>{lang === 'hi' ? 'लॉगिन' : 'Log In'}</span>
              </Link>
            )}

            {/* Mobile Hamburger Toggle (synchronized with xl breakpoint) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-stone-border text-charcoal hover:bg-canvas-inset shadow-xs shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-stone-border bg-white px-4 pt-3 pb-6 space-y-3 shadow-warm-lg animate-in slide-in-from-top duration-200">
          {currentUser ? (
            <div className="p-3.5 rounded-2xl bg-canvas-inset border border-stone-border flex items-center justify-between">
              <div>
                <div className="text-xs text-driftwood font-medium">{t.activeUser}:</div>
                <div className="text-sm font-bold text-charcoal">{currentUser.full_name}</div>
                <div className="text-xs font-mono text-terracotta font-bold">{currentUser.membership_id}</div>
              </div>
              <span className="px-2.5 py-1 text-xs rounded-xl bg-white font-mono border border-stone-border text-charcoal font-bold shadow-xs">
                {currentUser.role}
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-900">
                  {lang === 'hi' ? 'अतिथि मोड (Not Logged In)' : 'Guest Mode (Not Logged In)'}
                </div>
                <div className="text-[11px] text-amber-700">
                  {lang === 'hi' ? 'अपने खाते में प्रवेश हेतु लॉगिन करें' : 'Log in to view ID card & compliance'}
                </div>
              </div>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-charcoal text-white text-xs font-bold shadow-xs"
              >
                {lang === 'hi' ? 'लॉगिन' : 'Log In'}
              </Link>
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-charcoal hover:bg-canvas-inset touch-target"
              >
                <span>{link.label}</span>
                <span className="text-driftwood text-[11px]">→</span>
              </Link>
            ))}

            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 touch-target"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{lang === 'hi' ? 'नया पंजीकरण (₹50)' : 'Register Now (₹50)'}</span>
              </span>
              <span>→</span>
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-terracotta bg-terracotta-light/40 hover:bg-terracotta-light touch-target"
            >
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{t.dashboard}</span>
              </span>
              <span>→</span>
            </Link>

            <Link
              href="/admin/inspector"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-sage bg-sage-light hover:bg-sage/20 touch-target"
            >
              <span className="flex items-center gap-2">
                <SearchCheck className="w-4 h-4" />
                <span>{t.inspectorPanel}</span>
              </span>
              <span>→</span>
            </Link>

            <Link
              href="/appeals/create"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-charcoal hover:bg-canvas-inset touch-target"
            >
              <span>{t.newAppealCta}</span>
              <span>→</span>
            </Link>
          </div>

          {/* Action Row: Language + Contribute */}
          <div className="pt-2 border-t border-stone-border flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              className="w-1/3 py-3 rounded-2xl bg-canvas-inset border border-stone-border text-xs font-bold text-charcoal flex items-center justify-center gap-1.5"
            >
              <Languages className="w-4 h-4 text-terracotta" />
              <span>{lang === 'hi' ? 'English' : 'हिन्दी'}</span>
            </button>

            <Link
              href="/appeals"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-terracotta to-terracotta-hover text-white font-bold text-xs shadow-warm"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>{t.contribute50}</span>
            </Link>
          </div>

          {/* Mobile Logout Button (if logged in) */}
          {currentUser ? (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 border border-rose-200 shadow-xs transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{lang === 'hi' ? 'लॉगआउट करें (Log Out)' : 'Log Out'}</span>
              </button>
            </div>
          ) : (
            <div className="pt-1">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-2xl bg-charcoal text-white font-bold text-xs flex items-center justify-center gap-2 shadow-warm"
              >
                <LogIn className="w-4 h-4 text-terracotta" />
                <span>{lang === 'hi' ? 'सदस्य लॉगिन (Member Login)' : 'Member Login'}</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
