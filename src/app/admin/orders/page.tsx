'use client';

import React, { useState } from 'react';
import { Search, Filter, ChevronDown, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_ORDERS = [
  { id: 'ORD-00003', customer: 'Amara Otieno', phone: '+254 701 234 567', items: ['Amara Straight 20"'], total: 16200, status: 'PROCESSING', date: new Date(Date.now() - 0.5 * 86400000).toISOString() },
  { id: 'ORD-00002', customer: 'Zuri Wambui', phone: '+254 712 345 678', items: ['Naomi Deep Wave 18"', 'Silk Press Serum x2'], total: 12800, status: 'OUT_FOR_DELIVERY', date: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 'ORD-00001', customer: 'Zuri Wambui', phone: '+254 712 345 678', items: ['Maya Body Wave 22"'], total: 18500, status: 'DELIVERED', date: new Date(Date.now() - 3 * 86400000).toISOString() },
];

const ALL_STATUSES = ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'PACKED', 'DISPATCHED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: 'text-yellow-400 bg-yellow-900/20 border-yellow-800/30',
  PAID: 'text-blue-400 bg-blue-900/20 border-blue-800/30',
  PROCESSING: 'text-blue-400 bg-blue-900/20 border-blue-800/30',
  PACKED: 'text-purple-400 bg-purple-900/20 border-purple-800/30',
  DISPATCHED: 'text-indigo-400 bg-indigo-900/20 border-indigo-800/30',
  OUT_FOR_DELIVERY: 'text-orange-400 bg-orange-900/20 border-orange-800/30',
  DELIVERED: 'text-green-400 bg-green-900/20 border-green-800/30',
  CANCELLED: 'text-red-400 bg-red-900/20 border-red-800/30',
  REFUNDED: 'text-gray-400 bg-gray-900/20 border-gray-800/30',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(ALL_ORDERS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || o.status === filter;
    return matchSearch && matchFilter;
  });

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    // Simulate API call: PATCH /api/orders/[orderId]
    await new Promise((r) => setTimeout(r, 600));
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6 text-luxury-cream">
      <div>
        <span className="font-script text-2xl text-luxury-champagne">manage</span>
        <h1 className="font-serif text-xl tracking-widest uppercase text-luxury-cream font-light">Orders</h1>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-cream/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or customer..."
            className="w-full bg-luxury-espresso border border-luxury-cream/10 rounded-sm pl-9 pr-4 py-3 text-xs text-luxury-cream placeholder:text-luxury-cream/30 focus:outline-none focus:border-luxury-champagne/50 tracking-wider"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-cream/30 pointer-events-none" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-luxury-espresso border border-luxury-cream/10 rounded-sm pl-9 pr-8 py-3 text-xs text-luxury-cream focus:outline-none focus:border-luxury-champagne/50 tracking-wider appearance-none min-w-36"
          >
            <option value="ALL">All Statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-cream/30 pointer-events-none" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-luxury-espresso/60 border border-luxury-cream/10 rounded-sm overflow-hidden">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-luxury-cream/10">
              <th className="text-left px-4 py-3 text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold">Order</th>
              <th className="text-left px-4 py-3 text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold hidden sm:table-cell">Customer</th>
              <th className="text-left px-4 py-3 text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold hidden lg:table-cell">Date</th>
              <th className="text-right px-4 py-3 text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold">Total</th>
              <th className="text-center px-4 py-3 text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold">Status</th>
              <th className="text-center px-4 py-3 text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold">Update</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <React.Fragment key={order.id}>
                <tr
                  className="border-b border-luxury-cream/5 hover:bg-luxury-cream/3 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-luxury-cream tracking-wider">{order.id}</div>
                    <div className="text-luxury-cream/40 mt-0.5 sm:hidden">{order.customer}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="text-luxury-cream font-semibold">{order.customer}</div>
                    <div className="text-luxury-cream/40 mt-0.5">{order.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-luxury-cream/50 hidden lg:table-cell">
                    {new Date(order.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-serif font-bold text-luxury-champagne">KES {order.total.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[8px] px-2.5 py-1 rounded border font-bold uppercase tracking-wider ${STATUS_COLORS[order.status] || 'text-gray-400 bg-gray-900/20 border-gray-800/30'}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-block">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className="bg-transparent border border-luxury-cream/10 rounded-sm px-2 py-1.5 text-[8px] text-luxury-cream/60 focus:outline-none focus:border-luxury-champagne/50 cursor-pointer appearance-none pr-5"
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-luxury-espresso">{s.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                      <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-luxury-cream/30 pointer-events-none" />
                    </div>
                    {updatingId === order.id && (
                      <span className="text-[8px] text-luxury-champagne ml-1">Saving...</span>
                    )}
                  </td>
                </tr>
                {/* Expanded Row */}
                <AnimatePresence>
                  {expandedId === order.id && (
                    <tr>
                      <td colSpan={6} className="px-4 pb-4 bg-luxury-espresso/30">
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-3 text-[9px] text-luxury-cream/60 space-y-1"
                        >
                          <div className="font-semibold text-luxury-cream/80 mb-2 uppercase tracking-widest">Items:</div>
                          {order.items.map((item, i) => (
                            <div key={i} className="ml-2">• {item}</div>
                          ))}
                          <div className="flex space-x-4 mt-3">
                            <a
                              href={`/api/receipts/${order.id}?format=html`}
                              target="_blank"
                              className="text-[8px] uppercase tracking-widest text-luxury-champagne hover:text-luxury-cream font-bold border border-luxury-champagne/30 px-3 py-1.5 rounded-sm transition-colors"
                            >
                              View Receipt
                            </a>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-luxury-cream/30 text-xs tracking-widest uppercase font-semibold">
            No orders match your filters
          </div>
        )}
      </div>
    </div>
  );
}
