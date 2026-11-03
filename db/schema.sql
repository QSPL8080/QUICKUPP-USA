-- ============================================================================
-- Quickupp USA website — database tables (reference copy)
--
-- You normally don't need this file: the website creates and updates its
-- tables by itself every time it starts (see lib/migrations.mjs), on your
-- computer and on Hostinger.
-- Kept for a manual setup: phpMyAdmin → select the database → Import.
-- Safe to run more than once (tables are only created if missing).
-- ============================================================================

-- Contact page enquiries ------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_enquiries (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name       VARCHAR(150) NOT NULL,
  email           VARCHAR(190) NOT NULL,
  phone           VARCHAR(40)  NULL,
  company_name    VARCHAR(190) NULL,
  company_website VARCHAR(255) NULL,
  country         VARCHAR(100) NULL,
  industry        VARCHAR(100) NULL,
  other_industry  VARCHAR(150) NULL,
  project_type    VARCHAR(150) NOT NULL COMMENT 'Service interested in',
  budget          VARCHAR(60)  NULL,
  timeline        VARCHAR(60)  NULL,
  message         TEXT         NULL,
  status          ENUM('new','contacted','closed') NOT NULL DEFAULT 'new',
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_created (created_at),
  KEY idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI-Powered Digital Marketing Services form ----------------------------------
CREATE TABLE IF NOT EXISTS service_digital_marketing (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name        VARCHAR(150) NOT NULL,
  email            VARCHAR(190) NOT NULL,
  phone            VARCHAR(40)  NULL,
  company_name     VARCHAR(190) NULL,
  company_website  VARCHAR(255) NULL,
  country          VARCHAR(100) NULL,
  industry         VARCHAR(100) NOT NULL,
  other_industry   VARCHAR(150) NULL,
  service          VARCHAR(150) NOT NULL COMMENT 'Service (fixed on that service''s pages)',
  category         VARCHAR(1000) NOT NULL COMMENT 'Categories chosen in the form (subpages of the service)',
  budget           VARCHAR(60)  NULL,
  timeline         VARCHAR(60)  NULL,
  message          TEXT         NULL,
  status           ENUM('new','contacted','closed') NOT NULL DEFAULT 'new',
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_created (created_at),
  KEY idx_email (email),
  KEY idx_category (category(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI & Automation Solutions form ----------------------------------------------
CREATE TABLE IF NOT EXISTS service_ai_automation LIKE service_digital_marketing;

-- Information Technology Services form ----------------------------------------
CREATE TABLE IF NOT EXISTS service_it_services LIKE service_digital_marketing;

-- Staff Augmentation form -----------------------------------------------------
CREATE TABLE IF NOT EXISTS service_staff_augmentation LIKE service_digital_marketing;

-- ============================================================================
-- CRM (/login and /crm)
-- Team accounts are added from the CRM_* values in .env.local when the site
-- starts (passwords are stored as hashes, never as plain text).
-- ============================================================================

-- CRM team accounts ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS crm_users (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Signed-in browsers (only a hash of each session token is stored) -----------
CREATE TABLE IF NOT EXISTS crm_sessions (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Website Payments (online checkout from website) ----------------------------
CREATE TABLE IF NOT EXISTS payments (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  client_name     VARCHAR(150)  NOT NULL,
  client_email    VARCHAR(190)  NULL,
  client_phone    VARCHAR(50)   NULL,
  company_name    VARCHAR(190)  NULL,
  category        VARCHAR(500)  NULL,
  industry        VARCHAR(150)  NULL,
  service         VARCHAR(150)  NOT NULL,
  description     VARCHAR(255)  NULL,
  amount          DECIMAL(12,2) NOT NULL,
  total_amount    DECIMAL(12,2) NULL,
  payment_type    ENUM('full','partial') NOT NULL DEFAULT 'full',
  remaining_amount DECIMAL(12,2) NULL,
  currency        CHAR(3)       NOT NULL DEFAULT 'USD',
  method          VARCHAR(40)   NOT NULL DEFAULT 'PayPal',
  status          VARCHAR(40)   NOT NULL DEFAULT 'pending',
  source          VARCHAR(50)   NOT NULL DEFAULT 'website',
  reference       VARCHAR(120)  NULL COMMENT 'Transaction / reference ID',
  paypal_order_id VARCHAR(100)  NULL,
  invoice_number  VARCHAR(60)   NULL,
  billing_start_date DATE       NULL,
  billing_end_date   DATE       NULL,
  balance_due_date   DATE       NULL,
  balance_reminder_sent_at DATETIME NULL,
  token           VARCHAR(64)   NULL,
  expires_at      DATETIME      NULL,
  paid_at         DATE          NULL,
  notes           TEXT          NULL,
  created_by      INT UNSIGNED  NULL,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_paid_at (paid_at),
  KEY idx_status (status),
  CONSTRAINT fk_payments_user FOREIGN KEY (created_by) REFERENCES crm_users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Links (CRM-generated custom payment links) -------------------------
CREATE TABLE IF NOT EXISTS payment_links (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  client_name     VARCHAR(150)  NOT NULL,
  client_email    VARCHAR(190)  NOT NULL,
  client_phone    VARCHAR(50)   NOT NULL,
  company_name    VARCHAR(190)  NULL,
  service         VARCHAR(150)  NOT NULL,
  category        VARCHAR(500)  NULL,
  industry        VARCHAR(150)  NULL,
  quantity        VARCHAR(500)  NULL,
  description     VARCHAR(255)  NULL,
  amount          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_amount    DECIMAL(12,2) NOT NULL,
  payment_type    ENUM('full', 'partial') NOT NULL DEFAULT 'full',
  remaining_amount DECIMAL(12,2) NOT NULL,
  currency        CHAR(3)       NOT NULL DEFAULT 'USD',
  method          VARCHAR(40)   NOT NULL DEFAULT 'PayPal',
  status          VARCHAR(40)   NOT NULL DEFAULT 'pending',
  link_status     VARCHAR(40)   NOT NULL DEFAULT 'active',
  source          VARCHAR(50)   NOT NULL DEFAULT 'payment_link',
  lead_source     VARCHAR(100)  NULL DEFAULT 'manual',
  reference       VARCHAR(120)  NULL,
  paypal_order_id VARCHAR(100)  NULL,
  invoice_number  VARCHAR(60)   NULL,
  billing_start_date DATE       NULL,
  billing_end_date   DATE       NULL,
  balance_due_date   DATE       NULL,
  balance_reminder_sent_at DATETIME NULL,
  token           VARCHAR(64)   UNIQUE NOT NULL,
  expires_at      DATETIME      NULL,
  paid_at         DATE          NULL,
  notes           TEXT          NULL,
  created_by      INT UNSIGNED  NULL,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_token (token),
  KEY idx_status (status),
  KEY idx_link_status (link_status),
  KEY idx_paid_at (paid_at),
  CONSTRAINT fk_payment_links_user FOREIGN KEY (created_by) REFERENCES crm_users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job openings (Careers page and CRM) -----------------------------------------
CREATE TABLE IF NOT EXISTS job_openings (
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
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_open (is_open, deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job applications (Apply Now form and CRM) -----------------------------------
CREATE TABLE IF NOT EXISTS job_applications (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  job_id            INT UNSIGNED NULL,
  job_title         VARCHAR(190) NOT NULL COMMENT 'Copied from opening',
  department        VARCHAR(100) NULL,
  full_name         VARCHAR(150) NOT NULL,
  email             VARCHAR(190) NOT NULL,
  phone             VARCHAR(40)  NOT NULL,
  current_location  VARCHAR(150) NOT NULL,
  experience        VARCHAR(100) NOT NULL,
  profile_url       VARCHAR(255) NULL,
  cover_note        TEXT         NULL,
  resume_name       VARCHAR(255) NOT NULL,
  resume_type       VARCHAR(100) NOT NULL,
  resume_size       INT UNSIGNED NOT NULL,
  resume_data       MEDIUMBLOB   NOT NULL,
  status            VARCHAR(20)  NOT NULL DEFAULT 'new',
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_job (job_id),
  KEY idx_status (status, created_at),
  CONSTRAINT fk_applications_job FOREIGN KEY (job_id) REFERENCES job_openings (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lead attachments (CRM files uploaded to enquiries/leads) -------------------
CREATE TABLE IF NOT EXISTS lead_attachments (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  lead_source      VARCHAR(60)  NOT NULL,
  lead_id          INT UNSIGNED NOT NULL,
  file_name        VARCHAR(255) NOT NULL,
  file_type        VARCHAR(100) NOT NULL,
  file_size        INT UNSIGNED NOT NULL,
  file_data        MEDIUMBLOB   NOT NULL,
  uploaded_by      INT UNSIGNED NULL,
  uploaded_by_name VARCHAR(150) NULL,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_lead (lead_source, lead_id),
  KEY idx_created (created_at),
  CONSTRAINT fk_lead_attachments_user FOREIGN KEY (uploaded_by) REFERENCES crm_users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

