'use client';

import React, { useState } from 'react';
import { DISTRICT_COORDINATORS } from '@/lib/mockData';
import { useTranslation } from '@/lib/i18n';
import {
  PhoneCall,
  MapPin,
  Search,
  MessageSquare,
  ShieldCheck,
  Building,
  ExternalLink,
  Send,
} from 'lucide-react';

export default function ContactDirectoryPage() {
  const { lang, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedGrievance, setSubmittedGrievance] = useState(false);

  // Filter coordinators
  const filteredCoordinators = DISTRICT_COORDINATORS.filter((coord) => {
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      coord.name.toLowerCase().includes(q) ||
      coord.district.toLowerCase().includes(q) ||
      coord.division.toLowerCase().includes(q) ||
      coord.designation.toLowerCase().includes(q)
    );
  });

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedGrievance(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-canvas-inset border border-stone-border text-xs text-charcoal font-medium">
          <MapPin className="w-3.5 h-3.5 text-terracotta" />
          <span>{t.directoryPill}</span>
        </div>

        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-charcoal tracking-tight">
          {t.directoryTitle}
        </h1>

        <p className="text-sm sm:text-base text-driftwood leading-relaxed font-light">
          {t.directorySub}
        </p>
      </div>

      {/* Emergency Helpline Highlight Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-6 rounded-3xl bg-white border border-stone-border shadow-warm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-terracotta-light text-terracotta flex items-center justify-center">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-xl font-bold text-charcoal">
            {lang === 'hi' ? 'आपातकालीन अपील हेल्पलाइन' : 'Emergency Appeal Helpline'}
          </h3>
          <p className="text-xs text-driftwood leading-relaxed">
            {lang === 'hi' 
              ? 'किसी सदस्य के आकस्मिक निधन अथवा दुर्घटना की दशा में 24 घंटे के भीतर सूचना दर्ज कराने हेतु:'
              : 'To report untimely demise or emergency event within 24 hours:'}
          </p>
          <div className="pt-1">
            <a
              href="tel:+919415000001"
              className="text-base font-bold font-mono text-terracotta hover:underline block"
            >
              +91 94150 00001
            </a>
            <span className="text-[11px] text-driftwood font-medium">{lang === 'hi' ? 'प्रातः 8:00 से रात्रि 10:00 बजे तक' : '8:00 AM to 10:00 PM IST'}</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-border shadow-warm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sage-light text-sage flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-xl font-bold text-charcoal">
            {lang === 'hi' ? 'व्हाट्सएप सहायता प्रकोष्ठ' : 'WhatsApp Support Desk'}
          </h3>
          <p className="text-xs text-driftwood leading-relaxed">
            {lang === 'hi'
              ? 'UTR सत्यापन, रसीद अपलोड त्रुटि या तकनीकी सहायता हेतु व्हाट्सएप पर संदेश भेजें:'
              : 'For UTR matching, receipt issues, or technical queries, message on WhatsApp:'}
          </p>
          <div className="pt-1">
            <a
              href="https://wa.me/919450123456"
              target="_blank"
              rel="noreferrer"
              className="text-base font-bold font-mono text-sage hover:underline flex items-center gap-1.5"
            >
              <span>+91 94501 23456</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span className="text-[11px] text-driftwood font-medium">{lang === 'hi' ? 'स्वचालित त्वरित प्रतिक्रिया डेस्क' : 'Automated Fast Response Cell'}</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-border shadow-warm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-canvas-inset border border-stone-border text-charcoal flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-xl font-bold text-charcoal">
            {lang === 'hi' ? 'केंद्रीय समन्वय सचिवालय' : 'Central Coordination Cell'}
          </h3>
          <p className="text-xs text-driftwood leading-relaxed">
            {lang === 'hi' ? 'डीपीएसडब्ल्यूटी उत्तर प्रदेश केंद्रीय कार्यकारिणी कार्यालय:' : 'DPSWT Uttar Pradesh Executive Headquarters:'}
          </p>
          <div className="pt-1 text-xs text-driftwood">
            <div className="font-semibold text-charcoal">{lang === 'hi' ? 'सिविल लाइंस, लखनऊ / प्रयागराज' : 'Civil Lines, Lucknow / Prayagraj'}</div>
            <div>{lang === 'hi' ? 'पिन कोड: 211001 / 226001 (उ.प्र.)' : 'PIN: 211001 / 226001 (UP)'}</div>
            <div className="text-[11px] font-mono text-terracotta mt-0.5">headquarters@dpswt.org</div>
          </div>
        </div>

      </div>

      {/* Searchable District Coordinators Directory */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal">
              {lang === 'hi' ? 'जनपदवार नोडल अधिकारी निर्देशिका' : 'District Nodal Officer Directory'}
            </h2>
            <p className="text-xs text-driftwood mt-0.5">
              {lang === 'hi' ? 'अपने जनपद के अधिकृत सत्यापन अधिकारी अथवा समन्वयक का विवरण देखें' : 'View verified coordinators and inspectors in your district'}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-driftwood absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchDistrictPlaceholder}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-border bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20"
            />
          </div>
        </div>

        {/* Directory Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCoordinators.map((coord) => (
            <div
              key={coord.id}
              className={`p-5 rounded-2xl bg-white border shadow-warm space-y-3 hover:border-terracotta/40 transition-colors ${
                coord.is_state_nodal ? 'border-terracotta/50 ring-1 ring-terracotta/20' : 'border-stone-border'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-mono font-semibold text-terracotta">
                    {coord.district}
                  </div>
                  <h3 className="font-editorial text-lg font-bold text-charcoal mt-0.5">
                    {coord.name}
                  </h3>
                  <div className="text-[11px] text-driftwood font-medium">
                    {coord.designation}
                  </div>
                </div>

                {coord.is_state_nodal && (
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-terracotta-light text-terracotta uppercase">
                    State Head
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-stone-border/70 space-y-1.5 text-xs text-driftwood font-mono">
                <div className="flex items-center justify-between">
                  <span>{lang === 'hi' ? 'मंडल:' : 'Division:'}</span>
                  <span className="font-sans text-charcoal">{coord.division}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{lang === 'hi' ? 'दूरभाष:' : 'Phone:'}</span>
                  <a href={`tel:${coord.phone}`} className="text-charcoal font-bold hover:underline">
                    {coord.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span>{lang === 'hi' ? 'ईमेल:' : 'Email:'}</span>
                  <span className="text-driftwood text-[11px]">{coord.email}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <a
                  href={`tel:${coord.phone}`}
                  className="flex-1 py-2 rounded-xl bg-canvas-inset hover:bg-canvas-card border border-stone-border text-center text-xs font-semibold text-charcoal flex items-center justify-center gap-1.5 touch-target"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-terracotta" />
                  <span>{lang === 'hi' ? 'कॉल करें' : 'Call'}</span>
                </a>
                <a
                  href={`https://wa.me/91${coord.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 rounded-xl bg-sage-light hover:bg-sage/20 text-sage border border-sage/20 text-center text-xs font-semibold flex items-center justify-center gap-1.5 touch-target"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'व्हाट्सएप' : 'WhatsApp'}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grievance / Inquiry Submission Form */}
      <div className="rounded-3xl bg-white border border-stone-border p-6 sm:p-10 shadow-warm">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-terracotta">
              {lang === 'hi' ? 'शिकायत एवं समाधान' : 'Grievance & Redressal'}
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal">
              {t.grievanceTitle}
            </h2>
            <p className="text-xs text-driftwood">
              {t.grievanceSub}
            </p>
          </div>

          {submittedGrievance ? (
            <div className="p-6 bg-sage-light rounded-2xl border border-sage/30 text-center space-y-2">
              <ShieldCheck className="w-10 h-10 text-sage mx-auto" />
              <div className="font-editorial text-lg font-bold text-charcoal">
                {lang === 'hi' ? 'आपका संदेश सफलतापूर्वक दर्ज हो गया है!' : 'Your message has been submitted successfully!'}
              </div>
              <p className="text-xs text-driftwood">
                {lang === 'hi'
                  ? `शिकायत संदर्भ संख्या GRV-${Date.now().toString().slice(-6)}। केंद्रीय दल 24 घंटे के भीतर आपसे संपर्क करेगा।`
                  : `Grievance Reference GRV-${Date.now().toString().slice(-6)}. District support team will contact you within 24 hours.`}
              </p>
              <button
                type="button"
                onClick={() => setSubmittedGrievance(false)}
                className="mt-3 px-4 py-2 rounded-xl bg-white text-xs font-semibold text-charcoal border border-stone-border"
              >
                {lang === 'hi' ? 'नया संदेश भेजें' : 'Send Another Message'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleGrievanceSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    {lang === 'hi' ? 'पूरा नाम *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'hi' ? 'श्री रमेश वर्मा' : 'Ramesh Verma'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border bg-canvas-inset focus:bg-white text-xs text-charcoal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    {lang === 'hi' ? 'सदस्यता क्रमांक (यदि सदस्य हैं)' : 'Membership ID (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder="DPSWT-UP-9042"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border bg-canvas-inset focus:bg-white text-xs text-charcoal focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    {lang === 'hi' ? 'मोबाइल नंबर *' : 'Mobile Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border bg-canvas-inset focus:bg-white text-xs text-charcoal focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    {lang === 'hi' ? 'जनपद (District) *' : 'District *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'hi' ? 'प्रयागराज / लखनऊ' : 'Prayagraj / Lucknow'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border bg-canvas-inset focus:bg-white text-xs text-charcoal focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  {lang === 'hi' ? 'समस्या या संदेश का विवरण *' : 'Message / Grievance Description *'}
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={lang === 'hi' 
                    ? 'अपनी समस्या, अपील संदर्भ अथवा प्रश्न का संक्षिप्त विवरण लिखें...'
                    : 'Describe your issue, appeal code, or question in detail...'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border bg-canvas-inset focus:bg-white text-xs text-charcoal focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-xs shadow-warm transition-transform active:scale-[0.98] flex items-center justify-center gap-2 touch-target"
              >
                <Send className="w-4 h-4" />
                <span>{t.sendMessageAction}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
