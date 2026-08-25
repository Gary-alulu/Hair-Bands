import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mockDb, MockPayment } from '@/lib/mockDb';

interface ParamsProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: ParamsProps) {
  try {
    const { id: checkoutRequestId } = await params;

    const hasRealKeys = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

    let paymentStatus = 'PENDING';
    let orderId = '';
    let mpesaReceipt = '';

    if (hasRealKeys) {
      const { data, error } = await supabase
        .from('payments')
        .select('status, order_id, mpesa_receipt_number')
        .eq('mpesa_checkout_request_id', checkoutRequestId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        paymentStatus = data.status;
        orderId = data.order_id;
        mpesaReceipt = data.mpesa_receipt_number || '';
      }
    } else {
      // Mock db lookup
      const mockPay = mockDb.payments.find((p: MockPayment) => p.mpesa_checkout_request_id === checkoutRequestId);
      if (mockPay) {
        paymentStatus = mockPay.status;
        orderId = mockPay.order_id;
        mpesaReceipt = mockPay.mpesa_receipt_number || '';
      }
    }

    return NextResponse.json({
      checkoutRequestId,
      status: paymentStatus,
      orderId,
      mpesaReceipt
    });

  } catch (err: any) {
    console.error('Error polling payment status:', err);
    return NextResponse.json({ error: 'Failed to poll payment status.' }, { status: 500 });
  }
}
