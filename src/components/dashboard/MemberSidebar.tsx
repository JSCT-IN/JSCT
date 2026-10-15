'use client';

import React from 'react';
import Link from 'next/link';
import { Member } from '@/types';
import {
  LayoutDashboard,
  User,
  CreditCard,
  UploadCloud,
  Layers,
  HeartHandshake,
  ListFilter,
  Upload,
  ClipboardList,
  Share2,
  Lock,
  LogOut,
  ShieldCheck,
  Globe,
  Sparkles,
  ChevronRight,
  ExternalLink,
  X
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export type DashboardTab =
  | 'overview'
  | 'profile'
  | 'id-card'
  | 'upload-death-receipt'
  | 'sahyog-list'
  | 'upload-beti-vivah'
  | 'beti-vivah-list'
  | 'upload-varshik-dan'
  | 'varshik-dan-list'
  | 'referral-points'
  | 'update-password';

interface MemberSidebarProps {
  member: Member;
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function MemberSidebar({
  member,
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  onLogout,
}: MemberSidebarProps) {
  const { lang } = useTranslation();

  const navItems: Array<{
    id: DashboardTab;
    labelHi: string;
    labelEn: string;
    icon: React.ElementType;
    badge?: string;
    badgeColor?: string;
  }> = [
    {
      id: 'overview',
      labelHi: 'डैशबोर्ड',
      labelEn: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'profile',
      labelHi: 'प्रोफ़ाइल (Edit User)',
      labelEn: 'Profile',
      icon: User,
    },
    {
      id: 'id-card',
      labelHi: 'पहचान पत्र (ID Card)',
      labelEn: 'ID Card',
      icon: CreditCard,
    },
    {
      id: 'upload-death-receipt',
      labelHi: 'मृत्यु सहयोग रसीद अपलोड',
      labelEn: 'Upload Death Receipt',
      icon: UploadCloud,
      badge: '₹50',
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'sahyog-list',
      labelHi: 'सभी सहयोग सूची',
      labelEn: 'View All Sahyog List',
      icon: Layers,
    },
    {
      id: 'upload-beti-vivah',
      labelHi: 'बेटी विवाह सहयोग रसीद',
      labelEn: 'Upload Beti Vivah Receipt',
      icon: HeartHandshake,
      badge: 'योजना',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'beti-vivah-list',
      labelHi: 'बेटी विवाह सहयोग सूची',
      labelEn: 'View All Beti Vivah List',
      icon: ListFilter,
    },
    {
      id: 'upload-varshik-dan',
      labelHi: 'वार्षिक दान / नवीनीकरण',
      labelEn: 'Upload Varshik Dan/Renewal',
      icon: Upload,
      badge: '₹50',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'varshik-dan-list',
      labelHi: 'वार्षिक दान सूची',
      labelEn: 'View All Varshik Dan Suchi',
      icon: ClipboardList,
    },
    {
      id: 'referral-points',
      labelHi: 'रेफरल पॉइंट्स (कमाई)',
      labelEn: 'Referral Points',
      icon: Share2,
      badge: '₹5/रजि.',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'update-password',
      labelHi: 'पासवर्ड बदलें',
      labelEn: 'Update Password',
      icon: Lock,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-stone-border/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-stone-border/80 px-4 flex items-center justify-between gap-3 shrink-0 bg-canvas-inset/50">
          <Link href="/" className="flex items-center gap-2.5 min-w-0" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-terracotta to-terracotta-hover text-white flex items-center justify-center font-bold text-base shadow-warm shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-editorial text-lg font-bold text-charcoal tracking-tight block truncate">
                JSCT PORTAL
              </span>
              <span className="text-[10px] text-driftwood block truncate font-medium">
                जन सेवा चैरिटेबल ट्रस्ट
              </span>
            </div>
          </Link>

          {/* Close Button for Mobile Drawer */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Sidebar"
            className="lg:hidden p-2 rounded-xl text-driftwood hover:text-charcoal hover:bg-white border border-stone-border/60 transition-all touch-target"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Mini Profile Card */}
        <div className="p-3 border-b border-stone-border/70 bg-gradient-to-br from-canvas-inset to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-charcoal to-charcoal-muted text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              {(member.full_name || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-charcoal truncate block">
                  {member.full_name}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 shrink-0">
                  {member.pool || 'Pool C'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-driftwood truncate">
                ID: {member.membership_id || member.id.slice(0, 8)}
              </p>
              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-emerald-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>सत्यापित सदस्य</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
          <div className="px-2.5 py-1 text-[11px] font-bold text-driftwood uppercase tracking-wider">
            {lang === 'hi' ? 'मुख्य मेन्यू' : 'Main Menu'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left touch-target ${
                  isActive
                    ? 'bg-terracotta text-white font-bold shadow-warm shadow-terracotta/20'
                    : 'text-charcoal hover:bg-canvas-inset hover:text-terracotta active:scale-98'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white stroke-[2.4]' : 'text-driftwood stroke-[2]'
                    }`}
                  />
                  <span className="truncate">
                    {lang === 'hi' ? item.labelHi : item.labelEn}
                  </span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      isActive ? 'bg-white text-terracotta' : item.badgeColor || 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-stone-border/80 bg-canvas-inset/60 shrink-0 space-y-2">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-charcoal bg-white border border-stone-border/70 hover:bg-canvas transition-all"
            onClick={onClose}
          >
            <Globe className="w-3.5 h-3.5 text-terracotta" />
            <span>{lang === 'hi' ? 'सार्वजनिक वेबसाइट पर जाएं' : 'Visit Public Site'}</span>
          </Link>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'लॉगआउट करें' : 'Logout Account'}</span>
          </button>

          <div className="text-center pt-1 text-[10px] text-driftwood">
            JSCT Portal v2.4.0 • Enterprise Edition
          </div>
        </div>
      </aside>
    </>
  );
}
