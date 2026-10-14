/**
 * Server-side in-memory OTP Store for JSCT Authentication
 * Supports 5-minute TTL, rate limiting, and maximum 5 verification attempts
 */

export interface OtpRecord {
  otp: string;
  memberId: string;
  memberName: string;
  phone: string;
  email?: string | null;
  role: string;
  department: string;
  membershipId: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
}

// Global declaration to maintain store across Fast-Refresh during dev
declare global {
  var _jsct_otp_map: Map<string, OtpRecord> | undefined;
}

const otpStore: Map<string, OtpRecord> = globalThis._jsct_otp_map || new Map();
if (process.env.NODE_ENV !== 'production') {
  globalThis._jsct_otp_map = otpStore;
}

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;

export const OtpService = {
  /**
   * Generates a cryptographically strong 6-digit numeric OTP
   */
  generateOtp(): string {
    // 6-digit random code between 100000 and 999999
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  /**
   * Saves or overwrites an OTP record for an identifier (Aadhaar or Member ID)
   */
  createRecord(
    key: string,
    member: {
      id: string;
      full_name: string;
      phone: string;
      email?: string | null;
      role: string;
      department: string;
      membership_id: string;
    }
  ): { otp: string; expiresAt: number } {
    this.cleanExpired();

    const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '');
    const otp = this.generateOtp();
    const now = Date.now();
    const expiresAt = now + OTP_TTL_MS;

    const record: OtpRecord = {
      otp,
      memberId: member.id,
      memberName: member.full_name,
      phone: member.phone,
      email: member.email,
      role: member.role,
      department: member.department,
      membershipId: member.membership_id,
      createdAt: now,
      expiresAt,
      attempts: 0,
    };

    otpStore.set(normalizedKey, record);
    // Also index by memberId for duplicate lookup
    otpStore.set(`id_${member.id}`, record);

    return { otp, expiresAt };
  },

  /**
   * Retrieves an active OTP record for a given key
   */
  getRecord(key: string): OtpRecord | null {
    const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '');
    const record = otpStore.get(normalizedKey) || otpStore.get(`id_${normalizedKey}`);
    if (!record) return null;

    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedKey);
      return null;
    }

    return record;
  },

  /**
   * Verifies an OTP against stored record with attempt rate-limiting
   */
  verify(key: string, enteredOtp: string): { success: boolean; message?: string; record?: OtpRecord } {
    const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '');
    const record = this.getRecord(normalizedKey);

    if (!record) {
      return {
        success: false,
        message: 'ओटीपी प्राप्त नहीं हुआ अथवा समय समाप्त (expired) हो चुका है। कृपया नया ओटीपी भेजें।',
      };
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(normalizedKey);
      return {
        success: false,
        message: 'अधिकतम गलत प्रयास पार हो गए हैं। सुरक्षा कारणों से कृपया नया ओटीपी प्राप्त करें।',
      };
    }

    const cleanEntered = enteredOtp.trim().replace(/\D/g, '');
    const cleanStored = record.otp.trim();

    if (cleanEntered !== cleanStored) {
      record.attempts += 1;
      const remaining = MAX_ATTEMPTS - record.attempts;
      return {
        success: false,
        message: `गलत ओटीपी! कृपया सही 6-अंकीय कोड दर्ज करें। (शेष प्रयास: ${remaining})`,
      };
    }

    // Success - consume and delete record to prevent replay attacks
    otpStore.delete(normalizedKey);
    otpStore.delete(`id_${record.memberId}`);

    return {
      success: true,
      record,
    };
  },

  /**
   * Cleans expired records periodically
   */
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, record] of otpStore.entries()) {
      if (now > record.expiresAt) {
        otpStore.delete(key);
      }
    }
  },
};
