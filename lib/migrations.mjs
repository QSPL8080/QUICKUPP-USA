/*
 * Database changes for the Quickupp USA website, applied AUTOMATICALLY.
 *
 * Every time the website starts (npm run dev on your computer, or a deploy on
 * Hostinger) it runs any change below that the database hasn't had yet, and
 * records it in the schema_migrations table. Nothing needs to be done in
 * phpMyAdmin or MySQL Workbench.
 *
 * Adding a change later:
 *   1. Add a new entry at the END of MIGRATIONS with a new id (date + name).
 *   2. Write it so it is safe to run again (check before you add/rename), and
 *      never drop a table or column that holds enquiries or payments.
 *   3. Never edit or remove an entry that has already been deployed.
 *
 * Plain JavaScript on purpose, so `npm run db:migrate` can use it too.
 */
import { randomBytes, scryptSync } from "node:crypto";

/* table → service shown on that form (same labels as lib/formOptions.ts) */
const SERVICE_TABLES = {
  service_digital_marketing: "AI-Powered Digital Marketing Services",
  service_ai_automation: "AI & Automation Solutions",
  service_it_services: "Information Technology Services",
  service_staff_augmentation: "Staff Augmentation",
};

const TABLE_OPTIONS = "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

const columns = async (db, table) => {
  const [rows] = await db.query(
    "SELECT COLUMN_NAME AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
    [table]
  );
  return new Set(rows.map((r) => r.c));
};

const indexes = async (db, table) => {
  const [rows] = await db.query(
    "SELECT DISTINCT INDEX_NAME AS i FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
    [table]
  );
  return new Set(rows.map((r) => r.i));
};

export const MIGRATIONS = [
  {
    id: "2026-10-28-website-forms",
    name: "Contact and service form tables",
    async up(db) {
      await db.query(`CREATE TABLE IF NOT EXISTS contact_enquiries (
        id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
        full_name       VARCHAR(150) NOT NULL,
        email           VARCHAR(190) NOT NULL,
        phone           VARCHAR(40)  NULL,
        company_name    VARCHAR(190) NULL,
        industry        VARCHAR(100) NOT NULL,
        other_industry  VARCHAR(150) NULL,
        project_type    VARCHAR(150) NOT NULL COMMENT 'Subject / Service',
        budget          VARCHAR(60)  NULL,
        message         TEXT         NOT NULL,
        agreed_terms    TINYINT(1)   NOT NULL DEFAULT 1,
        page_url        VARCHAR(500) NULL,
        ip_address      VARCHAR(64)  NULL,
        user_agent      VARCHAR(500) NULL,
        status          ENUM('new','contacted','closed') NOT NULL DEFAULT 'new',
        created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_created (created_at),
        KEY idx_email (email)
      ) ${TABLE_OPTIONS}`);

      await db.query(`CREATE TABLE IF NOT EXISTS service_digital_marketing (
        id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
        full_name        VARCHAR(150) NOT NULL,
        email            VARCHAR(190) NOT NULL,
        phone            VARCHAR(40)  NULL,
        company_name     VARCHAR(190) NULL,
        industry         VARCHAR(100) NOT NULL,
        other_industry   VARCHAR(150) NULL,
        service          VARCHAR(150) NOT NULL COMMENT 'Service (fixed on that service''s pages)',
        category         VARCHAR(150) NOT NULL COMMENT 'Category chosen in the form (a subpage of the service)',
        budget           VARCHAR(60)  NULL,
        message          TEXT         NOT NULL,
        agreed_terms     TINYINT(1)   NOT NULL DEFAULT 1,
        source_page      VARCHAR(150) NULL COMMENT 'Subpage the form was sent from',
        page_url         VARCHAR(500) NULL,
        ip_address       VARCHAR(64)  NULL,
        user_agent       VARCHAR(500) NULL,
        status           ENUM('new','contacted','closed') NOT NULL DEFAULT 'new',
        created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_created (created_at),
        KEY idx_email (email),
        KEY idx_category (category)
      ) ${TABLE_OPTIONS}`);

      for (const table of Object.keys(SERVICE_TABLES)) {
        if (table !== "service_digital_marketing") {
          await db.query(`CREATE TABLE IF NOT EXISTS \`${table}\` LIKE service_digital_marketing`);
        }
      }
    },
  },

  {
    id: "2026-10-30-service-category",
    name: "Service forms: fixed service + chosen category",
    async up(db) {
      for (const [table, label] of Object.entries(SERVICE_TABLES)) {
        const cols = await columns(db, table);
        if (cols.has("service_interest") && !cols.has("category")) {
          await db.query(
            `ALTER TABLE \`${table}\` CHANGE service_interest category VARCHAR(150) NOT NULL COMMENT 'Category chosen in the form (a subpage of the service)'`
          );
        }
        if (!cols.has("service")) {
          await db.query(`ALTER TABLE \`${table}\` ADD COLUMN service VARCHAR(150) NOT NULL DEFAULT '' AFTER other_industry`);
          await db.query(`UPDATE \`${table}\` SET service = ? WHERE service = ''`, [label]);
          await db.query(`ALTER TABLE \`${table}\` MODIFY service VARCHAR(150) NOT NULL COMMENT 'Service (fixed on that service''s pages)'`);
        }
        const idx = await indexes(db, table);
        if (idx.has("idx_service")) await db.query(`ALTER TABLE \`${table}\` DROP INDEX idx_service`);
        if (!idx.has("idx_category")) await db.query(`ALTER TABLE \`${table}\` ADD INDEX idx_category (category)`);
      }
    },
  },

  {
    id: "2026-10-30-crm",
    name: "CRM: team accounts, sign-in sessions and payments",
    async up(db) {
      await db.query(`CREATE TABLE IF NOT EXISTS crm_users (
        id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
        name           VARCHAR(120) NOT NULL,
        email          VARCHAR(190) NOT NULL,
        password_hash  VARCHAR(255) NOT NULL,
        role           ENUM('super_admin','admin') NOT NULL DEFAULT 'admin',
        is_active      TINYINT(1)   NOT NULL DEFAULT 1,
        last_login_at  TIMESTAMP    NULL,
        created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_email (email)
      ) ${TABLE_OPTIONS}`);

      await db.query(`CREATE TABLE IF NOT EXISTS crm_sessions (
        token_hash  CHAR(64)     NOT NULL,
        user_id     INT UNSIGNED NOT NULL,
        expires_at  DATETIME     NOT NULL,
        ip_address  VARCHAR(64)  NULL,
        user_agent  VARCHAR(500) NULL,
        created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (token_hash),
        KEY idx_user (user_id),
        KEY idx_expires (expires_at),
        CONSTRAINT fk_crm_sessions_user FOREIGN KEY (user_id) REFERENCES crm_users (id) ON DELETE CASCADE
      ) ${TABLE_OPTIONS}`);

      await db.query(`CREATE TABLE IF NOT EXISTS payments (
        id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
        client_name     VARCHAR(150)  NOT NULL,
        client_email    VARCHAR(190)  NULL,
        company_name    VARCHAR(190)  NULL,
        service         VARCHAR(150)  NOT NULL,
        description     VARCHAR(255)  NULL,
        amount          DECIMAL(12,2) NOT NULL,
        currency        CHAR(3)       NOT NULL DEFAULT 'USD',
        method          VARCHAR(40)   NOT NULL,
        status          ENUM('paid','pending','partially_paid','refunded','failed') NOT NULL DEFAULT 'paid',
        source          ENUM('manual','online') NOT NULL DEFAULT 'manual',
        reference       VARCHAR(120)  NULL COMMENT 'Transaction / reference ID',
        invoice_number  VARCHAR(60)   NULL,
        paid_at         DATE          NULL,
        notes           TEXT          NULL,
        created_by      INT UNSIGNED  NULL,
        created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_paid_at (paid_at),
        KEY idx_status (status),
        CONSTRAINT fk_payments_user FOREIGN KEY (created_by) REFERENCES crm_users (id) ON DELETE SET NULL
      ) ${TABLE_OPTIONS}`);
    },
  },

  // ↑ add new changes below this line, never above
];

/*
 * Adds the CRM team accounts named in the CRM_* settings, if they don't exist
 * yet. An existing account (and its password) is never changed here. With no
 * CRM_* settings (as on Hostinger) nothing happens.
 */
async function addCrmAccounts(db, env, log) {
  const accounts = [
    { role: "super_admin", name: env.CRM_SUPERADMIN_NAME || "Super Admin", email: env.CRM_SUPERADMIN_EMAIL, password: env.CRM_SUPERADMIN_PASSWORD },
    { role: "admin", name: env.CRM_ADMIN_NAME || "Admin", email: env.CRM_ADMIN_EMAIL, password: env.CRM_ADMIN_PASSWORD },
  ];
  for (const a of accounts) {
    if (!a.email || !a.password) continue;
    const email = a.email.trim().toLowerCase();
    const [found] = await db.query("SELECT id FROM crm_users WHERE email = ?", [email]);
    if (found.length) continue;
    const salt = randomBytes(16);
    const hash = scryptSync(a.password, salt, 64, { N: 16384, r: 8, p: 1 });
    const stored = `scrypt$16384$8$1$${salt.toString("base64")}$${hash.toString("base64")}`;
    await db.query("INSERT INTO crm_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", [a.name, email, stored, a.role]);
    log(`added CRM account ${email} (${a.role === "super_admin" ? "super admin" : "admin"})`);
  }
}

/**
 * Applies every change the connected database hasn't had yet.
 * @param {import("mysql2/promise").Connection} db  a connection to the website's database
 * @param {{ log?: (msg: string) => void, env?: Record<string, string | undefined> }} [opts]
 * @returns {Promise<string[]>} ids of the changes applied now
 */
export async function runMigrations(db, { log = console.log, env = process.env } = {}) {
  // one server at a time (two starting together would otherwise race)
  const [[lock]] = await db.query("SELECT GET_LOCK('quickupp_migrations', 60) AS ok");
  if (Number(lock.ok) !== 1) throw new Error("another server is updating the database; try again shortly");

  try {
    await db.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      id          VARCHAR(100) NOT NULL,
      name        VARCHAR(255) NOT NULL,
      applied_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ${TABLE_OPTIONS}`);

    const [rows] = await db.query("SELECT id FROM schema_migrations");
    const done = new Set(rows.map((r) => r.id));
    const applied = [];

    for (const m of MIGRATIONS) {
      if (done.has(m.id)) continue;
      log(`applying ${m.id}: ${m.name}`);
      await m.up(db);
      await db.query("INSERT INTO schema_migrations (id, name) VALUES (?, ?)", [m.id, m.name]);
      applied.push(m.id);
    }

    await addCrmAccounts(db, env, log);
    return applied;
  } finally {
    await db.query("SELECT RELEASE_LOCK('quickupp_migrations')").catch(() => {});
  }
}
