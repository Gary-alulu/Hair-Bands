'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, ShoppingBag, Users, Calendar,
  Package, ArrowUpRight, ArrowDownRight, DollarSign
} from 'lucide-react';

// ─── Mock Analytics Data ───────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
const REVENUE_DATA = [42000, 67000, 55000, 89000, 78000, 102000, 95000, 134000];
const ORDERS_DATA = [8, 14, 11, 18, 16, 21, 19, 27];
const RESERVATIONS_DATA = [3, 5, 4, 7, 6, 9, 8, 12];

const RECENT_ORDERS = [
  { id: 'ORD-00003', customer: 'Amara Otieno', product: 'Amara Straight 20"', total: 16200, status: 'PROCESSING', time: '2h ago' },
  { id: 'ORD-00002', customer: 'Zuri Wambui', product: 'Naomi Deep Wave 18"', total: 12800, status: 'OUT_FOR_DELIVERY', time: '5h ago' },
  { id: 'ORD-00001', customer: 'Zuri Wambui', product: 'Maya Body Wave 22"', total: 18500, status: 'DELIVERED', time: '3d ago' },
];

const TOP_PRODUCTS = [
  { name: 'Maya Body Wave 22"', sold: 24, revenue: 444000, trend: '+18%' },
  { name: 'Naomi Deep Wave 18"', sold: 18, revenue: 201600, trend: '+12%' },
  { name: 'Amara Straight 20"', sold: 15, revenue: 234000, trend: '+8%' },
  { name: 'Silk Press Serum', sold: 48, revenue: 38400, trend: '+22%' },
];

const STATUS_COLORS: Record<string, string> = {
  PROCESSING: 'text-blue-400 bg-blue-900/30',
  OUT_FOR_DELIVERY: 'text-orange-400 bg-orange-900/30',
  DELIVERED: 'text-green-400 bg-green-900/30',
  CANCELLED: 'text-red-400 bg-red-900/30',
};

// ─── Mini Bar Chart Component ──────────────────────────────────────────────────

function BarChart({ data, color = '#D6B98C', label }: { data: number[]; color?: string; label: string }) {
  const max = Math.max(...data);
  return (
    <div>
      <div className="flex items-end space-x-1.5 h-28">
        {data.map((val, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${(val / max) * 100}%` }}
            transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
            className="flex-1 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity cursor-default group relative"
            style={{ backgroundColor: color, minHeight: '4px' }}
          >
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-luxury-espresso border border-luxury-cream/10 text-[8px] text-luxury-cream px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {typeof val === 'number' && val > 999 ? `KES ${(val / 1000).toFixed(0)}k` : val}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex space-x-1.5 mt-2">
        {MONTHS.map((m, i) => (
          <div key={i} className="flex-1 text-center text-[8px] text-luxury-cream/30 font-semibold">{m}</div>
        ))}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, change, positive }: {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-luxury-espresso/60 border border-luxury-cream/10 rounded-sm p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <Icon size={16} className="text-luxury-champagne" />
        <span className={`text-[9px] font-bold flex items-center ${positive ? 'text-green-400' : 'text-red-400'}`}>
          {positive ? <ArrowUpRight size={11} className="mr-0.5" /> : <ArrowDownRight size={11} className="mr-0.5" />}
          {change}
        </span>
      </div>
      <div className="font-serif text-2xl font-bold text-luxury-cream">{value}</div>
      <div className="text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold mt-1">{label}</div>
    </motion.div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [chartView, setChartView] = useState<'revenue' | 'orders' | 'reservations'>('revenue');

  const chartData = {
    revenue: { data: REVENUE_DATA, color: '#D6B98C', unit: 'KES' },
    orders: { data: ORDERS_DATA, color: '#795548', unit: 'orders' },
    reservations: { data: RESERVATIONS_DATA, color: '#5A3828', unit: 'bookings' },
  }[chartView];

  const totalRevenue = REVENUE_DATA.reduce((a, b) => a + b, 0);
  const totalOrders = ORDERS_DATA.reduce((a, b) => a + b, 0);
  const totalReservations = RESERVATIONS_DATA.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8 text-luxury-cream">
      {/* Page Header */}
      <div>
        <span className="font-script text-3xl text-luxury-champagne">analytics overview</span>
        <h1 className="font-serif text-2xl tracking-widest uppercase text-luxury-cream font-light mt-1">Sales Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={`KES ${(totalRevenue / 1000).toFixed(0)}k`} change="+23%" positive />
        <StatCard icon={ShoppingBag} label="Total Orders" value={totalOrders.toString()} change="+18%" positive />
        <StatCard icon={Calendar} label="Reservations" value={totalReservations.toString()} change="+31%" positive />
        <StatCard icon={Users} label="Active Customers" value="47" change="+9%" positive />
      </div>

      {/* Revenue Chart */}
      <div className="bg-luxury-espresso/60 border border-luxury-cream/10 rounded-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-sm tracking-widest uppercase text-luxury-cream font-semibold">Performance Trends</h2>
            <p className="text-[9px] tracking-widest uppercase text-luxury-cream/40 mt-1">Jan – Aug 2026</p>
          </div>
          <div className="flex space-x-1">
            {(['revenue', 'orders', 'reservations'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setChartView(v)}
                className={`px-3 py-1.5 text-[8px] tracking-widest uppercase font-bold rounded-sm transition-all ${
                  chartView === v
                    ? 'bg-luxury-champagne/20 text-luxury-champagne border border-luxury-champagne/30'
                    : 'text-luxury-cream/40 hover:text-luxury-cream/70'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <BarChart data={chartData.data} color={chartData.color} label={chartData.unit} />
      </div>

      {/* Two-column lower section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Orders */}
        <div className="bg-luxury-espresso/60 border border-luxury-cream/10 rounded-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-sm tracking-widest uppercase text-luxury-cream font-semibold">Recent Orders</h2>
            <a href="/admin/orders" className="text-[9px] tracking-widest uppercase text-luxury-champagne hover:text-luxury-cream font-bold">View All</a>
          </div>
          <div className="space-y-3">
            {RECENT_ORDERS.map((order) => (
              <a
                key={order.id}
                href={`/admin/orders`}
                className="flex items-center justify-between p-3 border border-luxury-cream/5 hover:border-luxury-cream/20 rounded-sm transition-all group"
              >
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold tracking-wider text-luxury-cream">{order.id}</div>
                  <div className="text-[9px] text-luxury-cream/50">{order.customer} · {order.product}</div>
                </div>
                <div className="text-right space-y-1">
                  <div className="font-serif text-xs font-bold text-luxury-champagne">KES {order.total.toLocaleString()}</div>
                  <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${STATUS_COLORS[order.status] || 'text-gray-400 bg-gray-900/30'}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-luxury-espresso/60 border border-luxury-cream/10 rounded-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-sm tracking-widest uppercase text-luxury-cream font-semibold">Top Products</h2>
            <a href="/admin/products" className="text-[9px] tracking-widest uppercase text-luxury-champagne hover:text-luxury-cream font-bold">Manage</a>
          </div>
          <div className="space-y-3">
            {TOP_PRODUCTS.map((product, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-luxury-cream/5 rounded-sm">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-luxury-champagne/10 text-luxury-champagne text-[9px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <div className="text-[10px] font-semibold text-luxury-cream">{product.name}</div>
                    <div className="text-[9px] text-luxury-cream/40">{product.sold} units sold</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-luxury-champagne">KES {(product.revenue / 1000).toFixed(0)}k</div>
                  <div className="text-[9px] text-green-400 font-semibold">{product.trend}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reservation Summary */}
      <div className="bg-luxury-espresso/60 border border-luxury-cream/10 rounded-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-sm tracking-widest uppercase text-luxury-cream font-semibold">Upcoming Reservations</h2>
          <a href="/admin/reservations" className="text-[9px] tracking-widest uppercase text-luxury-champagne hover:text-luxury-cream font-bold">View Calendar</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Wig Fittings', count: 4, color: 'text-yellow-400' },
            { label: 'Consultations', count: 2, color: 'text-blue-400' },
            { label: 'Piece Viewings', count: 6, color: 'text-green-400' },
          ].map((item) => (
            <div key={item.label} className="p-4 border border-luxury-cream/10 rounded-sm text-center">
              <div className={`font-serif text-3xl font-bold ${item.color}`}>{item.count}</div>
              <div className="text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold mt-1">{item.label}</div>
              <div className="text-[8px] text-luxury-cream/30 mt-1">This week</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
