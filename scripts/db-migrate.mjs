/*
 * Brings the database up to date by hand.
 *
 *   npm run db:migrate
 *
 * Usually not needed: the website applies the same changes by itself every
 * time it starts (npm run dev, or a deploy on Hostinger). The changes live in
 * lib/migrations.mjs. Uses the website's own login from .env.local.
 */
import mysql from "mysql2/promise";
import { runMigrations } from "../lib/migrations.mjs";

const { DB_HOST = "127.0.0.1", DB_PORT = "3306", DB_USER, DB_PASSWORD, DB_NAME } = process.env;
if (!DB_USER || !DB_NAME) {
  console.error("✗ Missing DB_USER or DB_NAME in .env.local.");
  process.exit(1);
}

const db = await mysql
  .createConnection({ host: DB_HOST, port: Number(DB_PORT), user: DB_USER, password: DB_PASSWORD, database: DB_NAME, charset: "utf8mb4" })
  .catch((err) => {
    console.error("✗ Could not connect to the database:", err.message);
    process.exit(1);
  });

try {
  const applied = await runMigrations(db, { log: (m) => console.log(`• ${m}`) });
  console.log(applied.length ? `✓ Database updated (${applied.join(", ")})` : "✓ Database is already up to date");
} catch (err) {
  console.error("✗ Update failed:", err.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
