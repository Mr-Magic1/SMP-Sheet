"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to reset password.');
      } else {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 p-8 border rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Reset Password</h2>
        <p className="text-muted-foreground mt-2">Enter the OTP sent to your email</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {success && <div className="text-green-500 text-sm text-center">{success}</div>}
        
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded-md bg-background"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="otp">OTP Code</label>
          <input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="w-full p-2 border rounded-md bg-background tracking-widest"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-2 border rounded-md bg-background"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-2 border rounded-md bg-background"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !!success}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-4">
        <Link href="/auth/login" className="text-primary font-medium hover:underline">
          Back to Login
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
