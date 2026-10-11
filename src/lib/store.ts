'use client';

import { Appeal, DonationRecord, Member, ComplianceData } from '@/types';
import { INITIAL_MEMBERS, INITIAL_APPEALS, INITIAL_DONATIONS } from './mockData';

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'dpswt_current_user_id',
  APPEALS: 'dpswt_appeals_v1',
  DONATIONS: 'dpswt_donations_v1',
  MEMBERS: 'dpswt_members_v1',
};

// Safe localStorage accessor
function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('dpswt_state_change'));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export const DPSWTStore = {
  // Members
  getMembers(): Member[] {
    return getStorageItem<Member[]>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
  },

  getCurrentUser(): Member | null {
    if (typeof window === 'undefined') return INITIAL_MEMBERS[0];
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (currentId === '__LOGGED_OUT__') {
      return null;
    }
    const members = this.getMembers();
    if (!currentId) {
      return INITIAL_MEMBERS[0];
    }
    const found = members.find((m) => m.id === currentId);
    return found || null;
  },

  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return currentId !== '__LOGGED_OUT__' && !!currentId;
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, '__LOGGED_OUT__');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('adminToken');
      window.dispatchEvent(new Event('dpswt_state_change'));
    }
  },

  setCurrentUser(userId: string): void {
    setStorageItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  },

  registerMember(newMember: Omit<Member, 'id' | 'created_at'>): Member {
    const members = this.getMembers();
    const created: Member = {
      ...newMember,
      id: 'usr_' + Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    members.push(created);
    setStorageItem(STORAGE_KEYS.MEMBERS, members);
    this.setCurrentUser(created.id);
    return created;
  },

  // Appeals
  getAppeals(): Appeal[] {
    return getStorageItem<Appeal[]>(STORAGE_KEYS.APPEALS, INITIAL_APPEALS);
  },

  getAppealById(id: string): Appeal | undefined {
    const appeals = this.getAppeals();
    return appeals.find((a) => a.id === id || a.code.toLowerCase() === id.toLowerCase());
  },

  createAppeal(appealData: Omit<Appeal, 'id' | 'created_at' | 'collected_amount'>): Appeal {
    const appeals = this.getAppeals();
    const newAppeal: Appeal = {
      ...appealData,
      id: 'appeal_' + Date.now().toString(),
      collected_amount: 0,
      created_at: new Date().toISOString(),
    };
    appeals.unshift(newAppeal);
    setStorageItem(STORAGE_KEYS.APPEALS, appeals);
    return newAppeal;
  },

  // Donations
  getDonations(): DonationRecord[] {
    return getStorageItem<DonationRecord[]>(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
  },

  getDonationsByDonor(donorId: string): DonationRecord[] {
    const donations = this.getDonations();
    return donations.filter((d) => d.donor_id === donorId);
  },

  getDonationsByAppeal(appealId: string): DonationRecord[] {
    const donations = this.getDonations();
    return donations.filter((d) => d.appeal_id === appealId);
  },

  submitDonation(payload: {
    appeal_id: string;
    utr_number: string;
    slip_url: string;
    amount?: number;
  }): DonationRecord {
    const donations = this.getDonations();
    const appeals = this.getAppeals();
    const currentUser = this.getCurrentUser();

    // Check for duplicate UTR
    const existing = donations.find((d) => d.utr_number === payload.utr_number);
    if (existing) {
      throw new Error(`यह UTR क्रमांक (${payload.utr_number}) पहले ही पोर्टल पर दर्ज किया जा चुका है!`);
    }

    const appeal = appeals.find((a) => a.id === payload.appeal_id);

    const record: DonationRecord = {
      id: 'don_' + Date.now().toString(),
      appeal_id: payload.appeal_id,
      appeal_code: appeal?.code || 'DPSWT-APP',
      appeal_title: appeal?.title || 'Welfare Contribution',
      donor_id: currentUser.id,
      donor_name: currentUser.full_name,
      donor_membership_id: currentUser.membership_id,
      amount: payload.amount || 50,
      utr_number: payload.utr_number,
      slip_url: payload.slip_url,
      status: 'SUBMITTED',
      created_at: new Date().toISOString(),
    };

    donations.unshift(record);
    setStorageItem(STORAGE_KEYS.DONATIONS, donations);
    return record;
  },

  verifyDonation(donationId: string, inspectorName: string, notes?: string): void {
    const donations = this.getDonations();
    const appeals = this.getAppeals();

    const recordIndex = donations.findIndex((d) => d.id === donationId);
    if (recordIndex === -1) return;

    const record = donations[recordIndex];
    record.status = 'VERIFIED';
    record.inspector_notes = notes || 'बैंक पासबुक प्रविष्टि से मिलान पूर्ण। अनुमोदित।';
    record.verified_by = inspectorName;
    record.verified_at = new Date().toISOString();

    // Increment collected_amount of the appeal
    const appeal = appeals.find((a) => a.id === record.appeal_id);
    if (appeal) {
      appeal.collected_amount += record.amount;
      if (appeal.collected_amount >= appeal.target_amount) {
        appeal.status = 'CLOSED';
        appeal.closed_at = new Date().toISOString();
      }
      setStorageItem(STORAGE_KEYS.APPEALS, appeals);
    }

    setStorageItem(STORAGE_KEYS.DONATIONS, donations);
  },

  rejectDonation(donationId: string, reason: string): void {
    const donations = this.getDonations();
    const recordIndex = donations.findIndex((d) => d.id === donationId);
    if (recordIndex === -1) return;

    donations[recordIndex].status = 'REJECTED';
    donations[recordIndex].inspector_notes = reason || 'बैंक खाता पासबुक में UTR संख्या अनुपलब्ध।';
    donations[recordIndex].verified_at = new Date().toISOString();

    setStorageItem(STORAGE_KEYS.DONATIONS, donations);
  },

  // 75% Compliance Engine Calculation
  calculateCompliance(memberId: string): ComplianceData {
    const appeals = this.getAppeals();
    const donations = this.getDonations();
    const member = this.getMembers().find((m) => m.id === memberId) || this.getCurrentUser();

    // All active or closed appeals count towards required participation
    const eligibleAppeals = appeals.filter((a) => a.status === 'ACTIVE' || a.status === 'CLOSED');
    const totalAppeals = Math.max(eligibleAppeals.length, 1);

    // Appeals this member has contributed to (VERIFIED or SUBMITTED)
    const contributedAppealIds = new Set(
      donations
        .filter((d) => d.donor_id === memberId && (d.status === 'VERIFIED' || d.status === 'SUBMITTED'))
        .map((d) => d.appeal_id)
    );

    const contributedCount = contributedAppealIds.size;
    const ratio = Math.min(100, Math.round((contributedCount / totalAppeals) * 100));
    const qualifies_75 = ratio >= 75;

    // Check fee validity
    const expiresAt = new Date(member.fee_expires_at).getTime();
    const now = Date.now();
    const fee_valid = expiresAt > now;
    const days_until_renewal = Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)));

    const is_eligible = qualifies_75 && fee_valid;

    return {
      total_appeals: totalAppeals,
      contributed_appeals: contributedCount,
      ratio,
      is_eligible,
      fee_valid,
      days_until_renewal,
      qualifies_75,
    };
  },

  resetToInitial(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.APPEALS);
    localStorage.removeItem(STORAGE_KEYS.DONATIONS);
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    window.dispatchEvent(new Event('dpswt_state_change'));
  },
};
