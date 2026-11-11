import { NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";
import { errMessage } from "@/lib/err";
import { LINK_MESSAGES, chargeFor, findByToken, linkState, markExpired } from "@/lib/paymentLink";

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

    // a pay link: the link must still be payable, and the amount comes from the record, not the browser
    if (token) {
      const found = await findByToken(String(token));
      if (!found) return NextResponse.json({ error: "This payment link was not found." }, { status: 404 });
      const state = linkState(found.row);
      if (state === "paid" || state === "expired" || state === "cancelled") {
        if (state === "expired") await markExpired(found.table, Number(found.row.id));
        return NextResponse.json({ error: LINK_MESSAGES[state], state }, { status: 409 });
      }
      const charge = chargeFor(found.row, paymentType);
      if (!charge) return NextResponse.json({ error: "Nothing is due on this payment link." }, { status: 409 });
      const r = found.row;
      const inv = r.invoice_number || invoiceNumber || "";
      const label = charge.type === "balance" ? "Balance" : charge.type === "partial" ? "Deposit" : "Payment";
      const order = await createPayPalOrder({
        amount: charge.amount,
        currency: "USD",
        description: `Order #${inv} ${label} - ${r.service || "Quickupp Softech"}`.slice(0, 127),
        customId: JSON.stringify({
          n: String(r.client_name || "").slice(0, 25),
          e: String(r.client_email || "").slice(0, 35),
          t: charge.type,
          inv: inv || undefined,
          tok: String(token).slice(0, 40),
        }).slice(0, 127),
      });
      return NextResponse.json({ orderID: order.id, status: order.status, amount: charge.amount });
    }

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
