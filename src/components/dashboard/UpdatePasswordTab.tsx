'use client';

import React, { useState } from 'react';
import { Member } from '@/types';
import { updateMemberPasswordAction } from '@/actions/member-actions';
import { DPSWTStore } from '@/lib/store';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface UpdatePasswordTabProps {
  member: Member;
}

export default function UpdatePasswordTab({ member }: UpdatePasswordTabProps) {
  const { lang } = useTranslation();

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Password strength calculation
  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (pass.length >= 10) score += 25;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 25;
    if (/\d/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const strength = getStrength(newPass);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!currentPass || !newPass || !confirmPass) {
      setFeedback({ success: false, message: 'कृपया सभी आवश्यक फ़ील्ड्स भरें।' });
      return;
    }

    if (newPass.length < 6) {
      setFeedback({ success: false, message: 'नया पासवर्ड न्यूनतम 6 अक्षरों का होना चाहिए।' });
      return;
    }

    if (newPass !== confirmPass) {
      setFeedback({ success: false, message: 'नया पासवर्ड और पुष्टि पासवर्ड एक समान होने चाहिए।' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await updateMemberPasswordAction(member.id, currentPass, newPass);
      if (res.success) {
        DPSWTStore.updatePassword(member.id, newPass);
        setFeedback({ success: true, message: res.message });
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      } else {
        setFeedback({ success: false, message: res.message });
      }
    } catch (err: any) {
      setFeedback({ success: false, message: err.message || 'पासवर्ड बदलने में त्रुटि हुई।' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-fade-in">
      
      <div className="border-b border-stone-border/80 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-charcoal tracking-tight font-editorial">
          खाता पासवर्ड बदलें (Update Password)
        </h2>
        <p className="text-xs text-driftwood mt-1">
          अपने सदस्य पोर्टल खाते की सुरक्षा हेतु नियमित रूप से मजबूत पासवर्ड का उपयोग करें।
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-border/80 shadow-warm p-6 sm:p-8 space-y-6">
        
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-charcoal flex items-center justify-between">
              <span>वर्तमान पासवर्ड (Current Password)</span>
              <span className="text-[11px] font-normal text-driftwood">Default: Password@123</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                placeholder="वर्तमान पासवर्ड दर्ज करें"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm text-charcoal bg-white pr-10 focus:outline-none focus:ring-2 focus:ring-terracotta/30"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-3 text-driftwood hover:text-charcoal"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-charcoal">नया पासवर्ड (New Password)</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="नया मजबूत पासवर्ड दर्ज करें"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm text-charcoal bg-white pr-10 focus:outline-none focus:ring-2 focus:ring-terracotta/30"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-3 text-driftwood hover:text-charcoal"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength Meter */}
            {newPass.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      strength <= 25 ? 'bg-rose-500 w-1/4' : strength <= 50 ? 'bg-amber-500 w-2/4' : strength <= 75 ? 'bg-blue-500 w-3/4' : 'bg-emerald-500 w-full'
                    }`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-driftwood">
                  <span>पासवर्ड मजबूती</span>
                  <span className="font-bold text-charcoal">
                    {strength <= 25 ? 'कमजोर' : strength <= 50 ? 'सामान्य' : strength <= 75 ? 'अच्छा' : 'अति मजबूत'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-charcoal">नया पासवर्ड पुनः दर्ज करें (Confirm Password)</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="नया पासवर्ड पुनः दर्ज करें"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm text-charcoal bg-white pr-10 focus:outline-none focus:ring-2 focus:ring-terracotta/30"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-driftwood hover:text-charcoal"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {feedback && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                feedback.success
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                  : 'bg-rose-50 text-rose-900 border border-rose-300'
              }`}
            >
              {feedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs sm:text-sm font-bold shadow-warm active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>पासवर्ड सुरक्षित हो रहा है...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>पासवर्ड अपडेट करें (Save Password)</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
