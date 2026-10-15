'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeartHandshake, ShieldCheck, PhoneCall, Mail, MapPin, ExternalLink } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function Footer() {
  const pathname = usePathname();
  const { lang, t } = useTranslation();

  if (
    pathname.startsWith('/console-secure-admin') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dashboard') ||
    pathname === '/login'
  ) {
    return null;
  }

  return (
    <footer className="bg-canvas-inset border-t border-stone-border text-charcoal pt-14 pb-24 sm:pb-14 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          
          {/* Brand & Mission Statement */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta to-terracotta-hover flex items-center justify-center text-white shadow-warm shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <span className="font-editorial text-2xl font-bold tracking-tight text-charcoal">
                  JSCT
                </span>
                <span className="block text-[11px] text-driftwood font-medium">
                  Jan Sewa Charitable Trust (जन सेवा चैरिटेबल ट्रस्ट)
                </span>
              </div>
            </div>

            <p className="font-editorial text-base sm:text-lg text-charcoal italic leading-relaxed">
              &ldquo;{t.heroTagline.replace(/“|”/g, '')}&rdquo;
            </p>

            <p className="text-xs text-driftwood leading-relaxed">
              {t.footerMission}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sage/10 text-sage font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero-Custody P2P Model</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-white border border-stone-border text-charcoal font-mono">
                {t.annualRenewalBadge}
              </div>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted mb-4 font-mono">
              {t.quickLinksHeading}
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/appeals" className="text-driftwood hover:text-terracotta transition-colors">
                  {t.appealsHeader}
                </Link>
              </li>
              <li>
                <Link href="/niyamawali" className="text-driftwood hover:text-terracotta transition-colors">
                  {lang === 'hi' ? 'संस्था नियमावली (Bylaws)' : 'Rules & Bylaws'}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-driftwood hover:text-terracotta transition-colors">
                  {t.dashboard}
                </Link>
              </li>
              <li>
                <Link href="/member-card" className="text-driftwood hover:text-terracotta transition-colors">
                  {lang === 'hi' ? 'पहचान पत्र (ID Card)' : 'Identity Card'}
                </Link>
              </li>
              <li>
                <Link href="/appeals/create" className="text-driftwood hover:text-terracotta transition-colors">
                  {t.createAppealTitle}
                </Link>
              </li>
            </ul>
          </div>

          {/* Guidelines & Compliance */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted mb-4 font-mono">
              {t.complianceCheckHeading}
            </h3>
            <ul className="space-y-2.5 text-xs text-driftwood">
              <li className="flex items-start gap-1.5">
                <span className="text-terracotta font-bold">•</span>
                <span>{lang === 'hi' ? 'न्यूनतम 75% अपील में ₹50 सहयोग अनिवार्य' : 'Minimum 75% contribution rate required'}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-terracotta font-bold">•</span>
                <span>{lang === 'hi' ? '6 माह का लॉकिंग पीरियड पूर्ण होना आवश्यक' : '6-month initial membership lock-in period'}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-terracotta font-bold">•</span>
                <span>{lang === 'hi' ? '12-अंक UTR व बैंक रसीद अपलोड अनिवार्य' : '12-digit UTR and receipt slip submission'}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-terracotta font-bold">•</span>
                <span>{lang === 'hi' ? 'जिला सत्यापन अधिकारी द्वारा भौतिक मिलान' : 'Physical field audit verification by inspectors'}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-terracotta font-bold">•</span>
                <span>{lang === 'hi' ? '₹50 वार्षिक नवीनीकरण सदस्यता शुल्क' : '₹50 annual membership renewal cycle'}</span>
              </li>
            </ul>
          </div>

          {/* Helpdesk & Coordinators */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted mb-4 font-mono">
              {t.helplineHeading}
            </h3>
            <div className="space-y-3 text-xs text-driftwood">
              <div className="flex items-start gap-2">
                <PhoneCall className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-charcoal font-mono">+91 9264945875 / +91 9936639215</div>
                  <div className="text-[11px]">{lang === 'hi' ? 'प्रातः 9:00 से सायं 7:00 बजे तक' : '9:00 AM to 7:00 PM IST'}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-charcoal font-mono">info@jsct.org.in</div>
                  <div className="text-[11px]">{lang === 'hi' ? 'तकनीकी व UTR समाधान हेतु' : 'Technical & UTR Resolution'}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  {lang === 'hi' 
                    ? 'मुख्यालय: हरपुर पोस्ट लुहासी, जनपद गोरखपुर, उत्तर प्रदेश 273152' 
                    : 'HQ: Harpur Post Luhasi, District Gorakhpur, UP 273152'}
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-terracotta font-semibold hover:underline"
                >
                  <span>{t.allCoordinatorsLink}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Zero-Custody Disclaimer Box */}
        <div className="p-4 rounded-2xl bg-white border border-stone-border text-[11px] text-driftwood leading-relaxed mb-8">
          <strong className="text-charcoal block mb-1">
            {t.legalNoticeHeading}
          </strong>
          {t.legalNoticeBody}
        </div>

        {/* Bottom copyright row */}
        <div className="pt-6 border-t border-stone-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-driftwood">
          <div>
            © {new Date().getFullYear()} {t.copyright}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/rules" className="hover:text-charcoal transition-colors">
              {t.privacyPolicy}
            </Link>
            <span>•</span>
            <Link href="/rules" className="hover:text-charcoal transition-colors">
              {t.termsConditions}
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-charcoal transition-colors">
              {t.grievanceCell}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
