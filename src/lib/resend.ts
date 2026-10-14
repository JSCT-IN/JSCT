import { Resend } from 'resend';

export interface SendOtpOptions {
  toEmail?: string | null;
  phone: string;
  otp: string;
  memberName: string;
}

export interface SendOtpResult {
  success: boolean;
  messageId?: string;
  error?: string;
  isMock?: boolean;
}

/**
 * Sends branded JSCT OTP verification email via Resend API
 */
export async function sendOtpEmail(options: SendOtpOptions): Promise<SendOtpResult> {
  const { toEmail, phone, otp, memberName } = options;
  const apiKey = process.env.RESEND_API_KEY;

  // Always log OTP to server console for developer traceability & debugging
  console.log(`\n========================================================`);
  console.log(`🔐 [JSCT AUTH OTP GENERATED]`);
  console.log(`👤 Member: ${memberName}`);
  console.log(`📱 Phone:  ${phone}`);
  console.log(`📧 Email:  ${toEmail || 'N/A'}`);
  console.log(`🔢 OTP:    ${otp} (Valid for 5 minutes)`);
  console.log(`========================================================\n`);

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('placeholder')) {
    console.log('ℹ️ [RESEND NOTICE] RESEND_API_KEY is not configured. Running in local/dev mock mode.');
    return {
      success: true,
      isMock: true,
    };
  }

  // If no recipient email is available, we cannot send email
  if (!toEmail || !toEmail.includes('@')) {
    console.log(`ℹ️ [RESEND NOTICE] No registered email found for ${phone}. SMS dispatch simulation logged.`);
    return {
      success: true,
      isMock: true,
    };
  }

  try {
    const resend = new Resend(apiKey);
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'Jan Sewa Trust <onboarding@resend.dev>';

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [toEmail],
      subject: `JSCT Portal - आपका लॉगिन सत्यापन OTP: ${otp}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>JSCT Login OTP</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F5; padding: 32px 16px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; border: 1px solid #E7E2DA; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
                  <!-- Header Banner -->
                  <tr>
                    <td style="padding: 28px 24px 20px 24px; text-align: center; background: linear-gradient(135deg, #FAF8F5 0%, #FFFFFF 100%); border-bottom: 1px solid #F5F2EB;">
                      <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 14px; background: linear-gradient(135deg, #C85A32 0%, #B24F2C 100%); color: #ffffff; font-weight: 800; font-size: 20px;">
                        JS
                      </div>
                      <h1 style="margin: 12px 0 2px 0; font-size: 20px; color: #262421; font-weight: 800;">
                        जन सेवा चैरिटेबल ट्रस्ट
                      </h1>
                      <p style="margin: 0; font-size: 11px; color: #736F68; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        JAN SEWA CHARITABLE TRUST (JSCT) • उत्तर प्रदेश
                      </p>
                    </td>
                  </tr>

                  <!-- Body Content -->
                  <tr>
                    <td style="padding: 28px 24px;">
                      <p style="margin: 0 0 12px 0; font-size: 14px; color: #262421;">
                        नमस्ते <strong>${memberName}</strong> जी,
                      </p>
                      <p style="margin: 0 0 24px 0; font-size: 13px; color: #736F68; line-height: 1.5;">
                        आपके पंजीकृत आधार / मोबाइल से सदस्य पोर्टल में लॉगिन करने का अनुरोध प्राप्त हुआ है। सत्यापन हेतु आपका एकबारीय पासवर्ड (OTP) नीचे दिया गया है:
                      </p>

                      <!-- OTP Code Box -->
                      <div style="text-align: center; margin: 24px 0;">
                        <div style="display: inline-block; background-color: #FBEFEA; border: 2px dashed #C85A32; border-radius: 14px; padding: 14px 28px;">
                          <span style="font-family: 'JetBrains Mono', Consolas, monospace; font-size: 34px; font-weight: 800; color: #C85A32; letter-spacing: 8px;">
                            ${otp}
                          </span>
                        </div>
                        <p style="margin: 12px 0 0 0; font-size: 12px; color: #736F68; font-weight: 500;">
                          ⏱️ यह OTP अगले <strong>5 मिनट</strong> के लिए मान्य है।
                        </p>
                      </div>

                      <div style="background-color: #FAF8F5; border-radius: 12px; padding: 12px 16px; border: 1px solid #E7E2DA; margin-top: 24px;">
                        <p style="margin: 0; font-size: 11px; color: #736F68; line-height: 1.4;">
                          ⚠️ <strong>सुरक्षा सूचना:</strong> JSCT ट्रस्ट अथवा कोई भी पदाधिकारी आपसे कभी भी आपका OTP या पासवर्ड नहीं मांगता। यदि यह अनुरोध आपने नहीं किया है, तो तत्काल हेल्पलाइन पर सूचित करें।
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 24px; text-align: center; background-color: #FAF8F5; border-top: 1px solid #E7E2DA;">
                      <p style="margin: 0 0 4px 0; font-size: 11px; color: #736F68;">
                        मुख्यालय: हरपुर पोस्ट लुहसी, जनपद गोरखपुर (उ०प्र०) • दूरभाष: +91 9264945875
                      </p>
                      <p style="margin: 0; font-size: 10px; color: #9A968F;">
                        © 2026 Jan Sewa Charitable Trust (JSCT). सर्वाधिकार सुरक्षित।
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('[RESEND DISPATCH ERROR]:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('[RESEND EXCEPTION]:', err);
    return { success: false, error: err.message };
  }
}
