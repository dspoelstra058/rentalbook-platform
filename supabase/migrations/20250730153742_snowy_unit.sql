/*
  # Create local_info table

  1. New Tables
    - `local_info`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `category` (enum: doctor, pharmacy, supermarket, restaurant, hospital, attraction, beach, activity)
      - `address` (text, not null)
      - `phone` (text)
      - `website` (text)
      - `description` (text)
      - `city` (text, not null)
      - `country` (text, not null)
      - `verified` (boolean, default false)
      - `rating` (numeric)
      - `opening_hours` (text)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `local_info` table
    - Add policy for authenticated users to read local info
    - Add policy for admins to manage local info
*/

-- Create enum for local info categories
DO $$ BEGIN
  CREATE TYPE local_category AS ENUM (
    'doctor', 'pharmacy', 'supermarket', 'restaurant', 
    'hospital', 'attraction', 'beach', 'activity'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create local_info table
CREATE TABLE IF NOT EXISTS local_info (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category local_category NOT NULL,
  address text NOT NULL,
  phone text,
  website text,
  description text,
  city text NOT NULL,
  country text NOT NULL,
  verified boolean DEFAULT false NOT NULL,
  rating numeric CHECK (rating >= 0 AND rating <= 5),
  opening_hours text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE local_info ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read local info"
  ON local_info
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage local info"
  ON local_info
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_local_info_updated_at
  BEFORE UPDATE ON local_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_local_info_city_country ON local_info(city, country);
CREATE INDEX IF NOT EXISTS idx_local_info_category ON local_info(category);