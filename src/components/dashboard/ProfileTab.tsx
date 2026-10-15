'use client';

import React, { useState } from 'react';
import { Member } from '@/types';
import { updateMemberProfileAction } from '@/actions/member-actions';
import { DPSWTStore } from '@/lib/store';
import {
  User,
  AlertTriangle,
  Lock,
  Save,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Building,
  Briefcase,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
  Loader2
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface ProfileTabProps {
  member: Member;
  onProfileUpdated: (updated: Member) => void;
}

export default function ProfileTab({ member, onProfileUpdated }: ProfileTabProps) {
  const { lang } = useTranslation();

  // Calculate 7-day restriction rule
  const registrationDate = member.created_at ? new Date(member.created_at) : new Date(Date.now() - 30 * 86400000);
  const daysSinceReg = Math.floor((Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));
  const isRestrictedExpired = daysSinceReg >= 7;

  // Form states
  const [mobile, setMobile] = useState(member.phone || '9559230452');
  const [gender, setGender] = useState(member.gender || 'Male');
  const [business, setBusiness] = useState(member.business || 'Private Job');
  const [privateDept, setPrivateDept] = useState(member.private_department || 'Others');
  const [workingOffice, setWorkingOffice] = useState(
    member.working_office || 'HDFC BANK USKA BAZAR SIDDHARTHNAGAR'
  );
  const [stateName, setStateName] = useState(member.state || 'Uttar Pradesh');
  const [district, setDistrict] = useState(member.district || 'Maharajganj');
  const [blockName, setBlockName] = useState(member.block_name || 'BRIDGEMANGANJ');
  const [address, setAddress] = useState(
    member.address || 'Village Kamhariya buzurg post Kamhariya buzurg district maharajganj 273162'
  );

  // Nominee states
  const [nomineeName, setNomineeName] = useState(member.nominee?.full_name || 'Banawari Prasad');
  const [nomineeRelation, setNomineeRelation] = useState(member.nominee?.relationship || 'Father');
  const [nomineeMobile, setNomineeMobile] = useState(member.nominee?.account_number ? '9559230452' : '');
  const [nomineeBank, setNomineeBank] = useState(member.nominee?.bank_name || 'State Bank of India');
  const [nomineeAccount, setNomineeAccount] = useState(member.nominee?.account_number || '44404849629');
  const [nomineeIfsc, setNomineeIfsc] = useState(member.nominee?.ifsc_code || 'SBIN0001147');

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await updateMemberProfileAction({
        memberId: member.id,
        mobile,
        gender,
        business,
        privateDepartment: privateDept,
        workingOffice,
        state: stateName,
        district,
        block: blockName,
        address,
        nomineeName,
        nomineeRelation,
        nomineeMobile,
      });

      // Update local client store
      const updated = DPSWTStore.updateMember(member.id, {
        phone: mobile,
        gender,
        business,
        private_department: privateDept,
        working_office: workingOffice,
        state: stateName,
        district,
        block_name: blockName,
        address,
        nominee: {
          id: member.nominee?.id || 'nom-1',
          member_id: member.id,
          full_name: nomineeName,
          relationship: nomineeRelation,
          bank_name: nomineeBank,
          account_number: nomineeAccount,
          ifsc_code: nomineeIfsc,
          upi_id: `${mobile}@upi`,
        },
      });

      setFeedback({
        success: true,
        message: res.message || 'प्रोफ़ाइल विवरण सफलतापूर्वक सुरक्षित कर दिया गया है।',
      });
      onProfileUpdated(updated);
    } catch (err: any) {
      setFeedback({
        success: false,
        message: err.message || 'प्रोफ़ाइल सुरक्षित करने में समस्या आई।',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      
      {/* Breadcrumb matching Screenshot 2: User > Edit User */}
      <div className="flex items-center gap-2 text-xs font-medium text-driftwood">
        <span>User</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-charcoal font-bold">Edit User</span>
      </div>

      {/* Warning Banner matching Screenshot 2 */}
      {isRestrictedExpired ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 sm:p-5 flex items-start gap-3 text-amber-900 shadow-xs">
          <div className="p-2 rounded-xl bg-amber-200/70 text-amber-900 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm">
            <h4 className="font-bold text-amber-950">
              Restricted fields can only be edited within the first 7 days after registration. This period has expired.
            </h4>
            <p className="text-amber-800 text-xs">
              संस्था के नियमानुसार नाम, आधार कार्ड नंबर, पिता का नाम एवं जन्मतिथि पंजीकरण के 7 दिन पश्चात केवल केंद्रीय ट्रस्ट अनुमोदन से ही संशोधित हो सकते हैं। शेष विवरण आप नीचे अपडेट कर सकते हैं।
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/90 p-4 flex items-center gap-3 text-blue-900 text-xs">
          <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0" />
          <span>
            आप पंजीकरण के प्रारंभिक 7 दिनों के भीतर हैं। आप सभी विवरण स्वतंत्र रूप से संशोधित कर सकते हैं।
          </span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-stone-border/80 shadow-warm p-6 sm:p-8 space-y-8">
        
        {/* Section 1: Personal & Identification (Restricted Fields) */}
        <div className="space-y-4">
          <div className="border-b border-stone-border/70 pb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
              <User className="w-4 h-4 text-terracotta" />
              <span>व्यक्तिगत एवं पहचान विवरण (Personal Info)</span>
            </h3>
            {isRestrictedExpired && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                <Lock className="w-3 h-3" />
                <span>प्रतिबंधित फ़ील्ड्स (Locked)</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal flex items-center justify-between">
                <span>Name</span>
                {isRestrictedExpired && <Lock className="w-3 h-3 text-driftwood" />}
              </label>
              <input
                type="text"
                disabled={isRestrictedExpired}
                value={member.full_name}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all font-medium ${
                  isRestrictedExpired
                    ? 'bg-canvas-inset/80 text-driftwood border-stone-border/60 cursor-not-allowed select-none'
                    : 'bg-white text-charcoal border-stone-border focus:ring-2 focus:ring-terracotta/30'
                }`}
              />
            </div>

            {/* Aadhar Card Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal flex items-center justify-between">
                <span>Aadhar Card Number</span>
                {isRestrictedExpired && <Lock className="w-3 h-3 text-driftwood" />}
              </label>
              <input
                type="text"
                disabled={isRestrictedExpired}
                value={member.aadhaar_full || '474715480406'}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono transition-all ${
                  isRestrictedExpired
                    ? 'bg-canvas-inset/80 text-driftwood border-stone-border/60 cursor-not-allowed select-none'
                    : 'bg-white text-charcoal border-stone-border focus:ring-2 focus:ring-terracotta/30'
                }`}
              />
            </div>

            {/* Father Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal flex items-center justify-between">
                <span>Father Name</span>
                {isRestrictedExpired && <Lock className="w-3 h-3 text-driftwood" />}
              </label>
              <input
                type="text"
                disabled={isRestrictedExpired}
                value={member.father_name || 'Banawari Prasad'}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all font-medium ${
                  isRestrictedExpired
                    ? 'bg-canvas-inset/80 text-driftwood border-stone-border/60 cursor-not-allowed select-none'
                    : 'bg-white text-charcoal border-stone-border focus:ring-2 focus:ring-terracotta/30'
                }`}
              />
            </div>

            {/* DOB */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal flex items-center justify-between">
                <span>DOB</span>
                {isRestrictedExpired && <Lock className="w-3 h-3 text-driftwood" />}
              </label>
              <input
                type="date"
                disabled={isRestrictedExpired}
                value={member.dob || '1996-07-08'}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono transition-all ${
                  isRestrictedExpired
                    ? 'bg-canvas-inset/80 text-driftwood border-stone-border/60 cursor-not-allowed select-none'
                    : 'bg-white text-charcoal border-stone-border focus:ring-2 focus:ring-terracotta/30'
                }`}
              />
            </div>

          </div>
        </div>

        {/* Section 2: Contact, Employment & Location (Editable Fields) */}
        <div className="space-y-4">
          <div className="border-b border-stone-border/70 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-terracotta" />
              <span>संपर्क, व्यवसाय व कार्यालय (Contact & Office Details)</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal">Number (पंजीकृत मोबाइल)</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                maxLength={10}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm font-mono text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Business / Employment */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal">Business (कार्य का स्वरूप)</label>
              <select
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
              >
                <option value="Private Job">Private Job</option>
                <option value="Government Service">Government Service</option>
                <option value="Self Employed">Self Employed</option>
                <option value="Business">Business</option>
                <option value="Farmer">Farmer</option>
                <option value="Social Worker">Social Worker</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Private Department */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal">Private Department</label>
              <input
                type="text"
                value={privateDept}
                onChange={(e) => setPrivateDept(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
              />
            </div>

            {/* Working Office */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-charcoal">Working Office (कार्यस्थल का नाम व पता)</label>
              <input
                type="text"
                value={workingOffice}
                onChange={(e) => setWorkingOffice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
              />
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal">State</label>
              <select
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
              >
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Bihar">Bihar</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Delhi">Delhi</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* District */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal">District (जिला)</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
              />
            </div>

            {/* Block */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal">Block (विकास खंड)</label>
              <input
                type="text"
                value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
              />
            </div>

            {/* Full Permanent Address */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-charcoal">Address (स्थायी निवास पता)</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-border text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
              />
            </div>

          </div>
        </div>

        {/* Section 3: Nominee Details */}
        <div className="space-y-4">
          <div className="border-b border-stone-border/70 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>नामिनी विवरण (Nominee & Bank Account)</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal">नामिनी का नाम</label>
              <input
                type="text"
                value={nomineeName}
                onChange={(e) => setNomineeName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal">संबंध (Relationship)</label>
              <input
                type="text"
                value={nomineeRelation}
                onChange={(e) => setNomineeRelation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal">बैंक का नाम</label>
              <input
                type="text"
                value={nomineeBank}
                onChange={(e) => setNomineeBank(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal">खाता संख्या (Account No)</label>
              <input
                type="text"
                value={nomineeAccount}
                onChange={(e) => setNomineeAccount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm font-mono text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal">IFSC Code</label>
              <input
                type="text"
                value={nomineeIfsc}
                onChange={(e) => setNomineeIfsc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm font-mono text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal">नामिनी मोबाइल नंबर</label>
              <input
                type="tel"
                value={nomineeMobile}
                onChange={(e) => setNomineeMobile(e.target.value)}
                maxLength={10}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-border text-sm font-mono text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium ${
              feedback.success
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                : 'bg-rose-50 text-rose-900 border border-rose-300'
            }`}
          >
            {feedback.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="py-3 px-8 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-sm font-bold shadow-warm active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>सुरक्षित हो रहा है...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>विवरण सुरक्षित करें (Save Profile)</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
