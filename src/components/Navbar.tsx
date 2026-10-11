'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DPSWTStore } from '@/lib/store';
import { Member } from '@/types';
import { useTranslation } from '@/lib/i18n';
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
  Languages
} from 'lucide-react';

export default function Navbar() {
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

  const navLinks = [
    { href: '/', label: t.home },
    { href: '/appeals', label: t.appeals, badge: t.live },
    { href: '/rules', label: t.rules },
    { href: '/contact', label: t.directory },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-border transition-all">
      {/* Top Banner: Zero-Custody & Trust Metrics */}
      <div className="bg-canvas-inset border-b border-stone-border/60 px-4 py-1.5 text-xs text-driftwood">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-terracotta/10 text-terracotta tracking-wider uppercase">
              {t.zeroCustody}
            </span>
            <span className="hidden sm:inline text-charcoal font-medium text-[11px]">
              {t.zeroCustodySub}
            </span>
            <span className="sm:hidden font-medium text-charcoal text-[11px]">
              {lang === 'hi' ? 'सीधे नामिनी के खाते में ₹50 सहयोग' : 'Direct ₹50 to Nominee Account'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
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
        <div className="flex items-center justify-between h-19">
          
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-terracotta to-terracotta-hover flex items-center justify-center text-white shadow-warm group-hover:shadow-warm-md transition-all">
              <HeartHandshake className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial text-2xl font-bold tracking-tight text-charcoal leading-none">
                  DPSWT
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-canvas-inset border border-stone-border text-terracotta rounded font-semibold tracking-wider">
                  {lang === 'hi' ? 'उत्तर प्रदेश' : 'UP'}
                </span>
              </div>
              <p className="text-[11px] text-driftwood font-medium tracking-tight mt-0.5 hidden xs:block">
                Direct People Support Welfare Team
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-charcoal bg-canvas-inset border border-stone-border/80 shadow-xs'
                      : 'text-driftwood hover:text-charcoal hover:bg-canvas-inset/60'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
                  )}
                </Link>
              );
            })}

            {/* Dashboard Link */}
            <Link
              href="/dashboard"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                pathname.startsWith('/dashboard') && !pathname.includes('admin')
                  ? 'text-charcoal bg-canvas-inset border border-stone-border/80 shadow-xs'
                  : 'text-driftwood hover:text-charcoal hover:bg-canvas-inset/60'
              }`}
            >
              <User className="w-3.5 h-3.5 text-terracotta" />
              <span>{t.dashboard}</span>
            </Link>

            {/* Inspector/Admin Audit Link */}
            <Link
              href="/admin/inspector"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                pathname.includes('/admin/inspector')
                  ? 'text-sage font-bold bg-sage-light border border-sage/20 shadow-xs'
                  : 'text-driftwood hover:text-charcoal hover:bg-canvas-inset/60'
              }`}
            >
              <SearchCheck className="w-3.5 h-3.5 text-sage" />
              <span>{t.inspectorPanel}</span>
            </Link>
          </nav>

          {/* Right Action Cluster: Language Switcher, Contribute CTA, Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* 1-Click Language Switcher (हिन्दी | English) */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-border bg-canvas-inset/60 hover:bg-canvas-inset text-charcoal text-xs font-bold transition-all shadow-xs touch-target"
              title="भाषा बदलें / Switch Language"
            >
              <Languages className="w-4 h-4 text-terracotta" />
              <span>{lang === 'hi' ? 'EN' : 'हिन्दी'}</span>
            </button>

            {/* Quick Contribute CTA Button */}
            <Link
              href="/appeals"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white shadow-warm transition-all transform active:scale-[0.98] touch-target"
            >
              <span>{t.contribute50}</span>
              <Sparkles className="w-3.5 h-3.5 text-white/90" />
            </Link>

            {/* Role / Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-stone-border bg-white hover:bg-canvas-inset text-left transition-all touch-target shadow-xs"
                title="डेमो प्रोफाइल बदलें (Switch Demo Role)"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                    currentUser?.role === 'ADMIN'
                      ? 'bg-charcoal'
                      : currentUser?.role === 'INSPECTOR'
                      ? 'bg-sage'
                      : 'bg-terracotta'
                  }`}
                >
                  {currentUser?.role === 'ADMIN' ? 'AD' : currentUser?.role === 'INSPECTOR' ? 'IN' : 'ME'}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-charcoal leading-tight truncate max-w-[110px]">
                    {currentUser?.full_name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-driftwood font-mono">
                    {currentUser?.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-driftwood" />
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
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl border border-stone-border text-charcoal hover:bg-canvas-inset touch-target flex items-center justify-center shadow-xs"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-border bg-white px-4 pt-3 pb-6 space-y-3 shadow-warm-lg animate-in slide-in-from-top duration-200">
          <div className="p-3.5 rounded-2xl bg-canvas-inset border border-stone-border flex items-center justify-between">
            <div>
              <div className="text-xs text-driftwood font-medium">{t.activeUser}:</div>
              <div className="text-sm font-bold text-charcoal">{currentUser?.full_name}</div>
              <div className="text-xs font-mono text-terracotta font-bold">{currentUser?.membership_id}</div>
            </div>
            <span className="px-2.5 py-1 text-xs rounded-xl bg-white font-mono border border-stone-border text-charcoal font-bold shadow-xs">
              {currentUser?.role}
            </span>
          </div>

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
        </div>
      )}
    </header>
  );
}
