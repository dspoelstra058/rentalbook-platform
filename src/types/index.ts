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
  createdAt: Date;
  updatedAt: Date;
}

export interface LocalInfo {
  id: string;
  name: string;
  category: 'doctor' | 'pharmacy' | 'supermarket' | 'restaurant' | 'hospital' | 'attraction' | 'beach' | 'activity';
  address: string;
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