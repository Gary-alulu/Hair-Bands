'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, Sparkles, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock catalog for fitting selection dropdown
const MOCK_WIGS = [
  { id: 'p1000000-0000-0000-0000-000000000001', name: 'Maya Body Wave' },
  { id: 'p1000000-0000-0000-0000-000000000002', name: 'Amara Straight' },
  { id: 'p1000000-0000-0000-0000-000000000003', name: 'Naomi Deep Wave' }
];

const SERVICES = [
  { id: 'wig_fitting', name: 'Wig Custom Fitting', desc: 'Visit our beauty room to adjust, crop, and style your wig cap for a customized scalp melt. (60 mins)', requiresProduct: true },
  { id: 'wig_viewing', name: 'Luxury Piece Viewing', desc: 'Touch, inspect, and try on our luxury human hair collections before making a purchase. (30 mins)', requiresProduct: false },
  { id: 'custom_wig_consultation', name: 'Custom Design Session', desc: 'Meet our master stylist to select donor lengths, textures, and custom colors. (45 mins)', requiresProduct: false },
  { id: 'hair_consultation', name: 'Scalp & Hair Assessment', desc: 'Analysis of extension care or natural hair care routines with product recommendations. (30 mins)', requiresProduct: false }
];

function ReservationsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();

  // Booking Flow Steps: 1 = Service, 2 = Date & Time, 3 = Personal Info, 4 = Success
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Selections
  const [selectedService, setSelectedService] = useState(SERVICES[0]);
  const [selectedProduct, setSelectedProduct] = useState(MOCK_WIGS[0]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: profile?.full_name || '',
    phone: profile?.phone || '',
    email: profile?.email || ''
  });

  // Calendar Slots fetched from API
  const [slots, setSlots] = useState<any[]>([]);
  const [uniqueDates, setUniqueDates] = useState<string[]>([]);
  const [bookingResponse, setBookingResponse] = useState<any | null>(null);

  // Parse preset parameters (e.g. from product page)
  useEffect(() => {
    const presetProdId = searchParams.get('product');
    if (presetProdId) {
      const match = MOCK_WIGS.find((w) => w.id === presetProdId);
      if (match) {
        setSelectedProduct(match);
        const fittingService = SERVICES.find((s) => s.id === 'wig_fitting') || SERVICES[0];
        setSelectedService(fittingService);
      }
    }
  }, [searchParams]);

  // Load user data if logged in
  useEffect(() => {
    if (profile) {
      setCustomerInfo({
        name: profile.full_name,
        phone: profile.phone,
        email: profile.email
      });
    }
  }, [profile]);

  // Fetch slots from route API
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch('/api/reservations');
        const data = await res.json();
        if (data.slots) {
          setSlots(data.slots);
          const dates = Array.from(new Set(data.slots.map((s: any) => s.date))) as string[];
          setUniqueDates(dates);
          if (dates.length > 0) setSelectedDate(dates[0]);
        }
      } catch (err) {
        console.error('Failed to load slots:', err);
      }
    };
    fetchSlots();
  }, []);

  const handleServiceSelect = (service: typeof SERVICES[0]) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleDateTimeSelect = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both a date and time slot.');
      return;
    }
    setStep(3);
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.email) {
      alert('Please fill out all client details.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          serviceType: selectedService.id,
          productId: selectedService.requiresProduct ? selectedProduct.id : null,
          productName: selectedService.requiresProduct ? selectedProduct.name : null,
          date: selectedDate,
          timeSlot: selectedTime,
          userId: user?.id || null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to book slot.');
      }

      setBookingResponse(data);
      setStep(4);

    } catch (err: any) {
      setErrorMsg(err.message || 'Slot booking failed. Please try another time.');
    } finally {
      setSubmitting(false);
    }
  };

  // Get slots for the currently active date
  const activeDateSlots = slots.filter((s) => s.date === selectedDate);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-luxury-cream">
      
      {/* Header */}
      <div className="text-center mb-16">
        <span className="font-script text-3xl text-luxury-champagne">bespoke appointments</span>
        <h1 className="font-serif text-3xl sm:text-4xl tracking-widest text-luxury-chocolate uppercase mt-2 font-light">Beauty Consultations</h1>
        <div className="w-10 h-px bg-luxury-champagne mx-auto mt-4" />
      </div>

      <div className="max-w-3xl mx-auto bg-luxury-cream border border-luxury-chocolate/10 p-6 md:p-10 rounded-sm luxury-shadow">
        
        {/* Step Navigation Bar */}
        {step < 4 && (
          <div className="flex items-center justify-between text-xs tracking-widest uppercase font-bold text-luxury-coffee mb-10 pb-6 border-b border-luxury-chocolate/5">
            <span className={step === 1 ? 'text-luxury-chocolate border-b border-luxury-chocolate pb-1' : 'opacity-40'}>1. Service</span>
            <span className={step === 2 ? 'text-luxury-chocolate border-b border-luxury-chocolate pb-1' : 'opacity-40'}>2. Date & Time</span>
            <span className={step === 3 ? 'text-luxury-chocolate border-b border-luxury-chocolate pb-1' : 'opacity-40'}>3. Client Info</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* STEP 1: Select Service */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <h2 className="font-serif text-lg text-luxury-chocolate uppercase font-semibold">Select Beauty Service</h2>
              
              <div className="space-y-4">
                {SERVICES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleServiceSelect(s)}
                    className="w-full p-5 border border-luxury-chocolate/10 hover:border-luxury-chocolate bg-luxury-cream hover:bg-luxury-beige/25 text-left rounded-sm transition-all duration-300 flex justify-between items-center group"
                  >
                    <div className="space-y-1">
                      <span className="text-xs uppercase tracking-widest font-bold text-luxury-chocolate group-hover:text-luxury-champagne transition-colors">
                        {s.name}
                      </span>
                      <p className="text-[11px] text-luxury-coffee leading-relaxed">{s.desc}</p>
                    </div>
                    <ArrowRight size={16} className="text-luxury-chocolate/40 group-hover:text-luxury-chocolate transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Select Date & Available Time Slot */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-lg text-luxury-chocolate uppercase font-semibold">Select Date & Time</h2>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs uppercase tracking-wider text-luxury-chocolate/70 hover:text-luxury-chocolate flex items-center"
                >
                  <ArrowLeft size={12} className="mr-1.5" /> Back to Services
                </button>
              </div>

              {/* Service requires product mapping */}
              {selectedService.requiresProduct && (
                <div className="p-4 bg-luxury-beige/30 border border-luxury-chocolate/10 rounded-sm space-y-2">
                  <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold block">Select Fitting Product</label>
                  <select
                    value={selectedProduct.id}
                    onChange={(e) => {
                      const match = MOCK_WIGS.find((w) => w.id === e.target.value);
                      if (match) setSelectedProduct(match);
                    }}
                    className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate text-luxury-espresso font-semibold"
                  >
                    {MOCK_WIGS.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Calendar Date Tabs */}
              <div className="space-y-2">
                <span className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold flex items-center">
                  <CalendarIcon size={12} className="mr-1.5" /> Select Date
                </span>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {uniqueDates.map((date) => {
                    const isSelected = selectedDate === date;
                    const dateObj = new Date(date);
                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => { setSelectedDate(date); setSelectedTime(''); }}
                        className={`px-5 py-3 border text-center rounded-sm flex-shrink-0 min-w-24 transition-all ${
                          isSelected
                            ? 'bg-luxury-chocolate border-luxury-chocolate text-luxury-cream'
                            : 'border-luxury-chocolate/20 text-luxury-chocolate bg-luxury-cream hover:bg-luxury-beige'
                        }`}
                      >
                        <div className="text-[9px] uppercase tracking-widest font-bold opacity-60">
                          {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-sm font-serif font-bold mt-1">
                          {dateObj.getDate()} {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots grid */}
              <div className="space-y-2">
                <span className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold flex items-center">
                  <Clock size={12} className="mr-1.5" /> Select Time Slot
                </span>
                
                {activeDateSlots.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-luxury-chocolate/20 text-xs text-luxury-coffee tracking-wider">
                    No bookings available on this date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {activeDateSlots.map((slot) => {
                      const isBookedOut = slot.current_bookings >= slot.max_capacity;
                      const isSelected = selectedTime === slot.time_slot;
                      
                      return (
                        <button
                          key={slot.time_slot}
                          type="button"
                          disabled={isBookedOut}
                          onClick={() => setSelectedTime(slot.time_slot)}
                          className={`p-3 border text-xs tracking-wider rounded-sm font-semibold transition-all ${
                            isBookedOut
                              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-luxury-chocolate border-luxury-chocolate text-luxury-cream'
                              : 'border-luxury-chocolate/20 text-luxury-chocolate bg-luxury-cream hover:bg-luxury-beige'
                          }`}
                        >
                          {slot.time_slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Navigation button */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleDateTimeSelect}
                  disabled={!selectedTime}
                  className={`px-8 py-4 text-xs tracking-[0.2em] font-semibold uppercase rounded-sm flex items-center transition-all ${
                    selectedTime
                      ? 'bg-luxury-chocolate text-luxury-cream hover:bg-luxury-coffee'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continue to Info <ArrowRight size={14} className="ml-2" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Enter Client Details */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-lg text-luxury-chocolate uppercase font-semibold">Your Contact Details</h2>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs uppercase tracking-wider text-luxury-chocolate/70 hover:text-luxury-chocolate flex items-center"
                >
                  <ArrowLeft size={12} className="mr-1.5" /> Back to Calendar
                </button>
              </div>

              {/* Review summary snippet */}
              <div className="p-4 bg-luxury-beige/30 border border-luxury-chocolate/10 rounded-sm text-xs tracking-wider text-luxury-coffee space-y-1">
                <div>APPOINTMENT: <span className="font-bold text-luxury-chocolate uppercase">{selectedService.name}</span></div>
                {selectedService.requiresProduct && <div>PRODUCT: <span className="font-bold text-luxury-chocolate uppercase">{selectedProduct.name}</span></div>}
                <div>DATE: <span className="font-bold text-luxury-chocolate">{new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                <div>TIME SLOT: <span className="font-bold text-luxury-chocolate">{selectedTime}</span></div>
              </div>

              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold flex items-center">
                    <User size={12} className="mr-1.5" /> Your Full Name
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate text-luxury-espresso"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold flex items-center">
                      <Phone size={12} className="mr-1.5" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      placeholder="e.g. 0712345678"
                      className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate text-luxury-espresso font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold flex items-center">
                      <Mail size={12} className="mr-1.5" /> Email Address
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      placeholder="you@email.com"
                      className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate text-luxury-espresso"
                      required
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-100 border border-red-300 text-red-800 text-xs rounded-sm text-center font-semibold tracking-wider uppercase">
                    {errorMsg}
                  </div>
                )}

                <div className="pt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-4 border border-luxury-chocolate/20 text-xs tracking-[0.2em] font-semibold uppercase text-luxury-chocolate hover:bg-luxury-beige rounded-sm flex items-center transition-all"
                  >
                    <ArrowLeft size={12} className="mr-1.5" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-4 bg-luxury-chocolate text-luxury-cream hover:bg-luxury-coffee text-xs tracking-[0.25em] font-semibold uppercase rounded-sm flex items-center transition-all"
                  >
                    {submitting ? 'Reserving...' : 'Confirm Appointment'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 4: Success confirmation */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-4"
            >
              <CheckCircle className="mx-auto text-green-800 animate-bounce" size={48} />
              
              <div className="space-y-2">
                <span className="font-script text-3xl text-luxury-champagne">beautiful crown reserved</span>
                <h2 className="font-serif text-xl uppercase tracking-widest text-luxury-chocolate font-bold">Appointment Confirmed</h2>
                <div className="text-xs text-luxury-coffee tracking-widest font-semibold pt-1 uppercase">
                  Reservation Code: <span className="text-luxury-espresso font-bold text-sm bg-luxury-beige px-2 py-0.5 rounded-sm">{bookingResponse?.reservationId}</span>
                </div>
              </div>

              <div className="p-4 bg-luxury-beige/30 border border-luxury-chocolate/10 rounded-sm text-xs tracking-wider text-luxury-coffee space-y-2 max-w-md mx-auto leading-relaxed">
                <p>We are excited to see you! A confirmation summary has been sent to your email.</p>
                <div className="text-[10px] text-gray-500 font-semibold border-t border-luxury-chocolate/10 pt-2 uppercase">
                  TIME: {new Date(selectedDate).toLocaleDateString()} @ {selectedTime}
                </div>
                <div className="text-[10px] text-gray-500 font-semibold uppercase">
                  LOCATION: Suite 24,Westlands Salon, Westlands Road, Nairobi
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/"
                  className="inline-block px-8 py-4 border border-luxury-chocolate bg-luxury-chocolate text-luxury-cream hover:bg-transparent hover:text-luxury-chocolate text-xs tracking-[0.2em] font-semibold transition-all uppercase rounded-sm"
                >
                  Return to Home
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Brand styling accents */}
      <div className="max-w-lg mx-auto text-center mt-12 text-[10px] tracking-widest text-luxury-coffee/50 uppercase leading-relaxed font-semibold">
        <Sparkles size={14} className="mx-auto text-luxury-champagne mb-1" />
        All bookings are protected by double-booking validation algorithms. You can cancel or reschedule up to 24 hours prior by visiting your account dashboard.
      </div>

    </div>
  );
}

export default function ReservationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-luxury-cream flex items-center justify-center">Loading...</div>}>
      <ReservationsPageContent />
    </Suspense>
  );
}
