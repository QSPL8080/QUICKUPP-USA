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
 */
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
  .createConnection({ host: DB_HOST, port: Number(DB_PORT), user: DB_USER, password: DB_PASSWORD, database: DB_NAME })
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
  console.log("\nDone.");
} catch (err) {
  console.error("✗ Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
