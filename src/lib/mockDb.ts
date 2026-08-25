/**
 * In-Memory Mock Database for Local Development & Demo Mode.
 * This ensures checkout, orders, payments, callbacks, inventory checks,
 * and reservation booking work dynamically out-of-the-box.
 */

export interface MockOrder {
  id: string;
  user_id: string | null;
  status: 'PENDING_PAYMENT' | 'PAID' | 'PROCESSING' | 'PACKED' | 'DISPATCHED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address: any;
  items: Array<{
    variant_id: string;
    product_name: string;
    sku: string;
    length: string | null;
    density: string | null;
    lace_type: string | null;
    color: string | null;
    quantity: number;
    price: number;
  }>;
  created_at: string;
}

export interface MockPayment {
  id: string;
  order_id: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'TIMEOUT' | 'REFUNDED';
  payment_method: string;
  mpesa_checkout_request_id: string;
  mpesa_merchant_request_id: string;
  mpesa_receipt_number?: string;
  created_at: string;
}

export interface MockReservation {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_type: string;
  product_id: string | null;
  product_name?: string;
  date: string;
  time_slot: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  created_at: string;
}

// Global variables act as our in-memory database.
// In Next.js dev server, these persist across hot-reloads of individual files
// as long as the server is running.
if (!(global as any).mockDb) {
  (global as any).mockDb = {
    orders: [] as MockOrder[],
    payments: [] as MockPayment[],
    reservations: [
      {
        id: 'RSV-84192',
        user_id: 'mock-customer-uuid',
        customer_name: 'Zuri Wambui',
        customer_email: 'zuri.wambui@gmail.com',
        customer_phone: '+254712345678',
        service_type: 'wig_fitting',
        product_id: 'p1000000-0000-0000-0000-000000000001',
        product_name: 'Maya Body Wave',
        date: '2026-08-26',
        time_slot: '10:30 - 11:30',
        status: 'APPROVED',
        created_at: new Date().toISOString()
      },
      {
        id: 'RSV-20481',
        user_id: 'mock-customer-uuid',
        customer_name: 'Zuri Wambui',
        customer_email: 'zuri.wambui@gmail.com',
        customer_phone: '+254712345678',
        service_type: 'custom_wig_consultation',
        product_id: null,
        date: '2026-08-27',
        time_slot: '13:00 - 14:00',
        status: 'PENDING',
        created_at: new Date().toISOString()
      }
    ] as MockReservation[],
    inventory: {
      'v1000000-0000-0000-0000-000000000001': 5,
      'v1000000-0000-0000-0000-000000000002': 4,
      'v1000000-0000-0000-0000-000000000003': 2,
      'v1000000-0000-0000-0000-000000000004': 0,
      'v1000000-0000-0000-0000-000000000011': 8,
      'v1000000-0000-0000-0000-000000000012': 3,
      'v1000000-0000-0000-0000-000000000013': 0,
      'v1000000-0000-0000-0000-000000000101': 25,
      'v1000000-0000-0000-0000-000000000102': 15,
      'v1000000-0000-0000-0000-000000000103': 45,
      'v1000000-0000-0000-0000-000000000104': 30,
    } as Record<string, number>
  };
}

export const mockDb = (global as any).mockDb;
