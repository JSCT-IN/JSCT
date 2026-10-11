'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DPSWTStore } from '@/lib/store';
import { INITIAL_MEMBERS } from '@/lib/mockData';
import { supabase } from '@/lib/supabase/client';
import { 
  HeartHandshake, 
  ArrowRight, 
  Smartphone, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Lock 
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  
  // Auth Mode: 'OTP' (Phone/SMS), 'MAGIC_LINK' (Email), 'ID_LOOKUP' (Membership ID)
  const [authMode, setAuthMode] = useState<'OTP' | 'MAGIC_LINK' | 'ID_LOOKUP'>('OTP');
  
  // Form States
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  // UI Flow States
  const [otpSent, setOtpSent] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Send Phone OTP via Supabase Auth
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    const cleanPhone = phone.trim().startsWith('+91') ? phone.trim() : `+91${phone.trim()}`;

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: cleanPhone,
      });

      if (error) {
        // If Supabase Twilio/SMS is not yet enabled on project, fallback to verification against members table
        const { data: member } = await supabase
          .from('members')
          .select('id, membership_id, full_name')
          .ilike('phone', `%${phone.trim().slice(-10)}%`)
          .single();

        if (member) {
          DPSWTStore.setCurrentUser(member.id);
          setOtpSent(true);
          setMessage({
            type: 'success',
            text: `सत्यापन कोड (OTP) आपके नंबर ${phone} पर भेजा गया है। (परीक्षण कोड: 123456)`,
          });
        } else {
          setMessage({
            type: 'error',
            text: error.message || 'OTP प्रेषण में त्रुटि हुई। कृपया नंबर जांचें।',
          });
        }
      } else {
        setOtpSent(true);
        setMessage({
          type: 'success',
          text: `सत्यापन कोड (OTP) सफलतापूर्वक ${cleanPhone} पर भेजा गया है!`,
        });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'अज्ञात त्रुटि।' });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify Phone OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    const cleanPhone = phone.trim().startsWith('+91') ? phone.trim() : `+91${phone.trim()}`;

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: cleanPhone,
        token: otpCode.trim(),
        type: 'sms',
      });

      if (error) {
        // In demo/test environment, accept test PIN 123456
        if (otpCode.trim() === '123456') {
          router.push('/dashboard');
          return;
        }
        setMessage({ type: 'error', text: 'अमान्य OTP कोड! कृपया पुनः प्रयास करें।' });
      } else {
        if (data.user) {
          DPSWTStore.setCurrentUser(data.user.id);
        }
        router.push('/dashboard');
      }
    } catch {
      if (otpCode.trim() === '123456') {
        router.push('/dashboard');
      } else {
        setMessage({ type: 'error', text: 'अमान्य OTP कोड।' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Send Magic Link via Supabase Auth
  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
        },
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMagicLinkSent(true);
        setMessage({
          type: 'success',
          text: `मैजिक लॉगिन लिंक आपके ईमेल ${email} पर प्रेषित कर दिया गया है! इनबॉक्स चेक करें।`,
        });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'त्रुटि।' });
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Quick Membership ID & Phone Direct Lookup
  const handleLookupLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      const { data: member } = await supabase
        .from('members')
        .select('*')
        .or(`membership_id.ilike.${identifier.trim()},phone.ilike.%${identifier.trim()}%`)
        .single();

      if (member) {
        DPSWTStore.setCurrentUser(member.id);
        router.push('/dashboard');
      } else {
        // Fallback to local store search
        const members = DPSWTStore.getMembers();
        const found = members.find(
          (m) =>
            m.membership_id.toLowerCase() === identifier.trim().toLowerCase() ||
            m.phone.includes(identifier.trim())
        );
        if (found) {
          DPSWTStore.setCurrentUser(found.id);
          router.push('/dashboard');
        } else {
          setMessage({
            type: 'error',
            text: 'यह सदस्यता क्रमांक या मोबाइल नंबर पंजीकृत नहीं पाया गया।',
          });
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'सत्यापन में त्रुटि हुई।' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFastDemoLogin = (userId: string) => {
    DPSWTStore.setCurrentUser(userId);
    router.push('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-terracotta text-white flex items-center justify-center mx-auto shadow-warm">
          <HeartHandshake className="w-6 h-6 stroke-[2.2]" />
        </div>
        <h1 className="font-editorial text-3xl font-bold text-charcoal">
          सदस्य लॉगिन (Member Login)
        </h1>
        <p className="text-xs text-driftwood">
          डीपीएसडब्ल्यूटी पोर्टल पर अपने 75% अनुपालन व अभिलेख हेतु प्रवेश करें
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-border shadow-warm space-y-5">
        
        {/* Auth Mode Toggle Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-canvas-inset rounded-2xl border border-stone-border/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setAuthMode('OTP'); setMessage(null); setOtpSent(false); }}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 ${
              authMode === 'OTP'
                ? 'bg-white text-terracotta shadow-xs font-bold'
                : 'text-driftwood hover:text-charcoal'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone OTP</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMode('MAGIC_LINK'); setMessage(null); }}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 ${
              authMode === 'MAGIC_LINK'
                ? 'bg-white text-terracotta shadow-xs font-bold'
                : 'text-driftwood hover:text-charcoal'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Link</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMode('ID_LOOKUP'); setMessage(null); }}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 ${
              authMode === 'ID_LOOKUP'
                ? 'bg-white text-terracotta shadow-xs font-bold'
                : 'text-driftwood hover:text-charcoal'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>ID Lookup</span>
          </button>
        </div>

        {/* Status Notification Message */}
        {message && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
              message.type === 'success'
                ? 'bg-sage-light text-sage border border-sage/20'
                : 'bg-terracotta-light text-terracotta border border-terracotta/20'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed font-medium">{message.text}</span>
          </div>
        )}

        {/* Tab 1: Phone SMS OTP */}
        {authMode === 'OTP' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    पंजीकृत मोबाइल नंबर (Registered Mobile) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-xs text-driftwood font-mono">+91</span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || phone.length < 10}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-xs shadow-warm disabled:opacity-50 transition-all flex items-center justify-center gap-2 touch-target"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>OTP भेजें (Send OTP)</span>}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    दर्ज करें 6-अंकों का OTP कोड *
                  </label>
                  <input
                    type="text"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-center text-lg text-charcoal tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                  />
                  <div className="text-[11px] text-driftwood mt-1.5 flex justify-between">
                    <span>नंबर: +91 {phone}</span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-terracotta hover:underline font-semibold"
                    >
                      नंबर बदलें
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 6}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-xs shadow-warm disabled:opacity-50 transition-all flex items-center justify-center gap-2 touch-target"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>सत्यापित करें व प्रवेश करें</span>}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Supabase Magic Link */}
        {authMode === 'MAGIC_LINK' && (
          <form onSubmit={handleSendMagicLink} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                पंजीकृत ईमेल आईडी (Email Address) *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@department.up.gov.in"
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.includes('@')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-xs shadow-warm disabled:opacity-50 transition-all flex items-center justify-center gap-2 touch-target"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>मैजिक लिंक भेजें (Send Magic Link)</span>}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Tab 3: Fast ID Lookup */}
        {authMode === 'ID_LOOKUP' && (
          <form onSubmit={handleLookupLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                सदस्यता आईडी (Membership ID) अथवा मोबाइल *
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="उदा. DPSWT-UP-9042"
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || identifier.trim() === ''}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-xs shadow-warm disabled:opacity-50 transition-all flex items-center justify-center gap-2 touch-target"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>सत्यापित करें व डैशबोर्ड खोलें</span>}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Demo Fast Logins for Testing */}
        <div className="pt-4 border-t border-stone-border space-y-2">
          <div className="text-[11px] font-semibold text-driftwood uppercase tracking-wider text-center">
            त्वरित परीक्षण प्रोफाइल (1-Click Demo Switcher)
          </div>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => handleFastDemoLogin(INITIAL_MEMBERS[0].id)}
              className="w-full text-left p-2.5 rounded-xl bg-canvas-inset hover:bg-canvas-card border border-stone-border/80 flex items-center justify-between text-xs transition-colors"
            >
              <div>
                <div className="font-semibold text-charcoal">श्री रमेश वर्मा (MEMBER)</div>
                <div className="text-[10px] font-mono text-terracotta">DPSWT-UP-9042 • 75% अनुपालन</div>
              </div>
              <span className="text-driftwood">लॉगिन →</span>
            </button>

            <button
              type="button"
              onClick={() => handleFastDemoLogin(INITIAL_MEMBERS[1].id)}
              className="w-full text-left p-2.5 rounded-xl bg-canvas-inset hover:bg-canvas-card border border-stone-border/80 flex items-center justify-between text-xs transition-colors"
            >
              <div>
                <div className="font-semibold text-charcoal">इंस्पेक्टर अरविंद सिंह (INSPECTOR)</div>
                <div className="text-[10px] font-mono text-sage">DPSWT-INSP-0058 • फील्ड सत्यापन कक्ष</div>
              </div>
              <span className="text-driftwood">लॉगिन →</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-driftwood pt-1">
          नये सदस्य हैं?{' '}
          <Link href="/register" className="text-terracotta font-semibold hover:underline">
            नया पंजीकरण करें (₹50 वार्षिक)
          </Link>
        </div>
      </div>
    </div>
  );
}
