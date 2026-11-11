import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { generateReceiptPdf } from "@/lib/pdfReceipt";
import type { RowDataPacket } from "mysql2/promise";
import { paymentDateTime } from "@/lib/paymentTime";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const order = url.searchParams.get("order") || url.searchParams.get("invoice") || url.searchParams.get("id");

    if (!order) {
      return NextResponse.json({ error: "Missing order or invoice parameter." }, { status: 400 });
    }

    const pool = getPool();
    const isNumeric = /^\d+$/.test(order);

    const [rows] = await pool.query(
      isNumeric
        ? `SELECT * FROM payments WHERE id = ? LIMIT 1`
        : `SELECT * FROM payments WHERE invoice_number = ? OR reference = ? OR paypal_order_id = ? LIMIT 1`,
      isNumeric ? [Number(order)] : [order, order, order]
    );

    const payment = (rows as RowDataPacket[])?.[0];
    if (!payment) {
      return NextResponse.json({ error: "Payment record not found." }, { status: 404 });
    }

    const orderNumber =
      payment.invoice_number ||
      `QS-${new Date(payment.created_at || Date.now()).getFullYear()}-${String(payment.id).padStart(6, "0")}`;

    // when the payment was received (paid_at keeps the date and time)
    const { date: paidDate, time: paidTime } = paymentDateTime(payment.paid_at || payment.created_at);

    const billingPeriod =
      payment.billing_start_date || payment.billing_end_date
        ? `${payment.billing_start_date ? String(payment.billing_start_date).slice(0, 10) : "—"} to ${payment.billing_end_date ? String(payment.billing_end_date).slice(0, 10) : "—"}`
        : null;

    const pdfBuffer = await generateReceiptPdf({
      orderNumber,
      clientName: payment.client_name || "Valued Client",
      clientEmail: payment.client_email || "",
      clientPhone: payment.client_phone || null,
      companyName: payment.company_name || null,
      service: payment.service || "Information Technology Consultation",
      category: payment.category || "Technology & Digital Marketing",
      amountPaid: Number(payment.amount || 0),
      totalAmount: payment.total_amount != null ? Number(payment.total_amount) : Number(payment.amount || 0),
      paymentType: payment.payment_type || "full",
      paymentStatus: payment.status === "pending" ? "pending" : payment.status === "partially_paid" ? "partially_paid" : "paid",
      remainingAmount: payment.remaining_amount != null ? Number(payment.remaining_amount) : 0,
      transactionId: payment.reference || payment.paypal_order_id || "N/A",
      paymentDate: paidDate,
      paymentTime: paidTime,
      billingPeriod,
    });

    const filename = `Quickupp-Receipt-${orderNumber}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[Receipt Download API Error]", err);
    return NextResponse.json(
      { error: "Unable to generate receipt PDF. Please contact support." },
      { status: 500 }
    );
  }
}
