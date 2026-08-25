'use client';

import React, { useState } from 'react';
import { Search, User, ShoppingBag, TrendingUp } from 'lucide-react';

const MOCK_CUSTOMERS = [
  {
    id: 'mock-customer-uuid',
    name: 'Zuri Wambui',
    email: 'zuri.wambui@gmail.com',
    phone: '+254 712 345 678',
    totalOrders: 3,
    totalSpent: 47500,
    lastOrder: new Date(Date.now() - 0.5 * 86400000).toISOString(),
    status: 'ACTIVE',
  },
  {
    id: 'cust-002',
    name: 'Amara Otieno',
    email: 'amara.otieno@gmail.com',
    phone: '+254 701 234 567',
    totalOrders: 1,
    totalSpent: 16200,
    lastOrder: new Date(Date.now() - 0.5 * 86400000).toISOString(),
    status: 'ACTIVE',
  },
  {
    id: 'cust-003',
    name: 'Kezia Muthoni',
    email: 'kezia.m@outlook.com',
    phone: '+254 733 567 890',
    totalOrders: 5,
    totalSpent: 82300,
    lastOrder: new Date(Date.now() - 7 * 86400000).toISOString(),
    status: 'ACTIVE',
  },
  {
    id: 'cust-004',
    name: 'Fatuma Hassan',
    email: 'fatuma.h@gmail.com',
    phone: '+254 725 111 222',
    totalOrders: 2,
    totalSpent: 25100,
    lastOrder: new Date(Date.now() - 14 * 86400000).toISOString(),
    status: 'INACTIVE',
  },
];

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_CUSTOMERS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const totalRevenue = MOCK_CUSTOMERS.reduce((a, b) => a + b.totalSpent, 0);
  const avgCLV = Math.round(totalRevenue / MOCK_CUSTOMERS.length);

  return (
    <div className="space-y-6 text-luxury-cream">
      <div>
        <span className="font-script text-2xl text-luxury-champagne">community</span>
        <h1 className="font-serif text-xl tracking-widest uppercase text-luxury-cream font-light">Customers</h1>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: User, label: 'Total Customers', value: MOCK_CUSTOMERS.length.toString() },
          { icon: ShoppingBag, label: 'Total Revenue', value: `KES ${(totalRevenue / 1000).toFixed(0)}k` },
          { icon: TrendingUp, label: 'Avg. CLV', value: `KES ${avgCLV.toLocaleString()}` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-luxury-espresso/60 border border-luxury-cream/10 rounded-sm p-4 text-center">
            <Icon size={14} className="text-luxury-champagne mx-auto mb-2" />
            <div className="font-serif text-lg font-bold text-luxury-cream">{value}</div>
            <div className="text-[8px] tracking-widest uppercase text-luxury-cream/40 font-semibold mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-cream/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers by name, email, or phone..."
          className="w-full bg-luxury-espresso border border-luxury-cream/10 rounded-sm pl-9 pr-4 py-3 text-xs text-luxury-cream placeholder:text-luxury-cream/30 focus:outline-none focus:border-luxury-champagne/50 tracking-wider"
        />
      </div>

      {/* Customer Table */}
      <div className="bg-luxury-espresso/60 border border-luxury-cream/10 rounded-sm overflow-hidden">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-luxury-cream/10">
              <th className="text-left px-4 py-3 text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold">Customer</th>
              <th className="text-center px-4 py-3 text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold hidden sm:table-cell">Orders</th>
              <th className="text-right px-4 py-3 text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold">Lifetime Value</th>
              <th className="text-center px-4 py-3 text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold hidden md:table-cell">Last Order</th>
              <th className="text-center px-4 py-3 text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer) => (
              <tr key={customer.id} className="border-b border-luxury-cream/5 hover:bg-luxury-cream/3 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-luxury-champagne/10 flex items-center justify-center text-luxury-champagne font-bold font-serif text-sm flex-shrink-0">
                      {customer.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-luxury-cream">{customer.name}</div>
                      <div className="text-luxury-cream/40 text-[9px]">{customer.email}</div>
                      <div className="text-luxury-cream/30 text-[9px]">{customer.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center hidden sm:table-cell">
                  <span className="font-bold text-luxury-cream">{customer.totalOrders}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-serif font-bold text-luxury-champagne">KES {customer.totalSpent.toLocaleString()}</span>
                </td>
                <td className="px-4 py-3 text-center text-luxury-cream/40 hidden md:table-cell">
                  {new Date(customer.lastOrder).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-[8px] px-2.5 py-1 rounded border font-bold uppercase tracking-wider ${
                    customer.status === 'ACTIVE'
                      ? 'text-green-400 bg-green-900/20 border-green-800/30'
                      : 'text-gray-400 bg-gray-900/20 border-gray-800/30'
                  }`}>
                    {customer.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-luxury-cream/30 text-xs tracking-widest uppercase font-semibold">
            No customers match your search
          </div>
        )}
      </div>
    </div>
  );
}
