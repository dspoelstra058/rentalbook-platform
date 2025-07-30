/*
  # Add facilities column to properties table

  1. Changes
    - Add `facilities` column to `properties` table as JSONB array
    - Add `images` column to `properties` table as JSONB object
    - Set default values for existing records

  2. Data Structure
    - `facilities`: Array of facility IDs (e.g., ["wifi", "air-conditioning"])
    - `images`: Object with front, general array, and back image URLs
*/

-- Add facilities column to store array of facility IDs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'facilities'
  ) THEN
    ALTER TABLE properties ADD COLUMN facilities JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add images column to store property images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'images'
  ) THEN
    ALTER TABLE properties ADD COLUMN images JSONB DEFAULT '{"front": "", "general": [], "back": ""}'::jsonb;
  END IF;
END $$;

-- Update existing records to have default values
UPDATE properties 
SET facilities = '[]'::jsonb 
WHERE facilities IS NULL;

UPDATE properties 
SET images = '{"front": "", "general": [], "back": ""}'::jsonb 
WHERE images IS NULL;