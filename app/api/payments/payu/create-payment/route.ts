import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { isPayUConfigured, generatePayUHash } from "@/lib/payu";
import { findByToken, linkState, chargeFor, LINK_MESSAGES } from "@/lib/paymentLink";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false, error: "Invalid request payload" }, { status: 400 });

    if (!isPayUConfigured()) {
      return NextResponse.json(
        { ok: false, error: "PayU gateway is currently being configured. Please use PayPal or contact support." },
        { status: 503 }
      );
    }

    const token = body.token ? String(body.token).trim() : "";
    let amount = Number(body.amount || 0);
    let totalAmount = Number(body.totalAmount || amount);
    let clientName = String(body.clientName || "Valued Client").trim();
    let clientEmail = String(body.clientEmail || "").trim();
    let clientPhone = String(body.clientPhone || "").trim();
    let service = String(body.service || "Quickupp Softech Services").trim();
    let paymentType = body.paymentType === "partial" ? "partial" : "full";

    // If paying via CRM Payment Link (/pay/[token])
    if (token) {
      const linked = await findByToken(token);
      if (!linked) {
        return NextResponse.json({ ok: false, error: "Payment link not found." }, { status: 404 });
      }

      const state = linkState(linked.row);
      if (state === "paid" || state === "expired" || state === "cancelled") {
        return NextResponse.json({ ok: false, error: LINK_MESSAGES[state] }, { status: 409 });
      }

      const charge = chargeFor(linked.row, body.paymentType);
      if (!charge) {
        return NextResponse.json({ ok: false, error: "Nothing is due on this payment link." }, { status: 409 });
      }

      amount = charge.amount;
      totalAmount = charge.total;
      paymentType = charge.type === "balance" ? "full" : charge.type === "partial" ? "partial" : "full";
      clientName = String(linked.row.client_name || clientName);
      clientEmail = String(linked.row.client_email || clientEmail);
      clientPhone = String(linked.row.client_phone || clientPhone);
      service = String(linked.row.service || service);
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid payment amount." }, { status: 400 });
    }

    const txnid = `payu_${Date.now()}_${randomBytes(4).toString("hex")}`;
    const productinfo = service.slice(0, 100);

    const hashData = generatePayUHash({
      txnid,
      amount,
      productinfo,
      firstname: clientName,
      email: clientEmail || "client@quickupp.com",
      phone: clientPhone,
      udf1: token || "website",
      udf2: paymentType,
      udf3: String(totalAmount),
      udf4: service.slice(0, 50),
      udf5: body.leadId ? String(body.leadId) : "",
    });

    return NextResponse.json({
      ok: true,
      actionUrl: hashData.actionUrl,
      params: {
        key: hashData.key,
        txnid,
        amount: Number(amount).toFixed(2),
        productinfo,
        firstname: clientName,
        email: clientEmail || "client@quickupp.com",
        phone: clientPhone,
        surl: hashData.surl,
        furl: hashData.furl,
        hash: hashData.hash,
        udf1: token || "website",
        udf2: paymentType,
        udf3: String(totalAmount),
        udf4: service.slice(0, 50),
        udf5: body.leadId ? String(body.leadId) : "",
      },
    });
  } catch (err: unknown) {
    console.error("[PayU Create Payment Error]", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to initiate PayU payment." },
      { status: 500 }
    );
  }
}
