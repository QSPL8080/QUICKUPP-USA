import { NextResponse } from "next/server";
import { toDateOnly } from "@/lib/crm/data";
import { getPool } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token")?.trim();
    const orderNumber = searchParams.get("order")?.trim();

    if (!token && !orderNumber) {
      return NextResponse.json({ ok: false, error: "Missing token or order parameter." }, { status: 400 });
    }

    const pool = getPool();
    let rows: RowDataPacket[] = [];

    if (token) {
      try {
        const [plRes] = await pool.query("SELECT * FROM payment_links WHERE token = ? LIMIT 1", [token]);
        rows = plRes as RowDataPacket[];
      } catch {}
      if (!rows.length) {
        const [res] = await pool.query("SELECT * FROM payments WHERE token = ? LIMIT 1", [token]).catch(() => [[]]);
        rows = res as RowDataPacket[];
      }
    } else if (orderNumber) {
      try {
        const [plRes] = await pool.query("SELECT * FROM payment_links WHERE invoice_number = ? OR id = ? LIMIT 1", [
          orderNumber,
          Number(orderNumber) || 0,
        ]);
        rows = plRes as RowDataPacket[];
      } catch {}
      if (!rows.length) {
        const [res] = await pool.query("SELECT * FROM payments WHERE invoice_number = ? OR id = ? LIMIT 1", [
          orderNumber,
          Number(orderNumber) || 0,
        ]).catch(() => [[]]);
        rows = res as RowDataPacket[];
      }
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

    // Check 24-hour expiration for unpaid payment links (amount = 0 and pending).
    const isPast24h =
      p.link_status === "expired" ||
      (p.expires_at && !isNaN(new Date(p.expires_at).getTime()) && new Date() > new Date(p.expires_at)) ||
      (p.created_at && !isNaN(new Date(p.created_at).getTime()) && new Date().getTime() - new Date(p.created_at).getTime() > 24 * 60 * 60 * 1000);

    if (isPast24h && p.status === "pending" && Number(p.amount || 0) === 0) {
      // Mark as expired in DB
      await pool.query("UPDATE payment_links SET link_status = 'expired' WHERE id = ?", [p.id]).catch(() => {});
      await pool.query("UPDATE payments SET link_status = 'expired' WHERE id = ?", [p.id]).catch(() => {});

      return NextResponse.json({
        ok: false,
        error: "This payment link has expired (valid for 24 hours). Please contact Quickupp support to generate a fresh link.",
        expired: true,
        orderNumber: p.invoice_number,
      }, { status: 410 });
    }

    const totalAmount = Number(p.total_amount != null ? p.total_amount : p.amount);
    const amountPaid = Number(p.amount || 0);
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
        balanceDueDate: p.balance_due_date ? toDateOnly(p.balance_due_date) : null,
        billingStartDate: p.billing_start_date ? toDateOnly(p.billing_start_date) : null,
        billingEndDate: p.billing_end_date ? toDateOnly(p.billing_end_date) : null,
      },
    });
  } catch (err) {
    console.error("[Payment Lookup Error]", err);
    return NextResponse.json({ ok: false, error: "Failed to look up payment details." }, { status: 500 });
  }
}
