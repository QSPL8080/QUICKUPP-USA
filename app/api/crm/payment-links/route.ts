import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getPool } from "@/lib/db";
import { getCurrentUser } from "@/lib/crm/auth";
import { readJson } from "@/lib/enquiry";

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

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
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
      await pool.query("UPDATE payment_links SET link_status = 'cancelled' WHERE id = ?", [Number(body.id)]).catch(() => {});
      await pool.query("UPDATE payments SET link_status = 'cancelled' WHERE id = ?", [Number(body.id)]).catch(() => {});
      return NextResponse.json({ ok: true, message: "Payment link cancelled." });
    }

    const clientName = String(body.clientName || "").trim().slice(0, 150);
    const clientEmail = String(body.clientEmail || "").trim().toLowerCase().slice(0, 190);
    const clientPhone = String(body.clientPhone || "").trim().slice(0, 50);
    const companyName = String(body.companyName || "").trim().slice(0, 190) || null;
    const service = String(body.service || "").trim().slice(0, 150);
    const category = String(body.category || body.quantity || "").trim().slice(0, 150) || null;
    const industry = String(body.industry || "").trim().slice(0, 150) || null;
    const quantity = category;
    const leadSource = "manual";
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
          billing_start_date,
          billing_end_date,
          balance_due_date,
          token,
          expires_at,
          notes,
          created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'USD', 'PayPal', 'pending', 'active', 'payment_link', 'manual', ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR), ?, ?)`,
        [
          clientName,
          clientEmail,
          clientPhone,
          companyName,
          service,
          category,
          industry,
          quantity,
          `Payment Link: ${service}${category ? ` - ${category}` : ""}${industry ? ` (${industry})` : ""}`,
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
    } catch (insertErr: any) {
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
          `Payment Link: ${service}${category ? ` - ${category}` : ""}`,
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

    return NextResponse.json({
      ok: true,
      id: insertedId,
      token,
      orderNumber,
      url: `/pay/${token}`,
    });
  } catch (err: any) {
    console.error("[CRM Payment Link Generation Error]", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to generate payment link. Please try again." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
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
    const existing = (existingRows as any[])?.[0];
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Payment link record not found." }, { status: 404 });
    }

    const clientName = body.clientName !== undefined ? String(body.clientName).trim().slice(0, 150) : existing.client_name;
    const clientEmail = body.clientEmail !== undefined ? String(body.clientEmail).trim().toLowerCase().slice(0, 190) : existing.client_email;
    const clientPhone = body.clientPhone !== undefined ? String(body.clientPhone).trim().slice(0, 50) : existing.client_phone;
    const companyName = body.companyName !== undefined ? (String(body.companyName).trim().slice(0, 190) || null) : existing.company_name;
    const service = body.service !== undefined ? String(body.service).trim().slice(0, 150) : existing.service;
    const category = body.category !== undefined ? String(body.category).trim().slice(0, 150) : (existing.category || existing.quantity);
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
      : (existing.billing_start_date ? String(existing.billing_start_date).slice(0, 10) : null);
    const billingEndDate = typeof body.billingEndDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.billingEndDate)
      ? body.billingEndDate
      : (existing.billing_end_date ? String(existing.billing_end_date).slice(0, 10) : null);
    let balanceDueDate = typeof body.balanceDueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.balanceDueDate)
      ? body.balanceDueDate
      : (existing.balance_due_date ? String(existing.balance_due_date).slice(0, 10) : null);

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
          `Payment Link: ${service}${category ? ` - ${category}` : ""}${industry ? ` (${industry})` : ""}`,
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
          `Payment Link: ${service}${category ? ` - ${category}` : ""}`,
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

    return NextResponse.json({ ok: true, message: "Payment link updated successfully." });
  } catch (err: any) {
    console.error("[CRM Payment Link Edit Error]", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to update payment link." },
      { status: 500 }
    );
  }
}
