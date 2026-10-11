'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DPSWTStore } from '@/lib/store';
import { DonationRecord, Appeal, Member } from '@/types';
import { formatDate, formatINR } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import {
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  ShieldCheck,
  Clock,
  LogOut,
} from 'lucide-react';

import { supabase } from '@/lib/supabase/client';
import { updateDonationStatusAction } from '@/actions/donation-actions';
import { logoutAction } from '@/actions/auth-actions';

export default function InspectorAuditPage() {
  const router = useRouter();
  const { lang, t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<Member | null>(null);

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (e) {
      console.warn('Logout action error:', e);
    }
    DPSWTStore.logout();
    router.push('/login');
  };
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter & Search
  const [statusFilter, setStatusFilter] = useState<string>('SUBMITTED');
  const [appealFilter, setAppealFilter] = useState<string>('ALL');
  const [searchUtr, setSearchUtr] = useState<string>('');

  // Slip Inspector Zoom Modal
  const [activeDonationForReview, setActiveDonationForReview] = useState<DonationRecord | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    async function syncData() {
      setCurrentUser(DPSWTStore.getCurrentUser());

      try {
        const { data: donationsData } = await supabase
          .from('donation_records')
          .select('*')
          .order('created_at', { ascending: false });

        if (donationsData && donationsData.length > 0) {
          setDonations(donationsData as DonationRecord[]);
        } else {
          setDonations(DPSWTStore.getDonations());
        }

        const { data: appealsData } = await supabase
          .from('appeals')
          .select('*');

        if (appealsData && appealsData.length > 0) {
          setAppeals(appealsData as Appeal[]);
        } else {
          setAppeals(DPSWTStore.getAppeals());
        }
      } catch {
        setDonations(DPSWTStore.getDonations());
        setAppeals(DPSWTStore.getAppeals());
      }
    }

    syncData();
    window.addEventListener('dpswt_state_change', syncData);
    return () => window.removeEventListener('dpswt_state_change', syncData);
  }, []);

  const handleVerify = async (donationId: string) => {
    setIsUpdating(true);
    const inspectorNotes = lang === 'hi' 
      ? 'नामिनी बैंक पासबुक प्रविष्टि से मिलान पूर्ण। ₹50 जमा सत्यापित।'
      : 'Nominee bank passbook statement matched. ₹50 credit verified.';

    try {
      await updateDonationStatusAction(donationId, 'VERIFIED', inspectorNotes);
      // Also update local state
      setDonations((prev) =>
        prev.map((d) => (d.id === donationId ? { ...d, status: 'VERIFIED', inspector_notes: inspectorNotes } : d))
      );
    } catch {
      DPSWTStore.verifyDonation(donationId, currentUser?.full_name || 'Inspector Arvind Kumar Singh', inspectorNotes);
    } finally {
      setIsUpdating(false);
      setActiveDonationForReview(null);
    }
  };

  const handleReject = async () => {
    if (!activeDonationForReview) return;
    setIsUpdating(true);
    const reason = rejectReason.trim() || (lang === 'hi' ? 'नामिनी के बैंक खाते में UTR संख्या नहीं मिली अथवा अपूर्ण है।' : 'UTR reference not found in nominee passbook statement.');

    try {
      await updateDonationStatusAction(activeDonationForReview.id, 'REJECTED', reason);
      setDonations((prev) =>
        prev.map((d) => (d.id === activeDonationForReview.id ? { ...d, status: 'REJECTED', inspector_notes: reason } : d))
      );
    } catch {
      DPSWTStore.rejectDonation(activeDonationForReview.id, reason);
    } finally {
      setIsUpdating(false);
      setIsRejectDialogOpen(false);
      setActiveDonationForReview(null);
      setRejectReason('');
    }
  };

  // Filtered donations
  const filteredDonations = donations.filter((d) => {
    if (statusFilter !== 'ALL' && d.status !== statusFilter) {
      return false;
    }
    if (appealFilter !== 'ALL' && d.appeal_id !== appealFilter) {
      return false;
    }
    if (searchUtr.trim() !== '') {
      const q = searchUtr.trim().toLowerCase();
      const matchUtr = d.utr_number.toLowerCase().includes(q);
      const matchDonor = (d.donor_name || '').toLowerCase().includes(q);
      const matchMemberId = (d.donor_membership_id || '').toLowerCase().includes(q);
      if (!matchUtr && !matchDonor && !matchMemberId) {
        return false;
      }
    }
    return true;
  });

  // Metrics
  const pendingCount = donations.filter((d) => d.status === 'SUBMITTED').length;
  const verifiedCount = donations.filter((d) => d.status === 'VERIFIED').length;
  const rejectedCount = donations.filter((d) => d.status === 'REJECTED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-border/70 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-sage">
              {t.inspectorPill}
            </span>
            <span className="text-xs text-driftwood">•</span>
            <span className="text-xs text-charcoal font-medium">{lang === 'hi' ? 'जिला स्तरीय फील्ड ऑडिट' : 'District Field Audit'}</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-charcoal">
            {t.inspectorTitle}
          </h1>
          <p className="text-xs sm:text-sm text-driftwood mt-0.5">
            {t.inspectorSub}
          </p>
        </div>

        {/* Inspector Chip & Logout Button */}
        <div className="flex items-center gap-2">
          <div className="p-3 rounded-2xl bg-white border border-stone-border shadow-warm flex items-center gap-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-sage-light text-sage flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-charcoal">{currentUser?.full_name}</div>
              <div className="text-[11px] text-driftwood font-mono">{currentUser?.membership_id} ({currentUser?.role})</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            title="लॉगआउट करें (Log Out)"
          >
            <LogOut className="w-4 h-4" />
            <span>{lang === 'hi' ? 'लॉगआउट' : 'Log Out'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-2xl bg-white border border-stone-border shadow-warm flex items-center justify-between">
          <div>
            <div className="text-xs text-driftwood font-medium">{t.pendingAudit}</div>
            <div className="font-editorial text-3xl font-bold text-amber-600 mt-1">
              {pendingCount}
            </div>
          </div>
          <Clock className="w-8 h-8 text-amber-500/30" />
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-border shadow-warm flex items-center justify-between">
          <div>
            <div className="text-xs text-driftwood font-medium">{t.verifiedAudits}</div>
            <div className="font-editorial text-3xl font-bold text-sage mt-1">
              {verifiedCount}
            </div>
            <div className="text-[11px] text-sage font-mono mt-0.5">
              {formatINR(verifiedCount * 50)} {lang === 'hi' ? 'प्रत्यक्ष पासबुक मिलान' : 'Audited'}
            </div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-sage/30" />
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-border shadow-warm flex items-center justify-between">
          <div>
            <div className="text-xs text-driftwood font-medium">{t.rejectedAudits}</div>
            <div className="font-editorial text-3xl font-bold text-terracotta mt-1">
              {rejectedCount}
            </div>
          </div>
          <XCircle className="w-8 h-8 text-terracotta/30" />
        </div>

      </div>

      {/* Audit Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-border shadow-warm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* UTR / Member Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-driftwood absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchUtr}
              onChange={(e) => setSearchUtr(e.target.value)}
              placeholder={t.searchUtrPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-border bg-canvas-inset focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all font-mono"
            />
          </div>

          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('SUBMITTED')}
              className={`px-3 py-2 rounded-xl transition-all ${
                statusFilter === 'SUBMITTED'
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'bg-canvas-inset text-driftwood hover:text-charcoal'
              }`}
            >
              {lang === 'hi' ? `लंबित ऑडिट (${pendingCount})` : `Pending (${pendingCount})`}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('VERIFIED')}
              className={`px-3 py-2 rounded-xl transition-all ${
                statusFilter === 'VERIFIED'
                  ? 'bg-sage text-white font-semibold shadow-xs'
                  : 'bg-canvas-inset text-driftwood hover:text-charcoal'
              }`}
            >
              {lang === 'hi' ? `सत्यापित (${verifiedCount})` : `Verified (${verifiedCount})`}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('REJECTED')}
              className={`px-3 py-2 rounded-xl transition-all ${
                statusFilter === 'REJECTED'
                  ? 'bg-terracotta text-white font-semibold shadow-xs'
                  : 'bg-canvas-inset text-driftwood hover:text-charcoal'
              }`}
            >
              {lang === 'hi' ? `अस्वीकृत (${rejectedCount})` : `Rejected (${rejectedCount})`}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-2 rounded-xl transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-charcoal text-white font-semibold shadow-xs'
                  : 'bg-canvas-inset text-driftwood hover:text-charcoal'
              }`}
            >
              {lang === 'hi' ? 'समस्त रिकॉर्ड' : 'All Records'}
            </button>
          </div>

          {/* Appeal Dropdown Filter */}
          <div>
            <select
              value={appealFilter}
              onChange={(e) => setAppealFilter(e.target.value)}
              className="w-full md:w-auto px-3 py-2.5 rounded-xl border border-stone-border bg-canvas-inset text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/20"
            >
              <option value="ALL">{lang === 'hi' ? 'समस्त अपीलें (All Appeals)' : 'All Appeals'}</option>
              {appeals.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} - {a.title.slice(0, 30)}...
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Audit Submissions Table */}
      <div className="rounded-3xl bg-white border border-stone-border shadow-warm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-border flex items-center justify-between">
          <div className="font-editorial text-xl font-bold text-charcoal">
            {lang === 'hi' ? `सत्यापन कतार (Audit Queue) — ${filteredDonations.length} प्रविष्टियां` : `Audit Verification Queue — ${filteredDonations.length} Submissions`}
          </div>
          <span className="text-[11px] text-driftwood">
            {lang === 'hi' ? 'पासबुक मिलान के बाद एक-क्लिक अनुमोदन उपलब्ध है' : 'One-click reconciliation against passbook entries'}
          </span>
        </div>

        {filteredDonations.length === 0 ? (
          <div className="text-center py-16 p-6 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-sage mx-auto" />
            <h3 className="font-editorial text-lg font-bold text-charcoal">
              {lang === 'hi' ? 'इस फिल्टर में कोई रिकॉर्ड नहीं है' : 'No records found for current filter'}
            </h3>
            <p className="text-xs text-driftwood">
              {lang === 'hi' ? 'सभी लंबित प्रविष्टियां सत्यापित कर ली गई हैं अथवा कोई डेटा मेल नहीं खाया।' : 'All pending submissions have been audited or no data matches query.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-border text-driftwood font-mono bg-canvas-inset">
                  <th className="py-3 px-4">{t.donorCol}</th>
                  <th className="py-3 px-4">{lang === 'hi' ? 'अपील कोड' : 'Appeal Code'}</th>
                  <th className="py-3 px-4">{t.utrCol}</th>
                  <th className="py-3 px-4">{t.amountCol}</th>
                  <th className="py-3 px-4">{lang === 'hi' ? 'रसीद थंबनेल' : 'Receipt'}</th>
                  <th className="py-3 px-4">{t.dateCol}</th>
                  <th className="py-3 px-4">{t.statusCol}</th>
                  <th className="py-3 px-4 text-right">{lang === 'hi' ? 'सत्यापन कार्रवाई' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-border/60">
                {filteredDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-canvas-inset/50 transition-colors">
                    
                    {/* Donor Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-charcoal">{d.donor_name || (lang === 'hi' ? 'सदस्य' : 'Member')}</div>
                      <div className="text-[11px] font-mono text-terracotta">{d.donor_membership_id}</div>
                    </td>

                    {/* Appeal Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-charcoal">
                      {d.appeal_code}
                    </td>

                    {/* UTR */}
                    <td className="py-3.5 px-4 font-mono font-bold text-charcoal tracking-wider">
                      {d.utr_number}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-editorial font-bold text-sm text-charcoal">
                      ₹{d.amount}
                    </td>

                    {/* Slip Thumbnail */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => setActiveDonationForReview(d)}
                        className="relative group rounded-lg overflow-hidden border border-stone-border w-12 h-12 block bg-canvas-inset"
                        title={t.viewSlipAction}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={d.slip_url}
                          alt="Slip"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-charcoal/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                          <Eye className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-driftwood font-mono text-[11px]">
                      {formatDate(d.created_at)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                            <XCircle className="w-3 h-3" />
                            <span>{lang === 'hi' ? 'अस्वीकृत' : 'Rejected'}</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>{lang === 'hi' ? 'लंबित' : 'Pending'}</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {d.status === 'SUBMITTED' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleVerify(d.id)}
                            className="px-3 py-1.5 rounded-xl bg-sage hover:bg-sage-hover text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1 touch-target"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t.verifyAction}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveDonationForReview(d);
                              setIsRejectDialogOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-canvas-inset hover:bg-terracotta-light text-driftwood hover:text-terracotta border border-stone-border text-xs transition-colors touch-target"
                          >
                            {t.rejectAction}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveDonationForReview(d)}
                          className="text-xs text-driftwood hover:text-charcoal hover:underline"
                        >
                          {lang === 'hi' ? 'ऑडिट नोट्स देखें' : 'View Notes'}
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slip Review / Passbook Matching Modal */}
      {activeDonationForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative bg-white rounded-3xl p-6 max-w-lg w-full border border-stone-border shadow-warm-lg space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-border">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-terracotta/10 text-terracotta font-semibold uppercase">
                  {activeDonationForReview.appeal_code}
                </span>
                <h3 className="font-editorial text-xl font-bold text-charcoal mt-1">
                  {t.passbookMatchingTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveDonationForReview(null);
                  setIsRejectDialogOpen(false);
                }}
                className="text-driftwood hover:text-charcoal text-sm p-1"
              >
                ✕
              </button>
            </div>

            {/* Donor & UTR Match Box */}
            <div className="p-3.5 rounded-2xl bg-canvas-inset border border-stone-border text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-driftwood">
                <span>{t.donorCol}:</span>
                <span className="font-sans font-bold text-charcoal">{activeDonationForReview.donor_name}</span>
              </div>
              <div className="flex justify-between text-driftwood">
                <span>{t.membershipIdLabel}</span>
                <span className="text-terracotta font-bold">{activeDonationForReview.donor_membership_id}</span>
              </div>
              <div className="flex justify-between text-driftwood">
                <span>{lang === 'hi' ? 'दावाकृत 12-अंक UTR:' : 'Claimed 12-Digit UTR:'}</span>
                <span className="font-bold text-base text-charcoal">{activeDonationForReview.utr_number}</span>
              </div>
              <div className="flex justify-between text-driftwood">
                <span>{t.amountCol}:</span>
                <span className="font-sans font-bold text-charcoal">₹{activeDonationForReview.amount}</span>
              </div>
            </div>

            {/* Slip Preview Image */}
            <div className="border border-stone-border rounded-2xl overflow-hidden bg-canvas-inset p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeDonationForReview.slip_url}
                alt="Payment Slip Preview"
                className="w-full h-72 object-contain rounded-xl bg-white"
              />
            </div>

            {/* Rejection reason box if open */}
            {isRejectDialogOpen ? (
              <div className="p-3.5 rounded-2xl bg-terracotta-light/50 border border-terracotta/30 space-y-2">
                <label className="block text-xs font-semibold text-terracotta">
                  {lang === 'hi' ? 'अस्वीकृति का कारण (Reason for Rejection):' : 'Reason for Rejection:'}
                </label>
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={lang === 'hi' ? 'उदा. नामिनी पासबुक में UTR संख्या नहीं मिली अथवा अपूर्ण है।' : 'e.g. UTR not found on nominee statement.'}
                  className="w-full px-3 py-2 rounded-xl border border-stone-border bg-white text-xs text-charcoal focus:outline-none"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsRejectDialogOpen(false)}
                    className="px-3 py-1.5 rounded-xl text-xs text-driftwood hover:text-charcoal"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    className="px-4 py-1.5 rounded-xl bg-terracotta text-white font-semibold text-xs shadow-xs"
                  >
                    {t.rejectAction}
                  </button>
                </div>
              </div>
            ) : (
              /* Modal Actions */
              <div className="pt-2 flex items-center justify-end gap-2">
                {activeDonationForReview.status === 'SUBMITTED' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsRejectDialogOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-canvas-inset hover:bg-terracotta-light text-driftwood hover:text-terracotta border border-stone-border text-xs font-semibold"
                    >
                      {t.rejectAction}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerify(activeDonationForReview.id)}
                      className="px-5 py-2.5 rounded-xl bg-sage hover:bg-sage-hover text-white font-semibold text-xs shadow-warm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.verifyAction}</span>
                    </button>
                  </>
                )}
                {activeDonationForReview.status !== 'SUBMITTED' && (
                  <button
                    type="button"
                    onClick={() => setActiveDonationForReview(null)}
                    className="w-full py-2.5 rounded-xl bg-canvas-inset text-charcoal font-semibold text-xs"
                  >
                    {lang === 'hi' ? 'बंद करें' : 'Close'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
