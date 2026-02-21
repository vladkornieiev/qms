--liquibase formatted sql

--changeset app:013-fix-fk-constraints splitStatements:false
-- Fix NOT NULL + ON DELETE SET NULL contradiction in quotes and invoices tables

ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_client_id_fkey;
ALTER TABLE quotes ADD CONSTRAINT quotes_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT;

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_client_id_fkey;
ALTER TABLE invoices ADD CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT;
