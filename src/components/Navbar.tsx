'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  User, 
  ChevronDown, 
  ChevronRight,
  Sparkles, 
  PhoneCall, 
  Languages, 
  LogOut, 
  LogIn,
  CreditCard,
  BookOpen,
  Users,
  Home,
  Phone
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { lang, t, toggleLanguage } = useTranslation();
  
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncUser = () => {
      const user = DPSWTStore.getCurrentUser();
      setCurrentUser(user);
    };
    syncUser();

    window.addEventListener('dpswt_state_change', syncUser);
    return () => window.removeEventListener('dpswt_state_change', syncUser);
  }, []);

  // Close all menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setRoleDropdownOpen(false);
    setMoreMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (moreMenuRef.current && !moreMenuRef.current.contains(target)) {
        setMoreMenuOpen(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(target)) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Base Public Links
  const primaryNavLinks = [
    { href: '/', label: t.home, icon: Home },
    { href: '/niyamawali', label: lang === 'hi' ? 'नियमावली' : 'Niyamawali', icon: BookOpen },
    { href: '/member-card', label: lang === 'hi' ? 'पहचान पत्र' : 'ID Card', icon: CreditCard },
    { href: '/appeals', label: lang === 'hi' ? 'सहयोग सूची' : 'Appeals', icon: HeartHandshake, hasBadge: true },
    { href: '/member', label: lang === 'hi' ? 'सदस्य सूची' : 'Members', icon: Users },
  ];

  // Secondary Links
  const secondaryNavLinks = [
    { href: '/contact', label: t.directory, icon: PhoneCall },
    ...(currentUser ? [{ href: '/dashboard', label: t.dashboard, icon: User }] : []),
  ];

  // Hide public website navbar on protected admin and member dashboard routes
  if (
    pathname.startsWith('/console-secure-admin') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dashboard')
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-border transition-all w-full">
      {/* MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-terracotta via-terracotta to-terracotta-hover flex items-center justify-center text-white shadow-warm group-hover:shadow-warm-md transition-all shrink-0">
              <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-editorial text-lg sm:text-2xl font-black tracking-tight text-charcoal leading-none">
                  JSCT
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-terracotta/10 text-terracotta border border-terracotta/20 rounded-md tracking-wider sm:hidden">
                  UP
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-terracotta/10 text-terracotta border border-terracotta/20 rounded-md tracking-wider hidden sm:inline">
                  {lang === 'hi' ? 'उत्तर प्रदेश' : 'UP'}
                </span>
              </div>
              <p className="text-[10px] text-driftwood font-medium tracking-tight mt-0.5 whitespace-nowrap hidden md:block">
                Jan Sewa Charitable Trust
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links (>= 1024px lg) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
            {primaryNavLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`h-9 px-2.5 xl:px-3 rounded-xl text-xs font-semibold whitespace-nowrap inline-flex items-center justify-center gap-1.5 border transition-all ${
                    isActive
                      ? 'text-terracotta bg-terracotta/10 border-terracotta/20 font-bold shadow-2xs'
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

            {/* 'More / अधिक ▾' Compact Dropdown */}
            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`h-9 px-2.5 rounded-xl text-xs font-semibold whitespace-nowrap inline-flex items-center justify-center gap-1 border transition-all ${
                  moreMenuOpen
                    ? 'text-charcoal bg-canvas-inset border-stone-border font-bold'
                    : 'text-charcoal-muted hover:text-charcoal hover:bg-canvas-inset border-transparent'
                }`}
                title="अतिरिक्त विकल्प"
              >
                <span>{lang === 'hi' ? 'अधिक' : 'More'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180 text-terracotta' : ''}`} />
              </button>

              {moreMenuOpen && (
                <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-white border border-stone-border shadow-warm-lg p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                  {secondaryNavLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMoreMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive 
                            ? 'bg-terracotta/10 text-terracotta font-bold' 
                            : 'text-charcoal hover:bg-canvas-inset'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-driftwood shrink-0" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Cluster: Guaranteed to fit all mobile screens cleanly */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* 1. Register CTA Button */}
            <Link
              href="/register"
              className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 h-8 sm:h-9 px-2 sm:px-3.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                pathname === '/register'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                  : 'bg-amber-500/15 text-amber-900 hover:bg-amber-600 hover:text-white border-amber-400/40 shadow-2xs'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 group-hover:text-white shrink-0" />
              <span className="hidden sm:inline">{lang === 'hi' ? 'नया पंजीकरण' : 'Register'}</span>
              <span className="sm:hidden">{lang === 'hi' ? 'रजिस्टर' : 'Join'}</span>
            </Link>

            {/* 2. Language Switcher (हिन्दी | EN) */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center justify-center gap-1 h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl border border-stone-border bg-canvas-inset/60 hover:bg-canvas-inset text-charcoal text-xs font-bold whitespace-nowrap transition-all shadow-2xs"
              title="भाषा बदलें / Switch Language"
            >
              <Languages className="w-3.5 h-3.5 text-terracotta shrink-0" />
              <span>{lang === 'hi' ? 'EN' : 'हिन्दी'}</span>
            </button>

            {/* 3. Contribute Pill (Desktop 2xl) */}
            <Link
              href="/appeals"
              className="hidden 2xl:inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap bg-gradient-to-r from-terracotta to-terracotta-hover text-white shadow-warm hover:shadow-warm-md transition-all active:scale-[0.98]"
            >
              <span>{t.contribute50}</span>
              <Sparkles className="w-3.5 h-3.5 text-white/90" />
            </Link>

            {/* 4. User Profile / Role Dropdown OR Login Button */}
            {currentUser ? (
              <div className="relative shrink-0" ref={roleDropdownRef}>
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="inline-flex items-center gap-1.5 h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl border border-stone-border bg-white hover:bg-canvas-inset text-left whitespace-nowrap transition-all shadow-2xs"
                  title="प्रोफाइल व रोल मेनू"
                >
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center font-bold text-[10px] text-white shrink-0 ${
                      currentUser?.role === 'ADMIN'
                        ? 'bg-charcoal'
                        : currentUser?.role === 'INSPECTOR'
                        ? 'bg-sage'
                        : 'bg-terracotta'
                    }`}
                  >
                    {currentUser?.role === 'ADMIN' ? 'AD' : currentUser?.role === 'INSPECTOR' ? 'IN' : 'ME'}
                  </div>
                  <span className="hidden xl:inline text-xs font-bold text-charcoal truncate max-w-[70px]">
                    {currentUser?.full_name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-driftwood shrink-0" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-stone-border shadow-warm-lg p-3 z-50 animate-in fade-in zoom-in-95 space-y-2">
                    <div className="px-2 py-2 bg-canvas-inset rounded-xl border border-stone-border/60">
                      <div className="text-xs font-bold text-charcoal truncate">
                        {currentUser?.full_name}
                      </div>
                      <div className="text-[11px] text-terracotta font-mono font-bold mt-0.5">
                        {currentUser?.membership_id}
                      </div>
                      {currentUser?.department && (
                        <div className="text-[10px] text-driftwood truncate mt-0.5">
                          {currentUser.department}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setRoleDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-charcoal hover:bg-canvas-inset transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-driftwood" />
                        <span>{t.dashboard}</span>
                      </Link>

                      <Link
                        href="/member-card"
                        onClick={() => setRoleDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-charcoal hover:bg-canvas-inset transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-driftwood" />
                        <span>{lang === 'hi' ? 'पहचान पत्र (ID Card)' : 'Identity Card'}</span>
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-stone-border/60">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-200 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'लॉगआउट' : 'Log Out'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Desktop/Tablet Login Button */}
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl border border-stone-border bg-white hover:bg-canvas-inset text-charcoal text-xs font-bold whitespace-nowrap transition-all shadow-2xs"
                >
                  <LogIn className="w-3.5 h-3.5 text-terracotta" />
                  <span>{lang === 'hi' ? 'लॉगिन' : 'Log In'}</span>
                </Link>

                {/* Mobile Quick Login Icon Button (Visible on screens >= 360px) */}
                <Link
                  href="/login"
                  className="hidden min-[360px]:inline-flex sm:hidden items-center justify-center w-8 h-8 rounded-xl border border-stone-border bg-white hover:bg-canvas-inset text-charcoal shadow-2xs shrink-0"
                  title="लॉगिन करें / Log In"
                >
                  <LogIn className="w-3.5 h-3.5 text-terracotta" />
                </Link>
              </>
            )}

            {/* 5. Mobile Hamburger Toggle (Always visible on mobile & tablet, guaranteed on-screen) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-stone-border bg-white hover:bg-canvas-inset text-charcoal shadow-2xs shrink-0 active:scale-95 transition-all"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-terracotta" />
              ) : (
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

          </div>

        </div>
      </div>

      {/* 3. ENTERPRISE MOBILE DRAWER MENU & BACKDROP */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 top-[88px] sm:top-[97px] bg-charcoal/50 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Menu Panel */}
          <div 
            ref={mobileDrawerRef}
            className="fixed top-[88px] sm:top-[97px] left-0 right-0 max-h-[calc(100vh-88px)] sm:max-h-[calc(100vh-97px)] overflow-y-auto bg-white border-b border-stone-border shadow-warm-2xl z-50 lg:hidden px-4 pt-3 pb-24 space-y-3 animate-in slide-in-from-top-2 duration-200"
          >
            {/* User / Guest Status Card */}
            {currentUser ? (
              <div className="p-3.5 rounded-2xl bg-canvas-inset border border-stone-border flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-driftwood font-medium">{t.activeUser}:</div>
                  <div className="text-sm font-bold text-charcoal">{currentUser.full_name}</div>
                  <div className="text-xs font-mono text-terracotta font-bold mt-0.5">{currentUser.membership_id}</div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="px-2.5 py-1 text-[11px] rounded-xl bg-white font-mono border border-stone-border text-charcoal font-bold shadow-xs">
                    {currentUser.role}
                  </span>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[11px] text-terracotta font-bold hover:underline"
                  >
                    {t.dashboard} →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-center justify-between shadow-2xs">
                <div>
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>{lang === 'hi' ? 'अतिथि मोड (Guest)' : 'Guest Mode'}</span>
                  </div>
                  <div className="text-[11px] text-amber-800/90 mt-0.5">
                    {lang === 'hi' ? 'खाते में प्रवेश हेतु लॉगिन करें' : 'Sign in to access your portal'}
                  </div>
                </div>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-10 min-h-[40px] px-3.5 rounded-xl bg-charcoal hover:bg-charcoal/90 text-white text-xs font-bold shadow-xs inline-flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-300" />
                  <span>{lang === 'hi' ? 'लॉगिन करें' : 'Log In'}</span>
                </Link>
              </div>
            )}

            {/* Navigation Links */}
            <div className="space-y-1 pt-1">
              {primaryNavLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] transition-all ${
                      isActive 
                        ? 'bg-terracotta/10 text-terracotta font-bold border-l-4 border-terracotta' 
                        : 'text-charcoal hover:bg-canvas-inset'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-terracotta' : 'text-driftwood'}`} />
                      <span>{link.label}</span>
                      {link.hasBadge && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-terracotta text-white">
                          {t.live}
                        </span>
                      )}
                    </span>
                    <ChevronRight className="w-4 h-4 text-driftwood/60" />
                  </Link>
                );
              })}

              {secondaryNavLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] transition-all ${
                      isActive 
                        ? 'bg-terracotta/10 text-terracotta font-bold border-l-4 border-terracotta' 
                        : 'text-charcoal hover:bg-canvas-inset'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-terracotta' : 'text-driftwood'}`} />
                      <span>{link.label}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-driftwood/60" />
                  </Link>
                );
              })}

              {/* Prominent Register CTA in Drawer */}
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-100/90 to-amber-50 hover:from-amber-200/90 hover:to-amber-100 border border-amber-300/80 min-h-[44px] shadow-2xs mt-2 transition-all"
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>{lang === 'hi' ? 'नया सदस्यता पंजीकरण (मात्र ₹50)' : 'New Member Registration (₹50)'}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-amber-800" />
              </Link>
            </div>

            {/* Quick Actions Footer inside Drawer */}
            <div className="pt-3 border-t border-stone-border space-y-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-stone-border bg-canvas-inset hover:bg-stone-200/60 text-charcoal font-bold text-xs flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
                >
                  <Languages className="w-4 h-4 text-terracotta" />
                  <span>{lang === 'hi' ? 'English में देखें' : 'हिन्दी में बदलें'}</span>
                </button>

                <a
                  href="tel:9264945875"
                  className="flex-1 py-2.5 px-3 rounded-xl border border-stone-border bg-canvas-inset hover:bg-stone-200/60 text-charcoal font-bold text-xs flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
                >
                  <Phone className="w-4 h-4 text-sage" />
                  <span>{lang === 'hi' ? 'हेल्पलाइन' : 'Helpline'}</span>
                </a>
              </div>

              {currentUser && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-200 transition-colors min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'सुरक्षित लॉगआउट' : 'Secure Log Out'}</span>
                </button>
              )}
            </div>

          </div>
        </>
      )}

    </header>
  );
}
