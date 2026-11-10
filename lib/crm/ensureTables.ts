import "server-only";
import { getPool } from "@/lib/db";
import { INDUSTRY_ENQUIRIES_SQL } from "@/lib/industryTable.mjs";

/*
 * Makes sure the newest lead table exists before it is read or written.
 * The start-up database update normally makes it first; this covers a lead or
 * a CRM page that arrives in the seconds before that finishes (or if it
 * failed). Runs once per server; a failure is retried on the next call.
 */
declare global {
  var __quickuppLeadTables: Promise<void> | undefined;
}

export function ensureLeadTables(): Promise<void> {
  if (!globalThis.__quickuppLeadTables) {
    globalThis.__quickuppLeadTables = getPool()
      .query(INDUSTRY_ENQUIRIES_SQL)
      .then(() => undefined)
      .catch((err) => {
        globalThis.__quickuppLeadTables = undefined;
        console.error("[db] could not make industry_enquiries:", err);
      });
  }
  return globalThis.__quickuppLeadTables;
}
