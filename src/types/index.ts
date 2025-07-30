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
  createdAt: Date;
  updatedAt: Date;
}

export interface PDFLayout {
  pageSize: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  columns: number;
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