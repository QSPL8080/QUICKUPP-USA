import { PDFDocument, rgb, StandardFonts, PDFPage } from "pdf-lib";
import { PDF_LOGO_PNG } from "@/lib/brandAssets";

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
  /** a balance payment: the amount the client paid earlier (the deposit) */
  earlierPaid?: number | null;
  /** a balance payment: the deposit's transaction ID */
  earlierTransactionId?: string | null;
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
    earlierPaid = 0,
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
  const isBalance = !isPartial && !isPending && Number(earlierPaid) > 0;
  const usd = (n: unknown) => `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const finalTotal = totalAmount != null && Number(totalAmount) > 0 ? Number(totalAmount) : Number(amountPaid);
  const formattedDate = formatReceiptDate(paymentDate);
  const qty = quantity && Number(quantity) > 0 ? Number(quantity) : 1;

  // Top accent bar
  drawGradientBar(page, 0, 841.89 - 7, PAGE_W, 7, GRADIENT);

  /* ---- layout helpers ---------------------------------------------------
     Helvetica's capital letters are 0.718 of the font size tall. Text is
     placed by its baseline, so "vertically centred" means the capitals sit
     in the middle of the row. */
  const CAP = 0.718;
  type Font = typeof font;
  const w = (text: string, f: Font, size: number) => f.widthOfTextAtSize(text, size);
  const midBaseline = (rowBottom: number, rowH: number, size: number) => rowBottom + (rowH - CAP * size) / 2;
  const right = (text: string, xRight: number, y: number, size: number, f: Font, color: ReturnType<typeof rgb>) =>
    page.drawText(text, { x: xRight - w(text, f, size), y, size, font: f, color });

  /** Breaks text into lines no wider than maxW (at spaces and " | ", and inside very long words). */
  const wrap = (text: string, f: Font, size: number, maxW: number): string[] => {
    const lines: string[] = [];
    for (const part of String(text).split(/\s*\|\s*/)) {
      let line = "";
      for (const word of part.split(/\s+/).filter(Boolean)) {
        const next = line ? `${line} ${word}` : word;
        if (w(next, f, size) <= maxW) {
          line = next;
          continue;
        }
        if (line) lines.push(line);
        // a single word wider than the column: break it across lines
        let rest = word;
        while (w(rest, f, size) > maxW) {
          let cut = rest.length - 1;
          while (cut > 1 && w(rest.slice(0, cut), f, size) > maxW) cut--;
          // prefer to break just after "@", "-", "." or "_" (emails, web addresses)
          const soft = Math.max(...["@", "-", ".", "_"].map((c) => rest.lastIndexOf(c, cut - 1)));
          if (soft > 0) cut = soft + 1;
          lines.push(rest.slice(0, cut));
          rest = rest.slice(cut);
        }
        line = rest;
      }
      if (line) lines.push(line);
    }
    return lines.length ? lines : [""];
  };

  // ===========================================================================
  // HEADER: logo and company details (left) | title, receipt no, date, badge (right)
  // ===========================================================================
  const logoTopY = 780;
  // the logo is built into the code (lib/brandAssets), so every receipt has it
  const logo = await doc.embedPng(PDF_LOGO_PNG);
  const logoW = 130; // points, whatever the image's pixel size
  const logoH = logo.height * (logoW / logo.width);
  page.drawImage(logo, { x: leftX, y: logoTopY - logoH, width: logoW, height: logoH });
  const logoBottomY = logoTopY - logoH;

  // company details under the logo; "Email:" / "Website:" values follow their label
  const INFO_SIZE = 8.5;
  const INFO_LINE = 13.5;
  let curY = logoBottomY - 22;
  page.drawText("Quickupp Softech LLC", { x: leftX, y: curY, size: 10, font: fontBold, color: darkNavy });
  curY -= INFO_LINE + 1.5;
  page.drawText("167 Princeton Street, Bridgeport, Connecticut - 06605, USA", { x: leftX, y: curY, size: INFO_SIZE, font, color: slateMid });
  const contactLine = (label: string, value: string, color: ReturnType<typeof rgb>) => {
    curY -= INFO_LINE;
    page.drawText(label, { x: leftX, y: curY, size: INFO_SIZE, font, color: slateMid });
    page.drawText(value, { x: leftX + w(`${label} `, font, INFO_SIZE), y: curY, size: INFO_SIZE, font, color });
  };
  contactLine("Phone:", "+1 (302) 754-5679", slateMid);
  contactLine("Email:", "info@quickuppsoftech.us", linkBlue);
  contactLine("Website:", "https://www.quickuppsoftech.us/", linkBlue);
  const companyBottomY = curY;

  // right column: every line right-aligned to the page margin, title level with the logo's top
  const TITLE_SIZE = 21;
  const titleY = logoTopY - CAP * TITLE_SIZE;
  right("PAYMENT RECEIPT", rightX, titleY, TITLE_SIZE, fontBold, darkNavy);
  const rcptY = titleY - 26;
  right(`Receipt No: ${orderNumber}`, rightX, rcptY, 10, fontBold, slateDark);
  const dateY = rcptY - 16;
  right(`Date: ${formattedDate}`, rightX, dateY, 9.5, font, slateMid);

  // status badge
  const badgeLabel = isPending ? "PENDING" : isPartial ? "PARTIALLY PAID" : "PAID";
  const badgeFontColor = isPending || isPartial ? amberText : greenText;
  const badgeBgColor = isPending || isPartial ? amberBg : greenBg;
  const BADGE_SIZE = 8.5;
  const pillH = 20;
  const pillW = w(badgeLabel, fontBold, BADGE_SIZE) + 26;
  const pillX = rightX - pillW;
  const pillY = dateY - 14 - pillH;
  drawRoundedRect(page, pillX, pillY, pillW, pillH, pillH / 2, badgeBgColor, undefined);
  page.drawText(badgeLabel, { x: pillX + 13, y: midBaseline(pillY, pillH, BADGE_SIZE), size: BADGE_SIZE, font: fontBold, color: badgeFontColor });

  // divider below whichever header column ends lower
  const dividerY = Math.min(companyBottomY, pillY) - 22;
  page.drawLine({ start: { x: leftX, y: dividerY }, end: { x: rightX, y: dividerY }, thickness: 1, color: borderLight });

  // ===========================================================================
  // BILL TO  |  PAYMENT INFORMATION — two columns; in each, the labels form one
  // column and every value starts at the same x
  // ===========================================================================
  const SECTION_SIZE = 11;
  const ROW_SIZE = 9;
  const ROW_GAP = 17; // baseline to baseline between rows
  const WRAP_LINE = 12; // between wrapped lines of one value
  const GUTTER = 14; // label column to value column
  const colGap = 30;
  const colW = (contentWidth - colGap) / 2;
  const col2X = leftX + colW + colGap;
  const headingY = dividerY - 26;

  page.drawText("BILL TO", { x: leftX, y: headingY, size: SECTION_SIZE, font: fontBold, color: primaryPurple });
  page.drawText("PAYMENT INFORMATION", { x: col2X, y: headingY, size: SECTION_SIZE, font: fontBold, color: primaryPurple });

  type InfoRow = { label: string; value: string; bold?: boolean; color?: ReturnType<typeof rgb> };
  /** draws one label/value column and returns the baseline of its last line */
  const infoColumn = (x: number, rows: InfoRow[]) => {
    const labelW = Math.max(...rows.map((r) => w(r.label, font, ROW_SIZE)));
    const valueX = x + labelW + GUTTER;
    const valueMaxW = x + colW - valueX;
    let y = headingY - 22;
    let last = y;
    rows.forEach((r, i) => {
      if (i > 0) y -= ROW_GAP;
      const f = r.bold === false ? font : fontBold;
      page.drawText(r.label, { x, y, size: ROW_SIZE, font, color: slateMid });
      const lines = wrap(r.value, f, ROW_SIZE, valueMaxW);
      lines.forEach((line, li) => {
        page.drawText(line, { x: valueX, y: y - li * WRAP_LINE, size: ROW_SIZE, font: f, color: r.color || darkNavy });
      });
      y -= (lines.length - 1) * WRAP_LINE;
      last = y;
    });
    return last;
  };

  const billRows: InfoRow[] = [
    { label: "Customer Name", value: clientName || "Valued Client" },
    { label: "Email", value: clientEmail || "info@quickuppsoftech.us", bold: false, color: linkBlue },
  ];
  if (companyName) billRows.push({ label: "Company", value: companyName });
  if (clientPhone) billRows.push({ label: "Phone", value: clientPhone });
  if (billingAddress) billRows.push({ label: "Billing Address", value: billingAddress });

  const statusStr = isPending ? "PENDING CLEARING" : isPartial ? "PARTIALLY PAID" : "PAID";
  const statusColor = isPending || isPartial ? amberText : greenText;
  const payRows: InfoRow[] = [
    { label: "Payment Method", value: "PayPal" },
    ...(isBalance && data.earlierTransactionId
      ? [
          { label: "Deposit Transaction ID", value: data.earlierTransactionId },
          { label: "Balance Transaction ID", value: transactionId || "N/A" },
        ]
      : [{ label: "Transaction ID", value: transactionId || "N/A" }]),
    { label: "Payment Date", value: `${formattedDate}${paymentTime ? ` · ${paymentTime}` : ""}` },
    { label: "Payment Status", value: statusStr, color: statusColor },
    { label: "Payment Type", value: paymentType === "partial" ? "Advance Deposit" : isBalance ? "Balance Payment" : "Full Payment" },
  ];

  const sectionBottomY = Math.min(infoColumn(leftX, billRows), infoColumn(col2X, payRows));

  // ===========================================================================
  // PAYMENT DETAILS table
  // ===========================================================================
  const detailsHeadingY = sectionBottomY - 34;
  page.drawText("PAYMENT DETAILS", { x: leftX, y: detailsHeadingY, size: SECTION_SIZE, font: fontBold, color: primaryPurple });

  const tblX = leftX;
  const tblW = contentWidth;
  const PAD = 16;
  const TBL_SIZE = 9.5;
  const amountRight = tblX + tblW - PAD; // right edge of the Amount column (and of every total)
  const amountColW = 96;
  const qtyCenter = amountRight - amountColW - 30;
  const descMaxW = qtyCenter - 28 - (tblX + PAD);
  const labelRight = amountRight - amountColW; // right edge of the total labels

  const headerRowH = 28;
  const itemDesc = `${service}${category ? ` – ${category}` : ""}`;
  const descLines = wrap(itemDesc, fontBold, TBL_SIZE, descMaxW);
  const DESC_LINE = 13;
  const itemRowH = Math.max(38, (descLines.length - 1) * DESC_LINE + CAP * TBL_SIZE + 26);
  const summaryRowH = 26;
  const summaryRowCount = isPartial ? 2 : isBalance ? 3 : 1;
  const finalRowH = 38;
  const tblH = headerRowH + itemRowH + summaryRowCount * summaryRowH + finalRowH;
  const tableTop = detailsHeadingY - 14;
  const tblY = tableTop - tblH;

  drawRoundedRect(page, tblX, tblY, tblW, tblH, 3, rgb(1, 1, 1), borderLight);

  // header row
  const headerBottom = tableTop - headerRowH;
  page.drawRectangle({ x: tblX + 0.5, y: headerBottom, width: tblW - 1, height: headerRowH - 0.5, color: rgb(0.95, 0.96, 0.98) });
  page.drawLine({ start: { x: tblX, y: headerBottom }, end: { x: tblX + tblW, y: headerBottom }, thickness: 1, color: borderLight });
  const headY = midBaseline(headerBottom, headerRowH, TBL_SIZE);
  page.drawText("Description", { x: tblX + PAD, y: headY, size: TBL_SIZE, font: fontBold, color: slateDark });
  page.drawText("Qty", { x: qtyCenter - w("Qty", fontBold, TBL_SIZE) / 2, y: headY, size: TBL_SIZE, font: fontBold, color: slateDark });
  right("Amount (USD)", amountRight, headY, TBL_SIZE, fontBold, slateDark);

  // line item: the description block is centred in the row; Qty and Amount sit on its first line
  const itemBottom = headerBottom - itemRowH;
  const blockH = CAP * TBL_SIZE + (descLines.length - 1) * DESC_LINE;
  const firstY = itemBottom + (itemRowH + blockH) / 2 - CAP * TBL_SIZE;
  descLines.forEach((line, i) => page.drawText(line, { x: tblX + PAD, y: firstY - i * DESC_LINE, size: TBL_SIZE, font: fontBold, color: darkNavy }));
  const qtyStr = String(qty);
  page.drawText(qtyStr, { x: qtyCenter - w(qtyStr, font, TBL_SIZE) / 2, y: firstY, size: TBL_SIZE, font, color: slateMid });
  const totalStr = usd(finalTotal);
  right(totalStr, amountRight, firstY, TBL_SIZE, fontBold, darkNavy);
  page.drawLine({ start: { x: tblX, y: itemBottom }, end: { x: tblX + tblW, y: itemBottom }, thickness: 1, color: borderLight });

  // totals: labels right-aligned in one column, values right-aligned under Amount
  const SUM_SIZE = 9.5;
  let rowBottom = itemBottom;
  const summaryRow = (label: string, value: string, color = darkNavy) => {
    rowBottom -= summaryRowH;
    const y = midBaseline(rowBottom, summaryRowH, SUM_SIZE);
    right(label, labelRight, y, SUM_SIZE, font, slateMid);
    right(value, amountRight, y, SUM_SIZE, fontBold, color);
  };
  summaryRow("Order Total", totalStr);
  if (isPartial) {
    const paidPct = finalTotal > 0 ? Math.round((Number(amountPaid) / finalTotal) * 100) : 0;
    summaryRow(`Amount Paid (${paidPct}% Advance)`, usd(amountPaid), greenText);
  }
  if (isBalance) {
    summaryRow("Deposit Paid Earlier", usd(earlierPaid));
    summaryRow("Balance Paid Now", usd(amountPaid), greenText);
  }

  // highlighted last row: green "Total Paid" when fully paid, amber when a balance remains or PayPal is clearing it
  const finalBg = isPending || isPartial ? amberBg : greenBg;
  const finalColor = isPending || isPartial ? amberText : greenText;
  page.drawRectangle({ x: tblX + 0.5, y: tblY + 0.5, width: tblW - 1, height: finalRowH - 0.5, color: finalBg });
  page.drawLine({ start: { x: tblX, y: tblY + finalRowH }, end: { x: tblX + tblW, y: tblY + finalRowH }, thickness: 1, color: borderLight });
  const FINAL_SIZE = 11;
  const finalY = midBaseline(tblY, finalRowH, FINAL_SIZE);
  const finalLabel = isPending ? "Amount Pending" : isPartial ? "Balance Due" : "Total Paid";
  const finalValStr = isPartial
    ? `${usd(remainingAmount)} USD`
    : `${usd(isBalance ? Number(earlierPaid) + Number(amountPaid) : amountPaid)} USD`;
  right(finalLabel, labelRight, finalY, FINAL_SIZE, fontBold, finalColor);
  right(finalValStr, amountRight, finalY, FINAL_SIZE, fontBold, finalColor);

  // ===========================================================================
  // THANK YOU
  // ===========================================================================
  let tyY = tblY - 40;
  page.drawText("THANK YOU FOR YOUR PURCHASE", { x: leftX, y: tyY, size: 13, font: fontBold, color: darkNavy });
  tyY -= 20;
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
    page.drawText(`Balance due: ${usd(remainingAmount)} USD.`, { x: leftX, y: tyY, size: 9, font: fontBold, color: amberText });
  }

  const divY = tyY - 22;
  page.drawLine({ start: { x: leftX, y: divY }, end: { x: rightX, y: divY }, thickness: 1, color: borderLight });

  // ===========================================================================
  // NEED ASSISTANCE?
  // ===========================================================================
  curY = divY - 24;
  page.drawText("NEED ASSISTANCE?", { x: leftX, y: curY, size: SECTION_SIZE, font: fontBold, color: primaryPurple });
  curY -= 18;
  page.drawText("Quickupp Softech LLC", { x: leftX, y: curY, size: 10, font: fontBold, color: darkNavy });
  contactLine("Email:", "info@quickuppsoftech.us", linkBlue);
  contactLine("Website:", "https://www.quickuppsoftech.us/", linkBlue);

  // Fine print
  const finePrint =
    "This document serves as your official payment receipt for the transaction described above. Operated by Quickupp Softech LLC.";
  page.drawText(finePrint, { x: leftX, y: 42, size: 7.5, font, color: rgb(0.55, 0.6, 0.68) });

  // Bottom accent bar (mirrors the top one)
  drawGradientBar(page, 0, 0, PAGE_W, 7, GRADIENT);

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
