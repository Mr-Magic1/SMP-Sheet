import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't leak whether user exists or not
      return NextResponse.json({ success: true, message: 'If an account exists, an OTP has been sent.' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.resetToken = otp;
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    // Send email using nodemailer
    await sendEmail(
      email.toLowerCase(),
      'SheetForge Password Reset Code',
      `Your password reset code is: ${otp}\nIt will expire in 15 minutes.`
    );
    
    // Also log the OTP for development purposes in case SMTP is not configured
    console.log(`Password reset OTP for ${email}: ${otp}`);

    return NextResponse.json({ success: true, message: 'If an account exists, an OTP has been sent.' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
