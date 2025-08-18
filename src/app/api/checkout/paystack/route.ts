
// /src/app/api/checkout/paystack/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Retrieve the secret key from environment variables
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

  // Check if the Paystack secret key is configured
  if (!paystackSecretKey || paystackSecretKey === "YOUR_PAYSTACK_SECRET_KEY") {
    console.error("Paystack secret key is not configured in .env file.");
    // Return a specific error for misconfiguration, so the front end knows the issue is on the server.
    return NextResponse.json(
      { message: 'Payment gateway is not configured correctly. Please contact support.' },
      { status: 503 } // Service Unavailable
    );
  }
  
  try {
    const { email, amount, planId } = await request.json();

    // --- Basic Server-Side Validation ---
    if (!email || !amount || !planId) {
      return NextResponse.json({ message: 'Missing required fields: email, amount, and planId' }, { status: 400 });
    }
    if (typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json({ message: 'Invalid amount provided.' }, { status: 400 });
    }

    // --- REAL PAYSTACK API CALL ---
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount, // This amount should be in the lowest currency unit (e.g., kobo for NGN)
        metadata: {
            planId,
            // You can add other relevant data here, like a userId if the user is logged in
        },
      }),
    });

    const responseData = await paystackResponse.json();

    // Check if the request was successful and if Paystack returned a success status
    if (!paystackResponse.ok || !responseData.status) {
      console.error("Paystack API Error:", responseData);
      throw new Error(responseData.message || 'Paystack API request failed. Please check the server logs.');
    }
    
    // Return the authorization data from Paystack to the client, which includes the authorization_url
    return NextResponse.json(responseData.data, { status: 200 });

  } catch (error) {
    console.error("Paystack API route error:", error);
    return NextResponse.json({ message: (error as Error).message || 'An internal server error occurred.' }, { status: 500 });
  }
}
