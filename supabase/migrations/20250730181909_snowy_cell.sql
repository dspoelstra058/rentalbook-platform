/*
  # Add zip code field to properties table

  1. Changes
    - Add `zip_code` column to properties table
    - Add `zip_code` column to local_info table for consistency
    - Both columns are optional (nullable)

  2. Notes
    - Zip code field supports various formats (postal codes, ZIP codes, etc.)
    - Field is text type to support different international formats
*/

-- Add zip_code to properties table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'zip_code'
  ) THEN
    ALTER TABLE properties ADD COLUMN zip_code text;
  END IF;
END $$;

-- Add zip_code to local_info table for consistency
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'local_info' AND column_name = 'zip_code'
  ) THEN
    ALTER TABLE local_info ADD COLUMN zip_code text;
  END IF;
END $$;