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
// the blogs from the blog document, imported (not read from disk) so the
// data is bundled with the server wherever it runs
import SEED_BLOGS from "../data/seed-blogs.mjs";
import { encryptSecret } from "./crm/secret.mjs";
import { INDUSTRY_ENQUIRIES_SQL } from "./industryTable.mjs";

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

  {
    id: "2026-10-31-contact-form",
    name: "Contact form: company website, country and timeline; industry and message optional",
    async up(db) {
      const cols = await columns(db, "contact_enquiries");
      if (!cols.has("company_website")) {
        await db.query("ALTER TABLE contact_enquiries ADD COLUMN company_website VARCHAR(255) NULL AFTER company_name");
      }
      if (!cols.has("country")) {
        await db.query("ALTER TABLE contact_enquiries ADD COLUMN country VARCHAR(100) NULL AFTER company_website");
      }
      if (!cols.has("timeline")) {
        await db.query("ALTER TABLE contact_enquiries ADD COLUMN timeline VARCHAR(60) NULL AFTER budget");
      }
      // the new form has no industry field and the project details are optional
      await db.query("ALTER TABLE contact_enquiries MODIFY industry VARCHAR(100) NULL, MODIFY message TEXT NULL");
    },
  },

  {
    id: "2026-10-31-job-openings",
    name: "Careers: job openings managed in the CRM",
    async up(db) {
      await db.query(`CREATE TABLE IF NOT EXISTS job_openings (
        id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
        title             VARCHAR(190) NOT NULL,
        department        VARCHAR(100) NOT NULL,
        employment_type   VARCHAR(40)  NOT NULL,
        location          VARCHAR(150) NOT NULL,
        experience        VARCHAR(100) NOT NULL,
        responsibilities  TEXT         NOT NULL COMMENT 'One per line',
        skills            TEXT         NOT NULL COMMENT 'One per line',
        deadline          DATE         NULL COMMENT 'Application deadline, if any',
        is_open           TINYINT(1)   NOT NULL DEFAULT 1,
        created_by        INT UNSIGNED NULL,
        created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_open (is_open, deadline),
        CONSTRAINT fk_jobs_user FOREIGN KEY (created_by) REFERENCES crm_users (id) ON DELETE SET NULL
      ) ${TABLE_OPTIONS}`);
    },
  },

  {
    id: "2026-10-31-job-applications",
    name: "Careers: applications sent from the Apply Now form",
    async up(db) {
      await db.query(`CREATE TABLE IF NOT EXISTS job_applications (
        id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
        job_id            INT UNSIGNED NULL,
        job_title         VARCHAR(190) NOT NULL COMMENT 'Copied from the opening, kept if the opening is deleted',
        department        VARCHAR(100) NULL,
        full_name         VARCHAR(150) NOT NULL,
        email             VARCHAR(190) NOT NULL,
        phone             VARCHAR(40)  NOT NULL,
        current_location  VARCHAR(150) NOT NULL,
        experience        VARCHAR(100) NOT NULL,
        profile_url       VARCHAR(255) NULL COMMENT 'LinkedIn or portfolio',
        cover_note        TEXT         NULL,
        resume_name       VARCHAR(255) NOT NULL,
        resume_type       VARCHAR(100) NOT NULL,
        resume_size       INT UNSIGNED NOT NULL,
        resume_data       MEDIUMBLOB   NOT NULL,
        status            VARCHAR(20)  NOT NULL DEFAULT 'new',
        mail_sent         TINYINT(1)   NOT NULL DEFAULT 0 COMMENT 'Emailed to HR',
        agreed_terms      TINYINT(1)   NOT NULL DEFAULT 1,
        page_url          VARCHAR(500) NULL,
        ip_address        VARCHAR(64)  NULL,
        user_agent        VARCHAR(500) NULL,
        created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_job (job_id),
        KEY idx_status (status, created_at),
        CONSTRAINT fk_applications_job FOREIGN KEY (job_id) REFERENCES job_openings (id) ON DELETE SET NULL
      ) ${TABLE_OPTIONS}`);
    },
  },

  {
    id: "2026-10-31-sample-job",
    name: "Careers: one sample opening to try the Apply Now form (edit or delete it in the CRM)",
    async up(db) {
      const [[row]] = await db.query("SELECT COUNT(*) AS n FROM job_openings");
      if (Number(row.n) > 0) return;
      await db.query(
        `INSERT INTO job_openings (title, department, employment_type, location, experience, responsibilities, skills, deadline, is_open)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          "Full Stack Developer",
          "IT & Software Development",
          "Full-time",
          "Remote",
          "2+ years",
          [
            "Build and maintain web applications for clients across different industries",
            "Develop responsive front-end interfaces and reliable back-end APIs",
            "Work with designers, project managers and QA engineers to deliver features on time",
            "Write clean, tested and well-documented code",
            "Troubleshoot, debug and improve the performance of existing applications",
          ].join("\n"),
          ["JavaScript / TypeScript", "React or Next.js", "Node.js", "MySQL or other SQL databases", "REST APIs", "Git"].join("\n"),
          "2026-12-31",
        ]
      );
    },
  },

  {
    id: "2026-10-31-crm-leads-users",
    name: "CRM: more lead statuses, manual leads, usernames, sign-in alerts and notifications",
    async up(db) {
      // lead statuses: New, Contacted, In Progress, On Hold, Closed
      for (const table of ["contact_enquiries", ...Object.keys(SERVICE_TABLES)]) {
        await db.query(
          `ALTER TABLE \`${table}\` MODIFY status ENUM('new','contacted','in_progress','on_hold','closed') NOT NULL DEFAULT 'new'`
        );
      }

      // leads added by hand in the CRM (same services as the website forms)
      await db.query(`CREATE TABLE IF NOT EXISTS manual_leads (
        id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
        full_name        VARCHAR(150) NOT NULL,
        email            VARCHAR(190) NULL,
        phone            VARCHAR(40)  NOT NULL,
        company_name     VARCHAR(190) NULL,
        company_website  VARCHAR(255) NULL,
        country          VARCHAR(100) NULL COMMENT 'Location / city',
        industry         VARCHAR(100) NULL,
        other_industry   VARCHAR(150) NULL,
        service          VARCHAR(150) NOT NULL COMMENT 'Service group from the website',
        category         VARCHAR(150) NOT NULL COMMENT 'Service page within the group',
        budget           VARCHAR(60)  NULL,
        timeline         VARCHAR(60)  NULL,
        lead_channel     VARCHAR(60)  NOT NULL DEFAULT 'Manual' COMMENT 'How the lead reached us',
        assigned_to      VARCHAR(120) NULL,
        message          TEXT         NULL COMMENT 'Notes',
        status           ENUM('new','contacted','in_progress','on_hold','closed') NOT NULL DEFAULT 'new',
        created_by       INT UNSIGNED NULL,
        created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_created (created_at),
        KEY idx_status (status),
        CONSTRAINT fk_manual_leads_user FOREIGN KEY (created_by) REFERENCES crm_users (id) ON DELETE SET NULL
      ) ${TABLE_OPTIONS}`);

      // team accounts: username, failed sign-ins, last time notifications were seen
      const cols = await columns(db, "crm_users");
      if (!cols.has("username")) await db.query("ALTER TABLE crm_users ADD COLUMN username VARCHAR(60) NULL AFTER name");
      if (!cols.has("failed_attempts")) await db.query("ALTER TABLE crm_users ADD COLUMN failed_attempts INT UNSIGNED NOT NULL DEFAULT 0");
      if (!cols.has("notified_at")) {
        await db.query("ALTER TABLE crm_users ADD COLUMN notified_at TIMESTAMP NULL");
        await db.query("UPDATE crm_users SET notified_at = NOW()");
      }

      // usernames for existing accounts (from the email, kept unique)
      const [users] = await db.query("SELECT id, email, role, username FROM crm_users ORDER BY id");
      const taken = new Set(users.map((u) => u.username).filter(Boolean));
      for (const u of users) {
        if (u.username) continue;
        let base = u.role === "super_admin" ? "superadmin" : String(u.email).split("@")[0].toLowerCase().replace(/[^a-z0-9._-]/g, "") || "user";
        let name = base;
        for (let i = 2; taken.has(name); i++) name = `${base}${i}`;
        taken.add(name);
        await db.query("UPDATE crm_users SET username = ? WHERE id = ?", [name, u.id]);
      }
      const idx = await indexes(db, "crm_users");
      if (!idx.has("uq_username")) await db.query("ALTER TABLE crm_users ADD UNIQUE KEY uq_username (username)");

      // info@quickuppsoftech.us is the super admin's sign-in email
      const [[clash]] = await db.query("SELECT COUNT(*) AS n FROM crm_users WHERE email = 'info@quickuppsoftech.us' AND role <> 'super_admin'");
      if (Number(clash.n) === 0) {
        await db.query("UPDATE crm_users SET email = 'info@quickuppsoftech.us' WHERE role = 'super_admin' ORDER BY id LIMIT 1");
      }
    },
  },

  {
    id: "2026-10-31-crm-notifications",
    name: "CRM notifications: read one by one, clear all",
    async up(db) {
      const cols = await columns(db, "crm_users");
      if (!cols.has("cleared_at")) {
        await db.query("ALTER TABLE crm_users ADD COLUMN cleared_at TIMESTAMP NULL");
        await db.query("UPDATE crm_users SET cleared_at = COALESCE(notified_at, NOW()) - INTERVAL 7 DAY");
      }
      await db.query(`CREATE TABLE IF NOT EXISTS crm_notification_reads (
        user_id   INT UNSIGNED NOT NULL,
        item_key  VARCHAR(80)  NOT NULL COMMENT 'e.g. contact:12, payment:4, application:7',
        read_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, item_key),
        CONSTRAINT fk_notification_reads_user FOREIGN KEY (user_id) REFERENCES crm_users (id) ON DELETE CASCADE
      ) ${TABLE_OPTIONS}`);
    },
  },

  {
    id: "2026-11-02-service-forms-clean-columns",
    name: "Service forms: add website, country, timeline; drop non-form columns across enquiries",
    async up(db) {
      // 1. Drop non-form columns from contact_enquiries
      const contactCols = await columns(db, "contact_enquiries");
      for (const col of ["agreed_terms", "page_url", "ip_address", "user_agent"]) {
        if (contactCols.has(col)) {
          await db.query(`ALTER TABLE contact_enquiries DROP COLUMN \`${col}\``);
        }
      }

      // 2. Add website, country, timeline and drop non-form columns from the 4 service tables
      for (const table of Object.keys(SERVICE_TABLES)) {
        const cols = await columns(db, table);
        if (!cols.has("company_website")) {
          await db.query(`ALTER TABLE \`${table}\` ADD COLUMN company_website VARCHAR(255) NULL AFTER company_name`);
        }
        if (!cols.has("country")) {
          await db.query(`ALTER TABLE \`${table}\` ADD COLUMN country VARCHAR(100) NULL AFTER company_website`);
        }
        if (!cols.has("timeline")) {
          await db.query(`ALTER TABLE \`${table}\` ADD COLUMN timeline VARCHAR(60) NULL AFTER budget`);
        }
        await db.query(`ALTER TABLE \`${table}\` MODIFY message TEXT NULL`);

        for (const col of ["agreed_terms", "source_page", "page_url", "ip_address", "user_agent"]) {
          if (cols.has(col)) {
            await db.query(`ALTER TABLE \`${table}\` DROP COLUMN \`${col}\``);
          }
        }
      }
    },
  },

  {
    id: "2026-11-02-clean-careers-columns",
    name: "Careers: clean job_openings and job_applications columns to match form fields and created timestamp",
    async up(db) {
      // 1. Clean job_openings
      const jobCols = await columns(db, "job_openings");
      if (jobCols.has("created_by")) {
        try {
          await db.query("ALTER TABLE job_openings DROP FOREIGN KEY fk_jobs_user");
        } catch {}
        try {
          await db.query("ALTER TABLE job_openings DROP INDEX fk_jobs_user");
        } catch {}
        await db.query("ALTER TABLE job_openings DROP COLUMN created_by");
      }
      if (jobCols.has("updated_at")) {
        await db.query("ALTER TABLE job_openings DROP COLUMN updated_at");
      }

      // 2. Clean job_applications
      const appCols = await columns(db, "job_applications");
      for (const col of ["mail_sent", "agreed_terms", "page_url", "ip_address", "user_agent"]) {
        if (appCols.has(col)) {
          await db.query(`ALTER TABLE job_applications DROP COLUMN \`${col}\``);
        }
      }
    },
  },

  {
    id: "2026-11-02-blogs-table",
    name: "Create blogs table and seed initial 9 industry blogs",
    async up(db) {
      await db.query(`CREATE TABLE IF NOT EXISTS blogs (
        id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
        slug          VARCHAR(190) NOT NULL,
        category      VARCHAR(100) NOT NULL,
        title         VARCHAR(255) NOT NULL,
        \`desc\`        TEXT         NOT NULL,
        author        VARCHAR(150) NOT NULL DEFAULT 'Quickupp Team',
        author_role   VARCHAR(150) NOT NULL DEFAULT 'Strategy Lead',
        read_time     VARCHAR(50)  NOT NULL DEFAULT '5 min read',
        img           LONGTEXT     NOT NULL,
        content       LONGTEXT     NOT NULL,
        is_published  TINYINT(1)   NOT NULL DEFAULT 1,
        created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_blogs_slug (slug),
        KEY idx_blogs_category (category),
        KEY idx_blogs_published (is_published)
      ) ${TABLE_OPTIONS}`);

      const [existing] = await db.query("SELECT COUNT(*) AS c FROM blogs");
      if (existing[0].c === 0) {
        try {
          const seedData = SEED_BLOGS;
          for (const b of seedData) {
            await db.query(
              `INSERT INTO blogs (slug, category, title, \`desc\`, author, author_role, read_time, img, content, is_published)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
              [
                b.slug,
                b.category,
                b.title,
                b.desc,
                b.author,
                b.authorRole,
                b.readTime,
                b.img,
                JSON.stringify(b.content),
              ]
            );
          }
        } catch (err) {
          console.warn("[migrations] failed to seed blogs:", err);
        }
      }
    },
  },
  {
    id: "2026-11-02-clean-blogs-entities",
    name: "Clean HTML entities in blogs and re-sync content",
    async up(db) {
      try {
        const seedData = SEED_BLOGS;
        for (const b of seedData) {
          await db.query(
            `UPDATE blogs 
             SET title = ?, \`desc\` = ?, content = ? 
             WHERE slug = ?`,
            [b.title, b.desc, JSON.stringify(b.content), b.slug]
          );
        }
      } catch (err) {
        console.warn("[migrations] failed to clean blogs:", err);
      }
    },
  },
  {
    id: "2026-11-02-payments-online-checkout",
    name: "Payments: add client_phone, category, billing dates and paypal_order_id for online checkout",
    async up(db) {
      const cols = await columns(db, "payments");
      if (!cols.has("client_phone")) {
        await db.query("ALTER TABLE payments ADD COLUMN client_phone VARCHAR(50) NULL AFTER client_email");
      }
      if (!cols.has("category")) {
        await db.query("ALTER TABLE payments ADD COLUMN category VARCHAR(150) NULL AFTER company_name");
      }
      if (!cols.has("billing_start_date")) {
        await db.query("ALTER TABLE payments ADD COLUMN billing_start_date DATE NULL AFTER service");
      }
      if (!cols.has("billing_end_date")) {
        await db.query("ALTER TABLE payments ADD COLUMN billing_end_date DATE NULL AFTER billing_start_date");
      }
      if (!cols.has("paypal_order_id")) {
        await db.query("ALTER TABLE payments ADD COLUMN paypal_order_id VARCHAR(100) NULL AFTER reference");
      }
    },
  },
  {
    id: "2026-11-02-payments-partial-payments",
    name: "Payments: add total_amount, payment_type, and remaining_amount columns",
    async up(db) {
      const cols = await columns(db, "payments");
      if (!cols.has("total_amount")) {
        await db.query("ALTER TABLE payments ADD COLUMN total_amount DECIMAL(12, 2) NULL AFTER amount");
      }
      if (!cols.has("payment_type")) {
        await db.query("ALTER TABLE payments ADD COLUMN payment_type ENUM('full', 'partial') NOT NULL DEFAULT 'full' AFTER total_amount");
      }
      if (!cols.has("remaining_amount")) {
        await db.query("ALTER TABLE payments ADD COLUMN remaining_amount DECIMAL(12, 2) NULL AFTER payment_type");
      }
    },
  },
  {
    id: "2026-11-02-payments-source-tab",
    name: "Payments: modify source column to support website and payment_link tabs",
    async up(db) {
      await db.query("ALTER TABLE payments MODIFY COLUMN source VARCHAR(50) NOT NULL DEFAULT 'website'");
      await db.query("UPDATE payments SET source = 'website' WHERE source = 'online' OR paypal_order_id IS NOT NULL");
    },
  },
  {
    id: "2026-11-02-payments-category-multi-select",
    name: "Payments: expand category column to VARCHAR(500) for multi-select categories",
    async up(db) {
      await db.query("ALTER TABLE payments MODIFY COLUMN category VARCHAR(500) NULL");
    },
  },
  {
    id: "2026-11-02-service-youtube-promotion",
    name: "Service forms: add service_youtube_promotion table for YouTube leads",
    async up(db) {
      await db.query(`CREATE TABLE IF NOT EXISTS service_youtube_promotion (
        id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
        full_name        VARCHAR(150) NOT NULL,
        email            VARCHAR(190) NOT NULL,
        phone            VARCHAR(40)  NULL,
        company_name     VARCHAR(190) NULL,
        company_website  VARCHAR(255) NULL,
        country          VARCHAR(100) NULL,
        industry         VARCHAR(100) NOT NULL,
        other_industry   VARCHAR(150) NULL,
        service          VARCHAR(150) NOT NULL,
        category         VARCHAR(150) NOT NULL,
        budget           VARCHAR(60)  NULL,
        timeline         VARCHAR(60)  NULL,
        youtube_link     VARCHAR(500) NULL,
        message          TEXT         NULL,
        agreed_terms     TINYINT(1)   NOT NULL DEFAULT 1,
        source_page      VARCHAR(150) NULL,
        page_url         VARCHAR(500) NULL,
        status           ENUM('new','contacted','in_progress','on_hold','closed') NOT NULL DEFAULT 'new',
        created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_created (created_at),
        KEY idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    },
  },
  {
    id: "2026-11-02-service-tables-category-expand",
    name: "Service forms & manual leads: expand category column to VARCHAR(500) for multi-select categories",
    async up(db) {
      await db.query("ALTER TABLE service_digital_marketing MODIFY COLUMN category VARCHAR(500) NOT NULL");
      await db.query("ALTER TABLE service_ai_automation MODIFY COLUMN category VARCHAR(500) NOT NULL");
      await db.query("ALTER TABLE service_it_services MODIFY COLUMN category VARCHAR(500) NOT NULL");
      await db.query("ALTER TABLE service_staff_augmentation MODIFY COLUMN category VARCHAR(500) NOT NULL");
      await db.query("ALTER TABLE service_youtube_promotion MODIFY COLUMN category VARCHAR(500) NOT NULL");
      await db.query("ALTER TABLE manual_leads MODIFY COLUMN category VARCHAR(500) NOT NULL");
    },
  },
  {
    id: "2026-11-03-remove-extra-blog-takeaways",
    name: "Sync blogs content from seed-blogs.json (remove extra keyTakeaways)",
    async up(db) {
      try {
        const seedData = SEED_BLOGS;
        for (const b of seedData) {
          await db.query(
            `UPDATE blogs 
             SET title = ?, \`desc\` = ?, content = ? 
             WHERE slug = ?`,
            [b.title, b.desc, JSON.stringify(b.content), b.slug]
          );
        }
      } catch (err) {
        console.warn("[migrations] failed to clean blogs content:", err);
      }
    },
  },
  {
    id: "2026-11-04-blogs-from-document",
    name: "Blogs: text, links and SEO titles straight from the blog document",
    async up(db) {
      try {
        const seedData = SEED_BLOGS;
        for (const b of seedData) {
          const [found] = await db.query("SELECT id FROM blogs WHERE slug = ? LIMIT 1", [b.slug]);
          if (found.length) {
            await db.query("UPDATE blogs SET title = ?, `desc` = ?, content = ?, is_published = 1 WHERE slug = ?", [
              b.title,
              b.desc,
              JSON.stringify(b.content),
              b.slug,
            ]);
          } else {
            await db.query(
              "INSERT INTO blogs (slug, category, title, `desc`, img, content, is_published) VALUES (?, ?, ?, ?, ?, ?, 1)",
              [b.slug, b.category || "Blog", b.title, b.desc, b.img, JSON.stringify(b.content)]
            );
          }
        }
      } catch (err) {
        console.warn("[migrations] failed to sync blogs from the document:", err);
      }
    },
  },
  {
    id: "2026-11-03-drop-category-from-service-youtube-promotion",
    name: "Service forms: drop category column from service_youtube_promotion",
    async up(db) {
      const cols = await columns(db, "service_youtube_promotion");
      if (cols.has("category")) {
        await db.query("ALTER TABLE service_youtube_promotion DROP COLUMN category");
      }
    },
  },
  {
    id: "2026-11-03-payments-link-fields",
    name: "Payments: add token, expires_at, link_status, lead_source, and quantity for payment links",
    async up(db) {
      const cols = await columns(db, "payments");
      if (!cols.has("token")) {
        await db.query("ALTER TABLE payments ADD COLUMN token VARCHAR(64) UNIQUE NULL AFTER invoice_number");
      }
      if (!cols.has("expires_at")) {
        await db.query("ALTER TABLE payments ADD COLUMN expires_at DATETIME NULL AFTER paid_at");
      }
      if (!cols.has("link_status")) {
        await db.query("ALTER TABLE payments ADD COLUMN link_status VARCHAR(40) NOT NULL DEFAULT 'active' AFTER status");
      }
      if (!cols.has("lead_source")) {
        await db.query("ALTER TABLE payments ADD COLUMN lead_source VARCHAR(100) NULL AFTER source");
      }
      if (!cols.has("quantity")) {
        await db.query("ALTER TABLE payments ADD COLUMN quantity VARCHAR(100) NULL AFTER category");
      }
      await db.query("ALTER TABLE payments MODIFY COLUMN status VARCHAR(40) NOT NULL DEFAULT 'pending'");
    },
  },
  {
    id: "2026-11-03-payments-balance-due-date",
    name: "Payments: add balance_due_date and balance_reminder_sent_at",
    async up(db) {
      const cols = await columns(db, "payments");
      if (!cols.has("balance_due_date")) {
        await db.query("ALTER TABLE payments ADD COLUMN balance_due_date DATE NULL AFTER billing_end_date");
      }
      if (!cols.has("balance_reminder_sent_at")) {
        await db.query("ALTER TABLE payments ADD COLUMN balance_reminder_sent_at DATETIME NULL AFTER balance_due_date");
      }
    },
  },

  {
    id: "2026-11-03-payment-links-table-and-assigned-to",
    name: "Enquiries: add assigned_to to all enquiry tables; Payments: add industry and create payment_links table",
    async up(db) {
      // 1. Add assigned_to to all enquiry tables so UNION_SQL and assignments never fail
      const enquiryTables = [
        "contact_enquiries",
        "service_digital_marketing",
        "service_ai_automation",
        "service_it_services",
        "service_staff_augmentation",
        "service_youtube_promotion",
      ];
      for (const t of enquiryTables) {
        try {
          const cols = await columns(db, t);
          if (!cols.has("assigned_to")) {
            await db.query(`ALTER TABLE \`${t}\` ADD COLUMN assigned_to VARCHAR(120) NULL AFTER status`);
          }
        } catch (err) {
          console.warn(`[migrations] could not add assigned_to to ${t}:`, err);
        }
      }

      // 2. Add industry to payments table if not present
      try {
        const pCols = await columns(db, "payments");
        if (!pCols.has("industry")) {
          await db.query("ALTER TABLE payments ADD COLUMN industry VARCHAR(150) NULL AFTER category");
        }
      } catch (err) {
        console.warn("[migrations] could not add industry to payments:", err);
      }

      // 3. Create payment_links table dedicated for CRM-generated payment links
      await db.query(`CREATE TABLE IF NOT EXISTS payment_links (
        id                       INT UNSIGNED  NOT NULL AUTO_INCREMENT,
        client_name              VARCHAR(150)  NOT NULL,
        client_email             VARCHAR(190)  NOT NULL,
        client_phone             VARCHAR(50)   NOT NULL,
        company_name             VARCHAR(190)  NULL,
        service                  VARCHAR(150)  NOT NULL,
        category                 VARCHAR(500)  NULL,
        industry                 VARCHAR(150)  NULL,
        quantity                 VARCHAR(500)  NULL,
        description              VARCHAR(255)  NULL,
        amount                   DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        total_amount             DECIMAL(12,2) NOT NULL,
        payment_type             ENUM('full', 'partial') NOT NULL DEFAULT 'full',
        remaining_amount         DECIMAL(12,2) NOT NULL,
        currency                 CHAR(3)       NOT NULL DEFAULT 'USD',
        method                   VARCHAR(40)   NOT NULL DEFAULT 'PayPal',
        status                   VARCHAR(40)   NOT NULL DEFAULT 'pending',
        link_status              VARCHAR(40)   NOT NULL DEFAULT 'active',
        source                   VARCHAR(50)   NOT NULL DEFAULT 'payment_link',
        lead_source              VARCHAR(100)  NULL DEFAULT 'manual',
        reference                VARCHAR(120)  NULL,
        paypal_order_id          VARCHAR(100)  NULL,
        invoice_number           VARCHAR(60)   NULL,
        billing_start_date       DATE          NULL,
        billing_end_date         DATE          NULL,
        balance_due_date         DATE          NULL,
        balance_reminder_sent_at DATETIME      NULL,
        token                    VARCHAR(64)   UNIQUE NOT NULL,
        expires_at               DATETIME      NULL,
        paid_at                  DATE          NULL,
        notes                    TEXT          NULL,
        created_by               INT UNSIGNED  NULL,
        created_at               TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at               TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_token (token),
        KEY idx_status (status),
        KEY idx_link_status (link_status),
        KEY idx_paid_at (paid_at),
        CONSTRAINT fk_payment_links_user FOREIGN KEY (created_by) REFERENCES crm_users (id) ON DELETE SET NULL
      ) ${TABLE_OPTIONS}`);

      // 4. Safely migrate existing payment links from payments to payment_links table
      try {
        await db.query(`
          INSERT IGNORE INTO payment_links (
            id, client_name, client_email, client_phone, company_name, service, category, industry,
            quantity, description, amount, total_amount, payment_type, remaining_amount, currency,
            method, status, link_status, source, lead_source, reference, paypal_order_id,
            invoice_number, billing_start_date, billing_end_date, balance_due_date,
            balance_reminder_sent_at, token, expires_at, paid_at, notes, created_by, created_at, updated_at
          )
          SELECT
            id, client_name, COALESCE(client_email, ''), COALESCE(client_phone, ''), company_name, service, category, industry,
            quantity, description, amount, COALESCE(total_amount, amount), COALESCE(payment_type, 'full'), COALESCE(remaining_amount, 0), currency,
            method, status, link_status, 'payment_link', lead_source, reference, paypal_order_id,
            invoice_number, billing_start_date, billing_end_date, balance_due_date,
            balance_reminder_sent_at, token, expires_at, paid_at, notes, created_by, created_at, updated_at
          FROM payments
          WHERE token IS NOT NULL AND token != '';
        `);
      } catch (err) {
        console.warn("[migrations] could not copy existing payment links:", err);
      }
    },
  },
  {
    id: "2026-11-03-lead-attachments-and-payment-links",
    name: "Lead attachments table, lead_id on payment_links and payments",
    async up(db) {
      // 2. Add lead_id to payment_links table if missing
      const plCols = await columns(db, "payment_links");
      if (!plCols.has("lead_id")) {
        await db.query("ALTER TABLE payment_links ADD COLUMN lead_id INT UNSIGNED NULL AFTER lead_source");
      }

      // 3. Add lead_id and lead_source to payments table if missing
      const payCols = await columns(db, "payments");
      if (!payCols.has("lead_id")) {
        await db.query("ALTER TABLE payments ADD COLUMN lead_id INT UNSIGNED NULL AFTER source");
      }
      if (!payCols.has("lead_source")) {
        await db.query("ALTER TABLE payments ADD COLUMN lead_source VARCHAR(100) NULL AFTER lead_id");
      }
    },
  },

  {
    id: "2026-11-03-contact-enquiries-category",
    name: "Add category column to contact_enquiries table",
    async up(db) {
      const cols = await columns(db, "contact_enquiries");
      if (!cols.has("category")) {
        await db.query("ALTER TABLE contact_enquiries ADD COLUMN category VARCHAR(500) NULL AFTER project_type");
      }
    },
  },

  {
    id: "2026-11-03-store-attachments-in-leads-and-project-status",
    name: "Store attachments directly in lead tables, drop lead_attachments table, add project_status",
    async up(db) {
      // 1. Drop separate lead_attachments table so no extra table exists
      try {
        await db.query("DROP TABLE IF EXISTS lead_attachments");
      } catch (err) {
        console.warn("[migrations] drop lead_attachments warning:", err);
      }

      // 2. Add attachments and project_status columns directly to manual_leads and all other lead tables
      const leadTables = [
        "manual_leads",
        "contact_enquiries",
        "service_digital_marketing",
        "service_ai_automation",
        "service_it_services",
        "service_staff_augmentation",
        "service_youtube_promotion",
      ];

      for (const t of leadTables) {
        try {
          const cols = await columns(db, t);
          if (!cols.has("attachments")) {
            await db.query(`ALTER TABLE \`${t}\` ADD COLUMN attachments LONGTEXT NULL DEFAULT NULL`);
          }
          if (!cols.has("project_status")) {
            await db.query(`ALTER TABLE \`${t}\` ADD COLUMN project_status VARCHAR(60) NOT NULL DEFAULT 'Not Started'`);
          }
          if (!cols.has("assigned_to")) {
            await db.query(`ALTER TABLE \`${t}\` ADD COLUMN assigned_to VARCHAR(150) NULL`);
          }
        } catch (err) {
          console.warn(`[migrations] error altering table ${t}:`, err);
        }
      }
    },
  },

  {
    id: "2026-11-04-blog-images",
    name: "Blogs: store images directly on the blog record (LONGTEXT img and content)",
    async up(db) {
      await db.query("DROP TABLE IF EXISTS blog_images");
      const [col] = await db.query(
        "SELECT DATA_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'blogs' AND COLUMN_NAME = 'img'"
      );
      if (col.length && col[0].DATA_TYPE !== "longtext") {
        await db.query("ALTER TABLE blogs MODIFY COLUMN img LONGTEXT NOT NULL");
      }
    },
  },

  {
    id: "2026-11-04-blogs-from-document-v2",
    name: "Blogs: text, links and SEO titles from the blog document (bundled data)",
    async up(db) {
      for (const b of SEED_BLOGS) {
        const [found] = await db.query("SELECT id FROM blogs WHERE slug = ? LIMIT 1", [b.slug]);
        if (found.length) {
          await db.query("UPDATE blogs SET title = ?, `desc` = ?, content = ?, is_published = 1 WHERE slug = ?", [
            b.title,
            b.desc,
            JSON.stringify(b.content),
            b.slug,
          ]);
        } else {
          await db.query(
            "INSERT INTO blogs (slug, category, title, `desc`, img, content, is_published) VALUES (?, ?, ?, ?, ?, ?, 1)",
            [b.slug, b.category || "Blog", b.title, b.desc, b.img, JSON.stringify(b.content)]
          );
        }
      }
    },
  },

  {
    id: "2026-11-04-crm-activity-log",
    name: "CRM: activity history for leads and payments; viewable passwords for the super admin",
    async up(db) {
      await db.query(`CREATE TABLE IF NOT EXISTS crm_activity (
        id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        entity_type   VARCHAR(20)  NOT NULL COMMENT 'lead, payment or payment_link',
        entity_source VARCHAR(40)  NOT NULL DEFAULT '' COMMENT 'lead source key (contact, manual, ...)',
        entity_id     INT UNSIGNED NOT NULL,
        action        VARCHAR(40)  NOT NULL COMMENT 'created, status, assigned, updated, payment, ...',
        field_name    VARCHAR(60)  NULL,
        old_value     TEXT         NULL,
        new_value     TEXT         NULL,
        message       VARCHAR(600) NOT NULL,
        actor_type    VARCHAR(20)  NOT NULL DEFAULT 'user' COMMENT 'user, website, gateway or system',
        actor_id      INT UNSIGNED NULL,
        actor_name    VARCHAR(120) NULL COMMENT 'name at the time of the action',
        actor_role    VARCHAR(40)  NULL COMMENT 'role at the time of the action',
        event_key     VARCHAR(190) NULL COMMENT 'stops the same outside event being logged twice',
        meta          TEXT         NULL,
        created_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY uq_event_key (event_key),
        KEY idx_entity (entity_type, entity_source, entity_id, created_at)
      ) ${TABLE_OPTIONS}`);

      // every existing lead / payment gets the real start of its history
      // (taken from the record itself: when it came in and where from)
      const leadSources = [
        ["contact_enquiries", "contact", "Website Contact Form"],
        ["service_digital_marketing", "digital-marketing", "Website Digital Marketing Form"],
        ["service_ai_automation", "ai-automation", "Website AI & Automation Form"],
        ["service_it_services", "it-services", "Website IT Services Form"],
        ["service_staff_augmentation", "staff-augmentation", "Website Staff Augmentation Form"],
        ["service_youtube_promotion", "youtube", "Website YouTube Video Promotion Form"],
      ];
      for (const [table, src, label] of leadSources) {
        try {
          await db.query(
            `INSERT IGNORE INTO crm_activity (entity_type, entity_source, entity_id, action, message, actor_type, actor_name, event_key, created_at)
             SELECT 'lead', ?, id, 'created', ?, 'website', ?, CONCAT('backfill:lead:', ?, ':', id), created_at FROM \`${table}\``,
            [src, `New enquiry received from ${label}.`, label, src]
          );
        } catch (err) {
          console.warn(`[migrations] activity backfill for ${table} skipped:`, err?.message || err);
        }
      }
      try {
        await db.query(
          `INSERT IGNORE INTO crm_activity (entity_type, entity_source, entity_id, action, message, actor_type, actor_id, actor_name, actor_role, event_key, created_at)
           SELECT 'lead', 'manual', m.id, 'created',
                  IF(u.id IS NULL, 'New lead created.', CONCAT('New lead created by ', IF(u.role = 'super_admin', 'Super Admin', 'Admin'), ' (', u.name, ').')),
                  IF(u.id IS NULL, 'system', 'user'), u.id, COALESCE(u.name, 'CRM'), u.role, CONCAT('backfill:lead:manual:', m.id), m.created_at
             FROM manual_leads m LEFT JOIN crm_users u ON u.id = m.created_by`
        );
      } catch (err) {
        console.warn("[migrations] activity backfill for manual_leads skipped:", err?.message || err);
      }
      try {
        await db.query(
          `INSERT IGNORE INTO crm_activity (entity_type, entity_source, entity_id, action, new_value, message, actor_type, actor_id, actor_name, actor_role, event_key, created_at)
           SELECT 'payment_link', '', p.id, 'created', CONCAT('$', FORMAT(p.total_amount, 2)),
                  CONCAT('Payment link ', COALESCE(p.invoice_number, CONCAT('#', p.id)), ' created for $', FORMAT(p.total_amount, 2),
                         IF(u.id IS NULL, '.', CONCAT(' by ', IF(u.role = 'super_admin', 'Super Admin', 'Admin'), ' (', u.name, ').'))),
                  IF(u.id IS NULL, 'system', 'user'), u.id, COALESCE(u.name, 'CRM'), u.role, CONCAT('backfill:payment_link:', p.id), p.created_at
             FROM payment_links p LEFT JOIN crm_users u ON u.id = p.created_by`
        );
      } catch (err) {
        console.warn("[migrations] activity backfill for payment_links skipped:", err?.message || err);
      }
      try {
        await db.query(
          `INSERT IGNORE INTO crm_activity (entity_type, entity_source, entity_id, action, new_value, message, actor_type, actor_id, actor_name, actor_role, event_key, created_at)
           SELECT 'payment', '', p.id, IF(p.source = 'website', 'payment', 'created'), CONCAT('$', FORMAT(p.amount, 2)),
                  IF(p.source = 'website',
                     CONCAT('Website payment of $', FORMAT(p.amount, 2), ' through PayPal', IF(p.reference IS NULL, '', CONCAT(' (Ref: ', p.reference, ')')), '.'),
                     CONCAT('Payment of $', FORMAT(p.amount, 2), ' recorded',
                            IF(u.id IS NULL, '.', CONCAT(' by ', IF(u.role = 'super_admin', 'Super Admin', 'Admin'), ' (', u.name, ').')))),
                  IF(p.source = 'website', 'gateway', IF(u.id IS NULL, 'system', 'user')),
                  IF(p.source = 'website', NULL, u.id),
                  IF(p.source = 'website', 'PayPal', COALESCE(u.name, 'CRM')),
                  IF(p.source = 'website', NULL, u.role),
                  CONCAT('backfill:payment:', p.id), p.created_at
             FROM payments p LEFT JOIN crm_users u ON u.id = p.created_by`
        );
      } catch (err) {
        console.warn("[migrations] activity backfill for payments skipped:", err?.message || err);
      }

      const cols = await columns(db, "crm_users");
      if (!cols.has("password_view")) {
        await db.query("ALTER TABLE crm_users ADD COLUMN password_view TEXT NULL COMMENT 'encrypted copy of the current password, shown only to the super admin' AFTER password_hash");
      }
      if (!cols.has("password_changed_at")) {
        await db.query("ALTER TABLE crm_users ADD COLUMN password_changed_at TIMESTAMP NULL AFTER password_view");
      }
    },
  },

  {
    id: "2026-11-05-crm-calendly-meetings",
    name: "CRM: meetings booked through Calendly (one row per meeting, kept in step with Calendly)",
    async up(db) {
      await db.query(`CREATE TABLE IF NOT EXISTS crm_meetings (
        id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
        invitee_uri         VARCHAR(255) NOT NULL COMMENT 'the current Calendly invitee (changes when the meeting is rescheduled)',
        event_uri           VARCHAR(255) NOT NULL COMMENT 'the current Calendly scheduled event',
        event_name          VARCHAR(255) NOT NULL DEFAULT '',
        status              VARCHAR(20)  NOT NULL DEFAULT 'scheduled' COMMENT 'scheduled, rescheduled or canceled',
        start_time          DATETIME     NOT NULL COMMENT 'UTC',
        end_time            DATETIME     NOT NULL COMMENT 'UTC',
        invitee_timezone    VARCHAR(80)  NULL,
        invitee_name        VARCHAR(190) NOT NULL DEFAULT '',
        invitee_email       VARCHAR(190) NOT NULL DEFAULT '',
        invitee_phone       VARCHAR(60)  NULL,
        location_type       VARCHAR(60)  NULL,
        location_text       VARCHAR(500) NULL,
        join_url            VARCHAR(700) NULL,
        answers             TEXT         NULL COMMENT 'JSON: the booking form questions and answers',
        guests              TEXT         NULL COMMENT 'JSON: guest emails',
        host_name           VARCHAR(190) NULL,
        host_email          VARCHAR(190) NULL,
        reschedule_count    INT UNSIGNED NOT NULL DEFAULT 0,
        previous_start_time DATETIME     NULL COMMENT 'UTC, the time before the last reschedule',
        canceled_by         VARCHAR(190) NULL,
        cancel_reason       TEXT         NULL,
        canceled_at         DATETIME     NULL COMMENT 'UTC',
        history             TEXT         NULL COMMENT 'JSON: booked / rescheduled / canceled, in order',
        booked_at           DATETIME     NULL COMMENT 'UTC, when it was first booked',
        deleted_at          DATETIME     NULL COMMENT 'removed from the CRM list (Calendly is not changed)',
        synced_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_invitee (invitee_uri),
        KEY idx_start (start_time),
        KEY idx_status (status)
      ) ${TABLE_OPTIONS}`);
      // every Calendly invitee ever seen for a meeting (a reschedule makes a new
      // invitee), so a reschedule or a cancellation finds the same row
      await db.query(`CREATE TABLE IF NOT EXISTS crm_meeting_invitees (
        invitee_uri      VARCHAR(255) NOT NULL,
        meeting_id       INT UNSIGNED NOT NULL,
        event_uri        VARCHAR(255) NULL,
        event_updated_at VARCHAR(40)  NULL COMMENT 'Calendly updated_at of the event when last read',
        PRIMARY KEY (invitee_uri),
        KEY idx_meeting (meeting_id),
        KEY idx_event (event_uri)
      ) ${TABLE_OPTIONS}`);
    },
  },

  {
    id: "2026-11-05-payments-longer-description",
    name: "Payments: room for long descriptions and category lists (a checkout with many categories was not saved)",
    async up(db) {
      for (const table of ["payments", "payment_links"]) {
        try {
          await db.query(`ALTER TABLE \`${table}\` MODIFY description TEXT NULL, MODIFY category TEXT NULL, MODIFY quantity TEXT NULL`);
        } catch (err) {
          console.warn(`[migrations] widening ${table} skipped:`, err?.message || err);
        }
      }
    },
  },

  {
    id: "2026-11-05-balance-reminder-stages",
    name: "Payments: add dedicated balance_reminder_10d_sent_at and balance_reminder_2d_sent_at to guarantee exactly one email per milestone",
    async up(db) {
      for (const table of ["payments", "payment_links"]) {
        const cols = await columns(db, table);
        if (!cols.has("balance_reminder_sent_at")) {
          await db.query(`ALTER TABLE \`${table}\` ADD COLUMN balance_reminder_sent_at DATETIME NULL`);
        }
        if (!cols.has("balance_reminder_10d_sent_at")) {
          await db.query(`ALTER TABLE \`${table}\` ADD COLUMN balance_reminder_10d_sent_at DATETIME NULL`);
        }
        if (!cols.has("balance_reminder_2d_sent_at")) {
          await db.query(`ALTER TABLE \`${table}\` ADD COLUMN balance_reminder_2d_sent_at DATETIME NULL`);
        }
      }
    },
  },

  {
    id: "2026-11-10-industry-enquiries",
    name: "Industry pages: add industry_enquiries table for the lead form on the industry pages",
    async up(db) {
      await db.query(INDUSTRY_ENQUIRIES_SQL);
    },
  },

  {
    id: "2026-11-10-crm-seo-role",
    name: "CRM: SEO role (Blogs and Job Openings only) and the SEO account for Rutvik Zore",
    async up(db) {
      await db.query("ALTER TABLE crm_users MODIFY COLUMN role ENUM('super_admin','admin','seo') NOT NULL DEFAULT 'admin'");
      const [found] = await db.query("SELECT id FROM crm_users WHERE username = 'seo' OR email = 'seo@quickuppsoftech.us' LIMIT 1");
      if (found.length) return;
      // the starting password the super admin chose; only its scrypt hash is kept here.
      // Rutvik can change it (and the email) under My Profile.
      const startHash =
        "scrypt$16384$8$1$i4bDOiFBy8i1rOhxB683uA==$pnm6etdCnuEyCDMtcGCOsEy+Ow1fkw4YNHIEHiKOwD332J9QJ6W7E0bOHYQpiSCfYOMna8f9xlhsgvvMApVePg==";
      const cols = await columns(db, "crm_users");
      const changedAt = cols.has("password_changed_at");
      await db.query(
        `INSERT INTO crm_users (name, username, email, password_hash, role, is_active, notified_at${changedAt ? ", password_changed_at" : ""})
         VALUES (?, ?, ?, ?, 'seo', 1, NOW()${changedAt ? ", NOW()" : ""})`,
        ["Rutvik Zore", "seo", "seo@quickuppsoftech.us", startHash]
      );
    },
  },

  {
    id: "2026-11-11-payment-paid-time",
    name: "Payments: keep the time of each payment, not only the date (paid_at becomes date and time)",
    async up(db) {
      const [act] = await db.query("SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'crm_activity'");
      const hasActivity = Number(act[0].c) > 0;
      for (const [table, entity] of [["payments", "payment"], ["payment_links", "payment_link"]]) {
        const cols = await columns(db, table);
        if (!cols.has("paid_at")) continue;
        await db.query(`ALTER TABLE \`${table}\` MODIFY COLUMN paid_at DATETIME NULL`);
        // Earlier payments kept only the day. Give them the time the payment was
        // recorded that day: from the payment's activity history, else from the
        // record itself when it was created or last changed on that day.
        const fromActivity = hasActivity
          ? `LEFT JOIN (SELECT entity_id, DATE(created_at) AS d, MAX(created_at) AS at FROM crm_activity
                         WHERE entity_type = ? AND action = 'payment' GROUP BY entity_id, DATE(created_at)) a
                       ON a.entity_id = t.id AND a.d = DATE(t.paid_at)`
          : "";
        const hasUpdated = cols.has("updated_at");
        await db.query(
          `UPDATE \`${table}\` t ${fromActivity}
              SET t.paid_at = COALESCE(${hasActivity ? "a.at," : ""}
                    CASE WHEN DATE(t.created_at) = DATE(t.paid_at) THEN t.created_at
                         ${hasUpdated ? "WHEN DATE(t.updated_at) = DATE(t.paid_at) THEN t.updated_at" : ""} END,
                    t.paid_at)${hasUpdated ? ", t.updated_at = t.updated_at" : ""}
            WHERE t.paid_at IS NOT NULL AND TIME(t.paid_at) = '00:00:00'`,
          hasActivity ? [entity] : []
        );
      }
    },
  },

  {
    id: "2026-11-11-remove-pay-now-enquiries",
    name: "Enquiries: remove the Contact Form copies the website Pay Now checkout used to create (the payments stay in Payments)",
    async up(db) {
      // only the old Pay Now checkout wrote enquiries with these messages
      const [rows] = await db.query(
        `SELECT id FROM contact_enquiries
          WHERE message LIKE 'Website Pay Now Payment. Order #%'
             OR message LIKE '[PAYMENT FAILED]: Order #%'
             OR message LIKE '[PAYMENT PENDING]: Order #%'`
      );
      const ids = rows.map((r) => Number(r.id));
      if (!ids.length) return;
      const [[act]] = await db.query("SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'crm_activity'");
      if (Number(act.c) > 0) {
        await db.query("DELETE FROM crm_activity WHERE entity_type = 'lead' AND entity_source = 'contact' AND entity_id IN (?)", [ids]);
      }
      const [[reads]] = await db.query("SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'crm_notification_reads'");
      if (Number(reads.c) > 0) {
        await db.query("DELETE FROM crm_notification_reads WHERE item_key IN (?)", [ids.map((id) => `contact:${id}`)]);
      }
      await db.query("DELETE FROM contact_enquiries WHERE id IN (?)", [ids]);
    },
  },

  {
    id: "2026-11-11-blogs-longtext",
    name: "Blogs: cover (img) and article (content) can hold uploaded pictures (LONGTEXT)",
    async up(db) {
      const [rows] = await db.query(
        "SELECT COLUMN_NAME AS name, LOWER(DATA_TYPE) AS type FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'blogs' AND COLUMN_NAME IN ('img', 'content')"
      );
      for (const r of rows) {
        if (r.type !== "longtext") await db.query(`ALTER TABLE blogs MODIFY COLUMN \`${r.name}\` LONGTEXT NOT NULL`);
      }
    },
  },

  {
    id: "2026-11-11-blog-topic-covers",
    name: "Blogs: each of the original blogs gets its own cover photo matching its topic",
    async up(db) {
      // only blogs still on one of the six generic stock covers; a cover set in the CRM is kept
      const generic = ["", "/images/blog-img-01.jpg", "/images/blog-img-02.jpg", "/images/blog-img-03.jpg", "/images/blog-img-04.jpg", "/images/blog-img-05.jpg", "/images/blog-img-06.jpg"];
      const covers = [
        ["role-of-ai-in-healthcare-marketing", "https://images.unsplash.com/photo-1666886573531-48d2e3c2b684?auto=format&fit=crop&w=1600&q=80"],
        ["how-paid-ads-generate-quality-admission-leads", "https://images.unsplash.com/photo-1758270704464-f980b03b9633?auto=format&fit=crop&w=1600&q=80"],
        ["how-local-seo-helps-real-estate-businesses", "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=80"],
        ["whatsapp-marketing-home-service-businesses", "https://images.unsplash.com/photo-1749532125405-70950966b0e5?auto=format&fit=crop&w=1600&q=80"],
        ["content-marketing-it-saas-companies-brand-authority", "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=1600&q=80"],
        ["how-video-marketing-helps-interior-designers", "https://images.unsplash.com/photo-1774199496664-a9690967be5a?auto=format&fit=crop&w=1600&q=80"],
        ["online-presence-professional-service-businesses", "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1600&q=80"],
        ["ai-digital-marketing-ecommerce-businesses", "https://images.unsplash.com/photo-1768987439370-bd60d3d0b28b?auto=format&fit=crop&w=1600&q=80"],
        ["seo-for-travel-agencies", "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=1600&q=80"],
      ];
      for (const [slug, img] of covers) {
        await db.query("UPDATE blogs SET img = ? WHERE slug = ? AND img IN (?)", [img, slug, generic]);
      }
    },
  },

  {
    id: "2026-11-11-payment-transactions",
    name: "Payments: one row per PayPal transaction (deposit, balance or full), so each transaction ID is kept",
    async up(db) {
      await db.query(`CREATE TABLE IF NOT EXISTS payment_transactions (
        id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
        record_table    VARCHAR(20)  NOT NULL COMMENT 'payments or payment_links',
        record_id       INT UNSIGNED NOT NULL,
        kind            VARCHAR(20)  NOT NULL COMMENT 'full, deposit or balance',
        amount          DECIMAL(12,2) NOT NULL DEFAULT 0,
        currency        VARCHAR(8)   NOT NULL DEFAULT 'USD',
        status          VARCHAR(20)  NOT NULL COMMENT 'paid, pending or failed',
        transaction_id  VARCHAR(64)  NULL COMMENT 'PayPal capture id',
        paypal_order_id VARCHAR(64)  NULL,
        note            VARCHAR(255) NULL,
        created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_record (record_table, record_id, created_at),
        UNIQUE KEY uq_transaction (transaction_id)
      ) ${TABLE_OPTIONS}`);
    },
  },
  {
    id: "2026-11-11-dynamic-crm-calendly",
    name: "CRM: dynamic Calendly meetings (reschedule_url, cancel_url, notes, source, lead_id)",
    async up(db) {
      const cols = await columns(db, "crm_meetings");
      if (!cols.has("reschedule_url")) {
        await db.query("ALTER TABLE crm_meetings ADD COLUMN reschedule_url VARCHAR(700) NULL AFTER join_url");
      }
      if (!cols.has("cancel_url")) {
        await db.query("ALTER TABLE crm_meetings ADD COLUMN cancel_url VARCHAR(700) NULL AFTER reschedule_url");
      }
      if (!cols.has("notes")) {
        await db.query("ALTER TABLE crm_meetings ADD COLUMN notes TEXT NULL AFTER answers");
      }
      if (!cols.has("lead_id")) {
        await db.query("ALTER TABLE crm_meetings ADD COLUMN lead_id INT UNSIGNED NULL AFTER notes");
      }
      if (!cols.has("source")) {
        await db.query("ALTER TABLE crm_meetings ADD COLUMN source VARCHAR(60) NOT NULL DEFAULT 'website' AFTER lead_id");
      }
    },
  },
  {
    id: "2026-11-11-merge-rescheduled-duplicate-meetings",
    name: "CRM: clean up and deduplicate meetings split by Calendly reschedule events",
    async up(db) {
      try {
        await db.query(`
          UPDATE crm_meetings c
          JOIN crm_meetings a ON c.invitee_email = a.invitee_email
            AND c.id <> a.id
            AND c.status = 'canceled'
            AND a.status IN ('scheduled', 'rescheduled')
            AND (c.cancel_reason LIKE '%reschedul%' OR a.reschedule_count > 0 OR ABS(TIMESTAMPDIFF(HOUR, c.booked_at, a.booked_at)) <= 48)
          SET c.deleted_at = UTC_TIMESTAMP()
          WHERE c.deleted_at IS NULL
        `);
      } catch (err) {
        console.warn("[migrations] merge duplicate rescheduled meetings notice:", err);
      }
    },
  },

  {
    id: "2026-11-12-meeting-notices",
    name: "CRM: one team email per meeting booking, reschedule and cancellation",
    async up(db) {
      // one row per email sent, so seeing the same Calendly change again never sends it twice
      await db.query(`CREATE TABLE IF NOT EXISTS crm_meeting_notices (
        id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
        meeting_id  INT UNSIGNED NOT NULL,
        kind        VARCHAR(20)  NOT NULL COMMENT 'booked, rescheduled or canceled',
        notice_key  VARCHAR(255) NOT NULL,
        created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_notice (meeting_id, kind, notice_key)
      ) ${TABLE_OPTIONS}`);
    },
  },

  {
    id: "2026-11-12-blog-published-at",
    name: "Blogs: a published date and time for every blog (shown on the website)",
    async up(db) {
      const cols = await columns(db, "blogs");
      if (!cols.has("published_at")) {
        await db.query("ALTER TABLE blogs ADD COLUMN published_at DATETIME NULL AFTER is_published");
      }
      // blogs written before this: published when they were created
      await db.query("UPDATE blogs SET published_at = created_at WHERE published_at IS NULL");
    },
  },

  {
    id: "2026-11-12-meeting-reschedule-count",
    name: "CRM meetings: reschedule count = the reschedules in the history (one reschedule was counted twice)",
    async up(db) {
      const [rows] = await db.query("SELECT id, reschedule_count, history FROM crm_meetings WHERE reschedule_count > 0");
      for (const r of rows) {
        let h = [];
        try {
          h = JSON.parse(r.history || "[]");
        } catch {}
        if (!Array.isArray(h)) continue;
        const n = h.filter((x) => x && x.kind === "rescheduled").length;
        if (n !== Number(r.reschedule_count)) await db.query("UPDATE crm_meetings SET reschedule_count = ? WHERE id = ?", [n, r.id]);
      }
    },
  },

  {
    id: "2026-11-12-crm-viewer-role",
    name: "CRM: Viewer role (sees the whole CRM except Team & Users, can't change anything)",
    async up(db) {
      await db.query("ALTER TABLE crm_users MODIFY COLUMN role ENUM('super_admin','admin','seo','viewer') NOT NULL DEFAULT 'admin'");
    },
  },

  {
    id: "2026-11-12-crm-hr-role",
    name: "CRM: HR role (Job Openings and Job Applications only, full editing there)",
    async up(db) {
      await db.query("ALTER TABLE crm_users MODIFY COLUMN role ENUM('super_admin','admin','seo','viewer','hr') NOT NULL DEFAULT 'admin'");
    },
  },

  {
    id: "2026-11-12-plain-hyphen-budget-timeline",
    name: "Enquiries: budgets and timelines use a plain hyphen (\"$1,000 - $2,500\", \"Within 2-4 Weeks\")",
    async up(db) {
      // every enquiry table with a budget or timeline column: the saved choices match the form options again
      const [cols] = await db.query(
        "SELECT TABLE_NAME AS t, COLUMN_NAME AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND COLUMN_NAME IN ('budget', 'timeline')"
      );
      for (const { t, c } of cols) {
        await db.query(`UPDATE \`${t}\` SET \`${c}\` = REPLACE(REPLACE(\`${c}\`, ?, '-'), ?, '-') WHERE \`${c}\` LIKE ? OR \`${c}\` LIKE ?`, ["\u2013", "\u2014", "%\u2013%", "%\u2014%"]);
      }
    },
  },

  // ↑ add new changes below this line, never above
];

/*
 * Adds the CRM team accounts named in the CRM_* settings, if they don't exist
 * yet. An existing account (and its password) is never changed here, and a
 * second super admin is never added. With no CRM_* settings nothing happens.
 */
async function addCrmAccounts(db, env, log) {
  const accounts = [
    // the super admin always signs in with info@quickuppsoftech.us
    { role: "super_admin", name: env.CRM_SUPERADMIN_NAME || "Super Admin", email: env.CRM_SUPERADMIN_EMAIL && "info@quickuppsoftech.us", password: env.CRM_SUPERADMIN_PASSWORD, username: "superadmin" },
    { role: "admin", name: env.CRM_ADMIN_NAME || "Admin", email: env.CRM_ADMIN_EMAIL, password: env.CRM_ADMIN_PASSWORD, username: null },
  ];
  for (const a of accounts) {
    if (!a.email || !a.password) continue;
    const email = a.email.trim().toLowerCase();
    // only one super admin: never add a second one
    const [found] =
      a.role === "super_admin"
        ? await db.query("SELECT id FROM crm_users WHERE role = 'super_admin' OR email = ?", [email])
        : await db.query("SELECT id FROM crm_users WHERE email = ?", [email]);
    if (found.length) continue;
    const salt = randomBytes(16);
    const hash = scryptSync(a.password, salt, 64, { N: 16384, r: 8, p: 1 });
    const stored = `scrypt$16384$8$1$${salt.toString("base64")}$${hash.toString("base64")}`;
    let username = a.username || email.split("@")[0].toLowerCase().replace(/[^a-z0-9._-]/g, "") || "user";
    const [same] = await db.query("SELECT id FROM crm_users WHERE username = ?", [username]);
    if (same.length) username = `${username}${Date.now() % 10000}`;
    const cols = await columns(db, "crm_users");
    if (cols.has("password_view")) {
      await db.query(
        "INSERT INTO crm_users (name, username, email, password_hash, password_view, password_changed_at, role, notified_at) VALUES (?, ?, ?, ?, ?, NOW(), ?, NOW())",
        [a.name, username, email, stored, encryptSecret(a.password, env), a.role]
      );
    } else {
      await db.query("INSERT INTO crm_users (name, username, email, password_hash, role, notified_at) VALUES (?, ?, ?, ?, ?, NOW())", [
        a.name,
        username,
        email,
        stored,
        a.role,
      ]);
    }
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
  const [[lock]] = await db.query("SELECT GET_LOCK('quickupp_migrations', 5) AS ok");
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
