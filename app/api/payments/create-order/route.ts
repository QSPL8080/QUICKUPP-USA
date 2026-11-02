import { NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const {
      clientName,
      clientEmail,
      clientPhone,
      companyName,
      category,
      service,
      billingStartDate,
      billingEndDate,
      amount,
      notes,
    } = body;

    if (!clientName || !clientEmail || !clientPhone) {
      return NextResponse.json(
        { error: "Full Name, Email, and Phone number are required." },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "Please enter a valid payment amount." },
        { status: 400 }
      );
    }

    const desc = `${service || category || "Quickupp Softech"} - ${billingStartDate || ""} to ${billingEndDate || ""}`.trim();

    const order = await createPayPalOrder({
      amount: parsedAmount,
      currency: "USD",
      description: desc || "Quickupp Softech Service Payment",
      customId: JSON.stringify({
        n: clientName.slice(0, 40),
        e: clientEmail.slice(0, 50),
        p: clientPhone.slice(0, 20),
      }),
    });

    return NextResponse.json({
      orderID: order.id,
      status: order.status,
    });
  } catch (err: any) {
    console.error("[Create Order API Error]", err);
    return NextResponse.json(
      { error: err.message || "Unable to initiate payment with PayPal. Please try again." },
      { status: 500 }
    );
  }
}
