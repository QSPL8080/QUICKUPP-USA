-- ============================================================================
-- Quickupp USA website — database tables
--
-- On your computer : the setup script creates the Quickupp_USA database and
--                    runs this file (npm run db:setup).
-- On Hostinger     : create the database in hPanel, open phpMyAdmin, select
--                    the database and Import this file.
-- Safe to run more than once (tables are only created if missing).
-- Already have the tables from before? Run npm run db:migrate to bring them
-- up to date (or db/migrations/ on Hostinger).
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
