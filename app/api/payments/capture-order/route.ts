import { NextResponse, after } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { getPool } from "@/lib/db";
import { sendMail, LEADS_NOTIFICATION_EMAIL } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.orderID) {
      return NextResponse.json({ error: "Missing orderID in request" }, { status: 400 });
    }

    const {
      orderID,
      clientName,
      clientEmail,
      clientPhone,
      companyName,
      category,
      service,
      billingStartDate,
      billingEndDate,
      amount,
      notes,
    } = body;

    // 1. Capture the order with PayPal API
    const captureData = await capturePayPalOrder(orderID);
    const captureStatus = captureData.status;

    if (captureStatus !== "COMPLETED") {
      return NextResponse.json(
        {
          error: `Payment was not completed by PayPal (Status: ${captureStatus}). Please try again.`,
          details: captureData,
        },
        { status: 400 }
      );
    }

    const captureDetail = captureData.purchase_units?.[0]?.payments?.captures?.[0];
    const captureID = captureDetail?.id || orderID;
    const capturedAmount = Number(captureDetail?.amount?.value || amount || 0);
    const currency = captureDetail?.amount?.currency_code || "USD";

    // 2. Save payment record in MySQL database
    try {
      const pool = getPool();
      await pool.query(
        `INSERT INTO payments (
          client_name,
          client_email,
          client_phone,
          company_name,
          category,
          service,
          description,
          amount,
          currency,
          method,
          status,
          source,
          reference,
          paypal_order_id,
          billing_start_date,
          billing_end_date,
          paid_at,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'paypal', 'paid', 'online', ?, ?, ?, ?, CURDATE(), ?)`,
        [
          clientName,
          clientEmail || null,
          clientPhone || null,
          companyName || null,
          category || null,
          service || "General Consultation",
          `Online PayPal Payment - ${category || ""} ${service || ""}`.trim(),
          capturedAmount,
          currency,
          captureID,
          orderID,
          billingStartDate || null,
          billingEndDate || null,
          notes || null,
        ]
      );
    } catch (dbErr) {
      console.error("[Database Save Payment Error]", dbErr);
      // We don't fail the response if DB fails, because payment was already captured
    }

    // 3. Dispatch email notifications in background via after()
    after(async () => {
      // Admin Notification Email
      try {
        const adminSubject = `Payment Received: $${capturedAmount.toFixed(2)} USD from ${clientName}`;
        const adminHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="background: #0f172a; padding: 18px 24px; border-radius: 8px; margin-bottom: 24px;">
              <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Payment Received via PayPal</h2>
              <p style="color: #38bdf8; margin: 4px 0 0; font-size: 13px;">Quickupp Softech LLC Online Checkout</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #64748b;">Amount:</td><td style="padding: 8px 0; font-weight: bold; color: #10b981; font-size: 18px;">$${capturedAmount.toFixed(2)} ${currency}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Client Name:</td><td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${clientName}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Client Email:</td><td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${clientEmail}">${clientEmail}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Client Phone:</td><td style="padding: 8px 0; color: #0f172a;"><a href="tel:${clientPhone}">${clientPhone}</a></td></tr>
              ${companyName ? `<tr><td style="padding: 8px 0; color: #64748b;">Company:</td><td style="padding: 8px 0; color: #0f172a;">${companyName}</td></tr>` : ""}
              ${category ? `<tr><td style="padding: 8px 0; color: #64748b;">Category:</td><td style="padding: 8px 0; color: #0f172a;">${category}</td></tr>` : ""}
              ${service ? `<tr><td style="padding: 8px 0; color: #64748b;">Service:</td><td style="padding: 8px 0; color: #0f172a;">${service}</td></tr>` : ""}
              ${billingStartDate || billingEndDate ? `<tr><td style="padding: 8px 0; color: #64748b;">Billing Period:</td><td style="padding: 8px 0; color: #0f172a;">${billingStartDate || "—"} to ${billingEndDate || "—"}</td></tr>` : ""}
              <tr><td style="padding: 8px 0; color: #64748b;">PayPal Capture ID:</td><td style="padding: 8px 0; color: #0f172a; font-family: monospace;">${captureID}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">PayPal Order ID:</td><td style="padding: 8px 0; color: #0f172a; font-family: monospace;">${orderID}</td></tr>
              ${notes ? `<tr><td style="padding: 8px 0; color: #64748b;">Notes:</td><td style="padding: 8px 0; color: #0f172a;">${notes}</td></tr>` : ""}
            </table>
            
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
              This record has been automatically logged into the CRM Payments database.
            </div>
          </div>
        `;

        await sendMail({
          to: LEADS_NOTIFICATION_EMAIL,
          subject: adminSubject,
          html: adminHtml,
          text: `Payment of $${capturedAmount.toFixed(2)} ${currency} received from ${clientName} (${clientEmail}, ${clientPhone}) for ${service || category || "service"}. Transaction ID: ${captureID}`,
          replyTo: clientEmail || undefined,
        });
      } catch (mailErr) {
        console.error("[Payment Notification Email Error]", mailErr);
      }

      // Customer Confirmation & Receipt Email
      if (clientEmail) {
        try {
          const clientSubject = `Payment Receipt - Quickupp Softech LLC (Transaction #${captureID})`;
          const clientHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <div style="background: #0f172a; padding: 20px 24px; border-radius: 8px; margin-bottom: 24px;">
                <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Payment Confirmation</h2>
                <p style="color: #10b981; margin: 6px 0 0; font-size: 14px;">Thank you for your payment!</p>
              </div>

              <p style="font-size: 15px; color: #334155; line-height: 1.6;">
                Dear ${clientName},<br><br>
                We have successfully received your payment of <strong>$${capturedAmount.toFixed(2)} ${currency}</strong>.
              </p>

              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 20px; margin: 20px 0;">
                <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                  <tr><td style="padding: 6px 0; color: #64748b;">Amount Paid:</td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">$${capturedAmount.toFixed(2)} ${currency}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Transaction ID:</td><td style="padding: 6px 0; font-family: monospace; color: #0f172a;">${captureID}</td></tr>
                  ${service ? `<tr><td style="padding: 6px 0; color: #64748b;">Service:</td><td style="padding: 6px 0; color: #0f172a;">${service}</td></tr>` : ""}
                  ${billingStartDate || billingEndDate ? `<tr><td style="padding: 6px 0; color: #64748b;">Billing Coverage:</td><td style="padding: 6px 0; color: #0f172a;">${billingStartDate || ""} to ${billingEndDate || ""}</td></tr>` : ""}
                  <tr><td style="padding: 6px 0; color: #64748b;">Date:</td><td style="padding: 6px 0; color: #0f172a;">${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</td></tr>
                </table>
              </div>

              <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
                If you have any questions regarding your invoice or billing period, please reply directly to this email or reach us at <a href="mailto:support@quickuppsoftech.us">support@quickuppsoftech.us</a>.
              </p>

              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
                Quickupp Softech LLC • Enterprise AI, Digital Marketing & Engineering
              </div>
            </div>
          `;

          await sendMail({
            to: clientEmail,
            subject: clientSubject,
            html: clientHtml,
            text: `Thank you for your payment of $${capturedAmount.toFixed(2)} ${currency} to Quickupp Softech LLC. Transaction ID: ${captureID}.`,
          });
        } catch (clientMailErr) {
          console.error("[Customer Receipt Email Error]", clientMailErr);
        }
      }
    });

    return NextResponse.json({
      success: true,
      captureID,
      orderID,
      amount: capturedAmount,
      currency,
    });
  } catch (err: any) {
    console.error("[Capture Order API Error]", err);
    return NextResponse.json(
      { error: err.message || "Failed to finalize PayPal payment capture." },
      { status: 500 }
    );
  }
}
