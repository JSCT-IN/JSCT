'use client';

import React from 'react';
import Link from 'next/link';
import { Member, Appeal, DonationRecord, ComplianceData } from '@/types';
import { formatINR, formatDate } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import ComplianceMeter from '@/components/ComplianceMeter';
import { DashboardTab } from './MemberSidebar';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  HeartHandshake,
  QrCode,
  FileCheck2,
  ArrowRight,
  TrendingUp,
  CreditCard,
  UploadCloud,
  Upload,
  Share2,
  Sparkles,
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface OverviewTabProps {
  member: Member;
  compliance: ComplianceData;
  userDonations: DonationRecord[];
  allAppeals: Appeal[];
  onSelectTab: (tab: DashboardTab) => void;
  onOpenUpiModal: (appeal: Appeal) => void;
  onOpenSlipModal: (appeal: Appeal) => void;
}

export default function OverviewTab({
  member,
  compliance,
  userDonations,
  allAppeals,
  onSelectTab,
  onOpenUpiModal,
  onOpenSlipModal,
}: OverviewTabProps) {
  const { lang, t } = useTranslation();

  const totalContributed = userDonations
    .filter((d) => d.status === 'VERIFIED' || d.status === 'SUBMITTED')
    .reduce((sum, d) => sum + (d.amount || 50), 0);

  const contributedAppealIds = new Set(
    userDonations
      .filter((d) => d.status === 'VERIFIED' || d.status === 'SUBMITTED')
      .map((d) => d.appeal_id)
  );

  const pendingAppeals = allAppeals.filter(
    (a) => a.status === 'ACTIVE' && !contributedAppealIds.has(a.id)
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      
      {/* 1. Welcome Banner Matching Screenshot 1 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5B4699] via-[#6B52B0] to-[#7D64C5] text-white p-6 sm:p-8 shadow-warm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>जन से जन तक, सहयोग हर जरूरतमंद तक</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug">
              WELCOME TO JAN SEVA CHARITABLE TRUST (JSCT)
            </h2>
            
            <p className="text-xs sm:text-sm text-purple-100 font-medium leading-relaxed">
              प्रिय साथी <strong className="text-white">{member.full_name}</strong>, आपका स्वागत है। आपकी वर्तमान श्रेणी <strong className="text-amber-200">[{member.pool || 'Pool C'}]</strong> है। 75% अनुपालन बनाए रखें और संपूर्ण सुरक्षा का लाभ उठाएं।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onSelectTab('id-card')}
              className="px-4 py-2.5 rounded-xl bg-white text-purple-900 font-bold text-xs sm:text-sm shadow-md hover:bg-purple-50 active:scale-95 transition-all flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-purple-700" />
              <span>{lang === 'hi' ? 'पहचान पत्र देखें' : 'View ID Card'}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('referral-points')}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs sm:text-sm active:scale-95 transition-all flex items-center gap-2"
            >
              <Share2 className="w-4 h-4 text-amber-300" />
              <span>{lang === 'hi' ? 'रेफरल कमाई (₹5)' : 'Referrals'}</span>
            </button>
          </div>
        </div>

        {/* Decorative background cube / geometry like in screenshot */}
        <div className="absolute right-4 sm:right-8 -bottom-6 w-32 h-32 sm:w-48 sm:h-48 rounded-3xl bg-white/10 backdrop-blur-3xl transform rotate-12 pointer-events-none" />
      </div>

      {/* 2. Key KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: 75% Compliance */}
        <div className="bg-white rounded-2xl border border-stone-border/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-driftwood">
            <span className="font-bold uppercase tracking-wider">{lang === 'hi' ? 'अनुपालन दर' : 'Compliance'}</span>
            <div className={`p-1.5 rounded-lg ${compliance.is_eligible ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-3xl font-bold text-charcoal">{compliance.ratio}%</span>
            <span className="text-xs text-driftwood">/ 75% आवश्यक</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${compliance.is_eligible ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(100, compliance.ratio)}%` }}
            />
          </div>
          <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{compliance.is_eligible ? 'सुरक्षा कवच सक्रिय (Eligible)' : '75% से कम (सहयोग अपेक्षित)'}</span>
          </p>
        </div>

        {/* Card 2: Total Contributed */}
        <div className="bg-white rounded-2xl border border-stone-border/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-driftwood">
            <span className="font-bold uppercase tracking-wider">{lang === 'hi' ? 'कुल सहयोग दान' : 'Total Given'}</span>
            <div className="p-1.5 rounded-lg bg-terracotta/10 text-terracotta">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-3xl font-bold text-charcoal">{formatINR(totalContributed)}</span>
            <span className="text-xs text-driftwood">({userDonations.length} रसीदें)</span>
          </div>
          <p className="text-[11px] text-driftwood">
            सीधे पीड़ित परिवारों के अधिकृत बैंक खाते में अंतरित
          </p>
          <button
            type="button"
            onClick={() => onSelectTab('sahyog-list')}
            className="text-xs font-bold text-terracotta hover:text-terracotta-hover inline-flex items-center gap-1"
          >
            <span>सभी रसीदें देखें</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 3: Varshik Dan / Annual Status */}
        <div className="bg-white rounded-2xl border border-stone-border/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-driftwood">
            <span className="font-bold uppercase tracking-wider">{lang === 'hi' ? 'वार्षिक नवीनीकरण' : 'Annual Fee'}</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-2xl font-bold text-charcoal">
              {compliance.days_until_renewal} दिन शेष
            </span>
          </div>
          <p className="text-[11px] text-driftwood">
            वैधता: <span className="font-mono font-bold text-charcoal">{formatDate(member.fee_expires_at)}</span>
          </p>
          <button
            type="button"
            onClick={() => onSelectTab('upload-varshik-dan')}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
          >
            <span>वार्षिक शुल्क जमा करें (₹50)</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 4: Referral Balance */}
        <div className="bg-white rounded-2xl border border-stone-border/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-driftwood">
            <span className="font-bold uppercase tracking-wider">{lang === 'hi' ? 'रेफरल कमाई' : 'Referral Earn'}</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-3xl font-bold text-charcoal">
              ₹{member.referral_earnings || 0}
            </span>
            <span className="text-xs text-driftwood">({member.referral_count || 0} सदस्य)</span>
          </div>
          <p className="text-[11px] text-driftwood">
            कोड: <span className="font-mono font-bold text-purple-700">{member.referral_code || '4715480406'}</span>
          </p>
          <button
            type="button"
            onClick={() => onSelectTab('referral-points')}
            className="text-xs font-bold text-purple-700 hover:text-purple-800 inline-flex items-center gap-1"
          >
            <span>रेफरल डैशबोर्ड</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* 3. Urgent Active Appeals Requiring Immediate Support */}
      <div className="bg-white rounded-3xl border border-stone-border/80 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-border/70 pb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-charcoal">
              {lang === 'hi' ? 'सक्रिय सहयोग अपीलें (तत्काल अपेक्षित)' : 'Urgent Active Appeals'}
            </h3>
            <p className="text-xs text-driftwood">
              प्रत्येक अपील में सीधे नामिनी के खाते में ₹50 अंतरित कर रसीद अपलोड करना अनिवार्य है।
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('sahyog-list')}
            className="text-xs font-bold text-terracotta hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <span>सभी अपीलें देखें ({allAppeals.length})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {pendingAppeals.length === 0 ? (
          <div className="py-8 text-center text-xs text-emerald-700 font-semibold bg-emerald-50/50 rounded-2xl border border-emerald-200/60 p-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-emerald-900">बधाई! आपकी सभी सक्रिय अपीलों का सहयोग पूर्ण है।</p>
            <p className="text-emerald-700 text-xs mt-1">आप 100% अनुपालन बनाए हुए हैं और संपूर्ण सहायता के हकदार हैं।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingAppeals.map((appeal) => (
              <div
                key={appeal.id}
                className="rounded-2xl border border-terracotta/30 bg-terracotta-light/10 p-5 space-y-4 hover:border-terracotta transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-terracotta text-white">
                      {appeal.code}
                    </span>
                    <h4 className="text-sm font-bold text-charcoal leading-snug">
                      {appeal.title}
                    </h4>
                    <p className="text-xs text-driftwood">
                      नामिनी: <strong className="text-charcoal">{appeal.nominee_snapshot.full_name}</strong> • {appeal.nominee_snapshot.bank_name}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                    लंबित (Pending)
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenUpiModal(appeal)}
                    className="flex-1 py-2 px-3 rounded-xl bg-terracotta text-white text-xs font-bold hover:bg-terracotta-hover active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-warm"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Scan & Pay (₹50)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenSlipModal(appeal)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white border border-stone-border text-charcoal text-xs font-bold hover:bg-canvas transition-all flex items-center justify-center gap-1.5"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-sage" />
                    <span>रसीद अपलोड करें</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Quick Action Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => onSelectTab('id-card')}
          className="p-4 rounded-2xl bg-white border border-stone-border/80 hover:border-terracotta text-left transition-all group shadow-xs"
        >
          <CreditCard className="w-6 h-6 text-terracotta mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-bold text-charcoal">{lang === 'hi' ? 'डिजिटल पहचान पत्र' : 'ID Card'}</div>
          <div className="text-[11px] text-driftwood">डाउनलोड / प्रिंट करें</div>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('upload-death-receipt')}
          className="p-4 rounded-2xl bg-white border border-stone-border/80 hover:border-terracotta text-left transition-all group shadow-xs"
        >
          <UploadCloud className="w-6 h-6 text-rose-600 mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-bold text-charcoal">{lang === 'hi' ? 'मृत्यु सहयोग रसीद' : 'Death Sahyog'}</div>
          <div className="text-[11px] text-driftwood">₹50 अंशदान दर्ज करें</div>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('upload-varshik-dan')}
          className="p-4 rounded-2xl bg-white border border-stone-border/80 hover:border-terracotta text-left transition-all group shadow-xs"
        >
          <Upload className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-bold text-charcoal">{lang === 'hi' ? 'वार्षिक नवीनीकरण' : 'Renewal Fee'}</div>
          <div className="text-[11px] text-driftwood">₹50 व्यवस्था शुल्क</div>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('referral-points')}
          className="p-4 rounded-2xl bg-white border border-stone-border/80 hover:border-terracotta text-left transition-all group shadow-xs"
        >
          <Share2 className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-bold text-charcoal">{lang === 'hi' ? 'रेफरल लिंक' : 'Referral Code'}</div>
          <div className="text-[11px] text-driftwood">₹5 प्रति सदस्य कमाएं</div>
        </button>
      </div>

    </div>
  );
}
