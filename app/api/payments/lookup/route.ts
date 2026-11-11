import { NextResponse } from "next/server";
import { toDateOnly } from "@/lib/crm/data";
import { getPool } from "@/lib/db";
import { getCurrentUser } from "@/lib/crm/auth";
import type { RowDataPacket } from "mysql2/promise";
import { LINK_MESSAGES, findByToken, linkState, markExpired, type LinkTable } from "@/lib/paymentLink";

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
    let table: LinkTable = "payment_links";

    if (token) {
      const found = await findByToken(token);
      if (found) {
        rows = [found.row];
        table = found.table;
      }
    } else if (orderNumber) {
      // by order number: CRM only (order numbers are sequential, so anyone could guess them)
      if (!(await getCurrentUser())) {
        return NextResponse.json({ ok: false, error: "Payment record or link not found." }, { status: 404 });
      }
      try {
        const [plRes] = await pool.query("SELECT * FROM payment_links WHERE invoice_number = ? OR id = ? LIMIT 1", [
          orderNumber,
          Number(orderNumber) || 0,
        ]);
        rows = plRes as RowDataPacket[];
      } catch {}
      if (!rows.length) {
        table = "payments";
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

    // what the link is now: open, balance due, paid, expired (24 hours unpaid) or cancelled
    const state = token ? linkState(p) : "open";
    if (state === "cancelled" || state === "expired") {
      if (state === "expired" && p.link_status !== "expired") await markExpired(table, Number(p.id));
      return NextResponse.json(
        { ok: false, error: LINK_MESSAGES[state], expired: state === "expired", cancelled: state === "cancelled", orderNumber: p.invoice_number },
        { status: 410 }
      );
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
        linkState: state,
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
