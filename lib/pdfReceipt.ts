/**
 * Pure JavaScript PDF generator for Quickupp Softech LLC payment receipts.
 * Produces standard PDF 1.4 documents without native binary dependencies.
 */

export interface ReceiptData {
  orderNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  companyName?: string | null;
  service: string;
  category?: string | null;
  amountPaid: number;
  totalAmount?: number | null;
  paymentType?: "full" | "partial";
  remainingAmount?: number | null;
  transactionId: string;
  paymentDate: string;
  paymentTime: string;
  billingPeriod?: string | null;
}

export function generateReceiptPdf(data: ReceiptData): Buffer {
  const {
    orderNumber,
    clientName,
    clientEmail,
    clientPhone,
    companyName,
    service,
    category,
    amountPaid,
    totalAmount,
    paymentType = "full",
    remainingAmount = 0,
    transactionId,
    paymentDate,
    paymentTime,
    billingPeriod,
  } = data;

  const esc = (s: unknown) =>
    String(s ?? "")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");

  const streamOps: string[] = [];

  // Header background rectangle
  streamOps.push("0.05 0.07 0.12 rg"); // dark slate fill
  streamOps.push("0 710 612 82 re f");

  // Header Brand Name
  streamOps.push("BT");
  streamOps.push("/F2 18 Tf");
  streamOps.push("1 1 1 rg");
  streamOps.push("50 750 Td");
  streamOps.push(`(${esc("QUICKUPP SOFTECH LLC")}) Tj`);
  streamOps.push("ET");

  streamOps.push("BT");
  streamOps.push("/F1 10 Tf");
  streamOps.push("0.65 0.8 0.98 rg");
  streamOps.push("50 732 Td");
  streamOps.push(`(${esc("Official Order Confirmation & Payment Receipt")}) Tj`);
  streamOps.push("ET");

  // Status badge in header
  streamOps.push("BT");
  streamOps.push("/F2 12 Tf");
  streamOps.push(paymentType === "partial" ? "0.95 0.7 0.1 rg" : "0.2 0.85 0.5 rg");
  streamOps.push("440 745 Td");
  streamOps.push(`(${esc(paymentType === "partial" ? "PARTIALLY PAID" : "PAID")}) Tj`);
  streamOps.push("ET");

  // Section 1: Order Details Box
  streamOps.push("0.96 0.97 0.99 rg");
  streamOps.push("0.85 0.88 0.92 RG");
  streamOps.push("1 w");
  streamOps.push("50 535 512 150 re b");

  streamOps.push("BT");
  streamOps.push("/F2 11 Tf");
  streamOps.push("0.1 0.15 0.25 rg");
  streamOps.push("68 662 Td");
  streamOps.push(`(${esc("ORDER & TRANSACTION DETAILS")}) Tj`);
  streamOps.push("ET");

  const orderRows: [string, string][] = [
    ["Order / Invoice No:", orderNumber],
    ["Payment Date & Time:", `${paymentDate} at ${paymentTime}`],
    ["Payment Method:", "PayPal (Verified Checkout)"],
    ["Transaction ID:", transactionId],
    ["Service Name:", service],
    ["Service Category:", category || "Information Technology & Digital Marketing"],
    ["Billing Coverage:", billingPeriod || "Active Project Retainer"],
  ];

  let curY = 642;
  for (const [k, v] of orderRows) {
    streamOps.push("BT");
    streamOps.push("/F2 9 Tf");
    streamOps.push("0.35 0.4 0.5 rg");
    streamOps.push(`68 ${curY} Td`);
    streamOps.push(`(${esc(k)}) Tj`);
    streamOps.push("ET");

    streamOps.push("BT");
    streamOps.push("/F1 9 Tf");
    streamOps.push("0.1 0.1 0.15 rg");
    streamOps.push(`210 ${curY} Td`);
    streamOps.push(`(${esc(v)}) Tj`);
    streamOps.push("ET");

    curY -= 15;
  }

  // Section 2: Customer & Billing Details
  streamOps.push("0.98 0.98 0.99 rg");
  streamOps.push("0.85 0.88 0.92 RG");
  streamOps.push("50 415 512 105 re b");

  streamOps.push("BT");
  streamOps.push("/F2 11 Tf");
  streamOps.push("0.1 0.15 0.25 rg");
  streamOps.push("68 500 Td");
  streamOps.push(`(${esc("CUSTOMER & BILLING INFORMATION")}) Tj`);
  streamOps.push("ET");

  const custRows: [string, string][] = [
    ["Customer Name:", clientName],
    ["Customer Email:", clientEmail],
    ["Phone Number:", clientPhone || "—"],
    companyName ? ["Company Name:", companyName] : null,
  ].filter(Boolean) as [string, string][];

  curY = 480;
  for (const [k, v] of custRows) {
    streamOps.push("BT");
    streamOps.push("/F2 9 Tf");
    streamOps.push("0.35 0.4 0.5 rg");
    streamOps.push(`68 ${curY} Td`);
    streamOps.push(`(${esc(k)}) Tj`);
    streamOps.push("ET");

    streamOps.push("BT");
    streamOps.push("/F1 9 Tf");
    streamOps.push("0.1 0.1 0.15 rg");
    streamOps.push(`210 ${curY} Td`);
    streamOps.push(`(${esc(v)}) Tj`);
    streamOps.push("ET");

    curY -= 15;
  }

  // Section 3: Financial Summary Box
  streamOps.push("0.95 0.97 1.0 rg");
  streamOps.push("0.8 0.85 0.95 RG");
  streamOps.push("50 295 512 105 re b");

  streamOps.push("BT");
  streamOps.push("/F2 11 Tf");
  streamOps.push("0.1 0.15 0.25 rg");
  streamOps.push("68 380 Td");
  streamOps.push(`(${esc("FINANCIAL SUMMARY (USD)")}) Tj`);
  streamOps.push("ET");

  const isPartial = paymentType === "partial";
  const finRows: [string, string][] = [
    ["Payment Type:", isPartial ? "Partial Payment (Deposit / Milestone)" : "Full Payment (100%)"],
    isPartial ? ["Total Service / Invoice Amount:", `$${Number(totalAmount || amountPaid).toFixed(2)} USD`] : null,
    ["Amount Paid Now (PayPal):", `$${Number(amountPaid).toFixed(2)} USD`],
    isPartial ? ["Remaining Balance Due:", `$${Number(remainingAmount).toFixed(2)} USD`] : null,
  ].filter(Boolean) as [string, string][];

  curY = 360;
  for (const [k, v] of finRows) {
    streamOps.push("BT");
    streamOps.push("/F2 9 Tf");
    streamOps.push("0.35 0.4 0.5 rg");
    streamOps.push(`68 ${curY} Td`);
    streamOps.push(`(${esc(k)}) Tj`);
    streamOps.push("ET");

    streamOps.push("BT");
    streamOps.push(k.includes("Paid Now") ? "/F2 10 Tf" : "/F1 9 Tf");
    streamOps.push(
      k.includes("Paid Now")
        ? "0.05 0.6 0.3 rg"
        : k.includes("Remaining")
          ? "0.8 0.1 0.1 rg"
          : "0.1 0.1 0.15 rg"
    );
    streamOps.push(`240 ${curY} Td`);
    streamOps.push(`(${esc(v)}) Tj`);
    streamOps.push("ET");

    curY -= 16;
  }

  // Section 4: What Happens Next & Footer
  streamOps.push("BT");
  streamOps.push("/F2 10 Tf");
  streamOps.push("0.1 0.15 0.25 rg");
  streamOps.push("50 240 Td");
  streamOps.push(`(${esc("What Happens Next?")}) Tj`);
  streamOps.push("ET");

  streamOps.push("BT");
  streamOps.push("/F1 8.5 Tf");
  streamOps.push("0.35 0.4 0.5 rg");
  streamOps.push("50 225 Td");
  streamOps.push(
    `(${esc("Our team will review your order and contact you with next steps.")}) Tj`
  );
  streamOps.push("ET");

  streamOps.push("BT");
  streamOps.push("/F1 8.5 Tf");
  streamOps.push("0.35 0.4 0.5 rg");
  streamOps.push("50 210 Td");
  streamOps.push(
    `(${esc("Please keep your Order Number handy when communicating with our team: " + orderNumber)}) Tj`
  );
  streamOps.push("ET");

  // Separator Line
  streamOps.push("0.85 0.88 0.92 RG");
  streamOps.push("50 180 m 562 180 l S");

  // Footer Branding
  streamOps.push("BT");
  streamOps.push("/F1 8 Tf");
  streamOps.push("0.5 0.55 0.6 rg");
  streamOps.push("50 160 Td");
  streamOps.push(
    `(${esc("Quickupp Softech LLC • Support: info@quickuppsoftech.us • Website: https://quickupp.com")}) Tj`
  );
  streamOps.push("ET");

  streamOps.push("BT");
  streamOps.push("/F1 7.5 Tf");
  streamOps.push("0.6 0.65 0.7 rg");
  streamOps.push("50 145 Td");
  streamOps.push(
    `(${esc("This is an official electronically generated payment receipt. Operated by Quickupp Softech LLC.")}) Tj`
  );
  streamOps.push("ET");

  const streamContent = streamOps.join("\n");
  const streamLength = Buffer.byteLength(streamContent, "utf-8");

  // Standard PDF 1.4 Objects
  const objects: string[] = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj",
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj",
    `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`,
  ];

  let offset = 9; // length of "%PDF-1.4\n"
  const xrefOffsets = [0];
  let body = "%PDF-1.4\n";

  for (const obj of objects) {
    xrefOffsets.push(offset);
    body += obj + "\n";
    offset = Buffer.byteLength(body, "utf-8");
  }

  const startXref = offset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    xref += String(xrefOffsets[i]).padStart(10, "0") + " 00000 n \n";
  }

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
  const finalPdf = body + xref + trailer;

  return Buffer.from(finalPdf, "utf-8");
}
