'use client';

import React, { useState } from 'react';
import { Member, VarshikDanRecord } from '@/types';
import {
  ClipboardList,
  CheckCircle2,
  Calendar,
  Clock,
  Eye,
  Download,
  ShieldCheck,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface VarshikDanListTabProps {
  member: Member;
  onGoToUpload: () => void;
}

export default function VarshikDanListTab({ member, onGoToUpload }: VarshikDanListTabProps) {
  const { lang } = useTranslation();
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);

  // Retrieve past renewal records
  const history: VarshikDanRecord[] = member.varshik_dan_history || [
    {
      id: 'vd-001',
      member_id: member.id,
      year: '2026-2027',
      amount: 50,
      utr_number: '444048496291',
      payment_date: member.created_at ? member.created_at.split('T')[0] : '2026-10-14',
      status: 'VERIFIED',
      valid_until: member.fee_expires_at || '2027-10-14',
      slip_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-border/80 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-charcoal tracking-tight font-editorial">
            वार्षिक दान / व्यवस्था शुल्क सूची (Varshik Dan Suchi)
          </h2>
          <p className="text-xs text-driftwood mt-0.5">
            वार्षिक ₹50 अंशदान इतिहास एवं वैधता अवधि रिकॉर्ड
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToUpload}
          className="px-4 py-2 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs shadow-warm flex items-center gap-1.5"
        >
          <span>नया वार्षिक शुल्क जमा करें</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl border border-emerald-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-emerald-950">
              वार्षिक सदस्यता सक्रिय (Annual Membership Active)
            </h3>
            <p className="text-xs text-emerald-800">
              आपकी सदस्यता <strong className="font-mono">{formatDate(member.fee_expires_at)}</strong> तक पूर्णतः सुरक्षित व वैध है।
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-white border border-emerald-300 text-xs font-mono font-bold text-emerald-800 shrink-0">
          शुल्क: ₹50 / वर्ष
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-stone-border/80 shadow-warm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-border/80 bg-canvas-inset/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-terracotta" />
            <span>भुगतान इतिहास (Payment History)</span>
          </h3>
          <span className="text-xs text-driftwood">कुल प्रविष्टियां: {history.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-border/80 bg-stone-50/70 text-charcoal font-bold uppercase text-[11px] tracking-wider">
                <th className="px-6 py-3.5">सत्र (Year)</th>
                <th className="px-6 py-3.5">भुगतान दिनांक</th>
                <th className="px-6 py-3.5">राशि (Amount)</th>
                <th className="px-6 py-3.5">Transaction ID / UTR</th>
                <th className="px-6 py-3.5">वैधता तक (Valid Until)</th>
                <th className="px-6 py-3.5">स्थिति</th>
                <th className="px-6 py-3.5 text-right">रसीद</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-border/60">
              {history.map((rec) => (
                <tr key={rec.id} className="hover:bg-canvas-inset/30 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-charcoal">{rec.year}</td>
                  <td className="px-6 py-4 font-mono text-driftwood">{formatDate(rec.payment_date)}</td>
                  <td className="px-6 py-4 font-mono font-bold text-charcoal">₹{rec.amount}</td>
                  <td className="px-6 py-4 font-mono text-charcoal">{rec.utr_number}</td>
                  <td className="px-6 py-4 font-mono text-emerald-700 font-bold">{formatDate(rec.valid_until)}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{rec.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {rec.slip_url ? (
                      <button
                        type="button"
                        onClick={() => setSelectedSlip(rec.slip_url || '')}
                        className="px-2.5 py-1 rounded-lg border border-stone-border hover:bg-canvas font-bold text-xs text-charcoal inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-terracotta" />
                        <span>देखें</span>
                      </button>
                    ) : (
                      <span className="text-driftwood">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Lightbox */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-sm text-charcoal">वार्षिक व्यवस्था शुल्क रसीद</h4>
              <button
                type="button"
                onClick={() => setSelectedSlip(null)}
                className="text-driftwood hover:text-charcoal font-bold text-sm"
              >
                ✕ बंद करें
              </button>
            </div>
            <div className="rounded-2xl border overflow-hidden max-h-[70vh] flex items-center justify-center bg-stone-50">
              <img src={selectedSlip} alt="Slip" className="max-w-full max-h-full object-contain" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
