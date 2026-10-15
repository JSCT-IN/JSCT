'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Users
} from 'lucide-react';

export interface HeroSlide {
  id: string;
  image: string;
  badgeHi: string;
  badgeEn: string;
  titleHi: string;
  titleEn: string;
  subtitleHi: string;
  subtitleEn: string;
  ctaTextHi?: string;
  ctaTextEn?: string;
  ctaLink?: string;
  secondaryCtaTextHi?: string;
  secondaryCtaTextEn?: string;
  secondaryCtaLink?: string;
}

interface HeroSliderProps {
  slides?: HeroSlide[];
}

export default function HeroSlider({ slides: customSlides }: HeroSliderProps) {
  const { lang } = useTranslation();

  // Initial slides array (ready to receive more user-uploaded images)
  const defaultSlides: HeroSlide[] = [
    {
      id: 'slide-1',
      image: '/images/hero-community.jpg',
      badgeHi: 'जन सेवा चैरिटेबल ट्रस्ट (JSCT) • उत्तर प्रदेश',
      badgeEn: 'Jan Sewa Charitable Trust (JSCT) • Uttar Pradesh',
      titleHi: 'जन से जन तक सहयोग, हर जरूरतमंद परिवार को संबल',
      titleEn: 'People-to-People Solidarity, Relief to Every Family',
      subtitleHi: 'उत्तर प्रदेश के कर्मचारियों व नागरिकों का 100% पारदर्शी, गैर-सरकारी पारस्परिक सुरक्षा संबल मंच।',
      subtitleEn: 'A 100% transparent mutual welfare network for dedicated citizens and employees in UP.',
      ctaTextHi: 'नया सदस्य पंजीकरण (₹50)',
      ctaTextEn: 'Join as Member (₹50)',
      ctaLink: '/register',
      secondaryCtaTextHi: 'सक्रिय सहयोग अपीलें',
      secondaryCtaTextEn: 'Active Sahyog Appeals',
      secondaryCtaLink: '/appeals'
    },
    {
      id: 'slide-2',
      image: '/images/hero-community.jpg', // Companion slide ready to be swapped with user's next image
      badgeHi: '₹15 लाख दिवंगत संबल • ₹5 लाख बेटी विवाह',
      badgeEn: '₹15 Lakh Bereavement Aid • ₹5 Lakh Marriage Support',
      titleHi: 'मात्र ₹50 के सूक्ष्म सहयोग से लाखों का सुरक्षा चक्र',
      titleEn: 'Micro-Contributions Powering Massive Social Security',
      subtitleHi: '0% कमीशन, कोई बिचौलिया नहीं — 100% प्रत्यक्ष सहायता सीधे पीड़ित परिवार के बैंक खाते में।',
      subtitleEn: 'Zero commission, zero middlemen — 100% direct assistance straight into verified bank accounts.',
      ctaTextHi: 'संस्था की नियमावली पढ़ें',
      ctaTextEn: 'Read Official Bylaws',
      ctaLink: '/niyamawali',
      secondaryCtaTextHi: 'सदस्यता कार्ड डाउनलोड',
      secondaryCtaTextEn: 'Member ID Card',
      secondaryCtaLink: '/member-card'
    }
  ];

  const slides = customSlides && customSlides.length > 0 ? customSlides : defaultSlides;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Auto-play timer (slides every 5 seconds, pauses on mouse hover or touch)
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, totalSlides, nextSlide]);

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 45) {
      nextSlide();
    } else if (distance < -45) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-border/80 shadow-warm-lg bg-stone-900 min-h-[300px] sm:min-h-[360px] md:min-h-[420px] lg:h-[460px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides Track */}
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Image with Zoom Effect */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={lang === 'hi' ? slide.titleHi : slide.titleEn}
                className={`w-full h-full object-cover object-top sm:object-center transform transition-transform duration-10000 ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />

              {/* Rich Multi-Layered Gradient Overlay: bottom dark for text, top clear for faces */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 via-55% to-transparent sm:bg-gradient-to-r sm:from-black/90 sm:via-black/55 sm:to-black/20 pointer-events-none" />

              {/* Slide Content Overlay */}
              <div className="absolute inset-0 z-20 flex flex-col justify-end sm:justify-center p-3.5 sm:p-10 lg:p-14 text-white max-w-2.5xl space-y-1.5 sm:space-y-3.5">
                
                {/* Floating Top Badge */}
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-[9px] sm:text-xs font-bold uppercase tracking-wider text-amber-200 self-start shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                  <span>{lang === 'hi' ? slide.badgeHi : slide.badgeEn}</span>
                </div>

                {/* Main Heading */}
                <h2 className="font-editorial text-sm xs:text-base sm:text-2xl md:text-3xl lg:text-[2.5rem] font-black leading-tight sm:leading-[1.22] tracking-tight drop-shadow-md">
                  {lang === 'hi' ? slide.titleHi : slide.titleEn}
                </h2>

                {/* Subtitle / Description (Cleanly displayed on desktop, hidden on tiny mobile so faces are prominent) */}
                <p className="hidden sm:block text-xs sm:text-sm md:text-base text-stone-200/90 leading-relaxed max-w-xl font-normal drop-shadow-sm">
                  {lang === 'hi' ? slide.subtitleHi : slide.subtitleEn}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-0.5 sm:pt-1">
                  {slide.ctaLink && (
                    <Link
                      href={slide.ctaLink}
                      className="h-8 sm:h-11 px-3 sm:px-5 rounded-lg sm:rounded-xl bg-terracotta hover:bg-terracotta-hover active:bg-terracotta-dark text-white font-bold text-[11px] sm:text-sm shadow-warm flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <span>{lang === 'hi' ? slide.ctaTextHi : slide.ctaTextEn}</span>
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </Link>
                  )}

                  {slide.secondaryCtaLink && (
                    <Link
                      href={slide.secondaryCtaLink}
                      className="h-8 sm:h-11 px-2.5 sm:px-4 rounded-lg sm:rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-semibold text-[11px] sm:text-sm transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <HeartHandshake className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
                      <span>{lang === 'hi' ? slide.secondaryCtaTextHi : slide.secondaryCtaTextEn}</span>
                    </Link>
                  )}
                </div>

              </div>
            </div>
          );
        })}

        {/* Previous Button (Visible on sm+ screens, mobile uses touch swipe) */}
        {totalSlides > 1 && (
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-md text-white border border-white/20 items-center justify-center transition-all active:scale-90 shadow-md cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Next Button (Visible on sm+ screens, mobile uses touch swipe) */}
        {totalSlides > 1 && (
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Slide"
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-md text-white border border-white/20 items-center justify-center transition-all active:scale-90 shadow-md cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Dot Pagination Indicators */}
        {totalSlides > 1 && (
          <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15">
            {slides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setCurrentIndex(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1}`}
                className={`transition-all duration-300 rounded-full h-2 ${
                  dotIdx === currentIndex
                    ? 'w-6 bg-terracotta'
                    : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
