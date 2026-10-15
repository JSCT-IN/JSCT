'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Member } from '@/lib/supabase';
import { 
  Download, 
  Printer, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Loader2,
  FileText,
  UserCheck,
  AlertTriangle,
  QrCode as QrIcon
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface MemberCardProps {
  member: Member;
  onVerifyToggle?: (verified: boolean) => void;
  showAdminControls?: boolean;
}

export default function MemberCard({ 
  member, 
  onVerifyToggle,
  showAdminControls = false 
}: MemberCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<'png' | 'pdf' | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isLocked: boolean;
    percentage: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLocked: true,
    percentage: 0,
  });

  // Generate official verification QR code
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dpswt.com';
    const verifyUrl = `${origin}/verify/${member.member_id || member.id}`;
    
    QRCode.toDataURL(verifyUrl, {
      width: 120,
      margin: 1,
      color: {
        dark: '#0B5C9E',
        light: '#FFFFFF',
      },
    }).then(setQrCodeDataUrl).catch(console.error);
  }, [member.member_id, member.id]);

  // Calculate 6-month lock-in countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const regTime = new Date(member.registration_date || Date.now()).getTime();
      const lockInTime = new Date(member.lock_in_end_date).getTime();

      const totalDuration = lockInTime - regTime;
      const remainingTime = lockInTime - now;

      if (remainingTime <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLocked: false,
          percentage: 100,
        });
        return;
      }

      const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

      const elapsed = now - regTime;
      const percentage = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isLocked: true,
        percentage,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [member.registration_date, member.lock_in_end_date]);

  // High-Resolution PNG Export (scale 3 = 300 DPI)
  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    setIsExporting('png');
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `JSCT_ID_CARD_${member.member_id || 'MEMBER'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('PNG export failed:', err);
    } finally {
      setIsExporting(null);
    }
  };

  // High-Resolution PDF Export (Landscape CR80 standard)
  const handleDownloadPdf = async () => {
    if (!cardRef.current) return;
    setIsExporting('pdf');
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 54],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 54, undefined, 'FAST');
      pdf.save(`JSCT_ID_CARD_${member.member_id || 'MEMBER'}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedRegDate = member.registration_date 
    ? new Date(member.registration_date).toISOString().split('T')[0]
    : '2026-09-28';

  const formattedDob = member.dob 
    ? new Date(member.dob).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
    : '01-01-1967';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* 1. 6-Month Lock-in Compliance Countdown Banner */}
      <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
        timeLeft.isLocked
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-950'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
              timeLeft.isLocked ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {timeLeft.isLocked ? <Clock className="w-5 h-5 animate-pulse" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold tracking-tight">
                  {timeLeft.isLocked ? '6-माह सुरक्षा लॉक-इन अवधि (6-Month Welfare Lock-in)' : 'कल्याणकारी योजनाओं हेतु पूर्णतः पात्र'}
                </h4>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  timeLeft.isLocked ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                }`}>
                  {timeLeft.isLocked ? 'सक्रिय (ACTIVE LOCK-IN)' : 'पात्र (ELIGIBLE)'}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {timeLeft.isLocked 
                  ? `आपकी सदस्यता का 6-माह लॉक-इन ${new Date(member.lock_in_end_date).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })} को पूर्ण होगा। इसके उपरांत आप ₹15 लाख आकस्मिक व ₹5 लाख बेटी विवाह संबल के लिए पात्र होंगे।`
                  : '6 माह की आवश्यक सदस्यता पूर्ण हो चुकी है। आप सभी ट्रस्ट सहायता योजनाओं के लिए पूर्णतः पात्र हैं।'
                }
              </p>
            </div>
          </div>

          {timeLeft.isLocked && (
            <div className="flex items-center gap-2 font-mono bg-white px-3.5 py-2 rounded-xl border border-amber-200 shadow-xs self-start sm:self-auto">
              <div className="text-center">
                <span className="text-base font-bold text-amber-700">{timeLeft.days}</span>
                <span className="block text-[9px] text-stone-500 uppercase">दिन</span>
              </div>
              <span className="text-stone-300 font-bold">:</span>
              <div className="text-center">
                <span className="text-base font-bold text-amber-700">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="block text-[9px] text-stone-500 uppercase">घंटे</span>
              </div>
              <span className="text-stone-300 font-bold">:</span>
              <div className="text-center">
                <span className="text-base font-bold text-amber-700">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="block text-[9px] text-stone-500 uppercase">मिनट</span>
              </div>
              <span className="text-stone-300 font-bold">:</span>
              <div className="text-center">
                <span className="text-base font-bold text-amber-700">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="block text-[9px] text-stone-500 uppercase">सेकंड</span>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-3.5 w-full bg-stone-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              timeLeft.isLocked ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-emerald-500'
            }`}
            style={{ width: `${timeLeft.percentage}%` }}
          />
        </div>
      </div>

      {/* 2. Download & Export Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
          <Sparkles className="w-4 h-4 text-[#0B5C9E]" />
          <span>डिजिटल सदस्यता पहचान पत्र (Official Trust Identity Card)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isExporting !== null}
            className="px-4 py-2 rounded-xl bg-[#0B5C9E] hover:bg-[#084b82] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 disabled:opacity-50"
          >
            {isExporting === 'png' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>PNG डाउनलोड (300 DPI)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting !== null}
            className="px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 disabled:opacity-50"
          >
            {isExporting === 'pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5 text-red-600" />}
            <span>PDF डाउनलोड</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="p-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-all shadow-xs active:scale-95"
            title="प्रिंट करें"
          >
            <Printer className="w-4 h-4 text-stone-600" />
          </button>
        </div>
      </div>

      {/* 3. The Official ID Card Component (Exact Visual Match to Uploaded Design) */}
      <div className="overflow-x-auto pb-4 flex justify-center">
        <div 
          ref={cardRef}
          id="member-id-card"
          className="w-[640px] h-[400px] bg-white rounded-2xl border-2 border-[#0B5C9E] shadow-xl overflow-hidden relative select-none flex flex-col justify-between shrink-0"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {/* Header Banner - Deep Royal Blue */}
          <div className="bg-[#0B5C9E] text-white px-4 py-2.5 relative flex items-center justify-between border-b-2 border-[#024378]">
            {/* Left Emblem Logo */}
            <div className="w-14 h-14 rounded-full bg-white/10 p-0.5 border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
              <svg viewBox="0 0 100 100" className="w-12 h-12">
                <circle cx="50" cy="50" r="46" fill="#F4F9FD" stroke="#0B5C9E" strokeWidth="3" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#E65100" strokeWidth="2" strokeDasharray="3 3" />
                <path d="M 50 14 A 36 36 0 0 1 86 50 A 36 36 0 0 1 50 86 A 36 36 0 0 1 14 50 A 36 36 0 0 1 50 14" fill="none" stroke="#0B5C9E" strokeWidth="3" />
                <polygon points="50,22 55,34 68,34 58,42 62,55 50,47 38,55 42,42 32,34 45,34" fill="#FFC107" stroke="#D32F2F" strokeWidth="1" />
                <circle cx="50" cy="50" r="14" fill="#0B5C9E" />
                <circle cx="50" cy="50" r="8" fill="#4CAF50" />
              </svg>
            </div>

            {/* Header Titles */}
            <div className="text-center flex-1 px-2">
              <h1 className="text-[17px] font-black tracking-wider uppercase text-white font-serif leading-tight drop-shadow-xs">
                DIRECT PEOPLE SUPPORT WELFARE TEAM
              </h1>
              <p className="text-[11px] font-bold text-[#FFEB3B] tracking-wide mt-0.5">
                Affiliated: Jan Sewa Charitable Trust (Reg.)
              </p>
              <p className="text-[9.5px] font-medium text-stone-100 tracking-tight leading-tight mt-0.5">
                Head office: Harpur Luhasi Gorakhpur UP 273152
              </p>
              <div className="flex items-center justify-center gap-3 text-[9px] text-stone-100 font-medium leading-tight mt-0.5">
                <span>Email: info@jsct.in</span>
                <span>•</span>
                <span>Mob.no. 9005088708, 7522031956, 9264945875</span>
              </div>
            </div>

            {/* Verification QR Code in Top Right Header */}
            <div className="w-12 h-12 bg-white p-0.5 rounded-lg border border-white/40 shadow-xs flex items-center justify-center shrink-0">
              {qrCodeDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrCodeDataUrl} alt="Verify QR" className="w-full h-full object-contain" />
              ) : (
                <QrIcon className="w-8 h-8 text-[#0B5C9E]" />
              )}
            </div>
          </div>

          {/* Card Body - Left details table + Right photo box */}
          <div className="flex-1 p-4 flex items-stretch justify-between relative bg-white">
            
            {/* Watermark in background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-80 h-80">
                <circle cx="50" cy="50" r="45" fill="#0B5C9E" />
              </svg>
            </div>

            {/* Left Column: Member Attributes Grid */}
            <div className="w-[66%] pr-3 text-[13px] text-stone-900 flex flex-col justify-between z-10">
              <div className="space-y-1 font-medium">
                
                <div className="flex items-center">
                  <span className="w-28 font-bold text-stone-900 text-[14px]">Name</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="font-bold text-stone-950 text-[14px] truncate capitalize">
                    {member.full_name}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="w-28 font-bold text-stone-900">Gender</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="text-stone-800 capitalize">{member.gender || 'male'}</span>
                </div>

                <div className="flex items-center">
                  <span className="w-28 font-bold text-stone-900">Mobile</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="text-stone-900 font-mono font-semibold tracking-wide">
                    {member.mobile}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="w-28 font-bold text-stone-900">Email</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="text-stone-800 text-[12px] truncate">
                    {member.email || (member.full_name.toLowerCase().replace(/\s+/g, '.') + '@jsct.in')}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="w-28 font-bold text-stone-900">Unique ID</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="font-bold text-[#0B5C9E] font-mono tracking-wider text-[14px]">
                    {member.member_id}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="w-28 font-bold text-stone-900">DOB</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="text-stone-800 font-mono">{formattedDob}</span>
                </div>

                <div className="flex items-center">
                  <span className="w-28 font-bold text-stone-900">District</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="text-stone-800 font-medium">{member.district || 'Gorakhpur'}</span>
                </div>

                <div className="flex items-center">
                  <span className="w-28 font-bold text-stone-900">Block</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="text-stone-800 font-medium">{member.block || 'City Block'}</span>
                </div>

                <div className="flex items-center">
                  <span className="w-28 font-bold text-stone-900">Registered On</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="text-stone-800 font-mono">{formattedRegDate}</span>
                </div>

              </div>
            </div>

            {/* Right Column: Photo Box + Secretary Signature + Website */}
            <div className="w-[34%] pl-3 flex flex-col items-center justify-between border-l border-stone-200 z-10">
              
              {/* Member Photo Box */}
              <div className="w-32 h-36 rounded-lg border-2 border-[#0B5C9E] bg-stone-50 flex flex-col items-center justify-center overflow-hidden shadow-xs relative">
                {member.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={member.photo_url} 
                    alt={member.full_name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-stone-400">
                    <span className="text-base font-black tracking-widest text-stone-500 font-serif">
                      PHOTO
                    </span>
                  </div>
                )}

                {/* Verification badge stamp */}
                {member.is_active && (
                  <div className="absolute top-1 right-1 bg-emerald-600 text-white p-0.5 rounded-full shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Authorized Signature Area */}
              <div className="text-center mt-2 flex flex-col items-center">
                <div className="font-serif italic text-lg font-bold text-[#0B5C9E] -rotate-3 select-none leading-none tracking-tight">
                  Gupta
                </div>
                <div className="w-28 border-b border-stone-800 my-0.5"></div>
                <p className="text-[12px] font-bold text-stone-900 leading-tight">Vivek Gupta</p>
                <p className="text-[10px] font-semibold text-stone-600 leading-tight">General Secretary</p>
                <p className="text-[10px] font-bold text-[#0B5C9E] mt-1 tracking-wide">
                  Visit us on : www.jsct.in
                </p>
              </div>

            </div>

          </div>

          {/* Verification Watermark Footer */}
          <div className="bg-stone-50 px-4 py-1 text-[9px] text-stone-500 flex items-center justify-between border-t border-stone-200 font-mono">
            <span>JSCT-SECURITY-HASH: {member.id.slice(0, 8).toUpperCase()}</span>
            <span>{member.is_active ? '• VERIFIED OFFICIAL MEMBER' : '• PENDING VERIFICATION'}</span>
            <span>LOCK-IN EXPIRY: {new Date(member.lock_in_end_date).toISOString().split('T')[0]}</span>
          </div>

        </div>
      </div>

      {/* Admin Verification Toggle (Visible only in Admin Mode) */}
      {showAdminControls && onVerifyToggle && (
        <div className="bg-stone-50 border border-stone-200 p-4 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-stone-700" />
            <div>
              <p className="text-sm font-bold text-stone-900">सदस्य शुल्क व खाता सत्यापन (Payment & Account Status)</p>
              <p className="text-xs text-stone-500">
                वर्तमान स्थिति: {member.is_active ? 'सत्यापित व सक्रिय (Verified & Active)' : 'सत्यापन प्रतीक्षारत (Pending Verification)'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onVerifyToggle(!member.is_active)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              member.is_active
                ? 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {member.is_active ? 'सत्यापन रद्द करें (Revoke)' : 'शुल्क व सदस्यता सत्यापित करें (Verify Member)'}
          </button>
        </div>
      )}

    </div>
  );
}
