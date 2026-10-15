export type MemberRole = 'MEMBER' | 'INSPECTOR' | 'ADMIN';

export type AppealType = 'BEREAVEMENT' | 'DAUGHTER_MARRIAGE';

export type AppealStatus = 'SUBMITTED' | 'ACTIVE' | 'CLOSED';

export type DonationStatus = 'SUBMITTED' | 'VERIFIED' | 'REJECTED';

export interface Nominee {
  id: string;
  member_id: string;
  full_name: string;
  relationship: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string;
  is_primary?: boolean;
}

export interface VarshikDanRecord {
  id: string;
  member_id: string;
  year: string;
  amount: number;
  utr_number: string;
  payment_date: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  valid_until: string;
  slip_url?: string;
  created_at?: string;
}

export interface WithdrawalRecord {
  id: string;
  member_id: string;
  amount: number;
  upi_id: string;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED';
  requested_at: string;
  processed_at?: string;
  remarks?: string;
}

export interface Member {
  id: string;
  membership_id: string;
  full_name: string;
  phone: string;
  email?: string;
  aadhaar_last4: string;
  aadhaar_hash?: string;
  aadhaar_full?: string;
  department: string;
  district: string;
  state: string;
  role: MemberRole;
  avatar_url?: string;
  fee_expires_at: string;
  is_active: boolean;
  created_at: string;
  nominee?: Nominee;

  // Detailed profile fields from member screenshots
  father_name?: string;
  dob?: string;
  gender?: string;
  business?: string;
  private_department?: string;
  working_office?: string;
  block_name?: string;
  address?: string;
  pool?: string;
  password?: string;
  password_hash?: string;

  // Referral system
  referral_code?: string;
  referred_by?: string;
  referral_count?: number;
  referral_earnings?: number;
  referral_withdrawable?: number;
  referral_locked?: number;

  // Renewal & Withdrawal history
  varshik_dan_history?: VarshikDanRecord[];
  withdrawal_history?: WithdrawalRecord[];
}

export interface Appeal {
  id: string;
  code: string;
  member_id: string;
  member_name?: string;
  type: AppealType;
  title: string;
  description: string;
  target_amount: number;
  collected_amount: number;
  status: AppealStatus;
  inspector_name: string;
  inspector_phone: string;
  inspector_notes?: string;
  event_date: string;
  nominee_snapshot: {
    full_name: string;
    relationship: string;
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    upi_id: string;
  };
  supporting_docs?: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  created_at: string;
  closed_at?: string;
}

export interface DonationRecord {
  id: string;
  appeal_id: string;
  appeal_code?: string;
  appeal_title?: string;
  donor_id: string;
  donor_name?: string;
  donor_membership_id?: string;
  amount: number;
  utr_number: string;
  slip_url: string;
  status: DonationStatus;
  inspector_notes?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export interface ComplianceData {
  total_appeals: number;
  contributed_appeals: number;
  ratio: number;
  is_eligible: boolean;
  fee_valid: boolean;
  days_until_renewal: number;
  qualifies_75: boolean;
}

export interface Coordinator {
  id: string;
  name: string;
  designation: string;
  district: string;
  division: string;
  phone: string;
  whatsapp: string;
  email: string;
  is_state_nodal?: boolean;
}
