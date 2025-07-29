import { Property, LocalInfo, Template } from '../types';

export const mockProperties: Property[] = [
  {
    id: 'prop-1',
    ownerId: 'user-1',
    name: 'Seaside Villa',
    address: '123 Ocean View Drive',
    city: 'Santa Monica',
    country: 'USA',
    description: 'Beautiful villa with ocean views',
    checkInInstructions: 'Key is in the lockbox, code: 1234',
    wifiPassword: 'oceanview123',
    houseRules: 'No smoking, no pets',
    emergencyContacts: 'Police: 911, Fire: 911',
    templateId: 'modern-blue',
    isPublished: true,
    websiteUrl: 'https://seaside-villa.example.com',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  }
];

export const mockLocalInfo: LocalInfo[] = [
  {
    id: 'local-1',
    name: 'City General Hospital',
    category: 'hospital',
    address: '456 Medical Center Blvd',
    phone: '+1-555-0123',
    description: '24/7 emergency services',
    city: 'Santa Monica',
    country: 'USA',
    verified: true,
    openingHours: '24/7'
  },
  {
    id: 'local-2',
    name: "Joe's Pharmacy",
    category: 'pharmacy',
    address: '789 Main Street',
    phone: '+1-555-0456',
    description: 'Full-service pharmacy with prescription services',
    city: 'Santa Monica',
    country: 'USA',
    verified: true,
    openingHours: '8:00 AM - 10:00 PM'
  },
  {
    id: 'local-3',
    name: 'Ocean Breeze Restaurant',
    category: 'restaurant',
    address: '321 Seaside Avenue',
    phone: '+1-555-0789',
    website: 'https://oceanbreeze.com',
    description: 'Fresh seafood with ocean views',
    city: 'Santa Monica',
    country: 'USA',
    verified: true,
    rating: 4.5,
    openingHours: '11:00 AM - 11:00 PM'
  }
];

export const templates: Template[] = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    category: 'modern',
    preview: '/templates/modern-blue.jpg',
    colors: { primary: '#3B82F6', secondary: '#1E40AF', accent: '#60A5FA' }
  },
  {
    id: 'classic-green',
    name: 'Classic Green',
    category: 'classic',
    preview: '/templates/classic-green.jpg',
    colors: { primary: '#059669', secondary: '#047857', accent: '#34D399' }
  },
  {
    id: 'minimal-gray',
    name: 'Minimal Gray',
    category: 'minimal',
    preview: '/templates/minimal-gray.jpg',
    colors: { primary: '#6B7280', secondary: '#374151', accent: '#9CA3AF' }
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    category: 'luxury',
    preview: '/templates/luxury-gold.jpg',
    colors: { primary: '#D97706', secondary: '#92400E', accent: '#FBBF24' }
  },
  {
    id: 'cozy-red',
    name: 'Cozy Red',
    category: 'cozy',
    preview: '/templates/cozy-red.jpg',
    colors: { primary: '#DC2626', secondary: '#991B1B', accent: '#F87171' }
  },
  {
    id: 'modern-purple',
    name: 'Modern Purple',
    category: 'modern',
    preview: '/templates/modern-purple.jpg',
    colors: { primary: '#7C3AED', secondary: '#5B21B6', accent: '#A78BFA' }
  },
  {
    id: 'classic-navy',
    name: 'Classic Navy',
    category: 'classic',
    preview: '/templates/classic-navy.jpg',
    colors: { primary: '#1E40AF', secondary: '#1E3A8A', accent: '#60A5FA' }
  },
  {
    id: 'minimal-black',
    name: 'Minimal Black',
    category: 'minimal',
    preview: '/templates/minimal-black.jpg',
    colors: { primary: '#111827', secondary: '#000000', accent: '#6B7280' }
  },
  {
    id: 'luxury-rose',
    name: 'Luxury Rose',
    category: 'luxury',
    preview: '/templates/luxury-rose.jpg',
    colors: { primary: '#E11D48', secondary: '#BE185D', accent: '#FB7185' }
  },
  {
    id: 'cozy-orange',
    name: 'Cozy Orange',
    category: 'cozy',
    preview: '/templates/cozy-orange.jpg',
    colors: { primary: '#EA580C', secondary: '#C2410C', accent: '#FB923C' }
  }
];