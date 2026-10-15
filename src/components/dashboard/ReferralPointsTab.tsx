'use client';

import React, { useState } from 'react';
import { Member } from '@/types';
import { requestReferralWithdrawalAction } from '@/actions/member-actions';
import { DPSWTStore } from '@/lib/store';
import {
  Share2,
  Copy,
  Check,
  Users,
  Coins,
  Wallet,
  Lock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  MessageCircle,
  X,
  Loader2
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface ReferralPointsTabProps {
  member: Member;
  onRefresh: () => void;
}

export default function ReferralPointsTab({ member, onRefresh }: ReferralPointsTabProps) {
  const { lang } = useTranslation();

  const referralCode = member.referral_code || member.membership_id || '4715480406';
  const referralCount = member.referral_count || 0;
  const totalEarned = member.referral_earnings !== undefined ? member.referral_earnings : referralCount * 5;
  const withdrawable = member.referral_withdrawable || 0;
  const lockedAmount = Math.max(0, totalEarned - withdrawable);

  // Target calculation: First ₹1000 milestone requires 200 referrals (200 * ₹5 = ₹1000)
  const targetReferrals = 200;
  const progressPercent = Math.min(100, Math.round((referralCount / targetReferrals) * 100));
  const remainingReferrals = Math.max(0, targetReferrals - referralCount);

  const [copied, setCopied] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawUpi, setWithdrawUpi] = useState(member.phone ? `${member.phone}@upi` : '');
  const [withdrawAmount, setWithdrawAmount] = useState('1000');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [withdrawFeedback, setWithdrawFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Copy referral code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Share referral code via WhatsApp or Web Share
  const handleShareCode = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://jsct.org.in';
    const registerUrl = `${origin}/register?ref=${referralCode}`;
    const text = `नमस्ते! जन सेवा चैरिटेबल ट्रस्ट (JSCT) के जन-कल्याण परिवार से जुड़ें और ₹15 लाख तक का पारदर्शी परस्पर सुरक्षा संबल प्राप्त करें।\n\nमेरा रेफरल कोड है: ${referralCode}\n\nपंजीकरण लिंक:\n${registerUrl}`;

    if (navigator.share) {
      navigator.share({
        title: 'JSCT Welfare - Jan Seva Charitable Trust',
        text: text,
        url: registerUrl,
      }).catch(() => {});
    } else {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');
    }
  };

  // Submit withdrawal request
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawUpi.trim()) {
      setWithdrawFeedback({ success: false, message: 'कृपया वैध यूपीआई आईडी दर्ज करें।' });
      return;
    }

    const amt = parseFloat(withdrawAmount) || 0;
    if (amt > withdrawable && withdrawable < 1000) {
      setWithdrawFeedback({
        success: false,
        message: 'न्यूनतम निकासी राशि ₹1000 है। आपके पास पर्याप्त निकासी योग्य शेष नहीं है।',
      });
      return;
    }

    setIsSubmittingWithdraw(true);
    setWithdrawFeedback(null);

    try {
      const res = await requestReferralWithdrawalAction(member.id, amt, withdrawUpi.trim());
      DPSWTStore.requestWithdrawal(member.id, amt, withdrawUpi.trim());
      setWithdrawFeedback({ success: true, message: res.message });
      setTimeout(() => {
        setWithdrawModalOpen(false);
        onRefresh();
      }, 1800);
    } catch (err: any) {
      setWithdrawFeedback({ success: false, message: err.message || 'निकासी में त्रुटि हुई।' });
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  const withdrawalHistory = member.withdrawal_history || [];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto animate-fade-in">
      
      {/* 1. Header Banner with Referral Code Matching Screenshot 5 */}
      <div className="rounded-3xl border border-stone-border/80 bg-white shadow-warm overflow-hidden p-6 sm:p-8 space-y-6">
        
        <div className="flex items-center gap-2 text-sm font-bold text-charcoal">
          <Share2 className="w-4 h-4 text-purple-600" />
          <span>मेरा रेफरल कोड (My Referral Code)</span>
        </div>

        {/* Big Purple Referral Code Box */}
        <div className="rounded-2xl bg-gradient-to-r from-[#5B4699] via-[#6B52B0] to-[#7D64C5] text-white p-6 sm:p-8 text-center shadow-md">
          <div className="font-mono text-3xl sm:text-4xl md:text-5xl font-black tracking-wider drop-shadow-sm select-all">
            {referralCode}
          </div>
        </div>

        {/* Action Buttons: Copy Code & Share Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={handleCopyCode}
            className="py-3 px-4 rounded-xl border border-stone-border/80 bg-white hover:bg-canvas-inset font-bold text-xs sm:text-sm text-charcoal shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-driftwood" />}
            <span>{copied ? 'कोड कॉपी हो गया!' : 'कोड कॉपी करें (Copy Code)'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareCode}
            className="py-3 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm shadow-warm active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4 text-amber-300" />
            <span>रेफरल कोड शेयर करें (Share Code)</span>
          </button>
        </div>

        {/* Info Tip Matching Screenshot 5 */}
        <div className="rounded-xl bg-sky-50 border border-sky-200/80 p-3 flex items-center gap-2.5 text-xs text-sky-900 font-medium">
          <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
          <span>Share your referral code and earn ₹5 for each successful registration!</span>
        </div>

      </div>

      {/* 2. 4 Metric Cards Matching Screenshot 5 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Referrals */}
        <div className="rounded-2xl border border-stone-border/80 bg-white p-5 shadow-xs space-y-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-driftwood block">कुल रेफरल</span>
          <span className="text-2xl sm:text-3xl font-black text-charcoal font-mono block">
            {referralCount}
          </span>
          <span className="text-[10px] text-driftwood">Total Referrals</span>
        </div>

        {/* Total Earned */}
        <div className="rounded-2xl border border-stone-border/80 bg-white p-5 shadow-xs space-y-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <Coins className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-driftwood block">कुल कमाई</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono block">
            ₹{totalEarned}
          </span>
          <span className="text-[10px] text-driftwood font-mono">{referralCount} × ₹5</span>
        </div>

        {/* Withdrawable */}
        <div className="rounded-2xl border border-stone-border/80 bg-white p-5 shadow-xs space-y-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-driftwood block">निकासी योग्य</span>
          <span className="text-2xl sm:text-3xl font-black text-blue-600 font-mono block">
            ₹{withdrawable}
          </span>
          <button
            type="button"
            onClick={() => setWithdrawModalOpen(true)}
            className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            <Check className="w-3 h-3" />
            <span>अभी निकालें</span>
          </button>
        </div>

        {/* Locked Amount */}
        <div className="rounded-2xl border border-stone-border/80 bg-white p-5 shadow-xs space-y-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-driftwood block">लॉक राशि</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-700 font-mono block">
            ₹{lockedAmount}
          </span>
          <span className="text-[10px] text-driftwood">अगले ₹1000 के लिए</span>
        </div>

      </div>

      {/* 3. Progress Card to First ₹1000 Matching Screenshot 5 */}
      <div className="rounded-3xl border border-stone-border/80 bg-white p-6 sm:p-8 space-y-5 shadow-warm">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-border/70 pb-3">
          <h3 className="text-sm sm:text-base font-bold text-charcoal flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span>पहले ₹1000 के लिए प्रगति (Progress to First ₹1000)</span>
          </h3>

          <div className="text-xs font-semibold text-driftwood">
            <span className="font-mono font-bold text-charcoal">{referralCount} / {targetReferrals}</span> रेफरल
            <span className="text-purple-600 font-bold ml-1.5">रेफर करते रहें!</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-driftwood">
          <Lock className="w-3.5 h-3.5 text-driftwood" />
          <span>₹{withdrawable}.00 राशि लॉक है</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-stone-100 rounded-full h-3.5 p-0.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-700 shadow-sm"
              style={{ width: `${Math.max(3, progressPercent)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-driftwood">
            <span>0 रेफरल</span>
            <span className="font-bold text-purple-700">{progressPercent}% पूर्ण</span>
            <span>200 रेफरल (₹1000)</span>
          </div>
        </div>

        <p className="text-xs text-driftwood text-center pt-1 font-medium">
          ₹1000 तक पहुंचने के लिए <strong className="text-purple-700 font-bold">{remainingReferrals} और रेफरल</strong> चाहिए।
        </p>

      </div>

      {/* 4. Withdrawal Status Table Matching Screenshot 5 */}
      <div className="rounded-3xl border border-stone-border/80 bg-white shadow-warm overflow-hidden">
        
        <div className="px-6 py-4 border-b border-stone-border/80 bg-canvas-inset/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span>निकासी स्थिति (Withdrawal Status)</span>
          </h3>
          <button
            type="button"
            onClick={() => setWithdrawModalOpen(true)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
          >
            नया अनुरोध करें
          </button>
        </div>

        {withdrawalHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-driftwood space-y-1">
            <p className="font-bold text-charcoal">अभी तक कोई निकासी अनुरोध नहीं किया गया है।</p>
            <p>जैसे ही आपके 200 रेफरल (₹1000) पूर्ण होंगे, आप सीधे अपने बैंक या UPI में निकासी कर सकते हैं।</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-border/60 text-xs">
            {withdrawalHistory.map((w) => (
              <div key={w.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div>
                  <span className="font-mono font-bold text-sm text-charcoal">₹{w.amount}</span>
                  <div className="text-driftwood text-[11px] mt-0.5">
                    UPI: <span className="font-mono">{w.upi_id}</span> • {new Date(w.requested_at).toLocaleDateString()}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Request Withdrawal Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-stone-border">
            <div className="flex items-center justify-between border-b border-stone-border/70 pb-3">
              <h3 className="font-bold text-base text-charcoal flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>रेफरल राशि निकासी अनुरोध</span>
              </h3>
              <button
                type="button"
                onClick={() => setWithdrawModalOpen(false)}
                className="p-1 rounded-lg text-driftwood hover:text-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-charcoal">निकासी राशि (Amount in ₹)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min={1000}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm font-mono font-bold text-charcoal"
                />
                <span className="text-[10px] text-driftwood block">न्यूनतम निकासी राशि ₹1000 निर्धारित है।</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-charcoal">यूपीआई आईडी (UPI ID)</label>
                <input
                  type="text"
                  placeholder="e.g. mobile@upi or name@okaxis"
                  value={withdrawUpi}
                  onChange={(e) => setWithdrawUpi(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm font-mono text-charcoal"
                />
              </div>

              {withdrawFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    withdrawFeedback.success
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-50 text-rose-900 border border-rose-300'
                  }`}
                >
                  {withdrawFeedback.message}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-border text-xs font-bold text-driftwood hover:text-charcoal"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-warm flex items-center gap-1.5"
                >
                  {isSubmittingWithdraw && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>अनुरोध भेजें</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
