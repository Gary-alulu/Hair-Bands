'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, Calendar, Package, ArrowRight, Sparkles } from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  activeReservations: number;
  pendingOrders: number;
  lastOrderDate: string | null;
}

// Mock recent orders for display
const MOCK_ORDERS = [
  {
    id: 'ORD-00001',
    items: [{ product_name: 'Maya Body Wave 22"' }],
    total: 18500,
    status: 'DELIVERED',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORD-00002',
    items: [{ product_name: 'Naomi Deep Wave 18"' }, { product_name: 'Silk Press Serum' }],
    total: 12800,
    status: 'OUT_FOR_DELIVERY',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  PACKED: 'bg-purple-100 text-purple-800',
  DISPATCHED: 'bg-indigo-100 text-indigo-800',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function AccountDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: MOCK_ORDERS.length,
    activeReservations: 2,
    pendingOrders: 1,
    lastOrderDate: MOCK_ORDERS[0]?.created_at || null,
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-luxury-chocolate rounded-sm p-6 md:p-8 text-luxury-cream relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D6B98C 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <span className="font-script text-3xl text-luxury-champagne">welcome back,</span>
          <h1 className="font-serif text-2xl tracking-widest uppercase mt-1">
            {profile?.full_name?.split(' ')[0] || 'Beautiful'}
          </h1>
          <p className="text-[10px] tracking-widest text-luxury-cream/60 uppercase mt-2">
            Your luxury hair sanctuary awaits
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-luxury-cream border border-luxury-chocolate/10 p-5 rounded-sm luxury-shadow">
          <div className="flex items-center justify-between mb-3">
            <ShoppingBag size={18} className="text-luxury-champagne" />
            <span className="text-3xl font-serif font-bold text-luxury-chocolate">{stats.totalOrders}</span>
          </div>
          <div className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">Total Orders</div>
        </div>
        <div className="bg-luxury-cream border border-luxury-chocolate/10 p-5 rounded-sm luxury-shadow">
          <div className="flex items-center justify-between mb-3">
            <Calendar size={18} className="text-luxury-champagne" />
            <span className="text-3xl font-serif font-bold text-luxury-chocolate">{stats.activeReservations}</span>
          </div>
          <div className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">Appointments</div>
        </div>
        <div className="bg-luxury-cream border border-luxury-chocolate/10 p-5 rounded-sm luxury-shadow">
          <div className="flex items-center justify-between mb-3">
            <Package size={18} className="text-luxury-champagne" />
            <span className="text-3xl font-serif font-bold text-luxury-chocolate">{stats.pendingOrders}</span>
          </div>
          <div className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">In Transit</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-base tracking-widest uppercase text-luxury-chocolate font-semibold">Recent Orders</h2>
          <Link href="/account/orders" className="text-[10px] tracking-widest uppercase text-luxury-champagne hover:text-luxury-chocolate font-semibold flex items-center">
            View All <ArrowRight size={12} className="ml-1" />
          </Link>
        </div>
        <div className="space-y-3">
          {MOCK_ORDERS.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between p-4 bg-luxury-cream border border-luxury-chocolate/10 hover:border-luxury-chocolate/30 rounded-sm transition-all group"
            >
              <div className="space-y-1">
                <div className="text-xs font-semibold tracking-wider text-luxury-chocolate">{order.id}</div>
                <div className="text-[11px] text-luxury-coffee truncate max-w-48">
                  {order.items.map(i => i.product_name).join(', ')}
                </div>
                <div className="text-[10px] text-luxury-coffee/60">
                  {new Date(order.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-serif font-bold text-luxury-chocolate">
                  KES {order.total.toLocaleString()}
                </span>
                <ArrowRight size={12} className="text-luxury-chocolate/30 group-hover:text-luxury-chocolate transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="font-serif text-base tracking-widest uppercase text-luxury-chocolate font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/reservations" className="p-4 bg-luxury-beige/40 border border-luxury-chocolate/10 hover:border-luxury-chocolate/30 rounded-sm flex items-center transition-all group">
            <Calendar size={18} className="text-luxury-champagne mr-3" />
            <div>
              <div className="text-xs font-semibold tracking-wider uppercase text-luxury-chocolate">Book Appointment</div>
              <div className="text-[10px] text-luxury-coffee mt-0.5">Fittings, viewings & consultations</div>
            </div>
            <ArrowRight size={12} className="ml-auto text-luxury-chocolate/30 group-hover:text-luxury-chocolate transition-colors" />
          </Link>
          <Link href="/shop" className="p-4 bg-luxury-beige/40 border border-luxury-chocolate/10 hover:border-luxury-chocolate/30 rounded-sm flex items-center transition-all group">
            <Sparkles size={18} className="text-luxury-champagne mr-3" />
            <div>
              <div className="text-xs font-semibold tracking-wider uppercase text-luxury-chocolate">Shop Collection</div>
              <div className="text-[10px] text-luxury-coffee mt-0.5">Discover new arrivals</div>
            </div>
            <ArrowRight size={12} className="ml-auto text-luxury-chocolate/30 group-hover:text-luxury-chocolate transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
