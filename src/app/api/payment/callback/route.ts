import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mockDb, MockPayment, MockOrder } from '@/lib/mockDb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received M-Pesa Payment Callback payload:', JSON.stringify(body));

    const callbackData = body.Body?.stkCallback;
    if (!callbackData) {
      return NextResponse.json({ error: 'Invalid callback payload structure.' }, { status: 400 });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callbackData;

    // Check if we are running in real Supabase mode or Mock mode
    const hasRealKeys = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

    // 1. Audit log transaction callback raw payload
    if (hasRealKeys) {
      // Find payment first to get payment ID
      const { data: dbPay } = await supabase
        .from('payments')
        .select('id, order_id, status')
        .eq('mpesa_checkout_request_id', CheckoutRequestID)
        .single();

      if (dbPay) {
        // Log transaction details
        await supabase
          .from('payment_transactions')
          .insert({
            payment_id: dbPay.id,
            checkout_request_id: CheckoutRequestID,
            result_code: ResultCode,
            result_desc: ResultDesc,
            raw_callback_data: body
          });
      }
    }

    // 2. Process Successful Payment Callback
    if (ResultCode === 0) {
      let orderId = '';
      let mpesaReceipt = '';
      let paymentId = '';
      let paymentAmount = 0;

      // Extract metadata values
      if (CallbackMetadata?.Item) {
        const receiptItem = CallbackMetadata.Item.find((item: any) => item.Name === 'MpesaReceiptNumber');
        mpesaReceipt = receiptItem?.Value || `MOCK-${Date.now()}`;
      }

      if (hasRealKeys) {
        // Query payment
        const { data: dbPay, error: payFetchError } = await supabase
          .from('payments')
          .select('id, order_id, amount, status')
          .eq('mpesa_checkout_request_id', CheckoutRequestID)
          .single();

        if (payFetchError || !dbPay) {
          console.error(`M-Pesa Callback Match Failed: No payment with checkout ID ${CheckoutRequestID}`);
          return NextResponse.json({ error: 'Matching payment not found.' }, { status: 404 });
        }

        paymentId = dbPay.id;
        orderId = dbPay.order_id;
        paymentAmount = Number(dbPay.amount);

        // IDEMPOTENCY CHECK: If already marked SUCCESS, terminate early to avoid duplicate inventory reductions
        if (dbPay.status === 'SUCCESS') {
          console.log(`Callback ID ${CheckoutRequestID} already processed successfully. Skipping.`);
          return NextResponse.json({ message: 'Callback already processed' });
        }

        // Transaction updates: Update payment and order state
        const { error: payUpdateError } = await supabase
          .from('payments')
          .update({
            status: 'SUCCESS',
            mpesa_receipt_number: mpesaReceipt,
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentId);
        
        if (payUpdateError) throw payUpdateError;

        const { error: orderUpdateError } = await supabase
          .from('orders')
          .update({
            status: 'PAID',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (orderUpdateError) throw orderUpdateError;

        // Fetch order items to decrement inventory
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('variant_id, quantity')
          .eq('order_id', orderId);

        if (itemsError) throw itemsError;

        // Decrement stock levels for each item
        if (items) {
          for (const item of items) {
            if (item.variant_id) {
              // Decrement using SQL directly: update inventory set quantity = quantity - X where variant_id = Y
              const { error: invErr } = await supabase.rpc('decrement_inventory', {
                var_id: item.variant_id,
                qty: item.quantity
              });
              if (invErr) {
                // If RPC not registered, fall back to select and update
                const { data: inv } = await supabase
                  .from('inventory')
                  .select('quantity')
                  .eq('variant_id', item.variant_id)
                  .single();
                if (inv) {
                  const newQty = Math.max(0, inv.quantity - item.quantity);
                  await supabase
                    .from('inventory')
                    .update({ quantity: newQty, updated_at: new Date().toISOString() })
                    .eq('variant_id', item.variant_id);
                }
              }
            }
          }
        }

        // Generate PDF receipt record
        const recNum = `REC-${Math.floor(100000 + Math.random() * 900000)}`;
        await supabase
          .from('receipts')
          .insert({
            order_id: orderId,
            payment_id: paymentId,
            receipt_number: recNum,
            created_at: new Date().toISOString()
          });

      } else {
        // ------------------ MOCK MODE UPDATES ------------------
        const mockPay = mockDb.payments.find((p: MockPayment) => p.mpesa_checkout_request_id === CheckoutRequestID);
        if (!mockPay) {
          console.error(`Mock Callback Match Failed: No payment with checkout ID ${CheckoutRequestID}`);
          return NextResponse.json({ error: 'Matching mock payment not found.' }, { status: 404 });
        }

        orderId = mockPay.order_id;
        paymentAmount = mockPay.amount;

        // IDEMPOTENCY CHECK
        if (mockPay.status === 'SUCCESS') {
          return NextResponse.json({ message: 'Mock Callback already processed' });
        }

        mockPay.status = 'SUCCESS';
        mockPay.mpesa_receipt_number = mpesaReceipt;

        const mockOrder = mockDb.orders.find((o: MockOrder) => o.id === orderId);
        if (mockOrder) {
          mockOrder.status = 'PAID';

          // Decrement mock inventory
          for (const item of mockOrder.items) {
            const currentQty = mockDb.inventory[item.variant_id] || 0;
            mockDb.inventory[item.variant_id] = Math.max(0, currentQty - item.quantity);
          }
        }
      }

      console.log(`Order ${orderId} successfully completed and updated via M-Pesa. Receipt: ${mpesaReceipt}`);
      return NextResponse.json({ message: 'Callback processed successfully.' });

    } else {
      // 3. Process Failed Payment Callback
      console.warn(`Payment failed callback received. Code: ${ResultCode}, Desc: ${ResultDesc}`);
      
      if (hasRealKeys) {
        // Update payment status
        await supabase
          .from('payments')
          .update({
            status: 'FAILED',
            updated_at: new Date().toISOString()
          })
          .eq('mpesa_checkout_request_id', CheckoutRequestID);
      } else {
        const mockPay = mockDb.payments.find((p: MockPayment) => p.mpesa_checkout_request_id === CheckoutRequestID);
        if (mockPay) {
          mockPay.status = 'FAILED';
        }
      }

      return NextResponse.json({ message: 'Callback failure logged.' });
    }

  } catch (err: any) {
    console.error('Callback parsing error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error processing callback.' }, { status: 500 });
  }
}
