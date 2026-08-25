import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mockDb, MockOrder, MockPayment } from '@/lib/mockDb';
import { initiateStkPush } from '@/lib/mpesa';

// Detailed catalog prices for server-side verification in mock mode
const PRODUCT_CATALOG: Record<string, { price: number; sale_price: number | null }> = {
  'p1000000-0000-0000-0000-000000000001': { price: 28500, sale_price: null }, // Maya
  'p1000000-0000-0000-0000-000000000002': { price: 32000, sale_price: 29999 }, // Amara
  'p1000000-0000-0000-0000-000000000003': { price: 29000, sale_price: null }, // Naomi
  'p1000000-0000-0000-0000-000000000004': { price: 26500, sale_price: null }, // Zuri
  'p1000000-0000-0000-0000-000000000005': { price: 18500, sale_price: 15500 }, // Nia
  'p1000000-0000-0000-0000-000000000006': { price: 35000, sale_price: null }, // Ayana
  'p1000000-0000-0000-0000-000000000011': { price: 2400, sale_price: null }, // Shampoo
  'p1000000-0000-0000-0000-000000000012': { price: 2600, sale_price: 2200 }, // Conditioner
  'p1000000-0000-0000-0000-000000000013': { price: 3500, sale_price: null }, // Marula Oil
  'p1000000-0000-0000-0000-000000000014': { price: 1200, sale_price: null }  // Edge control
};

const VARIANT_ADJUSTMENTS: Record<string, number> = {
  'v1000000-0000-0000-0000-000000000001': 0, // Maya 18 150
  'v1000000-0000-0000-0000-000000000002': 3000, // Maya 18 180
  'v1000000-0000-0000-0000-000000000003': 5500, // Maya 20 180
  'v1000000-0000-0000-0000-000000000004': 9000, // Maya 22 200
  'v1000000-0000-0000-0000-000000000011': 0, // Amara 16 150
  'v1000000-0000-0000-0000-000000000012': 4000, // Amara 18 180
  'v1000000-0000-0000-0000-000000000013': 7000, // Amara 20 180
  'v1000000-0000-0000-0000-000000000101': 0, // Shampoo default
  'v1000000-0000-0000-0000-000000000102': 0, // Cond default
  'v1000000-0000-0000-0000-000000000103': 0, // Marula default
  'v1000000-0000-0000-0000-000000000104': 0  // Edge default
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerInfo, deliveryDetails, cartItems, userId } = body;

    if (!customerInfo || !deliveryDetails || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Missing required checkout information.' }, { status: 400 });
    }

    const hasRealKeys = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

    // 1. Recalculate and Verify Price and Inventory Server-Side
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of cartItems) {
      const { product, variant, quantity } = item;
      
      let dbProductPrice = 0;
      let dbVariantAdjustment = 0;
      let availableInventory = 0;

      if (hasRealKeys) {
        // Query live Supabase
        const { data: dbProd, error: pError } = await supabase
          .from('products')
          .select('price, sale_price')
          .eq('id', product.id)
          .single();
        if (pError || !dbProd) throw new Error(`Product ${product.name} not found in database.`);

        const { data: dbVar, error: vError } = await supabase
          .from('product_variants')
          .select('price_adjustment')
          .eq('id', variant.id)
          .single();
        if (vError || !dbVar) throw new Error(`Variant selection for ${product.name} is invalid.`);

        const { data: dbInv, error: iError } = await supabase
          .from('inventory')
          .select('quantity')
          .eq('variant_id', variant.id)
          .single();
        if (iError || !dbInv) throw new Error(`Inventory record for variant ${variant.sku} is missing.`);

        dbProductPrice = dbProd.sale_price !== null ? Number(dbProd.sale_price) : Number(dbProd.price);
        dbVariantAdjustment = Number(dbVar.price_adjustment);
        availableInventory = Number(dbInv.quantity);
      } else {
        // Fallback to local catalog
        const catalogItem = PRODUCT_CATALOG[product.id];
        if (!catalogItem) throw new Error(`Product ${product.name} is not in the system.`);
        
        dbProductPrice = catalogItem.sale_price !== null ? catalogItem.sale_price : catalogItem.price;
        dbVariantAdjustment = VARIANT_ADJUSTMENTS[variant.id] ?? 0;
        availableInventory = mockDb.inventory[variant.id] ?? 10;
      }

      // Check stock
      if (quantity > availableInventory) {
        return NextResponse.json({ 
          error: `Overselling protection: only ${availableInventory} of ${product.name} is available, you requested ${quantity}.` 
        }, { status: 409 });
      }

      const finalPrice = dbProductPrice + dbVariantAdjustment;
      subtotal += finalPrice * quantity;

      verifiedItems.push({
        variant_id: variant.id,
        product_name: product.name,
        sku: variant.sku,
        length: variant.length,
        density: variant.density,
        lace_type: variant.lace_type,
        color: variant.color,
        quantity,
        price: finalPrice
      });
    }

    const deliveryFee = deliveryDetails.delivery_method === 'pickup' ? 0 : 500;
    const total = subtotal + deliveryFee;

    // 2. Generate Unique Order ID
    const randomNum = Math.floor(1000000 + Math.random() * 9000000);
    const orderId = `ORD-${randomNum}`;

    // 3. Write Order to DB
    if (hasRealKeys) {
      // Supabase insertion
      const { error: oError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          user_id: userId || null,
          status: 'PENDING_PAYMENT',
          subtotal,
          delivery_fee: deliveryFee,
          total,
          customer_name: customerInfo.full_name,
          customer_phone: customerInfo.phone,
          customer_email: customerInfo.email,
          shipping_address: deliveryDetails
        });

      if (oError) throw oError;

      // Insert Order Items
      const orderItemsInsert = verifiedItems.map(item => ({
        order_id: orderId,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsInsert);
      
      if (itemsError) throw itemsError;

    } else {
      // Mock DB insertion
      const newOrder: MockOrder = {
        id: orderId,
        user_id: userId || null,
        status: 'PENDING_PAYMENT',
        subtotal,
        delivery_fee: deliveryFee,
        discount: 0,
        total,
        customer_name: customerInfo.full_name,
        customer_phone: customerInfo.phone,
        customer_email: customerInfo.email,
        shipping_address: deliveryDetails,
        items: verifiedItems,
        created_at: new Date().toISOString()
      };

      mockDb.orders.push(newOrder);
    }

    // 4. Trigger M-Pesa STK Push
    const stkResponse = await initiateStkPush(customerInfo.phone, total, orderId);

    // 5. Create Payment Record
    if (hasRealKeys) {
      const { error: payError } = await supabase
        .from('payments')
        .insert({
          order_id: orderId,
          amount: total,
          status: 'PENDING',
          payment_method: 'M-Pesa',
          mpesa_checkout_request_id: stkResponse.CheckoutRequestID,
          mpesa_merchant_request_id: stkResponse.MerchantRequestID
        });
      
      if (payError) throw payError;
    } else {
      const newPayment: MockPayment = {
        id: `mock-pay-id-${Math.floor(Math.random() * 1000000)}`,
        order_id: orderId,
        amount: total,
        status: 'PENDING',
        payment_method: 'M-Pesa',
        mpesa_checkout_request_id: stkResponse.CheckoutRequestID,
        mpesa_merchant_request_id: stkResponse.MerchantRequestID,
        created_at: new Date().toISOString()
      };

      mockDb.payments.push(newPayment);
    }

    return NextResponse.json({
      success: true,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      merchantRequestId: stkResponse.MerchantRequestID,
      orderId: orderId,
      message: stkResponse.CustomerMessage
    });

  } catch (err: any) {
    console.error('Error processing checkout:', err);
    return NextResponse.json({ error: err.message || 'Server error occurred during checkout.' }, { status: 500 });
  }
}
