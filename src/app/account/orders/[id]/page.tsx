'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Download, CheckCircle, Circle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

// Expanded mock order data keyed by ID
const MOCK_ORDERS: Record<string, any> = {
  'ORD-00001': {
    id: 'ORD-00001',
    customer_name: 'Zuri Wambui',
    customer_phone: '+254 712 345 678',
    customer_email: 'zuri.wambui@gmail.com',
    shipping_address: { street: '14 Lavington Close', city: 'Nairobi', county: 'Nairobi' },
    items: [{ product_name: 'Maya Body Wave 22"', sku: 'MW-22-NATURAL', quantity: 1, price: 18500 }],
    subtotal: 18500,
    delivery_fee: 0,
    discount: 0,
    total: 18500,
    status: 'DELIVERED',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    tracking_history: [
      { status: 'PENDING_PAYMENT', label: 'Order Placed', ts: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'PAID', label: 'Payment Confirmed', ts: new Date(Date.now() - 2.9 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'PROCESSING', label: 'Being Prepared', ts: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'PACKED', label: 'Packed & Sealed', ts: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'DISPATCHED', label: 'Dispatched', ts: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', ts: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'DELIVERED', label: 'Delivered', ts: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString() },
    ],
  },
  'ORD-00002': {
    id: 'ORD-00002',
    customer_name: 'Zuri Wambui',
    customer_phone: '+254 712 345 678',
    customer_email: 'zuri.wambui@gmail.com',
    shipping_address: { street: '14 Lavington Close', city: 'Nairobi', county: 'Nairobi' },
    items: [
      { product_name: 'Naomi Deep Wave 18"', sku: 'NDW-18-NATURAL', quantity: 1, price: 11200 },
      { product_name: 'Silk Press Serum 100ml', sku: 'SPS-100', quantity: 2, price: 800 },
    ],
    subtotal: 12800,
    delivery_fee: 0,
    discount: 0,
    total: 12800,
    status: 'OUT_FOR_DELIVERY',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    tracking_history: [
      { status: 'PENDING_PAYMENT', label: 'Order Placed', ts: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'PAID', label: 'Payment Confirmed', ts: new Date(Date.now() - 0.95 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'PROCESSING', label: 'Being Prepared', ts: new Date(Date.now() - 0.8 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'PACKED', label: 'Packed & Sealed', ts: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'DISPATCHED', label: 'Dispatched', ts: new Date(Date.now() - 0.3 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', ts: new Date(Date.now() - 0.1 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'DELIVERED', label: 'Delivered', ts: null },
    ],
  },
  'ORD-00003': {
    id: 'ORD-00003',
    customer_name: 'Zuri Wambui',
    customer_phone: '+254 712 345 678',
    customer_email: 'zuri.wambui@gmail.com',
    shipping_address: { street: '14 Lavington Close', city: 'Nairobi', county: 'Nairobi' },
    items: [{ product_name: 'Amara Straight 20"', sku: 'AS-20-NATURAL', quantity: 1, price: 15600 }],
    subtotal: 15600,
    delivery_fee: 600,
    discount: 0,
    total: 16200,
    status: 'PROCESSING',
    created_at: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
    tracking_history: [
      { status: 'PENDING_PAYMENT', label: 'Order Placed', ts: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'PAID', label: 'Payment Confirmed', ts: new Date(Date.now() - 0.45 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'PROCESSING', label: 'Being Prepared', ts: new Date(Date.now() - 0.2 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'PACKED', label: 'Packed & Sealed', ts: null },
      { status: 'DISPATCHED', label: 'Dispatched', ts: null },
      { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', ts: null },
      { status: 'DELIVERED', label: 'Delivered', ts: null },
    ],
  },
};

const TIMELINE_STEPS = [
  'PENDING_PAYMENT',
  'PAID',
  'PROCESSING',
  'PACKED',
  'DISPATCHED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const order = MOCK_ORDERS[orderId];

  if (!order) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="font-serif text-2xl text-luxury-chocolate">Order Not Found</p>
        <Link href="/account/orders" className="text-xs uppercase tracking-widest text-luxury-champagne hover:text-luxury-chocolate font-bold flex items-center justify-center">
          <ArrowLeft size={12} className="mr-1.5" /> Back to Orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = TIMELINE_STEPS.indexOf(order.status);

  const handleDownloadReceipt = () => {
    window.open(`/api/receipts/${order.id}`, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/account/orders" className="text-[10px] tracking-widest uppercase text-luxury-coffee hover:text-luxury-chocolate font-semibold flex items-center mb-2">
            <ArrowLeft size={12} className="mr-1.5" /> All Orders
          </Link>
          <h1 className="font-serif text-xl tracking-widest uppercase text-luxury-chocolate font-semibold">{order.id}</h1>
          <p className="text-[10px] tracking-widest text-luxury-coffee uppercase mt-1">
            {new Date(order.created_at).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {order.status === 'DELIVERED' && (
          <button
            onClick={handleDownloadReceipt}
            className="flex items-center px-4 py-3 border border-luxury-chocolate text-luxury-chocolate hover:bg-luxury-chocolate hover:text-luxury-cream text-[10px] tracking-widest uppercase font-bold rounded-sm transition-all"
          >
            <Download size={12} className="mr-2" /> Receipt
          </button>
        )}
      </div>

      {/* Tracking Timeline */}
      <div className="bg-luxury-cream border border-luxury-chocolate/10 rounded-sm p-6 luxury-shadow">
        <h2 className="font-serif text-sm tracking-widest uppercase text-luxury-chocolate font-semibold mb-6">Order Tracking</h2>
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-4 top-4 bottom-4 w-px bg-luxury-chocolate/10" />

          <div className="space-y-0">
            {order.tracking_history.map((step: any, i: number) => {
              const isDone = step.ts !== null;
              const isCurrent = i === currentStepIndex;
              const isFuture = !isDone;

              return (
                <motion.div
                  key={step.status}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start pl-0 relative pb-6 last:pb-0"
                >
                  {/* Icon */}
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                    isDone
                      ? isCurrent
                        ? 'bg-luxury-chocolate border-luxury-chocolate'
                        : 'bg-luxury-champagne border-luxury-champagne'
                      : 'bg-luxury-cream border-luxury-chocolate/20'
                  }`}>
                    {isDone
                      ? isCurrent
                        ? <Loader size={12} className="text-luxury-cream animate-spin" />
                        : <CheckCircle size={12} className="text-luxury-cream" />
                      : <Circle size={12} className="text-luxury-chocolate/20" />
                    }
                  </div>

                  {/* Content */}
                  <div className="ml-4">
                    <div className={`text-xs font-bold tracking-wider uppercase ${
                      isDone ? 'text-luxury-chocolate' : 'text-luxury-chocolate/30'
                    }`}>
                      {step.label}
                    </div>
                    {step.ts && (
                      <div className="text-[10px] text-luxury-coffee/60 mt-0.5">
                        {new Date(step.ts).toLocaleString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-luxury-cream border border-luxury-chocolate/10 rounded-sm p-6 luxury-shadow">
        <h2 className="font-serif text-sm tracking-widest uppercase text-luxury-chocolate font-semibold mb-4">Items Ordered</h2>
        <div className="space-y-3">
          {order.items.map((item: any, i: number) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-luxury-chocolate/5 last:border-0">
              <div>
                <div className="text-xs font-semibold text-luxury-chocolate">{item.product_name}</div>
                <div className="text-[10px] text-luxury-coffee/70 mt-0.5">SKU: {item.sku} · Qty: {item.quantity}</div>
              </div>
              <div className="text-xs font-serif font-bold text-luxury-chocolate">
                KES {(item.price * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t border-luxury-chocolate/10 space-y-2">
          <div className="flex justify-between text-xs text-luxury-coffee">
            <span>Subtotal</span>
            <span>KES {order.subtotal.toLocaleString()}</span>
          </div>
          {order.delivery_fee > 0 && (
            <div className="flex justify-between text-xs text-luxury-coffee">
              <span>Delivery</span>
              <span>KES {order.delivery_fee.toLocaleString()}</span>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between text-xs text-green-700">
              <span>Discount</span>
              <span>−KES {order.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-luxury-chocolate border-t border-luxury-chocolate/10 pt-2">
            <span>Total Paid</span>
            <span className="font-serif">KES {order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="bg-luxury-cream border border-luxury-chocolate/10 rounded-sm p-6 luxury-shadow">
        <h2 className="font-serif text-sm tracking-widest uppercase text-luxury-chocolate font-semibold mb-3">Delivery Address</h2>
        <div className="text-xs text-luxury-coffee space-y-1">
          <div className="font-semibold text-luxury-chocolate">{order.customer_name}</div>
          <div>{order.shipping_address.street}</div>
          <div>{order.shipping_address.city}, {order.shipping_address.county}</div>
          <div>{order.customer_phone}</div>
        </div>
      </div>
    </div>
  );
}
