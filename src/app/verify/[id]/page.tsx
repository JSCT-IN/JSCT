import React from 'react';
import Link from 'next/link';
import { getSupabaseAdminClient, Member } from '@/lib/supabase';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Award,
  ArrowLeft,
  Building,
  HeartHandshake
} from 'lucide-react';

interface VerifyPageProps {
  params: Promise<{ id: string }>;
}

export default async function VerifyMemberPage({ params }: VerifyPageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id).trim();

  const supabase = getSupabaseAdminClient();

  // Look up by member_id or by uuid
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decodedId);

  let query = supabase.from('members').select('*');
  if (isUuid) {
    query = query.eq('id', decodedId);
  } else {
    query = query.ilike('member_id', decodedId);
  }

  const { data: memberData } = await query.maybeSingle();
  const member = memberData as Member | null;

  if (!member) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-xl border border-stone-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-stone-900">सदस्यता सत्यापित नहीं हो सकी</h1>
          <p className="text-xs text-stone-600">
            सदस्यता क्रमांक <span className="font-mono font-bold text-rose-600 font-mono">{decodedId}</span> का विवरण ट्रस्ट डेटाबेस में पंजीकृत नहीं पाया गया।
          </p>
          <div className="pt-4 border-t border-stone-200">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-[#0B5C9E] text-white text-xs font-bold inline-flex items-center gap-2 hover:bg-[#084b82] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>मुख्य पृष्ठ पर जाएं</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isLockInOver = new Date(member.lock_in_end_date).getTime() <= Date.now();
  const regDateFormatted = member.registration_date 
    ? new Date(member.registration_date).toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '-';
  const lockInDateFormatted = member.lock_in_end_date 
    ? new Date(member.lock_in_end_date).toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '-';

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
        
        {/* Official Header */}
        <div className="bg-gradient-to-r from-[#0B5C9E] via-[#094b80] to-[#073b64] text-white p-6 text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-[#FFEB3B]" />
          </div>

          <h2 className="text-xs font-bold tracking-widest uppercase text-blue-200 font-serif">
            जन सेवा चैरिटेबल ट्रस्ट • Direct People Support
          </h2>
          <h1 className="text-lg sm:text-xl font-black mt-1 tracking-wide font-serif">
            आधिकारिक सदस्यता सत्यापन
          </h1>
          <p className="text-[11px] text-stone-200 mt-1">
            Official Membership & Identity Verification Certificate
          </p>

          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>सत्यापित व सक्रिय ट्रस्ट रिकॉर्ड</span>
          </div>
        </div>

        {/* Member Profile Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Member Card Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-stone-200">
            <div className="w-20 h-24 rounded-xl border-2 border-[#0B5C9E] overflow-hidden bg-stone-100 shrink-0 shadow-sm flex items-center justify-center">
              {member.photo_url ? (
                <img
                  src={member.photo_url}
                  alt={member.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-stone-400" />
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                पंजीकृत सदस्य (Trust Member)
              </span>
              <h3 className="text-xl font-black text-stone-900 font-serif">{member.full_name}</h3>
              <p className="text-xs text-stone-600 font-medium">
                {member.designation} • {member.department}
              </p>
              <div className="pt-1">
                <span className="font-mono text-xs font-black text-[#0B5C9E] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {member.member_id}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
              <p className="text-[10px] font-semibold text-stone-500">पिता / पति का नाम</p>
              <p className="font-bold text-stone-900 mt-0.5">{member.father_or_husband_name}</p>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
              <p className="text-[10px] font-semibold text-stone-500">जनपद व राज्य</p>
              <p className="font-bold text-stone-900 mt-0.5">{member.district}, {member.state}</p>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
              <p className="text-[10px] font-semibold text-stone-500">पंजीकरण तिथि</p>
              <p className="font-mono font-bold text-stone-900 mt-0.5">{regDateFormatted}</p>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
              <p className="text-[10px] font-semibold text-stone-500">सदस्यता स्थिति</p>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase mt-0.5 ${
                member.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {member.is_active ? 'सक्रिय (Active)' : 'सत्यापन प्रतीक्षारत'}
              </span>
            </div>
          </div>

          {/* 6-Month Lock-in Compliance Certificate Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0B5C9E] flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                6-माह कल्याणकारी लॉक-इन नियमावली
              </span>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                isLockInOver ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isLockInOver ? 'पात्र' : 'प्रक्रियाधीन'}
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              {isLockInOver ? (
                <>यह सदस्य 6 माह की न्यूनतम अनिवार्य सदस्यता अवधि पूर्ण कर चुके हैं तथा आकस्मिक व वैवाहिक संबल प्राप्त करने हेतु विधिवत पात्र हैं।</>
              ) : (
                <>यह सदस्य वर्तमान में 6 माह की अनिवार्य सदस्यता लॉक-इन अवधि के अंतर्गत हैं। लॉक-इन समाप्ति तिथि: <strong className="font-mono text-stone-800">{lockInDateFormatted}</strong>.</>
              )}
            </p>
          </div>

          {/* Official Seal / Signature Footer */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-stone-500 text-[11px]">
            <div>
              <p className="font-bold text-stone-800">विवेक गुप्ता</p>
              <p className="text-[10px]">प्रदेश अध्यक्ष / मुख्य न्यासी</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] text-stone-400">
                सत्यापन समय: {new Date().toLocaleTimeString('hi-IN')}
              </p>
              <span className="text-[10px] text-emerald-700 font-bold">● डिजिटल मुहर प्रमाणित</span>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="text-xs font-bold text-[#0B5C9E] hover:underline"
            >
              ← जन सेवा चैरिटेबल ट्रस्ट मुख्य पोर्टल पर जाएं
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
