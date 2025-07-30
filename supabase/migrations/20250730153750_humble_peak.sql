/*
  # Create pdf_templates table

  1. New Tables
    - `pdf_templates`
      - `id` (text, primary key)
      - `name` (text, not null)
      - `category` (enum: modern, classic, minimal, luxury, cozy)
      - `colors` (jsonb, not null)
      - `layout` (jsonb, not null)
      - `sections` (jsonb, not null)
      - `styling` (jsonb, not null)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `pdf_templates` table
    - Add policy for authenticated users to read templates
    - Add policy for admins to manage templates
*/

-- Create enum for template categories
DO $$ BEGIN
  CREATE TYPE template_category AS ENUM (
    'modern', 'classic', 'minimal', 'luxury', 'cozy'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create pdf_templates table
CREATE TABLE IF NOT EXISTS pdf_templates (
  id text PRIMARY KEY,
  name text NOT NULL,
  category template_category NOT NULL,
  colors jsonb NOT NULL,
  layout jsonb NOT NULL,
  sections jsonb NOT NULL,
  styling jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE pdf_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read templates"
  ON pdf_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage templates"
  ON pdf_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_pdf_templates_updated_at
  BEFORE UPDATE ON pdf_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();