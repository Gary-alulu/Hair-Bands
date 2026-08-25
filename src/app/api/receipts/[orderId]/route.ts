import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/mockDb';

// GET /api/receipts/[orderId]
// Returns order metadata as JSON for client-side PDF generation.
// Also supports ?format=html to return a printable HTML page.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const format = req.nextUrl.searchParams.get('format') || 'json';

  // Find order in mock DB (in production: query Supabase)
  const order = mockDb.orders.find((o: any) => o.id === orderId);
  const payment = mockDb.payments.find((p: any) => p.order_id === orderId);

  // If order not in mockDb, use sample data for demonstration
  const demoOrders: Record<string, any> = {
    'ORD-00001': {
      id: 'ORD-00001',
      customer_name: 'Zuri Wambui',
      customer_phone: '+254 712 345 678',
      customer_email: 'zuri.wambui@gmail.com',
      items: [{ product_name: "Maya Body Wave 22\"", sku: 'MW-22-NATURAL', length: '22"', density: '180%', color: 'Natural Black', quantity: 1, price: 18500 }],
      subtotal: 18500,
      delivery_fee: 0,
      discount: 0,
      total: 18500,
      status: 'DELIVERED',
      shipping_address: { county: 'Nairobi', town: 'Lavington', area: 'Lavington Close', building: 'No. 14', delivery_method: 'delivery' },
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      mpesa_receipt: 'QJK3H8ZXPL',
    },
    'ORD-00002': {
      id: 'ORD-00002',
      customer_name: 'Zuri Wambui',
      customer_phone: '+254 712 345 678',
      customer_email: 'zuri.wambui@gmail.com',
      items: [
        { product_name: "Naomi Deep Wave 18\"", sku: 'NDW-18-NATURAL', length: '18"', density: '150%', color: 'Natural Black', quantity: 1, price: 11200 },
        { product_name: 'Silk Press Serum 100ml', sku: 'SPS-100', length: null, density: null, color: null, quantity: 2, price: 800 },
      ],
      subtotal: 12800,
      delivery_fee: 0,
      discount: 0,
      total: 12800,
      status: 'OUT_FOR_DELIVERY',
      shipping_address: { county: 'Nairobi', town: 'Lavington', area: 'Lavington Close', building: 'No. 14', delivery_method: 'delivery' },
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      mpesa_receipt: 'RQP7Y2MMKF',
    },
  };

  const resolvedOrder = order || demoOrders[orderId];

  if (!resolvedOrder) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const receiptData = {
    orderId: resolvedOrder.id,
    receiptNumber: `RCP-${resolvedOrder.id.replace('ORD-', '')}`,
    date: resolvedOrder.created_at,
    customerName: resolvedOrder.customer_name,
    customerPhone: resolvedOrder.customer_phone,
    customerEmail: resolvedOrder.customer_email,
    items: resolvedOrder.items.map((item: any) => ({
      productName: item.product_name,
      sku: item.sku || 'N/A',
      length: item.length || null,
      density: item.density || null,
      color: item.color || null,
      quantity: item.quantity,
      price: item.price,
    })),
    subtotal: resolvedOrder.subtotal,
    deliveryFee: resolvedOrder.delivery_fee,
    discount: resolvedOrder.discount || 0,
    total: resolvedOrder.total,
    mpesaReceiptNumber: payment?.mpesa_receipt_number || resolvedOrder.mpesa_receipt || 'SIMULATED-DEMO',
    paymentStatus: resolvedOrder.status,
    shippingAddress: resolvedOrder.shipping_address || {
      county: 'Nairobi',
      town: 'CBD',
      area: 'Kimathi Street',
      delivery_method: 'delivery',
    },
  };

  if (format === 'html') {
    // Return a full printable HTML receipt page
    const html = buildHtmlReceipt(receiptData);
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  return NextResponse.json(receiptData);
}

function buildHtmlReceipt(data: any) {
  const itemRows = data.items
    .map(
      (item: any) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #E8D8C5;">
          <strong style="font-size:12px;color:#211510;">${item.productName}</strong>
          <div style="font-size:10px;color:#888;margin-top:2px;">${item.sku}${item.length ? ` · ${item.length}` : ''}${item.density ? ` · ${item.density}` : ''}</div>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #E8D8C5;text-align:center;font-size:12px;">${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #E8D8C5;text-align:right;font-size:12px;">KES ${item.price.toLocaleString()}</td>
        <td style="padding:10px 0;border-bottom:1px solid #E8D8C5;text-align:right;font-size:12px;font-weight:bold;">KES ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice Receipt – ${data.orderId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
    * { margin:0;padding:0;box-sizing:border-box; }
    body { font-family:'Inter',sans-serif;background:#F6EFE5;color:#211510;padding:40px 20px; }
    .receipt { max-width:720px;margin:0 auto;background:#fff;padding:48px;border-radius:2px;box-shadow:0 4px 24px rgba(58,33,24,0.06); }
    .brand-title { font-family:'Cormorant Garamond',serif;font-size:28px;text-align:center;letter-spacing:4px;color:#211510; }
    .brand-sub { font-size:10px;text-align:center;letter-spacing:4px;color:#D6B98C;margin-top:4px;text-transform:uppercase; }
    .brand-contact { font-size:9px;text-align:center;color:#888;margin-top:4px; }
    .divider { border:none;border-top:1px solid #3A2118;margin:24px 0; }
    .divider-light { border:none;border-top:1px solid #E8D8C5;margin:16px 0; }
    .section-label { font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:600;color:#5A3828;margin-bottom:12px; }
    .meta-grid { display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px; }
    .meta-item label { font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#999; }
    .meta-item div { font-size:12px;font-weight:600;color:#211510;margin-top:2px; }
    table { width:100%;border-collapse:collapse; }
    th { font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#888;padding:8px 0;border-bottom:1px solid #3A2118; }
    th:last-child,td:last-child { text-align:right; }
    th:nth-child(2),td:nth-child(2) { text-align:center; }
    .totals { margin-top:20px;text-align:right; }
    .totals-row { display:flex;justify-content:flex-end;gap:80px;font-size:12px;padding:4px 0; }
    .totals-row.grand { font-size:15px;font-weight:700;color:#211510;border-top:1px solid #3A2118;margin-top:8px;padding-top:12px; }
    .mpesa-box { background:#F6EFE5;border:1px solid #E8D8C5;border-radius:2px;padding:16px 20px;margin-top:24px; }
    .mpesa-box h4 { font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#5A3828;margin-bottom:8px; }
    .mpesa-ref { font-family:'Cormorant Garamond',serif;font-size:18px;color:#3A2118;font-weight:700; }
    .status-paid { display:inline-block;background:#dcfce7;color:#166534;font-size:9px;letter-spacing:2px;text-transform:uppercase;padding:4px 10px;border-radius:20px;font-weight:700; }
    .footer { text-align:center;font-size:9px;color:#bbb;margin-top:32px;letter-spacing:1px; }
    @media print { body{padding:0;background:white;} .receipt{box-shadow:none;} }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="brand-title">HAIR BANDS</div>
    <div class="brand-sub">Premium Hair & Beauty</div>
    <div class="brand-contact">Westlands Beauty Room, Nairobi, Kenya &nbsp;·&nbsp; contact@lafriquebeaute.co.ke</div>

    <hr class="divider" />

    <p class="section-label">Invoice Receipt</p>

    <div class="meta-grid">
      <div>
        <div class="meta-item"><label>Receipt No.</label><div>${data.receiptNumber}</div></div>
        <div class="meta-item" style="margin-top:10px"><label>Order ID</label><div>${data.orderId}</div></div>
        <div class="meta-item" style="margin-top:10px"><label>Date</label><div>${new Date(data.date).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
      </div>
      <div>
        <div class="meta-item"><label>Client Name</label><div>${data.customerName}</div></div>
        <div class="meta-item" style="margin-top:10px"><label>Phone</label><div>${data.customerPhone}</div></div>
        <div class="meta-item" style="margin-top:10px"><label>Email</label><div>${data.customerEmail}</div></div>
      </div>
    </div>

    <hr class="divider-light" />

    <p class="section-label" style="margin-top:16px">Items Purchased</p>
    <table>
      <thead>
        <tr>
          <th style="text-align:left">Product</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div class="totals">
      <div class="totals-row"><span>Subtotal</span><span>KES ${data.subtotal.toLocaleString()}</span></div>
      ${data.deliveryFee > 0 ? `<div class="totals-row"><span>Delivery</span><span>KES ${data.deliveryFee.toLocaleString()}</span></div>` : ''}
      ${data.discount > 0 ? `<div class="totals-row" style="color:green;"><span>Discount</span><span>−KES ${data.discount.toLocaleString()}</span></div>` : ''}
      <div class="totals-row grand"><span>GRAND TOTAL</span><span>KES ${data.total.toLocaleString()}</span></div>
    </div>

    <div class="mpesa-box">
      <h4>M-Pesa Payment Verification</h4>
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div>
          <div style="font-size:9px;color:#888;letter-spacing:1px;margin-bottom:4px;">TRANSACTION REFERENCE</div>
          <div class="mpesa-ref">${data.mpesaReceiptNumber}</div>
          <div style="font-size:9px;color:#888;margin-top:4px;">Safaricom Lipa Na M-Pesa STK Push</div>
        </div>
        <span class="status-paid">✓ PAID &amp; CONFIRMED</span>
      </div>
    </div>

    <div class="footer">
      Thank you for choosing Hair Bands. Wear your crown with elegance.
      <br />This is a computer-generated receipt. No signature required.
    </div>
  </div>

  <script>
    // Auto-trigger print dialog when opened as a receipt
    window.onload = function() {
      if (window.location.search.includes('print=1')) {
        window.print();
      }
    };
  </script>
</body>
</html>`;
}
