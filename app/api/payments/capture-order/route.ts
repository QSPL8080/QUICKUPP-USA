import { NextResponse, after } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { getPool } from "@/lib/db";
import { sendMail, LEADS_NOTIFICATION_EMAIL } from "@/lib/mailer";
import { generateReceiptPdf } from "@/lib/pdfReceipt";

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
      totalAmount,
      paymentType,
      remainingAmount,
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
    const isPartial = paymentType === "partial";
    const finalTotal = Number(totalAmount) || capturedAmount;
    const finalRemaining = isPartial ? Math.max(0, Number(remainingAmount || (finalTotal - capturedAmount))) : 0;
    const paymentStatus = isPartial ? "partially_paid" : "paid";

    // 2. Save payment record in MySQL database
    let insertedId = 0;
    try {
      const pool = getPool();
      const [insertRes] = await pool.query(
        `INSERT INTO payments (
          client_name,
          client_email,
          client_phone,
          company_name,
          category,
          service,
          description,
          amount,
          total_amount,
          payment_type,
          remaining_amount,
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paypal', ?, 'online', ?, ?, ?, ?, CURDATE(), ?)`,
        [
          clientName,
          clientEmail || null,
          clientPhone || null,
          companyName || null,
          category || null,
          service || "General Consultation",
          `Online PayPal Payment (${isPartial ? "Partial Deposit" : "Full Payment"}) - ${category || ""} ${service || ""}`.trim(),
          capturedAmount,
          finalTotal,
          isPartial ? "partial" : "full",
          finalRemaining,
          currency,
          paymentStatus,
          captureID,
          orderID,
          billingStartDate || null,
          billingEndDate || null,
          notes || null,
        ]
      );
      insertedId = (insertRes as any).insertId || 0;
    } catch (dbErr) {
      console.error("[Database Save Payment Error]", dbErr);
      // We don't fail the response if DB fails, because payment was already captured
    }

    const currentYear = new Date().getFullYear();
    const orderNumber = insertedId
      ? `QS-${currentYear}-${String(insertedId).padStart(6, "0")}`
      : `QS-${currentYear}-${String(Math.floor(100000 + Math.random() * 900000))}`;

    if (insertedId) {
      try {
        const pool = getPool();
        await pool.query(`UPDATE payments SET invoice_number = ? WHERE id = ?`, [orderNumber, insertedId]);
      } catch (updErr) {
        console.error("[Database Update Invoice Number Error]", updErr);
      }
    }

    // 3. Dispatch email notifications in background via after()
    after(async () => {
      // Admin Notification Email
      try {
        const typeLabel = isPartial ? "Partial Payment" : "Full Payment";
        const adminSubject = `${typeLabel} Received: $${capturedAmount.toFixed(2)} USD from ${clientName} (#${orderNumber})`;
        const adminHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="background: #0f172a; padding: 18px 24px; border-radius: 8px; margin-bottom: 24px;">
              <h2 style="color: #ffffff; margin: 0; font-size: 20px;">${typeLabel} Received via PayPal</h2>
              <p style="color: #38bdf8; margin: 4px 0 0; font-size: 13px;">Quickupp Softech LLC Online Checkout</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #64748b; width: 40%;">Order / Invoice No:</td><td style="padding: 8px 0; font-weight: bold; color: #0f172a; font-family: monospace;">${orderNumber}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Payment Type:</td><td style="padding: 8px 0; font-weight: bold; color: ${isPartial ? "#d97706" : "#10b981"};">${typeLabel}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Amount Paid Now:</td><td style="padding: 8px 0; font-weight: bold; color: #10b981; font-size: 18px;">$${capturedAmount.toFixed(2)} ${currency}</td></tr>
              ${isPartial ? `<tr><td style="padding: 8px 0; color: #64748b;">Total Service Amount:</td><td style="padding: 8px 0; font-weight: 600; color: #0f172a;">$${finalTotal.toFixed(2)} ${currency}</td></tr>` : ""}
              ${isPartial ? `<tr><td style="padding: 8px 0; color: #64748b;">Remaining Balance Due:</td><td style="padding: 8px 0; font-weight: bold; color: #ef4444;">$${finalRemaining.toFixed(2)} ${currency}</td></tr>` : ""}
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
              This payment record has been automatically logged into the CRM Payments database.
            </div>
          </div>
        `;

        await sendMail({
          to: LEADS_NOTIFICATION_EMAIL,
          subject: adminSubject,
          html: adminHtml,
          text: `${typeLabel} of $${capturedAmount.toFixed(2)} ${currency} received from ${clientName} (${clientEmail}, ${clientPhone}) for ${service || category || "service"}. Order Number: ${orderNumber}. Transaction ID: ${captureID}`,
          replyTo: clientEmail || undefined,
        });
      } catch (mailErr) {
        console.error("[Payment Notification Email Error]", mailErr);
      }

      // Customer Confirmation & Receipt Email
      if (clientEmail) {
        try {
          const firstName = clientName.trim().split(" ")[0] || "Valued Client";
          const clientSubject = `Payment Confirmed — Quickupp Softech LLC | Order #${orderNumber}`;

          const now = new Date();
          const paymentDateFormatted = now.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });
          const paymentTimeFormatted = now.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZoneName: "short",
          });

          const billingCoverageStr =
            billingStartDate || billingEndDate
              ? `${billingStartDate || "—"} to ${billingEndDate || "—"}`
              : "Active Service Retainer";

          // Generate PDF Receipt buffer
          const pdfBuffer = await generateReceiptPdf({
            orderNumber,
            clientName,
            clientEmail,
            clientPhone,
            companyName,
            service,
            category,
            amountPaid: capturedAmount,
            totalAmount: finalTotal,
            paymentType: isPartial ? "partial" : "full",
            remainingAmount: finalRemaining,
            transactionId: captureID,
            paymentDate: paymentDateFormatted,
            paymentTime: paymentTimeFormatted,
            billingPeriod: billingCoverageStr,
          });

          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://quickupp.com";
          const receiptDownloadUrl = `${siteUrl}/api/payments/receipt?order=${encodeURIComponent(orderNumber)}`;

          const clientHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px 12px; background-color: #f1f5f9; color: #1e293b;">
              <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
                
                <!-- Email Header with Quickupp Logo -->
                <div style="background: #0b0f17; padding: 28px 32px; text-align: center; border-bottom: 2px solid #3b82f6;">
                  <img src="${siteUrl}/images/logo-white.png" alt="Quickupp Softech LLC" width="170" style="display: block; margin: 0 auto; max-width: 170px; height: auto;" />
                  <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0; letter-spacing: 0.05em; text-transform: uppercase;">Enterprise Marketing • AI • Technology</p>
                </div>

                <!-- Main Content -->
                <div style="padding: 32px 32px 28px;">
                  <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 12px;">Hi ${firstName},</h1>
                  <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 8px;">
                    Thank you for choosing <strong>Quickupp Softech LLC</strong>.
                  </p>
                  <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 24px;">
                    We’re pleased to confirm that your payment has been successfully received.
                  </p>

                  <!-- Payment Confirmed Banner -->
                  <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #a7f3d0; border-radius: 12px; padding: 18px 24px; margin-bottom: 28px; text-align: center;">
                    <span style="font-size: 12px; font-weight: 800; letter-spacing: 0.1em; color: #047857; text-transform: uppercase; display: block; margin-bottom: 4px;">PAYMENT CONFIRMED</span>
                    <span style="font-size: 20px; font-weight: 800; color: #065f46;">Status: ${isPartial ? "PARTIALLY PAID ✓" : "PAID ✓"}</span>
                  </div>

                  <!-- Order Details Table -->
                  <h2 style="font-size: 15px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0;">
                    Order Details
                  </h2>
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 9px 0; color: #64748b; width: 42%;">Order / Invoice No.</td>
                      <td style="padding: 9px 0; font-weight: 700; color: #0f172a; font-family: monospace; font-size: 14.5px;">${orderNumber}</td>
                    </tr>
                    <tr>
                      <td style="padding: 9px 0; color: #64748b;">Service</td>
                      <td style="padding: 9px 0; font-weight: 600; color: #0f172a;">${service}</td>
                    </tr>
                    ${category ? `
                    <tr>
                      <td style="padding: 9px 0; color: #64748b;">Category</td>
                      <td style="padding: 9px 0; color: #0f172a;">${category}</td>
                    </tr>` : ""}
                    ${isPartial ? `
                    <tr>
                      <td style="padding: 9px 0; color: #64748b;">Total Invoice Amount</td>
                      <td style="padding: 9px 0; font-weight: 600; color: #475569;">$${finalTotal.toFixed(2)} ${currency}</td>
                    </tr>` : ""}
                    <tr>
                      <td style="padding: 9px 0; color: #64748b;">Amount Paid</td>
                      <td style="padding: 9px 0; font-weight: 800; color: #10b981; font-size: 16px;">$${capturedAmount.toFixed(2)} ${currency}</td>
                    </tr>
                    ${isPartial ? `
                    <tr>
                      <td style="padding: 9px 0; color: #64748b;">Remaining Balance Due</td>
                      <td style="padding: 9px 0; font-weight: 700; color: #dc2626;">$${finalRemaining.toFixed(2)} ${currency}</td>
                    </tr>` : ""}
                    <tr>
                      <td style="padding: 9px 0; color: #64748b;">Payment Date</td>
                      <td style="padding: 9px 0; color: #0f172a;">${paymentDateFormatted}</td>
                    </tr>
                    <tr>
                      <td style="padding: 9px 0; color: #64748b;">Payment Time</td>
                      <td style="padding: 9px 0; color: #0f172a;">${paymentTimeFormatted}</td>
                    </tr>
                    <tr>
                      <td style="padding: 9px 0; color: #64748b;">Payment Method</td>
                      <td style="padding: 9px 0; color: #0f172a;">PayPal</td>
                    </tr>
                    <tr>
                      <td style="padding: 9px 0; color: #64748b;">Transaction ID</td>
                      <td style="padding: 9px 0; font-family: monospace; color: #0f172a; word-break: break-all;">${captureID}</td>
                    </tr>
                  </table>

                  <!-- Billing Information -->
                  <h2 style="font-size: 15px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.04em; margin: 24px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0;">
                    Billing Information
                  </h2>
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 7px 0; color: #64748b; width: 42%;">Name:</td>
                      <td style="padding: 7px 0; font-weight: 600; color: #0f172a;">${clientName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 7px 0; color: #64748b;">Email:</td>
                      <td style="padding: 7px 0; color: #0f172a;">${clientEmail}</td>
                    </tr>
                    ${clientPhone ? `
                    <tr>
                      <td style="padding: 7px 0; color: #64748b;">Phone:</td>
                      <td style="padding: 7px 0; color: #0f172a;">${clientPhone}</td>
                    </tr>` : ""}
                    ${companyName ? `
                    <tr>
                      <td style="padding: 7px 0; color: #64748b;">Company:</td>
                      <td style="padding: 7px 0; color: #0f172a;">${companyName}</td>
                    </tr>` : ""}
                    <tr>
                      <td style="padding: 7px 0; color: #64748b;">Billing Coverage:</td>
                      <td style="padding: 7px 0; color: #0f172a;">${billingCoverageStr}</td>
                    </tr>
                  </table>

                  <!-- PDF Receipt Download Section -->
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0 28px;">
                    <p style="font-size: 14px; color: #334155; margin: 0 0 14px; font-weight: 600;">
                      📎 Your payment receipt/invoice is attached to this email as a PDF.
                    </p>
                    <a href="${receiptDownloadUrl}" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; font-size: 13.5px; font-weight: 700; padding: 12px 28px; border-radius: 8px; letter-spacing: 0.02em;">
                      DOWNLOAD PAYMENT RECEIPT
                    </a>
                  </div>

                  <!-- What Happens Next -->
                  <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <h3 style="font-size: 15px; font-weight: 800; color: #581c87; margin: 0 0 8px;">What Happens Next?</h3>
                    <p style="font-size: 14px; color: #4c1d95; line-height: 1.6; margin: 0 0 10px;">
                      Our team will process your order and contact you with the next steps.
                    </p>
                    <p style="font-size: 13.5px; color: #6b21a8; line-height: 1.5; margin: 0 0 10px;">
                      If you purchased a creative, video, or technology service, please keep your order number handy when communicating with our team:
                    </p>
                    <div style="background: #ffffff; border: 1px dashed #c084fc; border-radius: 6px; padding: 8px 14px; font-weight: 800; font-size: 14px; color: #581c87; display: inline-block;">
                      Order Number: ${orderNumber}
                    </div>
                  </div>

                  <!-- Contact Support -->
                  <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
                    If you have any questions, simply reply to this email or contact us at:<br />
                    <strong>Quickupp Softech LLC</strong><br />
                    Email: <a href="mailto:info@quickuppsoftech.us" style="color: #4f46e5; text-decoration: none;">info@quickuppsoftech.us</a><br />
                    Website: <a href="https://quickupp.com" style="color: #4f46e5; text-decoration: none;">quickupp.com</a>
                  </p>

                  <p style="font-size: 14.5px; color: #1e293b; line-height: 1.5; margin: 0 0 4px;">
                    Thank you for choosing Quickupp Softech LLC.
                  </p>
                  <p style="font-size: 14.5px; color: #1e293b; line-height: 1.5; margin: 0;">
                    Best regards,<br />
                    <strong>Quickupp Softech LLC</strong><br />
                    <span style="font-size: 12px; color: #64748b;">Operated by Quickupp Softech LLC</span>
                  </p>
                </div>

                <!-- Email Footer -->
                <div style="background: #f8fafc; padding: 18px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
                  © ${currentYear} Quickupp Softech LLC. All rights reserved.<br />
                  Secure payment processed via PayPal.
                </div>
              </div>
            </body>
            </html>
          `;

          await sendMail({
            to: clientEmail,
            subject: clientSubject,
            html: clientHtml,
            text: `Payment Confirmed — Quickupp Softech LLC | Order #${orderNumber}\n\nHi ${firstName},\n\nThank you for choosing Quickupp Softech LLC. We're pleased to confirm that your payment of $${capturedAmount.toFixed(2)} ${currency} has been successfully received.\n\nOrder / Invoice No: ${orderNumber}\nService: ${service}\nPayment Method: PayPal\nTransaction ID: ${captureID}\nStatus: ${isPartial ? "PARTIALLY PAID" : "PAID"}\n\nDownload receipt: ${receiptDownloadUrl}\n\nWhat happens next?\nOur team will process your order and contact you with next steps.\n\nNeed help? info@quickuppsoftech.us\n\nBest regards,\nQuickupp Softech LLC`,
            attachments: [
              {
                filename: `Quickupp-Receipt-${orderNumber}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
              },
            ],
          });
        } catch (clientMailErr) {
          console.error("[Customer Receipt Email Error]", clientMailErr);
        }
      }
    });

    return NextResponse.json({
      success: true,
      orderNumber,
      captureID,
      orderID,
      amount: capturedAmount,
      totalAmount: finalTotal,
      paymentType: isPartial ? "partial" : "full",
      remainingAmount: finalRemaining,
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
