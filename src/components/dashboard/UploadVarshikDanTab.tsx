'use client';

import React, { useState } from 'react';
import { Member } from '@/types';
import { uploadVarshikDanAction } from '@/actions/member-actions';
import { DPSWTStore } from '@/lib/store';
import {
  Upload,
  QrCode,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Building,
  CreditCard,
  Calendar,
  FileText,
  Loader2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface UploadVarshikDanTabProps {
  member: Member;
  onSuccess: () => void;
}

export default function UploadVarshikDanTab({ member, onSuccess }: UploadVarshikDanTabProps) {
  const { lang } = useTranslation();

  const [amount, setAmount] = useState('50');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionId, setTransactionId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const upiId = 'jsct.trust@sbi';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        alert('फ़ाइल का आकार अधिकतम 5MB होना चाहिए।');
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

    const cleanUtr = transactionId.trim();
    if (!cleanUtr || cleanUtr.length < 8) {
      setFeedback({
        success: false,
        message: 'कृपया वैध बैंक Transaction ID / UTR क्रमांक (न्यूनतम 8 अंक) दर्ज करें।',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('member_id', member.id);
      formData.append('utr_number', cleanUtr);
      formData.append('amount', amount);
      formData.append('payment_date', date);
      if (file) formData.append('slip_file', file);

      const res = await uploadVarshikDanAction(formData);

      // Record in local client store
      DPSWTStore.addVarshikDan(member.id, {
        amount: parseFloat(amount) || 50,
        utr_number: cleanUtr,
        payment_date: date,
        slip_url: filePreview || undefined,
      });

      setFeedback({
        success: true,
        message: res.message || 'वार्षिक दान / व्यवस्था शुल्क रसीद सफलतापूर्वक दर्ज हो गई है!',
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setFeedback({
        success: false,
        message: err.message || 'रसीद अपलोड प्रक्रिया में अप्रत्याशित समस्या आई।',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      
      {/* Page Title & Explanation */}
      <div className="border-b border-stone-border/80 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-charcoal tracking-tight font-editorial">
          वार्षिक दान / व्यवस्था शुल्क (Upload Varshik Dan/Renewal)
        </h2>
        <p className="text-xs text-driftwood mt-1">
          वार्षिक व्यवस्था शुल्क मात्र <strong className="text-terracotta">₹50 प्रति वर्ष</strong> है, जो संस्था के तकनीकी रखरखाव, सर्वर संचालन एवं पारदर्शी रिकॉर्ड प्रबंधन हेतु अनिवार्य है।
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-border/80 shadow-warm p-6 sm:p-8 space-y-8">
        
        {/* SCAN & PAY Box Matching Screenshot 4 */}
        <div className="rounded-2xl border-2 border-dashed border-stone-border p-6 flex flex-col items-center text-center space-y-4 bg-canvas-inset/30">
          <span className="text-sm font-black uppercase tracking-wider text-charcoal">
            SCAN & PAY
          </span>

          {/* QR Code Graphic with UPI ID */}
          <div className="p-3 bg-white rounded-2xl shadow-md border border-stone-border/80">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${upiId}%26pn=JAN%20SEVA%20CHARITABLE%20TRUST%26am=50%26cu=INR`}
              alt="JSCT QR Code"
              className="w-40 h-40 object-contain mx-auto"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-mono font-bold text-charcoal">
                UPI ID: {upiId}
              </span>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="p-1 rounded-md hover:bg-white text-driftwood hover:text-charcoal transition-colors"
                title="कॉपी करें"
              >
                {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-driftwood">
              Google Pay, PhonePe, Paytm अथवा किसी भी UPI ऐप से स्कैन करके ₹50 का भुगतान करें।
            </p>
          </div>
        </div>

        {/* Bank Details Display Matching Screenshot 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          <div className="space-y-1">
            <label className="font-bold text-charcoal flex items-center gap-1">
              <span>Account Holder Name</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              readOnly
              value="JAN SEVA CHARITABLE TRUST"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border/80 bg-canvas-inset/60 text-charcoal font-semibold cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-charcoal flex items-center gap-1">
              <span>Account No</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              readOnly
              value="44404849629"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border/80 bg-canvas-inset/60 text-charcoal font-mono font-bold cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-charcoal flex items-center gap-1">
              <span>IFSC CODE</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              readOnly
              value="SBIN0001147"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border/80 bg-canvas-inset/60 text-charcoal font-mono font-bold cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-charcoal flex items-center gap-1">
              <span>Branch</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              readOnly
              value="MAHARAJGANJ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border/80 bg-canvas-inset/60 text-charcoal font-semibold cursor-not-allowed"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="font-bold text-charcoal flex items-center gap-1">
              <span>Bank</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              readOnly
              value="SBI MAHARAJGANJ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border/80 bg-canvas-inset/60 text-charcoal font-semibold cursor-not-allowed"
            />
          </div>

        </div>

        {/* Upload Form Matching Screenshot 4 */}
        <form onSubmit={handleSubmit} className="border-t border-stone-border/80 pt-6 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Upload Receipt */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal flex items-center gap-1">
                <span>Upload Receipt (भुगतान रसीद स्क्रीनशॉट)</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="border border-stone-border rounded-xl p-2 bg-white flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="w-full text-xs text-driftwood file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-charcoal hover:file:bg-stone-200 cursor-pointer"
                />
              </div>
              <span className="text-[10px] text-driftwood block">
                Maximum file size: 5MB (JPG, PNG, PDF)
              </span>

              {filePreview && (
                <div className="mt-2 w-24 h-24 rounded-xl border border-stone-border overflow-hidden">
                  <img src={filePreview} alt="Slip Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Enter Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal flex items-center gap-1">
                <span>Enter Amount</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm font-mono font-bold text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30"
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal flex items-center gap-1">
                <span>Date</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm font-mono text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30"
              />
            </div>

            {/* Transaction Id / UTR */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal flex items-center gap-1">
                <span>Transaction Id / UTR Number</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="12-अंकीय बैंक UTR नंबर दर्ज करें"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                maxLength={24}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm font-mono text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30"
              />
            </div>

          </div>

          {/* Feedback */}
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

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-8 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-sm font-bold shadow-warm active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>रसीद सत्यापित हो रही है...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>वार्षिक दान रसीद जमा करें (Submit)</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
