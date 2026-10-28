import mysql from "mysql2/promise";

/*
 * One shared MySQL connection pool for the whole app (server side only).
 * Connection details come from environment variables — .env.local on your
 * computer, and the app's environment settings on Hostinger.
 */

declare global {
  // eslint-disable-next-line no-var
  var __quickuppPool: mysql.Pool | undefined;
}

export function getPool(): mysql.Pool {
  if (globalThis.__quickuppPool) return globalThis.__quickuppPool;

  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) {
    throw new Error("Database is not configured: set DB_HOST, DB_USER, DB_PASSWORD and DB_NAME.");
  }

  const pool = mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT || 3306),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    charset: "utf8mb4",
    waitForConnections: true,
    connectionLimit: 10,
  });

  // Reuse the pool across hot reloads in development
  globalThis.__quickuppPool = pool;
  return pool;
}
