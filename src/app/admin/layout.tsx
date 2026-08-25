'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, ShoppingBag, Calendar, Users,
  Package, LogOut, ChevronRight, Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/reservations', label: 'Reservations', icon: Calendar },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/customers', label: 'Customers', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-espresso flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-luxury-champagne border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Gate: must be admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-luxury-espresso flex flex-col items-center justify-center px-4 text-center space-y-6">
        <span className="font-script text-4xl text-luxury-champagne">restricted area</span>
        <h1 className="font-serif text-2xl tracking-widest text-luxury-cream uppercase">Admin Access Required</h1>
        <p className="text-xs text-luxury-cream/50 tracking-wider max-w-xs">
          This area is restricted to authorised administrators only.
        </p>
        <Link
          href="/auth/login"
          className="px-8 py-4 border border-luxury-champagne text-luxury-champagne hover:bg-luxury-champagne hover:text-luxury-espresso text-xs tracking-[0.2em] uppercase font-semibold transition-all rounded-sm"
        >
          Sign In as Admin
        </Link>
        <Link href="/" className="text-[10px] tracking-widest uppercase text-luxury-cream/40 hover:text-luxury-cream/80 transition-colors">
          Return to Store
        </Link>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isActive = (item: typeof ADMIN_NAV[0]) =>
    item.exact ? pathname === item.href : pathname?.startsWith(item.href);

  return (
    <div className="min-h-screen bg-[#1a0f0a] text-luxury-cream flex">
      {/* Dark Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-luxury-espresso border-r border-luxury-cream/5 flex flex-col fixed top-0 left-0 h-screen z-20">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-luxury-cream/10">
          <Link href="/admin">
            <span className="font-script text-2xl text-luxury-champagne leading-none">Hair Bands</span>
          </Link>
          <div className="text-[8px] tracking-[0.3em] uppercase text-luxury-cream/40 font-semibold mt-1">Admin Console</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {ADMIN_NAV.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-sm text-[10px] tracking-widest font-semibold uppercase transition-all ${
                  active
                    ? 'bg-luxury-champagne/10 text-luxury-champagne border border-luxury-champagne/20'
                    : 'text-luxury-cream/50 hover:text-luxury-cream hover:bg-luxury-cream/5'
                }`}
              >
                <item.icon size={14} className="mr-3 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: User + Sign Out */}
        <div className="px-3 py-4 border-t border-luxury-cream/10 space-y-1">
          <div className="px-4 py-3">
            <div className="text-[9px] uppercase tracking-widest text-luxury-cream/30 font-semibold">Signed in as</div>
            <div className="text-xs font-semibold text-luxury-champagne truncate mt-0.5">{profile?.full_name}</div>
          </div>
          <Link
            href="/"
            className="flex items-center px-4 py-2.5 text-[10px] tracking-widest uppercase text-luxury-cream/40 hover:text-luxury-cream/80 font-semibold rounded-sm hover:bg-luxury-cream/5 transition-all"
          >
            <ChevronRight size={12} className="mr-2 rotate-180" />
            View Store
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-2.5 text-[10px] tracking-widest uppercase text-red-400/70 hover:text-red-400 font-semibold rounded-sm hover:bg-red-900/20 transition-all"
          >
            <LogOut size={12} className="mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main with offset for fixed sidebar */}
      <div className="flex-1 ml-60">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-luxury-espresso/90 backdrop-blur-sm border-b border-luxury-cream/5 px-6 py-4 flex items-center justify-between">
          <div className="text-[10px] tracking-widest uppercase text-luxury-cream/40 font-semibold flex items-center">
            <span>Admin</span>
            <ChevronRight size={10} className="mx-2" />
            <span className="text-luxury-cream/70">{ADMIN_NAV.find(n => isActive(n))?.label || 'Dashboard'}</span>
          </div>
          <div className="text-[10px] tracking-widest uppercase text-luxury-cream/40 font-semibold">
            {new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </header>

        {/* Page Content */}
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="p-6 lg:p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
