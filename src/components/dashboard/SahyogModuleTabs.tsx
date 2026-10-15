'use client';

import React, { useState } from 'react';
import { Member, Appeal, DonationRecord } from '@/types';
import { submitDonationAction } from '@/actions/donation-actions';
import { DPSWTStore } from '@/lib/store';
import {
  UploadCloud,
  Layers,
  HeartHandshake,
  ListFilter,
  QrCode,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Eye,
  Calendar,
  Building,
  Loader2,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import { formatDate, formatINR } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

// ============================================================================
// 1. UPLOAD RECEIPT TAB (Handles Death or Beti Vivah based on schemeType)
// ============================================================================
interface UploadReceiptViewProps {
  member: Member;
  appeals: Appeal[];
  schemeType: 'BEREAVEMENT' | 'DAUGHTER_MARRIAGE';
  onSuccess: () => void;
}

export function UploadReceiptView({
  member,
  appeals,
  schemeType,
  onSuccess,
}: UploadReceiptViewProps) {
  const { lang } = useTranslation();

  const isDeath = schemeType === 'BEREAVEMENT';
  const schemeTitle = isDeath ? 'मृत्यु सहयोग रसीद अपलोड (Death Receipt)' : 'बेटी विवाह सहयोग रसीद अपलोड (Beti Vivah)';
  const filteredAppeals = appeals.filter((a) => a.type === schemeType);
  const [selectedAppealId, setSelectedAppealId] = useState<string>(
    filteredAppeals[0]?.id || ''
  );

  const selectedAppeal = filteredAppeals.find((a) => a.id === selectedAppealId) || filteredAppeals[0];

  const [amount, setAmount] = useState('50');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [utrNumber, setUtrNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const nominee = selectedAppeal?.nominee_snapshot;
  const upiId = nominee?.upi_id || 'jsct.trust@sbi';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        alert('फ़ाइल का आकार 5MB से कम होना चाहिए।');
        return;
      }
      setFile(selected);
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!selectedAppeal) {
      setFeedback({ success: false, message: 'कोई सक्रिय सहयोग अपील उपलब्ध नहीं है।' });
      return;
    }

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length < 8) {
      setFeedback({
        success: false,
        message: 'कृपया वैध बैंक Transaction ID / 12-अंकीय UTR क्रमांक दर्ज करें।',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('appeal_id', selectedAppeal.id);
      formData.append('donor_id', member.id);
      formData.append('utr_number', cleanUtr);
      formData.append('amount', amount);
      if (file) formData.append('slip_file', file);

      await submitDonationAction(formData);

      // Record in local store
      DPSWTStore.submitDonation({
        appeal_id: selectedAppeal.id,
        utr_number: cleanUtr,
        slip_url: filePreview || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        amount: parseFloat(amount) || 50,
      });

      setFeedback({
        success: true,
        message: 'सहयोग रसीद सफलतापूर्वक दर्ज कर ली गई है! आपका अनुपालन स्कोर अपडेट हो गया है।',
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setFeedback({
        success: false,
        message: err.message || 'रसीद दर्ज करने में समस्या आई।',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      
      <div className="border-b border-stone-border/80 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-charcoal tracking-tight font-editorial">
          {schemeTitle}
        </h2>
        <p className="text-xs text-driftwood mt-1">
          सीधे लाभार्थी/नामिनी के बैंक खाते में ₹50 का अंशदान अंतरित करें और बैंक रसीद यहाँ अपलोड करें।
        </p>
      </div>

      {filteredAppeals.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-stone-border text-driftwood">
          वर्तमान में इस योजना के अंतर्गत कोई सक्रिय अपील उपलब्ध नहीं है।
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-border/80 shadow-warm p-6 sm:p-8 space-y-8">
          
          {/* Select Appeal dropdown if multiple */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-charcoal">
              सक्रिय अपील का चयन करें (Select Active Appeal)
            </label>
            <select
              value={selectedAppealId}
              onChange={(e) => setSelectedAppealId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm font-semibold text-charcoal bg-white focus:ring-2 focus:ring-terracotta/30"
            >
              {filteredAppeals.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.code}] {a.title} ({formatINR(a.collected_amount)} / {formatINR(a.target_amount)})
                </option>
              ))}
            </select>
          </div>

          {/* Nominee Direct QR and Bank Details */}
          {nominee && (
            <div className="rounded-2xl border-2 border-dashed border-stone-border p-6 flex flex-col items-center text-center space-y-4 bg-canvas-inset/30">
              <span className="text-sm font-black uppercase tracking-wider text-charcoal">
                SCAN & PAY TO BENEFICIARY
              </span>

              <div className="p-3 bg-white rounded-2xl shadow-md border border-stone-border/80">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=upi://pay?pa=${upiId}%26pn=${encodeURIComponent(nominee.full_name)}%26am=50%26cu=INR`}
                  alt="Nominee QR"
                  className="w-36 h-36 object-contain mx-auto"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs font-mono font-bold text-charcoal">
                    UPI: {upiId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-1 rounded-md hover:bg-white text-driftwood hover:text-charcoal transition-colors"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-driftwood">
                  नामिनी: <strong className="text-charcoal">{nominee.full_name}</strong> • {nominee.bank_name} • A/C: <span className="font-mono">{nominee.account_number}</span> • IFSC: <span className="font-mono">{nominee.ifsc_code}</span>
                </p>
              </div>
            </div>
          )}

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="border-t border-stone-border/80 pt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal flex items-center gap-1">
                  <span>रसीद स्क्रीनशॉट (Payment Slip)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="border border-stone-border rounded-xl p-2 bg-white">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="w-full text-xs text-driftwood file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-charcoal hover:file:bg-stone-200 cursor-pointer"
                  />
                </div>
                {filePreview && (
                  <div className="mt-2 w-20 h-20 rounded-xl border border-stone-border overflow-hidden">
                    <img src={filePreview} alt="Receipt" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal">सहयोग राशि (Amount in ₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm font-mono font-bold text-charcoal bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal">अंतरण दिनांक (Date)</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm font-mono text-charcoal bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal flex items-center gap-1">
                  <span>बैंक Transaction ID / UTR</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="12-अंकीय बैंक UTR क्रमांक दर्ज करें"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  maxLength={24}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm font-mono text-charcoal bg-white"
                />
              </div>

            </div>

            {feedback && (
              <div
                className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium ${
                  feedback.success
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border border-rose-300'
                }`}
              >
                {feedback.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3 px-8 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-sm font-bold shadow-warm active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>रसीद दर्ज हो रही है...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>सहयोग रसीद जमा करें (Submit Slip)</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      )}

    </div>
  );
}

// ============================================================================
// 2. VIEW ALL SAHYOG LIST TAB (Handles Death or Beti Vivah table/cards)
// ============================================================================
interface SahyogListViewProps {
  member: Member;
  appeals: Appeal[];
  userDonations: DonationRecord[];
  schemeType: 'BEREAVEMENT' | 'DAUGHTER_MARRIAGE';
  onPayAppeal: (appeal: Appeal) => void;
  onUploadAppealSlip: (appeal: Appeal) => void;
}

export function SahyogListView({
  member,
  appeals,
  userDonations,
  schemeType,
  onPayAppeal,
  onUploadAppealSlip,
}: SahyogListViewProps) {
  const { lang } = useTranslation();

  const isDeath = schemeType === 'BEREAVEMENT';
  const title = isDeath ? 'सभी मृत्यु सहयोग अपीलें एवं स्थिति (Sahyog List)' : 'सभी बेटी विवाह सहयोग सूची (Beti Vivah List)';
  const filteredAppeals = appeals.filter((a) => a.type === schemeType);

  const [filter, setFilter] = useState<'ALL' | 'CONTRIBUTED' | 'PENDING'>('ALL');
  const [search, setSearch] = useState('');
  const [viewSlipUrl, setViewSlipUrl] = useState<string | null>(null);

  const userDonationMap = new Map<string, DonationRecord>();
  userDonations.forEach((d) => userDonationMap.set(d.appeal_id, d));

  const displayList = filteredAppeals.filter((a) => {
    const isContributed = userDonationMap.has(a.id);
    if (filter === 'CONTRIBUTED' && !isContributed) return false;
    if (filter === 'PENDING' && isContributed) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        (a.nominee_snapshot?.full_name || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-border/80 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-charcoal tracking-tight font-editorial">
            {title}
          </h2>
          <p className="text-xs text-driftwood mt-0.5">
            पारदर्शी P2P सहयोग रिकॉर्ड • कुल अपीलें: {filteredAppeals.length}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-canvas-inset border border-stone-border text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === 'ALL' ? 'bg-white text-charcoal shadow-xs' : 'text-driftwood hover:text-charcoal'
            }`}
          >
            सभी ({filteredAppeals.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('CONTRIBUTED')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === 'CONTRIBUTED' ? 'bg-white text-emerald-800 shadow-xs' : 'text-driftwood hover:text-charcoal'
            }`}
          >
            सहयोग पूर्ण
          </button>
          <button
            type="button"
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === 'PENDING' ? 'bg-white text-rose-800 shadow-xs' : 'text-driftwood hover:text-charcoal'
            }`}
          >
            लंबित
          </button>
        </div>
      </div>

      {/* Appeals List Cards */}
      <div className="space-y-4">
        {displayList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-border p-12 text-center text-xs text-driftwood">
            इस फ़िल्टर में कोई अपील रिकॉर्ड नहीं मिला।
          </div>
        ) : (
          displayList.map((appeal) => {
            const donation = userDonationMap.get(appeal.id);
            const isContributed = Boolean(donation);

            return (
              <div
                key={appeal.id}
                className="bg-white rounded-3xl border border-stone-border/80 shadow-warm p-5 sm:p-6 space-y-4 hover:border-terracotta/40 transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-terracotta text-white">
                        {appeal.code}
                      </span>
                      <span className="text-xs text-driftwood">
                        घटना दिनांक: {formatDate(appeal.event_date)}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-charcoal leading-snug">
                      {appeal.title}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    {isContributed ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>सहयोग सत्यापित (₹{donation?.amount || 50})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>सहयोग लंबित (Pending)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Nominee & Target Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-canvas-inset/60 text-xs text-charcoal">
                  <div>
                    <span className="text-driftwood block text-[10px] uppercase font-bold">नामिनी / लाभार्थी</span>
                    <span className="font-bold text-charcoal">{appeal.nominee_snapshot.full_name}</span>
                    <span className="text-driftwood block text-[11px]">{appeal.nominee_snapshot.bank_name}</span>
                  </div>

                  <div>
                    <span className="text-driftwood block text-[10px] uppercase font-bold">लक्ष्य व संग्रह</span>
                    <span className="font-mono font-bold text-charcoal">
                      {formatINR(appeal.collected_amount)} / {formatINR(appeal.target_amount)}
                    </span>
                    <div className="w-full bg-stone-200 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (appeal.collected_amount / appeal.target_amount) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-driftwood block text-[10px] uppercase font-bold">नामिनी खाता व UPI</span>
                    <span className="font-mono text-[11px] block text-charcoal">
                      A/C: {appeal.nominee_snapshot.account_number}
                    </span>
                    <span className="font-mono text-[11px] block text-terracotta">
                      UPI: {appeal.nominee_snapshot.upi_id}
                    </span>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  {isContributed ? (
                    <div className="text-xs text-driftwood">
                      UTR: <span className="font-mono font-bold text-charcoal">{donation?.utr_number}</span> •{' '}
                      दिनांक: <span className="font-mono">{formatDate(donation?.created_at || '')}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-rose-700 font-semibold">
                      ⚠️ कृपया 75% अनुपालन बनाए रखने हेतु तत्काल ₹50 का सहयोग करें।
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {isContributed ? (
                      donation?.slip_url && (
                        <button
                          type="button"
                          onClick={() => setViewSlipUrl(donation.slip_url)}
                          className="px-3 py-1.5 rounded-xl border border-stone-border text-xs font-bold text-charcoal hover:bg-canvas-inset flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-terracotta" />
                          <span>रसीद देखें (View Slip)</span>
                        </button>
                      )
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onPayAppeal(appeal)}
                          className="px-4 py-2 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs font-bold shadow-warm flex items-center gap-1.5"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Scan & Pay (₹50)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onUploadAppealSlip(appeal)}
                          className="px-3.5 py-2 rounded-xl bg-white border border-stone-border text-charcoal text-xs font-bold hover:bg-canvas flex items-center gap-1.5"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-sage" />
                          <span>रसीद अपलोड</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Slip Lightbox Modal */}
      {viewSlipUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-sm text-charcoal">सहयोग रसीद (Payment Slip)</h4>
              <button
                type="button"
                onClick={() => setViewSlipUrl(null)}
                className="text-driftwood hover:text-charcoal font-bold text-sm"
              >
                ✕ बंद करें
              </button>
            </div>
            <div className="rounded-2xl border overflow-hidden max-h-[70vh] flex items-center justify-center bg-stone-50">
              <img src={viewSlipUrl} alt="Payment Slip" className="max-w-full max-h-full object-contain" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
