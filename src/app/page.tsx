'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DPSWTStore } from '@/lib/store';
import { Appeal } from '@/types';
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
} from 'lucide-react';

export default function HomePage() {
  const { lang, t } = useTranslation();
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [selectedAppealForUpi, setSelectedAppealForUpi] = useState<Appeal | null>(null);
  const [selectedAppealForSlip, setSelectedAppealForSlip] = useState<Appeal | null>(null);

  // Interactive 75% Compliance Simulator state
  const [simTotalAppeals, setSimTotalAppeals] = useState(20);
  const [simContributed, setSimContributed] = useState(16);

  useEffect(() => {
    const load = () => {
      setAppeals(DPSWTStore.getAppeals());
    };
    load();

    window.addEventListener('dpswt_state_change', load);
    return () => window.removeEventListener('dpswt_state_change', load);
  }, []);

  const simRatio = Math.round((simContributed / simTotalAppeals) * 100);
  const simIsEligible = simRatio >= 75;

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* ------------------------------------------------------------------ */}
      {/* HERO SECTION: Editorial Mission & Value Proposition               */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative pt-8 sm:pt-14 pb-12 overflow-hidden border-b border-stone-border/70">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-terracotta/5 to-transparent pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Pill: Trust Model */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-stone-border shadow-warm text-xs text-charcoal font-medium">
              <span className="w-2 h-2 rounded-full bg-sage animate-ping" />
              <span className="font-mono text-terracotta font-semibold">Zero-Custody P2P Model</span>
              <span className="text-driftwood">•</span>
              <span>{t.heroPill}</span>
            </div>

            {/* Editorial Primary Heading */}
            <h1 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-bold text-charcoal tracking-tight leading-[1.15]">
              {t.heroTagline}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-driftwood leading-relaxed max-w-2xl mx-auto font-light">
              {t.heroSubtitle}
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Link
                href="/appeals"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-sm shadow-warm hover:shadow-warm-md transition-all flex items-center justify-center gap-2 touch-target"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>{t.heroCtaAppeals}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/rules"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-canvas-inset border border-stone-border text-charcoal font-semibold text-sm shadow-warm transition-all flex items-center justify-center gap-2 touch-target"
              >
                <span>{t.heroCtaRules}</span>
                <ChevronRight className="w-4 h-4 text-driftwood" />
              </Link>
            </div>

            {/* Fast Stats Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-driftwood">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sage" />
                <span>{t.heroBadge1}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sage" />
                <span>{t.heroBadge2}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-terracotta" />
                <span>{t.heroBadge3}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* LIVE AUDIT COUNTER METRICS                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-border shadow-warm">
            <div className="flex items-center justify-between text-driftwood text-xs mb-2">
              <span>{t.statMembers}</span>
              <Users className="w-4 h-4 text-terracotta" />
            </div>
            <div className="font-editorial text-2xl sm:text-4xl font-bold text-charcoal">
              1,28,450+
            </div>
            <div className="text-[11px] text-sage font-medium mt-1 flex items-center gap-1">
              <span>{t.statMembersSub}</span>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-border shadow-warm">
            <div className="flex items-center justify-between text-driftwood text-xs mb-2">
              <span>{t.statDisbursed}</span>
              <Coins className="w-4 h-4 text-sage" />
            </div>
            <div className="font-editorial text-2xl sm:text-4xl font-bold text-charcoal">
              ₹34.80 Cr+
            </div>
            <div className="text-[11px] text-driftwood mt-1">
              {t.statDisbursedSub}
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-border shadow-warm">
            <div className="flex items-center justify-between text-driftwood text-xs mb-2">
              <span>{t.statAppeals}</span>
              <Award className="w-4 h-4 text-terracotta" />
            </div>
            <div className="font-editorial text-2xl sm:text-4xl font-bold text-charcoal">
              182 {lang === 'hi' ? 'परिवार' : 'Families'}
            </div>
            <div className="text-[11px] text-driftwood mt-1">
              {t.statAppealsSub}
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-border shadow-warm">
            <div className="flex items-center justify-between text-driftwood text-xs mb-2">
              <span>{t.statCompliance}</span>
              <Scale className="w-4 h-4 text-sage" />
            </div>
            <div className="font-editorial text-2xl sm:text-4xl font-bold text-sage">
              94.6%
            </div>
            <div className="text-[11px] text-driftwood mt-1">
              {t.statComplianceSub}
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CORE PILLARS (THE DPSWT SYSTEM)                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-terracotta">
            {t.pillarsPill}
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-charcoal mt-1">
            {t.pillarsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-driftwood mt-2">
            {t.pillarsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl bg-white border border-stone-border shadow-warm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-canvas-inset border border-stone-border flex items-center justify-center text-terracotta">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-charcoal">
              {t.pillar1Title}
            </h3>
            <p className="text-xs text-driftwood leading-relaxed">
              {t.pillar1Desc}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-border shadow-warm space-y-3">
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

          <div className="p-6 rounded-2xl bg-white border border-stone-border shadow-warm space-y-3">
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

          <div className="p-6 rounded-2xl bg-white border border-stone-border shadow-warm space-y-3">
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
      {/* ACTIVE APPEALS PREVIEW                                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-terracotta">
              {t.homeAppealsPill}
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-charcoal mt-1">
              {t.homeAppealsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-driftwood mt-1">
              {t.homeAppealsSub}
            </p>
          </div>

          <Link
            href="/appeals"
            className="text-xs font-semibold text-terracotta hover:underline inline-flex items-center gap-1"
          >
            <span>{t.viewAllAppeals} ({appeals.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Appeals Cards Grid */}
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
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        isBereavement
                          ? 'bg-terracotta-light text-terracotta'
                          : 'bg-sage-light text-sage'
                      }`}
                    >
                      {isBereavement ? t.bereavementTitle : t.marriageTitle}
                    </span>
                    <span className="text-xs font-mono text-driftwood">{appeal.code}</span>
                  </div>

                  <h3 className="font-editorial text-xl font-bold text-charcoal leading-snug">
                    {appeal.title}
                  </h3>

                  <p className="text-xs text-driftwood line-clamp-3 mt-2 leading-relaxed">
                    {appeal.description}
                  </p>
                </div>

                {/* Nominee snapshot preview */}
                <div className="p-3.5 rounded-2xl bg-canvas-inset border border-stone-border/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-driftwood">
                    <span>{t.verifiedNominee}</span>
                    <span className="font-semibold text-charcoal">
                      {appeal.nominee_snapshot.full_name} ({appeal.nominee_snapshot.relationship})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-driftwood">
                    <span>{t.bankAndBranch}</span>
                    <span className="font-mono text-charcoal">
                      {appeal.nominee_snapshot.bank_name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-driftwood">
                    <span>{t.upiIdLabel}</span>
                    <span className="font-mono text-charcoal font-semibold">
                      {appeal.nominee_snapshot.upi_id}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-driftwood">{t.receivedAid} </span>
                      <span className="font-editorial text-lg font-bold text-charcoal">
                        {formatINR(appeal.collected_amount)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-driftwood">{t.targetGoal} </span>
                      <span className="font-mono text-xs font-semibold text-charcoal">
                        {formatINR(appeal.target_amount)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-canvas-inset rounded-full overflow-hidden p-0.5 border border-stone-border/70">
                    <div
                      className="h-full rounded-full bg-terracotta transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-driftwood font-mono">
                    <span>{t.progress} {percentage}%</span>
                    <span>{formatIndianNumber(Math.round(appeal.collected_amount / 50))} {t.membersContributed}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAppealForUpi(appeal)}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-xs shadow-warm transition-transform active:scale-[0.98] flex items-center justify-center gap-1.5 touch-target"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{t.send50Upi}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedAppealForSlip(appeal)}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl bg-canvas-inset hover:bg-white border border-stone-border text-charcoal font-semibold text-xs transition-colors flex items-center justify-center gap-1 touch-target"
                  >
                    <span>{t.uploadSlip}</span>
                  </button>

                  <Link
                    href={`/appeals/${appeal.id}`}
                    className="w-full sm:w-auto py-3 px-3 rounded-xl border border-stone-border text-driftwood hover:text-charcoal hover:bg-canvas-inset text-xs flex items-center justify-center touch-target"
                    title="View Case Details"
                  >
                    <span>{t.caseDetails}</span>
                  </Link>
                </div>
              </div>
            );
          })}
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
      {/* FINAL INVITATION CTA                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="rounded-3xl bg-charcoal text-white p-8 sm:p-14 text-center space-y-6 shadow-warm-lg">
          <div className="w-12 h-12 rounded-2xl bg-terracotta flex items-center justify-center mx-auto text-white">
            <HeartHandshake className="w-6 h-6" />
          </div>

          <h2 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight">
            {t.joinFamilyTitle}
          </h2>

          <p className="text-xs sm:text-base text-stone-muted max-w-xl mx-auto leading-relaxed font-light">
            {t.joinFamilyDesc}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-sm shadow-warm transition-all touch-target"
            >
              {t.registerBtn}
            </Link>

            <Link
              href="/appeals"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/20 touch-target"
            >
              {t.exploreAppealsBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* Modals */}
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
    </div>
  );
}
