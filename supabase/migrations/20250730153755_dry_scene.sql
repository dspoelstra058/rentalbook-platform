/*
  # Create properties table

  1. New Tables
    - `properties`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, references users, not null)
      - `name` (text, not null)
      - `address` (text)
      - `city` (text)
      - `country` (text)
      - `description` (text)
      - `checkin_instructions` (text)
      - `wifi_password` (text)
      - `house_rules` (text)
      - `emergency_contacts` (text)
      - `template_id` (text, references pdf_templates)
      - `is_published` (boolean, default false)
      - `website_url` (text)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `properties` table
    - Add policies for owners to manage their own properties
    - Add policies for admins to manage all properties
*/

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  address text,
  city text,
  country text,
  description text,
  checkin_instructions text,
  wifi_password text,
  house_rules text,
  emergency_contacts text,
  template_id text REFERENCES pdf_templates(id),
  is_published boolean DEFAULT false NOT NULL,
  website_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Owners can read own properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can create properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own properties"
  ON properties
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all properties"
  ON properties
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_template_id ON properties(template_id);
CREATE INDEX IF NOT EXISTS idx_properties_published ON properties(is_published);