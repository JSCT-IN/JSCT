'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DPSWTStore } from '@/lib/store';
import { triggerCelebrationConfetti } from '@/lib/utils';
import {
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  User,
  CreditCard,
  Building,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [department, setDepartment] = useState('Basic Education Department (बेसिक शिक्षा)');
  const [district, setDistrict] = useState('Prayagraj (प्रयागराज)');

  // Nominee State
  const [nomineeName, setNomineeName] = useState('');
  const [relationship, setRelationship] = useState('Wife (धर्मपत्नी)');
  const [bankName, setBankName] = useState('State Bank of India');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');

  const [step, setStep] = useState<1 | 2>(1);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (aadhaarNumber.length < 12) {
      alert('कृपया 12 अंकों का वैध आधार नंबर दर्ज करें।');
      return;
    }
    setStep(2);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const generatedId = `DPSWT-UP-${randomSuffix}`;
    const last4 = aadhaarNumber.slice(-4) || '9999';

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    DPSWTStore.registerMember({
      membership_id: generatedId,
      full_name: fullName,
      phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
      aadhaar_last4: last4,
      department: department,
      district: district,
      state: 'Uttar Pradesh',
      role: 'MEMBER',
      fee_expires_at: expiryDate.toISOString(),
      is_active: true,
      nominee: {
        id: `nom-${Date.now()}`,
        member_id: '',
        full_name: nomineeName,
        relationship: relationship,
        bank_name: bankName,
        account_number: accountNumber,
        ifsc_code: ifscCode.toUpperCase(),
        upi_id: upiId.toLowerCase(),
      },
    });

    triggerCelebrationConfetti();
    router.push('/dashboard');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10 sm:py-16 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-terracotta text-white flex items-center justify-center mx-auto shadow-warm">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <h1 className="font-editorial text-3xl font-bold text-charcoal">
          नया सदस्य पंजीकरण (Registration)
        </h1>
        <p className="text-xs text-driftwood">
          आधार व बैंक सत्यापन के साथ डीपीएसडब्ल्यूटी कल्याण परिवार से जुड़ें
        </p>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <span
            className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
              step === 1 ? 'bg-terracotta text-white' : 'bg-sage text-white'
            }`}
          >
            1
          </span>
          <span className="w-8 h-0.5 bg-stone-border" />
          <span
            className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
              step === 2 ? 'bg-terracotta text-white' : 'bg-canvas-inset border border-stone-border text-driftwood'
            }`}
          >
            2
          </span>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-border shadow-warm space-y-6">
        {step === 1 ? (
          /* Step 1: Member Personal & Department Details */
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-border/60 text-xs font-semibold uppercase tracking-wider text-charcoal font-mono">
              <User className="w-4 h-4 text-terracotta" />
              <span>चरण 1: व्यक्तिगत व सेवा विवरण</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                पूरा नाम (आधार कार्ड के अनुसार) *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="उदा. श्री रमेश चंद्र वर्मा"
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                मोबाइल नंबर (WhatsApp सक्षम) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                maxLength={10}
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                12-अंकीय आधार संख्या (गोपनीय व सुरक्षित) *
              </label>
              <input
                type="text"
                required
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder="1234 5678 9012"
                maxLength={12}
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-mono tracking-wider font-semibold"
              />
              <span className="text-[10px] text-driftwood mt-0.5 block">
                * केवल अंतिम 4 अंक सार्वजनिक पहचान हेतु प्रदर्शित होंगे।
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                कार्यरत विभाग (Department) *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-medium"
              >
                <option value="Basic Education Department (बेसिक शिक्षा)">बेसिक शिक्षा परिषद (Basic Education)</option>
                <option value="Secondary Education Dept (माध्यमिक शिक्षा)">माध्यमिक शिक्षा विभाग</option>
                <option value="Revenue Department (राजस्व विभाग)">राजस्व विभाग (Revenue)</option>
                <option value="Health & Family Welfare (चिकित्सा एवं स्वास्थ्य)">स्वास्थ्य एवं परिवार कल्याण</option>
                <option value="Irrigation & Water Resources (सिंचाई विभाग)">सिंचाई एवं जल संसाधन</option>
                <option value="Police & Home Guards (पुलिस एवं होमगार्ड)">पुलिस एवं होमगार्ड</option>
                <option value="Panchayati Raj & Rural Dev (पंचायती राज)">पंचायती राज एवं ग्राम्य विकास</option>
                <option value="General Public Welfare (अन्य सार्वजनिक सेवा)">अन्य सार्वजनिक सेवा / नागरिक</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                गृह जनपद (District, UP) *
              </label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="प्रयागराज / लखनऊ / गोरखपुर / वाराणसी / मेरठ"
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-xs shadow-warm hover:shadow-warm-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 touch-target"
            >
              <span>अगला चरण: नामिनी बैंक विवरण दर्ज करें</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Step 2: Nominee Credentials & ₹50 Fee */
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-border/60 text-xs font-semibold uppercase tracking-wider text-charcoal font-mono">
              <CreditCard className="w-4 h-4 text-sage" />
              <span>चरण 2: अधिकृत नामिनी व बैंक विवरण</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                नामिनी का पूरा नाम *
              </label>
              <input
                type="text"
                required
                value={nomineeName}
                onChange={(e) => setNomineeName(e.target.value)}
                placeholder="श्रीमती सुनीता देवी"
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                सदस्य से संबंध (Relationship) *
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-medium"
              >
                <option value="Wife (धर्मपत्नी)">Wife (धर्मपत्नी)</option>
                <option value="Husband (पति)">Husband (पति)</option>
                <option value="Mother (माता जी)">Mother (माता जी)</option>
                <option value="Son (पुत्र)">Son (पुत्र)</option>
                <option value="Daughter (पुत्री)">Daughter (पुत्री)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  बैंक का नाम *
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="State Bank of India"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  खाता संख्या (Account Number) *
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="30492817482"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  IFSC कोड *
                </label>
                <input
                  type="text"
                  required
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="SBIN0001248"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  नामिनी UPI ID *
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                  placeholder="sunita.verma@sbi"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-canvas-inset/30 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-mono font-semibold"
                />
              </div>
            </div>

            {/* Annual Fee Declaration */}
            <div className="p-4 rounded-2xl bg-canvas-inset border border-stone-border text-xs text-driftwood space-y-1">
              <div className="flex justify-between font-semibold text-charcoal">
                <span>वार्षिक सदस्यता व पोर्टल रखरखाव शुल्क:</span>
                <span className="font-editorial text-base text-terracotta font-bold">₹50.00 / वर्ष</span>
              </div>
              <p className="text-[11px]">
                * 365 दिन की सदस्यता। 75% अनुपालन पूर्ण करने पर परिवार आकस्मिक दशा में ₹20 लाख सहायता हेतु पात्र होगा।
              </p>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3.5 rounded-2xl bg-canvas-inset hover:bg-canvas-card border border-stone-border text-xs text-charcoal font-semibold touch-target"
              >
                ← वापस
              </button>

              <button
                type="submit"
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-terracotta to-terracotta-hover hover:from-terracotta-hover hover:to-terracotta text-white font-bold text-xs shadow-warm hover:shadow-warm-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 touch-target"
              >
                <span>पंजीकरण पूर्ण करें व डैशबोर्ड खोलें</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
