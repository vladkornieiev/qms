--liquibase formatted sql

--changeset system:002-jsonb-to-text splitStatements:false
-- Helper function to cast JSONB to text for use in JPA Criteria queries.
-- Hibernate 6 intercepts all known SQL functions (concat, format, etc.),
-- so we need a custom function name it won't recognize.
CREATE OR REPLACE FUNCTION jsonb_to_text(val jsonb) RETURNS text AS $$
  SELECT val::text;
$$ LANGUAGE sql IMMUTABLE STRICT;
