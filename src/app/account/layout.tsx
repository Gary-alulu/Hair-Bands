'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
  User, ShoppingBag, Calendar, FileText, LogOut,
  ChevronRight, LayoutDashboard
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/account/orders', label: 'My Orders', icon: ShoppingBag },
  { href: '/account/reservations', label: 'Appointments', icon: Calendar },
  { href: '/account/receipts', label: 'Receipts', icon: FileText },
  { href: '/account/profile', label: 'Profile', icon: User },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();

  // Show loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-luxury-chocolate border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Guest — show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-luxury-cream flex flex-col items-center justify-center px-4 text-center space-y-6">
        <span className="font-script text-4xl text-luxury-champagne">members only</span>
        <h1 className="font-serif text-2xl tracking-widest text-luxury-chocolate uppercase">Sign In to Your Account</h1>
        <p className="text-xs text-luxury-coffee tracking-wider max-w-xs">
          Access your orders, beauty appointments, invoices, and profile in one luxurious dashboard.
        </p>
        <Link
          href="/auth/login"
          className="px-8 py-4 bg-luxury-chocolate text-luxury-cream text-xs tracking-[0.2em] uppercase font-semibold hover:bg-luxury-coffee transition-colors rounded-sm"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isActive = (item: typeof NAV_ITEMS[0]) =>
    item.exact ? pathname === item.href : pathname?.startsWith(item.href);

  return (
    <div className="min-h-screen bg-luxury-cream">
      {/* Page Header */}
      <div className="border-b border-luxury-chocolate/10 bg-luxury-cream/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <span className="font-script text-xl text-luxury-champagne leading-none">my sanctuary</span>
            <div className="flex items-center text-[10px] tracking-widest text-luxury-coffee font-semibold uppercase space-x-2 mt-0.5">
              <Link href="/" className="hover:text-luxury-chocolate transition-colors">Home</Link>
              <ChevronRight size={10} />
              <span className="text-luxury-chocolate">Account</span>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">Signed in as</div>
            <div className="text-xs font-serif font-bold text-luxury-chocolate truncate max-w-40">{profile?.full_name}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="lg:w-56 flex-shrink-0">
            <nav className="space-y-1 lg:sticky lg:top-24">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-sm text-xs tracking-widest font-semibold uppercase transition-all ${
                      active
                        ? 'bg-luxury-chocolate text-luxury-cream'
                        : 'text-luxury-coffee hover:text-luxury-chocolate hover:bg-luxury-beige/50'
                    }`}
                  >
                    <item.icon size={14} className="mr-3 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
              
              <div className="pt-2 border-t border-luxury-chocolate/10 mt-2">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-4 py-3 rounded-sm text-xs tracking-widest font-semibold uppercase text-red-800/70 hover:text-red-800 hover:bg-red-50 transition-all"
                >
                  <LogOut size={14} className="mr-3" />
                  Sign Out
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 min-w-0"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
