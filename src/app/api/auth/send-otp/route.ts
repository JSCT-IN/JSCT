import { NextRequest, NextResponse } from 'next/server';
import { sendOtpAction } from '@/actions/auth-actions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { aadhaarNumber, identifier } = body;
    const target = (aadhaarNumber || identifier || '').toString().trim();

    if (!target) {
      return NextResponse.json(
        { success: false, message: 'Aadhaar number or Member ID is required.' },
        { status: 400 }
      );
    }

    const result = await sendOtpAction(target);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
