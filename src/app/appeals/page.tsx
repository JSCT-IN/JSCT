'use client';

export const dynamic = 'force-dynamic';

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
  Search,
  QrCode,
  FileCheck2,
  UserCheck,
  PlusCircle,
} from 'lucide-react';

import { supabase } from '@/lib/supabase/client';

export default function AppealsPage() {
  const { lang, t } = useTranslation();
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedAppealForUpi, setSelectedAppealForUpi] = useState<Appeal | null>(null);
  const [selectedAppealForSlip, setSelectedAppealForSlip] = useState<Appeal | null>(null);

  useEffect(() => {
    async function loadAppeals() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('appeals')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setAppeals(data as Appeal[]);
        } else {
          setAppeals(DPSWTStore.getAppeals());
        }
      } catch {
        setAppeals(DPSWTStore.getAppeals());
      } finally {
        setIsLoading(false);
      }
    }

    loadAppeals();

    window.addEventListener('dpswt_state_change', loadAppeals);
    return () => window.removeEventListener('dpswt_state_change', loadAppeals);
  }, []);

  // Filter appeals based on user controls
  const filteredAppeals = appeals.filter((appeal) => {
    if (selectedType !== 'ALL' && appeal.type !== selectedType) {
      return false;
    }
    if (selectedStatus !== 'ALL' && appeal.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchCode = appeal.code.toLowerCase().includes(q);
      const matchTitle = appeal.title.toLowerCase().includes(q);
      const matchDesc = appeal.description.toLowerCase().includes(q);
      const matchNominee = appeal.nominee_snapshot.full_name.toLowerCase().includes(q);
      const matchInspector = appeal.inspector_name.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchDesc && !matchNominee && !matchInspector) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-border/70 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-terracotta">
              {t.appealsPill}
            </span>
            <span className="text-xs text-driftwood">•</span>
            <span className="text-xs text-sage font-medium">{t.zeroCustodySub}</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-charcoal">
            {t.appealsHeader}
          </h1>
          <p className="text-xs sm:text-sm text-driftwood mt-1">
            {t.appealsSub}
          </p>
        </div>

        <Link
          href="/appeals/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-charcoal hover:bg-charcoal-deep text-white font-semibold text-xs shadow-warm transition-all touch-target"
        >
          <PlusCircle className="w-4 h-4 text-terracotta" />
          <span>{t.newAppealCta}</span>
        </Link>
      </div>

      {/* Summary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-stone-border shadow-xs">
          <div className="text-[11px] text-driftwood font-medium">{t.activeOnly}</div>
          <div className="font-editorial text-xl font-bold text-charcoal mt-0.5">
            {appeals.filter((a) => a.status === 'ACTIVE').length} {lang === 'hi' ? 'परिवार' : 'Cases'}
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-stone-border shadow-xs">
          <div className="text-[11px] text-driftwood font-medium">{lang === 'hi' ? 'आवश्यक अंशदान' : 'Required Micro-Aid'}</div>
          <div className="font-editorial text-xl font-bold text-terracotta mt-0.5">
            {lang === 'hi' ? '₹50 प्रति सदस्य' : '₹50 per Member'}
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-stone-border shadow-xs">
          <div className="text-[11px] text-driftwood font-medium">{lang === 'hi' ? 'हस्तांतरण मॉडल' : 'Transfer Model'}</div>
          <div className="font-editorial text-xl font-bold text-sage mt-0.5">
            Zero-Custody P2P
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-stone-border shadow-xs">
          <div className="text-[11px] text-driftwood font-medium">{lang === 'hi' ? 'पात्रता मानक' : 'Eligibility Threshold'}</div>
          <div className="font-editorial text-xl font-bold text-charcoal mt-0.5">
            ≥ 75% {lang === 'hi' ? 'अनुपालन' : 'Compliance'}
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-border shadow-warm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-driftwood absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300/80 bg-canvas-inset/40 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedType('ALL')}
              className={`px-3 py-2 rounded-xl transition-all ${
                selectedType === 'ALL'
                  ? 'bg-charcoal text-white font-bold shadow-xs'
                  : 'bg-canvas-inset text-driftwood hover:text-charcoal'
              }`}
            >
              {t.allTypes}
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('BEREAVEMENT')}
              className={`px-3 py-2 rounded-xl transition-all ${
                selectedType === 'BEREAVEMENT'
                  ? 'bg-terracotta text-white font-bold shadow-xs'
                  : 'bg-canvas-inset text-driftwood hover:text-charcoal'
              }`}
            >
              {t.bereavementType}
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('DAUGHTER_MARRIAGE')}
              className={`px-3 py-2 rounded-xl transition-all ${
                selectedType === 'DAUGHTER_MARRIAGE'
                  ? 'bg-sage text-white font-bold shadow-xs'
                  : 'bg-canvas-inset text-driftwood hover:text-charcoal'
              }`}
            >
              {t.marriageType}
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedStatus('ACTIVE')}
              className={`px-3 py-2 rounded-xl transition-all ${
                selectedStatus === 'ACTIVE'
                  ? 'bg-sage text-white font-bold shadow-xs'
                  : 'bg-canvas-inset text-driftwood hover:text-charcoal'
              }`}
            >
              {t.activeOnly}
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('CLOSED')}
              className={`px-3 py-2 rounded-xl transition-all ${
                selectedStatus === 'CLOSED'
                  ? 'bg-charcoal text-white font-bold shadow-xs'
                  : 'bg-canvas-inset text-driftwood hover:text-charcoal'
              }`}
            >
              {t.closedOnly}
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('ALL')}
              className={`px-3 py-2 rounded-xl transition-all ${
                selectedStatus === 'ALL'
                  ? 'bg-charcoal text-white font-bold shadow-xs'
                  : 'bg-canvas-inset text-driftwood hover:text-charcoal'
              }`}
            >
              {t.allStatuses}
            </button>
          </div>

        </div>
      </div>

      {/* Appeals Grid */}
      {filteredAppeals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-border p-8">
          <HeartHandshake className="w-12 h-12 text-driftwood/50 mx-auto mb-3" />
          <h3 className="font-editorial text-xl font-bold text-charcoal">
            {lang === 'hi' ? 'कोई अपील नहीं मिली' : 'No Appeals Found'}
          </h3>
          <p className="text-xs text-driftwood mt-1 max-w-sm mx-auto">
            {t.noAppealsFound}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedType('ALL');
              setSelectedStatus('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-canvas-inset hover:bg-canvas-card border border-stone-border text-xs text-charcoal font-semibold"
          >
            {lang === 'hi' ? 'सभी फिल्टर हटाएं' : 'Reset All Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAppeals.map((appeal) => {
            const percentage = Math.min(
              100,
              Math.round((appeal.collected_amount / appeal.target_amount) * 100)
            );
            const isBereavement = appeal.type === 'BEREAVEMENT';
            const isClosed = appeal.status === 'CLOSED';

            return (
              <div
                key={appeal.id}
                className="rounded-3xl bg-white border border-stone-border p-6 sm:p-7 shadow-warm flex flex-col justify-between space-y-5 hover:border-terracotta/40 hover:-translate-y-0.5 hover:shadow-warm-md transition-all group"
              >
                <div>
                  {/* Category Header */}
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

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-charcoal px-2 py-0.5 rounded bg-canvas-inset border border-stone-border">
                        {appeal.code}
                      </span>
                      {isClosed && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-charcoal text-white">
                          {t.closedOnly}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h2 className="font-editorial text-xl font-bold text-charcoal leading-snug group-hover:text-terracotta transition-colors">
                    <Link href={`/appeals/${appeal.id}`}>{appeal.title}</Link>
                  </h2>

                  <p className="text-xs text-driftwood line-clamp-3 mt-2 leading-relaxed">
                    {appeal.description}
                  </p>
                </div>

                {/* Nominee Box */}
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

                {/* Inspector Signature Chip */}
                <div className="flex items-center gap-1.5 text-[11px] text-sage font-medium bg-sage-light px-3 py-1.5 rounded-xl border border-sage/20">
                  <UserCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{lang === 'hi' ? 'सत्यापित द्वारा:' : 'Verified By:'} {appeal.inspector_name}</span>
                </div>

                {/* Progress Bar & Amount Metrics */}
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-driftwood">{t.receivedAid} </span>
                      <span className="font-editorial text-xl font-bold text-charcoal">
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
                      className={`h-full rounded-full transition-all duration-700 ${
                        isClosed ? 'bg-sage' : 'bg-terracotta'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-driftwood font-mono">
                    <span>{t.progress} {percentage}%</span>
                    <span>
                      {formatIndianNumber(Math.round(appeal.collected_amount / 50))} {t.membersContributed}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  {!isClosed ? (
                    <>
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
                        <FileCheck2 className="w-4 h-4 text-driftwood" />
                        <span>{t.uploadSlip}</span>
                      </button>
                    </>
                  ) : (
                    <div className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-canvas-inset text-driftwood text-center text-xs font-medium border border-stone-border">
                      {t.closedNotice}
                    </div>
                  )}

                  <Link
                    href={`/appeals/${appeal.id}`}
                    className="w-full sm:w-auto py-3 px-3 rounded-xl border border-stone-border text-driftwood hover:text-charcoal hover:bg-canvas-inset text-xs flex items-center justify-center touch-target"
                  >
                    <span>{t.caseDetails}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
