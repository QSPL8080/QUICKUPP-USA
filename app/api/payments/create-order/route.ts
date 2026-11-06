import { NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";
import { errMessage } from "@/lib/err";

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
      totalAmount,
      paymentType,
      remainingAmount,
      notes,
      token,
      invoiceNumber,
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

    const isPartial = paymentType === "partial";
    const parsedTotal = Number(totalAmount) || parsedAmount;
    const prefix = invoiceNumber
      ? `Order #${invoiceNumber} ${isPartial ? "Deposit" : "Balance/Full"}`
      : isPartial
      ? `Partial Payment ($${parsedAmount.toFixed(2)} of $${parsedTotal.toFixed(2)} USD)`
      : `Full Payment ($${parsedAmount.toFixed(2)} USD)`;

    const categoryStr = Array.isArray(category)
      ? category.filter(Boolean).join(", ")
      : (category || "");

    const desc = `${prefix} - ${service || categoryStr || "Quickupp Softech"} - ${billingStartDate || ""} to ${billingEndDate || ""}`.trim();

    const order = await createPayPalOrder({
      amount: parsedAmount,
      currency: "USD",
      description: desc.slice(0, 127) || "Quickupp Softech Service Payment",
      customId: JSON.stringify({
        n: clientName.slice(0, 25),
        e: clientEmail.slice(0, 35),
        p: clientPhone.slice(0, 18),
        t: isPartial ? "partial" : "full",
        inv: invoiceNumber || undefined,
        tok: token || undefined,
      }),
    });

    return NextResponse.json({
      orderID: order.id,
      status: order.status,
    });
  } catch (err) {
    console.error("[Create Order API Error]", err);
    return NextResponse.json(
      { error: errMessage(err) || "Unable to initiate payment with PayPal. Please try again." },
      { status: 500 }
    );
  }
}
