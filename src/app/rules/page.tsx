'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import {
  Scale,
  ShieldCheck,
  Coins,
  Clock,
  FileCheck2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export default function RulesPage() {
  const { lang, t } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-canvas-inset border border-stone-border text-xs text-charcoal font-medium">
          <BookOpen className="w-3.5 h-3.5 text-terracotta" />
          <span>{t.rulesPill}</span>
        </div>

        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-charcoal tracking-tight">
          {t.rulesTitle}
        </h1>

        <p className="text-sm sm:text-base text-driftwood leading-relaxed font-light">
          {t.rulesSub}
        </p>
      </div>

      {/* Core Rule Callout Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-border shadow-warm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-terracotta-light text-terracotta flex items-center justify-center shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-editorial text-2xl font-bold text-charcoal">
              {t.goldenRatioTitle}
            </h2>
            <p className="text-xs text-driftwood">
              {t.goldenRatioSub}
            </p>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-driftwood leading-relaxed space-y-3 pt-2">
          <p>
            {lang === 'hi' 
              ? 'डीपीएसडब्ल्यूटी (DPSWT) का मूल आधार है — सबका साथ, सबकी सुरक्षा। जब कोई सदस्य अन्य साथियों के संकट के समय में निरंतर खड़ा रहता है, केवल तभी संगठन उनके अपने परिवार के संकट के समय ₹20 लाख तक के सहयोग की गारंटी ले सकता है।'
              : 'The founding principle of DPSWT is mutual collective solidarity. Only when a member consistently stands with brethren during their grief can the community guarantee up to ₹20 Lakhs in emergency bereavement support.'}
          </p>

          <div className="p-4 rounded-2xl bg-canvas-inset border border-stone-border space-y-2 font-mono text-xs text-charcoal">
            <div className="font-bold text-terracotta">{t.ruleFormulaTitle}</div>
            <div className="p-2.5 bg-white rounded-xl border border-stone-border text-center text-sm font-bold">
              {t.ruleFormulaEquation}
            </div>
            <div className="text-driftwood text-[11px] text-center">
              {t.ruleFormulaNote}
            </div>
          </div>
        </div>
      </div>

      {/* Rules Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Rule 1 */}
        <div className="p-6 rounded-3xl bg-white border border-stone-border shadow-warm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-canvas-inset border border-stone-border flex items-center justify-center text-terracotta">
            <Coins className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-xl font-bold text-charcoal">
            {lang === 'hi' ? '1. ₹50 प्रति अपील अंशदान नियम' : '1. ₹50 Micro-Aid Per Appeal Rule'}
          </h3>
          <p className="text-xs text-driftwood leading-relaxed">
            {lang === 'hi'
              ? 'प्रत्येक सक्रिय अपील (आकस्मिक निधन अथवा पुत्री विवाह) के जारी होने पर प्रत्येक कर्मठ सदस्य को सीधे नामिनी के खाते में ₹50 अंतरित करना अनिवार्य है। यह राशि सीधे नामिनी के अधिकृत खाते में जाती है।'
              : 'Upon each active bereavement or marriage appeal, every active member transfers ₹50 directly into the nominee bank account or UPI ID without intermediary cuts.'}
          </p>
        </div>

        {/* Rule 2 */}
        <div className="p-6 rounded-3xl bg-white border border-stone-border shadow-warm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-canvas-inset border border-stone-border flex items-center justify-center text-sage">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-xl font-bold text-charcoal">
            {lang === 'hi' ? '2. तीन (3) माह का लॉकिंग पीरियड' : '2. Three (3) Months Lock-in Period'}
          </h3>
          <p className="text-xs text-driftwood leading-relaxed">
            {lang === 'hi'
              ? 'नये सदस्य के पंजीकरण दिनांक से 90 दिन (3 माह) का लॉकिंग पीरियड लागू होता है। इस अवधि के दौरान जारी समस्त अपीलों में सदस्य को ₹50 सहयोग प्रेषित करना होगा, परंतु इस अवधि में स्वयं का क्लेम मान्य नहीं होगा।'
              : 'A 90-day cooling and lock-in period applies from the date of registration. Members must contribute to all community appeals issued during this period before personal eligibility activates.'}
          </p>
        </div>

        {/* Rule 3 */}
        <div className="p-6 rounded-3xl bg-white border border-stone-border shadow-warm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-canvas-inset border border-stone-border flex items-center justify-center text-charcoal">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-xl font-bold text-charcoal">
            {lang === 'hi' ? '3. 12-अंक UTR व रसीद अनिवार्य' : '3. 12-Digit UTR & Slip Submission'}
          </h3>
          <p className="text-xs text-driftwood leading-relaxed">
            {lang === 'hi'
              ? 'भुगतान करने के उपरांत सदस्य को 24 घंटे के भीतर पोर्टल पर 12-अंकीय बैंक UTR / UPI Ref ID तथा रसीद का स्क्रीनशॉट अपलोड करना होगा। अधूरा या अमान्य UTR दर्ज करने पर अपील गैर-सहयोगी मानी जाएगी।'
              : 'Members must record their unique 12-digit UTR reference number and receipt screenshot on the portal within 24 hours of transfer to credit compliance.'}
          </p>
        </div>

        {/* Rule 4: Registration & Annual Renewal */}
        <div className="p-6 rounded-3xl bg-white border border-stone-border shadow-warm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-canvas-inset border border-stone-border flex items-center justify-center text-terracotta">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-xl font-bold text-charcoal">
            {lang === 'hi' ? '4. जुड़ने व नवीनीकरण फीस: ₹50 मात्र' : '4. Joining & Annual Renewal Fee: ₹50'}
          </h3>
          <p className="text-xs text-driftwood leading-relaxed">
            {lang === 'hi'
              ? 'जन सेवा चैरिटेबल ट्रस्ट (JSCT) में नए सदस्य जुड़ने की फीस मात्र ₹50 है, तथा हर साल नवीनीकरण (Renewal) फीस भी ₹50 है। 365 दिन की सदस्यता पूर्ण होने पर समय पर नवीनीकरण कराना अनिवार्य है।'
              : 'The initial joining registration fee for Jan Sewa Charitable Trust is ₹50, and the annual renewal fee is ₹50 per year.'}
          </p>
        </div>

        {/* Rule 5: Age Limit 18-60 Years */}
        <div className="p-6 rounded-3xl bg-white border border-stone-border shadow-warm space-y-3 md:col-span-2">
          <div className="w-10 h-10 rounded-xl bg-canvas-inset border border-stone-border flex items-center justify-center text-sage">
            <Coins className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-xl font-bold text-charcoal">
            {lang === 'hi' ? '5. सदस्यता हेतु आयु सीमा: 18 से 60 वर्ष' : '5. Membership Age Limit: 18 to 60 Years'}
          </h3>
          <p className="text-xs text-driftwood leading-relaxed">
            {lang === 'hi'
              ? 'JSCT न्यास की सदस्यता ग्रहण करने हेतु आवेदक की न्यूनतम आयु 18 वर्ष तथा अधिकतम आयु 60 वर्ष होना अनिवार्य है। आधार कार्ड अथवा जन्म प्रमाण पत्र के माध्यम से आयु का सत्यापन किया जाता है।'
              : 'To be eligible for JSCT mutual welfare membership, the applicant must be between 18 and 60 years of age.'}
          </p>
        </div>

      </div>

      {/* Aid Categories Table: Bereavement vs Daughter's Marriage */}
      <div className="rounded-3xl bg-white border border-stone-border p-6 sm:p-8 shadow-warm space-y-6">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-charcoal">
            {lang === 'hi' ? 'कल्याण सहायता श्रेणियां एवं पात्रता शर्तें' : 'Aid Categories & Eligibility Matrix'}
          </h2>
          <p className="text-xs text-driftwood mt-1">
            {lang === 'hi' ? 'विभिन्न आपातकालीन स्थितियों में प्रदान की जाने वाली सहायता का तुलनात्मक विवरण' : 'Comparative breakdown of welfare aid across emergency circumstances'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-border text-driftwood font-mono bg-canvas-inset">
                <th className="py-3 px-4">{lang === 'hi' ? 'सहायता प्रकार' : 'Aid Category'}</th>
                <th className="py-3 px-4">{lang === 'hi' ? 'अधिकतम लक्ष्य' : 'Target Amount'}</th>
                <th className="py-3 px-4">{lang === 'hi' ? 'आवश्यक अनुपालन' : 'Required Ratio'}</th>
                <th className="py-3 px-4">{lang === 'hi' ? 'लॉकिंग अवधि' : 'Lock-in Period'}</th>
                <th className="py-3 px-4">{lang === 'hi' ? 'आवश्यक अभिलेख' : 'Audit Documents'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-border/60">
              <tr className="hover:bg-canvas-inset/50">
                <td className="py-4 px-4">
                  <div className="font-bold text-charcoal">{t.bereavementTitle}</div>
                  <div className="text-[11px] text-terracotta font-medium">{t.bereavementDesc}</div>
                </td>
                <td className="py-4 px-4 font-editorial font-bold text-base text-charcoal">
                  {t.bereavementGoal}
                </td>
                <td className="py-4 px-4 font-mono font-semibold text-sage">
                  ≥ 75%
                </td>
                <td className="py-4 px-4 text-driftwood">
                  {lang === 'hi' ? '3 माह (90 दिन)' : '3 Months (90 Days)'}
                </td>
                <td className="py-4 px-4 text-driftwood leading-tight">
                  {lang === 'hi' 
                    ? 'मृत्यु प्रमाण पत्र, सेवा सत्यापन, नामिनी आधार व बैंक पासबुक' 
                    : 'Death certificate, department service verification, nominee Aadhaar & passbook'}
                </td>
              </tr>

              <tr className="hover:bg-canvas-inset/50">
                <td className="py-4 px-4">
                  <div className="font-bold text-charcoal">{t.marriageTitle}</div>
                  <div className="text-[11px] text-sage font-medium">{t.marriageDesc}</div>
                </td>
                <td className="py-4 px-4 font-editorial font-bold text-base text-charcoal">
                  {t.marriageGoal}
                </td>
                <td className="py-4 px-4 font-mono font-semibold text-sage">
                  ≥ 85% ({lang === 'hi' ? 'नियमित 2 वर्ष' : '2 Years Active'})
                </td>
                <td className="py-4 px-4 text-driftwood">
                  {lang === 'hi' ? '2 वर्ष' : '2 Years'}
                </td>
                <td className="py-4 px-4 text-driftwood leading-tight">
                  {lang === 'hi'
                    ? 'विवाह निमंत्रण पत्र, कन्या आयु प्रमाण, आधार व बैंक पासबुक'
                    : 'Wedding invitation, age proof, Aadhaar and nominee passbook'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Field Inspection & Audit Protocol */}
      <div className="rounded-3xl bg-canvas-inset border border-stone-border p-6 sm:p-8 shadow-warm space-y-4">
        <div className="flex items-center gap-2.5">
          <FileCheck2 className="w-5 h-5 text-sage" />
          <h2 className="font-editorial text-2xl font-bold text-charcoal">
            {lang === 'hi' ? 'जिला स्तरीय फील्ड निरीक्षण एवं पासबुक मिलान प्रोटोकॉल' : 'Field Inspection & Physical Passbook Audit Protocol'}
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-driftwood leading-relaxed">
          {lang === 'hi'
            ? 'किसी भी अपील को पोर्टल पर सक्रिय करने से पूर्व और एकत्रित राशि की अंतिम पुष्टि हेतु निम्नलिखित 4-स्तरीय पारदर्शी ऑडिट प्रक्रिया अपनाई जाती है:'
            : 'Before activating an appeal and for final fund reconciliation, our 4-stage inspection workflow is strictly enforced:'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white border border-stone-border text-xs space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-terracotta text-white font-bold flex items-center justify-center text-xs">
              1
            </span>
            <div className="font-bold text-charcoal">{lang === 'hi' ? 'अभिलेख सत्यापन' : 'Document Audit'}</div>
            <div className="text-driftwood text-[11px]">
              {lang === 'hi' ? 'अस्पताल, नगर निगम एवं विभागीय कार्यालय से दस्तावेजों की प्रामाणिकता जांच।' : 'Authenticity verification from hospital, municipal council and employer records.'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-border text-xs space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-terracotta text-white font-bold flex items-center justify-center text-xs">
              2
            </span>
            <div className="font-bold text-charcoal">{lang === 'hi' ? 'गृह भौतिक निरीक्षण' : 'Home Field Visit'}</div>
            <div className="text-driftwood text-[11px]">
              {lang === 'hi' ? 'जिला नोडल अधिकारी द्वारा शोकाकुल परिवार के निवास पर जाकर वास्तविक स्थिति का सत्यापन।' : 'In-person field visit by district nodal officer to verify bereaved family circumstances.'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-border text-xs space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-terracotta text-white font-bold flex items-center justify-center text-xs">
              3
            </span>
            <div className="font-bold text-charcoal">{lang === 'hi' ? 'नामिनी खाता जांच' : 'Nominee Bank Audit'}</div>
            <div className="text-driftwood text-[11px]">
              {lang === 'hi' ? 'बैंक शाखा में जाकर नामिनी के खाते की सक्रियता व आधार-सीडिंग की पुष्टि।' : 'Bank branch visit to confirm active operational status and Aadhaar NPCI seeding.'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-border text-xs space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-terracotta text-white font-bold flex items-center justify-center text-xs">
              4
            </span>
            <div className="font-bold text-charcoal">{lang === 'hi' ? 'पासबुक ऑडिट व समापन' : 'Passbook Reconciliation'}</div>
            <div className="text-driftwood text-[11px]">
              {lang === 'hi' ? 'दानदाताओं द्वारा भरे गए 12-अंकीय UTR का नामिनी पासबुक स्टेटमेंट से भौतिक मिलान।' : 'Matching submitted 12-digit UTR numbers against nominee physical bank passbook statement.'}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA to check compliance in personal dashboard */}
      <div className="p-6 rounded-3xl bg-white border border-stone-border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-warm">
        <div>
          <h3 className="font-editorial text-xl font-bold text-charcoal">
            {lang === 'hi' ? 'अपना व्यक्तिगत 75% अनुपालन अनुपात जांचें' : 'Check Your Personal 75% Compliance Ratio'}
          </h3>
          <p className="text-xs text-driftwood mt-0.5">
            {lang === 'hi' ? 'सदस्य डैशबोर्ड पर जाकर अपनी वर्तमान पात्रता और शेष अपीलों का विवरण देखें' : 'Visit the Member Dashboard to view your dynamic gauge and active eligibility status'}
          </p>
        </div>

        <Link
          href="/dashboard"
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-xs shadow-warm hover:shadow-warm-md transition-all flex items-center gap-2 shrink-0 touch-target"
        >
          <span>{lang === 'hi' ? 'मेरा डैशबोर्ड खोलें' : 'Open My Dashboard'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
