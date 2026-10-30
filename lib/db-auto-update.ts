import mysql from "mysql2/promise";
import { runMigrations } from "./migrations.mjs";

/*
 * Runs at server start (see instrumentation.ts): brings the database up to
 * date with lib/migrations.mjs. A failure is logged but never stops the site.
 * Set DB_AUTO_MIGRATE=off to switch this off.
 */
export async function updateDatabase() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_AUTO_MIGRATE } = process.env;
  if (DB_AUTO_MIGRATE === "off" || !DB_HOST || !DB_USER || !DB_NAME) return;

  let db: mysql.Connection | undefined;
  try {
    db = await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT || 3306),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      charset: "utf8mb4",
      connectTimeout: 10_000,
    });
    const applied = await runMigrations(db, { log: (m: string) => console.log(`[db] ${m}`) });
    console.log(applied.length ? `[db] database updated (${applied.length} change${applied.length > 1 ? "s" : ""})` : "[db] database is up to date");
  } catch (err) {
    console.error("[db] automatic database update failed:", err);
  } finally {
    await db?.end().catch(() => {});
  }
}
