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
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Calendar,
  Building2,
  Check,
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

  // Scheme Poster Lightbox State
  const [isPosterLightboxOpen, setIsPosterLightboxOpen] = useState(false);
  // Hero Right Column Tab: 'poster' (default matching dpswt.com) or 'summary'
  const [heroRightTab, setHeroRightTab] = useState<'poster' | 'summary'>('poster');

  // Hero Slider State (matches dpswt.com lE component)
  const [currentSlide, setCurrentSlide] = useState(0);

  // 75% Compliance Interactive Simulator State
  const [simTotalAppeals, setSimTotalAppeals] = useState(20);
  const [simContributed, setSimContributed] = useState(16);

  // Real JSCT Members List (The 7 real office bearers from handwritten record)
  const realMembers: Member[] = INITIAL_MEMBERS;

  // Slide content matching dpswt.com kinetic typography while branding JSCT
  const heroSlides = [
    {
      id: 1,
      badge: lang === 'hi' ? 'Zero-Custody P2P • 100% प्रत्यक्ष बैंक अंतरण' : 'Zero-Custody P2P • 100% Direct Bank Transfer',
      smallText: lang === 'hi' ? 'द्वारा संचालित — JAN SEWA CHARITABLE TRUST (JSCT)' : 'Operated by — JAN SEWA CHARITABLE TRUST (JSCT)',
      lines: [
        { text: lang === 'hi' ? 'जन से' : 'People to', highlight: false },
        { text: lang === 'hi' ? 'जन तक' : 'People,', highlight: true },
        { text: lang === 'hi' ? 'सहयोग हर' : 'Aid to Every', highlight: true },
        { text: lang === 'hi' ? 'जरूरतमंद तक' : 'Family in Need', highlight: true },
      ],
      description: lang === 'hi'
        ? 'उत्तर प्रदेश के समर्पित कर्मचारियों एवं नागरिकों का पारस्परिक कल्याण मंच। किसी आकस्मिक आपदा या निधन पर प्रत्येक साथी मात्र ₹50 का सीधा सहयोग भेजता है।'
        : 'Mutual welfare solidarity platform for citizens and public employees in UP. During sudden bereavement, every member sends ₹50 directly.',
    },
    {
      id: 2,
      badge: lang === 'hi' ? '₹50 का सूक्ष्म अंशदान • ₹20 लाख तक संबल' : '₹50 Micro-Philanthropy • Up to ₹20 Lakhs Relief',
      smallText: lang === 'hi' ? 'JSCT — संकट में असहायों का सच्चा संबल' : 'JSCT — Dedicated Support for the Helpless',
      lines: [
        { text: lang === 'hi' ? 'आपका' : 'Your Tiny', highlight: false },
        { text: lang === 'hi' ? 'सहयोग' : '₹50 Support', highlight: true },
        { text: lang === 'hi' ? 'किसी का' : 'Can Save a', highlight: false },
        { text: lang === 'hi' ? 'जीवन बचा सकता है' : 'Family Life', highlight: true },
      ],
      description: lang === 'hi'
        ? 'कोई मध्यस्थ नहीं, कोई एस्क्रो वॉलेट नहीं। धन सीधे पीड़ित साथी के अधिकृत नामिनी के बैंक खाते व UPI आईडी में जमा होता है।'
        : 'Zero escrow wallet, no commission. Funds are transferred straight into the verified nominee bank account & UPI ID.',
    },
    {
      id: 3,
      badge: lang === 'hi' ? '90-दिन सक्रियता • आधार व सेवा अभिलेख सत्यापित' : '90-Day Lock-in • Aadhaar & Service Verified',
      smallText: lang === 'hi' ? 'हम 100% पारदर्शिता एवं सेवा भाव के लिए प्रतिबद्ध हैं' : 'Committed to 100% Transparency and Mutual Service',
      lines: [
        { text: lang === 'hi' ? 'साथ चलें' : 'Walk Together,', highlight: true },
        { text: lang === 'hi' ? 'साथ बढ़ें' : 'Grow Together', highlight: false },
        { text: lang === 'hi' ? 'JSCT परिवार के साथ' : 'With JSCT Family', highlight: true },
      ],
      description: lang === 'hi'
        ? 'न्यूनतम 75% सहयोग अनुपालन बनाए रखें और अपने परिवार को आजीवन आर्थिक सुरक्षा और सम्मान का संबल प्रदान करें।'
        : 'Maintain a minimum 75% compliance score and secure your family with lifelong dignified economic solidarity.',
    },
  ];

  useEffect(() => {
    const load = () => {
      setAppeals(DPSWTStore.getAppeals());
    };
    load();

    window.addEventListener('dpswt_state_change', load);
    return () => window.removeEventListener('dpswt_state_change', load);
  }, []);

  // Auto-advance slides every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

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

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

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
        ? '90-दिन सक्रियता अवधि पूर्ण होने पर असामयिक निधन पर ₹20 लाख तक का सामाजिक सुरक्षा संबल।'
        : 'Up to ₹20 Lakhs mutual bereavement solidarity upon 90-day active compliance.',
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
    <div className="space-y-12 sm:space-y-20 pb-16">
      
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
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/25 font-bold uppercase font-mono tracking-tight text-amber-200">
                    {item.badge}
                  </span>
                  <span className={item.highlight ? 'font-bold text-white' : 'text-amber-50'}>
                    {item.text}
                  </span>
                  <span className="text-white/40 text-xs px-2">•</span>
                </div>
              ))}

              {/* Duplicate Track (for seamless infinite continuous loop) */}
              {announcements.map((item) => (
                <div key={`track2-${item.id}`} className="inline-flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/25 font-bold uppercase font-mono tracking-tight text-amber-200">
                    {item.badge}
                  </span>
                  <span className={item.highlight ? 'font-bold text-white' : 'text-amber-50'}>
                    {item.text}
                  </span>
                  <span className="text-white/40 text-xs px-2">•</span>
                </div>
              ))}

            </div>
          </div>

          {/* Pinned Right Quick Actions */}
          <div className="shrink-0 hidden md:flex items-center gap-3 z-20 text-xs font-semibold pl-2">
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
      {/* HERO SECTION WITH SLIDER (matches dpswt.com lE layout & aesthetic) */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-br from-white via-canvas-inset/60 to-amber-50/30 border border-stone-border shadow-warm-md overflow-hidden">
          
          {/* Ambient light gradient blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-terracotta/8 rounded-full blur-3xl pointer-events-none -z-0" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-sage/8 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-14">
            
            {/* Left Column: Kinetic Headlines & Actions */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Slider Pill Indicator */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-border shadow-xs text-xs text-charcoal font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sage"></span>
                  </span>
                  <span className="font-mono text-terracotta font-semibold">JSCT</span>
                  <span className="text-stone-muted">•</span>
                  <span className="text-charcoal-muted line-clamp-1">
                    {heroSlides[currentSlide].badge}
                  </span>
                </div>

                {/* Slider Controls Arrows */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={prevSlide}
                    aria-label="Previous Slide"
                    className="w-8 h-8 rounded-full bg-white hover:bg-canvas-inset border border-stone-border flex items-center justify-center text-charcoal shadow-xs transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextSlide}
                    aria-label="Next Slide"
                    className="w-8 h-8 rounded-full bg-white hover:bg-canvas-inset border border-stone-border flex items-center justify-center text-charcoal shadow-xs transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tagline Small Sub */}
              <div className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-terracotta">
                {heroSlides[currentSlide].smallText}
              </div>

              {/* Kinetic Large Title (from dpswt.com typography) */}
              <div className="space-y-1">
                {heroSlides[currentSlide].lines.map((line, idx) => (
                  <h1
                    key={idx}
                    className={`font-editorial text-2xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none break-words ${
                      line.highlight
                        ? 'bg-gradient-to-r from-terracotta via-amber-600 to-terracotta-dark bg-clip-text text-transparent'
                        : 'text-charcoal'
                    }`}
                  >
                    {line.text}
                  </h1>
                ))}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-base text-driftwood leading-relaxed max-w-xl font-normal">
                {heroSlides[currentSlide].description}
              </p>

              {/* Call to Actions (matching dpswt button row, thumb-friendly on mobile) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-6 sm:px-7 py-3.5 rounded-2xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-xs sm:text-sm shadow-warm-md hover:shadow-warm-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>{lang === 'hi' ? 'नया सदस्य पंजीकरण (₹50)' : 'REGISTER NOW (₹50)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/appeals"
                  className="w-full sm:w-auto px-5 sm:px-6 py-3.5 rounded-2xl bg-white hover:bg-canvas-inset active:scale-[0.98] border border-stone-border text-charcoal font-semibold text-xs sm:text-sm shadow-warm transition-all flex items-center justify-center gap-2"
                >
                  <HeartHandshake className="w-4 h-4 text-terracotta" />
                  <span>{lang === 'hi' ? 'सक्रिय सहयोग सूची' : 'CURRENT SAHYOG'}</span>
                </Link>

                <Link
                  href="/member"
                  className="w-full sm:w-auto px-4 sm:px-5 py-3.5 rounded-2xl bg-canvas-inset hover:bg-stone-border/40 text-charcoal-muted hover:text-charcoal font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Users className="w-4 h-4 text-driftwood" />
                  <span>{lang === 'hi' ? 'सदस्य सूची' : 'MEMBERS'}</span>
                </Link>
              </div>

              {/* Slide Dots Indicator */}
              <div className="flex items-center gap-2 pt-2">
                {heroSlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentSlide ? 'w-8 bg-terracotta' : 'w-2 bg-stone-border hover:bg-driftwood'
                    }`}
                  />
                ))}
              </div>

            </div>

            {/* Right Column: Hero Visual Showcase (featuring official scheme poster like dpswt.com) */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md rounded-3xl bg-white p-4 sm:p-5 border border-stone-border shadow-warm-lg space-y-4">
                
                {/* View Switcher Tabs: Poster View vs Trust Summary */}
                <div className="flex items-center justify-between border-b border-stone-border/70 pb-3">
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-canvas-inset border border-stone-border/60 text-xs">
                    <button
                      type="button"
                      onClick={() => setHeroRightTab('poster')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                        heroRightTab === 'poster'
                          ? 'bg-white text-terracotta shadow-xs border border-stone-border/60'
                          : 'text-driftwood hover:text-charcoal'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{lang === 'hi' ? 'योजना पोस्टर' : 'Scheme Poster'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroRightTab('summary')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                        heroRightTab === 'summary'
                          ? 'bg-white text-charcoal shadow-xs border border-stone-border/60'
                          : 'text-driftwood hover:text-charcoal'
                      }`}
                    >
                      <Info className="w-3.5 h-3.5 text-sage" />
                      <span>{lang === 'hi' ? 'ट्रस्ट विवरण' : 'Trust Summary'}</span>
                    </button>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sage-light text-sage text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    100% सत्यापित
                  </span>
                </div>

                {/* Tab 1: Official Scheme Poster Showcase (matches dpswt.com hero image) */}
                {heroRightTab === 'poster' && (
                  <div className="space-y-3">
                    <div
                      onClick={() => setIsPosterLightboxOpen(true)}
                      className="group relative rounded-2xl overflow-hidden border-2 border-amber-300/80 shadow-warm cursor-pointer bg-stone-900 aspect-[4/5] sm:aspect-[3/4] flex items-center justify-center"
                      title={lang === 'hi' ? 'बड़ा पोस्टर देखने के लिए क्लिक करें' : 'Click to enlarge poster'}
                    >
                      <img
                        src="/images/ek-sadasyata-poster.jpg"
                        alt="एक सदस्यता - तीन सहायता"
                        className="w-full h-full object-contain animate-kenburns transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Top floating pill */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
                        <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-amber-300 text-[10px] sm:text-xs font-bold border border-amber-400/40 shadow-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>एक सदस्यता — तीन सहायता</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-terracotta/90 backdrop-blur-md text-white text-[10px] font-bold shadow-xs">
                          ₹50/वर्ष
                        </span>
                      </div>

                      {/* Hover Overlay with Zoom Button */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 z-20">
                        <span className="px-4 py-2 rounded-xl bg-white/95 text-charcoal font-bold text-xs shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <ZoomIn className="w-4 h-4 text-terracotta" />
                          <span>{lang === 'hi' ? 'पूरा पोस्टर ज़ूम करें' : 'Enlarge Full Poster'}</span>
                        </span>
                      </div>

                      {/* Bottom Key Highlights Strip */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 pt-6 z-10 text-white">
                        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
                          <div className="p-1 rounded bg-white/10 backdrop-blur-xs">
                            <span className="text-amber-300 block text-[9px]">01. दिवंगत</span>
                            <span>₹10 Lakh</span>
                          </div>
                          <div className="p-1 rounded bg-white/10 backdrop-blur-xs">
                            <span className="text-amber-300 block text-[9px]">02. शहनाई</span>
                            <span>₹5 Lakh</span>
                          </div>
                          <div className="p-1 rounded bg-white/10 backdrop-blur-xs">
                            <span className="text-amber-300 block text-[9px]">03. बधाई</span>
                            <span>₹2 Lakh</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions under poster */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsPosterLightboxOpen(true)}
                        className="py-2.5 px-3 rounded-xl bg-canvas-inset hover:bg-stone-border/40 text-charcoal font-bold text-xs border border-stone-border transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ZoomIn className="w-3.5 h-3.5 text-terracotta" />
                        <span>{lang === 'hi' ? 'बड़ा देखें' : 'Zoom Poster'}</span>
                      </button>

                      <Link
                        href="/register"
                        className="py-2.5 px-3 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-warm"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'सदस्य बनें (₹50)' : 'Join (₹50)'}</span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Tab 2: Trust Card Summary */}
                {heroRightTab === 'summary' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-stone-border/60 pb-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-terracotta to-amber-600 flex items-center justify-center text-white font-editorial font-bold text-base shadow-sm">
                        JS
                      </div>
                      <div>
                        <div className="font-bold text-sm text-charcoal leading-tight">
                          जन सेवा चैरिटेबल ट्रस्ट
                        </div>
                        <div className="text-[11px] font-mono text-driftwood">
                          JSCT • Gorakhpur (U.P.)
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-canvas-inset p-3.5 border border-stone-border/80 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-driftwood">{lang === 'hi' ? 'सदस्यता शुल्क:' : 'Joining Fee:'}</span>
                        <span className="font-mono font-bold text-charcoal">₹50 (One-time)</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-driftwood">{lang === 'hi' ? 'वार्षिक नवीनीकरण:' : 'Annual Renewal:'}</span>
                        <span className="font-mono font-bold text-charcoal">₹50 / Year</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-driftwood">{lang === 'hi' ? 'पात्रता आयु सीमा:' : 'Age Eligibility:'}</span>
                        <span className="font-mono font-bold text-sage">18 से 60 वर्ष</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-driftwood">{lang === 'hi' ? 'पारस्परिक संबल लक्ष्य:' : 'Mutual Aid Max:'}</span>
                        <span className="font-mono font-bold text-terracotta">₹20,00,000 (₹20 Lakh)</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/70 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-amber-300 flex items-center justify-center shrink-0 text-terracotta">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-charcoal block leading-tight">
                          {lang === 'hi' ? '100% प्रत्यक्ष UPI अंतरण' : '100% Direct UPI Transfer'}
                        </span>
                        <span className="text-[11px] text-driftwood">
                          {lang === 'hi' ? 'सीधे पीड़ित नामिनी के खाते में ₹50 सहयोग' : 'Direct ₹50 aid straight to nominee'}
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/register"
                      className="w-full py-3 rounded-xl bg-charcoal hover:bg-charcoal-deep text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <span>{lang === 'hi' ? 'ट्रस्ट सदस्यता प्रपत्र भरें' : 'Fill Registration Form'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* QUICK MISSION CALLOUT (matches dpswt.com oE component)             */}
      {/* ------------------------------------------------------------------ */}
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
            href="/rules"
            className="shrink-0 px-6 py-3.5 rounded-2xl bg-canvas-inset hover:bg-stone-border/50 text-charcoal font-bold text-xs border border-stone-border transition-colors flex items-center gap-2"
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta-light text-terracotta font-mono text-xs font-bold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'hi' ? 'विशेष जनकल्याण योजना • FLAGSHIP SOLIDARITY' : 'FLAGSHIP SOLIDARITY SCHEME'}</span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-5xl font-extrabold text-charcoal tracking-tight">
              {lang === 'hi' ? (
                <>
                  एक सदस्यता —{' '}
                  <span className="bg-gradient-to-r from-terracotta via-amber-600 to-terracotta-dark bg-clip-text text-transparent">
                    तीन सहायता
                  </span>
                </>
              ) : (
                'One Membership — Three Aims of Aid'
              )}
            </h2>

            <p className="text-xs sm:text-base font-semibold text-charcoal-muted max-w-2xl mx-auto leading-relaxed">
              {lang === 'hi'
                ? 'एक सदस्यता = पारिवारिक सदस्यता (पति, पत्नी और दो अविवाहित बच्चे शामिल)'
                : 'One Membership = Family Membership (Includes Husband, Wife & Two Unmarried Children)'}
            </p>
          </div>

          {/* Core Grid: Left Poster Showcase + Right 3 Schemes */}
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
                  alt="एक सदस्यता - तीन सहायता आधिकारिक पोस्टर"
                  className="w-full h-auto object-cover sm:object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                />

                {/* Corner Scheme Pill */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-amber-300 text-[11px] font-bold border border-amber-300/40 flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    <span>{lang === 'hi' ? 'आधिकारिक योजना प्रपत्र' : 'Official Notice'}</span>
                  </span>
                </div>

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
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-terracotta hover:text-terracotta-hover transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'पूरा पोस्टर हाई-रेजोल्यूशन में देखें' : 'View High-Res Poster'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Right: The 3 Detailed Scheme Pillars */}
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

                <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 flex items-baseline gap-2">
                  <span className="text-xs text-rose-800 font-semibold">{lang === 'hi' ? 'सहयोग लक्ष्य:' : 'Aid Goal:'}</span>
                  <span className="font-editorial text-base sm:text-lg font-extrabold text-rose-700">
                    ₹10,000 से लेकर अधिकतम ₹10,00,000 तक
                  </span>
                  <span className="text-[11px] text-rose-600 hidden sm:inline">(कराने का प्रयास)</span>
                </div>

                <p className="text-xs sm:text-sm text-driftwood leading-relaxed">
                  {lang === 'hi'
                    ? 'सदस्य के असामयिक निधन की दुखद स्थिति में पीड़ित परिवार के अधिकृत नामिनी के खाते में सभी सक्रिय सदस्यों द्वारा ₹50 का सीधा सहयोग प्रेषित किया जाता है।'
                    : 'In the tragic event of member demise, all active members transfer ₹50 directly into the verified nominee bank account without intermediaries.'}
                </p>

                <div className="flex items-center gap-2 text-[11px] font-mono text-charcoal-muted pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{lang === 'hi' ? 'पात्रता: 90 दिन लॉकिंग अवधि पूर्ण एवं 75% सहयोग अनुपालन अनिवार्य' : 'Eligibility: 90 days active & 75% compliance'}</span>
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

                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 flex items-baseline gap-2">
                  <span className="text-xs text-amber-900 font-semibold">{lang === 'hi' ? 'सहयोग लक्ष्य:' : 'Aid Goal:'}</span>
                  <span className="font-editorial text-base sm:text-lg font-extrabold text-amber-800">
                    ₹10,000 से लेकर अधिकतम ₹5,00,000 तक
                  </span>
                  <span className="text-[11px] text-amber-700 hidden sm:inline">(कराने का प्रयास)</span>
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

              {/* Scheme 03: Beta Vivah Badhai */}
              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-sky-200/80 shadow-warm hover:border-sky-400 transition-all space-y-3 group">
                <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                      03
                    </span>
                    <h3 className="font-editorial text-lg sm:text-xl font-bold text-charcoal group-hover:text-sky-800 transition-colors">
                      {lang === 'hi' ? 'बेटा विवाह बधाई योजना' : 'Beta Vivah Badhai Scheme'}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-bold">
                    {lang === 'hi' ? 'मंगल बधाई' : 'Son Marriage'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 flex items-baseline gap-2">
                  <span className="text-xs text-sky-900 font-semibold">{lang === 'hi' ? 'सहयोग लक्ष्य:' : 'Aid Goal:'}</span>
                  <span className="font-editorial text-base sm:text-lg font-extrabold text-sky-800">
                    ₹10,000 से लेकर अधिकतम ₹2,00,000 तक
                  </span>
                  <span className="text-[11px] text-sky-700 hidden sm:inline">(कराने का प्रयास)</span>
                </div>

                <p className="text-xs sm:text-sm text-driftwood leading-relaxed">
                  {lang === 'hi'
                    ? 'परिवार के जैविक सुपुत्र के विवाह संस्कार के शुभ अवसर पर ट्रस्ट परिवार द्वारा बधाई स्वरूप सहयोग राशि प्रदान कराने का प्रयास।'
                    : 'Congratulations mutual aid gift from the trust family on the auspicious wedding occasion of biological son.'}
                </p>

                <div className="flex items-center gap-2 text-[11px] font-mono text-charcoal-muted pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>{lang === 'hi' ? 'पात्रता: पुत्र की आयु न्यूनतम 21 वर्ष पूर्ण; अधिकतम दो पुत्रों हेतु मान्य' : 'Eligibility: Son age min 21; up to two sons'}</span>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Banner: Slogan, Facts & Direct Registration CTA */}
          <div className="rounded-2xl sm:rounded-3xl bg-charcoal text-white p-5 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 shadow-warm-md">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold font-mono">
                <span>जन से जन तक – सहयोग हर जरूरतमंद तक</span>
              </div>
              <h3 className="font-editorial text-xl sm:text-2xl font-bold">
                {lang === 'hi' ? 'एक पारिवारिक सदस्यता से पाएं तीनों योजनाओं का संबल' : 'One Family Membership Powers All 3 Schemes'}
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
                className="px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-xs sm:text-sm shadow-warm transition-transform active:scale-95 text-center flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>{lang === 'hi' ? 'सदस्यता के लिए यहाँ क्लिक करें (₹50)' : 'Register for Membership (₹50)'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setIsPosterLightboxOpen(true)}
                className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 border border-white/20"
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-driftwood block">नामिनी का नाम:</span>
                        <span className="font-semibold text-charcoal">
                          {appeal.nominee_snapshot.full_name} ({appeal.nominee_snapshot.relationship})
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
                        <span className="font-mono font-bold text-charcoal">
                          {appeal.nominee_snapshot.account_number}
                        </span>
                      </div>
                      <div>
                        <span className="text-driftwood block">IFSC कोड:</span>
                        <span className="font-mono font-bold text-charcoal">
                          {appeal.nominee_snapshot.ifsc_code}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-stone-border/50 flex items-center justify-between text-[11px]">
                      <span className="text-driftwood">UPI ID:</span>
                      <span className="font-mono font-bold text-terracotta bg-white px-2 py-0.5 rounded border border-stone-border">
                        {appeal.nominee_snapshot.upi_id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAppealForUpi(appeal)}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-xs shadow-warm transition-transform active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>सीधे ₹50 भेजें (UPI & QR)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedAppealForSlip(appeal)}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl bg-canvas-inset hover:bg-white border border-stone-border text-charcoal font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <span>रसीद अपलोड करें</span>
                  </button>

                  <Link
                    href={`/appeals/${appeal.id}`}
                    className="w-full sm:w-auto py-3 px-3 rounded-xl border border-stone-border text-driftwood hover:text-charcoal hover:bg-canvas-inset text-xs flex items-center justify-center"
                    title="View Case Details"
                  >
                    <span>केस विवरण →</span>
                  </Link>
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

        {/* 7 Real Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {realMembers.map((member, index) => {
            const isHead = index === 0;
            const isSecretary = index === 1;
            const isTreasurer = index === 2;

            // Generate clean initials
            const nameParts = member.full_name.split(' ');
            const initials = nameParts.length >= 2 
              ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
              : member.full_name.slice(0, 2).toUpperCase();

            // Designation display in Hindi & English
            let roleTitle = 'कार्यकारिणी सदस्य (Executive Member)';
            let roleBadgeBg = 'bg-stone-100 text-charcoal';
            if (isHead) {
              roleTitle = 'अध्यक्ष (President / Head)';
              roleBadgeBg = 'bg-terracotta-light text-terracotta font-bold';
            } else if (isSecretary) {
              roleTitle = 'सचिव (General Secretary)';
              roleBadgeBg = 'bg-amber-100 text-amber-800 font-bold';
            } else if (isTreasurer) {
              roleTitle = 'कोषाध्यक्ष (Treasurer / Inspector)';
              roleBadgeBg = 'bg-sage-light text-sage font-bold';
            }

            return (
              <div
                key={member.id}
                className="group rounded-3xl bg-white border border-stone-border p-6 shadow-warm hover:shadow-warm-md hover:border-terracotta/40 transition-all text-center flex flex-col justify-between"
              >
                <div className="space-y-4">
                  
                  {/* Avatar Wrap with Oval Frame (from dpswt.com avatarWrap) */}
                  <div className="relative mx-auto w-24 h-24 rounded-full p-1 bg-gradient-to-br from-terracotta/20 via-stone-200 to-sage/20 group-hover:scale-105 transition-transform">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.full_name}
                        className="w-full h-full rounded-full object-cover border-2 border-white shadow-xs"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-charcoal to-charcoal-muted flex items-center justify-center text-white font-editorial text-2xl font-bold border-2 border-white">
                        {initials}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-sage border-2 border-white flex items-center justify-center text-white shadow-xs" title="Verified Trustee">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  </div>

                  {/* Name & Role */}
                  <div className="space-y-1">
                    <h3 className="font-editorial text-base sm:text-lg font-bold text-charcoal group-hover:text-terracotta transition-colors">
                      {member.full_name}
                    </h3>
                    <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] ${roleBadgeBg}`}>
                        {roleTitle}
                      </span>
                    </div>
                  </div>

                  {/* Details / Dept / District */}
                  <div className="text-xs text-driftwood space-y-1 pt-1">
                    <div className="font-mono text-[11px] text-terracotta font-semibold">
                      ID: {member.membership_id}
                    </div>
                    <div className="truncate">
                      {member.department}
                    </div>
                    <div className="text-driftwood/80 text-[11px] flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3 text-driftwood" />
                      <span>{member.district}</span>
                    </div>
                  </div>

                </div>

                {/* Footer Action */}
                <div className="pt-4 mt-4 border-t border-stone-border/60">
                  <Link
                    href={`/member?search=${encodeURIComponent(member.membership_id)}`}
                    className="text-[11px] font-semibold text-terracotta hover:underline inline-flex items-center gap-1"
                  >
                    <span>प्रोफ़ाइल सत्यापित करें</span>
                    <ChevronRight className="w-3 h-3" />
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
              className="px-6 py-2.5 rounded-xl border border-stone-border text-xs font-bold text-charcoal hover:bg-canvas-inset transition-colors"
            >
              {showFullAbout ? (lang === 'hi' ? 'कम विवरण देखें (SHOW LESS)' : 'SHOW LESS') : (lang === 'hi' ? 'विस्तृत विवरण पढ़ें (READ MORE)' : 'READ MORE')}
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
      {/* LIVE AUDIT COUNTER METRICS                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          
          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-stone-border shadow-warm hover:shadow-warm-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-terracotta/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between text-driftwood text-xs mb-1.5 sm:mb-2">
              <span className="font-medium">{t.statMembers}</span>
              <Users className="w-4 h-4 text-terracotta" />
            </div>
            <div className="font-editorial text-2xl sm:text-4xl font-bold text-charcoal tracking-tight">
              1,28,450+
            </div>
            <div className="text-[11px] text-sage font-semibold mt-1 flex items-center gap-1">
              <span>{t.statMembersSub}</span>
            </div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-stone-border shadow-warm hover:shadow-warm-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-sage/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between text-driftwood text-xs mb-1.5 sm:mb-2">
              <span className="font-medium">{t.statDisbursed}</span>
              <Coins className="w-4 h-4 text-sage" />
            </div>
            <div className="font-editorial text-2xl sm:text-4xl font-bold text-charcoal tracking-tight">
              ₹34.80 Cr+
            </div>
            <div className="text-[11px] text-driftwood mt-1">
              {t.statDisbursedSub}
            </div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-stone-border shadow-warm hover:shadow-warm-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-terracotta/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between text-driftwood text-xs mb-1.5 sm:mb-2">
              <span className="font-medium">{t.statAppeals}</span>
              <Award className="w-4 h-4 text-terracotta" />
            </div>
            <div className="font-editorial text-2xl sm:text-4xl font-bold text-charcoal tracking-tight">
              182 {lang === 'hi' ? 'परिवार' : 'Families'}
            </div>
            <div className="text-[11px] text-driftwood mt-1">
              {t.statAppealsSub}
            </div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-stone-border shadow-warm hover:shadow-warm-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-sage/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between text-driftwood text-xs mb-1.5 sm:mb-2">
              <span className="font-medium">{t.statCompliance}</span>
              <Scale className="w-4 h-4 text-sage" />
            </div>
            <div className="font-editorial text-2xl sm:text-4xl font-bold text-sage tracking-tight">
              94.6%
            </div>
            <div className="text-[11px] text-driftwood mt-1">
              {t.statComplianceSub}
            </div>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="p-6 rounded-3xl bg-white border border-stone-border text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-terracotta-light text-terracotta font-editorial font-bold text-lg flex items-center justify-center mx-auto">
              1
            </div>
            <h3 className="font-bold text-charcoal text-base">
              ऑनलाइन पंजीकरण (₹50)
            </h3>
            <p className="text-xs text-driftwood leading-relaxed">
              आधार कार्ड व सेवा पहचान पत्र के साथ ऑनलाइन फॉर्म भरें और ₹50 सदस्यता शुल्क जमा करें।
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-border text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 font-editorial font-bold text-lg flex items-center justify-center mx-auto">
              2
            </div>
            <h3 className="font-bold text-charcoal text-base">
              90-दिन सक्रियता अवधि
            </h3>
            <p className="text-xs text-driftwood leading-relaxed">
              सत्यापन के उपरांत 90 दिन की मानक प्रतीक्षा अवधि पूर्ण होने पर पूर्ण कल्याण कवच सक्रिय होता है।
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-border text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sage-light text-sage font-editorial font-bold text-lg flex items-center justify-center mx-auto">
              3
            </div>
            <h3 className="font-bold text-charcoal text-base">
              ₹50 प्रति अपील सीधा सहयोग
            </h3>
            <p className="text-xs text-driftwood leading-relaxed">
              प्रत्येक सक्रिय अपील में सीधे नामिनी के खाते में ₹50 अंतरित कर 12-अंक UTR रसीद पोर्टल पर दर्ज करें।
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-border text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-charcoal text-white font-editorial font-bold text-lg flex items-center justify-center mx-auto">
              4
            </div>
            <h3 className="font-bold text-charcoal text-base">
              ₹20 लाख तक संबल गारंटी
            </h3>
            <p className="text-xs text-driftwood leading-relaxed">
              75% नियमित अनुपालन रहने पर किसी भी आकस्मिक विपत्ति में पीड़ित परिवार को समाज का पूर्ण संबल।
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
            <div className="bg-white p-6 rounded-2xl border border-stone-border space-y-6">
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

              {/* Dynamic Output Box */}
              <div
                className={`p-5 rounded-2xl border transition-colors flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  simIsEligible
                    ? 'bg-sage-light/50 border-sage/40 text-sage-dark'
                    : 'bg-terracotta-light/50 border-terracotta/40 text-terracotta-dark'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-editorial text-2xl font-bold ${
                      simIsEligible ? 'bg-sage text-white' : 'bg-terracotta text-white'
                    }`}
                  >
                    {simRatio}%
                  </div>
                  <div>
                    <div className="font-bold text-sm">
                      {simIsEligible ? t.simEligible : t.simCritical}
                    </div>
                    <div className="text-xs text-charcoal-muted mt-0.5">
                      {simIsEligible ? (
                        <span>{t.simEligibleDesc}</span>
                      ) : (
                        <span>
                          {t.simCriticalDescPrefix}
                          <strong className="text-terracotta">
                            {Math.ceil(simTotalAppeals * 0.75) - simContributed}
                          </strong>
                          {t.simCriticalDescSuffix}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-center sm:text-right">
                  <span className="text-[10px] uppercase font-mono block text-driftwood">
                    {t.simTotalContributedAmount}
                  </span>
                  <span className="font-editorial text-xl font-bold text-charcoal">
                    {formatINR(simContributed * 50)}
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
                <div className="text-driftwood font-mono">
                  +91 9264945875 • +91 9936639215 • +91 9005088708
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-charcoal">ईमेल व सहायता (Email)</div>
                <div className="text-driftwood font-mono">
                  infodpswt@dpswt.com • info@jsct.org.in
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
          <div className="w-12 h-12 rounded-2xl bg-terracotta flex items-center justify-center mx-auto text-white">
            <HeartHandshake className="w-6 h-6" />
          </div>

          <h2 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight">
            {lang === 'hi' ? 'आज ही JSCT जन सेवा परिवार का हिस्सा बनें' : 'Join JSCT Family Today'}
          </h2>

          <p className="text-xs sm:text-base text-stone-muted max-w-xl mx-auto leading-relaxed font-light">
            {lang === 'hi'
              ? 'आधार कार्ड एवं विभागीय पहचान के साथ सरल 2-मिनट पंजीकरण। अपने परिवार की सुरक्षा सुनिश्चित करें और जरूरतमंद साथियों के संबल बनें।'
              : 'Simple 2-minute registration with Aadhaar and service department details. Ensure mutual safety for your loved ones.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-sm shadow-warm transition-all touch-target"
            >
              {lang === 'hi' ? 'नया सदस्य पंजीकरण (₹50)' : 'Register Member (₹50)'}
            </Link>

            <Link
              href="/member"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/20 touch-target"
            >
              {lang === 'hi' ? 'समस्त सदस्य सूची देखें' : 'View Member Directory'}
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
                  {lang === 'hi' ? 'एक सदस्यता — तीन सहायता (आधिकारिक प्रपत्र)' : 'One Membership — Three Schemes (Official Notice)'}
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
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-terracotta to-terracotta-hover text-white text-xs font-bold transition-all shadow-md text-center flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'सदस्यता प्रपत्र भरें (₹50)' : 'Register Member (₹50)'}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsPosterLightboxOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors"
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
