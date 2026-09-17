"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Verification failed');
      } else {
        setSuccess('Email verified successfully. Redirecting to login...');
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
        <label className="text-sm font-medium" htmlFor="otp">6-Digit OTP</label>
        <input
          id="otp"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          maxLength={6}
          className="w-full p-2 border rounded-md bg-background text-center tracking-widest text-lg"
          placeholder="000000"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !!success}
        className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? 'Verifying...' : 'Verify Email'}
      </button>
    </form>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 p-8 border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Verify Email</h2>
          <p className="text-muted-foreground mt-2">Check your email for the OTP</p>
        </div>
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <VerifyForm />
        </Suspense>
        <p className="text-center text-sm text-muted-foreground mt-4">
          <Link href="/auth/login" className="text-primary hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
