/*
 * Local database setup for the Quickupp USA website.
 *
 *   npm run db:setup
 *
 * Uses your MySQL root login once to:
 *   1. create the database named in DB_NAME (Quickupp_USA)
 *   2. create the website's own MySQL user (DB_USER / DB_PASSWORD)
 *   3. create all tables from db/schema.sql
 * Reads .env.local for the values. Safe to run again: nothing is deleted.
 */
import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import mysql from "mysql2/promise";

const { DB_HOST = "127.0.0.1", DB_PORT = "3306", DB_USER, DB_PASSWORD, DB_NAME } = process.env;

if (!DB_USER || !DB_PASSWORD || !DB_NAME) {
  console.error("✗ Missing DB_USER, DB_PASSWORD or DB_NAME. Copy .env.example to .env.local and fill it in first.");
  process.exit(1);
}
if (!/^[A-Za-z0-9_]+$/.test(DB_NAME) || !/^[A-Za-z0-9_]+$/.test(DB_USER)) {
  console.error("✗ DB_NAME and DB_USER may only contain letters, numbers and underscores.");
  process.exit(1);
}

let rootPassword = process.env.DB_ROOT_PASSWORD;
if (!rootPassword) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  rootPassword = await rl.question("MySQL root password: ");
  rl.close();
}

const root = await mysql
  .createConnection({ host: DB_HOST, port: Number(DB_PORT), user: "root", password: rootPassword, multipleStatements: true })
  .catch((err) => {
    console.error("✗ Could not log in to MySQL as root:", err.message);
    console.error("  Check that MySQL is running and the root password is correct.");
    process.exit(1);
  });

try {
  await root.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  console.log(`✓ Database ${DB_NAME} ready`);

  for (const host of ["localhost", "127.0.0.1"]) {
    await root.query("CREATE USER IF NOT EXISTS ?@? IDENTIFIED BY ?", [DB_USER, host, DB_PASSWORD]);
    await root.query("ALTER USER ?@? IDENTIFIED BY ?", [DB_USER, host, DB_PASSWORD]);
    await root.query(`GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO ?@?`, [DB_USER, host]);
  }
  await root.query("FLUSH PRIVILEGES");
  console.log(`✓ User ${DB_USER} can use ${DB_NAME}`);

  const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
  await root.query(`USE \`${DB_NAME}\`; ${schema}`);

  const [tables] = await root.query("SHOW TABLES");
  console.log("✓ Tables:");
  for (const row of tables) console.log("   -", Object.values(row)[0]);
  console.log("\nAll set. Start the site with: npm run dev");
} catch (err) {
  console.error("✗ Setup failed:", err.message);
  process.exitCode = 1;
} finally {
  await root.end();
}
