'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Package } from 'lucide-react';

// Mock order data — in production, fetched from API /api/orders?userId=...
const MOCK_ORDERS = [
  {
    id: 'ORD-00001',
    items: [
      { product_name: 'Maya Body Wave 22"', quantity: 1, price: 18500 },
    ],
    total: 18500,
    status: 'DELIVERED',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORD-00002',
    items: [
      { product_name: 'Naomi Deep Wave 18"', quantity: 1, price: 11200 },
      { product_name: 'Silk Press Serum 100ml', quantity: 2, price: 800 },
    ],
    total: 12800,
    status: 'OUT_FOR_DELIVERY',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORD-00003',
    items: [
      { product_name: 'Amara Straight 20"', quantity: 1, price: 15600 },
    ],
    total: 16200,
    status: 'PROCESSING',
    created_at: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  PENDING_PAYMENT: { label: 'Pending Payment', cls: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: 'Paid', cls: 'bg-blue-100 text-blue-800' },
  PROCESSING: { label: 'Processing', cls: 'bg-blue-100 text-blue-700' },
  PACKED: { label: 'Packed', cls: 'bg-purple-100 text-purple-800' },
  DISPATCHED: { label: 'Dispatched', cls: 'bg-indigo-100 text-indigo-800' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', cls: 'bg-orange-100 text-orange-800' },
  DELIVERED: { label: 'Delivered', cls: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-100 text-red-800' },
  REFUNDED: { label: 'Refunded', cls: 'bg-gray-100 text-gray-700' },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'DELIVERED'>('ALL');

  const filteredOrders = MOCK_ORDERS.filter((o) => {
    if (filter === 'ACTIVE') return !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(o.status);
    if (filter === 'DELIVERED') return o.status === 'DELIVERED';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl tracking-widest uppercase text-luxury-chocolate font-semibold">My Orders</h1>
          <p className="text-[10px] tracking-widest text-luxury-coffee uppercase mt-1">{MOCK_ORDERS.length} total orders</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-1 border-b border-luxury-chocolate/10 pb-1">
        {(['ALL', 'ACTIVE', 'DELIVERED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-[10px] tracking-widest uppercase font-bold transition-all rounded-sm ${
              filter === f
                ? 'bg-luxury-chocolate text-luxury-cream'
                : 'text-luxury-coffee hover:text-luxury-chocolate hover:bg-luxury-beige/50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Order list */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 border border-dashed border-luxury-chocolate/20 rounded-sm">
          <Package size={36} className="text-luxury-chocolate/20" />
          <p className="text-xs tracking-widest uppercase text-luxury-coffee font-semibold">No orders found</p>
          <Link href="/shop" className="text-[10px] tracking-widest uppercase text-luxury-champagne hover:text-luxury-chocolate font-bold">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const badge = STATUS_BADGE[order.status] || { label: order.status, cls: 'bg-gray-100 text-gray-700' };
            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block p-5 bg-luxury-cream border border-luxury-chocolate/10 hover:border-luxury-chocolate/30 rounded-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs font-bold tracking-wider text-luxury-chocolate">{order.id}</div>
                    <div className="text-[10px] text-luxury-coffee/70 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${badge.cls}`}>
                      {badge.label}
                    </span>
                    <ArrowRight size={14} className="text-luxury-chocolate/30 group-hover:text-luxury-chocolate transition-colors" />
                  </div>
                </div>

                <div className="space-y-1 border-t border-luxury-chocolate/5 pt-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px]">
                      <span className="text-luxury-coffee">{item.product_name} × {item.quantity}</span>
                      <span className="font-semibold text-luxury-chocolate">KES {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-luxury-chocolate/5 text-xs font-bold">
                    <span className="text-luxury-coffee uppercase tracking-widest">Total</span>
                    <span className="text-luxury-chocolate font-serif">KES {order.total.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
