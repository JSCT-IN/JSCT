'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DPSWTStore } from '@/lib/store';
import { Member, Appeal, DonationRecord, ComplianceData } from '@/types';
import { logoutAction } from '@/actions/auth-actions';
import { supabase } from '@/lib/supabase/client';
import { INITIAL_MEMBERS } from '@/lib/mockData';

// Dashboard Components
import MemberTopNav from '@/components/dashboard/MemberTopNav';
import MemberSidebar, { DashboardTab } from '@/components/dashboard/MemberSidebar';
import OverviewTab from '@/components/dashboard/OverviewTab';
import ProfileTab from '@/components/dashboard/ProfileTab';
import IdCardTab from '@/components/dashboard/IdCardTab';
import { UploadReceiptView, SahyogListView } from '@/components/dashboard/SahyogModuleTabs';
import UploadVarshikDanTab from '@/components/dashboard/UploadVarshikDanTab';
import VarshikDanListTab from '@/components/dashboard/VarshikDanListTab';
import ReferralPointsTab from '@/components/dashboard/ReferralPointsTab';
import UpdatePasswordTab from '@/components/dashboard/UpdatePasswordTab';

// Shared Modals
import UpiModal from '@/components/UpiModal';
import SlipUploadModal from '@/components/SlipUploadModal';
import { Loader2 } from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active Tab: check query parameter or default to 'overview'
  const paramTab = (searchParams.get('tab') as DashboardTab) || 'overview';
  const [activeTab, setActiveTab] = useState<DashboardTab>(paramTab);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [compliance, setCompliance] = useState<ComplianceData | null>(null);
  const [userDonations, setUserDonations] = useState<DonationRecord[]>([]);
  const [allAppeals, setAllAppeals] = useState<Appeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedAppealForUpi, setSelectedAppealForUpi] = useState<Appeal | null>(null);
  const [selectedAppealForSlip, setSelectedAppealForSlip] = useState<Appeal | null>(null);

  // Sync tab with URL if it changes
  useEffect(() => {
    if (paramTab && paramTab !== activeTab) {
      setActiveTab(paramTab);
    }
  }, [paramTab]);

  const handleSelectTab = (tab: DashboardTab) => {
    setActiveTab(tab);
    window.history.pushState(null, '', `/dashboard?tab=${tab}`);
  };

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (e) {
      console.warn('Logout action notice:', e);
    }
    DPSWTStore.logout();
    router.push('/login');
  };

  // Sync Data
  const syncData = async () => {
    let localUser = DPSWTStore.getCurrentUser();

    // If no user in local store, default to Ambrish Kumar (or first member) so user can immediately view portal
    if (!localUser) {
      const ambrish = INITIAL_MEMBERS.find((m) => m.membership_id === '15480406') || INITIAL_MEMBERS[0];
      if (ambrish) {
        DPSWTStore.setCurrentUser(ambrish.id);
        localUser = ambrish;
      }
    }

    if (!localUser) {
      router.push('/login');
      return;
    }

    try {
      // 1. Fetch member profile from Supabase if available
      const { data: memberData } = await supabase
        .from('members')
        .select('*')
        .eq('id', localUser.id)
        .maybeSingle();

      let userObj: Member = localUser;
      if (memberData) {
        userObj = {
          ...localUser,
          full_name: memberData.full_name || localUser.full_name,
          phone: memberData.mobile || localUser.phone,
          email: memberData.email || localUser.email,
          membership_id: memberData.member_id || localUser.membership_id,
          district: memberData.district || localUser.district,
          state: memberData.state || localUser.state,
          address: memberData.permanent_address || localUser.address,
          working_office: memberData.department || localUser.working_office,
          fee_expires_at: memberData.fee_expires_at || localUser.fee_expires_at,
          is_active: memberData.is_active !== undefined ? memberData.is_active : localUser.is_active,
        };
      }

      setCurrentUser(userObj);

      // 2. Fetch appeals
      const appealsList = DPSWTStore.getAppeals();
      setAllAppeals(appealsList);

      // 3. Fetch user donations
      const donationsList = DPSWTStore.getDonationsByDonor(userObj.id);
      setUserDonations(donationsList);

      // 4. Calculate compliance
      const comp = DPSWTStore.calculateCompliance(userObj.id);
      setCompliance(comp);
    } catch {
      // Fallback
      setCurrentUser(localUser);
      setAllAppeals(DPSWTStore.getAppeals());
      setUserDonations(DPSWTStore.getDonationsByDonor(localUser.id));
      setCompliance(DPSWTStore.calculateCompliance(localUser.id));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    syncData();
    window.addEventListener('dpswt_state_change', syncData);
    return () => window.removeEventListener('dpswt_state_change', syncData);
  }, []);

  if (isLoading || !currentUser || !compliance) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-8 h-8 text-terracotta animate-spin" />
        <p className="text-xs font-bold text-driftwood tracking-wide">
          सदस्य पोर्टल लोड हो रहा है (Loading JSCT Portal)...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col antialiased">
      
      {/* Member Sidebar (Fixed Desktop, Drawer Mobile) */}
      <MemberSidebar
        member={currentUser}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Layout Area (Offset by lg:pl-72 for sidebar) */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0 transition-all duration-300">
        
        {/* Top Navbar */}
        <MemberTopNav
          member={currentUser}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onLogout={handleLogout}
        />

        {/* Content View Container */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          
          {/* Module 1: Overview / Dashboard */}
          {activeTab === 'overview' && (
            <OverviewTab
              member={currentUser}
              compliance={compliance}
              userDonations={userDonations}
              allAppeals={allAppeals}
              onSelectTab={handleSelectTab}
              onOpenUpiModal={(appeal) => setSelectedAppealForUpi(appeal)}
              onOpenSlipModal={(appeal) => setSelectedAppealForSlip(appeal)}
            />
          )}

          {/* Module 2: Profile (Edit User) */}
          {activeTab === 'profile' && (
            <ProfileTab
              member={currentUser}
              onProfileUpdated={(updated) => {
                setCurrentUser(updated);
                syncData();
              }}
            />
          )}

          {/* Module 3: ID Card */}
          {activeTab === 'id-card' && (
            <IdCardTab member={currentUser} />
          )}

          {/* Module 4: Upload Death Receipt */}
          {activeTab === 'upload-death-receipt' && (
            <UploadReceiptView
              member={currentUser}
              appeals={allAppeals}
              schemeType="BEREAVEMENT"
              onSuccess={() => {
                syncData();
                handleSelectTab('sahyog-list');
              }}
            />
          )}

          {/* Module 5: View All Sahyog List */}
          {activeTab === 'sahyog-list' && (
            <SahyogListView
              member={currentUser}
              appeals={allAppeals}
              userDonations={userDonations}
              schemeType="BEREAVEMENT"
              onPayAppeal={(appeal) => setSelectedAppealForUpi(appeal)}
              onUploadAppealSlip={(appeal) => setSelectedAppealForSlip(appeal)}
            />
          )}

          {/* Module 6: Upload Beti Vivah Receipt */}
          {activeTab === 'upload-beti-vivah' && (
            <UploadReceiptView
              member={currentUser}
              appeals={allAppeals}
              schemeType="DAUGHTER_MARRIAGE"
              onSuccess={() => {
                syncData();
                handleSelectTab('beti-vivah-list');
              }}
            />
          )}

          {/* Module 7: View All Beti Vivah List */}
          {activeTab === 'beti-vivah-list' && (
            <SahyogListView
              member={currentUser}
              appeals={allAppeals}
              userDonations={userDonations}
              schemeType="DAUGHTER_MARRIAGE"
              onPayAppeal={(appeal) => setSelectedAppealForUpi(appeal)}
              onUploadAppealSlip={(appeal) => setSelectedAppealForSlip(appeal)}
            />
          )}

          {/* Module 8: Upload Varshik Dan / Renewal */}
          {activeTab === 'upload-varshik-dan' && (
            <UploadVarshikDanTab
              member={currentUser}
              onSuccess={() => {
                syncData();
                handleSelectTab('varshik-dan-list');
              }}
            />
          )}

          {/* Module 9: View All Varshik Dan Suchi */}
          {activeTab === 'varshik-dan-list' && (
            <VarshikDanListTab
              member={currentUser}
              onGoToUpload={() => handleSelectTab('upload-varshik-dan')}
            />
          )}

          {/* Module 10: Referral Points */}
          {activeTab === 'referral-points' && (
            <ReferralPointsTab
              member={currentUser}
              onRefresh={syncData}
            />
          )}

          {/* Module 11: Update Password */}
          {activeTab === 'update-password' && (
            <UpdatePasswordTab member={currentUser} />
          )}

        </div>
      </div>

      {/* UPI Scan & Pay Modal */}
      {selectedAppealForUpi && (
        <UpiModal
          appeal={selectedAppealForUpi}
          isOpen={!!selectedAppealForUpi}
          onClose={() => setSelectedAppealForUpi(null)}
          onOpenSlipUpload={() => {
            const appeal = selectedAppealForUpi;
            setSelectedAppealForUpi(null);
            setSelectedAppealForSlip(appeal);
          }}
        />
      )}

      {/* Slip Upload Modal */}
      {selectedAppealForSlip && (
        <SlipUploadModal
          appeal={selectedAppealForSlip}
          isOpen={!!selectedAppealForSlip}
          onClose={() => setSelectedAppealForSlip(null)}
          onSuccess={() => {
            setSelectedAppealForSlip(null);
            syncData();
          }}
        />
      )}

    </div>
  );
}

export default function MemberDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center p-6 text-xs text-driftwood font-bold">
          पोर्टल प्रारंभ हो रहा है...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
