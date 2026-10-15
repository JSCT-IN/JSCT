'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DPSWTStore } from '@/lib/store';
import { INITIAL_MEMBERS } from '@/lib/mockData';
import { Appeal, Member } from '@/types';
import { formatINR, formatIndianNumber } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import UpiModal from '@/components/UpiModal';
import SlipUploadModal from '@/components/SlipUploadModal';
import {
  HeartHandshake,
  ShieldCheck,
  Users,
  Coins,
  Scale,
  Award,
  ArrowRight,
  Sparkles,
  QrCode,
  FileCheck2,
  CheckCircle2,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Calendar,
  Building2,
  Check,
  CheckCheck,
  Copy,
  Sliders,
  ArrowUpRight,
  Info,
  Clock,
  UserCheck,
  ZoomIn,
  X,
  Eye,
  Gift,
  ExternalLink,
} from 'lucide-react';

export default function HomePage() {
  const { lang, t } = useTranslation();
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [selectedAppealForUpi, setSelectedAppealForUpi] = useState<Appeal | null>(null);
  const [selectedAppealForSlip, setSelectedAppealForSlip] = useState<Appeal | null>(null);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Scheme Poster Lightbox State
  const [isPosterLightboxOpen, setIsPosterLightboxOpen] = useState(false);

  // 75% Compliance Interactive Simulator State
  const [simTotalAppeals, setSimTotalAppeals] = useState(20);
  const [simContributed, setSimContributed] = useState(16);

  // Real JSCT Members List (The 7 real office bearers from handwritten record)
  const realMembers: Member[] = INITIAL_MEMBERS;

  useEffect(() => {
    const load = () => {
      setAppeals(DPSWTStore.getAppeals());
    };
    load();

    window.addEventListener('dpswt_state_change', load);
    return () => window.removeEventListener('dpswt_state_change', load);
  }, []);

  // Escape key handler for poster lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPosterLightboxOpen(false);
      }
    };
    if (isPosterLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPosterLightboxOpen]);

  const simRatio = Math.round((simContributed / simTotalAppeals) * 100);
  const simIsEligible = simRatio >= 75;

  const announcements = [
    {
      id: 1,
      badge: lang === 'hi' ? '75% नियम' : '75% Rule',
      text: lang === 'hi'
        ? 'संस्था की सभी सहयोग अपीलों में न्यूनतम 75% सहयोग पूर्ण होना अनिवार्य है।'
        : 'Minimum 75% contribution compliance is mandatory for all appeals.',
      highlight: true
    },
    {
      id: 2,
      badge: lang === 'hi' ? 'सदस्यता शुल्क' : 'Fee Notice',
      text: lang === 'hi'
        ? 'सदस्यता शुल्क मात्र ₹50 एवं वार्षिक नवीनीकरण ₹50 है। कोई अप्रत्यक्ष या छुपा हुआ शुल्क नहीं।'
        : 'Joining fee is only ₹50 and annual renewal ₹50. No hidden commissions.',
      highlight: false
    },
    {
      id: 3,
      badge: lang === 'hi' ? 'शून्य-कस्टडी' : 'Zero-Custody',
      text: lang === 'hi'
        ? 'कोई मध्यस्थ या वॉलेट नहीं — सहायता राशि सीधे पीड़ित परिवार के अधिकृत नामिनी के बैंक खाते / UPI में जमा होती है।'
        : 'Direct P2P aid straight into verified nominee bank accounts & UPI.',
      highlight: true
    },
    {
      id: 4,
      badge: lang === 'hi' ? 'संबल गारंटी' : 'Relief Aid',
      text: lang === 'hi'
        ? '6 माह लाकिंग अवधि पूर्ण होने पर असामयिक निधन पर ₹15 लाख तक का सामाजिक सुरक्षा संबल।'
        : 'Up to ₹15 Lakhs mutual bereavement solidarity upon 6-month active compliance.',
      highlight: false
    },
    {
      id: 5,
      badge: lang === 'hi' ? 'हेल्पलाइन' : '24x7 Help',
      text: lang === 'hi'
        ? 'आपातकालीन सहायता केंद्र: +91 9264945875 • +91 9936639215 (समस्त 75 जनपदों में कार्यकारिणी दल सक्रिय)'
        : 'Helpline: +91 9264945875 • +91 9936639215 (Active across all 75 districts)',
      highlight: false
    }
  ];

  return (
    <div className="space-y-12 sm:space-y-20 pb-24 sm:pb-28">
      
      {/* ------------------------------------------------------------------ */}
      {/* TOP ANNOUNCEMENT INFINITE MARQUEE TICKER (Smooth, Hover-Pause)     */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative bg-gradient-to-r from-terracotta via-amber-600 to-terracotta text-white py-2 px-3 sm:px-4 shadow-sm overflow-hidden select-none border-b border-amber-700/30">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          
          {/* Pinned Left Badge: Always visible anchor */}
          <div className="shrink-0 flex items-center gap-1.5 z-20">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider border border-white/25 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-200 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300 -ml-3.5" />
              <span>{lang === 'hi' ? 'ताज़ा घोषणा' : 'LIVE ALERT'}</span>
            </span>
          </div>

          {/* Scrolling Channel with smooth gradient fade masks */}
          <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]">
            <div className="animate-marquee flex items-center gap-8 py-0.5 whitespace-nowrap text-xs sm:text-sm font-medium">
              
              {/* First Track */}
              {announcements.map((item) => (
                <div key={`track1-${item.id}`} className="inline-flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-black/30 font-bold uppercase font-mono tracking-tight text-amber-200">
                    {item.badge}
                  </span>
                  <span className={item.highlight ? 'font-bold text-white' : 'text-amber-50 font-medium'}>
                    {item.text}
                  </span>
                  <span className="text-white/40 text-xs px-2">•</span>
                </div>
              ))}

              {/* Duplicate Track (for seamless infinite continuous loop) */}
              {announcements.map((item) => (
                <div key={`track2-${item.id}`} className="inline-flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-black/30 font-bold uppercase font-mono tracking-tight text-amber-200">
                    {item.badge}
                  </span>
                  <span className={item.highlight ? 'font-bold text-white' : 'text-amber-50 font-medium'}>
                    {item.text}
                  </span>
                  <span className="text-white/40 text-xs px-2">•</span>
                </div>
              ))}

            </div>
          </div>

          {/* Pinned Right Quick Actions */}
          <div className="shrink-0 hidden lg:flex items-center gap-2.5 z-20 text-xs font-semibold pl-2">
            <a
              href="tel:9264945875"
              className="inline-flex items-center gap-1 text-white/90 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-200" />
              <span className="font-mono text-[11px]">+91 9264945875</span>
            </a>
            <Link
              href="/rules"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all text-[11px] font-bold border border-white/20 shadow-xs"
            >
              <span>{lang === 'hi' ? 'नियमावली' : 'Rules'}</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* ENTERPRISE HERO SECTION (Authoritative, Uncluttered & Grounded)   */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-br from-white via-canvas-inset/60 to-amber-50/30 border border-stone-border shadow-warm-md overflow-hidden">
          
          {/* Ambient light gradient blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-terracotta/8 rounded-full blur-3xl pointer-events-none -z-0" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-sage/8 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12">
            
            {/* Left Column: Authoritative Value Proposition & Direct CTAs */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              
              {/* Institutional Public Trust Seal Pill */}
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-white border border-stone-border shadow-2xs text-[11px] sm:text-xs">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sage"></span>
                </span>
                <span className="font-mono text-terracotta font-bold shrink-0">JSCT</span>
                <span className="text-stone-300 shrink-0">•</span>
                <span className="text-charcoal font-semibold truncate">
                  {lang === 'hi' ? 'उत्तर प्रदेश शासन सार्वजनिक न्यास अंतर्गत पंजीकृत' : 'Registered Public Charitable Trust (Govt. of U.P.)'}
                </span>
              </div>

              {/* Authoritative Balanced Headline (Clean line cadence, zero collision) */}
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] xl:text-[3rem] font-black tracking-tight text-charcoal leading-[1.2] sm:leading-[1.22]">
                  {lang === 'hi' ? (
                    <>
                      <span className="block text-charcoal">जन से जन तक सहयोग,</span>
                      <span className="block mt-1 sm:mt-1.5 bg-gradient-to-r from-terracotta via-amber-600 to-terracotta-dark bg-clip-text text-transparent">
                        हर जरूरतमंद परिवार को संबल
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="block text-charcoal">People-to-People Solidarity,</span>
                      <span className="block mt-1.5 sm:mt-2 bg-gradient-to-r from-terracotta via-amber-600 to-terracotta-dark bg-clip-text text-transparent">
                        Lifelong Relief to Every Family
                      </span>
                    </>
                  )}
                </h1>
              </div>

              {/* Value Proposition Description */}
              <p className="text-sm sm:text-base text-driftwood leading-relaxed max-w-xl font-normal">
                {lang === 'hi'
                  ? 'उत्तर प्रदेश के समर्पित कर्मचारियों एवं नागरिकों का 100% पारदर्शी, गैर-सरकारी पारस्परिक सहयोग मंच। किसी भी साथी के आकस्मिक आपदा या निधन पर प्रत्येक सदस्य द्वारा मात्र ₹50 का सीधा सहयोग और ₹15 लाख तक का सामाजिक सुरक्षा संबल।'
                  : 'A 100% transparent mutual welfare network for dedicated citizens and employees in UP. Direct ₹50 peer-to-peer solidarity providing up to ₹15 Lakhs bereavement relief with zero intermediaries.'}
              </p>

              {/* Streamlined Call to Actions (Title Case & Refined Padding) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Link
                  href="/register"
                  className="w-full sm:w-auto h-12 min-h-[48px] px-6 py-3 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-sm shadow-warm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4 stroke-[2.2]" />
                  <span>{lang === 'hi' ? 'नया सदस्य पंजीकरण (₹50)' : 'Join as Member (₹50)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/appeals"
                  className="w-full sm:w-auto h-12 min-h-[48px] px-6 py-3 rounded-xl bg-white hover:bg-canvas-inset active:scale-[0.98] border border-stone-border text-charcoal font-semibold text-sm shadow-2xs transition-all flex items-center justify-center gap-2"
                >
                  <HeartHandshake className="w-4 h-4 text-terracotta shrink-0" />
                  <span>{lang === 'hi' ? 'सक्रिय सहयोग अपीलें' : 'Active Sahyog Appeals'}</span>
                </Link>
              </div>

              {/* Enterprise Trustmarks Strip (Fully Bilingual) */}
              <div className="pt-3 border-t border-stone-border/60 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-stone-border/80 text-charcoal font-semibold shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-sage shrink-0" />
                  <span>{lang === 'hi' ? '100% शून्य-कस्टडी P2P' : '100% Zero-Custody P2P'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-stone-border/80 text-charcoal font-semibold shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sage shrink-0" />
                  <span>{lang === 'hi' ? 'आधार व सेवा अभिलेख सत्यापित' : 'Aadhaar & Service Verified'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-stone-border/80 text-charcoal font-semibold shadow-2xs">
                  <Coins className="w-3.5 h-3.5 text-terracotta shrink-0" />
                  <span>{lang === 'hi' ? '0% कमीशन • कोई बिचौलिया नहीं' : '0% Commission • No Middlemen'}</span>
                </span>
              </div>

            </div>

            {/* Right Column: Institutional Governance & Snapshot Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md rounded-2xl bg-white p-5 sm:p-6 border border-stone-border shadow-warm-lg space-y-4">
                
                {/* Header: Trust Identity & Verified Status */}
                <div className="flex items-center justify-between gap-2 border-b border-stone-border/70 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-terracotta/10 border border-terracotta/20 flex items-center justify-center text-terracotta shadow-2xs shrink-0">
                      <HeartHandshake className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-charcoal truncate">
                        {lang === 'hi' ? 'जन सेवा चैरिटेबल ट्रस्ट' : 'Jan Sewa Charitable Trust'}
                      </div>
                      <div className="text-[11px] text-driftwood">
                        JSCT • {lang === 'hi' ? 'उत्तर प्रदेश (मुख्यालय गोरखपुर)' : 'Uttar Pradesh (HQ Gorakhpur)'}
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-bold shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{lang === 'hi' ? 'वैधानिक न्यास' : 'Verified Trust'}</span>
                  </span>
                </div>

                {/* 2x2 Key Metric Highlight Grid (High-contrast, scannable) */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Metric 1 */}
                  <div className="p-3 rounded-xl bg-canvas-inset border border-stone-border/70 space-y-0.5">
                    <span className="text-[10px] uppercase font-semibold text-driftwood tracking-wider block">
                      {lang === 'hi' ? 'दिवंगत संबल' : 'Bereavement Aid'}
                    </span>
                    <span className="text-base sm:text-lg font-black text-terracotta block tabular-nums">
                      {lang === 'hi' ? '₹15,00,000' : 'Up to ₹15 Lakh'}
                    </span>
                    <span className="text-[10px] text-driftwood block">
                      {lang === 'hi' ? 'सीधा नामिनी बैंक अंतरण' : 'Direct Nominee Transfer'}
                    </span>
                  </div>

                  {/* Metric 2 */}
                  <div className="p-3 rounded-xl bg-canvas-inset border border-stone-border/70 space-y-0.5">
                    <span className="text-[10px] uppercase font-semibold text-driftwood tracking-wider block">
                      {lang === 'hi' ? 'सहयोग व शुल्क' : 'Member Contribution'}
                    </span>
                    <span className="text-base sm:text-lg font-black text-charcoal block tabular-nums">
                      ₹50 <span className="text-xs font-normal text-driftwood">/ {lang === 'hi' ? 'सहयोग' : 'aid'}</span>
                    </span>
                    <span className="text-[10px] text-driftwood block">
                      {lang === 'hi' ? '₹50 वार्षिक नवीनीकरण' : '₹50 Annual Renewal'}
                    </span>
                  </div>

                  {/* Metric 3 */}
                  <div className="p-3 rounded-xl bg-canvas-inset border border-stone-border/70 space-y-0.5">
                    <span className="text-[10px] uppercase font-semibold text-driftwood tracking-wider block">
                      {lang === 'hi' ? 'लाकिंग व 75% नियम' : 'Lock-In & Compliance'}
                    </span>
                    <span className="text-base sm:text-lg font-black text-sage block">
                      6 {lang === 'hi' ? 'माह' : 'Months'}
                    </span>
                    <span className="text-[10px] text-driftwood block">
                      {lang === 'hi' ? '75% सहयोग अनुपालन' : '75% Aid Rule'}
                    </span>
                  </div>

                  {/* Metric 4 */}
                  <div className="p-3 rounded-xl bg-canvas-inset border border-stone-border/70 space-y-0.5">
                    <span className="text-[10px] uppercase font-semibold text-driftwood tracking-wider block">
                      {lang === 'hi' ? 'पात्रता आयु' : 'Age Eligibility'}
                    </span>
                    <span className="text-base sm:text-lg font-black text-charcoal block">
                      18 – 60 {lang === 'hi' ? 'वर्ष' : 'Yrs'}
                    </span>
                    <span className="text-[10px] text-driftwood block">
                      {lang === 'hi' ? 'उ.प्र. कर्मचारी व नागरिक' : 'UP Citizens & Staff'}
                    </span>
                  </div>
                </div>

                {/* Direct Zero-Custody Callout */}
                <div className="px-3 py-2 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white border border-amber-300 flex items-center justify-center shrink-0 text-terracotta shadow-2xs">
                    <QrCode className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[11px] min-w-0">
                    <span className="font-bold text-charcoal mr-1">
                      {lang === 'hi' ? '100% प्रत्यक्ष P2P अंतरण:' : '100% Direct P2P Transfer:'}
                    </span>
                    <span className="text-driftwood">
                      {lang === 'hi' ? 'सीधे पीड़ित नामिनी के अधिकृत बैंक / UPI खाते में' : 'Direct into verified nominee account / UPI'}
                    </span>
                  </div>
                </div>

                {/* Actions: Scheme Poster + Rules Link */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setIsPosterLightboxOpen(true)}
                    className="h-10 py-2 px-3 rounded-xl bg-white hover:bg-canvas-inset text-charcoal font-semibold text-xs border border-stone-border transition-colors flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-terracotta shrink-0" />
                    <span>{lang === 'hi' ? 'योजना पोस्टर' : 'View Scheme Poster'}</span>
                  </button>

                  <Link
                    href="/rules"
                    className="h-10 py-2 px-3 rounded-xl bg-charcoal hover:bg-charcoal-deep text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-warm active:scale-95"
                  >
                    <span>{lang === 'hi' ? 'नियमावली व शर्तें' : 'Trust Rules (75%)'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* ENTERPRISE LIVE TRANSPARENCY & AUDIT METRICS (Immediate Credibility) */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          
          {/* Card 1: Active Verified Members */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-stone-border/80 shadow-warm hover:shadow-warm-md hover:border-terracotta/40 transition-all relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-20 h-20 bg-terracotta/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div>
              <div className="flex items-center justify-between text-driftwood text-xs mb-2">
                <span className="font-semibold text-charcoal truncate">{lang === 'hi' ? 'सक्रिय सदस्य' : 'Active Members'}</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-terracotta-light text-terracotta flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="font-editorial text-2xl sm:text-4xl font-extrabold text-charcoal tracking-tight tabular-nums">
                1,28,450+
              </div>
            </div>
            <div className="text-[10px] sm:text-[11px] text-sage font-bold mt-2.5 flex items-center gap-1 truncate">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{lang === 'hi' ? 'समस्त 75 जनपद आच्छादित' : 'All 75 Districts Covered'}</span>
            </div>
          </div>

          {/* Card 2: Direct P2P Disbursed */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-stone-border/80 shadow-warm hover:shadow-warm-md hover:border-sage/40 transition-all relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-20 h-20 bg-sage/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div>
              <div className="flex items-center justify-between text-driftwood text-xs mb-2">
                <span className="font-semibold text-charcoal truncate">{lang === 'hi' ? 'वितरित सहायता' : 'Aid Disbursed'}</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-sage-light text-sage flex items-center justify-center shrink-0">
                  <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="font-editorial text-2xl sm:text-4xl font-extrabold text-charcoal tracking-tight tabular-nums">
                ₹34.80 Cr+
              </div>
            </div>
            <div className="text-[10px] sm:text-[11px] text-driftwood mt-2.5 flex items-center gap-1 truncate font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-sage shrink-0" />
              <span className="truncate">{lang === 'hi' ? '100% प्रत्यक्ष P2P अंतरण' : '100% Direct P2P Transfer'}</span>
            </div>
          </div>

          {/* Card 3: Families Supported */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-stone-border/80 shadow-warm hover:shadow-warm-md hover:border-amber-400/40 transition-all relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-400/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div>
              <div className="flex items-center justify-between text-driftwood text-xs mb-2">
                <span className="font-semibold text-charcoal truncate">{lang === 'hi' ? 'संबल प्राप्त' : 'Supported'}</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="font-editorial text-xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal tracking-tight tabular-nums">
                182 {lang === 'hi' ? 'परिवार' : 'Families'}
              </div>
            </div>
            <div className="text-[10px] sm:text-[11px] text-driftwood mt-2.5 flex items-center gap-1 truncate font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{lang === 'hi' ? '₹15 लाख तक सीधा संबल' : 'Up to ₹15L Bereavement'}</span>
            </div>
          </div>

          {/* Card 4: Compliance Rate */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-stone-border/80 shadow-warm hover:shadow-warm-md hover:border-sage/40 transition-all relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-20 h-20 bg-sage/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div>
              <div className="flex items-center justify-between text-driftwood text-xs mb-2">
                <span className="font-semibold text-charcoal truncate">{lang === 'hi' ? 'औसत सहभागिता' : 'Compliance'}</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-canvas-inset text-sage flex items-center justify-center shrink-0">
                  <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="font-editorial text-2xl sm:text-4xl font-extrabold text-sage tracking-tight tabular-nums">
                94.6%
              </div>
            </div>
            <div className="text-[10px] sm:text-[11px] text-sage font-bold mt-2.5 flex items-center gap-1 truncate">
              <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />
              <span className="truncate">{lang === 'hi' ? '75% मानक से अधिक' : 'Above 75% Benchmark'}</span>
            </div>
          </div>

        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-stone-border p-6 sm:p-10 shadow-warm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-terracotta uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'मिशन एवं संकल्प' : 'Our Mission & Pledge'}</span>
            </div>
            <p className="text-sm sm:text-base text-charcoal leading-relaxed font-medium">
              {lang === 'hi'
                ? 'JAN SEWA CHARITABLE TRUST (JSCT) की स्थापना समाज के सभी व्यक्तियों के लिए की गई, जो संकट की घड़ी में त्वरित आर्थिक, शैक्षिक एवं सामाजिक सहायता के अभाव में असहाय हो जाते हैं। हम सभी के मन में सहयोग की भावना होते हुए भी जटिल प्रक्रियाओं, औपचारिकताओं के कारण समय पर सहयोग नहीं पहुँच पाता। हमारा संकल्प है कि वास्तविक सहायता बिना भेदभाव, बिना बिचौलियों और बिना देरी के सीधे जरूरतमंद तक पहुँचे।'
                : 'JAN SEWA CHARITABLE TRUST (JSCT) was founded for all citizens who become helpless in moments of crisis without rapid economic, educational, and social aid. We eliminate bureaucratic delays and deliver aid directly, transparently, and swiftly into the nominee bank account.'}
            </p>
          </div>
          <Link
            href="/niyamawali"
            className="shrink-0 min-h-[44px] px-6 py-3 rounded-2xl bg-canvas-inset hover:bg-stone-border/50 text-charcoal font-bold text-xs border border-stone-border transition-colors flex items-center gap-2 active:scale-95"
          >
            <span>{lang === 'hi' ? '75% नियम विवरण' : 'Explore Rules & Terms'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* "एक सदस्यता - तीन सहायता" FLAGSHIP SCHEME SECTION                 */}
      {/* (Featuring Official Scheme Poster & The 3 Pillar Schemes)          */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 border border-amber-200/80 p-6 sm:p-10 lg:p-12 shadow-warm-lg overflow-hidden space-y-8 sm:space-y-10">
          
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-terracotta/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-light text-terracotta font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{lang === 'hi' ? 'विशेष जनकल्याण योजनाएं • SOLIDARITY' : 'FLAGSHIP SOLIDARITY SCHEMES'}</span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-5xl font-extrabold text-charcoal tracking-tight">
              {lang === 'hi' ? (
                <>
                  एक सदस्यता —{' '}
                  <span className="bg-gradient-to-r from-terracotta via-amber-600 to-terracotta-dark bg-clip-text text-transparent">
                    मुख्य सहायता योजनाएं
                  </span>
                </>
              ) : (
                'One Membership — Mutual Welfare Schemes'
              )}
            </h2>

            <p className="text-xs sm:text-base font-semibold text-charcoal-muted max-w-2xl mx-auto leading-relaxed">
              {lang === 'hi'
                ? 'एक सदस्यता = पारिवारिक सदस्यता (पति, पत्नी और दो अविवाहित बच्चे शामिल)'
                : 'One Membership = Family Membership (Includes Husband, Wife & Two Unmarried Children)'}
            </p>
          </div>

          {/* Core Grid: Left Poster Showcase + Right 2 Schemes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left: Official Poster Showcase with Enlarge Lightbox */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div
                onClick={() => setIsPosterLightboxOpen(true)}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-300 shadow-warm-lg cursor-pointer bg-stone-900 w-full max-w-md mx-auto transition-all duration-300 hover:shadow-2xl hover:border-amber-400"
                title={lang === 'hi' ? 'बड़ा पोस्टर देखने के लिए क्लिक करें' : 'Click to enlarge poster'}
              >
                <img
                  src="/images/ek-sadasyata-poster.jpg"
                  alt="एक सदस्यता जनकल्याण सहायता आधिकारिक पोस्टर"
                  className="w-full h-auto object-cover sm:object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                />



                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 z-20">
                  <span className="px-4 py-2.5 rounded-2xl bg-white/95 text-charcoal font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <ZoomIn className="w-4 h-4 text-terracotta" />
                    <span>{lang === 'hi' ? '🔍 पूरा पोस्टर बड़ा देखें' : 'Zoom Full Poster'}</span>
                  </span>
                </div>

                {/* Bottom Slogan Ribbon */}
                <div className="bg-stone-950 p-3 sm:p-3.5 text-center border-t border-stone-800">
                  <p className="text-xs sm:text-sm font-bold text-amber-300 tracking-wide">
                    जन से जन तक – सहयोग हर जरूरतमंद तक
                  </p>
                  <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                    वार्षिक सदस्यता: ₹50 • सहयोग राशि: ₹50
                  </p>
                </div>
              </div>

              {/* Quick Click-to-Enlarge Text Pill */}
              <button
                type="button"
                onClick={() => setIsPosterLightboxOpen(true)}
                className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl bg-amber-100/90 hover:bg-amber-200 text-amber-950 font-bold text-xs border border-amber-300 shadow-2xs transition-all active:scale-95"
              >
                <Eye className="w-4 h-4 text-terracotta shrink-0" />
                <span>{lang === 'hi' ? 'पूरा पोस्टर हाई-रेजोल्यूशन में देखें' : 'View High-Res Poster'}</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-800 shrink-0" />
              </button>
            </div>

            {/* Right: The 2 Detailed Welfare Schemes */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              
              {/* Scheme 01: Divyangat Sahyog */}
              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-rose-200/80 shadow-warm hover:border-rose-400 transition-all space-y-3 group">
                <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                      01
                    </span>
                    <h3 className="font-editorial text-lg sm:text-xl font-bold text-charcoal group-hover:text-rose-700 transition-colors">
                      {lang === 'hi' ? 'दिवंगत की स्थिति में सहयोग' : 'Bereavement Solidarity Support'}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                    {lang === 'hi' ? 'आकस्मिक संबल' : 'Bereavement Aid'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-rose-800 font-semibold">{lang === 'hi' ? 'सहयोग लक्ष्य:' : 'Aid Goal:'}</span>
                    <span className="font-editorial text-lg sm:text-xl font-extrabold text-rose-700 tabular-nums">
                      ₹15,00,000 तक
                    </span>
                  </div>
                  <span className="text-[11px] text-rose-700 font-medium bg-white/80 px-2.5 py-0.5 rounded-md border border-rose-200/60 self-start sm:self-auto">
                    {lang === 'hi' ? '₹10,000 से प्रारंभ' : 'From ₹10,000'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-driftwood leading-relaxed">
                  {lang === 'hi'
                    ? 'सदस्य के असामयिक निधन की दुखद स्थिति में पीड़ित परिवार के अधिकृत नामिनी के खाते में सभी सक्रिय सदस्यों द्वारा ₹50 का सीधा सहयोग प्रेषित किया जाता है।'
                    : 'In the tragic event of member demise, all active members transfer ₹50 directly into the verified nominee bank account without intermediaries.'}
                </p>

                <div className="flex items-center gap-2 text-[11px] font-mono text-charcoal-muted pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{lang === 'hi' ? 'पात्रता: 6 माह (180 दिन) लॉकिंग अवधि पूर्ण एवं 75% सहयोग अनुपालन अनिवार्य' : 'Eligibility: 6 months (180 days) lock-in & 75% compliance'}</span>
                </div>
              </div>

              {/* Scheme 02: Beti Vivah Shehnai */}
              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-amber-200/80 shadow-warm hover:border-amber-400 transition-all space-y-3 group">
                <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                      02
                    </span>
                    <h3 className="font-editorial text-lg sm:text-xl font-bold text-charcoal group-hover:text-amber-800 transition-colors">
                      {lang === 'hi' ? 'बेटी विवाह शहनाई योजना' : 'Beti Vivah Shehnai Scheme'}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                    {lang === 'hi' ? 'कन्यादान उपहार' : 'Daughter Marriage'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-900 font-semibold">{lang === 'hi' ? 'कन्यादान लक्ष्य:' : 'Aid Goal:'}</span>
                    <span className="font-editorial text-lg sm:text-xl font-extrabold text-amber-800 tabular-nums">
                      ₹5,00,000 तक
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-800 font-medium bg-white/80 px-2.5 py-0.5 rounded-md border border-amber-200/60 self-start sm:self-auto">
                    {lang === 'hi' ? 'विवाह उपहार' : 'Wedding Solidarity'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-driftwood leading-relaxed">
                  {lang === 'hi'
                    ? 'परिवार की जैविक सुपुत्री के शुभ विवाह के पावन अवसर पर कन्यादान स्वरूप समस्त ट्रस्ट परिवार द्वारा आर्थिक उपहार व मंगल सहयोग।'
                    : 'Financial solidarity gift from the whole JSCT family for the auspicious wedding ceremony of biological daughter.'}
                </p>

                <div className="flex items-center gap-2 text-[11px] font-mono text-charcoal-muted pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{lang === 'hi' ? 'पात्रता: पुत्री की आयु न्यूनतम 18 वर्ष पूर्ण; माता-पिता द्वारा सहमति से आवेदन' : 'Eligibility: Daughter age min 18; applied by parents'}</span>
                </div>
              </div>

              {/* Notice for Discontinued Scheme (Beta Vivah) */}
              <div className="p-4 rounded-2xl bg-white/85 border border-amber-300/80 shadow-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-charcoal flex items-center gap-2">
                    <span>{lang === 'hi' ? 'संशोधित नियमावली सूचना (बेटा विवाह बधाई योजना निरस्त)' : 'Revised Trust Notice (Son Marriage Discontinued)'}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-stone-100 text-charcoal-muted font-mono font-bold">अपडेटेड</span>
                  </div>
                  <p className="text-[11px] text-driftwood leading-relaxed">
                    {lang === 'hi'
                      ? 'ट्रस्ट की संशोधित नियमावली के अंतर्गत बेटा विवाह बधाई योजना को पूर्णतः समाप्त/हटा दिया गया है। ट्रस्ट का संपूर्ण संबल दिवंगत परिवारों को ₹15 लाख तक की आकस्मिक सहायता एवं जैविक पुत्रियों के विवाह हेतु ₹5 लाख तक के कन्यादान उपहार पर केंद्रित है।'
                      : 'Under the revised bylaws, the Son Marriage Scheme has been officially discontinued. Trust solidarity is strictly focused on up to ₹15 Lakhs bereavement aid and up to ₹5 Lakhs daughter marriage gifts.'}
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Banner: Slogan, Facts & Direct Registration CTA */}
          <div className="rounded-2xl sm:rounded-3xl bg-charcoal text-white p-5 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 shadow-warm-md">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-[10px] sm:text-xs font-bold font-mono">
                <span className="truncate">जन से जन तक – सहयोग हर जरूरतमंद तक</span>
              </div>
              <h3 className="font-editorial text-xl sm:text-2xl font-bold">
                {lang === 'hi' ? 'एक पारिवारिक सदस्यता से पाएं दोनों जनकल्याण योजनाओं का संबल' : 'One Family Membership Powers Both Welfare Schemes'}
              </h3>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 text-xs text-stone-300 pt-1 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>सदस्यता शुल्क: ₹50 / वर्ष</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>सहयोग राशि: ₹50 प्रति माह / अपील</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>100% प्रत्यक्ष बैंक अंतरण</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
              <Link
                href="/register"
                className="px-6 sm:px-8 py-3.5 min-h-[48px] rounded-2xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-xs sm:text-sm shadow-warm transition-transform active:scale-95 text-center flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>{lang === 'hi' ? 'सदस्यता पंजीकरण करें (₹50)' : 'Register Membership (₹50)'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setIsPosterLightboxOpen(true)}
                className="px-4 py-3.5 min-h-[48px] rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 border border-white/20 active:scale-95"
              >
                <ZoomIn className="w-4 h-4 text-amber-300" />
                <span>{lang === 'hi' ? 'पोस्टर ज़ूम करें' : 'Zoom Poster'}</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CURRENT RUNNING SAHYOG / ACTIVE APPEALS (matches dpswt.com mE)     */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-light text-terracotta text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
              Current Running Sahyog
            </div>
            <h2 className="font-editorial text-2xl sm:text-4xl font-extrabold text-charcoal">
              {lang === 'hi' ? 'वर्तमान सक्रिय सहयोग अपीलें' : 'Active Community Appeals'}
            </h2>
            <p className="text-xs sm:text-sm text-driftwood mt-1">
              {lang === 'hi'
                ? 'सत्यापित शोकाकुल एवं वैवाहिक सहायता अनुरोध — सीधे नामिनी के अधिकृत खाते में ₹50 सहयोग प्रेषित करें'
                : 'Verified bereavement and marriage aid appeals — contribute ₹50 straight to the verified nominee'}
            </p>
          </div>

          <Link
            href="/appeals"
            className="text-xs font-bold text-terracotta hover:underline inline-flex items-center gap-1.5"
          >
            <span>{t.viewAllAppeals} ({appeals.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Sahyog Cards Grid (formatted exactly like dpswt mE component) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {appeals.slice(0, 2).map((appeal) => {
            const percentage = Math.min(
              100,
              Math.round((appeal.collected_amount / appeal.target_amount) * 100)
            );
            const isBereavement = appeal.type === 'BEREAVEMENT';

            return (
              <div
                key={appeal.id}
                className="rounded-3xl bg-white border border-stone-border p-6 shadow-warm flex flex-col justify-between space-y-5 hover:border-terracotta/40 transition-colors"
              >
                <div className="space-y-3">
                  {/* Top Row: Type Badge + Date Pill */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        isBereavement
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isBereavement ? 'Death Sahyog (दिवंगत संबल)' : 'Beti Vivah (पुत्री विवाह)'}
                    </span>
                    <span className="text-xs font-mono font-medium text-driftwood px-2.5 py-1 rounded-full bg-canvas-inset border border-stone-border/60">
                      {appeal.event_date || '06 Oct, 2026'}
                    </span>
                  </div>

                  {/* Title & Code */}
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-terracotta font-semibold">
                      अपील कोड: {appeal.code}
                    </div>
                    <h3 className="font-editorial text-xl font-bold text-charcoal leading-snug">
                      {appeal.title}
                    </h3>
                  </div>

                  <p className="text-xs text-driftwood line-clamp-3 leading-relaxed">
                    {appeal.description}
                  </p>

                  {/* Amount Grid (matches dpswt mE amountGrid) */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-2xl bg-canvas-inset border border-stone-border/80 text-center">
                      <span className="text-[11px] text-driftwood block font-medium">
                        {lang === 'hi' ? 'न्यूनतम सहयोग राशि' : 'Minimum Amount'}
                      </span>
                      <span className="font-editorial text-lg font-bold text-terracotta">
                        ₹50.00
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-canvas-inset border border-stone-border/80 text-center">
                      <span className="text-[11px] text-driftwood block font-medium">
                        {lang === 'hi' ? 'एकत्रित सहयोग राशि' : 'Deposited Amount'}
                      </span>
                      <span className="font-editorial text-lg font-bold text-sage">
                        {formatINR(appeal.collected_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-driftwood">
                        लक्ष्य: {formatINR(appeal.target_amount)}
                      </span>
                      <span className="font-mono font-bold text-charcoal">
                        {percentage}% पूर्ण
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-canvas-inset rounded-full overflow-hidden p-0.5 border border-stone-border/70">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-terracotta to-amber-600 transition-all duration-700"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Bank Details Box (like dpswt mE infoSection) */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-border text-xs space-y-2">
                    <div className="font-bold text-charcoal border-b border-stone-border/70 pb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-terracotta" />
                        <span>नामिनी का अधिकृत बैंक खाता (Direct P2P)</span>
                      </span>
                      <span className="text-[10px] text-sage font-mono font-bold bg-sage-light px-2 py-0.5 rounded">
                        सत्यापित
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                      <div>
                        <span className="text-driftwood block">नामिनी का नाम:</span>
                        <span className="font-semibold text-charcoal">
                          {appeal.nominee_snapshot.full_name.replace(/\(.*?\)/g, '').trim()} ({appeal.nominee_snapshot.relationship})
                        </span>
                      </div>
                      <div>
                        <span className="text-driftwood block">बैंक का नाम:</span>
                        <span className="font-mono font-semibold text-charcoal">
                          {appeal.nominee_snapshot.bank_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-driftwood block">खाता संख्या:</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono font-bold text-charcoal bg-canvas-inset px-2 py-0.5 rounded border border-stone-border/60">
                            {appeal.nominee_snapshot.account_number}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(appeal.nominee_snapshot.account_number, `acc-${appeal.id}`)}
                            className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-lg bg-white hover:bg-stone-100 text-driftwood hover:text-charcoal border border-stone-border/80 transition-colors shadow-2xs flex items-center justify-center shrink-0 active:scale-95"
                            title="Copy Account Number"
                          >
                            {copiedKey === `acc-${appeal.id}` ? (
                              <span className="text-[10px] text-sage font-bold flex items-center gap-0.5">
                                <CheckCheck className="w-3.5 h-3.5 text-sage" />
                              </span>
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-driftwood block">IFSC कोड:</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono font-bold text-charcoal bg-canvas-inset px-2 py-0.5 rounded border border-stone-border/60">
                            {appeal.nominee_snapshot.ifsc_code}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(appeal.nominee_snapshot.ifsc_code, `ifsc-${appeal.id}`)}
                            className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-lg bg-white hover:bg-stone-100 text-driftwood hover:text-charcoal border border-stone-border/80 transition-colors shadow-2xs flex items-center justify-center shrink-0 active:scale-95"
                            title="Copy IFSC Code"
                          >
                            {copiedKey === `ifsc-${appeal.id}` ? (
                              <span className="text-[10px] text-sage font-bold flex items-center gap-0.5">
                                <CheckCheck className="w-3.5 h-3.5 text-sage" />
                              </span>
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-border/60 flex items-center justify-between text-[11px]">
                      <span className="text-driftwood font-medium">UPI ID:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-terracotta bg-white px-2.5 py-0.5 rounded border border-stone-border">
                          {appeal.nominee_snapshot.upi_id}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(appeal.nominee_snapshot.upi_id, `upi-${appeal.id}`)}
                          className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-lg bg-white hover:bg-stone-100 text-driftwood hover:text-charcoal border border-stone-border/80 transition-colors shadow-2xs flex items-center justify-center shrink-0 active:scale-95"
                          title="Copy UPI ID"
                        >
                          {copiedKey === `upi-${appeal.id}` ? (
                            <span className="text-[10px] text-sage font-bold flex items-center gap-0.5">
                              <CheckCheck className="w-3.5 h-3.5 text-sage" />
                            </span>
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Actions: Full-width Primary + Balanced 2-Col Secondary */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAppealForUpi(appeal)}
                    className="w-full h-12 min-h-[48px] py-3 px-4 rounded-xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-xs sm:text-sm shadow-warm transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>सीधे ₹50 भेजें (UPI & QR)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => setSelectedAppealForSlip(appeal)}
                      className="h-11 min-h-[44px] py-2.5 px-3 rounded-xl bg-canvas-inset hover:bg-white border border-stone-border text-charcoal font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-terracotta shrink-0" />
                      <span className="truncate">रसीद अपलोड करें</span>
                    </button>

                    <Link
                      href={`/appeals/${appeal.id}`}
                      className="h-11 min-h-[44px] py-2.5 px-3 rounded-xl border border-stone-border bg-white hover:bg-canvas-inset text-charcoal font-semibold text-xs flex items-center justify-center gap-1 shadow-2xs transition-colors active:scale-95"
                      title="View Case Details"
                    >
                      <span className="truncate">केस विवरण</span>
                      <ArrowRight className="w-3.5 h-3.5 text-driftwood shrink-0" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* EXECUTIVE & CORE LEADERSHIP TEAM (matches dpswt.com hE teamSec)    */}
      {/* CRUCIAL: KEPT ALL 7 REAL MEMBERS AS INSTRUCTED                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-canvas-inset border border-stone-border text-xs font-mono font-semibold text-terracotta uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>कार्यकारिणी एवं कोर टीम</span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl font-extrabold text-charcoal">
            {lang === 'hi' ? 'प्रदेश कोर टीम व पदाधिकारी' : 'Meet Our Leadership & Executive Team'}
          </h2>
          <p className="text-xs sm:text-sm text-driftwood mt-2">
            {lang === 'hi'
              ? 'जन सेवा चैरिटेबल ट्रस्ट (JSCT) के संस्थापक एवं अधिकृत पदाधिकारी, जो पूर्ण पारदर्शिता एवं निष्पक्ष सेवा हेतु समर्पित हैं।'
              : 'Authorized founding trustees and executive committee members of Jan Sewa Charitable Trust (JSCT).'}
          </p>
        </div>

        {/* 7 Real Members Grid (Responsive 2-col on mobile, 4-col on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {realMembers.map((member, index) => {
            const isHead = index === 0;
            const isSecretary = index === 1;
            const isTreasurer = index === 2;
            const isLast = index === realMembers.length - 1;

            // Cleanly parse Hindi and English names
            const match = member.full_name.match(/^(.*?)\s*\((.*?)\)$/);
            const enName = match ? match[1].trim() : member.full_name;
            const hiName = match ? match[2].trim() : member.full_name;
            const primaryName = lang === 'hi' ? hiName : enName;
            const secondaryName = lang === 'hi' ? enName : hiName;

            // Generate clean initials
            const nameParts = enName.split(' ');
            const initials = nameParts.length >= 2 
              ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
              : enName.slice(0, 2).toUpperCase();

            // Designation display in Hindi & English
            let roleTitle = 'कार्यकारिणी सदस्य';
            let roleBadgeBg = 'bg-stone-100 text-charcoal';
            if (isHead) {
              roleTitle = 'अध्यक्ष (President)';
              roleBadgeBg = 'bg-terracotta-light text-terracotta font-bold';
            } else if (isSecretary) {
              roleTitle = 'सचिव (Gen. Sec.)';
              roleBadgeBg = 'bg-amber-100 text-amber-800 font-bold';
            } else if (isTreasurer) {
              roleTitle = 'कोषाध्यक्ष (Treasurer)';
              roleBadgeBg = 'bg-sage-light text-sage font-bold';
            }

            // Clean department name to avoid ugly ellipsis
            const cleanDept = member.department.replace(/\s*\(Executive Member\)/i, '').trim();

            return (
              <div
                key={member.id}
                className={`group rounded-2xl sm:rounded-3xl bg-white border border-stone-border p-3.5 sm:p-6 shadow-warm hover:shadow-warm-md hover:border-terracotta/40 transition-all text-center flex flex-col justify-between ${
                  isLast ? 'col-span-2 sm:col-span-1 max-w-xs mx-auto sm:max-w-none w-full' : ''
                }`}
              >
                <div className="space-y-2 sm:space-y-3.5">
                  
                  {/* Avatar Wrap with Oval Frame */}
                  <div className="relative mx-auto w-16 h-16 sm:w-24 sm:h-24 rounded-full p-0.5 sm:p-1 bg-gradient-to-br from-terracotta/20 via-stone-200 to-sage/20 group-hover:scale-105 transition-transform">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={primaryName}
                        className="w-full h-full rounded-full object-cover border-2 border-white shadow-xs"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-charcoal to-charcoal-muted flex items-center justify-center text-white font-editorial text-lg sm:text-2xl font-bold border-2 border-white">
                        {initials}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-sage border-2 border-white flex items-center justify-center text-white shadow-xs" title="Verified Trustee">
                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                    </span>
                  </div>

                  {/* Name & Role */}
                  <div className="space-y-0.5">
                    <h3 className="font-editorial text-sm sm:text-base font-bold text-charcoal group-hover:text-terracotta transition-colors leading-tight line-clamp-1">
                      {primaryName}
                    </h3>
                    <div className="text-[10px] sm:text-[11px] text-driftwood truncate font-medium">
                      {secondaryName}
                    </div>
                    <div className="pt-1">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] ${roleBadgeBg}`}>
                        {roleTitle}
                      </span>
                    </div>
                  </div>

                  {/* Details / Dept / District */}
                  <div className="text-[10px] sm:text-xs text-driftwood space-y-0.5 pt-0.5 sm:pt-1">
                    <div className="font-mono text-[10px] sm:text-[11px] text-terracotta font-semibold truncate">
                      ID: {member.membership_id}
                    </div>
                    <div className="truncate text-charcoal-muted font-medium">
                      {cleanDept}
                    </div>
                    <div className="text-driftwood/80 text-[10px] sm:text-[11px] flex items-center justify-center gap-1">
                      <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-driftwood shrink-0" />
                      <span className="truncate">{member.district}</span>
                    </div>
                  </div>

                </div>

                {/* Footer Action */}
                <div className="pt-2 sm:pt-3.5 mt-2 sm:mt-3.5 border-t border-stone-border/60">
                  <Link
                    href={`/member?search=${encodeURIComponent(member.membership_id)}`}
                    className="inline-flex items-center justify-center gap-1 w-full py-2 px-2.5 rounded-xl bg-canvas-inset hover:bg-stone-200/60 text-charcoal font-bold text-xs border border-stone-border/80 transition-colors shadow-2xs min-h-[38px] active:scale-95"
                  >
                    <span>सत्यापित करें</span>
                    <ChevronRight className="w-3.5 h-3.5 text-terracotta" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* ABOUT JSCT & EXTENDED MISSION (matches dpswt.com nE / aboutFrct)   */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-stone-border p-6 sm:p-12 shadow-warm space-y-8">
          
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-terracotta">
              जन सेवा चैरिटेबल ट्रस्ट (JSCT)
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-extrabold text-charcoal">
              {lang === 'hi' ? 'हमारा उद्देश्य एवं कार्यप्रणाली' : 'About Our Mission & Vision'}
            </h2>
          </div>

          {/* Core Principles List (from dpswt.com aboutFrct) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-charcoal-muted leading-relaxed">
            <div className="p-5 rounded-2xl bg-canvas-inset border border-stone-border/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-terracotta-light text-terracotta flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-charcoal text-base">
                आर्थिक, शैक्षिक एवं सामाजिक सहायता
              </h3>
              <p className="text-xs text-driftwood">
                संकट की घड़ी में त्वरित आर्थिक, शैक्षिक एवं सामाजिक सहायता के अभाव में असहाय हो जाने वाले परिवारों तक सीधी सहायता पहुँचाना हमारा सर्वोच्च लक्ष्य है।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-canvas-inset border border-stone-border/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-sage-light text-sage flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-charcoal text-base">
                सीधे, पारदर्शी एवं त्वरित अंतरण
              </h3>
              <p className="text-xs text-driftwood">
                संगठन का उद्देश्य है कि सहायता सीधे, पारदर्शी, त्वरित और प्रभावी रूप से जरूरतमंद तक पहुँचे। किसी वॉलेट, बिचौलिए या एस्क्रो की कोई आवश्यकता नहीं है।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-canvas-inset border border-stone-border/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-bold text-charcoal text-base">
                पद, वर्ग या पेशे की सीमाओं से परे
              </h3>
              <p className="text-xs text-driftwood">
                यह मंच किसी पद, वर्ग या पेशे की सीमाओं में बंधे बिना केवल मानवीय संवेदना, समानता और सामाजिक उत्तरदायित्व के आधार पर कार्य करता है।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-canvas-inset border border-stone-border/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-stone-200 text-charcoal flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="font-bold text-charcoal text-base">
                बिना भेदभाव, बिना बिचौलियों और बिना देरी
              </h3>
              <p className="text-xs text-driftwood">
                संगठन का दृढ़ विश्वास है कि वास्तविक सहायता वही है जो बिना भेदभाव, बिना बिचौलियों और बिना देरी के सही समय पर पीड़ित परिवार को प्रदान की जाए।
              </p>
            </div>
          </div>

          {/* Slogan Quote Block (from dpswt.com aboutFrct__quote) */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-terracotta/10 to-amber-500/10 border border-amber-300/80 text-center space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-terracotta">
              संगठन का मूल लक्ष्य
            </span>
            <div className="font-editorial text-2xl sm:text-3xl font-extrabold text-charcoal">
              “जन से जन तक, सहयोग हर जरूरतमंद तक।”
            </div>
          </div>

          {/* Expandable Text for deeper details (matches dpswt read more button) */}
          {showFullAbout && (
            <div className="space-y-4 pt-4 border-t border-stone-border text-sm text-driftwood leading-relaxed">
              <p>
                <strong>JAN SEWA CHARITABLE TRUST (JSCT)</strong> उत्तर प्रदेश सरकार के सभी विभागों (शिक्षा, स्वास्थ्य, पुलिस, राजस्व, विकास, सिंचाई आदि) के कर्मचारियों एवं सामान्य नागरिकों का एक विशाल पारस्परिक सुरक्षा संजाल है। 
              </p>
              <p>
                जब भी किसी पंजीकृत साथी का आकस्मिक देहावसान होता है अथवा कोई आपदा आती है, तो अधिकृत जिला सत्यापन प्रकोष्ठ तत्काल स्थल पर जाकर भौतिक परीक्षण करता है। इसके उपरांत जारी अपील पर सभी साथी मात्र ₹50 का सीधा सहयोग नामिनी के खाते में अंतरित करते हैं।
              </p>
              <p>
                75% सहयोग अनुपालन अनिवार्य बनाकर यह सुनिश्चित किया जाता है कि पारस्परिक उत्तरदायित्व बना रहे और प्रत्येक परिवार को जरूरत के समय समाज का भरपूर संबल प्राप्त हो।
              </p>
            </div>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowFullAbout(!showFullAbout)}
              className="h-11 min-h-[44px] px-6 rounded-xl border border-stone-border bg-white text-xs font-bold text-charcoal hover:bg-canvas-inset transition-colors shadow-2xs active:scale-95 inline-flex items-center justify-center gap-1.5"
            >
              <span>{showFullAbout ? (lang === 'hi' ? 'कम विवरण देखें (SHOW LESS)' : 'SHOW LESS') : (lang === 'hi' ? 'विस्तृत विवरण पढ़ें (READ MORE)' : 'READ MORE')}</span>
            </button>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4 OPERATIONAL PILLARS (THE ZERO-CUSTODY P2P SYSTEM)                */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-terracotta">
            {t.pillarsPill}
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-extrabold text-charcoal mt-1">
            {t.pillarsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-driftwood mt-2">
            {t.pillarsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-3xl bg-white border border-stone-border shadow-warm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-canvas-inset border border-stone-border flex items-center justify-center text-terracotta">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-charcoal">
              {t.pillar1Title}
            </h3>
            <p className="text-xs text-driftwood leading-relaxed">
              {t.pillar1Desc}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-border shadow-warm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-canvas-inset border border-stone-border flex items-center justify-center text-sage">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-charcoal">
              {t.pillar2Title}
            </h3>
            <p className="text-xs text-driftwood leading-relaxed">
              {t.pillar2Desc}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-border shadow-warm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-canvas-inset border border-stone-border flex items-center justify-center text-charcoal">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-charcoal">
              {t.pillar3Title}
            </h3>
            <p className="text-xs text-driftwood leading-relaxed">
              {t.pillar3Desc}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-border shadow-warm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-canvas-inset border border-stone-border flex items-center justify-center text-terracotta">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-charcoal">
              {t.pillar4Title}
            </h3>
            <p className="text-xs text-driftwood leading-relaxed">
              {t.pillar4Desc}
            </p>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4-STEP HOW IT WORKS FLOW                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-terracotta">
            सरल एवं पारदर्शी प्रक्रिया
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-extrabold text-charcoal mt-1">
            4 चरणों में JSCT सुरक्षा चक्र
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-stone-border text-center space-y-2 sm:space-y-3 shadow-warm flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-terracotta-light text-terracotta font-editorial font-bold text-sm sm:text-lg flex items-center justify-center mx-auto mb-2">
                1
              </div>
              <h3 className="font-bold text-charcoal text-xs sm:text-base leading-snug">
                {lang === 'hi' ? '1. ऑनलाइन पंजीकरण' : '1. Online Registration'}
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-driftwood leading-relaxed font-normal">
              {lang === 'hi' 
                ? 'आधार कार्ड व सेवा पहचान के साथ फॉर्म भरें और ₹50 सदस्यता शुल्क जमा करें।'
                : 'Complete the verified registration form with Aadhaar and deposit ₹50 fee.'}
            </p>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-stone-border text-center space-y-2 sm:space-y-3 shadow-warm flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-100 text-amber-800 font-editorial font-bold text-sm sm:text-lg flex items-center justify-center mx-auto mb-2">
                2
              </div>
              <h3 className="font-bold text-charcoal text-xs sm:text-base leading-snug">
                {lang === 'hi' ? '2. 6-माह लाकिंग अवधि' : '2. 6-Month Lock-in'}
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-driftwood leading-relaxed font-normal">
              {lang === 'hi'
                ? '180 दिन मानक लाकिंग पूर्ण होते ही सामाजिक सुरक्षा कवच पूर्ण सक्रिय होता है।'
                : 'Upon completing 180 days lock-in, full community welfare cover activates.'}
            </p>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-stone-border text-center space-y-2 sm:space-y-3 shadow-warm flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-sage-light text-sage font-editorial font-bold text-sm sm:text-lg flex items-center justify-center mx-auto mb-2">
                3
              </div>
              <h3 className="font-bold text-charcoal text-xs sm:text-base leading-snug">
                {lang === 'hi' ? '3. ₹50 सीधा सहयोग' : '3. ₹50 Direct Aid'}
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-driftwood leading-relaxed font-normal">
              {lang === 'hi'
                ? 'सक्रिय अपील में सीधे नामिनी के खाते में ₹50 भेजकर 12-अंक UTR रसीद दर्ज करें।'
                : 'Send ₹50 directly to nominee account and submit 12-digit UTR receipt.'}
            </p>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-stone-border text-center space-y-2 sm:space-y-3 shadow-warm flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-charcoal text-white font-editorial font-bold text-sm sm:text-lg flex items-center justify-center mx-auto mb-2">
                4
              </div>
              <h3 className="font-bold text-charcoal text-xs sm:text-base leading-snug">
                {lang === 'hi' ? '4. ₹15 लाख संबल गारंटी' : '4. ₹15L Solidarity Guarantee'}
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-driftwood leading-relaxed font-normal">
              {lang === 'hi'
                ? '75% नियमित अनुपालन रहने पर किसी भी आकस्मिक विपत्ति में परिवार को पूर्ण संबल।'
                : 'With 75% active compliance, family receives up to ₹15 Lakhs dignified relief.'}
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* INTERACTIVE 75% COMPLIANCE SIMULATOR                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-canvas-inset border border-stone-border p-6 sm:p-10 shadow-warm">
          <div className="max-w-3xl mx-auto space-y-6">
            
            <div className="text-center space-y-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-terracotta">
                {t.simTag}
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal">
                {t.simTitle}
              </h2>
              <p className="text-xs sm:text-sm text-driftwood">
                {t.simSub}
              </p>
            </div>

            {/* Simulator Controls */}
            <div className="bg-white p-6 rounded-3xl border border-stone-border space-y-6 shadow-warm">
              
              {/* Quick Preset Buttons */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-stone-border/60">
                <span className="text-[11px] font-mono font-bold text-driftwood uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-terracotta" />
                  <span>त्वरित परिदृश्य (Presets):</span>
                </span>
                <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSimTotalAppeals(20);
                      setSimContributed(20);
                    }}
                    className={`h-10 min-h-[40px] px-3 rounded-xl text-xs font-mono font-bold transition-all border flex items-center justify-center text-center shadow-2xs active:scale-95 ${
                      simRatio === 100
                        ? 'bg-sage text-white border-sage'
                        : 'bg-canvas-inset text-charcoal border-stone-border hover:bg-stone-100'
                    }`}
                  >
                    100% (सुरक्षित)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSimTotalAppeals(20);
                      setSimContributed(17);
                    }}
                    className={`h-10 min-h-[40px] px-3 rounded-xl text-xs font-mono font-bold transition-all border flex items-center justify-center text-center shadow-2xs active:scale-95 ${
                      simRatio === 85
                        ? 'bg-sage text-white border-sage'
                        : 'bg-canvas-inset text-charcoal border-stone-border hover:bg-stone-100'
                    }`}
                  >
                    85% (सक्रिय)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSimTotalAppeals(20);
                      setSimContributed(15);
                    }}
                    className={`h-10 min-h-[40px] px-3 rounded-xl text-xs font-mono font-bold transition-all border flex items-center justify-center text-center shadow-2xs active:scale-95 ${
                      simRatio === 75
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-canvas-inset text-charcoal border-stone-border hover:bg-stone-100'
                    }`}
                  >
                    75% (मानक सीमा)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSimTotalAppeals(20);
                      setSimContributed(12);
                    }}
                    className={`h-10 min-h-[40px] px-3 rounded-xl text-xs font-mono font-bold transition-all border flex items-center justify-center text-center shadow-2xs active:scale-95 ${
                      simRatio === 60
                        ? 'bg-terracotta text-white border-terracotta'
                        : 'bg-canvas-inset text-charcoal border-stone-border hover:bg-stone-100'
                    }`}
                  >
                    60% (चेतावनी)
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Total Historical Appeals Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-charcoal mb-2">
                    <span>{t.simTotalLabel}</span>
                    <span className="font-mono text-terracotta text-sm">{simTotalAppeals}</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="50"
                    value={simTotalAppeals}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setSimTotalAppeals(val);
                      if (simContributed > val) setSimContributed(val);
                    }}
                    className="w-full accent-terracotta cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-driftwood font-mono mt-1">
                    <span>4</span>
                    <span>50 {t.simAppealsCount}</span>
                  </div>
                </div>

                {/* Contributed Appeals Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-charcoal mb-2">
                    <span>{t.simContributedLabel}</span>
                    <span className="font-mono text-sage text-sm">{simContributed}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={simTotalAppeals}
                    value={simContributed}
                    onChange={(e) => setSimContributed(parseInt(e.target.value))}
                    className="w-full accent-sage cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-driftwood font-mono mt-1">
                    <span>0</span>
                    <span>{simTotalAppeals} {t.simAppealsCount}</span>
                  </div>
                </div>

              </div>

              {/* Dynamic Output Box (Fixed Single-Line Badge, No Vertical Number Wrapping) */}
              <div
                className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-5 ${
                  simIsEligible
                    ? 'bg-sage-light/60 border-sage/50 text-sage-dark'
                    : 'bg-terracotta-light/60 border-terracotta/50 text-terracotta-dark'
                }`}
              >
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  <div
                    className={`min-w-[4.5rem] h-14 px-3 rounded-2xl flex items-center justify-center font-editorial text-2xl font-extrabold shadow-xs whitespace-nowrap shrink-0 tabular-nums ${
                      simIsEligible ? 'bg-sage text-white' : 'bg-terracotta text-white'
                    }`}
                  >
                    {simRatio}%
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm sm:text-base flex items-center gap-2 flex-wrap">
                      <span>{simIsEligible ? t.simEligible : t.simCritical}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                        simIsEligible ? 'bg-sage text-white' : 'bg-terracotta text-white'
                      }`}>
                        {simIsEligible ? 'संबल सुरक्षित' : 'कवच बाधित'}
                      </span>
                    </div>
                    <div className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                      {simIsEligible ? (
                        <span>
                          {t.simEligibleDesc} — <strong>परिवार को ₹15,00,000 तक का पूर्ण संबल सुरक्षित।</strong>
                        </span>
                      ) : (
                        <span>
                          {t.simCriticalDescPrefix}
                          <strong className="text-terracotta font-bold px-1">
                            {Math.max(1, Math.ceil(simTotalAppeals * 0.75) - simContributed)}
                          </strong>
                          {t.simCriticalDescSuffix}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-center sm:text-right border-t sm:border-t-0 sm:border-l border-stone-border/80 pt-3 sm:pt-0 sm:pl-5">
                  <span className="text-[10px] uppercase font-mono block text-driftwood font-bold">
                    {t.simTotalContributedAmount}
                  </span>
                  <span className="font-editorial text-xl font-extrabold text-charcoal">
                    {formatINR(simContributed * 50)}
                  </span>
                  <span className="block text-[10px] text-driftwood font-mono mt-0.5">
                    ({simContributed} × ₹50 सहयोग)
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FREQUENTLY ASKED QUESTIONS (FAQ)                                   */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-terracotta">
            {t.faqPill}
          </span>
          <h2 className="font-editorial text-3xl font-bold text-charcoal mt-1">
            {t.faqTitle}
          </h2>
        </div>

        <div className="space-y-4">
          <details className="group rounded-2xl bg-white border border-stone-border p-5 shadow-warm open:bg-canvas-inset/50 transition-colors">
            <summary className="flex items-center justify-between cursor-pointer list-none font-editorial text-lg font-bold text-charcoal">
              <span>{t.faq1Q}</span>
              <span className="transition-transform group-open:rotate-180 text-driftwood">▼</span>
            </summary>
            <p className="text-xs text-driftwood leading-relaxed mt-3 pt-3 border-t border-stone-border/60">
              {t.faq1A}
            </p>
          </details>

          <details className="group rounded-2xl bg-white border border-stone-border p-5 shadow-warm open:bg-canvas-inset/50 transition-colors">
            <summary className="flex items-center justify-between cursor-pointer list-none font-editorial text-lg font-bold text-charcoal">
              <span>{t.faq2Q}</span>
              <span className="transition-transform group-open:rotate-180 text-driftwood">▼</span>
            </summary>
            <p className="text-xs text-driftwood leading-relaxed mt-3 pt-3 border-t border-stone-border/60">
              {t.faq2A}
            </p>
          </details>

          <details className="group rounded-2xl bg-white border border-stone-border p-5 shadow-warm open:bg-canvas-inset/50 transition-colors">
            <summary className="flex items-center justify-between cursor-pointer list-none font-editorial text-lg font-bold text-charcoal">
              <span>{t.faq3Q}</span>
              <span className="transition-transform group-open:rotate-180 text-driftwood">▼</span>
            </summary>
            <p className="text-xs text-driftwood leading-relaxed mt-3 pt-3 border-t border-stone-border/60">
              {t.faq3A}
            </p>
          </details>

          <details className="group rounded-2xl bg-white border border-stone-border p-5 shadow-warm open:bg-canvas-inset/50 transition-colors">
            <summary className="flex items-center justify-between cursor-pointer list-none font-editorial text-lg font-bold text-charcoal">
              <span>{t.faq4Q}</span>
              <span className="transition-transform group-open:rotate-180 text-driftwood">▼</span>
            </summary>
            <p className="text-xs text-driftwood leading-relaxed mt-3 pt-3 border-t border-stone-border/60">
              {t.faq4A}
            </p>
          </details>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* HELPDESK & GORAKHPUR HEADQUARTERS CONTACT BAR                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-stone-border p-6 sm:p-8 shadow-warm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-terracotta-light text-terracotta flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-charcoal">मुख्यालय (Head Office)</div>
                <div className="text-driftwood">
                  Harpur Post Luhasi, District Gorakhpur, Uttar Pradesh 273152
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage-light text-sage flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-charcoal">हेल्पलाइन संपर्क (Helplines)</div>
                <div className="text-driftwood font-mono flex flex-wrap gap-x-2 gap-y-1">
                  <a href="tel:9264945875" className="hover:text-terracotta hover:underline font-semibold">+91 9264945875</a>
                  <span>•</span>
                  <a href="tel:9936639215" className="hover:text-terracotta hover:underline font-semibold">+91 9936639215</a>
                  <span>•</span>
                  <a href="tel:9005088708" className="hover:text-terracotta hover:underline font-semibold">+91 9005088708</a>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-charcoal">ईमेल व सहायता (Email)</div>
                <div className="text-driftwood font-mono flex flex-wrap gap-x-2 gap-y-1">
                  <a href="mailto:infodpswt@dpswt.com" className="hover:text-terracotta hover:underline">infodpswt@dpswt.com</a>
                  <span>•</span>
                  <a href="mailto:info@jsct.org.in" className="hover:text-terracotta hover:underline">info@jsct.org.in</a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FINAL INVITATION CTA                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-charcoal text-white p-8 sm:p-14 text-center space-y-6 shadow-warm-lg">
          <div className="w-12 h-12 rounded-2xl bg-terracotta flex items-center justify-center mx-auto text-white shadow-warm">
            <HeartHandshake className="w-6 h-6" />
          </div>

          <h2 className="font-editorial text-2xl sm:text-4xl font-bold tracking-tight">
            {lang === 'hi' ? 'आज ही JSCT जन सेवा परिवार का हिस्सा बनें' : 'Join JSCT Family Today'}
          </h2>

          <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto leading-relaxed font-normal">
            {lang === 'hi'
              ? 'आधार कार्ड एवं विभागीय पहचान के साथ सरल 2-मिनट पंजीकरण। अपने परिवार की सुरक्षा सुनिश्चित करें और जरूरतमंद साथियों के संबल बनें।'
              : 'Simple 2-minute registration with Aadhaar and service department details. Ensure mutual safety for your loved ones.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto h-12 min-h-[48px] px-8 rounded-2xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-sm shadow-warm transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>{lang === 'hi' ? 'नया सदस्य पंजीकरण (₹50)' : 'Register Member (₹50)'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/member"
              className="w-full sm:w-auto h-12 min-h-[48px] px-8 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>{lang === 'hi' ? 'समस्त सदस्य सूची देखें' : 'View Member Directory'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Modals for Direct UPI & Slip Upload */}
      {selectedAppealForUpi && (
        <UpiModal
          appeal={selectedAppealForUpi}
          isOpen={true}
          onClose={() => setSelectedAppealForUpi(null)}
          onOpenSlipUpload={() => {
            const app = selectedAppealForUpi;
            setSelectedAppealForUpi(null);
            setSelectedAppealForSlip(app);
          }}
        />
      )}

      {selectedAppealForSlip && (
        <SlipUploadModal
          appeal={selectedAppealForSlip}
          isOpen={true}
          onClose={() => setSelectedAppealForSlip(null)}
          onSuccess={() => setSelectedAppealForSlip(null)}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* "एक सदस्यता - तीन सहायता" HIGH-RES POSTER LIGHTBOX MODAL          */}
      {/* ------------------------------------------------------------------ */}
      {isPosterLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setIsPosterLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full bg-stone-900 border border-stone-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-5 py-4 bg-stone-950/90 border-b border-stone-800 text-white">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-bold text-sm sm:text-base font-editorial">
                  {lang === 'hi' ? 'एक सदस्यता — जनकल्याण सहायता (आधिकारिक प्रपत्र)' : 'One Membership — Welfare Schemes (Official Notice)'}
                </span>
                <span className="hidden sm:inline-block text-[11px] text-amber-300/80 font-mono bg-white/10 px-2 py-0.5 rounded-full">
                  JSCT Gorakhpur
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPosterLightboxOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Poster High-Res Image Display */}
            <div className="p-3 sm:p-6 flex items-center justify-center bg-stone-950/60 overflow-hidden">
              <img
                src="/images/ek-sadasyata-poster.jpg"
                alt="एक सदस्यता - तीन सहायता आधिकारिक पोस्टर"
                className="max-h-[72vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-stone-800"
              />
            </div>

            {/* Modal Bottom Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 bg-stone-950/95 border-t border-stone-800">
              <div className="text-xs text-stone-300 text-center sm:text-left">
                <span className="font-bold text-amber-300 block">जन से जन तक – सहयोग हर जरूरतमंद तक</span>
                <span className="text-stone-400 text-[11px]">
                  सदस्यता शुल्क: मात्र ₹50 प्रति वर्ष • सहयोग राशि: ₹50 प्रति माह / अपील
                </span>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Link
                  href="/register"
                  onClick={() => setIsPosterLightboxOpen(false)}
                  className="flex-1 sm:flex-none h-11 min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-terracotta to-terracotta-hover text-white text-xs font-bold transition-all shadow-md text-center flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'सदस्यता प्रपत्र भरें (₹50)' : 'Register Member (₹50)'}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsPosterLightboxOpen(false)}
                  className="h-11 min-h-[44px] px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors active:scale-95 flex items-center justify-center"
                >
                  {lang === 'hi' ? 'बंद करें' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
