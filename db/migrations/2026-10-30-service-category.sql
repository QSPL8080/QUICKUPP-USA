-- ============================================================================
-- Service forms: "service" (fixed) + "category" (chosen in the form)
--
-- For a database created before 30 Oct 2026. On your computer just run
-- npm run db:migrate instead. On Hostinger: phpMyAdmin → select the database
-- → SQL tab → paste this file → Go. Run it ONCE (a second run will error,
-- which does no harm).
-- ============================================================================

ALTER TABLE service_digital_marketing
  CHANGE service_interest category VARCHAR(150) NOT NULL COMMENT 'Category chosen in the form (a subpage of the service)',
  ADD COLUMN service VARCHAR(150) NOT NULL DEFAULT '' COMMENT 'Service (fixed on that service''s pages)' AFTER other_industry,
  DROP INDEX idx_service,
  ADD INDEX idx_category (category);
UPDATE service_digital_marketing SET service = 'AI-Powered Digital Marketing Services' WHERE service = '';
ALTER TABLE service_digital_marketing MODIFY service VARCHAR(150) NOT NULL COMMENT 'Service (fixed on that service''s pages)';

ALTER TABLE service_ai_automation
  CHANGE service_interest category VARCHAR(150) NOT NULL COMMENT 'Category chosen in the form (a subpage of the service)',
  ADD COLUMN service VARCHAR(150) NOT NULL DEFAULT '' COMMENT 'Service (fixed on that service''s pages)' AFTER other_industry,
  DROP INDEX idx_service,
  ADD INDEX idx_category (category);
UPDATE service_ai_automation SET service = 'AI & Automation Solutions' WHERE service = '';
ALTER TABLE service_ai_automation MODIFY service VARCHAR(150) NOT NULL COMMENT 'Service (fixed on that service''s pages)';

ALTER TABLE service_it_services
  CHANGE service_interest category VARCHAR(150) NOT NULL COMMENT 'Category chosen in the form (a subpage of the service)',
  ADD COLUMN service VARCHAR(150) NOT NULL DEFAULT '' COMMENT 'Service (fixed on that service''s pages)' AFTER other_industry,
  DROP INDEX idx_service,
  ADD INDEX idx_category (category);
UPDATE service_it_services SET service = 'Information Technology Services' WHERE service = '';
ALTER TABLE service_it_services MODIFY service VARCHAR(150) NOT NULL COMMENT 'Service (fixed on that service''s pages)';

ALTER TABLE service_staff_augmentation
  CHANGE service_interest category VARCHAR(150) NOT NULL COMMENT 'Category chosen in the form (a subpage of the service)',
  ADD COLUMN service VARCHAR(150) NOT NULL DEFAULT '' COMMENT 'Service (fixed on that service''s pages)' AFTER other_industry,
  DROP INDEX idx_service,
  ADD INDEX idx_category (category);
UPDATE service_staff_augmentation SET service = 'Staff Augmentation' WHERE service = '';
ALTER TABLE service_staff_augmentation MODIFY service VARCHAR(150) NOT NULL COMMENT 'Service (fixed on that service''s pages)';
