'use client';

import React, { useState, useEffect } from 'react';
import { Appeal } from '@/types';
import { generateUpiLink, generateUpiQrCode } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { 
  X, 
  Copy, 
  Check, 
  Smartphone, 
  ArrowRight, 
  ShieldCheck, 
  ExternalLink
} from 'lucide-react';

interface UpiModalProps {
  appeal: Appeal;
  isOpen: boolean;
  onClose: () => void;
  onOpenSlipUpload: () => void;
}

export default function UpiModal({
  appeal,
  isOpen,
  onClose,
  onOpenSlipUpload,
}: UpiModalProps) {
  const { lang, t } = useTranslation();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showQr, setShowQr] = useState<boolean>(true);

  const nominee = appeal.nominee_snapshot;
  const cleanNomineeName = nominee.full_name.replace(/\(.*?\)/g, '').trim();
  const upiLink = generateUpiLink({
    upiId: nominee.upi_id,
    nomineeName: nominee.full_name,
    amount: 50,
    note: `DPSWT ${appeal.code}`,
  });

  useEffect(() => {
    if (isOpen) {
      generateUpiQrCode(upiLink).then((url) => setQrCodeDataUrl(url));
    }
  }, [isOpen, upiLink]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-label="Direct UPI Modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
    >
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-white border border-stone-border shadow-warm-lg p-5 sm:p-7 text-charcoal my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-driftwood hover:text-charcoal hover:bg-canvas-inset transition-colors touch-target"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-left pr-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-terracotta/10 text-terracotta font-semibold uppercase">
              {appeal.code}
            </span>
            <span className="text-xs text-sage font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {lang === 'hi' ? 'सत्यापित नामिनी खाता' : 'Verified Nominee'}
            </span>
          </div>

          <h2 className="font-editorial text-xl sm:text-2xl font-bold text-charcoal">
            {t.upiModalTitle}
          </h2>
          <p className="text-xs text-driftwood mt-0.5">
            {cleanNomineeName} ({nominee.relationship}) — {t.upiModalSub}
          </p>
        </div>

        {/* Zero Custody Trust Banner */}
        <div className="mt-3.5 p-3 rounded-2xl bg-canvas-inset border border-stone-border flex items-start gap-2.5 text-xs text-driftwood">
          <ShieldCheck className="w-4 h-4 text-sage shrink-0 mt-0.5" />
          <div>
            <strong className="text-charcoal">Zero-Custody P2P:</strong>{' '}
            {lang === 'hi' 
              ? 'यह राशि किसी वॉलेट में नहीं जाती। सीधे शोकाकुल परिवार के बैंक खाते में जमा होती है।'
              : 'Direct peer-to-peer transfer. Funds credit directly into the nominee account without intermediary wallet.'}
          </div>
        </div>

        {/* Native Mobile UPI Action Button */}
        <div className="mt-4 space-y-2.5">
          <a
            href={upiLink}
            className="w-full flex items-center justify-center gap-2.5 py-3 sm:py-3.5 px-4 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-xs sm:text-sm shadow-warm transition-transform active:scale-[0.98] touch-target"
          >
            <Smartphone className="w-4 h-4" />
            <span>{t.mobileUpiTitle} (PhonePe / GPay / Paytm)</span>
            <ExternalLink className="w-4 h-4 opacity-75" />
          </a>

          <p className="text-center text-[10px] sm:text-[11px] text-driftwood">
            {lang === 'hi'
              ? '(मोबाइल फोन पर ऊपर दिए गए बटन को दबाकर सीधे UPI ऐप से ₹50 भेजें)'
              : '(On mobile, tap the button above to launch your installed UPI app directly)'}
          </p>
        </div>

        {/* QR Code and Direct Bank Details Tabs */}
        <div className="mt-5 pt-4 border-t border-stone-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted font-mono">
              {showQr ? t.scanQrTitle : t.nomineeAccountTitle}
            </span>
            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              className="text-xs text-terracotta font-medium hover:underline flex items-center gap-1"
            >
              {showQr 
                ? (lang === 'hi' ? 'बैंक खाता विवरण देखें' : 'View Bank Details') 
                : (lang === 'hi' ? 'QR कोड देखें' : 'View QR Code')}
            </button>
          </div>

          {showQr ? (
            <div className="flex flex-col items-center justify-center p-3 bg-canvas-inset rounded-2xl border border-stone-border">
              {qrCodeDataUrl ? (
                <div className="p-2.5 bg-white rounded-xl shadow-warm border border-stone-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeDataUrl}
                    alt="UPI Payment QR Code"
                    className="w-36 h-36 sm:w-48 sm:h-48 object-contain"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-driftwood text-xs">
                  {lang === 'hi' ? 'QR कोड तैयार हो रहा है...' : 'Generating QR code...'}
                </div>
              )}
              
              <div className="mt-3 text-center">
                <div className="text-xs font-mono font-semibold text-charcoal">
                  UPI ID: {nominee.upi_id}
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(nominee.upi_id, 'upi')}
                  className="mt-1 text-[11px] text-terracotta hover:underline inline-flex items-center gap-1"
                >
                  {copiedField === 'upi' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedField === 'upi' ? t.copiedText : t.copyText}
                </button>
              </div>
            </div>
          ) : (
            /* Explicit Bank Details Card */
            <div className="space-y-2.5 p-4 bg-canvas-inset rounded-2xl border border-stone-border text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-stone-border/60">
                <span className="text-driftwood">{t.nomineeNameLabel}</span>
                <span className="font-semibold text-charcoal">{nominee.full_name}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-stone-border/60">
                <span className="text-driftwood">{t.bankNameLabel}</span>
                <span className="font-semibold text-charcoal">{nominee.bank_name}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-stone-border/60">
                <span className="text-driftwood">{t.accountNumberLabel}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-charcoal">{nominee.account_number}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(nominee.account_number, 'acc')}
                    className="p-1 text-driftwood hover:text-terracotta"
                    title={t.copyText}
                  >
                    {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-sage" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-driftwood">{t.ifscLabel}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-charcoal">{nominee.ifsc_code}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(nominee.ifsc_code, 'ifsc')}
                    className="p-1 text-driftwood hover:text-terracotta"
                    title={t.copyText}
                  >
                    {copiedField === 'ifsc' ? <Check className="w-3.5 h-3.5 text-sage" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Next Action Step: Upload Slip */}
        <div className="mt-6 pt-5 border-t border-stone-border">
          <div className="text-xs text-driftwood mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-charcoal text-white text-[10px] flex items-center justify-center font-bold">
              2
            </span>
            <span>{lang === 'hi' ? 'भुगतान पूर्ण होने के बाद 12-अंक UTR संख्या व रसीद अपलोड करें:' : 'After payment, enter 12-digit UTR and upload receipt:'}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSlipUpload();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-canvas-inset hover:bg-canvas-card border border-stone-border font-semibold text-xs text-charcoal shadow-warm transition-all touch-target"
          >
            <span>{t.alreadyPaidBtn}</span>
            <ArrowRight className="w-4 h-4 text-terracotta" />
          </button>
        </div>
      </div>
    </div>
  );
}
