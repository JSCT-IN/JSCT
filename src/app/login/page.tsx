'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DPSWTStore } from '@/lib/store';
import { INITIAL_MEMBERS } from '@/lib/mockData';
import { HeartHandshake, ShieldCheck, ArrowRight, UserCheck, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');

  const handleDemoLogin = (userId: string) => {
    DPSWTStore.setCurrentUser(userId);
    router.push('/dashboard');
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Match by membership_id or phone
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
      // Default to first member
      DPSWTStore.setCurrentUser(members[0].id);
      router.push('/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-terracotta text-white flex items-center justify-center mx-auto shadow-warm">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <h1 className="font-editorial text-3xl font-bold text-charcoal">
          सदस्य लॉगिन (Member Login)
        </h1>
        <p className="text-xs text-driftwood">
          डीपीएसडब्ल्यूटी पोर्टल पर अपने 75% अनुपालन व अभिलेख हेतु प्रवेश करें
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-border shadow-warm space-y-6">
        <form onSubmit={handleFormLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              सदस्यता आईडी अथवा पंजीकृत मोबाइल नंबर *
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="उदा. DPSWT-UP-9042 या 9876543210"
              required
              className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              सुरक्षा पिन / OTP *
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••"
              required
              className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-mono tracking-widest"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-xs shadow-warm hover:shadow-warm-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 touch-target"
          >
            <span>लॉगिन करें (Sign In)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Logins for Testing */}
        <div className="pt-4 border-t border-stone-border space-y-2.5">
          <div className="text-[11px] font-semibold text-driftwood uppercase tracking-wider text-center">
            त्वरित परीक्षण प्रोफाइल (1-Click Demo Login)
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleDemoLogin(INITIAL_MEMBERS[0].id)}
              className="w-full text-left p-2.5 rounded-xl bg-canvas-inset hover:bg-canvas-card border border-stone-border flex items-center justify-between text-xs transition-colors"
            >
              <div>
                <div className="font-semibold text-charcoal">श्री रमेश वर्मा (MEMBER)</div>
                <div className="text-[10px] font-mono text-terracotta">DPSWT-UP-9042 • 75% अनुपालन</div>
              </div>
              <span className="text-driftwood">लॉगिन →</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin(INITIAL_MEMBERS[1].id)}
              className="w-full text-left p-2.5 rounded-xl bg-canvas-inset hover:bg-canvas-card border border-stone-border flex items-center justify-between text-xs transition-colors"
            >
              <div>
                <div className="font-semibold text-charcoal">इंस्पेक्टर अरविंद सिंह (INSPECTOR)</div>
                <div className="text-[10px] font-mono text-sage">DPSWT-INSP-0058 • फील्ड सत्यापन कक्ष</div>
              </div>
              <span className="text-driftwood">लॉगिन →</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin(INITIAL_MEMBERS[2].id)}
              className="w-full text-left p-2.5 rounded-xl bg-canvas-inset hover:bg-canvas-card border border-stone-border flex items-center justify-between text-xs transition-colors"
            >
              <div>
                <div className="font-semibold text-charcoal">डॉ. आलोक त्रिपाठी (ADMIN)</div>
                <div className="text-[10px] font-mono text-charcoal">DPSWT-ADMIN-01 • राज्य समन्वय बोर्ड</div>
              </div>
              <span className="text-driftwood">लॉगिन →</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-driftwood pt-2">
          नये सदस्य हैं?{' '}
          <Link href="/register" className="text-terracotta font-semibold hover:underline">
            नया पंजीकरण करें (₹50 वार्षिक)
          </Link>
        </div>
      </div>
    </div>
  );
}
