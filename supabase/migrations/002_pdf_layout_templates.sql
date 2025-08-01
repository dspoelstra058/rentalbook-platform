-- Create PDF layout templates table
CREATE TABLE IF NOT EXISTS pdf_layout_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  thumbnail TEXT,
  template JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pdf_layout_templates_category ON pdf_layout_templates(category);
CREATE INDEX IF NOT EXISTS idx_pdf_layout_templates_created_by ON pdf_layout_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_pdf_layout_templates_is_default ON pdf_layout_templates(is_default);

-- Enable RLS (Row Level Security)
ALTER TABLE pdf_layout_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for PDF layout templates
-- Admins can do everything
CREATE POLICY "Admins can manage PDF layout templates" ON pdf_layout_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Users can read templates (for generating PDFs)
CREATE POLICY "Users can read PDF layout templates" ON pdf_layout_templates
  FOR SELECT USING (true);

-- Insert some default PDF layout templates
INSERT INTO pdf_layout_templates (id, name, description, category, template, is_default, created_by) VALUES 
(
  'default-hospitality-template',
  'Default Hospitality Template',
  'A clean and professional template for hospitality properties',
  'hospitality',
  '{
    "id": "default-hospitality-template",
    "name": "Default Hospitality Template",
    "layout": {
      "pageSize": "a4",
      "orientation": "portrait",
      "margins": {"top": 40, "right": 40, "bottom": 40, "left": 40},
      "columns": 1,
      "grid": {"enabled": true, "size": 20, "snapToGrid": false}
    },
    "sections": [],
    "styling": {
      "fontFamily": "Arial, sans-serif",
      "primaryColor": "#2563eb",
      "secondaryColor": "#1e40af",
      "accentColor": "#3b82f6",
      "backgroundColor": "#ffffff",
      "headerGradient": false,
      "roundedCorners": true,
      "shadows": true
    },
    "pages": [
      {
        "id": "page-1",
        "name": "Welcome Page",
        "order": 1,
        "elements": [
          {
            "id": "header-1",
            "type": "text",
            "position": {"x": 50, "y": 50, "width": 500, "height": 80},
            "content": {"text": "Welcome to {{propertyName}}"},
            "styling": {
              "fontSize": 28,
              "fontWeight": "bold",
              "color": "#2563eb",
              "textAlign": "center",
              "padding": {"top": 10, "right": 10, "bottom": 10, "left": 10}
            },
            "order": 1
          },
          {
            "id": "address-1",
            "type": "property-data",
            "position": {"x": 50, "y": 150, "width": 500, "height": 40},
            "content": {"dataSource": "property", "dataField": "address"},
            "styling": {
              "fontSize": 16,
              "color": "#6b7280",
              "textAlign": "center",
              "padding": {"top": 5, "right": 5, "bottom": 5, "left": 5}
            },
            "order": 2
          },
          {
            "id": "description-1",
            "type": "property-data",
            "position": {"x": 50, "y": 220, "width": 500, "height": 120},
            "content": {"dataSource": "property", "dataField": "description"},
            "styling": {
              "fontSize": 14,
              "color": "#374151",
              "textAlign": "left",
              "padding": {"top": 15, "right": 15, "bottom": 15, "left": 15},
              "backgroundColor": "#f9fafb",
              "border": {"width": 1, "style": "solid", "color": "#e5e7eb", "radius": 8}
            },
            "order": 3
          }
        ],
        "pageBreak": "auto"
      },
      {
        "id": "page-2",
        "name": "Check-in & WiFi",
        "order": 2,
        "elements": [
          {
            "id": "checkin-title",
            "type": "text",
            "position": {"x": 50, "y": 50, "width": 500, "height": 40},
            "content": {"text": "Check-in Instructions"},
            "styling": {
              "fontSize": 22,
              "fontWeight": "bold",
              "color": "#2563eb",
              "textAlign": "left",
              "padding": {"top": 10, "right": 10, "bottom": 10, "left": 10}
            },
            "order": 1
          },
          {
            "id": "checkin-instructions",
            "type": "property-data",
            "position": {"x": 50, "y": 110, "width": 500, "height": 100},
            "content": {"dataSource": "property", "dataField": "checkInInstructions"},
            "styling": {
              "fontSize": 14,
              "color": "#374151",
              "textAlign": "left",
              "padding": {"top": 15, "right": 15, "bottom": 15, "left": 15}
            },
            "order": 2
          },
          {
            "id": "wifi-title",
            "type": "text",
            "position": {"x": 50, "y": 240, "width": 500, "height": 40},
            "content": {"text": "WiFi Information"},
            "styling": {
              "fontSize": 22,
              "fontWeight": "bold",
              "color": "#2563eb",
              "textAlign": "left",
              "padding": {"top": 10, "right": 10, "bottom": 10, "left": 10}
            },
            "order": 3
          },
          {
            "id": "wifi-password",
            "type": "property-data",
            "position": {"x": 50, "y": 300, "width": 500, "height": 60},
            "content": {"dataSource": "property", "dataField": "wifiPassword"},
            "styling": {
              "fontSize": 18,
              "fontWeight": "bold",
              "color": "#059669",
              "textAlign": "center",
              "padding": {"top": 15, "right": 15, "bottom": 15, "left": 15},
              "backgroundColor": "#ecfdf5",
              "border": {"width": 2, "style": "solid", "color": "#059669", "radius": 8}
            },
            "order": 4
          }
        ],
        "pageBreak": "always"
      },
      {
        "id": "page-3",
        "name": "Local Information",
        "order": 3,
        "elements": [
          {
            "id": "local-info-title",
            "type": "text",
            "position": {"x": 50, "y": 50, "width": 500, "height": 40},
            "content": {"text": "Local Information & Recommendations"},
            "styling": {
              "fontSize": 22,
              "fontWeight": "bold",
              "color": "#2563eb",
              "textAlign": "left",
              "padding": {"top": 10, "right": 10, "bottom": 10, "left": 10}
            },
            "order": 1
          },
          {
            "id": "local-info-grid",
            "type": "local-info-grid",
            "position": {"x": 50, "y": 110, "width": 500, "height": 400},
            "content": {"dataSource": "local-info"},
            "styling": {
              "fontSize": 12,
              "color": "#374151",
              "padding": {"top": 10, "right": 10, "bottom": 10, "left": 10}
            },
            "order": 2
          }
        ],
        "pageBreak": "always"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }',
  true,
  'system'
),
(
  'simple-business-template',
  'Simple Business Template',
  'A minimal template for business properties',
  'business',
  '{
    "id": "simple-business-template",
    "name": "Simple Business Template",
    "layout": {
      "pageSize": "a4",
      "orientation": "portrait",
      "margins": {"top": 30, "right": 30, "bottom": 30, "left": 30},
      "columns": 1,
      "grid": {"enabled": true, "size": 20, "snapToGrid": false}
    },
    "sections": [],
    "styling": {
      "fontFamily": "Arial, sans-serif",
      "primaryColor": "#1f2937",
      "secondaryColor": "#374151",
      "accentColor": "#6b7280",
      "backgroundColor": "#ffffff",
      "headerGradient": false,
      "roundedCorners": false,
      "shadows": false
    },
    "pages": [
      {
        "id": "page-1",
        "name": "Property Information",
        "order": 1,
        "elements": [
          {
            "id": "title",
            "type": "property-data",
            "position": {"x": 50, "y": 50, "width": 500, "height": 60},
            "content": {"dataSource": "property", "dataField": "name"},
            "styling": {
              "fontSize": 24,
              "fontWeight": "bold",
              "color": "#1f2937",
              "textAlign": "center",
              "padding": {"top": 15, "right": 15, "bottom": 15, "left": 15}
            },
            "order": 1
          },
          {
            "id": "divider",
            "type": "divider",
            "position": {"x": 50, "y": 130, "width": 500, "height": 2},
            "content": {},
            "styling": {
              "color": "#e5e7eb"
            },
            "order": 2
          },
          {
            "id": "description",
            "type": "property-data",
            "position": {"x": 50, "y": 160, "width": 500, "height": 150},
            "content": {"dataSource": "property", "dataField": "description"},
            "styling": {
              "fontSize": 14,
              "color": "#374151",
              "textAlign": "left",
              "padding": {"top": 10, "right": 10, "bottom": 10, "left": 10}
            },
            "order": 3
          }
        ],
        "pageBreak": "auto"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }',
  true,
  'system'
);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pdf_layout_templates_updated_at 
  BEFORE UPDATE ON pdf_layout_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();