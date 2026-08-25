import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mockDb, MockReservation } from '@/lib/mockDb';

// Handle GET: Fetch available dates and time slots
export async function GET(req: NextRequest) {
  try {
    const hasRealKeys = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

    if (hasRealKeys) {
      const { data, error } = await supabase
        .from('reservation_slots')
        .select('*')
        .order('date', { ascending: true })
        .order('time_slot', { ascending: true });

      if (error) throw error;
      return NextResponse.json({ slots: data });
    } else {
      // Mock calendar slots setup
      // We will reconstruct a list of slots dynamically
      const dates = ['2026-08-26', '2026-08-27', '2026-08-28'];
      const slotsList = [];

      for (const d of dates) {
        const timeSlots = ['09:00 - 10:00', '10:30 - 11:30', '13:00 - 14:00', '14:30 - 15:30'];
        for (const t of timeSlots) {
          // Check if this slot already has mock bookings
          const bookedCount = mockDb.reservations.filter(
            (r: MockReservation) => r.date === d && r.time_slot === t && (r.status === 'APPROVED' || r.status === 'PENDING')
          ).length;

          slotsList.push({
            date: d,
            time_slot: t,
            max_capacity: 1,
            current_bookings: bookedCount
          });
        }
      }
      return NextResponse.json({ slots: slotsList });
    }
  } catch (err: any) {
    console.error('Error fetching slots:', err);
    return NextResponse.json({ error: 'Failed to retrieve reservation slots.' }, { status: 500 });
  }
}

// Handle POST: Create a reservation with double-booking checks
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerEmail, customerPhone, serviceType, productId, productName, date, timeSlot, userId } = body;

    if (!customerName || !customerEmail || !customerPhone || !serviceType || !date || !timeSlot) {
      return NextResponse.json({ error: 'Missing required reservation fields.' }, { status: 400 });
    }

    const hasRealKeys = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

    const rsvId = `RSV-${Math.floor(10000 + Math.random() * 90000)}`;

    if (hasRealKeys) {
      // Start Database Check (simulate lock/transaction checks)
      const { data: slot, error: sError } = await supabase
        .from('reservation_slots')
        .select('*')
        .eq('date', date)
        .eq('time_slot', timeSlot)
        .single();

      if (sError || !slot) {
        return NextResponse.json({ error: 'The selected date and time slot is not configured.' }, { status: 404 });
      }

      if (slot.current_bookings >= slot.max_capacity) {
        return NextResponse.json({ error: 'Double-Booking Protection: That time slot is no longer available.' }, { status: 409 });
      }

      // 1. Create Reservation
      const { error: rError } = await supabase
        .from('reservations')
        .insert({
          id: rsvId,
          user_id: userId || null,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          service_type: serviceType,
          product_id: productId || null,
          date: date,
          time_slot: timeSlot,
          status: 'PENDING'
        });

      if (rError) throw rError;

      // 2. Increment Slot current_bookings
      const newBookingsCount = slot.current_bookings + 1;
      const { error: uError } = await supabase
        .from('reservation_slots')
        .update({ current_bookings: newBookingsCount })
        .eq('id', slot.id);

      if (uError) throw uError;

    } else {
      // ------------------ MOCK MODE PROCESS ------------------
      // Check double booking in mock memory
      const currentBookings = mockDb.reservations.filter(
        (r: MockReservation) => r.date === date && r.time_slot === timeSlot && (r.status === 'APPROVED' || r.status === 'PENDING')
      ).length;

      if (currentBookings >= 1) {
        return NextResponse.json({ error: 'Double-Booking Protection: That time slot is no longer available.' }, { status: 409 });
      }

      const newMockRsv: MockReservation = {
        id: rsvId,
        user_id: userId || null,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        service_type: serviceType,
        product_id: productId || null,
        product_name: productName || undefined,
        date: date,
        time_slot: timeSlot,
        status: 'PENDING',
        created_at: new Date().toISOString()
      };

      mockDb.reservations.push(newMockRsv);
    }

    return NextResponse.json({
      success: true,
      reservationId: rsvId,
      message: 'Reservation request registered successfully.'
    });

  } catch (err: any) {
    console.error('Error creating reservation:', err);
    return NextResponse.json({ error: err.message || 'Server error booking appointment.' }, { status: 500 });
  }
}
