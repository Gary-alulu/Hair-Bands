/**
 * Safaricom Daraja API Integration Helper
 * Supports OAuth Token retrieval and Lipa Na M-Pesa Online (STK Push) Process Request.
 */

interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export const getMpesaAccessToken = async (): Promise<string> => {
  const environment = process.env.MPESA_ENVIRONMENT || 'sandbox';
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error('M-Pesa Consumer Key or Secret environment variables are missing.');
  }

  const url = environment === 'production'
    ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to generate M-Pesa access token: ${errText}`);
  }

  const data = await response.json();
  return data.access_token;
};

export const initiateStkPush = async (
  phoneNumber: string,
  amount: number,
  orderId: string
): Promise<StkPushResponse> => {
  // If payment mode is mock, return a simulated STK push success
  if (process.env.NEXT_PUBLIC_PAYMENT_MODE === 'mock' || process.env.NEXT_PUBLIC_PAYMENT_MODE === undefined) {
    const mockCheckoutId = `ws_CO_${Date.now()}_mock`;
    return {
      MerchantRequestID: `mock_merchant_id_${Math.floor(Math.random() * 1000000)}`,
      CheckoutRequestID: mockCheckoutId,
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
      CustomerMessage: 'Simulated STK Push successful. Enter your M-Pesa PIN inside the simulation modal.'
    };
  }

  const environment = process.env.MPESA_ENVIRONMENT || 'sandbox';
  const shortcode = process.env.MPESA_SHORTCODE || '174379';
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;

  if (!passkey || !callbackUrl) {
    throw new Error('M-Pesa Passkey or Callback URL environment variables are missing.');
  }

  // Format phone number to standard 2547XXXXXXXX or 2541XXXXXXXX
  let formattedPhone = phoneNumber.replace(/\D/g, ''); // strip non-digits
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.substring(1);
  } else if (formattedPhone.startsWith('+')) {
    formattedPhone = formattedPhone.substring(1);
  }
  
  if (!formattedPhone.startsWith('254') || formattedPhone.length !== 12) {
    throw new Error(`Invalid Kenyan phone number format: ${phoneNumber}. Must be 2547XXXXXXXX or 2541XXXXXXXX.`);
  }

  const accessToken = await getMpesaAccessToken();

  const url = environment === 'production'
    ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
    : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

  // Get timestamp in YYYYMMDDHHmmss format (Kenyan Timezone EAT is UTC+3)
  // To keep it simple and clean, generate UTC+3 formatted time
  const now = new Date();
  const eatOffset = 3 * 60 * 60 * 1000;
  const eatTime = new Date(now.getTime() + eatOffset);
  const timestamp = eatTime.toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14);

  // Generate password: Base64 of Shortcode + Passkey + Timestamp
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline', // For sandbox, keep default CustomerPayBillOnline
    Amount: Math.round(amount),
    PartyA: formattedPhone,
    PartyB: shortcode,
    PhoneNumber: formattedPhone,
    CallBackURL: callbackUrl,
    AccountReference: orderId,
    TransactionDesc: `Luxury Hair order ${orderId}`
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    cache: 'no-store'
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to initiate M-Pesa STK Push: ${errText}`);
  }

  return response.json();
};
