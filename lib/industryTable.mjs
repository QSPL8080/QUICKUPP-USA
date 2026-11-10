/*
 * The industry_enquiries table (leads from the form on the industry pages).
 * Shared by lib/migrations.mjs and lib/crm/ensureTables.ts so the table is
 * made the same way whichever runs first. Safe to run again.
 */
export const INDUSTRY_ENQUIRIES_SQL = `CREATE TABLE IF NOT EXISTS industry_enquiries (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name        VARCHAR(150) NOT NULL,
  email            VARCHAR(190) NOT NULL,
  phone            VARCHAR(40)  NULL,
  company_name     VARCHAR(190) NULL,
  company_website  VARCHAR(255) NULL,
  country          VARCHAR(100) NULL,
  industry         VARCHAR(100) NOT NULL COMMENT 'the industry page the lead came from',
  other_industry   VARCHAR(150) NULL,
  service          VARCHAR(150) NOT NULL COMMENT 'service the visitor picked',
  category         VARCHAR(500) NULL COMMENT 'categories of that service (none for YouTube)',
  budget           VARCHAR(60)  NULL,
  timeline         VARCHAR(60)  NULL,
  youtube_link     VARCHAR(500) NULL,
  message          TEXT         NULL,
  agreed_terms     TINYINT(1)   NOT NULL DEFAULT 1,
  source_page      VARCHAR(150) NULL,
  page_url         VARCHAR(500) NULL,
  status           ENUM('new','contacted','in_progress','on_hold','closed') NOT NULL DEFAULT 'new',
  assigned_to      VARCHAR(150) NULL,
  project_status   VARCHAR(60)  NOT NULL DEFAULT 'Not Started',
  attachments      LONGTEXT     NULL DEFAULT NULL,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_created (created_at),
  KEY idx_email (email),
  KEY idx_industry (industry)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;
