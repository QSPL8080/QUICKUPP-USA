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
  quantity?: number | null;
  amountPaid: number;
  totalAmount?: number | null;
  paymentType?: "full" | "partial";
  /** "pending" while PayPal is still clearing the payment */
  paymentStatus?: "paid" | "partially_paid" | "pending";
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
  // drawn in SVG space (y grows downward) from the rectangle's top-left corner
  const path =
    `M ${r} 0 ` +
    `h ${w - 2 * r} ` +
    `a ${r} ${r} 0 0 1 ${r} ${r} ` +
    `v ${h - 2 * r} ` +
    `a ${r} ${r} 0 0 1 -${r} ${r} ` +
    `h -${w - 2 * r} ` +
    `a ${r} ${r} 0 0 1 -${r} -${r} ` +
    `v -${h - 2 * r} ` +
    `a ${r} ${r} 0 0 1 ${r} -${r} Z`;

  p.drawSvgPath(path, {
    x,
    y: y + h,
    color: fillColor,
    borderColor: borderColor,
    borderWidth: borderColor ? borderWidth : 0,
  });
}

type RGB = [number, number, number];

/** Draws a left-to-right multi-stop linear gradient bar as many thin slices. */
function drawGradientBar(
  p: PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  stops: { at: number; color: RGB }[]
) {
  const steps = 100;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    let c0 = stops[0];
    let c1 = stops[stops.length - 1];
    for (let s = 0; s < stops.length - 1; s++) {
      if (t >= stops[s].at && t <= stops[s + 1].at) {
        c0 = stops[s];
        c1 = stops[s + 1];
        break;
      }
    }
    const span = c1.at - c0.at || 1;
    const lt = Math.min(1, Math.max(0, (t - c0.at) / span));
    const r = c0.color[0] + (c1.color[0] - c0.color[0]) * lt;
    const g = c0.color[1] + (c1.color[1] - c0.color[1]) * lt;
    const b = c0.color[2] + (c1.color[2] - c0.color[2]) * lt;
    p.drawRectangle({ x: x + i * (w / steps), y, width: w / steps + 0.6, height: h, color: rgb(r, g, b) });
  }
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
    quantity,
    amountPaid,
    totalAmount,
    paymentType = "full",
    paymentStatus,
    remainingAmount = 0,
    transactionId,
    paymentDate,
    paymentTime,
  } = data;

  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4 (595.28 x 841.89 pt)
  const PAGE_W = 595.28;

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Palette matching design
  const primaryPurple = rgb(0.486, 0.227, 0.929); // #7c3aed
  const deepPurple = rgb(0.427, 0.161, 0.851);    // #6d28d9
  const darkNavy = rgb(0.06, 0.09, 0.16);         // #0f172a
  const slateDark = rgb(0.12, 0.16, 0.23);        // #1e293b
  const slateMid = rgb(0.28, 0.34, 0.42);         // #475569
  const borderLight = rgb(0.88, 0.91, 0.94);      // #e2e8f0
  const linkBlue = rgb(0.145, 0.388, 0.922);      // #2563eb
  const greenText = rgb(0.086, 0.502, 0.239);     // #15803d
  const greenBg = rgb(0.863, 0.980, 0.906);       // #dcfce7
  const amberText = rgb(0.706, 0.325, 0.035);     // #b45309
  const amberBg = rgb(0.996, 0.953, 0.780);       // #fef3c7

  // The signature brand gradient (indigo -> magenta -> rose) used for the
  // top/bottom accent bars, matching the Quickupp AI Studio receipt style.
  const GRADIENT: { at: number; color: RGB }[] = [
    { at: 0, color: [0.388, 0.4, 0.945] },     // #6366f1
    { at: 0.5, color: [0.753, 0.149, 0.827] }, // #c026d3
    { at: 1, color: [0.937, 0.267, 0.388] },   // #ef4463
  ];

  const leftX = 40;
  const rightX = 555;
  const contentWidth = rightX - leftX; // 515

  const isPending = paymentStatus === "pending";
  const isPartial = paymentType === "partial" && !isPending;
  const usd = (n: unknown) => `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const finalTotal = totalAmount != null && Number(totalAmount) > 0 ? Number(totalAmount) : Number(amountPaid);
  const formattedDate = formatReceiptDate(paymentDate);
  const qty = quantity && Number(quantity) > 0 ? Number(quantity) : 1;

  // Top accent bar
  drawGradientBar(page, 0, 841.89 - 7, PAGE_W, 7, GRADIENT);

  // 1. Logo — the logo PNG already contains the "Quickupp Softech" wordmark,
  // so the text block below it must start clear of the logo's actual bottom
  // edge (computed from its real aspect ratio), not a hardcoded guess, or
  // the two overlap/collide for any logo whose proportions change.
  const logoTopY = 775;
  let logoBottomY = logoTopY - 40; // sane fallback if the logo can't be embedded
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
        y: logoTopY - logoH,
        width: logoW,
        height: logoH,
      });
      logoBottomY = logoTopY - logoH;
    } catch {
      page.drawText("QUICKUPP", { x: leftX, y: 755, size: 18, font: fontBold, color: deepPurple });
      logoBottomY = 752;
    }
  } else {
    page.drawText("QUICKUPP", { x: leftX, y: 755, size: 18, font: fontBold, color: deepPurple });
    logoBottomY = 752;
  }

  // Under Logo text - Official Company Details: a clear gap below the logo's
  // real bottom edge and comfortable line spacing, so the header breathes.
  const LOGO_GAP = 24;
  const LINE = 13.5;
  let curY = logoBottomY - LOGO_GAP;
  page.drawText("Quickupp Softech LLC", { x: leftX, y: curY, size: 10, font: fontBold, color: darkNavy });
  curY -= LINE + 1.5;
  page.drawText("167 Princeton Street, Bridgeport, Connecticut - 06605, USA", { x: leftX, y: curY, size: 8.5, font, color: slateMid });
  curY -= LINE;
  page.drawText("Phone: +1 (302) 754-5679", { x: leftX, y: curY, size: 8.5, font, color: slateMid });
  curY -= LINE;
  page.drawText("Email: ", { x: leftX, y: curY, size: 8.5, font, color: slateMid });
  page.drawText("info@quickuppsoftech.us", { x: leftX + 28, y: curY, size: 8.5, font, color: linkBlue });
  curY -= LINE;
  page.drawText("Website: ", { x: leftX, y: curY, size: 8.5, font, color: slateMid });
  page.drawText("https://www.quickuppsoftech.us/", { x: leftX + 38, y: curY, size: 8.5, font, color: linkBlue });
  const companyBottomY = curY;

  // Top Right Header
  const titleText = "PAYMENT RECEIPT";
  const titleW = fontBold.widthOfTextAtSize(titleText, 21);
  page.drawText(titleText, { x: rightX - titleW, y: 755, size: 21, font: fontBold, color: darkNavy });

  const rcptText = `Receipt No: ${orderNumber}`;
  const rcptW = fontBold.widthOfTextAtSize(rcptText, 10);
  page.drawText(rcptText, { x: rightX - rcptW, y: 731, size: 10, font: fontBold, color: slateDark });

  const dateText = `Date: ${formattedDate}`;
  const dateW = font.widthOfTextAtSize(dateText, 9.5);
  page.drawText(dateText, { x: rightX - dateW, y: 714, size: 9.5, font, color: slateMid });

  // Pill Badge (PAID / PARTIALLY PAID)
  const badgeLabel = isPending ? "PENDING" : isPartial ? "PARTIALLY PAID" : "PAID";
  const badgeFontColor = isPending || isPartial ? amberText : greenText;
  const badgeBgColor = isPending || isPartial ? amberBg : greenBg;
  const badgeTextW = fontBold.widthOfTextAtSize(badgeLabel, 8.5);
  const pillW = badgeTextW + 24;
  const pillH = 20;
  const pillX = rightX - pillW;
  const pillY = 682;

  drawRoundedRect(page, pillX, pillY, pillW, pillH, 10, badgeBgColor, undefined);
  page.drawText(badgeLabel, { x: pillX + 12, y: pillY + 6, size: 8.5, font: fontBold, color: badgeFontColor });

  // Top Divider Line: below whichever header column ends lower, with room to breathe
  const dividerY = Math.min(companyBottomY, pillY) - 22;
  // everything below was laid out for a divider at 668; move it with the divider
  const headerShift = dividerY - 668;
  page.drawLine({ start: { x: leftX, y: dividerY }, end: { x: rightX, y: dividerY }, thickness: 1, color: borderLight });

  // ===========================================================================
  // BILL TO  |  PAYMENT INFORMATION — side-by-side, directly under the divider
  // ===========================================================================
  const colStartY = 648 + headerShift;
  const col2X = leftX + 270;
  const rowGap = 15.5;

  page.drawText("BILL TO", { x: leftX, y: colStartY, size: 11, font: fontBold, color: primaryPurple });
  page.drawText("PAYMENT INFORMATION", { x: col2X, y: colStartY, size: 11, font: fontBold, color: primaryPurple });

  // Left column rows (variable count: Name, Email, Company?, Address/Phone)
  let lY = colStartY - 18;
  page.drawText("Customer Name: ", { x: leftX, y: lY, size: 9, font, color: slateMid });
  page.drawText(clientName || "Valued Client", { x: leftX + 80, y: lY, size: 9, font: fontBold, color: darkNavy });
  lY -= rowGap;
  page.drawText("Email: ", { x: leftX, y: lY, size: 9, font, color: slateMid });
  page.drawText(clientEmail || "info@quickuppsoftech.us", { x: leftX + 32, y: lY, size: 9, font, color: linkBlue });
  if (companyName) {
    lY -= rowGap;
    page.drawText("Company: ", { x: leftX, y: lY, size: 9, font, color: slateMid });
    page.drawText(companyName, { x: leftX + 48, y: lY, size: 9, font: fontBold, color: darkNavy });
  }
  if (clientPhone) {
    lY -= rowGap;
    page.drawText("Phone: ", { x: leftX, y: lY, size: 9, font, color: slateMid });
    page.drawText(clientPhone, { x: leftX + 34, y: lY, size: 9, font: fontBold, color: darkNavy });
  }
  if (billingAddress) {
    lY -= rowGap;
    page.drawText("Billing Address: ", { x: leftX, y: lY, size: 9, font, color: slateMid });
    page.drawText(billingAddress, { x: leftX + 74, y: lY, size: 9, font: fontBold, color: darkNavy });
  }

  // Right column rows (fixed 5: Method, Transaction ID, Date, Status, Type)
  let rY = colStartY - 18;
  page.drawText("Payment Method: ", { x: col2X, y: rY, size: 9, font, color: slateMid });
  page.drawText("PayPal", { x: col2X + 92, y: rY, size: 9, font: fontBold, color: darkNavy });
  rY -= rowGap;
  page.drawText("Transaction ID: ", { x: col2X, y: rY, size: 9, font, color: slateMid });
  const txShort = transactionId && transactionId.length > 22 ? `${transactionId.substring(0, 20)}...` : transactionId || "N/A";
  page.drawText(txShort, { x: col2X + 86, y: rY, size: 9, font: fontBold, color: darkNavy });
  rY -= rowGap;
  page.drawText("Payment Date: ", { x: col2X, y: rY, size: 9, font, color: slateMid });
  page.drawText(`${formattedDate}${paymentTime ? ` · ${paymentTime}` : ""}`, { x: col2X + 80, y: rY, size: 9, font: fontBold, color: darkNavy });
  rY -= rowGap;
  const statusStr = isPending ? "PENDING CLEARING" : isPartial ? "PARTIALLY PAID" : "PAID";
  const statusColor = isPending || isPartial ? amberText : greenText;
  page.drawText("Payment Status: ", { x: col2X, y: rY, size: 9, font, color: slateMid });
  page.drawText(statusStr, { x: col2X + 86, y: rY, size: 9, font: fontBold, color: statusColor });
  rY -= rowGap;
  const typeDisplay = paymentType === "partial" ? "Advance Deposit" : "Full Payment";
  page.drawText("Payment Type: ", { x: col2X, y: rY, size: 9, font, color: slateMid });
  page.drawText(typeDisplay, { x: col2X + 80, y: rY, size: 9, font: fontBold, color: darkNavy });

  // The right column always has 5 rows, so it reliably determines the
  // bottom of this whole section regardless of how many optional left rows
  // were drawn.
  const sectionBottomY = colStartY - 18 - 4 * rowGap;

  // ===========================================================================
  // PAYMENT DETAILS table
  // ===========================================================================
  const detailsHeadingY = sectionBottomY - 25;
  page.drawText("PAYMENT DETAILS", { x: leftX, y: detailsHeadingY, size: 11, font: fontBold, color: primaryPurple });

  const tblX = leftX;
  const tblW = contentWidth;
  const headerRowH = 25.5;
  const itemRowH = 30;
  const summaryRowH = 16;
  const summaryRowCount = isPartial ? 2 : 1;
  const finalRowH = 32;
  const tblH = headerRowH + itemRowH + summaryRowCount * summaryRowH + finalRowH + 10;
  const tableTop = detailsHeadingY - 14;
  const tblY = tableTop - tblH;

  drawRoundedRect(page, tblX, tblY, tblW, tblH, 2, rgb(1, 1, 1), borderLight);

  // Table Header Row
  page.drawRectangle({ x: tblX + 0.5, y: tblY + tblH - headerRowH, width: tblW - 1, height: headerRowH - 0.5, color: rgb(0.95, 0.96, 0.98) });
  page.drawLine({ start: { x: tblX, y: tblY + tblH - headerRowH }, end: { x: tblX + tblW, y: tblY + tblH - headerRowH }, thickness: 1, color: borderLight });

  const qtyColX = tblX + tblW - 160;
  page.drawText("Description", { x: tblX + 16, y: tblY + tblH - 17, size: 9.5, font: fontBold, color: slateDark });
  const qtyHeaderW = fontBold.widthOfTextAtSize("Qty", 9.5);
  page.drawText("Qty", { x: qtyColX - qtyHeaderW / 2, y: tblY + tblH - 17, size: 9.5, font: fontBold, color: slateDark });
  const amtHeader = "Amount (USD)";
  const amtHW = fontBold.widthOfTextAtSize(amtHeader, 9.5);
  page.drawText(amtHeader, { x: tblX + tblW - 20 - amtHW, y: tblY + tblH - 17, size: 9.5, font: fontBold, color: slateDark });

  // Line item row
  const itemDesc = `${service}${category ? ` – ${category}` : ""}`;
  const truncatedDesc = itemDesc.length > 62 ? `${itemDesc.substring(0, 59)}...` : itemDesc;
  const itemY = tblY + tblH - headerRowH - itemRowH / 2 - 3;

  page.drawText(truncatedDesc, { x: tblX + 16, y: itemY, size: 9.5, font: fontBold, color: darkNavy });
  const qtyStr = String(qty);
  const qtyW = fontBold.widthOfTextAtSize(qtyStr, 9.5);
  page.drawText(qtyStr, { x: qtyColX - qtyW / 2, y: itemY, size: 9.5, font, color: slateMid });
  const totalStr = usd(finalTotal);
  const totalStrW = fontBold.widthOfTextAtSize(totalStr, 9.5);
  page.drawText(totalStr, { x: tblX + tblW - 20 - totalStrW, y: itemY, size: 9.5, font: fontBold, color: darkNavy });

  // Summary separator (above the non-highlighted summary rows)
  const summaryTop = tblY + finalRowH + summaryRowCount * summaryRowH;
  page.drawLine({ start: { x: tblX, y: summaryTop }, end: { x: tblX + tblW, y: summaryTop }, thickness: 1, color: borderLight });

  let sumY = summaryTop - summaryRowH + 4;
  const summaryRow = (label: string, value: string, color = darkNavy) => {
    const vW = fontBold.widthOfTextAtSize(value, 9);
    const lW = font.widthOfTextAtSize(label, 9);
    page.drawText(label, { x: tblX + tblW - 20 - vW - 10 - lW, y: sumY, size: 9, font, color: slateMid });
    page.drawText(value, { x: tblX + tblW - 20 - vW, y: sumY, size: 9, font: fontBold, color });
    sumY -= summaryRowH;
  };

  summaryRow("Order Total:", totalStr);
  if (isPartial) {
    const paidPct = finalTotal > 0 ? Math.round((Number(amountPaid) / finalTotal) * 100) : 0;
    summaryRow(`Amount Paid (${paidPct}% Advance):`, usd(amountPaid), greenText);
  }

  // Highlighted final row: green "Total Paid" when fully paid, amber
  // "Balance Due" when a balance remains — mirroring the reference receipt.
  const finalBg = isPending || isPartial ? amberBg : greenBg;
  const finalColor = isPending || isPartial ? amberText : greenText;
  page.drawRectangle({ x: tblX + 0.5, y: tblY + 0.5, width: tblW - 1, height: finalRowH - 0.5, color: finalBg });
  page.drawLine({ start: { x: tblX, y: tblY + finalRowH }, end: { x: tblX + tblW, y: tblY + finalRowH }, thickness: 1, color: borderLight });

  const finalLabel = isPending ? "Amount Pending:" : isPartial ? "Balance Due:" : "Total Paid:";
  const finalValStr = isPartial ? `${usd(remainingAmount)} USD` : `${usd(amountPaid)} USD`;
  const finalValW = fontBold.widthOfTextAtSize(finalValStr, 11);
  const finalLabelW = fontBold.widthOfTextAtSize(finalLabel, 11);
  page.drawText(finalLabel, { x: tblX + tblW - 20 - finalValW - 14 - finalLabelW, y: tblY + finalRowH / 2 - 4, size: 11, font: fontBold, color: finalColor });
  page.drawText(finalValStr, { x: tblX + tblW - 20 - finalValW, y: tblY + finalRowH / 2 - 4, size: 11, font: fontBold, color: finalColor });

  // ===========================================================================
  // THANK YOU
  // ===========================================================================
  let tyY = tblY - 38;
  page.drawText("THANK YOU FOR YOUR PURCHASE", { x: leftX, y: tyY, size: 13, font: fontBold, color: darkNavy });
  tyY -= 18;
  page.drawText(isPending ? "Your payment has been submitted and PayPal is clearing it." : "Your payment has been successfully received.", { x: leftX, y: tyY, size: 9, font, color: slateMid });
  tyY -= 16;
  const thankOrderText = isPending
    ? `Your order ${orderNumber} will be confirmed by email once the payment clears.`
    : isPartial
      ? `Your order ${orderNumber} deposit has been received. Thank you!`
      : `Your order ${orderNumber} is now fully paid. Thank you!`;
  page.drawText(thankOrderText, { x: leftX, y: tyY, size: 9.5, font: fontBold, color: isPending ? amberText : greenText });
  if (isPartial) {
    tyY -= 16;
    page.drawText(
      `Balance due: ${usd(remainingAmount)} USD. Pay anytime via the link in your email.`,
      { x: leftX, y: tyY, size: 9, font: fontBold, color: amberText }
    );
  }

  // Divider Line
  const divY = tyY - 20;
  page.drawLine({ start: { x: leftX, y: divY }, end: { x: rightX, y: divY }, thickness: 1, color: borderLight });

  // ===========================================================================
  // NEED ASSISTANCE?
  // ===========================================================================
  let supY = divY - 22;
  page.drawText("NEED ASSISTANCE?", { x: leftX, y: supY, size: 10.5, font: fontBold, color: primaryPurple });
  supY -= 16;
  page.drawText("Quickupp Softech LLC", { x: leftX, y: supY, size: 10, font: fontBold, color: darkNavy });
  supY -= 14;
  page.drawText("Email: ", { x: leftX, y: supY, size: 8.5, font, color: slateMid });
  page.drawText("info@quickuppsoftech.us", { x: leftX + 28, y: supY, size: 8.5, font, color: linkBlue });
  supY -= 13;
  page.drawText("Website: ", { x: leftX, y: supY, size: 8.5, font, color: slateMid });
  page.drawText("https://www.quickuppsoftech.us/", { x: leftX + 38, y: supY, size: 8.5, font, color: linkBlue });

  // Fine print
  const finePrint =
    "This document serves as your official payment receipt for the transaction described above. Operated by Quickupp Softech LLC.";
  page.drawText(finePrint, { x: leftX, y: 42, size: 7.5, font, color: rgb(0.55, 0.6, 0.68) });

  // Bottom accent bar (mirrors the top one)
  drawGradientBar(page, 0, 0, PAGE_W, 7, GRADIENT);

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
