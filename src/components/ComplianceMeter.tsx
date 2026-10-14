'use client';

import React from 'react';
import { ComplianceData } from '@/types';
import { useTranslation } from '@/lib/i18n';
import { ShieldCheck, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface ComplianceMeterProps {
  compliance: ComplianceData;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export default function ComplianceMeter({
  compliance,
  showDetails = true,
}: ComplianceMeterProps) {
  const { lang, t } = useTranslation();
  const { ratio, is_eligible, total_appeals, contributed_appeals, fee_valid, days_until_renewal } =
    compliance;

  const isSafe = ratio >= 75;
  const strokeColor = isSafe ? '#437A5B' : '#C85A32';

  // SVG circular gauge math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(ratio, 100) / 100) * circumference;

  return (
    <div className="rounded-2xl border border-stone-border bg-white p-5 shadow-warm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Radial Gauge & Ratio Display */}
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-stone-border/70"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Animated value arc */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={strokeColor}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Percentage Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-editorial text-2xl font-bold text-charcoal leading-none">
                {ratio}%
              </span>
              <span className="text-[10px] text-driftwood font-medium uppercase tracking-wider mt-0.5">
                {lang === 'hi' ? 'सहभागिता' : 'RATIO'}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  is_eligible
                    ? 'bg-sage-light text-sage'
                    : 'bg-terracotta-light text-terracotta'
                }`}
              >
                {is_eligible ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t.eligibleBadge}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{t.criticalBadge}</span>
                  </>
                )}
              </span>
            </div>

            <h3 className="font-editorial text-lg font-bold text-charcoal mt-1">
              {t.complianceMeterTitle}
            </h3>

            <p className="text-xs text-driftwood mt-0.5">
              {lang === 'hi' 
                ? `कुल ${total_appeals} अपीलों में से आपने ${contributed_appeals} अपीलों में ₹50 सहयोग प्रेषित किया है।`
                : `You contributed ₹50 to ${contributed_appeals} out of ${total_appeals} total issued community appeals.`}
            </p>
          </div>
        </div>

        {/* Annual Fee Badge */}
        <div className="w-full sm:w-auto p-3 rounded-xl bg-canvas-inset border border-stone-border/80 flex sm:flex-col justify-between sm:items-end text-xs">
          <span className="text-driftwood font-medium">{t.annualRenewalLabel}</span>
          <div className="flex items-center gap-1.5 font-mono">
            {fee_valid ? (
              <span className="text-sage font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {lang === 'hi' ? `वैध (${days_until_renewal} दिन शेष)` : `Active (${days_until_renewal} ${t.daysRemaining})`}
              </span>
            ) : (
              <span className="text-terracotta font-bold">{lang === 'hi' ? 'नवीनीकरण आवश्यक (₹50)' : 'Renewal Due (₹50)'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar & Contextual Message */}
      {showDetails && (
        <div className="mt-5 pt-4 border-t border-stone-border/70 space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-driftwood mb-1.5 font-medium">
              <span>{lang === 'hi' ? 'वर्तमान अनुपालन अनुपात' : 'Current Compliance Rate'}</span>
              <span>{lang === 'hi' ? 'न्यूनतम आवश्यक: 75%' : 'Minimum Required: 75%'}</span>
            </div>
            <div className="w-full h-2.5 bg-canvas-inset rounded-full overflow-hidden p-0.5 border border-stone-border/60">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isSafe ? 'bg-sage' : 'bg-terracotta'
                }`}
                style={{ width: `${Math.min(ratio, 100)}%` }}
              />
            </div>
          </div>

          {/* Educational Notice */}
          <div className="flex items-start gap-2 text-xs text-driftwood bg-canvas-inset p-3 rounded-xl border border-stone-border/60">
            <Info className="w-4 h-4 text-driftwood shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              {isSafe ? (
                <span>
                  <strong>{lang === 'hi' ? 'उत्कृष्ट योगदान!' : 'Compliant Standing!'}</strong>{' '}
                  {lang === 'hi'
                    ? 'आपका सहभागिता अनुपात 75% से ऊपर है। आकस्मिक दुर्घटना अथवा निधन की दशा में आपका परिवार DPSWT ₹15 लाख तक के पूर्ण सामूहिक संबल का स्वतः अधिकारी रहेगा।'
                    : 'Your participation is above 75%. In the event of an emergency bereavement, your family is guaranteed full community relief up to ₹15 Lakhs.'}
                </span>
              ) : (
                <span className="text-charcoal font-medium">
                  <strong>{lang === 'hi' ? 'चेतावनी:' : 'Notice:'}</strong>{' '}
                  {lang === 'hi'
                    ? 'आपका सहभागिता अनुपात 75% से कम है। परिवार की पात्रता सुरक्षित रखने हेतु कृपया तत्काल शेष सक्रिय अपीलों में ₹50 सहयोग प्रेषित करें।'
                    : 'Your ratio is below the 75% threshold. Please contribute ₹50 to pending active appeals to restore full family eligibility.'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
