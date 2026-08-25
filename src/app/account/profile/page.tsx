'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Phone, Mail, Save, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const { profile, signIn } = useAuth();
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Password change section
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // In production: PATCH /api/account/profile
      // In mock mode: just update local state
      await new Promise((r) => setTimeout(r, 800));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPw !== pwForm.confirm) {
      setPwError('New passwords do not match.');
      return;
    }
    if (pwForm.newPw.length < 8) {
      setPwError('Password must be at least 8 characters.');
      return;
    }
    // In production: call supabase.auth.updateUser({ password: pwForm.newPw })
    await new Promise((r) => setTimeout(r, 800));
    setPwSaved(true);
    setPwForm({ current: '', newPw: '', confirm: '' });
    setTimeout(() => setPwSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-xl tracking-widest uppercase text-luxury-chocolate font-semibold">My Profile</h1>
        <p className="text-[10px] tracking-widest text-luxury-coffee uppercase mt-1">Manage your personal details</p>
      </div>

      {/* Avatar & Name Banner */}
      <div className="flex items-center space-x-5 p-5 bg-luxury-beige/40 border border-luxury-chocolate/10 rounded-sm">
        <div className="w-16 h-16 rounded-full bg-luxury-chocolate flex items-center justify-center flex-shrink-0">
          <span className="font-serif text-2xl text-luxury-cream font-bold">
            {(profile?.full_name || 'U')[0].toUpperCase()}
          </span>
        </div>
        <div>
          <div className="font-serif text-lg text-luxury-chocolate font-bold">{profile?.full_name}</div>
          <div className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold mt-0.5">{profile?.role === 'admin' ? 'Administrator' : 'Valued Customer'}</div>
          <div className="text-[10px] text-luxury-coffee/70 mt-1">{profile?.email}</div>
        </div>
      </div>

      {/* Personal Info Form */}
      <div className="bg-luxury-cream border border-luxury-chocolate/10 rounded-sm p-6 luxury-shadow">
        <h2 className="font-serif text-sm tracking-widest uppercase text-luxury-chocolate font-semibold mb-5">Personal Information</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold flex items-center">
              <User size={11} className="mr-1.5" /> Full Name
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate text-luxury-espresso"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold flex items-center">
                <Phone size={11} className="mr-1.5" /> Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. 0712345678"
                className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate text-luxury-espresso"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold flex items-center">
                <Mail size={11} className="mr-1.5" /> Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate text-luxury-espresso"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-700 font-semibold tracking-wider p-3 bg-red-50 border border-red-200 rounded-sm">{error}</div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-3 bg-luxury-chocolate text-luxury-cream hover:bg-luxury-coffee text-[10px] tracking-[0.2em] uppercase font-bold rounded-sm transition-all"
            >
              <Save size={12} className="mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && (
              <span className="text-green-700 text-xs flex items-center font-semibold tracking-wider">
                <CheckCircle size={14} className="mr-1.5" /> Profile updated!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-luxury-cream border border-luxury-chocolate/10 rounded-sm p-6 luxury-shadow">
        <h2 className="font-serif text-sm tracking-widest uppercase text-luxury-chocolate font-semibold mb-5">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">Current Password</label>
            <input
              type="password"
              value={pwForm.current}
              onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
              className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">New Password</label>
              <input
                type="password"
                value={pwForm.newPw}
                onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })}
                className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">Confirm New Password</label>
              <input
                type="password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate"
              />
            </div>
          </div>

          {pwError && (
            <div className="text-xs text-red-700 font-semibold p-3 bg-red-50 border border-red-200 rounded-sm">{pwError}</div>
          )}

          <div className="flex items-center space-x-4 pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-luxury-chocolate text-luxury-cream hover:bg-luxury-coffee text-[10px] tracking-[0.2em] uppercase font-bold rounded-sm transition-all"
            >
              Update Password
            </button>
            {pwSaved && (
              <span className="text-green-700 text-xs flex items-center font-semibold tracking-wider">
                <CheckCircle size={14} className="mr-1.5" /> Password changed!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
