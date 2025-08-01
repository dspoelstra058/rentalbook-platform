# PDF Layout Management System

## Overview

I've built a comprehensive PDF layout management system that allows administrators to create and manage PDF templates with a visual drag-and-drop editor. This system provides an easy way to design multi-page PDF layouts for property information books.

## Features

### 🎨 Visual Layout Editor
- **Drag-and-Drop Interface**: Easily position elements on the page by dragging them around
- **Real-time Preview**: See changes as you make them
- **Multi-page Support**: Create complex documents with multiple pages
- **Grid System**: Optional grid overlay for precise element alignment
- **Undo/Redo**: Full history support for all changes

### 📄 Element Types
- **Text**: Static text content with full styling options
- **Property Data**: Dynamic content from property information (name, address, description, etc.)
- **Local Info Grid**: Automatically generated grid of local information
- **Images**: Support for property images and custom graphics
- **Tables**: Dynamic tables with property or local information data
- **QR Codes**: Generate QR codes with property URLs or custom data
- **Dividers**: Visual separators between sections
- **Spacers**: Invisible elements for layout spacing
- **Custom HTML**: Advanced users can add custom HTML content

### 🎛️ Advanced Styling
- **Typography**: Font family, size, weight, color, alignment
- **Layout**: Padding, margins, positioning, z-index
- **Visual Effects**: Borders, shadows, opacity, rounded corners
- **Backgrounds**: Colors and images with opacity control
- **Conditional Rendering**: Show/hide elements based on property data

### 📋 Template Management
- **Template Library**: Browse and manage all PDF templates
- **Categories**: Organize templates by type (hospitality, business, real-estate, general)
- **Import/Export**: Share templates between installations
- **Duplication**: Quickly create variations of existing templates
- **Version Control**: Track template changes over time

## Setup Instructions

### 1. Database Migration
Run the database migration to create the necessary tables:

```sql
-- Apply the migration file: supabase/migrations/002_pdf_layout_templates.sql
npx supabase db reset
```

### 2. Admin Access
The PDF Layout Manager is only accessible to admin users. Make sure you have admin privileges:

1. Navigate to `/admin` in your application
2. Click on the "PDF Layout Manager" tab
3. Start creating or editing templates

### 3. Default Templates
The system comes with two default templates:
- **Default Hospitality Template**: Multi-page template with welcome page, check-in instructions, and local information
- **Simple Business Template**: Minimal single-page template for business properties

## Usage Guide

### Creating a New Template

1. **Access the Manager**: Go to Admin Panel → PDF Layout Manager
2. **Create Template**: Click "Create Template" button
3. **Basic Info**: Enter name, description, and category
4. **Design Layout**: Use the visual editor to add and position elements
5. **Configure Elements**: Select elements to modify their properties
6. **Save Template**: Click "Save Template" when finished

### Using the Visual Editor

#### Adding Elements
1. Select an element type from the left sidebar
2. Click to add it to the current page
3. Drag to position it where you want
4. Click to select and modify properties

#### Element Properties
- **Position & Size**: Precise control over element dimensions
- **Content**: Text content or data source selection
- **Styling**: Typography, colors, borders, and effects

#### Page Management
- **Add Pages**: Click the "+" button in the pages section
- **Switch Pages**: Click on page names to edit different pages
- **Delete Pages**: Click the trash icon (must have more than one page)

#### Template Settings
- **Page Size**: A4, Letter, Legal, A3, A5
- **Orientation**: Portrait or Landscape
- **Grid**: Toggle grid overlay for alignment
- **Margins**: Set page margins

### Property Data Variables

Use these variables in text elements to display dynamic property information:

- `{{propertyName}}` - Property name
- `{{propertyAddress}}` - Full address
- `{{propertyCity}}` - City
- `{{propertyCountry}}` - Country
- `{{propertyDescription}}` - Property description
- `{{wifiPassword}}` - WiFi password
- `{{checkInInstructions}}` - Check-in instructions
- `{{houseRules}}` - House rules
- `{{emergencyContacts}}` - Emergency contact information
- `{{propertyUrl}}` - Property website URL
- `{{currentDate}}` - Current date
- `{{currentTime}}` - Current time

### Conditional Rendering

Elements can be shown or hidden based on property data:

- **Equals/Not Equals**: Show only if field matches specific value
- **Contains/Not Contains**: Show if field contains specific text
- **Exists/Not Exists**: Show only if field has content

## Technical Implementation

### Architecture
- **Frontend**: React components with TypeScript
- **Database**: PostgreSQL with Supabase
- **PDF Generation**: jsPDF with html2canvas for high-quality output
- **Styling**: Tailwind CSS for responsive design

### Key Components
- `PDFLayoutManager.tsx`: Main management interface
- `PDFLayoutEditor.tsx`: Visual drag-and-drop editor
- `EnhancedPDFGenerator.ts`: Advanced PDF generation engine

### Database Schema
```sql
pdf_layout_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  template JSONB NOT NULL,  -- Complete template configuration
  is_default BOOLEAN,
  created_by TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Security
- **Row Level Security**: Admins can manage all templates, users can read for PDF generation
- **Admin-Only Access**: Template management restricted to admin users
- **Data Validation**: All inputs validated on client and server side

## Integration with Existing System

### PDF Generation
The system integrates seamlessly with existing property management:

```typescript
// In PropertiesPage.tsx and Dashboard.tsx
const { data: layoutTemplates } = await supabase
  .from('pdf_layout_templates')
  .select('*')
  .eq('is_default', true)
  .limit(1);

const pdfGenerator = new EnhancedPDFGenerator(property, localInfo, template);
await pdfGenerator.generatePDF();
```

### Backward Compatibility
- Existing PDF generation continues to work
- Gradual migration to new system possible
- Default templates provide immediate functionality

## Best Practices

### Template Design
1. **Start Simple**: Begin with basic layouts and add complexity gradually
2. **Test with Real Data**: Use actual property information to test templates
3. **Consider Print Quality**: Design at appropriate resolution for printing
4. **Mobile Preview**: Check how templates look on different screen sizes

### Performance
1. **Optimize Images**: Use compressed images for faster PDF generation
2. **Limit Complexity**: Very complex layouts may slow down generation
3. **Cache Templates**: Templates are cached for better performance

### Maintenance
1. **Regular Backups**: Export important templates regularly
2. **Version Control**: Keep track of template changes
3. **User Training**: Ensure admins understand the system capabilities

## Troubleshooting

### Common Issues
1. **PDF Generation Fails**: Check browser console for errors
2. **Elements Not Positioning**: Ensure grid alignment is correct
3. **Missing Data**: Verify property fields are populated
4. **Slow Performance**: Reduce template complexity or image sizes

### Support
For technical issues or feature requests, check the application logs and contact the development team with specific error messages and steps to reproduce.

## Future Enhancements

Potential improvements for the system:
- **Template Marketplace**: Share templates with other users
- **Advanced Analytics**: Track template usage and performance
- **A/B Testing**: Compare different template versions
- **Batch PDF Generation**: Generate multiple PDFs at once
- **Integration APIs**: Connect with external design tools
- **Mobile Editor**: Edit templates on mobile devices

---

This PDF Layout Management System provides a powerful, user-friendly way to create professional property information books with complete administrative control over the design and content.