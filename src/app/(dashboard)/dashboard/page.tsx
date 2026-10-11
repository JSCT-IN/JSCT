'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DPSWTStore } from '@/lib/store';
import { Member, Appeal, DonationRecord, ComplianceData } from '@/types';
import { formatINR, formatDate } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import ComplianceMeter from '@/components/ComplianceMeter';
import UpiModal from '@/components/UpiModal';
import SlipUploadModal from '@/components/SlipUploadModal';
import {
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  QrCode,
  FileCheck2,
  HeartHandshake,
  ArrowRight,
  Eye,
  LogOut,
} from 'lucide-react';

import { supabase } from '@/lib/supabase/client';
import { logoutAction } from '@/actions/auth-actions';

export default function MemberDashboardPage() {
  const router = useRouter();
  const { lang, t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [compliance, setCompliance] = useState<ComplianceData | null>(null);
  const [userDonations, setUserDonations] = useState<DonationRecord[]>([]);
  const [allAppeals, setAllAppeals] = useState<Appeal[]>([]);

  // Modals state
  const [selectedAppealForUpi, setSelectedAppealForUpi] = useState<Appeal | null>(null);
  const [selectedAppealForSlip, setSelectedAppealForSlip] = useState<Appeal | null>(null);
  const [viewingSlipUrl, setViewingSlipUrl] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (e) {
      console.warn('Logout action error:', e);
    }
    DPSWTStore.logout();
    router.push('/login');
  };

  useEffect(() => {
    async function syncData() {
      const localUser = DPSWTStore.getCurrentUser();
      if (!localUser) {
        router.push('/login');
        return;
      }
      
      try {
        // Fetch member profile from Supabase
        const { data: memberData } = await supabase
          .from('members')
          .select('*, nominees(*)')
          .eq('id', localUser.id)
          .single();

        const userObj: Member = memberData ? {
          ...memberData,
          nominee: memberData.nominees?.[0] || localUser.nominee,
        } : localUser;

        setCurrentUser(userObj);

        // Fetch all appeals
        const { data: appealsData } = await supabase
          .from('appeals')
          .select('*')
          .order('created_at', { ascending: false });

        const appealsList: Appeal[] = (appealsData && appealsData.length > 0)
          ? (appealsData as Appeal[])
          : DPSWTStore.getAppeals();

        setAllAppeals(appealsList);

        // Fetch donations made by this user
        const { data: donationsData } = await supabase
          .from('donation_records')
          .select('*')
          .eq('donor_id', userObj.id)
          .order('created_at', { ascending: false });

        const donationsList: DonationRecord[] = (donationsData && donationsData.length > 0)
          ? (donationsData as DonationRecord[])
          : DPSWTStore.getDonationsByDonor(userObj.id);

        setUserDonations(donationsList);

        // Calculate dynamic 75% compliance against total appeals
        const totalHistorical = Math.max(1, appealsList.length);
        const contributedAppealsCount = new Set(
          donationsList
            .filter((d) => d.status === 'VERIFIED' || d.status === 'SUBMITTED')
            .map((d) => d.appeal_id)
        ).size;

        const ratio = Math.round((contributedAppealsCount / totalHistorical) * 100);
        const feeExpires = userObj.fee_expires_at ? new Date(userObj.fee_expires_at) : new Date(Date.now() + 86400000 * 180);
        const feeValid = feeExpires > new Date();
        const daysUntilRenewal = Math.max(0, Math.ceil((feeExpires.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
        const qualifies75 = ratio >= 75;

        setCompliance({
          total_appeals: totalHistorical,
          contributed_appeals: contributedAppealsCount,
          ratio: ratio,
          is_eligible: qualifies75 && feeValid,
          fee_valid: feeValid,
          days_until_renewal: daysUntilRenewal,
          qualifies_75: qualifies75,
        });
      } catch {
        // Fallback to local store
        const user = DPSWTStore.getCurrentUser();
        setCurrentUser(user);
        if (user) {
          setCompliance(DPSWTStore.calculateCompliance(user.id));
          setUserDonations(DPSWTStore.getDonationsByDonor(user.id));
        }
        setAllAppeals(DPSWTStore.getAppeals());
      }
    }

    syncData();
    window.addEventListener('dpswt_state_change', syncData);
    return () => window.removeEventListener('dpswt_state_change', syncData);
  }, []);

  if (!currentUser || !compliance) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-driftwood">
        {lang === 'hi' ? 'सदस्य प्रोफ़ाइल लोड हो रही है...' : 'Loading member profile...'}
      </div>
    );
  }

  // Find active appeals that current user has NOT yet supported
  const contributedAppealIds = new Set(
    userDonations
      .filter((d) => d.status === 'VERIFIED' || d.status === 'SUBMITTED')
      .map((d) => d.appeal_id)
  );

  const pendingAppeals = allAppeals.filter(
    (a) => a.status === 'ACTIVE' && !contributedAppealIds.has(a.id)
  );

  const nominee = currentUser.nominee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Page Title & Status Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-border/70 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-terracotta">
              {t.dashboardPill}
            </span>
            <span className="text-xs text-driftwood">•</span>
            <span className="text-xs font-mono text-sage font-medium">DPSWT Portal</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-charcoal">
            {currentUser.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-driftwood mt-0.5">
            {t.membershipIdLabel} <span className="font-mono font-bold text-charcoal">{currentUser.membership_id}</span> • {currentUser.department}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
              compliance.is_eligible
                ? 'bg-sage-light text-sage border border-sage/30'
                : 'bg-terracotta-light text-terracotta border border-terracotta/30'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{compliance.is_eligible ? t.eligibleBadge : t.criticalBadge}</span>
          </span>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all flex items-center gap-1.5 shadow-xs"
            title="लॉगआउट करें (Log Out)"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'लॉगआउट' : 'Log Out'}</span>
          </button>
        </div>
      </div>

      {/* 1. DYNAMIC COMPLIANCE METER */}
      <section>
        <ComplianceMeter compliance={compliance} />
      </section>

      {/* 2. PENDING APPEALS ALERT (ACTION REQUIRED) */}
      {pendingAppeals.length > 0 && (
        <section className="p-6 rounded-3xl bg-terracotta-light/40 border border-terracotta/30 shadow-warm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-terracotta">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h2 className="font-editorial text-xl font-bold text-charcoal">
                {lang === 'hi' 
                  ? `शेष सक्रिय अपीलें (${pendingAppeals.length}) — तत्काल ₹50 सहयोग प्रेषित करें`
                  : `Pending Active Appeals (${pendingAppeals.length}) — Contribute ₹50 to Protect Eligibility`}
              </h2>
            </div>
            <span className="text-[11px] font-mono font-semibold text-terracotta bg-white px-2.5 py-1 rounded-full border border-terracotta/20">
              {lang === 'hi' ? 'पात्रता बनाए रखें' : 'Maintain 75%'}
            </span>
          </div>

          <p className="text-xs text-driftwood">
            {lang === 'hi'
              ? 'निम्नलिखित अपीलों में आपका ₹50 अंशदान अभी दर्ज नहीं हुआ है। अपना 75% अनुपालन बनाए रखने हेतु तुरंत सहयोग करें:'
              : 'You have not yet contributed ₹50 to the following active appeals. Support now to ensure your family remains eligible:'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {pendingAppeals.map((appeal) => (
              <div
                key={appeal.id}
                className="p-4 rounded-2xl bg-white border border-stone-border shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-terracotta font-semibold">{appeal.code}</span>
                    <span className="text-driftwood font-mono text-[11px]">
                      {t.targetGoal} {formatINR(appeal.target_amount)}
                    </span>
                  </div>
                  <h3 className="font-editorial text-base font-bold text-charcoal line-clamp-1">
                    {appeal.title}
                  </h3>
                  <div className="text-[11px] text-driftwood mt-1">
                    {t.verifiedNominee} {appeal.nominee_snapshot.full_name} • {appeal.nominee_snapshot.bank_name}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedAppealForUpi(appeal)}
                    className="flex-1 py-2 px-3 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs touch-target"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{t.send50Upi}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedAppealForSlip(appeal)}
                    className="py-2 px-3 rounded-xl bg-canvas-inset hover:bg-white border border-stone-border text-charcoal font-semibold text-xs flex items-center justify-center gap-1 touch-target"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-driftwood" />
                    <span>{t.uploadSlip}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. PROFILE CARD & NOMINEE DETAILS GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Personal & Membership Card */}
        <div className="rounded-3xl bg-white border border-stone-border p-6 sm:p-7 shadow-warm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-terracotta via-amber-500 to-sage" />

          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-xl font-bold text-charcoal flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-terracotta" />
              <span>{t.digitalIdCard}</span>
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sage-light text-sage border border-sage/20 uppercase">
                {lang === 'hi' ? 'सत्यापित' : 'VERIFIED'}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-canvas-inset border border-stone-border/80 space-y-2.5 text-xs relative">
            <div className="flex justify-between py-1.5 border-b border-stone-border/60">
              <span className="text-driftwood">{lang === 'hi' ? 'सदस्य का नाम:' : 'Member Name:'}</span>
              <span className="font-bold text-charcoal text-sm">{currentUser.full_name}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-stone-border/60">
              <span className="text-driftwood">{t.membershipIdLabel}</span>
              <span className="font-mono font-bold text-terracotta text-sm">{currentUser.membership_id}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-stone-border/60">
              <span className="text-driftwood">{t.aadhaarVerificationLabel}</span>
              <span className="font-mono text-charcoal font-semibold">XXXX-XXXX-{currentUser.aadhaar_last4}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-stone-border/60">
              <span className="text-driftwood">{t.departmentLabel}</span>
              <span className="text-charcoal font-medium">{currentUser.department}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-stone-border/60">
              <span className="text-driftwood">{t.districtStateLabel}</span>
              <span className="text-charcoal font-medium">{currentUser.district}, {currentUser.state}</span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-driftwood">{t.phoneLabel}</span>
              <span className="font-mono text-charcoal font-semibold">{currentUser.phone}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-driftwood pt-1">
            <span>{lang === 'hi' ? 'पंजीकरण दिनांक:' : 'Registered On:'} {formatDate(currentUser.created_at)}</span>
            <span className="text-sage font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'सत्यापित राजकीय सेवा' : 'Verified Public Servant'}</span>
            </span>
          </div>
        </div>

        {/* Nominee Credentials Card */}
        <div className="rounded-3xl bg-white border border-stone-border p-6 sm:p-7 shadow-warm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-xl font-bold text-charcoal flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sage" />
              <span>{lang === 'hi' ? 'पंजीकृत नामिनी विवरण (Nominee)' : 'Nominee Direct Bank Credentials'}</span>
            </h2>
            <span className="text-xs text-sage font-semibold bg-sage-light px-2 py-0.5 rounded-full">
              {lang === 'hi' ? 'सत्यापित' : 'VERIFIED'}
            </span>
          </div>

          {nominee ? (
            <div className="p-4 rounded-2xl bg-canvas-inset border border-stone-border/80 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-border/60">
                <span className="text-driftwood">{t.nomineeNameLabel}</span>
                <span className="font-bold text-charcoal">{nominee.full_name}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-border/60">
                <span className="text-driftwood">{t.relationshipLabel}</span>
                <span className="text-charcoal font-medium">{nominee.relationship}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-border/60">
                <span className="text-driftwood">{t.bankNameLabel}</span>
                <span className="text-charcoal font-medium">{nominee.bank_name}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-border/60">
                <span className="text-driftwood">{t.accountNumberLabel}</span>
                <span className="font-mono font-bold text-charcoal">{nominee.account_number}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-border/60">
                <span className="text-driftwood">{t.ifscLabel}</span>
                <span className="font-mono font-bold text-charcoal">{nominee.ifsc_code}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-driftwood">{t.upiIdLabel}</span>
                <span className="font-mono font-bold text-charcoal">{nominee.upi_id}</span>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-driftwood bg-canvas-inset rounded-2xl border border-stone-border">
              {lang === 'hi' ? 'नामिनी विवरण अनुपलब्ध है। कृपया अपना नामिनी खाता तुरंत जोड़ें।' : 'Nominee credentials missing. Please add nominee details immediately.'}
            </div>
          )}

          <p className="text-[11px] text-driftwood leading-relaxed">
            * {lang === 'hi' ? 'किसी आकस्मिक आपदा की स्थिति में संगठन के समस्त साथियों द्वारा ₹20 लाख तक का सामूहिक सहयोग सीधे इसी बैंक खाते में प्रेषित किया जाएगा।' : 'In an emergency event, mutual community contributions up to ₹20L are transferred directly into this verified account.'}
          </p>
        </div>

      </section>

      {/* 4. HISTORY OF SUPPORTED APPEALS & UTR VERIFICATIONS */}
      <section className="rounded-3xl bg-white border border-stone-border p-6 sm:p-8 shadow-warm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-editorial text-2xl font-bold text-charcoal">
              {t.contributionHistoryTitle}
            </h2>
            <p className="text-xs text-driftwood mt-0.5">
              {lang === 'hi' ? 'आपके द्वारा प्रेषित ₹50 सहयोग प्रविष्टियां, 12-अंकीय UTR नंबर एवं जिला सत्यापन रिपोर्ट' : 'Your ₹50 contributions, 12-digit UTR references and field audit verification reports'}
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-canvas-inset border border-stone-border text-charcoal">
            {lang === 'hi' ? 'कुल:' : 'Total:'} {userDonations.length} {lang === 'hi' ? 'सहयोग' : 'Contributions'} (₹{userDonations.length * 50})
          </span>
        </div>

        {userDonations.length === 0 ? (
          <div className="text-center py-12 bg-canvas-inset rounded-2xl border border-stone-border p-6">
            <HeartHandshake className="w-10 h-10 text-driftwood/60 mx-auto mb-2" />
            <h3 className="font-editorial text-lg font-bold text-charcoal">
              {lang === 'hi' ? 'कोई सहयोग प्रविष्टि नहीं मिली' : 'No contribution records found'}
            </h3>
            <p className="text-xs text-driftwood mt-1 max-w-sm mx-auto">
              {lang === 'hi' ? 'आपने अभी तक किसी अपील में सहयोग दर्ज नहीं किया है। सक्रिय अपीलों में ₹50 सहयोग प्रेषित कर अपना 75% अनुपालन प्रारंभ करें।' : 'You have not yet contributed to community appeals. Support active appeals with ₹50 to build your 75% ratio.'}
            </p>
            <Link
              href="/appeals"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-terracotta text-white font-semibold text-xs shadow-warm"
            >
              <span>{t.exploreAppealsBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-border text-driftwood font-mono bg-canvas-inset">
                  <th className="py-3 px-3">{lang === 'hi' ? 'अपील कोड व विषय' : 'Appeal Code & Title'}</th>
                  <th className="py-3 px-3">{t.utrCol}</th>
                  <th className="py-3 px-3">{t.amountCol}</th>
                  <th className="py-3 px-3">{t.statusCol}</th>
                  <th className="py-3 px-3">{lang === 'hi' ? 'रसीद' : 'Receipt'}</th>
                  <th className="py-3 px-3">{t.dateCol}</th>
                  <th className="py-3 px-3">{lang === 'hi' ? 'निरीक्षक टिप्पणी' : 'Inspector Remark'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-border/60">
                {userDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-canvas-inset/50 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-mono font-bold text-charcoal">{d.appeal_code}</div>
                      <div className="text-[11px] text-driftwood line-clamp-1 max-w-xs">{d.appeal_title}</div>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-charcoal">
                      {d.utr_number}
                    </td>
                    <td className="py-3.5 px-3 font-editorial font-bold text-sm text-charcoal">
                      ₹{d.amount}
                    </td>
                    <td className="py-3.5 px-3">
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
                            <span>{lang === 'hi' ? 'सत्यापित (Passbook Matched)' : 'Verified (Passbook Matched)'}</span>
                          </>
                        ) : d.status === 'REJECTED' ? (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            <span>{lang === 'hi' ? 'अस्वीकृत' : 'Rejected'}</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>{lang === 'hi' ? 'प्रतीक्षारत (Pending Audit)' : 'Pending Audit'}</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <button
                        type="button"
                        onClick={() => setViewingSlipUrl(d.slip_url)}
                        className="p-1.5 rounded-lg bg-canvas-inset hover:bg-white border border-stone-border text-driftwood hover:text-charcoal flex items-center gap-1 text-[11px]"
                        title={t.viewSlipAction}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t.viewSlipAction}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-3 text-driftwood font-mono text-[11px]">
                      {formatDate(d.created_at)}
                    </td>
                    <td className="py-3.5 px-3 text-[11px] text-driftwood max-w-xs">
                      {d.inspector_notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Slip Zoom / Inspector Preview Modal */}
      {viewingSlipUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl p-5 max-w-md w-full border border-stone-border shadow-warm-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-border">
              <h3 className="font-editorial text-lg font-bold text-charcoal">
                {lang === 'hi' ? 'अपलोड की गई भुगतान रसीद' : 'Uploaded Payment Slip'}
              </h3>
              <button
                type="button"
                onClick={() => setViewingSlipUrl(null)}
                className="text-driftwood hover:text-charcoal text-sm p-1"
              >
                ✕
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={viewingSlipUrl}
              alt="Uploaded Slip"
              className="w-full h-80 object-contain rounded-xl bg-canvas-inset border border-stone-border"
            />
            <button
              type="button"
              onClick={() => setViewingSlipUrl(null)}
              className="w-full py-2.5 rounded-xl bg-canvas-inset text-charcoal text-xs font-semibold hover:bg-canvas-card"
            >
              {lang === 'hi' ? 'बंद करें' : 'Close'}
            </button>
          </div>
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
