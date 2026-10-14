import { NextRequest, NextResponse } from 'next/server';
import { verifyOtpAction } from '@/actions/auth-actions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { aadhaarNumber, identifier, otp } = body;
    const target = (aadhaarNumber || identifier || '').toString().trim();
    const cleanOtp = (otp || '').toString().trim();

    if (!target || !cleanOtp) {
      return NextResponse.json(
        { success: false, message: 'Both identifier and 6-digit OTP are required.' },
        { status: 400 }
      );
    }

    const result = await verifyOtpAction(target, cleanOtp);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
