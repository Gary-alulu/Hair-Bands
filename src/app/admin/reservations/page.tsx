'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown } from 'lucide-react';

const SERVICE_LABELS: Record<string, string> = {
  wig_fitting: 'Wig Fitting',
  wig_viewing: 'Piece Viewing',
  custom_wig_consultation: 'Custom Design',
  hair_consultation: 'Hair Assessment',
};

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
  PENDING: { icon: <AlertCircle size={11} />, label: 'Pending', cls: 'text-yellow-400 bg-yellow-900/20 border-yellow-800/30' },
  APPROVED: { icon: <CheckCircle size={11} />, label: 'Approved', cls: 'text-green-400 bg-green-900/20 border-green-800/30' },
  REJECTED: { icon: <XCircle size={11} />, label: 'Declined', cls: 'text-red-400 bg-red-900/20 border-red-800/30' },
  CANCELLED: { icon: <XCircle size={11} />, label: 'Cancelled', cls: 'text-gray-400 bg-gray-900/20 border-gray-800/30' },
  COMPLETED: { icon: <CheckCircle size={11} />, label: 'Completed', cls: 'text-blue-400 bg-blue-900/20 border-blue-800/30' },
};

type ResStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

interface Reservation {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  service_type: string;
  product_name: string | null;
  date: string;
  time_slot: string;
  status: ResStatus;
  created_at: string;
}

const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'RSV-84192',
    customer_name: 'Zuri Wambui',
    customer_phone: '+254 712 345 678',
    customer_email: 'zuri.wambui@gmail.com',
    service_type: 'wig_fitting',
    product_name: 'Maya Body Wave',
    date: '2026-08-26',
    time_slot: '10:30 - 11:30',
    status: 'APPROVED',
    created_at: new Date().toISOString(),
  },
  {
    id: 'RSV-20481',
    customer_name: 'Zuri Wambui',
    customer_phone: '+254 712 345 678',
    customer_email: 'zuri.wambui@gmail.com',
    service_type: 'custom_wig_consultation',
    product_name: null,
    date: '2026-08-27',
    time_slot: '13:00 - 14:00',
    status: 'PENDING',
    created_at: new Date().toISOString(),
  },
  {
    id: 'RSV-33901',
    customer_name: 'Amara Otieno',
    customer_phone: '+254 701 234 567',
    customer_email: 'amara.otieno@gmail.com',
    service_type: 'wig_viewing',
    product_name: null,
    date: '2026-08-28',
    time_slot: '11:00 - 11:30',
    status: 'PENDING',
    created_at: new Date().toISOString(),
  },
];

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState(MOCK_RESERVATIONS);
  const [filter, setFilter] = useState<ResStatus | 'ALL'>('ALL');
  const [updating, setUpdating] = useState<string | null>(null);

  // Also attempt to fetch from API (merges with mock)
  useEffect(() => {
    fetch('/api/reservations')
      .then((r) => r.json())
      .then((data) => {
        if (data.reservations && data.reservations.length > 0) {
          setReservations((prev) => {
            const ids = new Set(prev.map((r) => r.id));
            const newOnes = data.reservations.filter((r: any) => !ids.has(r.id));
            return [...prev, ...newOnes];
          });
        }
      })
      .catch(() => {});
  }, []);

  const filtered = reservations.filter((r) => filter === 'ALL' || r.status === filter);

  const handleStatusUpdate = async (id: string, newStatus: ResStatus) => {
    setUpdating(id);
    await new Promise((r) => setTimeout(r, 500));
    setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status: newStatus } : r));
    setUpdating(null);
  };

  const pending = reservations.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-6 text-luxury-cream">
      <div className="flex items-start justify-between">
        <div>
          <span className="font-script text-2xl text-luxury-champagne">appointments</span>
          <h1 className="font-serif text-xl tracking-widest uppercase text-luxury-cream font-light">Reservations</h1>
        </div>
        {pending > 0 && (
          <div className="flex items-center px-3 py-2 bg-yellow-900/30 border border-yellow-800/30 rounded-sm text-yellow-400 text-[9px] font-bold uppercase tracking-widest">
            <AlertCircle size={11} className="mr-1.5" />
            {pending} Awaiting Review
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 border-b border-luxury-cream/10 pb-1">
        {(['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 text-[9px] tracking-widest uppercase font-bold transition-all rounded-sm ${
              filter === f
                ? 'bg-luxury-champagne/10 text-luxury-champagne border border-luxury-champagne/20'
                : 'text-luxury-cream/40 hover:text-luxury-cream/70'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Reservation Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-luxury-cream/30 text-xs tracking-widest uppercase">No reservations found</div>
        ) : (
          filtered.map((res) => {
            const statusCfg = STATUS_CONFIG[res.status];
            return (
              <div
                key={res.id}
                className="bg-luxury-espresso/60 border border-luxury-cream/10 rounded-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className={`text-[8px] px-2.5 py-1 rounded border font-bold uppercase tracking-widest flex items-center gap-1 ${statusCfg.cls}`}>
                      {statusCfg.icon} {statusCfg.label}
                    </span>
                    <span className="text-[9px] text-luxury-cream/40 font-mono">{res.id}</span>
                  </div>
                  <div className="text-xs font-bold text-luxury-cream tracking-wider uppercase">
                    {SERVICE_LABELS[res.service_type] || res.service_type}
                    {res.product_name && <span className="text-luxury-champagne ml-2 font-normal">· {res.product_name}</span>}
                  </div>
                  <div className="text-[9px] text-luxury-cream/50">
                    {res.customer_name} · {res.customer_phone}
                  </div>
                  <div className="flex items-center space-x-4 text-[9px] text-luxury-cream/40">
                    <span className="flex items-center"><Calendar size={10} className="mr-1 text-luxury-champagne" />
                      {new Date(res.date).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="flex items-center"><Clock size={10} className="mr-1 text-luxury-champagne" />
                      {res.time_slot}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {res.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(res.id, 'APPROVED')}
                        disabled={updating === res.id}
                        className="px-4 py-2 bg-green-800/30 border border-green-700/30 text-green-400 hover:bg-green-800/50 text-[9px] uppercase font-bold tracking-widest rounded-sm transition-all"
                      >
                        {updating === res.id ? '...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(res.id, 'REJECTED')}
                        disabled={updating === res.id}
                        className="px-4 py-2 bg-red-900/20 border border-red-800/30 text-red-400 hover:bg-red-900/40 text-[9px] uppercase font-bold tracking-widest rounded-sm transition-all"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {res.status === 'APPROVED' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(res.id, 'COMPLETED')}
                        disabled={updating === res.id}
                        className="px-4 py-2 bg-blue-900/20 border border-blue-800/30 text-blue-400 hover:bg-blue-900/40 text-[9px] uppercase font-bold tracking-widest rounded-sm transition-all"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(res.id, 'CANCELLED')}
                        disabled={updating === res.id}
                        className="px-3 py-2 border border-luxury-cream/10 text-luxury-cream/40 hover:text-luxury-cream/70 text-[9px] uppercase font-bold rounded-sm transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
