'use client';

import React from 'react';
import Link from 'next/link';
import { Download, FileText, ExternalLink } from 'lucide-react';

// Mock receipts — in production linked to real orders
const MOCK_RECEIPTS = [
  {
    orderId: 'ORD-00001',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    total: 18500,
    items: ['Maya Body Wave 22" × 1'],
    mpesa_receipt: 'QJK3H8ZXPL',
  },
  {
    orderId: 'ORD-00002',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    total: 12800,
    items: ['Naomi Deep Wave 18" × 1', 'Silk Press Serum × 2'],
    mpesa_receipt: 'RQP7Y2MMKF',
  },
];

export default function ReceiptsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-xl tracking-widest uppercase text-luxury-chocolate font-semibold">Receipts & Invoices</h1>
        <p className="text-[10px] tracking-widest text-luxury-coffee uppercase mt-1">Download PDF copies of your order invoices</p>
      </div>

      {MOCK_RECEIPTS.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 border border-dashed border-luxury-chocolate/20 rounded-sm">
          <FileText size={36} className="text-luxury-chocolate/20" />
          <p className="text-xs tracking-widest uppercase text-luxury-coffee font-semibold">No receipts yet</p>
          <Link href="/shop" className="text-[10px] tracking-widest uppercase text-luxury-champagne hover:text-luxury-chocolate font-bold">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {MOCK_RECEIPTS.map((receipt) => (
            <div
              key={receipt.orderId}
              className="p-5 bg-luxury-cream border border-luxury-chocolate/10 rounded-sm luxury-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FileText size={14} className="text-luxury-champagne" />
                    <span className="text-xs font-bold tracking-wider text-luxury-chocolate">{receipt.orderId}</span>
                  </div>
                  <div className="text-[10px] text-luxury-coffee/70">
                    {new Date(receipt.date).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="text-[11px] text-luxury-coffee space-y-0.5">
                    {receipt.items.map((item, i) => (
                      <div key={i}>{item}</div>
                    ))}
                  </div>
                  <div className="text-[10px] text-luxury-coffee/60">
                    M-Pesa Receipt: <span className="font-semibold text-luxury-chocolate">{receipt.mpesa_receipt}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-3">
                  <span className="font-serif text-sm font-bold text-luxury-chocolate">KES {receipt.total.toLocaleString()}</span>
                  <div className="flex space-x-2">
                    <Link
                      href={`/account/orders/${receipt.orderId}`}
                      className="flex items-center px-3 py-2 border border-luxury-chocolate/20 text-luxury-chocolate hover:border-luxury-chocolate text-[9px] tracking-widest uppercase font-bold rounded-sm transition-all"
                    >
                      <ExternalLink size={10} className="mr-1.5" /> View Order
                    </Link>
                    <a
                      href={`/api/receipts/${receipt.orderId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center px-3 py-2 bg-luxury-chocolate text-luxury-cream hover:bg-luxury-coffee text-[9px] tracking-widest uppercase font-bold rounded-sm transition-all"
                    >
                      <Download size={10} className="mr-1.5" /> PDF
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 bg-luxury-beige/30 border border-luxury-chocolate/10 rounded-sm">
        <p className="text-[10px] tracking-wider text-luxury-coffee leading-relaxed">
          <strong className="text-luxury-chocolate">Need a receipt?</strong> Receipts are automatically generated for all completed orders. 
          If you are missing a receipt, please contact us at <span className="text-luxury-chocolate font-semibold">support@luxuryhair.co.ke</span>.
        </p>
      </div>
    </div>
  );
}
