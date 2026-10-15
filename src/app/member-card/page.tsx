'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  User, 
  HeartHandshake, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Sparkles,
  Upload,
  Send,
  Loader2,
  Calendar,
  Phone,
  MapPin,
  ChevronRight,
  BadgeCheck,
  AlertTriangle
} from 'lucide-react';
import { supabase, Member, WelfareScheme, WelfareClaim } from '@/lib/supabase';
import { submitWelfareClaimAction } from '@/actions/claim-actions';
import MemberCard from '@/components/MemberCard';

export default function MemberPortalPage() {
  const [profile, setProfile] = useState<Member | null>(null);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [schemes, setSchemes] = useState<WelfareScheme[]>([]);
  const [myClaims, setMyClaims] = useState<WelfareClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Claim Form State
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('');
  const [claimAmount, setClaimAmount] = useState<string>('50000');
  const [supportingDocs, setSupportingDocs] = useState<string>('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [claimFeedback, setClaimFeedback] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // 1. Fetch all members
        const { data: mems } = await supabase
          .from('members')
          .select('*')
          .order('registration_date', { ascending: false });

        if (mems && mems.length > 0) {
          const memberList = mems as Member[];
          setAllMembers(memberList);

          // Default to Satyanarayan or first member
          const defaultUser = memberList.find(p => p.mobile?.includes('7084237422') || p.member_id === 'UP52260100') || memberList[0];
          setProfile(defaultUser);

          // 2. Fetch claims for default user
          const { data: claimsData } = await supabase
            .from('welfare_claims')
            .select('*, scheme:welfare_schemes(name)')
            .eq('member_id', defaultUser.id)
            .order('created_at', { ascending: false });

          if (claimsData) setMyClaims(claimsData as WelfareClaim[]);
        }

        // 3. Fetch active schemes
        const { data: schemesData } = await supabase
          .from('welfare_schemes')
          .select('*')
          .order('created_at', { ascending: true });

        if (schemesData && schemesData.length > 0) {
          const schemeList = schemesData as WelfareScheme[];
          setSchemes(schemeList);
          setSelectedSchemeId(schemeList[0].id);
        }
      } catch (err) {
        console.error('Error loading member portal data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSelectMember = async (m: Member) => {
    setProfile(m);
    setClaimFeedback(null);
    try {
      const { data: claimsData } = await supabase
        .from('welfare_claims')
        .select('*, scheme:welfare_schemes(name)')
        .eq('member_id', m.id)
        .order('created_at', { ascending: false });

      if (claimsData) setMyClaims(claimsData as WelfareClaim[]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmittingClaim(true);
    setClaimFeedback(null);

    try {
      const docsArray = supportingDocs
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await submitWelfareClaimAction({
        memberId: profile.id,
        schemeId: selectedSchemeId,
        claimAmount: parseFloat(claimAmount) || 50000,
        supportingDocs: docsArray.length > 0 ? docsArray : ['https://placehold.co/600x800?text=Claim+Documents'],
      });

      setClaimFeedback({
        success: res.success,
        message: res.message,
      });

      if (res.success && res.claim) {
        setMyClaims(prev => [res.claim as WelfareClaim, ...prev]);
        setSupportingDocs('');
      }
    } catch (err: any) {
      console.error('Claim submission error:', err);
      setClaimFeedback({
        success: false,
        message: err.message || 'दावा प्रस्तुत करने में त्रुटि आई।',
      });
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[#0B5C9E] animate-spin mb-3" />
        <p className="text-xs font-semibold text-stone-600">सदस्य पहचान पत्र व प्रोफाइल लोड हो रही है...</p>
      </div>
    );
  }

  const isLockInFinished = new Date(profile.lock_in_end_date).getTime() <= Date.now();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-20">
      
      {/* Top Navbar */}
      <header className="bg-[#0B5C9E] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
              title="डैशबोर्ड पर वापस जाएं"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-wide uppercase font-serif">
                JSCT 2.0 • सदस्य पहचान पत्र एवं कल्याण पोर्टल
              </h1>
              <p className="text-[11px] text-stone-200">
                Direct People Support Welfare Society / Jan Sewa Charitable Trust
              </p>
            </div>
          </div>


        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">

        {/* Member Switcher (Demo & Testing Purpose) */}
        {allMembers.length > 1 && (
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#0B5C9E]" />
              <span className="text-xs font-bold text-stone-700">सक्रिय सदस्य का चयन करें:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allMembers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMember(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    profile.id === m.id
                      ? 'bg-[#0B5C9E] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {m.full_name} ({m.member_id})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 1. Member Profile & Lock-in Status Hero */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-100">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 border-2 border-[#0B5C9E] overflow-hidden shrink-0 flex items-center justify-center">
                {profile.photo_url ? (
                  <img src={profile.photo_url} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-[#0B5C9E]" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-stone-900 font-serif">{profile.full_name}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    profile.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {profile.is_active ? 'सक्रिय सदस्य' : 'सत्यापन प्रतीक्षारत'}
                  </span>
                </div>
                <p className="text-xs text-stone-600 font-medium">
                  {profile.designation || 'सदस्य'} • {profile.department}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 pt-1">
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-stone-400" /> {profile.mobile}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" /> {profile.district}, {profile.state}
                  </span>
                </div>
              </div>
            </div>

            {/* Lock-in Status Indicator */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex items-center gap-3 self-start md:self-auto">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isLockInFinished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {isLockInFinished ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  6-माह सदस्यता लॉक-इन
                </p>
                <p className="text-xs font-bold text-stone-900 mt-0.5">
                  {isLockInFinished ? (
                    <span className="text-emerald-700 font-extrabold">पूर्ण (सहायता दावा हेतु पात्र)</span>
                  ) : (
                    <span className="text-amber-700 font-extrabold">सक्रिय (लॉक-इन अवधि जारी)</span>
                  )}
                </p>
              </div>
            </div>

          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 uppercase">सदस्यता क्रमांक</span>
              <p className="text-sm font-mono font-black text-[#0B5C9E] mt-0.5">{profile.member_id}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 uppercase">आकस्मिक सहायता संबल</span>
              <p className="text-sm font-mono font-black text-stone-900 mt-0.5">₹15,00,000 तक</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 uppercase">पुत्री विवाह सहयोग</span>
              <p className="text-sm font-mono font-black text-stone-900 mt-0.5">₹5,00,000 तक</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 uppercase">लॉक-इन समाप्ति तिथि</span>
              <p className="text-sm font-mono font-bold text-amber-700 mt-0.5">
                {profile.lock_in_end_date ? profile.lock_in_end_date.split('T')[0] : '-'}
              </p>
            </div>
          </div>
        </section>

        {/* 2. Downloadable Official Member ID Card with Countdown */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0B5C9E]" />
              आधिकारिक डिजिटल पहचान पत्र (Official Member ID Card)
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              कार्ड को उच्च रेज़ोल्यूशन 300 DPI PNG अथवा आधिकारिक CR80 PDF प्रारूप में डाउनलोड करें।
            </p>
          </div>

          {/* Render the MemberCard component with PNG/PDF download buttons */}
          <MemberCard member={profile} />
        </section>

        {/* 3. Welfare Programs & Claim Application Section */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-amber-600" />
                कल्याणकारी सहायता आवेदन (Apply for Welfare Claim)
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                6-माह की अनिवार्य सदस्यता पश्चात सदस्य अथवा आश्रित सहायता दावा प्रस्तुत कर सकते हैं।
              </p>
            </div>
            <span className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-xl self-start sm:self-auto font-mono">
              6-माह लॉक-इन अनुपालन
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Claim Form */}
            <form onSubmit={handleSubmitClaim} className="space-y-4 bg-stone-50 p-5 rounded-2xl border border-stone-200">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-mono">
                नया सहायता दावा प्रपत्र (Claim Form)
              </h3>

              {claimFeedback && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  claimFeedback.success ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {claimFeedback.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{claimFeedback.message}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  योजना का चयन करें *
                </label>
                <select
                  value={selectedSchemeId}
                  onChange={(e) => {
                    setSelectedSchemeId(e.target.value);
                    const sch = schemes.find(s => s.id === e.target.value);
                    if (sch) {
                      setClaimAmount(sch.name.includes('दिवंगत') ? '1500000' : '500000');
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                >
                  {schemes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (अधिकतम ₹{Number(s.max_coverage).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  आवेदित सहायता राशि (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  सहायक दस्तावेज़ लिंक / संदर्भ विवरण (Supporting Documents)
                </label>
                <textarea
                  rows={2}
                  value={supportingDocs}
                  onChange={(e) => setSupportingDocs(e.target.value)}
                  placeholder="दस्तावेज़ URL अथवा विवाह निमंत्रण पत्र / मृत्यु प्रमाण पत्र संदर्भ विवरण..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingClaim}
                className="w-full py-2.5 rounded-xl bg-[#0B5C9E] hover:bg-[#084b82] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
              >
                {isSubmittingClaim ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>सहायता आवेदन प्रस्तुत करें (Submit Claim)</span>
              </button>
            </form>

            {/* Right: Previous Claims History */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-mono">
                आपके पूर्व सहायता दावे (Claim History)
              </h3>

              {myClaims.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500">
                  वर्तमान में कोई सहायता दावा दर्ज नहीं है।
                </div>
              ) : (
                myClaims.map((claim) => (
                  <div 
                    key={claim.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-white transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-900">
                        {claim.scheme?.name || 'कल्याणकारी सहायता'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        claim.status === 'approved' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : claim.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {claim.status}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-stone-600">
                      राशि: <span className="font-bold text-[#0B5C9E]">₹{Number(claim.claim_amount).toLocaleString('en-IN')}</span>
                      {' • '}तिथि: {claim.created_at ? claim.created_at.split('T')[0] : '-'}
                    </p>

                    {claim.admin_remarks && (
                      <p className="text-[11px] text-stone-500 italic">
                        न्यासी टिप्पणी: {claim.admin_remarks}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        </section>

      </main>

    </div>
  );
}
