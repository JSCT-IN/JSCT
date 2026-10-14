/**
 * Multi-Provider SMS Dispatch Service for JSCT Welfare Platform
 * Supports:
 * 1. Fast2SMS (Indian DLT/Quick SMS)
 * 2. Twilio SMS
 * 3. Local Dev Mock (Terminal + UI Badge)
 */

export interface SmsDispatchOptions {
  phone: string;
  otp: string;
  memberName: string;
}

export interface SmsDispatchResult {
  success: boolean;
  provider: 'FAST2SMS' | 'TWILIO' | 'DEV_MOCK';
  messageId?: string;
  error?: string;
}

export async function sendSmsOtp(options: SmsDispatchOptions): Promise<SmsDispatchResult> {
  const { phone, otp, memberName } = options;
  const digits = phone.replace(/\D/g, '').slice(-10);

  // 1. Fast2SMS Provider (Instant Indian SMS)
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;
  if (fast2SmsKey && fast2SmsKey.trim()) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2SmsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: digits,
        }),
      });

      const data = await response.json();
      if (data.return) {
        console.log(`📱 [Fast2SMS SUCCESS] Sent OTP to +91 ${digits}`);
        return { success: true, provider: 'FAST2SMS', messageId: data.request_id };
      } else {
        console.warn(`⚠️ [Fast2SMS NOTICE] ${data.message}`);
      }
    } catch (e: any) {
      console.warn('⚠️ [Fast2SMS ERROR]', e.message);
    }
  }

  // 2. Twilio Provider
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', `+91${digits}`);
      params.append('From', twilioFrom);
      params.append('Body', `JSCT - जन सेवा ट्रस्ट: आपका लॉगिन OTP ${otp} है। यह 5 मिनट के लिए मान्य है।`);

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await response.json();
      if (data.sid) {
        console.log(`📱 [Twilio SUCCESS] Sent OTP to +91 ${digits}`);
        return { success: true, provider: 'TWILIO', messageId: data.sid };
      }
    } catch (e: any) {
      console.warn('⚠️ [Twilio ERROR]', e.message);
    }
  }

  // 3. Fallback Dev Mode
  console.log(`📱 [DEV SMS MOCK] Physical SMS delivery requires live SMS gateway API (Fast2SMS, Twilio, or Firebase Blaze).`);
  console.log(`📱 [DEV SMS MOCK] Dispatched in-app OTP ${otp} for +91 ${digits}`);

  return {
    success: true,
    provider: 'DEV_MOCK',
  };
}
