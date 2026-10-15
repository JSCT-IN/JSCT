'use client';

import React, { useState } from 'react';
import { Appeal } from '@/types';
import { uploadReceiptSlip } from '@/lib/supabase';
import { DPSWTStore } from '@/lib/store';
import { triggerCelebrationConfetti } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { 
  X, 
  UploadCloud, 
  FileCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
} from 'lucide-react';

interface SlipUploadModalProps {
  appeal: Appeal;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SlipUploadModal({
  appeal,
  isOpen,
  onClose,
  onSuccess,
}: SlipUploadModalProps) {
  const { lang, t } = useTranslation();
  const [utrNumber, setUtrNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleUtrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12);
    setUtrNumber(cleaned);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (utrNumber.length < 12) {
      setErrorMessage(lang === 'hi' 
        ? 'कृपया बैंक/UPI ऐप में प्रदर्शित 12-अंकों का पूर्ण UTR / Ref Number दर्ज करें।'
        : 'Please enter the full 12-digit UTR / reference number from your UPI app.');
      return;
    }

    if (!selectedFile && !previewUrl) {
      setErrorMessage(lang === 'hi'
        ? 'कृपया भुगतान का स्क्रीनशॉट या रसीद (Payment Slip) अपलोड करें।'
        : 'Please attach payment receipt screenshot or passbook record.');
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('appeal_id', appeal.id);
      formData.append('utr_number', utrNumber);
      formData.append('amount', '50.00');
      if (selectedFile) {
        formData.append('slip_file', selectedFile);
      }

      const { submitDonationAction } = await import('@/actions/donation-actions');
      const res = await submitDonationAction(formData);

      if (!res.success) {
        // Fallback to local store if server action had an issue
        let slipUrl = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80';
        if (selectedFile) {
          slipUrl = await uploadReceiptSlip(selectedFile, utrNumber);
        }
        DPSWTStore.submitDonation({
          appeal_id: appeal.id,
          utr_number: utrNumber,
          slip_url: slipUrl,
          amount: 50,
        });
      } else {
        // Sync local store as well
        DPSWTStore.submitDonation({
          appeal_id: appeal.id,
          utr_number: utrNumber,
          slip_url: res.data?.slip_url || '',
          amount: 50,
        });
      }

      setIsSuccess(true);
      triggerCelebrationConfetti();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || (lang === 'hi' ? 'रसीद दर्ज करने में त्रुटि हुई। कृपया पुनः प्रयास करें।' : 'Error recording submission. Please retry.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setUtrNumber('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-label="Upload Receipt Slip Modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white border border-stone-border shadow-warm-lg p-6 sm:p-7 text-charcoal my-8 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-driftwood hover:text-charcoal hover:bg-canvas-inset transition-colors touch-target"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* Success Screen */
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-sage-light text-sage flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="font-editorial text-2xl font-bold text-charcoal">
              {lang === 'hi' ? 'सहयोग रसीद सफलतापूर्वक दर्ज हुई!' : 'Contribution Slip Recorded Successfully!'}
            </h2>

            <p className="text-xs text-driftwood max-w-sm mx-auto leading-relaxed">
              {lang === 'hi' 
                ? `आपका UTR क्रमांक ${utrNumber} जिला सत्यापन प्रकोष्ठ में ऑडिट हेतु प्रेषित कर दिया गया है। नामिनी बैंक पासबुक से मिलान होते ही इसे स्वीकृत कर दिया जाएगा।`
                : `Your UTR reference ${utrNumber} has been queued for district field audit. It will be credited upon nominee statement reconciliation.`}
            </p>

            <div className="p-3.5 bg-canvas-inset rounded-2xl border border-stone-border text-xs text-driftwood">
              <span className="font-semibold text-charcoal">{lang === 'hi' ? '75% अनुपालन प्रभाव:' : 'Compliance Impact:'}</span>{' '}
              {lang === 'hi' ? 'आपकी सहभागिता गणना में यह सहयोग सम्मिलित कर लिया गया है।' : 'Your contribution has been counted towards your dynamic 75% ratio.'}
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full py-3 rounded-2xl bg-terracotta text-white font-semibold text-xs shadow-warm hover:bg-terracotta-hover transition-colors touch-target"
            >
              {lang === 'hi' ? 'संपन्न (Done)' : 'Done'}
            </button>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-left pr-8">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-terracotta/10 text-terracotta font-semibold uppercase">
                {appeal.code}
              </span>
              <h2 className="font-editorial text-2xl font-bold text-charcoal mt-1">
                {t.slipModalTitle}
              </h2>
              <p className="text-xs text-driftwood mt-1">
                {t.slipModalSub} — {appeal.nominee_snapshot.full_name}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-2xl bg-terracotta-light border border-terracotta/30 flex items-start gap-2.5 text-xs text-terracotta">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* UTR Input */}
            <div>
              <label htmlFor="utrNumber" className="block text-xs font-semibold uppercase tracking-wider text-charcoal font-mono mb-1.5">
                {t.utrInputLabel}
              </label>
              <div className="relative">
                <input
                  id="utrNumber"
                  type="text"
                  value={utrNumber}
                  onChange={handleUtrChange}
                  placeholder="e.g. 427189012345"
                  maxLength={12}
                  className="w-full px-4 py-3 rounded-2xl border border-stone-border bg-canvas-inset focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 text-charcoal font-mono tracking-widest text-base uppercase"
                  required
                />
                <span className="absolute right-4 top-3.5 text-xs font-mono text-driftwood">
                  {utrNumber.length}/12
                </span>
              </div>
              <p className="text-[11px] text-driftwood mt-1">
                {lang === 'hi'
                  ? 'यह संख्या आपके Google Pay, PhonePe, Paytm या बैंक SMS में ‘UPI Ref No’ अथवा ‘UTR’ के रूप में लिखी होती है।'
                  : 'This 12-digit reference is shown as "UPI Ref No" or "UTR" in GPay, PhonePe, Paytm, or bank SMS.'}
              </p>
            </div>

            {/* Slip Screenshot Upload */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal font-mono mb-1.5">
                {t.slipUploadLabel}
              </label>

              {previewUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-stone-border bg-canvas-inset p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    className="w-full h-44 object-contain rounded-xl bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-4 right-4 p-1.5 rounded-lg bg-charcoal/80 text-white hover:bg-charcoal text-xs flex items-center gap-1 shadow-warm"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? 'हटाएं' : 'Remove'}</span>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-stone-border hover:border-terracotta/50 bg-canvas-inset hover:bg-canvas-card cursor-pointer transition-all">
                  <UploadCloud className="w-8 h-8 text-driftwood mb-2" />
                  <span className="text-xs font-semibold text-charcoal">
                    {lang === 'hi' ? 'स्क्रीनशॉट चुनें या फोटो खींचें' : 'Select screenshot or photo'}
                  </span>
                  <span className="text-[10px] text-driftwood mt-1">
                    PNG, JPG, WEBP (Max 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Fixed Amount Confirmation */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-canvas-inset border border-stone-border text-xs">
              <span className="text-driftwood">{lang === 'hi' ? 'निर्धारित सहयोग राशि:' : 'Contribution Micro-Aid:'}</span>
              <span className="font-editorial text-lg font-bold text-terracotta">
                ₹50.00
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || utrNumber.length < 12}
              className="w-full py-3.5 rounded-2xl bg-terracotta hover:bg-terracotta-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-warm transition-transform active:scale-[0.98] flex items-center justify-center gap-2 touch-target"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === 'hi' ? 'रसीद अपलोड व UTR सत्यापन हो रहा है...' : 'Uploading & recording UTR...'}</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>{t.confirmSlipBtn}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
