import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token")?.trim();
    const orderNumber = searchParams.get("order")?.trim();

    if (!token && !orderNumber) {
      return NextResponse.json({ ok: false, error: "Missing token or order parameter." }, { status: 400 });
    }

    const pool = getPool();
    let rows: any[] = [];

    if (token) {
      const [res] = await pool.query("SELECT * FROM payments WHERE token = ? LIMIT 1", [token]);
      rows = res as any[];
    } else if (orderNumber) {
      const [res] = await pool.query("SELECT * FROM payments WHERE invoice_number = ? OR id = ? LIMIT 1", [
        orderNumber,
        Number(orderNumber) || 0,
      ]);
      rows = res as any[];
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({ ok: false, error: "Payment record or link not found." }, { status: 404 });
    }

    const p = rows[0];

    // Check if link was cancelled
    if (p.link_status === "cancelled") {
      return NextResponse.json({
        ok: false,
        error: "This payment link has been cancelled. Please contact Quickupp support.",
        cancelled: true,
        orderNumber: p.invoice_number,
      }, { status: 410 });
    }

    // Check 24-hour expiration ONLY for unpaid initial payment links (amount = 0 and pending).
    // Balance payment links (partially_paid) DO NOT expire in 24 hours.
    if (p.expires_at && p.status === "pending" && Number(p.amount || 0) === 0) {
      const expDate = new Date(p.expires_at);
      if (!isNaN(expDate.getTime()) && new Date() > expDate) {
        return NextResponse.json({
          ok: false,
          error: "This payment link has expired. Please contact Quickupp support to generate a fresh link.",
          expired: true,
          orderNumber: p.invoice_number,
        }, { status: 410 });
      }
    }

    const totalAmount = Number(p.total_amount != null ? p.total_amount : p.amount);
    const amountPaid = Number(p.amount || 0);
    const isPartial = p.payment_type === "partial";
    const remainingAmount = Number(p.remaining_amount != null ? p.remaining_amount : Math.max(0, totalAmount - amountPaid));

    return NextResponse.json({
      ok: true,
      order: {
        id: p.id,
        invoiceNumber: p.invoice_number,
        token: p.token,
        clientName: p.client_name,
        clientEmail: p.client_email,
        clientPhone: p.client_phone,
        companyName: p.company_name,
        service: p.service,
        category: p.category,
        quantity: p.quantity,
        totalAmount,
        amountPaid,
        remainingAmount,
        paymentType: p.payment_type || "full",
        status: p.status,
        linkStatus: p.link_status,
        currency: p.currency || "USD",
        notes: p.notes,
        source: p.source,
      },
    });
  } catch (err: any) {
    console.error("[Payment Lookup Error]", err);
    return NextResponse.json({ ok: false, error: "Failed to look up payment details." }, { status: 500 });
  }
}
