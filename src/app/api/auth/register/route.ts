import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    await dbConnect();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'Email already in use' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    // Generate 6 digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      verificationToken: otp,
      resetTokenExpiry: tokenExpiry, // reuse this field for OTP expiry
    });

    // Send email using nodemailer
    await sendEmail(
      email.toLowerCase(),
      'PrepTracker MNNIT Verification Code',
      `Your verification code is: ${otp}\nIt will expire in 15 minutes.`
    );
    
    // Also log the OTP for development purposes in case SMTP is not configured
    console.log(`OTP for ${email}: ${otp}`);

    return NextResponse.json({ success: true, message: 'Registration successful.' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
