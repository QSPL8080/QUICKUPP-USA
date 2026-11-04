import { PDFDocument, rgb, StandardFonts, PDFPage } from "pdf-lib";
import fs from "node:fs";
import path from "node:path";

export interface ReceiptData {
  orderNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  companyName?: string | null;
  billingAddress?: string | null;
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

/**
 * Format any date string into "16 October 2026"
 */
function formatReceiptDate(raw: string | undefined): string {
  if (!raw) {
    const d = new Date();
    return `${d.getDate()} ${d.toLocaleString("en-US", { month: "long" })} ${d.getFullYear()}`;
  }
  const parsed = new Date(raw);
  if (isNaN(parsed.getTime())) {
    return raw;
  }
  const day = parsed.getDate();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${day} ${months[parsed.getMonth()]} ${parsed.getFullYear()}`;
}

/**
 * Draw a clean rounded rectangle path in pdf-lib
 */
function drawRoundedRect(
  p: PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fillColor?: ReturnType<typeof rgb>,
  borderColor?: ReturnType<typeof rgb>,
  borderWidth = 1
) {
  const path =
    `M ${x + r} ${y} ` +
    `h ${w - 2 * r} ` +
    `a ${r} ${r} 0 0 1 ${r} ${r} ` +
    `v ${h - 2 * r} ` +
    `a ${r} ${r} 0 0 1 -${r} ${r} ` +
    `h -${w - 2 * r} ` +
    `a ${r} ${r} 0 0 1 -${r} -${r} ` +
    `v -${h - 2 * r} ` +
    `a ${r} ${r} 0 0 1 ${r} -${r} Z`;

  p.drawSvgPath(path, {
    color: fillColor,
    borderColor: borderColor,
    borderWidth: borderColor ? borderWidth : 0,
  });
}

/**
 * Draw a crisp vector checkmark that bypasses WinAnsi unicode limits
 */
function drawCheckmark(
  p: PDFPage,
  x: number,
  y: number,
  color: ReturnType<typeof rgb>,
  scale = 1
) {
  p.drawLine({
    start: { x: x, y: y + 2 * scale },
    end: { x: x + 3 * scale, y: y - 2 * scale },
    thickness: 1.5 * scale,
    color,
  });
  p.drawLine({
    start: { x: x + 3 * scale, y: y - 2 * scale },
    end: { x: x + 8 * scale, y: y + 5 * scale },
    thickness: 1.5 * scale,
    color,
  });
}

/**
 * Generate a production-grade PDF receipt matching the Quickupp Softech branding and layout.
 */
export async function generateReceiptPdf(data: ReceiptData): Promise<Buffer> {
  const {
    orderNumber,
    clientName,
    clientEmail,
    clientPhone,
    companyName,
    billingAddress,
    service,
    category,
    amountPaid,
    totalAmount,
    paymentType = "full",
    remainingAmount = 0,
    transactionId,
    paymentDate,
    paymentTime,
  } = data;

  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4 (595.28 x 841.89 pt)

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Palette matching design
  const primaryPurple = rgb(0.486, 0.227, 0.929); // #7c3aed
  const deepPurple = rgb(0.427, 0.161, 0.851);    // #6d28d9
  const darkNavy = rgb(0.06, 0.09, 0.16);         // #0f172a
  const slateDark = rgb(0.12, 0.16, 0.23);        // #1e293b
  const slateMid = rgb(0.28, 0.34, 0.42);         // #475569
  const borderLight = rgb(0.88, 0.91, 0.94);      // #e2e8f0
  const bgCard = rgb(0.97, 0.98, 0.99);           // #f8fafc
  const linkBlue = rgb(0.145, 0.388, 0.922);      // #2563eb
  const greenText = rgb(0.086, 0.502, 0.239);     // #15803d
  const greenBg = rgb(0.863, 0.980, 0.906);       // #dcfce7
  const amberText = rgb(0.706, 0.325, 0.035);     // #b45309
  const amberBg = rgb(0.996, 0.953, 0.780);       // #fef3c7
  const purpleRowBg = rgb(0.953, 0.914, 0.996);   // #f3e8ff
  const magentaBar = rgb(0.753, 0.149, 0.827);    // #c026d3

  const leftX = 40;
  const rightX = 555;
  const contentWidth = rightX - leftX; // 515

  const isPartial = paymentType === "partial";
  const finalTotal = totalAmount != null && Number(totalAmount) > 0 ? Number(totalAmount) : Number(amountPaid);
  const formattedDate = formatReceiptDate(paymentDate);

  // 1. Logo
  const logoPath = path.join(process.cwd(), "public", "images", "logo-black.png");
  if (fs.existsSync(logoPath)) {
    try {
      const pngBytes = fs.readFileSync(logoPath);
      const logo = await doc.embedPng(pngBytes);
      const logoScale = 0.095;
      const logoW = logo.width * logoScale;
      const logoH = logo.height * logoScale;
      page.drawImage(logo, {
        x: leftX,
        y: 775 - logoH,
        width: logoW,
        height: logoH,
      });
    } catch {
      // Fallback text if logo load fails
      page.drawText("QUICKUPP", {
        x: leftX,
        y: 755,
        size: 18,
        font: fontBold,
        color: deepPurple,
      });
    }
  } else {
    page.drawText("QUICKUPP", {
      x: leftX,
      y: 755,
      size: 18,
      font: fontBold,
      color: deepPurple,
    });
  }

  // Under Logo text - Official Company Details
  let curY = 724;
  page.drawText("Quickupp Softech LLC", {
    x: leftX,
    y: curY,
    size: 9.5,
    font: fontBold,
    color: darkNavy,
  });
  curY -= 12;
  page.drawText("8 The Green, Suite A, Dover, Delaware - 19901, USA", {
    x: leftX,
    y: curY,
    size: 8,
    font,
    color: slateMid,
  });
  curY -= 11;
  page.drawText("Phone: +1 (302) 754-5679", {
    x: leftX,
    y: curY,
    size: 8,
    font,
    color: slateMid,
  });
  curY -= 11;
  page.drawText("Email: ", { x: leftX, y: curY, size: 8.5, font, color: slateMid });
  page.drawText("info@quickuppsoftech.us", {
    x: leftX + 28,
    y: curY,
    size: 8.5,
    font,
    color: linkBlue,
  });
  curY -= 11;
  page.drawText("Website: ", { x: leftX, y: curY, size: 8.5, font, color: slateMid });
  page.drawText("https://www.quickuppsoftech.us/", {
    x: leftX + 38,
    y: curY,
    size: 8.5,
    font,
    color: linkBlue,
  });

  // Top Right Header
  const titleText = "PAYMENT RECEIPT";
  const titleW = fontBold.widthOfTextAtSize(titleText, 21);
  page.drawText(titleText, {
    x: rightX - titleW,
    y: 755,
    size: 21,
    font: fontBold,
    color: darkNavy,
  });

  const rcptText = `Receipt No: ${orderNumber}`;
  const rcptW = fontBold.widthOfTextAtSize(rcptText, 10);
  page.drawText(rcptText, {
    x: rightX - rcptW,
    y: 735,
    size: 10,
    font: fontBold,
    color: slateDark,
  });

  const dateText = `Date: ${formattedDate}`;
  const dateW = font.widthOfTextAtSize(dateText, 9.5);
  page.drawText(dateText, {
    x: rightX - dateW,
    y: 720,
    size: 9.5,
    font,
    color: slateMid,
  });

  // Pill Badge (PAID / PARTIALLY PAID)
  const badgeLabel = isPartial ? "PAYMENT: PARTIALLY PAID" : "PAYMENT: PAID";
  const badgeFontColor = isPartial ? amberText : greenText;
  const badgeBgColor = isPartial ? amberBg : greenBg;
  const badgeTextW = fontBold.widthOfTextAtSize(badgeLabel, 8.5);
  const pillW = badgeTextW + 36;
  const pillH = 20;
  const pillX = rightX - pillW;
  const pillY = 692;

  drawRoundedRect(page, pillX, pillY, pillW, pillH, 10, badgeBgColor, undefined);
  page.drawText(badgeLabel, {
    x: pillX + 12,
    y: pillY + 6,
    size: 8.5,
    font: fontBold,
    color: badgeFontColor,
  });
  drawCheckmark(page, pillX + 16 + badgeTextW, pillY + 9, badgeFontColor, 0.9);

  // Top Divider Line
  page.drawLine({
    start: { x: leftX, y: 668 },
    end: { x: rightX, y: 668 },
    thickness: 1,
    color: borderLight,
  });

  // BILL TO
  page.drawText("BILL TO", {
    x: leftX,
    y: 648,
    size: 11,
    font: fontBold,
    color: primaryPurple,
  });

  page.drawText("Customer Name: ", { x: leftX, y: 630, size: 9, font, color: slateMid });
  page.drawText(clientName || "Valued Client", {
    x: leftX + 80,
    y: 630,
    size: 9,
    font: fontBold,
    color: darkNavy,
  });

  page.drawText("Email: ", { x: leftX, y: 615, size: 9, font, color: slateMid });
  page.drawText(clientEmail || "info@quickuppsoftech.us", {
    x: leftX + 32,
    y: 615,
    size: 9,
    font,
    color: linkBlue,
  });

  const addressVal =
    billingAddress ||
    companyName ||
    (clientPhone ? `Phone: ${clientPhone}` : "United States");
  page.drawText("Billing Address: ", { x: leftX, y: 600, size: 9, font, color: slateMid });
  page.drawText(addressVal, {
    x: leftX + 74,
    y: 600,
    size: 9,
    font: fontBold,
    color: darkNavy,
  });

  // PAYMENT DETAILS
  page.drawText("PAYMENT DETAILS", {
    x: leftX,
    y: 575,
    size: 11,
    font: fontBold,
    color: primaryPurple,
  });

  // Table Card
  const tblX = leftX;
  const tblW = contentWidth;
  const tblH = isPartial ? 160 : 138;
  const tblY = isPartial ? 400 : 422;

  drawRoundedRect(page, tblX, tblY, tblW, tblH, 6, rgb(1, 1, 1), borderLight);

  // Table Header Row
  page.drawRectangle({
    x: tblX + 0.5,
    y: tblY + tblH - 26,
    width: tblW - 1,
    height: 25.5,
    color: rgb(0.95, 0.96, 0.98),
  });
  page.drawLine({
    start: { x: tblX, y: tblY + tblH - 26 },
    end: { x: tblX + tblW, y: tblY + tblH - 26 },
    thickness: 1,
    color: borderLight,
  });

  page.drawText("Description", {
    x: tblX + 16,
    y: tblY + tblH - 18,
    size: 9.5,
    font: fontBold,
    color: slateDark,
  });
  const amtHeader = "Amount (USD)";
  const amtHW = fontBold.widthOfTextAtSize(amtHeader, 9.5);
  page.drawText(amtHeader, {
    x: tblX + tblW - 20 - amtHW,
    y: tblY + tblH - 18,
    size: 9.5,
    font: fontBold,
    color: slateDark,
  });

  // Line item row
  const itemDesc = `${service}${category ? ` – ${category}` : ""}`;
  const truncatedDesc =
    itemDesc.length > 75 ? `${itemDesc.substring(0, 72)}...` : itemDesc;
  const itemY = tblY + tblH - 52;

  page.drawText(truncatedDesc, {
    x: tblX + 16,
    y: itemY,
    size: 9.5,
    font: fontBold,
    color: darkNavy,
  });
  const totalStr = `$${finalTotal.toFixed(2)}`;
  const totalStrW = fontBold.widthOfTextAtSize(totalStr, 9.5);
  page.drawText(totalStr, {
    x: tblX + tblW - 20 - totalStrW,
    y: itemY,
    size: 9.5,
    font: fontBold,
    color: darkNavy,
  });

  // Table summary separator
  page.drawLine({
    start: { x: tblX, y: tblY + (isPartial ? 86 : 64) },
    end: { x: tblX + tblW, y: tblY + (isPartial ? 86 : 64) },
    thickness: 1,
    color: borderLight,
  });

  // Summary lines
  if (isPartial) {
    // Row 1: Order Total
    page.drawText("Order Total:", {
      x: tblX + 270,
      y: tblY + 68,
      size: 9,
      font,
      color: slateMid,
    });
    const otW = fontBold.widthOfTextAtSize(totalStr, 9);
    page.drawText(totalStr, {
      x: tblX + tblW - 20 - otW,
      y: tblY + 68,
      size: 9,
      font: fontBold,
      color: darkNavy,
    });

    // Row 2: Amount Paid Now (Deposit)
    const paidDepositStr = `$${Number(amountPaid).toFixed(2)}`;
    page.drawText("Amount Paid Now (Deposit):", {
      x: tblX + 225,
      y: tblY + 52,
      size: 9,
      font,
      color: slateMid,
    });
    const pdW = fontBold.widthOfTextAtSize(paidDepositStr, 9);
    page.drawText(paidDepositStr, {
      x: tblX + tblW - 20 - pdW,
      y: tblY + 52,
      size: 9,
      font: fontBold,
      color: greenText,
    });

    // Row 3: Remaining Balance Due
    const remStr = `$${Number(remainingAmount).toFixed(2)}`;
    page.drawText("Remaining Balance Due:", {
      x: tblX + 233,
      y: tblY + 36,
      size: 9,
      font,
      color: slateMid,
    });
    const remW = fontBold.widthOfTextAtSize(remStr, 9);
    page.drawText(remStr, {
      x: tblX + tblW - 20 - remW,
      y: tblY + 36,
      size: 9,
      font: fontBold,
      color: rgb(0.85, 0.15, 0.15),
    });
  } else {
    // Single summary: Order Total
    page.drawText("Order Total:", {
      x: tblX + 280,
      y: tblY + 45,
      size: 9,
      font,
      color: slateMid,
    });
    const otW = fontBold.widthOfTextAtSize(totalStr, 9);
    page.drawText(totalStr, {
      x: tblX + tblW - 20 - otW,
      y: tblY + 45,
      size: 9,
      font: fontBold,
      color: darkNavy,
    });
  }

  // Highlighted Total Row at bottom of table
  page.drawRectangle({
    x: tblX + 0.5,
    y: tblY + 0.5,
    width: tblW - 1,
    height: 31.5,
    color: purpleRowBg,
  });
  page.drawLine({
    start: { x: tblX, y: tblY + 32 },
    end: { x: tblX + tblW, y: tblY + 32 },
    thickness: 1,
    color: borderLight,
  });

  const totPaidLabel = isPartial
    ? "Total Paid (Partial Deposit):"
    : "Total Paid (Fully Paid):";
  page.drawText(totPaidLabel, {
    x: tblX + (isPartial ? 150 : 175),
    y: tblY + 11,
    size: 10.5,
    font: fontBold,
    color: deepPurple,
  });
  const finalValStr = `$${Number(amountPaid).toFixed(2)} USD`;
  const finalValW = fontBold.widthOfTextAtSize(finalValStr, 10.5);
  page.drawText(finalValStr, {
    x: tblX + tblW - 20 - finalValW,
    y: tblY + 11,
    size: 10.5,
    font: fontBold,
    color: deepPurple,
  });

  // PAYMENT INFORMATION Card
  const infoH = 82;
  const infoY = tblY - infoH - 24;
  drawRoundedRect(page, leftX, infoY, contentWidth, infoH, 6, bgCard, borderLight);

  page.drawText("PAYMENT INFORMATION", {
    x: leftX + 16,
    y: infoY + infoH - 20,
    size: 10,
    font: fontBold,
    color: slateDark,
  });

  // Left column
  page.drawText("Payment Method: ", {
    x: leftX + 16,
    y: infoY + infoH - 39,
    size: 9,
    font,
    color: slateMid,
  });
  page.drawText("PayPal", {
    x: leftX + 100,
    y: infoY + infoH - 39,
    size: 9,
    font: fontBold,
    color: darkNavy,
  });

  page.drawText("Transaction ID: ", {
    x: leftX + 16,
    y: infoY + infoH - 55,
    size: 9,
    font,
    color: slateMid,
  });
  const txShort =
    transactionId.length > 24
      ? `${transactionId.substring(0, 22)}...`
      : transactionId || "N/A";
  page.drawText(txShort, {
    x: leftX + 90,
    y: infoY + infoH - 55,
    size: 9,
    font: fontBold,
    color: darkNavy,
  });

  page.drawText("Payment Status: ", {
    x: leftX + 16,
    y: infoY + infoH - 71,
    size: 9,
    font,
    color: slateMid,
  });
  const statusStr = isPartial ? "PARTIALLY PAID" : "PAID";
  const statusColor = isPartial ? amberText : greenText;
  page.drawText(statusStr, {
    x: leftX + 90,
    y: infoY + infoH - 71,
    size: 9,
    font: fontBold,
    color: statusColor,
  });
  const statusTextW = fontBold.widthOfTextAtSize(statusStr, 9);
  drawCheckmark(page, leftX + 94 + statusTextW, infoY + infoH - 69, statusColor, 0.85);

  // Right column
  page.drawText("Payment Date: ", {
    x: leftX + 270,
    y: infoY + infoH - 39,
    size: 9,
    font,
    color: slateMid,
  });
  page.drawText(formattedDate, {
    x: leftX + 342,
    y: infoY + infoH - 39,
    size: 9,
    font: fontBold,
    color: darkNavy,
  });

  page.drawText("Payment Time: ", {
    x: leftX + 270,
    y: infoY + infoH - 55,
    size: 9,
    font,
    color: slateMid,
  });
  page.drawText(paymentTime || "EST", {
    x: leftX + 342,
    y: infoY + infoH - 55,
    size: 9,
    font: fontBold,
    color: darkNavy,
  });

  page.drawText("Payment Type: ", {
    x: leftX + 270,
    y: infoY + infoH - 71,
    size: 9,
    font,
    color: slateMid,
  });
  const typeDisplay = isPartial ? "Advance Deposit" : "Full Payment";
  page.drawText(typeDisplay, {
    x: leftX + 342,
    y: infoY + infoH - 71,
    size: 9,
    font: fontBold,
    color: darkNavy,
  });

  // THANK YOU FOR YOUR PURCHASE
  let tyY = infoY - 24;
  page.drawText("THANK YOU FOR YOUR PURCHASE", {
    x: leftX,
    y: tyY,
    size: 13,
    font: fontBold,
    color: darkNavy,
  });
  tyY -= 17;
  page.drawText("Your payment has been successfully received.", {
    x: leftX,
    y: tyY,
    size: 9,
    font,
    color: slateMid,
  });
  tyY -= 16;
  const thankOrderText = isPartial
    ? `Your order ${orderNumber} deposit has been received. Thank you!`
    : `Your order ${orderNumber} is now fully paid. Thank you!`;
  page.drawText(thankOrderText, {
    x: leftX,
    y: tyY,
    size: 9.5,
    font: fontBold,
    color: greenText,
  });

  // Divider Line
  const divY = tyY - 18;
  page.drawLine({
    start: { x: leftX, y: divY },
    end: { x: rightX, y: divY },
    thickness: 1,
    color: borderLight,
  });

  // Support / Questions
  let supY = divY - 20;
  page.drawText("For questions regarding your order or payment:", {
    x: leftX,
    y: supY,
    size: 8.5,
    font: fontBold,
    color: slateDark,
  });
  supY -= 16;
  page.drawText("Quickupp Softech LLC", {
    x: leftX,
    y: supY,
    size: 10.5,
    font: fontBold,
    color: primaryPurple,
  });
  supY -= 14;
  page.drawText("Email: ", { x: leftX, y: supY, size: 8.5, font, color: slateMid });
  page.drawText("info@quickuppsoftech.us", {
    x: leftX + 28,
    y: supY,
    size: 8.5,
    font,
    color: linkBlue,
  });
  supY -= 13;
  page.drawText("Website: ", { x: leftX, y: supY, size: 8.5, font, color: slateMid });
  page.drawText("https://www.quickuppsoftech.us/", {
    x: leftX + 38,
    y: supY,
    size: 8.5,
    font,
    color: linkBlue,
  });

  // Fine print
  const finePrint =
    "This document serves as your official payment receipt for the transaction described above. Operated by Quickupp Softech LLC.";
  page.drawText(finePrint, {
    x: leftX,
    y: 42,
    size: 7.5,
    font,
    color: rgb(0.55, 0.6, 0.68),
  });

  // Bottom Vibrant Magenta Bar
  page.drawRectangle({
    x: 0,
    y: 0,
    width: 595.28,
    height: 10,
    color: magentaBar,
  });

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
