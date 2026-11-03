import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getPool } from "@/lib/db";
import { getCurrentUser } from "@/lib/crm/auth";
import { readJson } from "@/lib/enquiry";

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

    const clientName = String(body.clientName || "").trim().slice(0, 150);
    const clientEmail = String(body.clientEmail || "").trim().toLowerCase().slice(0, 190);
    const clientPhone = String(body.clientPhone || "").trim().slice(0, 50);
    const companyName = String(body.companyName || "").trim().slice(0, 190) || null;
    const service = String(body.service || "").trim().slice(0, 150);
    const quantity = String(body.quantity || "Single Scope").trim().slice(0, 100);
    const leadSource = String(body.leadSource || "Manual").trim().slice(0, 100);
    const notes = String(body.notes || "").trim().slice(0, 2000) || null;

    const totalAmount = Number(body.totalAmount) || 0;
    const paymentOption = body.paymentOption === "partial" ? "partial" : "full";

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
      return NextResponse.json({ ok: false, error: "Service / Video type is required." }, { status: 400 });
    }
    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json({ ok: false, error: "Please enter a valid total amount in USD ($)." }, { status: 400 });
    }

    const isPartial = paymentOption === "partial";
    const initialAmount = 0; // Starts unpaid ($0 received) until customer pays
    const remainingAmount = totalAmount; // Full total remains unpaid initially

    const token = randomBytes(16).toString("hex");
    const pool = getPool();

    // Insert payment link record directly into payments table (NO conversion to lead)
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
        token,
        expires_at,
        notes,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'USD', 'PayPal', 'pending', 'active', 'payment_link', ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR), ?, ?)`,
      [
        clientName,
        clientEmail,
        clientPhone,
        companyName,
        service,
        quantity, // category holds quantity/package
        quantity,
        `Payment Link: ${service} (${quantity})`,
        initialAmount,
        totalAmount,
        isPartial ? "partial" : "full",
        remainingAmount,
        leadSource,
        token,
        notes,
        user.id,
      ]
    );

    const insertedId = (res as { insertId: number }).insertId;
    const currentYear = new Date().getFullYear();
    const orderNumber = `QAS-${currentYear}-${String(insertedId).padStart(6, "0")}`;

    await pool.query("UPDATE payments SET invoice_number = ? WHERE id = ?", [orderNumber, insertedId]);

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
