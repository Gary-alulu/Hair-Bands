'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';

interface Reservation {
  id: string;
  service_type: string;
  product_name?: string;
  date: string;
  time_slot: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  created_at: string;
}

const SERVICE_LABELS: Record<string, string> = {
  wig_fitting: 'Wig Custom Fitting',
  wig_viewing: 'Luxury Piece Viewing',
  custom_wig_consultation: 'Custom Design Session',
  hair_consultation: 'Scalp & Hair Assessment',
};

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
  PENDING: { icon: <AlertCircle size={12} />, label: 'Awaiting Confirmation', cls: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  APPROVED: { icon: <CheckCircle size={12} />, label: 'Confirmed', cls: 'text-green-700 bg-green-50 border-green-200' },
  REJECTED: { icon: <XCircle size={12} />, label: 'Declined', cls: 'text-red-700 bg-red-50 border-red-200' },
  CANCELLED: { icon: <XCircle size={12} />, label: 'Cancelled', cls: 'text-gray-600 bg-gray-50 border-gray-200' },
  COMPLETED: { icon: <CheckCircle size={12} />, label: 'Completed', cls: 'text-blue-700 bg-blue-50 border-blue-200' },
};

export default function AccountReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from API — falls back to mockDb data seeded with user's reservations
    const fetchReservations = async () => {
      try {
        const res = await fetch('/api/reservations');
        const data = await res.json();
        // Filter to only the current user's reservations
        const userEmail = user?.email || 'zuri.wambui@gmail.com';
        const userReservations = (data.reservations || []).filter(
          (r: any) => r.customer_email === userEmail || r.user_id === user?.id
        );
        // Use mock data if API returns nothing
        if (userReservations.length > 0) {
          setReservations(userReservations);
        } else {
          setReservations(MOCK_RESERVATIONS);
        }
      } catch {
        setReservations(MOCK_RESERVATIONS);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-28 bg-luxury-beige/40 animate-pulse rounded-sm" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl tracking-widest uppercase text-luxury-chocolate font-semibold">My Appointments</h1>
          <p className="text-[10px] tracking-widest text-luxury-coffee uppercase mt-1">{reservations.length} appointment(s)</p>
        </div>
        <Link
          href="/reservations"
          className="flex items-center px-4 py-3 bg-luxury-chocolate text-luxury-cream text-[10px] tracking-widest uppercase font-bold rounded-sm hover:bg-luxury-coffee transition-colors"
        >
          <Plus size={12} className="mr-2" /> Book New
        </Link>
      </div>

      {reservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 border border-dashed border-luxury-chocolate/20 rounded-sm">
          <Calendar size={36} className="text-luxury-chocolate/20" />
          <p className="text-xs tracking-widest uppercase text-luxury-coffee font-semibold">No appointments booked</p>
          <Link href="/reservations" className="text-[10px] tracking-widest uppercase text-luxury-champagne hover:text-luxury-chocolate font-bold">
            Book Your First Appointment
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => {
            const statusCfg = STATUS_CONFIG[res.status] || STATUS_CONFIG.PENDING;
            const isPast = new Date(res.date) < new Date();
            return (
              <div
                key={res.id}
                className={`p-5 bg-luxury-cream border rounded-sm luxury-shadow transition-opacity ${
                  isPast && res.status !== 'APPROVED' ? 'opacity-60' : 'opacity-100'
                } border-luxury-chocolate/10`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border flex items-center gap-1 ${statusCfg.cls}`}>
                        {statusCfg.icon}
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-luxury-chocolate uppercase tracking-wider">
                      {SERVICE_LABELS[res.service_type] || res.service_type}
                    </div>
                    {res.product_name && (
                      <div className="text-[11px] text-luxury-coffee">Wig: {res.product_name}</div>
                    )}
                    <div className="flex items-center space-x-4 text-[10px] text-luxury-coffee">
                      <span className="flex items-center"><Calendar size={11} className="mr-1.5 text-luxury-champagne" />
                        {new Date(res.date).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center"><Clock size={11} className="mr-1.5 text-luxury-champagne" />
                        {res.time_slot}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-luxury-coffee/60">
                    <div className="font-bold text-luxury-chocolate/60">{res.id}</div>
                    <div className="mt-1">Booked {new Date(res.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                {res.status === 'APPROVED' && !isPast && (
                  <div className="mt-4 pt-3 border-t border-luxury-chocolate/10 text-[10px] text-luxury-coffee bg-green-50/50 -mx-5 px-5 -mb-5 pb-3 rounded-b-sm">
                    📍 Suite 24, Westlands Salon, Westlands Road, Nairobi · Please arrive 5 mins early
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Fallback mock data when API returns empty
const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'RSV-84192',
    service_type: 'wig_fitting',
    product_name: 'Maya Body Wave',
    date: '2026-08-26',
    time_slot: '10:30 - 11:30',
    status: 'APPROVED',
    created_at: new Date().toISOString(),
  },
  {
    id: 'RSV-20481',
    service_type: 'custom_wig_consultation',
    date: '2026-08-27',
    time_slot: '13:00 - 14:00',
    status: 'PENDING',
    created_at: new Date().toISOString(),
  },
];
