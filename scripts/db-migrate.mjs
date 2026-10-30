/*
 * Brings existing tables up to date with db/schema.sql.
 *
 *   npm run db:migrate
 *
 * Uses the website's own login from .env.local (no root password needed).
 * Safe to run any number of times: each change is made only if it is missing,
 * and no enquiries are deleted.
 *
 * Changes so far
 *   2026-10-30  Service forms: the old service_interest column becomes
 *               "category", and a new "service" column holds the fixed
 *               service of each form (filled in for existing rows too).
 *   2026-10-30  CRM: crm_users, crm_sessions and payments tables, and the
 *               team accounts from the CRM_* values in .env.local (added
 *               once; an existing account's password is never changed here).
 */
import { randomBytes, scryptSync } from "node:crypto";
import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";

const { DB_HOST = "127.0.0.1", DB_PORT = "3306", DB_USER, DB_PASSWORD, DB_NAME } = process.env;
if (!DB_USER || !DB_PASSWORD || !DB_NAME) {
  console.error("✗ Missing DB_USER, DB_PASSWORD or DB_NAME in .env.local.");
  process.exit(1);
}

/* table → service shown on that form (same labels as lib/formOptions.ts) */
const SERVICE_TABLES = {
  service_digital_marketing: "AI-Powered Digital Marketing Services",
  service_ai_automation: "AI & Automation Solutions",
  service_it_services: "Information Technology Services",
  service_staff_augmentation: "Staff Augmentation",
};

const db = await mysql
  .createConnection({ host: DB_HOST, port: Number(DB_PORT), user: DB_USER, password: DB_PASSWORD, database: DB_NAME, multipleStatements: true })
  .catch((err) => {
    console.error("✗ Could not connect to the database:", err.message);
    process.exit(1);
  });

const columns = async (table) => {
  const [rows] = await db.query(
    "SELECT COLUMN_NAME AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
    [DB_NAME, table]
  );
  return new Set(rows.map((r) => r.c));
};
const indexes = async (table) => {
  const [rows] = await db.query(
    "SELECT DISTINCT INDEX_NAME AS i FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
    [DB_NAME, table]
  );
  return new Set(rows.map((r) => r.i));
};

try {
  for (const [table, label] of Object.entries(SERVICE_TABLES)) {
    const cols = await columns(table);
    if (!cols.size) {
      console.log(`- ${table}: not found (run npm run db:setup first)`);
      continue;
    }
    const done = [];

    if (cols.has("service_interest") && !cols.has("category")) {
      await db.query(
        `ALTER TABLE \`${table}\` CHANGE service_interest category VARCHAR(150) NOT NULL COMMENT 'Category chosen in the form (a subpage of the service)'`
      );
      done.push("service_interest → category");
    }

    if (!cols.has("service")) {
      await db.query(`ALTER TABLE \`${table}\` ADD COLUMN service VARCHAR(150) NOT NULL DEFAULT '' AFTER other_industry`);
      await db.query(`UPDATE \`${table}\` SET service = ? WHERE service = ''`, [label]);
      await db.query(
        `ALTER TABLE \`${table}\` MODIFY service VARCHAR(150) NOT NULL COMMENT 'Service (fixed on that service''s pages)'`
      );
      done.push("added service");
    }

    const idx = await indexes(table);
    if (idx.has("idx_service")) {
      await db.query(`ALTER TABLE \`${table}\` DROP INDEX idx_service`);
    }
    if (!idx.has("idx_category")) {
      await db.query(`ALTER TABLE \`${table}\` ADD INDEX idx_category (category)`);
      done.push("index on category");
    }

    console.log(`✓ ${table}: ${done.length ? done.join(", ") : "already up to date"}`);
  }
  /* ---- CRM tables and team accounts ---- */
  const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
  const crmSql = schema.slice(schema.indexOf("-- CRM (/login"));
  await db.query(crmSql.replace(/^--.*$/gm, ""));
  console.log("✓ CRM tables: crm_users, crm_sessions, payments");

  const accounts = [
    { role: "super_admin", name: process.env.CRM_SUPERADMIN_NAME || "Super Admin", email: process.env.CRM_SUPERADMIN_EMAIL, password: process.env.CRM_SUPERADMIN_PASSWORD },
    { role: "admin", name: process.env.CRM_ADMIN_NAME || "Admin", email: process.env.CRM_ADMIN_EMAIL, password: process.env.CRM_ADMIN_PASSWORD },
  ];
  for (const a of accounts) {
    if (!a.email || !a.password) {
      console.log(`- ${a.role}: no CRM_${a.role === "admin" ? "ADMIN" : "SUPERADMIN"}_EMAIL / _PASSWORD in .env.local, skipped`);
      continue;
    }
    const email = a.email.trim().toLowerCase();
    const [found] = await db.query("SELECT id FROM crm_users WHERE email = ?", [email]);
    if (found.length) {
      console.log(`✓ ${email}: account already exists`);
      continue;
    }
    const salt = randomBytes(16);
    const hash = scryptSync(a.password, salt, 64, { N: 16384, r: 8, p: 1 });
    const stored = `scrypt$16384$8$1$${salt.toString("base64")}$${hash.toString("base64")}`;
    await db.query("INSERT INTO crm_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", [a.name, email, stored, a.role]);
    console.log(`✓ ${email}: ${a.role === "super_admin" ? "super admin" : "admin"} account added`);
  }

  console.log("\nDone.");
} catch (err) {
  console.error("✗ Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
