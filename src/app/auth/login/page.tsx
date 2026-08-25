'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User, Phone, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AuthLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, mockLogin, isMockAuth } = useAuth();
  const redirect = searchParams.get('redirect') || '/account';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    confirmPw: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await signIn(form.email, form.password);
        if (!result.success) throw new Error(result.error || 'Sign in failed.');
      } else {
        if (form.password !== form.confirmPw) throw new Error('Passwords do not match.');
        if (form.password.length < 8) throw new Error('Password must be at least 8 characters.');
        const result = await signUp(form.email, form.password, form.fullName, form.phone);
        if (!result.success) throw new Error(result.error || 'Registration failed.');
      }
      router.push(redirect);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = (role: 'customer' | 'admin') => {
    mockLogin(role);
    router.push(role === 'admin' ? '/admin' : redirect);
  };

  return (
    <div className="min-h-screen bg-luxury-cream flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <span className="font-script text-4xl text-luxury-champagne">Hair Bands</span>
          </Link>
          <p className="text-[10px] tracking-[0.3em] uppercase text-luxury-coffee font-semibold mt-2">
            {mode === 'login' ? 'Welcome Back' : 'Join the Family'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-luxury-cream border border-luxury-chocolate/10 rounded-sm luxury-shadow p-8">
          
          {/* Mode Toggle */}
          <div className="flex rounded-sm overflow-hidden border border-luxury-chocolate/15 mb-8">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-3 text-[10px] tracking-widest uppercase font-bold transition-all ${
                mode === 'login' ? 'bg-luxury-chocolate text-luxury-cream' : 'text-luxury-coffee hover:bg-luxury-beige/50'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-3 text-[10px] tracking-widest uppercase font-bold transition-all ${
                mode === 'register' ? 'bg-luxury-chocolate text-luxury-cream' : 'text-luxury-coffee hover:bg-luxury-beige/50'
              }`}
            >
              Register
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Register-only fields */}
              {mode === 'register' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold flex items-center">
                      <User size={11} className="mr-1.5" /> Full Name
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Your full name"
                      required
                      className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold flex items-center">
                      <Phone size={11} className="mr-1.5" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. 0712345678"
                      className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate"
                    />
                  </div>
                </>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold flex items-center">
                  <Mail size={11} className="mr-1.5" /> Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@email.com"
                  required
                  className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold flex items-center">
                  <Lock size={11} className="mr-1.5" /> Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 pr-10 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-coffee/50 hover:text-luxury-chocolate transition-colors"
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Confirm password for register */}
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold flex items-center">
                    <Lock size={11} className="mr-1.5" /> Confirm Password
                  </label>
                  <input
                    type="password"
                    value={form.confirmPw}
                    onChange={(e) => setForm({ ...form, confirmPw: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate"
                  />
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs tracking-wider rounded-sm font-semibold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-luxury-chocolate text-luxury-cream hover:bg-luxury-coffee text-[10px] tracking-[0.25em] uppercase font-bold rounded-sm transition-all mt-2"
              >
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </motion.form>
          </AnimatePresence>

          {/* Mock Login shortcuts (only in mock mode) */}
          {isMockAuth && (
            <div className="mt-6 pt-5 border-t border-luxury-chocolate/10">
              <p className="text-[9px] tracking-widest uppercase text-luxury-coffee/60 text-center mb-3 font-semibold">
                <Sparkles size={10} className="inline mr-1" /> Demo Mode — Quick Login
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleMockLogin('customer')}
                  className="py-3 border border-luxury-chocolate/20 text-luxury-chocolate hover:bg-luxury-beige text-[9px] tracking-wider uppercase font-bold rounded-sm transition-all"
                >
                  Customer Demo
                </button>
                <button
                  onClick={() => handleMockLogin('admin')}
                  className="py-3 border border-luxury-chocolate/20 text-luxury-chocolate hover:bg-luxury-beige text-[9px] tracking-wider uppercase font-bold rounded-sm transition-all"
                >
                  Admin Demo
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] tracking-wider text-luxury-coffee/60 mt-6">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-luxury-chocolate transition-colors">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-luxury-chocolate transition-colors">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

export default function AuthLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-luxury-cream flex items-center justify-center">Loading...</div>}>
      <AuthLoginForm />
    </Suspense>
  );
}
