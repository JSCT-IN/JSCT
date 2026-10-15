'use client';

import React from 'react';
import Link from 'next/link';
import { Member } from '@/types';
import { 
  Menu, 
  X, 
  LogOut, 
  Globe, 
  Languages, 
  ShieldCheck, 
  HeartHandshake,
  Sparkles,
  ExternalLink,
  Bell
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface MemberTopNavProps {
  member: Member;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

export default function MemberTopNav({
  member,
  sidebarOpen,
  onToggleSidebar,
  onLogout,
}: MemberTopNavProps) {
  const { lang, toggleLanguage } = useTranslation();

  const poolName = member.pool || 'Pool C';
  const memberName = (member.full_name || 'MEMBER').toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-border/80 shadow-xs">
      <div className="px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Left: Hamburger & Member Identity */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? 'Close Menu' : 'Open Menu'}
            className="p-2 sm:p-2.5 rounded-xl border border-stone-border/70 text-charcoal hover:bg-canvas-inset active:scale-95 transition-all touch-target flex items-center justify-center shrink-0"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Member Name and Pool Badge (Matching Screenshot: AMBRISH KUMAR[Pool C]) */}
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm sm:text-base lg:text-lg font-bold text-charcoal truncate tracking-tight flex items-center gap-1.5 sm:gap-2">
              <span className="truncate">{memberName}</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shrink-0 shadow-xs">
                [{poolName}]
              </span>
            </h1>

            {/* Active Pill (desktop) */}
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sage/10 text-sage border border-sage/20 shrink-0">
              <ShieldCheck className="w-3 h-3" />
              <span>सक्रिय सदस्य</span>
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Back to Public Website */}
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-driftwood hover:text-charcoal hover:bg-canvas-inset border border-stone-border/60 transition-all"
            title="मुख्य वेबसाइट पर जाएं"
          >
            <Globe className="w-3.5 h-3.5 text-terracotta" />
            <span>मुख्य वेबसाइट</span>
          </Link>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2.5 py-1.5 rounded-xl border border-stone-border/60 text-xs font-bold text-driftwood hover:text-charcoal hover:bg-canvas-inset transition-all flex items-center gap-1"
            title="भाषा बदलें (Toggle Language)"
          >
            <Languages className="w-3.5 h-3.5 text-terracotta" />
            <span className="uppercase text-[11px]">{lang === 'hi' ? 'EN' : 'हिन्दी'}</span>
          </button>

          {/* Logout Button (Matching Screenshot: ⏻ Logout) */}
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 active:scale-95 transition-all shadow-xs"
            title="सत्र समाप्त करें (Logout)"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
}
