export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin';
  createdAt: Date;
}

export interface Property {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  zipCode?: string;
  city: string;
  country: string;
  description: string;
  checkInInstructions: string;
  wifiPassword: string;
  houseRules: string;
  emergencyContacts: string;
  templateId: string;
  isPublished: boolean;
  websiteUrl?: string;
  facilities?: string[];
  images?: {
    front?: string;
    general?: string[];
    back?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface LocalInfo {
  id: string;
  name: string;
  category: 'doctor' | 'pharmacy' | 'supermarket' | 'restaurant' | 'hospital' | 'attraction' | 'beach' | 'activity';
  address: string;
  zipCode?: string;
  phone?: string;
  website?: string;
  description: string;
  city: string;
  country: string;
  verified: boolean;
  rating?: number;
  openingHours?: string;
}

export interface Template {
  id: string;
  name: string;
  category: 'modern' | 'classic' | 'minimal' | 'luxury' | 'cozy';
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  pdfTemplate?: PDFTemplate;
}

export interface PDFTemplate {
  id: string;
  name: string;
  layout: PDFLayout;
  sections: PDFSection[];
  styling: PDFStyling;
  pages: PDFPage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PDFPage {
  id: string;
  name: string;
  order: number;
  elements: PDFElement[];
  pageBreak: 'auto' | 'always' | 'avoid';
  background?: {
    color?: string;
    image?: string;
    opacity?: number;
  };
}

export interface PDFElement {
  id: string;
  type: 'text' | 'image' | 'table' | 'divider' | 'spacer' | 'property-data' | 'local-info-grid' | 'qr-code' | 'custom-html';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  content: PDFElementContent;
  styling: PDFElementStyling;
  order: number;
  conditions?: PDFElementCondition[];
}

export interface PDFElementContent {
  text?: string;
  html?: string;
  imageUrl?: string;
  dataSource?: 'property' | 'local-info' | 'custom';
  dataField?: string;
  tableData?: {
    headers: string[];
    rows: string[][];
    dataSource?: 'property' | 'local-info';
  };
  qrData?: string;
  variables?: Record<string, string>;
}

export interface PDFElementStyling {
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  border?: {
    width: number;
    style: 'solid' | 'dashed' | 'dotted';
    color: string;
    radius?: number;
  };
  shadow?: {
    x: number;
    y: number;
    blur: number;
    color: string;
  };
  opacity?: number;
  zIndex?: number;
}

export interface PDFElementCondition {
  field: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'not-contains' | 'exists' | 'not-exists';
  value: string;
}

export interface PDFLayout {
  pageSize: 'a4' | 'letter' | 'legal' | 'a3' | 'a5';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  columns: number;
  columnGap?: number;
  grid?: {
    enabled: boolean;
    size: number;
    snapToGrid: boolean;
  };
}

export interface PDFSection {
  id: string;
  type: 'header' | 'property-info' | 'checkin' | 'wifi' | 'rules' | 'local-info' | 'emergency' | 'footer' | 'custom';
  title: string;
  enabled: boolean;
  order: number;
  content: string;
  styling: {
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    color: string;
    backgroundColor?: string;
    padding: number;
    marginTop: number;
    marginBottom: number;
    borderLeft?: {
      width: number;
      color: string;
    };
  };
}

export interface PDFStyling {
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  headerGradient: boolean;
  roundedCorners: boolean;
  shadows: boolean;
  customCSS?: string;
}

export interface Payment {
  id: string;
  userId: string;
  propertyId: string;
  amount: number;
  method: 'ideal' | 'creditcard' | 'paypal';
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

// New interfaces for PDF layout management
export interface PDFLayoutTemplate {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'hospitality' | 'real-estate' | 'general';
  thumbnail: string;
  template: PDFTemplate;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PDFVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'image';
  source: 'property' | 'user' | 'system';
  defaultValue?: string;
  required: boolean;
}