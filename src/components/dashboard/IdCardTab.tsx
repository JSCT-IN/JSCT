'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Member } from '@/types';
import {
  Download,
  Printer,
  ShieldCheck,
  CreditCard,
  QrCode,
  CheckCircle2,
  Sparkles,
  Loader2,
  User,
  HeartHandshake
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { formatDate } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface IdCardTabProps {
  member: Member;
}

export default function IdCardTab({ member }: IdCardTabProps) {
  const { lang } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<'png' | 'pdf' | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const memberId = member.membership_id || member.id.slice(0, 8);
  const poolName = member.pool || 'Pool C';

  // Generate dynamic QR code pointing to verification page
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://jsct.org.in';
    const verifyUrl = `${origin}/verify/${memberId}`;

    QRCode.toDataURL(verifyUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: '#1A1917',
        light: '#FFFFFF',
      },
    })
      .then(setQrCodeDataUrl)
      .catch(console.error);
  }, [memberId]);

  // Export card as PNG
  const handleDownloadPNG = async () => {
    if (!cardRef.current) return;
    setIsExporting('png');
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
      });
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `JSCT-ID-CARD-${memberId}.png`;
      link.href = image;
      link.click();
    } catch (err) {
      console.error('Export PNG failed:', err);
    } finally {
      setIsExporting(null);
    }
  };

  // Export card as PDF
  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    setIsExporting('pdf');
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 53.98], // CR-80 Standard ID Card dimensions
      });
      pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);
      pdf.save(`JSCT-ID-CARD-${memberId}.pdf`);
    } catch (err) {
      console.error('Export PDF failed:', err);
    } finally {
      setIsExporting(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto animate-fade-in">
      
      {/* Top Header Matching Screenshot 3: Trust Name & Download Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-border/80 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-charcoal tracking-tight font-editorial">
            Jan Seva Charitable Trust (JSCT)
          </h2>
          <p className="text-xs text-driftwood mt-0.5">
            डिजिटल सदस्य पहचान पत्र • उत्तर प्रदेश शासन एवं सार्वजनिक कल्याण प्रकोष्ठ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExporting !== null}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-warm active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isExporting === 'pdf' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Download ID Card (PDF)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPNG}
            disabled={isExporting !== null}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-stone-border text-charcoal hover:bg-canvas font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-1.5"
          >
            {isExporting === 'png' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>PNG</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="p-2.5 rounded-xl bg-white border border-stone-border text-driftwood hover:text-charcoal hover:bg-canvas transition-all"
            title="प्रिंट करें"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Graphic ID Card Preview (Printable Card) */}
      <div className="flex justify-center py-2">
        <div
          ref={cardRef}
          className="w-full max-w-[480px] rounded-3xl bg-gradient-to-br from-[#1C1A27] via-[#2D223B] to-[#1C1A27] text-white p-5 sm:p-6 shadow-2xl border border-white/20 relative overflow-hidden select-none"
        >
          {/* Hologram top highlight */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-emerald-400 to-terracotta" />

          {/* Card Top Branding */}
          <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-terracotta to-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-editorial text-sm sm:text-base font-black tracking-tight leading-none text-white">
                  JAN SEVA CHARITABLE TRUST
                </h3>
                <span className="text-[10px] text-amber-200/90 font-medium tracking-wider">
                  जन सेवा चैरिटेबल ट्रस्ट (JSCT)
                </span>
              </div>
            </div>

            <div className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold shrink-0">
              [{poolName}]
            </div>
          </div>

          {/* Card Body */}
          <div className="py-4 grid grid-cols-12 gap-3 items-center">
            {/* Photo Avatar */}
            <div className="col-span-4 sm:col-span-3 flex flex-col items-center gap-1.5">
              <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-white/10 border-2 border-white/30 overflow-hidden flex items-center justify-center shadow-inner relative">
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-white/50" />
                )}
                <div className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-[8px] font-bold text-center py-0.5 uppercase tracking-wider text-white">
                  सत्यापित
                </div>
              </div>
            </div>

            {/* Member Details */}
            <div className="col-span-8 sm:col-span-6 space-y-1 text-xs">
              <div>
                <span className="text-[10px] text-white/60 block uppercase font-mono">नाम / Full Name</span>
                <span className="font-bold text-white text-sm sm:text-base truncate block leading-tight">
                  {member.full_name}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-white/60 block uppercase font-mono">Unique ID / सदस्यता सं.</span>
                <span className="font-mono font-bold text-amber-300 text-sm tracking-wide">
                  {memberId}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-white/60 block uppercase font-mono">विभाग / कार्यस्थल</span>
                <span className="text-[11px] text-white/90 truncate block">
                  {member.working_office || member.department || 'Private Job'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-white/60 block uppercase font-mono">जिला / District</span>
                <span className="text-[11px] text-white/90">
                  {member.district || 'Maharajganj'} ({member.block_name || 'Block'})
                </span>
              </div>
            </div>

            {/* Verification QR */}
            <div className="hidden sm:flex col-span-3 flex-col items-center justify-center gap-1">
              <div className="p-1.5 rounded-xl bg-white shadow-md">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="QR Code" className="w-16 h-16" />
                ) : (
                  <QrCode className="w-16 h-16 text-black" />
                )}
              </div>
              <span className="text-[9px] font-mono text-white/60">SCAN TO VERIFY</span>
            </div>
          </div>

          {/* Card Footer */}
          <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[10px] text-white/70">
            <div>
              <span className="block text-white/50">वैधता / Valid Thru</span>
              <span className="font-mono font-bold text-emerald-300">
                {formatDate(member.fee_expires_at)}
              </span>
            </div>

            <div className="text-right">
              <span className="block text-white/50">अधिकृत मुहर</span>
              <span className="font-serif italic font-bold text-amber-200">Saleha Khatoon (Pres.)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Member Details Table Matching Screenshot 3 */}
      <div className="bg-white rounded-3xl border border-stone-border/80 shadow-warm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-border/80 bg-canvas-inset/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-terracotta" />
            <span>सदस्यता विवरण तालिका (Member Identification Record)</span>
          </h3>
          <span className="text-xs font-mono font-semibold text-driftwood">JSCT Master Registry</span>
        </div>

        <div className="divide-y divide-stone-border/60 text-xs sm:text-sm">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-3.5 hover:bg-canvas-inset/30 transition-colors">
            <div className="font-bold text-charcoal">Name</div>
            <div className="sm:col-span-2 text-charcoal font-semibold">{member.full_name}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-3.5 hover:bg-canvas-inset/30 transition-colors bg-stone-50/50">
            <div className="font-bold text-charcoal">Gender</div>
            <div className="sm:col-span-2 text-charcoal capitalize">{member.gender || 'male'}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-3.5 hover:bg-canvas-inset/30 transition-colors">
            <div className="font-bold text-charcoal">Mobile</div>
            <div className="sm:col-span-2 font-mono font-semibold text-charcoal">{member.phone || '9559230452'}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-3.5 hover:bg-canvas-inset/30 transition-colors bg-stone-50/50">
            <div className="font-bold text-charcoal">Email</div>
            <div className="sm:col-span-2 font-mono text-charcoal">{member.email || 'ambrishkumar245@gmail.com'}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-3.5 hover:bg-canvas-inset/30 transition-colors">
            <div className="font-bold text-charcoal">Unique ID</div>
            <div className="sm:col-span-2 font-mono font-bold text-terracotta">{memberId}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-3.5 hover:bg-canvas-inset/30 transition-colors bg-stone-50/50">
            <div className="font-bold text-charcoal">DOB</div>
            <div className="sm:col-span-2 font-mono text-charcoal">{member.dob || '08-07-1996'}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-3.5 hover:bg-canvas-inset/30 transition-colors">
            <div className="font-bold text-charcoal">Address</div>
            <div className="sm:col-span-2 text-charcoal leading-relaxed">
              {member.address || 'Village Kamhariya buzurg post Kamhariya buzurg district maharajganj 273162'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-3.5 hover:bg-canvas-inset/30 transition-colors bg-stone-50/50">
            <div className="font-bold text-charcoal">District</div>
            <div className="sm:col-span-2 text-charcoal font-semibold">{member.district || 'Maharajganj'}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-3.5 hover:bg-canvas-inset/30 transition-colors">
            <div className="font-bold text-charcoal">Block</div>
            <div className="sm:col-span-2 text-charcoal font-semibold uppercase">{member.block_name || 'BRIDGEMANGANJ'}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-3.5 hover:bg-canvas-inset/30 transition-colors bg-stone-50/50">
            <div className="font-bold text-charcoal">Pool Category</div>
            <div className="sm:col-span-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-emerald-100 text-emerald-800">
                {poolName} (सक्रिय सदस्य)
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
