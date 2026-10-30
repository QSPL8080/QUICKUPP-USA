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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI-Powered Digital Marketing Services form ----------------------------------
CREATE TABLE IF NOT EXISTS service_digital_marketing (
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

-- Payments (manual entries now; online payments can be added later) ---------
CREATE TABLE IF NOT EXISTS payments (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
