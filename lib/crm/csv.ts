/*
 * CSV downloads from the CRM. Every cell is quoted, cells that a spreadsheet
 * would run as a formula are neutralised, and a BOM makes Excel read UTF-8.
 */
// a cell a spreadsheet would run as a formula (=, @, or +/- followed by letters)
// gets a leading apostrophe; phone numbers like +1 312 555 0123 are left as they are
const isFormula = (s: string) => /^[=@\t\r]/.test(s) || (/^[+-]/.test(s) && /[A-Za-z]/.test(s));
const cell = (v: string | number | null | undefined) => {
  const s = v == null ? "" : String(v);
  return `"${(isFormula(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

export function csvFile(filename: string, head: string[], rows: (string | number | null | undefined)[][]): Response {
  const csv = "﻿" + [head, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
