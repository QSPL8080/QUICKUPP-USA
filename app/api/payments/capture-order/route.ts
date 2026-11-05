import { NextResponse, after } from "next/server";
import { randomBytes } from "node:crypto";
import { capturePayPalOrder } from "@/lib/paypal";
import { getPool } from "@/lib/db";
import { sendMail, LEADS_NOTIFICATION_EMAIL } from "@/lib/mailer";
import { generateReceiptPdf } from "@/lib/pdfReceipt";
import { logActivity } from "@/lib/crm/activity";
import { logGatewayResult, paymentSnapshot, type PaymentSnapshot, type PaymentTable } from "@/lib/crm/paymentActivity";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.orderID) {
      return NextResponse.json({ error: "Missing orderID in request" }, { status: 400 });
    }

    const currentYear = new Date().getFullYear();

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
      token,
      invoiceNumber,
      existingPaymentId,
    } = body;

    const isPartialParam = paymentType === "partial";
    const parsedAmount = Number(amount) || 0;
    let finalTotal = Number(totalAmount) || parsedAmount;
    let isPartial = isPartialParam;
    let finalRemaining = isPartial
      ? Math.max(0, Number(remainingAmount ?? (finalTotal - parsedAmount)))
      : 0;

    const categoryStr = Array.isArray(category)
      ? category.filter(Boolean).join(", ")
      : (typeof category === "string" ? category : "");

    // 1. Attempt to capture with PayPal
    let captureData: any = null;
    let captureError: any = null;
    try {
      captureData = await capturePayPalOrder(orderID);
    } catch (err: any) {
      captureError = err;
    }

    // Determine Payment Status
    let paymentStatus: "paid" | "partially_paid" | "pending" | "failed" = "failed";
    let failureReason = "";
    let pendingReason = "";

    const captureDetail = captureData?.purchase_units?.[0]?.payments?.captures?.[0];
    const captureID = captureDetail?.id || orderID;
    const capturedAmount = Number(captureDetail?.amount?.value || parsedAmount);
    const currency = captureDetail?.amount?.currency_code || "USD";

    if (captureError) {
      paymentStatus = "failed";
      failureReason = captureError.message || "Payment authorization or capture failed.";
    } else if (captureData?.status === "COMPLETED") {
      paymentStatus = isPartial ? "partially_paid" : "paid";
    } else if (captureData?.status === "PENDING") {
      paymentStatus = "pending";
      pendingReason = captureDetail?.status_details?.reason || "Funds pending clearing in PayPal";
    } else {
      paymentStatus = "failed";
      failureReason =
        captureData?.status_details?.reason ||
        captureData?.message ||
        `PayPal returned status: ${captureData?.status || "DECLINED"}`;
    }

    // 2. Database Handling: In-place row update vs new insertion
    let insertedId = 0;
    let orderNumber = "";
    let isPaymentLink = false;
    let isBalancePayment = false;
    let effectiveClientName = clientName || "Valued Client";
    let effectiveClientEmail = clientEmail || "";
    let effectiveClientPhone = clientPhone || "";
    let effectiveCompany = companyName || "";
    let effectiveService = service || "Quickupp Softech Service";
    let effectiveCategory = categoryStr || "";

    try {
      const pool = getPool();
      let existingRecord: any = null;
      let targetTable = "payments";
      let beforeSnap: PaymentSnapshot | null = null;

      // Check for existing record by token, invoiceNumber, or ID (checking payment_links first)
      if (token) {
        let [rows] = await pool.query("SELECT * FROM payment_links WHERE token = ? LIMIT 1", [token]).catch(() => [[]]);
        if (Array.isArray(rows) && rows.length > 0) {
          existingRecord = rows[0];
          targetTable = "payment_links";
        } else {
          [rows] = await pool.query("SELECT * FROM payments WHERE token = ? LIMIT 1", [token]).catch(() => [[]]);
          if (Array.isArray(rows) && rows.length > 0) {
            existingRecord = rows[0];
            targetTable = "payments";
          }
        }
      }
      if (!existingRecord && (invoiceNumber || existingPaymentId)) {
        let [rows] = await pool.query("SELECT * FROM payment_links WHERE invoice_number = ? OR id = ? LIMIT 1", [
          invoiceNumber || null,
          Number(existingPaymentId) || 0,
        ]).catch(() => [[]]);
        if (Array.isArray(rows) && rows.length > 0) {
          existingRecord = rows[0];
          targetTable = "payment_links";
        } else {
          [rows] = await pool.query("SELECT * FROM payments WHERE invoice_number = ? OR id = ? LIMIT 1", [
            invoiceNumber || null,
            Number(existingPaymentId) || 0,
          ]).catch(() => [[]]);
          if (Array.isArray(rows) && rows.length > 0) {
            existingRecord = rows[0];
            targetTable = "payments";
          }
        }
      }

      if (existingRecord) {
        // MATCH FOUND: UPDATE THE EXACT SAME ROW IN-PLACE!
        insertedId = Number(existingRecord.id);
        beforeSnap = await paymentSnapshot(targetTable as PaymentTable, insertedId);
        orderNumber = existingRecord.invoice_number || `QAS-${new Date().getFullYear()}-${String(insertedId).padStart(6, "0")}`;
        isPaymentLink = targetTable === "payment_links" || existingRecord.source === "payment_link";
        effectiveClientName = existingRecord.client_name || clientName || "Valued Client";
        effectiveClientEmail = existingRecord.client_email || clientEmail || "";
        effectiveClientPhone = existingRecord.client_phone || clientPhone || "";
        effectiveCompany = existingRecord.company_name || companyName || "";
        effectiveService = existingRecord.service || service || "Quickupp Softech Service";
        effectiveCategory = existingRecord.category || categoryStr || "";
        finalTotal = Number(existingRecord.total_amount || totalAmount || capturedAmount);

        const previouslyPaid = Number(existingRecord.amount || 0);

        if (previouslyPaid > 0 && paymentStatus !== "failed") {
          // Paying remaining balance!
          isBalancePayment = true;
          isPartial = false;
          finalRemaining = 0;
          paymentStatus = "paid";
          const newTotalPaid = finalTotal;
          const updatedRef = existingRecord.reference
            ? `${existingRecord.reference} | Balance: ${captureID}`
            : `Initial: ${previouslyPaid} | Balance: ${captureID}`;

          await pool.query(
            `UPDATE \`${targetTable}\` SET
              amount = ?,
              total_amount = ?,
              remaining_amount = 0,
              payment_type = 'full',
              status = 'paid',
              link_status = 'used',
              reference = ?,
              paypal_order_id = ?,
              paid_at = CURDATE()
            WHERE id = ?`,
            [newTotalPaid, finalTotal, updatedRef, orderID, insertedId]
          );

          // If from website, update existing lead without creating duplicate row
          if (!isPaymentLink && effectiveClientEmail) {
            await pool.query(
              `UPDATE contact_enquiries 
               SET status = 'closed',
                   message = CONCAT(COALESCE(message, ''), ' | Balance of $', ?, ' USD fully paid via PayPal (Ref: ', ?, ')')
               WHERE email = ? ORDER BY id DESC LIMIT 1`,
              [capturedAmount.toFixed(2), captureID, effectiveClientEmail]
            ).catch(() => {});
          }
        } else {
          // First payment on this record (e.g. initial payment via Payment Link)
          if (paymentStatus === "failed") {
            const failNote = `[PAYMENT FAILED / DECLINED]: ${failureReason}${notes ? ` | Note: ${notes}` : ""}`;
            await pool.query(
              `UPDATE \`${targetTable}\` SET
                status = 'failed',
                notes = CONCAT(COALESCE(notes, ''), ' | ', ?)
              WHERE id = ?`,
              [failNote, insertedId]
            );
          } else {
            isPartial = isPartialParam;
            finalRemaining = isPartial ? Math.max(0, finalTotal - capturedAmount) : 0;
            const linkStatus = isPartial ? "active" : "used";
            const currentStatus = isPartial ? "partially_paid" : paymentStatus;

            await pool.query(
              `UPDATE \`${targetTable}\` SET
                amount = ?,
                total_amount = ?,
                remaining_amount = ?,
                payment_type = ?,
                status = ?,
                link_status = ?,
                reference = ?,
                paypal_order_id = ?,
                method = 'PayPal',
                paid_at = CURDATE()
              WHERE id = ?`,
              [
                capturedAmount,
                finalTotal,
                finalRemaining,
                isPartial ? "partial" : "full",
                currentStatus,
                linkStatus,
                captureID,
                orderID,
                insertedId,
              ]
            );
          }
        }
      } else {
        // NO EXISTING RECORD: Create new website checkout payment record
        let paymentDesc = "";
        if (paymentStatus === "failed") {
          paymentDesc = `Payment Failed (${isPartial ? "Partial Deposit" : "Full Payment"}) - ${service || ""} (${categoryStr || ""})`.trim();
        } else if (paymentStatus === "pending") {
          paymentDesc = `Website Payment Pending (${isPartial ? "Partial Deposit" : "Full Payment"}) - ${service || ""} (${categoryStr || ""})`.trim();
        } else {
          paymentDesc = `Website PayPal Payment (${isPartial ? "Partial Deposit" : "Full Payment"}) - ${service || ""} (${categoryStr || ""})`.trim();
        }

        // keep within the column even on a database that hasn't been updated yet
        if (paymentDesc.length > 255) paymentDesc = `${paymentDesc.slice(0, 252)}...`;

        const paymentNotes =
          paymentStatus === "failed"
            ? `[PAYMENT FAILED / DECLINED]: ${failureReason}${notes ? ` | Client Note: ${notes}` : ""}`
            : paymentStatus === "pending"
            ? `[PAYMENT PENDING CLEARING]: ${pendingReason}${notes ? ` | Client Note: ${notes}` : ""}`
            : notes || null;

        let balanceDueDate: string | null = null;
        if (isPartial) {
          if (billingEndDate) {
            const d = new Date(billingEndDate);
            if (!isNaN(d.getTime())) {
              d.setDate(d.getDate() - 10);
              balanceDueDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            }
          }
          if (!balanceDueDate) {
            const now = new Date();
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            lastDay.setDate(lastDay.getDate() - 10);
            balanceDueDate = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
          }
        }
        const persistentToken = isPartial ? randomBytes(16).toString("hex") : null;
        const initialLinkStatus = isPartial ? "active" : "used";

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
            link_status,
            source,
            reference,
            paypal_order_id,
            billing_start_date,
            billing_end_date,
            balance_due_date,
            token,
            paid_at,
            notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PayPal', ?, ?, 'website', ?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
          [
            effectiveClientName,
            effectiveClientEmail || null,
            effectiveClientPhone || null,
            effectiveCompany || null,
            effectiveCategory || null,
            effectiveService,
            paymentDesc,
            capturedAmount,
            finalTotal,
            isPartial ? "partial" : "full",
            finalRemaining,
            currency,
            paymentStatus,
            initialLinkStatus,
            captureID,
            orderID,
            billingStartDate || null,
            billingEndDate || null,
            balanceDueDate,
            persistentToken,
            paymentNotes,
          ]
        );
        insertedId = (insertRes as any).insertId || 0;

        const currentYear = new Date().getFullYear();
        orderNumber = `QS-${currentYear}-${String(insertedId).padStart(6, "0")}`;
        await pool.query(`UPDATE payments SET invoice_number = ? WHERE id = ?`, [orderNumber, insertedId]);

        // Save customer into CRM enquiries so they appear in Leads — only for the
        // website's own Pay Now checkout. A payment link (token / invoice given)
        // never creates an enquiry, even if its record could not be found.
        const fromPaymentLink = Boolean(token || invoiceNumber || existingPaymentId);
        const leadStatus = paymentStatus === "failed" ? "contacted" : paymentStatus === "pending" ? "new" : "closed";
        const leadMsg =
          paymentStatus === "failed"
            ? `[PAYMENT FAILED]: Order #${orderNumber}. Attempted: $${capturedAmount.toFixed(2)} USD. Failure reason: ${failureReason}. Client phone: ${effectiveClientPhone || "None"}.`
            : paymentStatus === "pending"
            ? `[PAYMENT PENDING]: Order #${orderNumber}. Amount: $${capturedAmount.toFixed(2)} USD (Pending clearing in PayPal). Reason: ${pendingReason}.`
            : `Website Pay Now Payment. Order #${orderNumber}. PayPal Capture ID: ${captureID}. Total Amount: $${finalTotal.toFixed(2)}, Paid: $${capturedAmount.toFixed(2)}${isPartial ? `, Due: $${finalRemaining.toFixed(2)}` : ""}. Notes: ${notes || "None"}`;

        const leadInsert = fromPaymentLink ? null : await pool.query(
          `INSERT INTO contact_enquiries (
            full_name,
            email,
            phone,
            company_name,
            industry,
            project_type,
            budget,
            message,
            status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            effectiveClientName,
            effectiveClientEmail || "customer@payment.quickupp.com",
            effectiveClientPhone || null,
            effectiveCompany || null,
            "Other",
            `${effectiveService}${effectiveCategory ? ` – ${effectiveCategory}` : ""}`,
            `$${capturedAmount.toFixed(2)} USD (${isPartial ? "Partial Deposit" : "Full Payment"})`,
            leadMsg,
            leadStatus,
          ]
        );
        const leadId = leadInsert ? Number((leadInsert[0] as { insertId?: number }).insertId || 0) : 0;
        if (leadId) {
          await logActivity({
            entity: "lead",
            source: "contact",
            id: leadId,
            action: "created",
            text: `New enquiry received from Website Pay Now checkout (order ${orderNumber})`,
            actor: { type: "website", label: "Website Pay Now" },
            eventKey: `paypal:${captureID}:newlead`,
          });
        }
      }

      if (insertedId) {
        await logGatewayResult({
          table: (existingRecord ? targetTable : "payments") as PaymentTable,
          id: insertedId,
          before: beforeSnap,
          status: paymentStatus,
          amount: capturedAmount,
          captureId: String(captureID),
          orderId: String(orderID),
          orderNumber,
          isNewWebsitePayment: !existingRecord,
          isBalancePayment,
          reason: failureReason || pendingReason || undefined,
        });
      }
    } catch (dbErr) {
      console.error("[Database Save / Update Payment Error]", dbErr);
    }

    // 3. Dispatch emails asynchronously via after()
    after(async () => {
      // Admin Notification Email
      try {
        let adminSubject = "";
        let headerColor = "#0f172a";
        let statusTag = "PAYMENT RECEIVED";

        if (paymentStatus === "failed") {
          adminSubject = `⚠️ Failed Payment Attempt: $${capturedAmount.toFixed(2)} USD from ${effectiveClientName} (#${orderNumber})`;
          headerColor = "#991b1b";
          statusTag = "PAYMENT FAILED / DECLINED";
        } else if (paymentStatus === "pending") {
          adminSubject = `⏳ Payment Pending Clearing: $${capturedAmount.toFixed(2)} USD from ${effectiveClientName} (#${orderNumber})`;
          headerColor = "#d97706";
          statusTag = "PAYMENT PENDING CLEARING";
        } else {
          const typeLabel = isBalancePayment ? "Balance Payment" : isPartial ? "Partial Payment (Deposit)" : "Full Payment";
          adminSubject = `${typeLabel} Received: $${capturedAmount.toFixed(2)} USD from ${effectiveClientName} (#${orderNumber})`;
          headerColor = "#065f46";
          statusTag = "PAYMENT CONFIRMED";
        }

        const adminHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="background: ${headerColor}; padding: 18px 24px; border-radius: 8px; margin-bottom: 24px;">
              <h2 style="color: #ffffff; margin: 0; font-size: 20px;">${statusTag}</h2>
              <p style="color: #cbd5e1; margin: 4px 0 0; font-size: 13px;">Quickupp Softech LLC ${isPaymentLink ? "Payment Link Checkout" : "Online Checkout"}</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #64748b; width: 40%;">Order / Invoice No:</td><td style="padding: 8px 0; font-weight: bold; color: #0f172a; font-family: monospace;">${orderNumber}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Status:</td><td style="padding: 8px 0; font-weight: bold; color: ${paymentStatus === "failed" ? "#dc2626" : paymentStatus === "pending" ? "#d97706" : "#10b981"};">${paymentStatus.toUpperCase()}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Amount:</td><td style="padding: 8px 0; font-weight: bold; color: ${paymentStatus === "failed" ? "#dc2626" : "#10b981"}; font-size: 18px;">$${capturedAmount.toFixed(2)} ${currency}</td></tr>
              ${isPartial ? `<tr><td style="padding: 8px 0; color: #64748b;">Total Service Amount:</td><td style="padding: 8px 0; font-weight: 600; color: #0f172a;">$${finalTotal.toFixed(2)} ${currency}</td></tr>` : ""}
              ${isPartial ? `<tr><td style="padding: 8px 0; color: #64748b;">Remaining Balance Due:</td><td style="padding: 8px 0; font-weight: bold; color: #ef4444;">$${finalRemaining.toFixed(2)} ${currency}</td></tr>` : ""}
              <tr><td style="padding: 8px 0; color: #64748b;">Client Name:</td><td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${effectiveClientName}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Client Email:</td><td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${effectiveClientEmail}">${effectiveClientEmail}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Client Phone:</td><td style="padding: 8px 0; color: #0f172a;"><a href="tel:${effectiveClientPhone}">${effectiveClientPhone}</a></td></tr>
              ${effectiveCompany ? `<tr><td style="padding: 8px 0; color: #64748b;">Company:</td><td style="padding: 8px 0; color: #0f172a;">${effectiveCompany}</td></tr>` : ""}
              ${effectiveCategory ? `<tr><td style="padding: 8px 0; color: #64748b;">Category:</td><td style="padding: 8px 0; color: #0f172a;">${effectiveCategory}</td></tr>` : ""}
              ${effectiveService ? `<tr><td style="padding: 8px 0; color: #64748b;">Service:</td><td style="padding: 8px 0; color: #0f172a;">${effectiveService}</td></tr>` : ""}
              ${billingStartDate || billingEndDate ? `<tr><td style="padding: 8px 0; color: #64748b;">Billing Period:</td><td style="padding: 8px 0; color: #0f172a;">${billingStartDate || "—"} to ${billingEndDate || "—"}</td></tr>` : ""}
              <tr><td style="padding: 8px 0; color: #64748b;">Transaction / Order ID:</td><td style="padding: 8px 0; color: #0f172a; font-family: monospace;">${captureID}</td></tr>
              ${paymentStatus === "failed" ? `<tr><td style="padding: 8px 0; color: #dc2626; font-weight: bold;">Failure Reason:</td><td style="padding: 8px 0; color: #dc2626;">${failureReason}</td></tr>` : ""}
              ${notes ? `<tr><td style="padding: 8px 0; color: #64748b;">Notes:</td><td style="padding: 8px 0; color: #0f172a;">${notes}</td></tr>` : ""}
            </table>
            
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
              This payment record has been automatically logged into the CRM Payments database.
            </div>
          </div>
        `;

        await sendMail({
          channel: "info",
          to: LEADS_NOTIFICATION_EMAIL,
          subject: adminSubject,
          html: adminHtml,
          text: `${adminSubject} - ${effectiveClientName} (${effectiveClientEmail}, ${effectiveClientPhone}) for ${effectiveService || effectiveCategory || "service"}. Order Number: ${orderNumber}. Reference: ${captureID}`,
          replyTo: effectiveClientEmail || undefined,
        });
      } catch (mailErr) {
        console.error("[Payment Notification Email Error]", mailErr);
      }

      // Customer Confirmation & Receipt Email (for paid or pending)
      if (paymentStatus !== "failed" && effectiveClientEmail && effectiveClientEmail.includes("@")) {
        try {
          const firstName = effectiveClientName.trim().split(" ")[0] || "Valued Client";
          const clientSubject = paymentStatus === "pending"
            ? `Payment Processing (Pending Clearing) — Quickupp Softech LLC | Order #${orderNumber}`
            : `Payment Confirmed — Quickupp Softech LLC | Order #${orderNumber}`;

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
            clientName: effectiveClientName,
            clientEmail: effectiveClientEmail,
            clientPhone: effectiveClientPhone,
            companyName: effectiveCompany,
            service: effectiveService,
            category: effectiveCategory,
            amountPaid: capturedAmount,
            totalAmount: finalTotal,
            paymentType: isPartial ? "partial" : "full",
            paymentStatus: paymentStatus === "pending" ? "pending" : isPartial ? "partially_paid" : "paid",
            remainingAmount: finalRemaining,
            transactionId: captureID,
            paymentDate: paymentDateFormatted,
            paymentTime: paymentTimeFormatted,
            billingPeriod: billingCoverageStr,
          });

          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.quickuppsoftech.us";
          const receiptDownloadUrl = `${siteUrl}/api/payments/receipt?order=${encodeURIComponent(orderNumber)}`;

          const statusBannerTitle = paymentStatus === "pending" ? "PAYMENT PROCESSING (PENDING)" : "PAYMENT CONFIRMED";
          const statusBannerValue = paymentStatus === "pending"
            ? "Status: PENDING CLEARING ⏳"
            : isPartial
            ? "Status: PARTIALLY PAID ✓"
            : "Status: PAID ✓";

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
                    ${paymentStatus === "pending"
                      ? "Your payment is currently being cleared by PayPal. Once clearance completes, your confirmation will finalize automatically."
                      : "We're pleased to confirm that your payment has been successfully received."}
                  </p>

                  <!-- Payment Status Banner -->
                  <div style="background: ${paymentStatus === "pending" ? "#fffbeb" : "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"}; border: 1px solid ${paymentStatus === "pending" ? "#fde68a" : "#a7f3d0"}; border-radius: 12px; padding: 18px 24px; margin-bottom: 28px; text-align: center;">
                    <span style="font-size: 12px; font-weight: 800; letter-spacing: 0.1em; color: ${paymentStatus === "pending" ? "#b45309" : "#047857"}; text-transform: uppercase; display: block; margin-bottom: 4px;">${statusBannerTitle}</span>
                    <span style="font-size: 20px; font-weight: 800; color: ${paymentStatus === "pending" ? "#92400e" : "#065f46"};">${statusBannerValue}</span>
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
                      <td style="padding: 9px 0; color: #64748b;">${paymentStatus === "pending" ? "Amount (Pending Clearing)" : "Amount Paid"}</td>
                      <td style="padding: 9px 0; font-weight: 800; color: ${paymentStatus === "pending" ? "#b45309" : "#10b981"}; font-size: 16px;">$${capturedAmount.toFixed(2)} ${currency}</td>
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
                      📎 Your official payment receipt is attached to this email as a PDF.
                    </p>
                    <a href="${receiptDownloadUrl}" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; font-size: 13.5px; font-weight: 700; padding: 12px 28px; border-radius: 8px; letter-spacing: 0.02em;">
                      DOWNLOAD PAYMENT RECEIPT
                    </a>
                  </div>

                  <!-- Support -->
                  <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
                    If you have any questions or require custom onboarding, simply reply to this email or contact us at:<br />
                    <strong>Quickupp Softech LLC</strong><br />
                    Email: <a href="mailto:info@quickuppsoftech.us" style="color: #4f46e5; text-decoration: none;">info@quickuppsoftech.us</a><br />
                    Website: <a href="https://www.quickuppsoftech.us/" style="color: #4f46e5; text-decoration: none;">www.quickuppsoftech.us</a>
                  </p>

                  <p style="font-size: 14.5px; color: #1e293b; line-height: 1.5; margin: 0;">
                    Best regards,<br />
                    <strong>Quickupp Softech LLC</strong><br />
                    <span style="font-size: 12px; color: #64748b;">8 The Green, Suite A, Dover, Delaware - 19901, USA</span>
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
            channel: "info",
            to: effectiveClientEmail,
            fromName: "Quickupp Softech LLC",
            subject: clientSubject,
            html: clientHtml,
            text: `${clientSubject}\n\nHi ${firstName},\n\nThank you for choosing Quickupp Softech LLC. Order Number: ${orderNumber}. Amount: $${capturedAmount.toFixed(2)} ${currency}. Status: ${statusBannerValue}. Download receipt: ${receiptDownloadUrl}\n\nQuickupp Softech LLC`,
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

    // 4. Return API response
    if (paymentStatus === "failed") {
      return NextResponse.json({
        success: false,
        status: "failed",
        orderNumber,
        error: failureReason || "Payment was declined or could not be processed. Please check your card details or try a different payment method.",
      });
    }

    return NextResponse.json({
      success: true,
      status: paymentStatus,
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
    console.error("[Capture Order API Fatal Error]", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred while capturing payment." },
      { status: 500 }
    );
  }
}
