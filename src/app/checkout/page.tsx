'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ShieldCheck, CreditCard, ShoppingBag, MapPin, User, Check, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user, profile } = useAuth();

  // Redirect to shop if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      router.replace('/shop');
    }
  }, [cartItems, router]);

  // Steps: 1 = Contact, 2 = Shipping, 3 = Payment / Review
  const [step, setStep] = useState(1);

  // Forms
  const [customerInfo, setCustomerInfo] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    email: profile?.email || ''
  });

  const [deliveryDetails, setDeliveryDetails] = useState({
    delivery_method: 'delivery', // 'delivery' | 'pickup'
    county: 'Nairobi',
    town: '',
    area: '',
    building: '',
    apartment: '',
    delivery_notes: ''
  });

  // Load profile when auth loaded
  useEffect(() => {
    if (profile) {
      setCustomerInfo({
        full_name: profile.full_name,
        phone: profile.phone,
        email: profile.email
      });
    }
  }, [profile]);

  // Payment states
  const [isPaying, setIsPaying] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('PENDING'); // PENDING | SUCCESS | FAILED
  const [paymentError, setPaymentError] = useState('');
  const [isMockMode, setIsMockMode] = useState(false);

  // Checks if mock mode is on
  useEffect(() => {
    setIsMockMode(process.env.NEXT_PUBLIC_PAYMENT_MODE === 'mock' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder'));
  }, []);

  const handleNextStep = () => {
    if (step === 1) {
      if (!customerInfo.full_name || !customerInfo.phone || !customerInfo.email) {
        alert('Please fill out all contact information.');
        return;
      }
      // Basic Kenyan phone validation check
      const cleanPhone = customerInfo.phone.replace(/\D/g, '');
      if (cleanPhone.length < 9) {
        alert('Please enter a valid Kenyan phone number.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (deliveryDetails.delivery_method === 'delivery') {
        if (!deliveryDetails.county || !deliveryDetails.town || !deliveryDetails.area) {
          alert('Please fill out all shipping fields.');
          return;
        }
      }
      setStep(3);
    }
  };

  const handleStkPush = async () => {
    try {
      setIsPaying(true);
      setPaymentError('');
      setPaymentStatus('PENDING');

      const response = await fetch('/api/payment/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerInfo,
          deliveryDetails,
          cartItems,
          userId: user?.id || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate checkout.');
      }

      setCheckoutRequestId(data.checkoutRequestId);

      // Start Polling Payment Status
      startPolling(data.checkoutRequestId);

    } catch (err: any) {
      console.error('Checkout error:', err);
      setPaymentError(err.message || 'Payment initiation failed.');
      setIsPaying(false);
    }
  };

  const startPolling = (checkoutId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/status/${checkoutId}`);
        const statusData = await res.json();

        if (statusData.status === 'SUCCESS') {
          clearInterval(interval);
          setPaymentStatus('SUCCESS');
          
          // Play confetti
          import('canvas-confetti').then((confetti) => {
            confetti.default({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 }
            });
          });

          // Clear cart
          clearCart();

          // Redirect to orders success page after 3 seconds
          setTimeout(() => {
            router.push(`/account/orders/${statusData.orderId}`);
          }, 3000);

        } else if (statusData.status === 'FAILED' || statusData.status === 'CANCELLED') {
          clearInterval(interval);
          setPaymentStatus('FAILED');
          setPaymentError('The payment request was cancelled or declined on your device.');
        }
      } catch (err) {
        console.error('Error polling payment:', err);
      }
    }, 2000);

    // Timeout polling after 60 seconds
    setTimeout(() => {
      clearInterval(interval);
      if (paymentStatus === 'PENDING') {
        setPaymentStatus('FAILED');
        setPaymentError('Payment timeout. You did not enter your PIN in time.');
      }
    }, 60000);
  };

  // Simulate payment webhook response in mock mode
  const simulatePaymentCallback = async (success: boolean) => {
    try {
      const amount = subtotal + (deliveryDetails.delivery_method === 'pickup' ? 0 : 500);
      
      const payload = {
        Body: {
          stkCallback: {
            MerchantRequestID: `mock-merchant-${Date.now()}`,
            CheckoutRequestID: checkoutRequestId,
            ResultCode: success ? 0 : 1032,
            ResultDesc: success ? 'The service request is processed successfully.' : 'Request cancelled by user.',
            CallbackMetadata: success ? {
              Item: [
                { Name: 'Amount', Value: amount },
                { Name: 'MpesaReceiptNumber', Value: `QHG${Math.floor(100000 + Math.random() * 900000)}` },
                { Name: 'TransactionDate', Value: Number(new Date().toISOString().replace(/\D/g, '').slice(0, 14)) },
                { Name: 'PhoneNumber', Value: Number(customerInfo.phone.replace(/\D/g, '')) }
              ]
            } : undefined
          }
        }
      };

      await fetch('/api/payment/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

    } catch (err) {
      console.error('Simulation error:', err);
    }
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-luxury-cream">
      
      {/* Checkout Shell Header */}
      <div className="flex justify-between items-center pb-6 border-b border-luxury-chocolate/10 mb-10">
        <Link href="/cart" className="flex items-center text-xs tracking-wider uppercase font-semibold text-luxury-chocolate hover:text-luxury-coffee">
          <ArrowLeft size={14} className="mr-2" /> Back to Bag
        </Link>
        <span className="font-serif text-lg tracking-[0.2em] uppercase font-bold text-luxury-chocolate">Checkout</span>
        <div className="w-12 h-1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Side: Checkout Form steps */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Checkout Steps bar */}
          <div className="flex items-center justify-between text-xs tracking-widest uppercase font-bold text-luxury-coffee pb-6 border-b border-luxury-chocolate/5">
            <span className={step === 1 ? 'text-luxury-chocolate font-bold border-b border-luxury-chocolate pb-1' : 'opacity-55'}>1. Contact</span>
            <span className="opacity-30">/</span>
            <span className={step === 2 ? 'text-luxury-chocolate font-bold border-b border-luxury-chocolate pb-1' : 'opacity-55'}>2. Delivery</span>
            <span className="opacity-30">/</span>
            <span className={step === 3 ? 'text-luxury-chocolate font-bold border-b border-luxury-chocolate pb-1' : 'opacity-55'}>3. Payment</span>
          </div>

          <AnimatePresence mode="wait">
            
            {/* Step 1: Customer Profile Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-2">
                  <User size={16} className="text-luxury-champagne" />
                  <h2 className="font-serif text-lg uppercase text-luxury-chocolate font-semibold">Contact Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">Full Name</label>
                    <input
                      type="text"
                      value={customerInfo.full_name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, full_name: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate text-luxury-espresso"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">Phone Number (M-Pesa)</label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      placeholder="e.g. 254712345678"
                      className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate text-luxury-espresso font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">Email Address</label>
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

                <div className="pt-4">
                  <button
                    onClick={handleNextStep}
                    className="w-full sm:w-auto px-8 py-4 bg-luxury-chocolate text-luxury-cream hover:bg-luxury-coffee text-xs tracking-[0.2em] font-semibold uppercase rounded-sm flex items-center justify-center transition-all ml-auto"
                  >
                    Next to Delivery <ArrowRight size={14} className="ml-2" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Shipping/Delivery Particulars */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-luxury-champagne" />
                  <h2 className="font-serif text-lg uppercase text-luxury-chocolate font-semibold">Delivery Logistics</h2>
                </div>

                {/* Delivery Method Selector */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDeliveryDetails({ ...deliveryDetails, delivery_method: 'delivery' })}
                    className={`p-4 border rounded-sm text-left flex flex-col justify-between h-24 transition-all ${
                      deliveryDetails.delivery_method === 'delivery'
                        ? 'border-luxury-chocolate bg-luxury-beige/30'
                        : 'border-luxury-chocolate/15 bg-transparent'
                    }`}
                  >
                    <span className="text-xs uppercase tracking-widest font-bold text-luxury-chocolate">Express Delivery</span>
                    <span className="text-[10px] text-luxury-coffee font-semibold">Premium Courier direct to door (+KSh 500)</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setDeliveryDetails({ ...deliveryDetails, delivery_method: 'pickup' })}
                    className={`p-4 border rounded-sm text-left flex flex-col justify-between h-24 transition-all ${
                      deliveryDetails.delivery_method === 'pickup'
                        ? 'border-luxury-chocolate bg-luxury-beige/30'
                        : 'border-luxury-chocolate/15 bg-transparent'
                    }`}
                  >
                    <span className="text-xs uppercase tracking-widest font-bold text-luxury-chocolate">Boutique Pickup</span>
                    <span className="text-[10px] text-luxury-coffee font-semibold">Collect at Nairobi Beauty Room (Free)</span>
                  </button>
                </div>

                {deliveryDetails.delivery_method === 'delivery' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">County</label>
                      <input
                        type="text"
                        value={deliveryDetails.county}
                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, county: e.target.value })}
                        className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate text-luxury-espresso"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">Town / City</label>
                      <input
                        type="text"
                        value={deliveryDetails.town}
                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, town: e.target.value })}
                        placeholder="e.g. Westlands"
                        className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate text-luxury-espresso"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">Area / Estate Name</label>
                      <input
                        type="text"
                        value={deliveryDetails.area}
                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, area: e.target.value })}
                        placeholder="e.g. Kileleshwa"
                        className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate text-luxury-espresso"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">Building Name / Street</label>
                      <input
                        type="text"
                        value={deliveryDetails.building}
                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, building: e.target.value })}
                        placeholder="e.g. Orchid Apartments"
                        className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate text-luxury-espresso"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">Apartment / House No.</label>
                      <input
                        type="text"
                        value={deliveryDetails.apartment}
                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, apartment: e.target.value })}
                        placeholder="e.g. Apt B4"
                        className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate text-luxury-espresso"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">Delivery Notes / Landmark</label>
                      <textarea
                        value={deliveryDetails.delivery_notes}
                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, delivery_notes: e.target.value })}
                        placeholder="Ring bell or call upon arrival..."
                        className="w-full bg-luxury-cream border border-luxury-chocolate/20 rounded-sm p-3 text-xs tracking-wider focus:outline-none focus:border-luxury-chocolate text-luxury-espresso h-20 resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-luxury-beige/40 rounded-sm border border-luxury-chocolate/10 text-xs tracking-wider text-luxury-coffee space-y-2">
                    <div className="font-bold text-luxury-chocolate uppercase">Nairobi Beauty Room Location</div>
                    <div>House of Beauté, 2nd Floor Suite 24, Westlands Road, Nairobi.</div>
                    <div className="text-[10px] text-gray-500 font-semibold pt-1">HOURS: MON-SAT 9:00 AM - 6:00 PM</div>
                  </div>
                )}

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-4 border border-luxury-chocolate/20 text-xs tracking-[0.2em] font-semibold uppercase text-luxury-chocolate hover:bg-luxury-beige rounded-sm flex items-center transition-all"
                  >
                    <ArrowLeft size={14} className="mr-2" /> Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="px-8 py-4 bg-luxury-chocolate text-luxury-cream hover:bg-luxury-coffee text-xs tracking-[0.2em] font-semibold uppercase rounded-sm flex items-center transition-all"
                  >
                    Review Order <ArrowRight size={14} className="ml-2" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Order Review & Payment Option */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-2">
                  <CreditCard size={16} className="text-luxury-champagne" />
                  <h2 className="font-serif text-lg uppercase text-luxury-chocolate font-semibold">Payment Option</h2>
                </div>

                <div className="p-4 bg-luxury-beige/40 rounded-sm border border-luxury-chocolate/15 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg"
                        alt="M-Pesa Logo"
                        className="h-8 object-contain"
                      />
                      <span className="text-xs uppercase tracking-widest font-bold text-luxury-chocolate">Safaricom M-Pesa STK Push</span>
                    </div>
                    <span className="w-4.5 h-4.5 rounded-full border border-luxury-chocolate bg-luxury-chocolate flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-luxury-cream" />
                    </span>
                  </div>
                  
                  <p className="text-[10px] tracking-wider text-luxury-coffee leading-relaxed uppercase">
                    Upon clicking "PAY NOW", a secure Safaricom Daraja STK Push prompt will be sent directly to your phone. Enter your M-Pesa PIN on your device to confirm the transaction.
                  </p>
                  
                  <div className="text-xs text-luxury-coffee tracking-wider">
                    PAYING PHONE: <span className="font-bold text-luxury-espresso">{customerInfo.phone}</span>
                  </div>
                </div>

                {/* Delivery details summary review */}
                <div className="border border-luxury-chocolate/10 rounded-sm p-4 text-xs tracking-wider text-luxury-coffee space-y-2">
                  <div className="font-bold uppercase text-luxury-chocolate pb-1 border-b border-luxury-chocolate/10 flex justify-between items-center">
                    <span>Shipping Address</span>
                    <button onClick={() => setStep(2)} className="text-[10px] text-luxury-champagne uppercase font-bold hover:underline">Change</button>
                  </div>
                  <div>Recipient: {customerInfo.full_name}</div>
                  <div>Phone: {customerInfo.phone}</div>
                  {deliveryDetails.delivery_method === 'delivery' ? (
                    <div>Address: {deliveryDetails.county}, {deliveryDetails.town}, {deliveryDetails.area}, {deliveryDetails.building}</div>
                  ) : (
                    <div>Method: In-Store Pickup at Westlands Salon</div>
                  )}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-4 border border-luxury-chocolate/20 text-xs tracking-[0.2em] font-semibold uppercase text-luxury-chocolate hover:bg-luxury-beige rounded-sm flex items-center transition-all"
                  >
                    <ArrowLeft size={14} className="mr-2" /> Back
                  </button>
                  
                  <button
                    onClick={handleStkPush}
                    className="px-8 py-4 bg-luxury-chocolate text-luxury-cream hover:bg-luxury-coffee text-xs tracking-[0.25em] font-semibold uppercase rounded-sm flex items-center transition-all"
                  >
                    Pay KSh {total.toLocaleString()} Now
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Simple Order Summary Box */}
        <div className="lg:col-span-5 bg-luxury-beige/40 p-6 md:p-8 border border-luxury-chocolate/10 rounded-sm h-fit space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-luxury-chocolate/10">
            <ShoppingBag size={16} className="text-luxury-chocolate" />
            <h3 className="font-serif text-base uppercase text-luxury-chocolate font-semibold">Your Order</h3>
          </div>

          {/* Items mapping */}
          <div className="max-h-60 overflow-y-auto divide-y divide-luxury-chocolate/5 pr-2">
            {cartItems.map((item) => {
              const basePrice = item.product.sale_price !== null ? item.product.sale_price : item.product.price;
              const itemPrice = Number(basePrice) + Number(item.variant.price_adjustment);
              return (
                <div key={item.variant.id} className="py-3 flex justify-between text-xs tracking-wider">
                  <div>
                    <div className="font-serif font-semibold text-luxury-chocolate uppercase">{item.product.name}</div>
                    <div className="text-[9px] text-gray-500 tracking-widest uppercase">
                      {item.variant.length && `${item.variant.length} / `}
                      {item.variant.density && `${item.variant.density} / `}
                      {item.variant.color} x {item.quantity}
                    </div>
                  </div>
                  <span className="font-semibold text-luxury-espresso font-sans">
                    KSh {(itemPrice * item.quantity).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pricing breakdowns */}
          <div className="border-t border-luxury-chocolate/10 pt-4 space-y-3 text-xs tracking-wider text-luxury-coffee">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>KSh {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span>{deliveryDetails.delivery_method === 'pickup' ? 'Free' : `KSh ${deliveryFee.toLocaleString()}`}</span>
            </div>
            <div className="border-t border-luxury-chocolate/10 pt-3 flex justify-between text-sm uppercase tracking-[0.1em] font-semibold text-luxury-chocolate">
              <span>Grand Total</span>
              <span className="text-base text-luxury-espresso font-sans">KSh {total.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-luxury-chocolate/10 flex items-center space-x-2 text-[10px] tracking-wider text-luxury-coffee">
            <ShieldCheck size={16} className="text-luxury-champagne flex-shrink-0" />
            <span className="uppercase font-semibold">Guaranteed Secure M-Pesa Callback Verification</span>
          </div>
        </div>

      </div>

      {/* M-PESA STK PUSH WAITING & SIMULATION MODAL */}
      <AnimatePresence>
        {isPaying && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-luxury-espresso/60 backdrop-blur-sm" />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-luxury-cream border border-luxury-chocolate/20 rounded-sm luxury-shadow p-8 max-w-md w-full relative z-10 text-center space-y-6"
            >
              <h3 className="font-serif text-xl uppercase tracking-wider text-luxury-chocolate font-semibold">
                {paymentStatus === 'PENDING' && 'M-Pesa Transaction Pending'}
                {paymentStatus === 'SUCCESS' && 'Payment Confirmed'}
                {paymentStatus === 'FAILED' && 'Payment Failed'}
              </h3>

              {paymentStatus === 'PENDING' && (
                <div className="space-y-4">
                  <RefreshCw className="mx-auto text-luxury-champagne animate-spin" size={32} />
                  <p className="text-xs text-luxury-coffee tracking-wider leading-relaxed uppercase">
                    We have dispatched an STK Push prompt to phone <span className="font-bold text-luxury-espresso">{customerInfo.phone}</span>. Please check your screen and enter your M-Pesa PIN.
                  </p>
                  
                  {/* Mock Mode Simulator Inside Modal */}
                  {isMockMode && (
                    <div className="border border-luxury-champagne/40 bg-luxury-beige/35 p-4 rounded-sm space-y-3 mt-6">
                      <div className="text-[10px] tracking-widest uppercase font-bold text-luxury-chocolate">
                        Mock Simulator Mode
                      </div>
                      <p className="text-[9px] text-gray-500 tracking-wider leading-normal">
                        Click below to simulate typing your M-Pesa PIN and sending successful payment callback details to the server hook.
                      </p>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => simulatePaymentCallback(true)}
                          className="flex-1 py-2 bg-green-800 text-luxury-cream text-[10px] tracking-widest font-semibold uppercase hover:bg-green-900 rounded-sm transition-all"
                        >
                          Simulate Success PIN
                        </button>
                        <button
                          onClick={() => simulatePaymentCallback(false)}
                          className="flex-1 py-2 bg-red-800 text-luxury-cream text-[10px] tracking-widest font-semibold uppercase hover:bg-red-900 rounded-sm transition-all"
                        >
                          Simulate Cancel/Fail
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {paymentStatus === 'SUCCESS' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-800">
                    <Check size={24} />
                  </div>
                  <p className="text-xs text-green-800 tracking-widest uppercase font-semibold">
                    Thank you! Your payment has been successfully received.
                  </p>
                  <p className="text-[10px] text-luxury-coffee tracking-widest leading-relaxed uppercase">
                    Reducing inventory stock levels, generating your receipt invoice, and redirecting you to order tracking...
                  </p>
                </div>
              )}

              {paymentStatus === 'FAILED' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-800 font-bold text-lg">
                    X
                  </div>
                  <p className="text-xs text-red-800 tracking-widest uppercase font-semibold">
                    {paymentError || 'Payment transaction was declined.'}
                  </p>
                  
                  <div className="pt-2">
                    <button
                      onClick={() => setIsPaying(false)}
                      className="px-6 py-2.5 border border-luxury-chocolate text-xs tracking-widest uppercase font-semibold bg-luxury-chocolate text-luxury-cream hover:bg-transparent hover:text-luxury-chocolate transition-all rounded-sm"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {paymentStatus === 'PENDING' && (
                <div className="pt-4 border-t border-luxury-chocolate/10 flex justify-between items-center text-[10px] tracking-widest text-luxury-coffee/60 uppercase">
                  <span>Checkout Request ID:</span>
                  <span className="font-semibold text-luxury-chocolate">{checkoutRequestId || 'generating...'}</span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
