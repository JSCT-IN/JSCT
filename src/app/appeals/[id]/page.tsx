'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { DPSWTStore } from '@/lib/store';
import { Appeal, DonationRecord } from '@/types';
import { formatINR, formatIndianNumber, formatDate, generateUpiLink, generateUpiQrCode } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import SlipUploadModal from '@/components/SlipUploadModal';
import {
  HeartHandshake,
  ShieldCheck,
  FileCheck2,
  Copy,
  Check,
  UserCheck,
  Calendar,
  ArrowLeft,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface AppealDetailPageProps {
  params: Promise<{ id: string }>;
}

import { supabase } from '@/lib/supabase/client';

export default function AppealDetailPage({ params }: AppealDetailPageProps) {
  const resolvedParams = use(params);
  const appealId = resolvedParams.id;
  const { lang, t } = useTranslation();

  const [appeal, setAppeal] = useState<Appeal | null>(null);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // Query from Supabase
        const { data: dbAppeal } = await supabase
          .from('appeals')
          .select('*')
          .or(`id.eq.${appealId},code.ilike.${appealId}`)
          .single();

        let currentAppeal = dbAppeal as Appeal | null;
        if (!currentAppeal) {
          currentAppeal = DPSWTStore.getAppealById(appealId) || null;
        }

        if (currentAppeal) {
          setAppeal(currentAppeal);

          // Load donations for this appeal
          const { data: dbDonations } = await supabase
            .from('donation_records')
            .select('*')
            .eq('appeal_id', currentAppeal.id)
            .order('created_at', { ascending: false });

          if (dbDonations && dbDonations.length > 0) {
            setDonations(dbDonations as DonationRecord[]);
          } else {
            setDonations(DPSWTStore.getDonationsByAppeal(currentAppeal.id));
          }

          const upiLink = generateUpiLink({
            upiId: currentAppeal.nominee_snapshot.upi_id,
            nomineeName: currentAppeal.nominee_snapshot.full_name,
            amount: 50,
            note: `DPSWT ${currentAppeal.code}`,
          });
          generateUpiQrCode(upiLink).then((url) => setQrCodeUrl(url));
        }
      } catch {
        const foundAppeal = DPSWTStore.getAppealById(appealId);
        if (foundAppeal) {
          setAppeal(foundAppeal);
          setDonations(DPSWTStore.getDonationsByAppeal(foundAppeal.id));
        }
      }
    }

    loadData();
    window.addEventListener('dpswt_state_change', loadData);
    return () => window.removeEventListener('dpswt_state_change', loadData);
  }, [appealId]);

  if (!appeal) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <HeartHandshake className="w-12 h-12 text-driftwood mx-auto" />
        <h2 className="font-editorial text-2xl font-bold text-charcoal">
          {lang === 'hi' ? 'अपील विवरण लोड हो रहा है या उपलब्ध नहीं है' : 'Appeal details loading or not found'}
        </h2>
        <Link
          href="/appeals"
          className="inline-flex items-center gap-2 text-xs font-semibold text-terracotta hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToAppeals}</span>
        </Link>
      </div>
    );
  }

  const nominee = appeal.nominee_snapshot;
  const isBereavement = appeal.type === 'BEREAVEMENT';
  const isClosed = appeal.status === 'CLOSED';
  const percentage = Math.min(
    100,
    Math.round((appeal.collected_amount / appeal.target_amount) * 100)
  );

  const upiDeepLink = generateUpiLink({
    upiId: nominee.upi_id,
    nomineeName: nominee.full_name,
    amount: 50,
    note: `DPSWT ${appeal.code}`,
  });

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back Button */}
      <div>
        <Link
          href="/appeals"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-driftwood hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToAppeals}</span>
        </Link>
      </div>

      {/* Main Grid: Left Column Details & Right Column Bank/UPI Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Card */}
          <div className="rounded-3xl bg-white border border-stone-border p-6 sm:p-8 shadow-warm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    isBereavement
                      ? 'bg-terracotta-light text-terracotta'
                      : 'bg-sage-light text-sage'
                  }`}
                >
                  {isBereavement ? t.bereavementTitle : t.marriageTitle}
                </span>
                <span className="text-xs font-mono font-bold text-charcoal px-2.5 py-1 rounded bg-canvas-inset border border-stone-border">
                  {appeal.code}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-driftwood">
                <Calendar className="w-4 h-4" />
                <span>{lang === 'hi' ? 'घटना दिनांक:' : 'Event Date:'} {formatDate(appeal.event_date)}</span>
              </div>
            </div>

            <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-charcoal leading-tight">
              {appeal.title}
            </h1>

            {/* Target vs Collected Progress Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-canvas-inset border border-stone-border space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <span className="text-xs text-driftwood">{t.receivedAid} </span>
                  <span className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal block sm:inline">
                    {formatINR(appeal.collected_amount)}
                  </span>
                </div>
                <div className="sm:text-right">
                  <span className="text-xs text-driftwood">{t.targetGoal} </span>
                  <span className="font-mono text-sm sm:text-base font-semibold text-charcoal">
                    {formatINR(appeal.target_amount)}
                  </span>
                </div>
              </div>

              <div className="w-full h-3 bg-white rounded-full overflow-hidden p-0.5 border border-stone-border">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isClosed ? 'bg-sage' : 'bg-terracotta'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-driftwood font-mono">
                <span className="font-bold text-charcoal">{percentage}% {lang === 'hi' ? 'पूर्ण' : 'Reached'}</span>
                <span>
                  {formatIndianNumber(Math.round(appeal.collected_amount / 50))} {t.membersContributed}
                </span>
              </div>
            </div>

            {/* Case Background & Story */}
            <div className="space-y-3 pt-2">
              <h2 className="font-editorial text-xl font-bold text-charcoal">
                {t.caseBackground}
              </h2>
              <p className="text-xs sm:text-sm text-driftwood leading-relaxed whitespace-pre-line">
                {appeal.description}
              </p>
            </div>
          </div>

          {/* District Inspector Physical Verification Section */}
          <div className="rounded-3xl bg-white border border-stone-border p-6 sm:p-7 shadow-warm space-y-4">
            <div className="flex items-center gap-2 text-sage">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="font-editorial text-xl font-bold text-charcoal">
                {t.inspectorSignedReport}
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-sage-light/60 border border-sage/20 text-xs text-charcoal space-y-2">
              <div className="font-semibold text-sage flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                <span>{t.inspectorOfficial} {appeal.inspector_name}</span>
              </div>
              <p className="text-xs text-driftwood leading-relaxed">
                {appeal.inspector_notes || (lang === 'hi' ? 'मृत्यु प्रमाण पत्र, सेवा विवरण एवं नामिनी बैंक पासबुक का भौतिक मिलान पूर्ण। खाता सक्रिय है।' : 'Physical verification of certificates, service record and nominee passbook completed. Account verified active.')}
              </p>
              <div className="text-[11px] text-driftwood font-mono pt-1">
                {lang === 'hi' ? 'संपर्क दूरभाष:' : 'Helpline Phone:'} {appeal.inspector_phone}
              </div>
            </div>
          </div>

          {/* Live Contributors Audit Log */}
          <div className="rounded-3xl bg-white border border-stone-border p-6 sm:p-7 shadow-warm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-editorial text-xl font-bold text-charcoal">
                  {t.liveAuditLog}
                </h2>
                <p className="text-xs text-driftwood mt-0.5">
                  {lang === 'hi' ? 'इस अपील में प्राप्त हालिया ₹50 सहयोग प्रविष्टियां एवं उनकी सत्यापन स्थिति' : 'Recent ₹50 contributions and inspector verification audit status'}
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-canvas-inset border border-stone-border text-charcoal font-semibold">
                {donations.length} {lang === 'hi' ? 'रिकॉर्ड' : 'Records'}
              </span>
            </div>

            {donations.length === 0 ? (
              <div className="text-center py-8 text-xs text-driftwood bg-canvas-inset rounded-2xl border border-stone-border">
                {lang === 'hi' ? 'अभी तक इस अपील में कोई UTR रिकॉर्ड दर्ज नहीं हुआ है। पहले सहयोगी बनें!' : 'No UTR records registered yet for this appeal. Be the first contributor!'}
              </div>
            ) : (
              <div>
                {/* Mobile Cards View (< sm) */}
                <div className="block sm:hidden divide-y divide-stone-border/70 border border-stone-border rounded-2xl overflow-hidden bg-white">
                  {donations.map((d) => (
                    <div key={d.id} className="p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-charcoal">{d.donor_name || (lang === 'hi' ? 'सदस्य' : 'Member')}</span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.status === 'VERIFIED'
                              ? 'bg-sage-light text-sage'
                              : d.status === 'REJECTED'
                              ? 'bg-terracotta-light text-terracotta'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {d.status === 'VERIFIED' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{lang === 'hi' ? 'सत्यापित' : 'Verified'}</span>
                            </>
                          ) : d.status === 'REJECTED' ? (
                            <>
                              <AlertTriangle className="w-3 h-3" />
                              <span>{lang === 'hi' ? 'अस्वीकृत' : 'Rejected'}</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>{lang === 'hi' ? 'निरीक्षणाधीन' : 'Pending Audit'}</span>
                            </>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-driftwood">UTR: <strong className="text-charcoal">{d.utr_number}</strong></span>
                        <span className="font-editorial font-bold text-charcoal">₹{d.amount}</span>
                      </div>
                      <div className="text-[10px] text-driftwood font-mono">
                        {formatDate(d.created_at)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop/Tablet Table (>= sm) */}
                <div className="hidden sm:block overflow-x-auto border border-stone-border rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-border text-driftwood font-mono bg-canvas-inset">
                        <th className="py-2.5 px-3">{t.donorCol}</th>
                        <th className="py-2.5 px-3">{t.utrCol}</th>
                        <th className="py-2.5 px-3">{t.amountCol}</th>
                        <th className="py-2.5 px-3">{t.statusCol}</th>
                        <th className="py-2.5 px-3">{t.dateCol}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-border/60">
                      {donations.map((d) => (
                        <tr key={d.id} className="hover:bg-canvas-inset/50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-semibold text-charcoal">{d.donor_name || (lang === 'hi' ? 'सदस्य' : 'Member')}</div>
                            <div className="text-[10px] text-driftwood font-mono">{d.donor_membership_id}</div>
                          </td>
                          <td className="py-3 px-3 font-mono font-medium text-charcoal">
                            {d.utr_number}
                          </td>
                          <td className="py-3 px-3 font-editorial font-bold text-charcoal">
                            ₹{d.amount}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                d.status === 'VERIFIED'
                                  ? 'bg-sage-light text-sage'
                                  : d.status === 'REJECTED'
                                  ? 'bg-terracotta-light text-terracotta'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {d.status === 'VERIFIED' ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{lang === 'hi' ? 'सत्यापित' : 'Verified'}</span>
                                </>
                              ) : d.status === 'REJECTED' ? (
                                <>
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>{lang === 'hi' ? 'अस्वीकृत' : 'Rejected'}</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3" />
                                  <span>{lang === 'hi' ? 'निरीक्षणाधीन' : 'Pending Audit'}</span>
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-driftwood font-mono text-[11px]">
                            {formatDate(d.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Direct Bank Transfer Card & UPI Actions (1 Col on lg) */}
        <div className="space-y-6">
          
          {/* Nominee Bank Card */}
          <div className="rounded-3xl bg-white border border-stone-border p-6 shadow-warm space-y-6 lg:sticky lg:top-24">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sage animate-pulse" />
                <span className="text-xs font-semibold text-sage uppercase tracking-wider">
                  Zero-Custody P2P
                </span>
              </div>
              <h2 className="font-editorial text-2xl font-bold text-charcoal">
                {t.nomineeAccountTitle}
              </h2>
              <p className="text-xs text-driftwood mt-1">
                {t.nomineeAccountDesc}
              </p>
            </div>

            {/* Mobile UPI One-Tap Launch Button */}
            <div>
              <a
                href={upiDeepLink}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-sm shadow-warm transition-transform active:scale-[0.98] touch-target"
              >
                <Smartphone className="w-4 h-4" />
                <span>{t.openUpiApp}</span>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>
              <p className="text-center text-[10px] text-driftwood mt-1.5">
                (PhonePe / Google Pay / Paytm / BHIM)
              </p>
            </div>

            {/* Dynamic QR Code */}
            <div className="p-4 bg-canvas-inset rounded-2xl border border-stone-border flex flex-col items-center justify-center text-center">
              {qrCodeUrl ? (
                <div className="p-2.5 bg-white rounded-xl shadow-warm border border-stone-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeUrl}
                    alt="Scan UPI QR Code"
                    className="w-44 h-44 object-contain"
                  />
                </div>
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-xs text-driftwood">
                  Generating QR code...
                </div>
              )}
              <span className="text-[11px] text-driftwood font-medium mt-2">
                {t.scanQrCodeDesc}
              </span>
            </div>

            {/* Direct Bank Account Credentials with One-Click Copy */}
            <div className="space-y-3 text-xs bg-canvas-inset p-4 rounded-2xl border border-stone-border">
              
              <div className="flex items-center justify-between pb-2 border-b border-stone-border/70">
                <span className="text-driftwood">{t.nomineeNameLabel}</span>
                <span className="font-bold text-charcoal">{nominee.full_name}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-stone-border/70">
                <span className="text-driftwood">{t.bankNameLabel}</span>
                <span className="font-semibold text-charcoal">{nominee.bank_name}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-stone-border/70">
                <span className="text-driftwood">{t.accountNumberLabel}</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-charcoal">
                  <span>{nominee.account_number}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(nominee.account_number, 'acc')}
                    className="p-1 hover:text-terracotta"
                    title={t.copyText}
                  >
                    {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-sage" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-stone-border/70">
                <span className="text-driftwood">{t.ifscLabel}</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-charcoal">
                  <span>{nominee.ifsc_code}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(nominee.ifsc_code, 'ifsc')}
                    className="p-1 hover:text-terracotta"
                    title={t.copyText}
                  >
                    {copiedField === 'ifsc' ? <Check className="w-3.5 h-3.5 text-sage" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-driftwood">{t.upiIdLabel}</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-charcoal">
                  <span>{nominee.upi_id}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(nominee.upi_id, 'upi')}
                    className="p-1 hover:text-terracotta"
                    title={t.copyText}
                  >
                    {copiedField === 'upi' ? <Check className="w-3.5 h-3.5 text-sage" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

            </div>

            {/* Upload Slip Trigger */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsSlipModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-canvas-inset hover:bg-white border border-stone-border font-semibold text-xs text-charcoal shadow-warm transition-all flex items-center justify-center gap-2 touch-target"
              >
                <FileCheck2 className="w-4 h-4 text-terracotta" />
                <span>{t.submitSlipButton}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Slip Modal */}
      {isSlipModalOpen && (
        <SlipUploadModal
          appeal={appeal}
          isOpen={true}
          onClose={() => setIsSlipModalOpen(false)}
          onSuccess={() => setIsSlipModalOpen(false)}
        />
      )}
    </div>
  );
}
