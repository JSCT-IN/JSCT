'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DPSWTStore } from '@/lib/store';
import { AppealType } from '@/types';
import { triggerCelebrationConfetti } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import {
  ArrowLeft,
  Calendar,
  Building,
  UserCheck,
  CheckCircle2,
  Sparkles,
  User,
  CreditCard,
  Hash,
  Smartphone,
  Info,
  ChevronRight,
  Flame,
  ShieldCheck,
} from 'lucide-react';

export default function CreateAppealPage() {
  const router = useRouter();
  const { lang, t } = useTranslation();

  const [type, setType] = useState<AppealType>('BEREAVEMENT');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [description, setDescription] = useState('');

  // Nominee Credentials
  const [nomineeName, setNomineeName] = useState('');
  const [relationship, setRelationship] = useState('Wife (धर्मपत्नी)');
  const [bankName, setBankName] = useState('State Bank of India');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');

  // Inspector Assignment
  const [inspectorName] = useState('श्री अरविंद कुमार सिंह (वरिष्ठ क्षेत्रीय निरीक्षक)');
  const [inspectorPhone] = useState('+91 94501 23456');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const currentUser = DPSWTStore.getCurrentUser();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const code = type === 'BEREAVEMENT' ? `DPSWT-2026-B0${randomSuffix}` : `DPSWT-2026-M0${randomSuffix}`;
    const targetAmount = type === 'BEREAVEMENT' ? 2000000 : 500000;

    const title =
      type === 'BEREAVEMENT'
        ? lang === 'hi'
          ? `आकस्मिक निधन: स्वर्गीय ${beneficiaryName} जी के आश्रित परिवार को संबल`
          : `Bereavement Aid: Family Relief for Late ${beneficiaryName}`
        : lang === 'hi'
        ? `पुत्री वैवाहिक संबल: सुपुत्री ${beneficiaryName} के शुभ विवाह हेतु सहयोग`
        : `Daughter Marriage Assistance: Blessing Grant for ${beneficiaryName}`;

    const appealPayload = {
      code: code,
      member_id: currentUser.id,
      member_name: beneficiaryName,
      type: type,
      title: title,
      description: description,
      target_amount: targetAmount,
      status: 'ACTIVE' as const,
      inspector_name: inspectorName,
      inspector_phone: inspectorPhone,
      inspector_notes: lang === 'hi' 
        ? 'जिला सत्यापन प्रकोष्ठ द्वारा प्राथमिक अभिलेख व बैंक पासबुक की जांच संपन्न। सक्रिय।'
        : 'Initial physical record & nominee bank passbook verification completed by district inspection cell. Active.',
      event_date: eventDate || new Date().toISOString().split('T')[0],
      nominee_snapshot: {
        full_name: nomineeName,
        relationship: relationship,
        bank_name: bankName,
        account_number: accountNumber,
        ifsc_code: ifscCode.toUpperCase(),
        upi_id: upiId.toLowerCase(),
      },
    };

    const newAppeal = DPSWTStore.createAppeal(appealPayload);

    // Also persist to Supabase
    (async () => {
      try {
        const { supabase } = await import('@/lib/supabase/client');
        await supabase.from('appeals').insert({
          ...appealPayload,
          collected_amount: 0,
        });
      } catch (err) {
        console.warn('Supabase sync notice:', err);
      }
    })();

    triggerCelebrationConfetti();
    router.push(`/appeals/${newAppeal.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-8">
      
      {/* Top Breadcrumb Navigation */}
      <div>
        <Link
          href="/appeals"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-border text-xs font-semibold text-charcoal hover:text-terracotta hover:border-terracotta/40 shadow-xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.backToAppeals}</span>
        </Link>
      </div>

      {/* Editorial Header Section */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-stone-border shadow-xs text-xs">
          <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
          <span className="font-mono font-bold text-terracotta uppercase tracking-wider text-[11px]">
            Zero-Custody P2P
          </span>
          <span className="text-stone-border">•</span>
          <span className="text-driftwood font-medium">{t.nomineeAccountDesc}</span>
        </div>

        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-charcoal tracking-tight leading-tight">
          {t.createAppealTitle}
        </h1>

        <p className="text-xs sm:text-sm text-driftwood leading-relaxed font-light max-w-xl mx-auto">
          {t.createAppealSub}
        </p>
      </div>

      {/* Main Application Form Container */}
      <div className="bg-white rounded-3xl border border-stone-border shadow-warm p-6 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SECTION 1: AID CATEGORY SELECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal font-mono flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-canvas-inset border border-stone-border flex items-center justify-center text-[11px] text-terracotta font-bold">
                  1
                </span>
                <span>{t.aidCategory}</span>
              </label>
              <span className="text-[11px] text-driftwood">{lang === 'hi' ? 'एक श्रेणी चुनें' : 'Select a category'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Bereavement Support Option */}
              <button
                type="button"
                onClick={() => setType('BEREAVEMENT')}
                className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  type === 'BEREAVEMENT'
                    ? 'border-terracotta bg-gradient-to-br from-terracotta-light/60 to-white ring-2 ring-terracotta shadow-warm'
                    : 'border-stone-border bg-canvas-inset/50 hover:bg-canvas-inset hover:border-stone-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      type === 'BEREAVEMENT'
                        ? 'bg-terracotta text-white shadow-warm'
                        : 'bg-white border border-stone-border text-terracotta'
                    }`}
                  >
                    <Flame className="w-5 h-5" />
                  </div>
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      type === 'BEREAVEMENT'
                        ? 'border-terracotta bg-terracotta text-white'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {type === 'BEREAVEMENT' && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                  </span>
                </div>

                <div className="font-editorial text-lg font-bold text-charcoal">
                  {t.bereavementTitle}
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-editorial text-xl font-bold text-terracotta">
                    {t.bereavementGoal}
                  </span>
                </div>
                <p className="text-[11px] text-driftwood mt-2 leading-relaxed">
                  {t.bereavementDesc}
                </p>
              </button>

              {/* Daughter's Marriage Assistance Option */}
              <button
                type="button"
                onClick={() => setType('DAUGHTER_MARRIAGE')}
                className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  type === 'DAUGHTER_MARRIAGE'
                    ? 'border-sage bg-gradient-to-br from-sage-light to-white ring-2 ring-sage shadow-warm'
                    : 'border-stone-border bg-canvas-inset/50 hover:bg-canvas-inset hover:border-stone-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      type === 'DAUGHTER_MARRIAGE'
                        ? 'bg-sage text-white shadow-warm'
                        : 'bg-white border border-stone-border text-sage'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      type === 'DAUGHTER_MARRIAGE'
                        ? 'border-sage bg-sage text-white'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {type === 'DAUGHTER_MARRIAGE' && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                  </span>
                </div>

                <div className="font-editorial text-lg font-bold text-charcoal">
                  {t.marriageTitle}
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-editorial text-xl font-bold text-sage">
                    {t.marriageGoal}
                  </span>
                </div>
                <p className="text-[11px] text-driftwood mt-2 leading-relaxed">
                  {t.marriageDesc}
                </p>
              </button>

            </div>
          </div>

          {/* SECTION 2: BENEFICIARY DETAILS */}
          <div className="space-y-4 pt-4 border-t border-stone-border/80">
            <div className="text-xs font-bold uppercase tracking-wider text-charcoal font-mono flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-canvas-inset border border-stone-border flex items-center justify-center text-[11px] text-terracotta font-bold">
                2
              </span>
              <span>{t.caseBackground}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  {t.deceasedOrBeneficiaryName}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-driftwood absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    placeholder={lang === 'hi' ? 'उदा. स्वर्गीय सुरेंद्र यादव' : 'e.g. Late Surendra Yadav'}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  {t.eventDateLabel}
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-driftwood absolute left-3.5 top-3.5" />
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                {t.caseDescriptionLabel}
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={lang === 'hi' 
                  ? 'कार्यरत विभाग, पद, मृत्यु/विवाह के कारण, आश्रित परिजनों की संख्या (वृद्ध माता, पत्नी, बच्चे) एवं वर्तमान स्थिति का स्पष्ट विवरण लिखें...'
                  : 'Enter details on department, designation, cause of bereavement/marriage details, dependent family members, and current economic conditions...'}
                className="w-full p-4 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all leading-relaxed"
              />
              <span className="text-[11px] text-driftwood mt-1 block">
                * {lang === 'hi' ? 'यह विवरण जिला सत्यापन अधिकारी के भौतिक निरीक्षण प्रपत्र में दर्ज होगा।' : 'This information will be cross-checked during physical field audit.'}
              </span>
            </div>
          </div>

          {/* SECTION 3: NOMINEE DIRECT BANK & UPI CREDENTIALS */}
          <div className="space-y-4 pt-4 border-t border-stone-border/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="text-xs font-bold uppercase tracking-wider text-charcoal font-mono flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-canvas-inset border border-stone-border flex items-center justify-center text-[11px] text-terracotta font-bold">
                  3
                </span>
                <span>{t.nomineeDetailsHeader}</span>
              </div>
              <span className="text-[11px] text-sage font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Zero-Custody P2P
              </span>
            </div>

            {/* Zero Custody Trust Alert Banner */}
            <div className="p-3.5 rounded-2xl bg-canvas-inset border border-stone-border flex items-start gap-2.5 text-xs text-driftwood">
              <Info className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-charcoal font-semibold">{lang === 'hi' ? 'अति महत्वपूर्ण:' : 'Crucial:'}</strong> {lang === 'hi' ? 'कृपया बैंक खाता विवरण सावधानीपूर्वक भरें। अपील प्रकाशित होने पर समस्त सदस्य इसी खाते व UPI आईडी में सीधे ₹50 प्रेषित करेंगे।' : 'Double-check all bank credentials. Contributing members will send ₹50 directly into this account and UPI ID.'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  {t.nomineeNameLabel} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-driftwood absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={nomineeName}
                    onChange={(e) => setNomineeName(e.target.value)}
                    placeholder={lang === 'hi' ? 'उदा. श्रीमती मीना यादव' : 'e.g. Smt. Meena Yadav'}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  {t.relationshipLabel}
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-medium"
                >
                  <option value="Wife (धर्मपत्नी)">Wife (धर्मपत्नी)</option>
                  <option value="Husband (पति)">Husband (पति)</option>
                  <option value="Mother (माता जी)">Mother (माता जी)</option>
                  <option value="Son (सुपुत्र)">Son (सुपुत्र)</option>
                  <option value="Daughter (सुपुत्री)">Daughter (सुपुत्री)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  {t.bankNameLabel} *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-driftwood absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="State Bank of India"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  {t.accountNumberLabel} *
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-driftwood absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="30492817482"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  {t.ifscLabel} *
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-driftwood absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="SBIN0001248"
                    maxLength={11}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-mono font-bold uppercase"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                {t.upiIdLabel} *
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-driftwood absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                  placeholder="meena.yadav92@sbi"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-mono font-semibold"
                />
              </div>
              <span className="text-[11px] text-driftwood mt-1 block">
                * {lang === 'hi' ? 'इसी UPI आईडी का डायनामिक QR कोड स्वतः जनरेट होगा।' : 'A dynamic QR code will be generated from this UPI ID.'}
              </span>
            </div>
          </div>

          {/* SECTION 4: INSPECTION DESK ASSIGNMENT */}
          <div className="p-4 rounded-2xl bg-canvas-inset border border-stone-border space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-charcoal font-mono">
              <UserCheck className="w-4 h-4 text-sage" />
              <span>{lang === 'hi' ? 'संबद्ध जिला सत्यापन प्रकोष्ठ' : 'Assigned District Field Inspector'}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-driftwood">
              <div>
                <span className="font-semibold text-charcoal">{inspectorName}</span>
                <span className="block text-[11px]">{lang === 'hi' ? 'गोरखपुर-वाराणसी-लखनऊ क्षेत्रीय नोडल सेल' : 'Gorakhpur-Varanasi-Lucknow Regional Nodal Cell'}</span>
              </div>
              <span className="font-mono text-charcoal font-semibold">{inspectorPhone}</span>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-sm shadow-warm hover:shadow-warm-md transition-all transform active:scale-[0.98] flex items-center justify-center gap-2.5 touch-target"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{t.submitAppealAction}</span>
              <ChevronRight className="w-4 h-4 text-white/80" />
            </button>
          </div>

        </form>
      </div>

      {/* Trust & Verification Footnote */}
      <div className="text-center text-xs text-driftwood leading-relaxed max-w-lg mx-auto">
        {lang === 'hi' 
          ? 'आवेदन सबमिट होने के उपरांत जिला नोडल अधिकारी भौतिक रूप से बैंक पासबुक व मृत्यु प्रमाण पत्र का मिलान करेंगे। किसी भी संशय हेतु सीधे केंद्रीय हेल्पलाइन +91 94150 00001 पर संपर्क करें।'
          : 'Upon submission, district inspection officers will physically match the bank passbook and death certificate. For any assistance, call the central helpline +91 94150 00001.'}
      </div>

    </div>
  );
}
