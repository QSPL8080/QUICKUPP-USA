import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getPool } from "@/lib/db";
import { getUserFor } from "@/lib/crm/auth";
import { readJson } from "@/lib/enquiry";
import { toDateOnly } from "@/lib/crm/data";
import { actorOf, logMany, money, type ActivityInput } from "@/lib/crm/activity";
import { entityOf, leadEcho, logPaymentChanges, paymentSnapshot, type PaymentTable } from "@/lib/crm/paymentActivity";
import type { RowDataPacket } from "mysql2/promise";
import { errMessage } from "@/lib/err";

function getDefaultDates() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const due = new Date(lastDay);
  due.setDate(due.getDate() - 10);

  return {
    start: fmt(firstDay),
    end: fmt(lastDay),
    due: fmt(due),
  };
}

/** a one-line summary kept within the description column */
const clip = (v: string, max = 255) => (v.length > max ? `${v.slice(0, max - 3)}...` : v);

export async function POST(req: Request) {
  try {
    const user = await getUserFor("payments");
    if (!user) {
      return NextResponse.json({ ok: false, error: "Please sign in again." }, { status: 401 });
    }

    const body = await readJson(req);
    if (!body) {
      return NextResponse.json({ ok: false, error: "Invalid request payload." }, { status: 400 });
    }

    // Cancellation action via POST
    if (body.action === "cancel" && body.id) {
      const pool = getPool();
      const cid = Number(body.id);
      const beforeLink = await paymentSnapshot("payment_links", cid);
      const table: PaymentTable = beforeLink ? "payment_links" : "payments";
      const before = beforeLink || (await paymentSnapshot("payments", cid));
      await pool.query("UPDATE payment_links SET link_status = 'cancelled' WHERE id = ?", [cid]).catch(() => {});
      await pool.query("UPDATE payments SET link_status = 'cancelled' WHERE id = ?", [cid]).catch(() => {});
      const after = await paymentSnapshot(table, cid);
      if (before && after) await logPaymentChanges(table, cid, before, after, actorOf(user));
      return NextResponse.json({ ok: true, message: "Payment link cancelled." });
    }

    const clientName = String(body.clientName || "").trim().slice(0, 150);
    const clientEmail = String(body.clientEmail || "").trim().toLowerCase().slice(0, 190);
    const clientPhone = String(body.clientPhone || "").trim().slice(0, 50);
    const companyName = String(body.companyName || "").trim().slice(0, 190) || null;
    const service = String(body.service || "").trim().slice(0, 150);
    const category = String(body.category || body.quantity || "").trim().slice(0, 1000) || null;
    const industry = String(body.industry || "").trim().slice(0, 150) || null;
    const quantity = category;
    const leadSource = body.leadSource ? String(body.leadSource).trim() : "manual";
    const leadId = body.leadId ? Number(body.leadId) : null;
    const notes = String(body.notes || "").trim().slice(0, 2000) || null;

    const defaults = getDefaultDates();
    const rawStart = typeof body.billingStartDate === "string" ? body.billingStartDate.trim() : "";
    const rawEnd = typeof body.billingEndDate === "string" ? body.billingEndDate.trim() : "";
    const rawDue = typeof body.balanceDueDate === "string" ? body.balanceDueDate.trim() : "";

    const billingStartDate = /^\d{4}-\d{2}-\d{2}$/.test(rawStart) ? rawStart : defaults.start;
    const billingEndDate = /^\d{4}-\d{2}-\d{2}$/.test(rawEnd) ? rawEnd : defaults.end;

    const totalAmount = Number(body.totalAmount) || 0;
    const paymentOption = body.paymentOption === "partial" ? "partial" : "full";

    let balanceDueDate: string | null = null;
    if (paymentOption === "partial") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawDue)) {
        balanceDueDate = rawDue;
      } else {
        const d = new Date(billingEndDate);
        if (!isNaN(d.getTime())) {
          d.setDate(d.getDate() - 10);
          balanceDueDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        } else {
          balanceDueDate = defaults.due;
        }
      }
    }

    if (!clientName) {
      return NextResponse.json({ ok: false, error: "Customer full name is required." }, { status: 400 });
    }
    if (!clientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clientEmail)) {
      return NextResponse.json({ ok: false, error: "A valid customer email is required." }, { status: 400 });
    }
    if (!clientPhone) {
      return NextResponse.json({ ok: false, error: "Mobile number (WhatsApp) is required." }, { status: 400 });
    }
    if (!service) {
      return NextResponse.json({ ok: false, error: "Service selection is required." }, { status: 400 });
    }
    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json({ ok: false, error: "Please enter a valid total amount in USD ($)." }, { status: 400 });
    }

    const isPartial = paymentOption === "partial";
    const initialAmount = 0; // Starts unpaid ($0 received) until customer pays
    const remainingAmount = totalAmount; // Full total remains unpaid initially

    const token = randomBytes(16).toString("hex");
    const pool = getPool();

    // Insert payment link record directly into payment_links table (dedicated table for payment link customers)
    let insertedId: number;
    let targetTable = "payment_links";

    try {
      const [res] = await pool.query(
        `INSERT INTO payment_links (
          client_name,
          client_email,
          client_phone,
          company_name,
          service,
          category,
          industry,
          quantity,
          description,
          amount,
          total_amount,
          payment_type,
          remaining_amount,
          currency,
          method,
          status,
          link_status,
          source,
          lead_source,
          lead_id,
          billing_start_date,
          billing_end_date,
          balance_due_date,
          token,
          expires_at,
          notes,
          created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'USD', 'PayPal', 'pending', 'active', 'payment_link', ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR), ?, ?)`,
        [
          clientName,
          clientEmail,
          clientPhone,
          companyName,
          service,
          category,
          industry,
          quantity,
          clip(`Payment Link: ${service}${category ? ` - ${category}` : ""}${industry ? ` (${industry})` : ""}`),
          initialAmount,
          totalAmount,
          isPartial ? "partial" : "full",
          remainingAmount,
          leadSource,
          leadId,
          billingStartDate,
          billingEndDate,
          balanceDueDate,
          token,
          notes,
          user.id,
        ]
      );
      insertedId = (res as { insertId: number }).insertId;
    } catch {
      // Graceful fallback if payment_links table does not exist yet before migration runs
      targetTable = "payments";
      const [res] = await pool.query(
        `INSERT INTO payments (
          client_name,
          client_email,
          client_phone,
          company_name,
          service,
          category,
          quantity,
          description,
          amount,
          total_amount,
          payment_type,
          remaining_amount,
          currency,
          method,
          status,
          link_status,
          source,
          lead_source,
          billing_start_date,
          billing_end_date,
          balance_due_date,
          token,
          expires_at,
          notes,
          created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'USD', 'PayPal', 'pending', 'active', 'payment_link', 'manual', ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR), ?, ?)`,
        [
          clientName,
          clientEmail,
          clientPhone,
          companyName,
          service,
          category,
          quantity,
          clip(`Payment Link: ${service}${category ? ` - ${category}` : ""}`),
          initialAmount,
          totalAmount,
          isPartial ? "partial" : "full",
          remainingAmount,
          billingStartDate,
          billingEndDate,
          balanceDueDate,
          token,
          notes,
          user.id,
        ]
      );
      insertedId = (res as { insertId: number }).insertId;
    }

    const currentYear = new Date().getFullYear();
    const orderNumber = `QAS-${currentYear}-${String(insertedId).padStart(6, "0")}`;

    await pool.query(`UPDATE \`${targetTable}\` SET invoice_number = ? WHERE id = ?`, [orderNumber, insertedId]).catch(() => {});

    {
      const actor = actorOf(user);
      const text = `Payment link ${orderNumber} created for ${money(totalAmount)} (${isPartial ? "partial" : "full"} payment)`;
      const items: ActivityInput[] = [
        { entity: entityOf(targetTable), id: insertedId, action: "created", newValue: money(totalAmount), text, actor, meta: { orderNumber, service } },
      ];
      const echo = leadEcho({ leadSource, leadId: leadId ? String(leadId) : "" }, { action: "payment_link", newValue: money(totalAmount), text, actor });
      if (echo) items.push(echo);
      await logMany(items);
    }

    return NextResponse.json({
      ok: true,
      id: insertedId,
      token,
      orderNumber,
      url: `/pay/${token}`,
    });
  } catch (err) {
    console.error("[CRM Payment Link Generation Error]", err);
    return NextResponse.json(
      { ok: false, error: errMessage(err) || "Failed to generate payment link. Please try again." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getUserFor("payments");
    if (!user) {
      return NextResponse.json({ ok: false, error: "Please sign in again." }, { status: 401 });
    }

    const body = await readJson(req);
    if (!body || !body.id) {
      return NextResponse.json({ ok: false, error: "Payment ID is required." }, { status: 400 });
    }

    const id = Number(body.id);
    const pool = getPool();
    let [existingRows] = await pool.query("SELECT * FROM payment_links WHERE id = ? LIMIT 1", [id]).catch(() => [[]]);
    let targetTable = "payment_links";
    if (!Array.isArray(existingRows) || !existingRows.length) {
      [existingRows] = await pool.query("SELECT * FROM payments WHERE id = ? LIMIT 1", [id]).catch(() => [[]]);
      targetTable = "payments";
    }
    const existing = (existingRows as RowDataPacket[])?.[0];
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Payment link record not found." }, { status: 404 });
    }
    const beforeSnap = await paymentSnapshot(targetTable as PaymentTable, id);

    const clientName = body.clientName !== undefined ? String(body.clientName).trim().slice(0, 150) : existing.client_name;
    const clientEmail = body.clientEmail !== undefined ? String(body.clientEmail).trim().toLowerCase().slice(0, 190) : existing.client_email;
    const clientPhone = body.clientPhone !== undefined ? String(body.clientPhone).trim().slice(0, 50) : existing.client_phone;
    const companyName = body.companyName !== undefined ? (String(body.companyName).trim().slice(0, 190) || null) : existing.company_name;
    const service = body.service !== undefined ? String(body.service).trim().slice(0, 150) : existing.service;
    const category = body.category !== undefined ? String(body.category).trim().slice(0, 1000) : (existing.category || existing.quantity);
    const industry = body.industry !== undefined ? (String(body.industry).trim().slice(0, 150) || null) : existing.industry;
    const quantity = category;
    const notes = body.notes !== undefined ? (String(body.notes).trim().slice(0, 2000) || null) : existing.notes;
    const linkStatus = body.linkStatus !== undefined ? String(body.linkStatus).trim() : existing.link_status;

    let totalAmount = existing.total_amount;
    let paymentType = existing.payment_type;
    let remainingAmount = existing.remaining_amount;

    // Only allow updating amount and payment_type if it hasn't been paid yet
    if (existing.status === "pending" && Number(existing.amount) === 0) {
      if (body.totalAmount !== undefined && Number(body.totalAmount) > 0) {
        totalAmount = Number(body.totalAmount);
        remainingAmount = totalAmount;
      }
      if (body.paymentOption !== undefined) {
        paymentType = body.paymentOption === "partial" ? "partial" : "full";
      }
    }

    const billingStartDate = typeof body.billingStartDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.billingStartDate)
      ? body.billingStartDate
      : (existing.billing_start_date ? toDateOnly(existing.billing_start_date) : null);
    const billingEndDate = typeof body.billingEndDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.billingEndDate)
      ? body.billingEndDate
      : (existing.billing_end_date ? toDateOnly(existing.billing_end_date) : null);
    let balanceDueDate = typeof body.balanceDueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.balanceDueDate)
      ? body.balanceDueDate
      : (existing.balance_due_date ? toDateOnly(existing.balance_due_date) : null);

    if (paymentType === "partial" && !balanceDueDate && billingEndDate) {
      const d = new Date(billingEndDate);
      if (!isNaN(d.getTime())) {
        d.setDate(d.getDate() - 10);
        balanceDueDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      }
    }

    try {
      await pool.query(
        `UPDATE \`${targetTable}\` SET
          client_name = ?,
          client_email = ?,
          client_phone = ?,
          company_name = ?,
          service = ?,
          category = ?,
          industry = ?,
          quantity = ?,
          description = ?,
          total_amount = ?,
          payment_type = ?,
          remaining_amount = ?,
          billing_start_date = ?,
          billing_end_date = ?,
          balance_due_date = ?,
          link_status = ?,
          notes = ?
        WHERE id = ?`,
        [
          clientName,
          clientEmail,
          clientPhone,
          companyName,
          service,
          category,
          industry,
          quantity,
          clip(`Payment Link: ${service}${category ? ` - ${category}` : ""}${industry ? ` (${industry})` : ""}`),
          totalAmount,
          paymentType,
          remainingAmount,
          billingStartDate,
          billingEndDate,
          balanceDueDate,
          linkStatus,
          notes,
          id,
        ]
      );
    } catch {
      await pool.query(
        `UPDATE \`${targetTable}\` SET
          client_name = ?,
          client_email = ?,
          client_phone = ?,
          company_name = ?,
          service = ?,
          category = ?,
          quantity = ?,
          description = ?,
          total_amount = ?,
          payment_type = ?,
          remaining_amount = ?,
          billing_start_date = ?,
          billing_end_date = ?,
          balance_due_date = ?,
          link_status = ?,
          notes = ?
        WHERE id = ?`,
        [
          clientName,
          clientEmail,
          clientPhone,
          companyName,
          service,
          category,
          quantity,
          clip(`Payment Link: ${service}${category ? ` - ${category}` : ""}`),
          totalAmount,
          paymentType,
          remainingAmount,
          billingStartDate,
          billingEndDate,
          balanceDueDate,
          linkStatus,
          notes,
          id,
        ]
      );
    }

    const afterSnap = await paymentSnapshot(targetTable as PaymentTable, id);
    if (beforeSnap && afterSnap) await logPaymentChanges(targetTable as PaymentTable, id, beforeSnap, afterSnap, actorOf(user));

    return NextResponse.json({ ok: true, message: "Payment link updated successfully." });
  } catch (err) {
    console.error("[CRM Payment Link Edit Error]", err);
    return NextResponse.json(
      { ok: false, error: errMessage(err) || "Failed to update payment link." },
      { status: 500 }
    );
  }
}

/* GET → List payment links (can filter by leadSource & leadId, or email, phone) */
export async function GET(req: Request) {
  const user = await getUserFor("payments");
  if (!user) {
    return NextResponse.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.trim().toLowerCase();
  const phone = searchParams.get("phone")?.trim();
  const leadSource = searchParams.get("leadSource")?.trim();
  const leadId = searchParams.get("leadId") ? Number(searchParams.get("leadId")) : null;

  const pool = getPool();
  const conditions: string[] = [];
  const args: (string | number)[] = [];

  if (leadSource && leadId) {
    conditions.push("(lead_source = ? AND lead_id = ?)");
    args.push(leadSource, leadId);
  }

  if (email) {
    conditions.push("(client_email = ? AND client_email != '')");
    args.push(email);
  }

  if (phone) {
    conditions.push("(client_phone = ? AND client_phone != '')");
    args.push(phone);
  }

  if (conditions.length === 0) {
    return NextResponse.json({ ok: true, links: [] });
  }

  const whereClause = conditions.join(" OR ");
  let rows: RowDataPacket[] = [];
  try {
    const [res] = await pool.query(
      `SELECT id, client_name, client_email, client_phone, company_name, service, category,
              industry, quantity, description, amount, total_amount, payment_type, remaining_amount,
              currency, method, status, link_status, invoice_number, token, billing_start_date,
              billing_end_date, balance_due_date, created_at, paid_at, notes, lead_source, lead_id
       FROM payment_links
       WHERE ${whereClause}
       ORDER BY id DESC`,
      args
    );
    rows = res as RowDataPacket[];
  } catch {
    const [res] = await pool.query(
      `SELECT id, client_name, client_email, client_phone, company_name, service, category,
              industry, quantity, description, amount, total_amount, payment_type, remaining_amount,
              currency, method, status, link_status, invoice_number, token, billing_start_date,
              billing_end_date, balance_due_date, created_at, paid_at, notes
       FROM payments
       WHERE token IS NOT NULL AND (${whereClause})
       ORDER BY id DESC`,
      args
    ).catch(() => [[]]);
    rows = res as RowDataPacket[];
  }

  const links = rows.map((r) => ({
    id: r.id,
    clientName: r.client_name,
    clientEmail: r.client_email,
    clientPhone: r.client_phone,
    companyName: r.company_name,
    service: r.service,
    category: r.category || r.quantity,
    industry: r.industry,
    amount: Number(r.amount || 0),
    totalAmount: Number(r.total_amount || r.amount || 0),
    paymentType: r.payment_type || "full",
    remainingAmount: Number(r.remaining_amount || 0),
    currency: r.currency || "USD",
    method: r.method,
    status: r.status,
    linkStatus: r.link_status || "active",
    invoiceNumber: r.invoice_number,
    orderNumber: r.invoice_number,
    paymentOption: r.payment_type || "full",
    token: r.token,
    billingStartDate: r.billing_start_date ? toDateOnly(r.billing_start_date) : null,
    billingEndDate: r.billing_end_date ? toDateOnly(r.billing_end_date) : null,
    balanceDueDate: r.balance_due_date ? toDateOnly(r.balance_due_date) : null,
    createdAt: r.created_at,
    paidAt: r.paid_at,
    notes: r.notes,
    leadSource: r.lead_source,
    leadId: r.lead_id,
  }));

  return NextResponse.json({ ok: true, links, paymentLinks: links });
}

