import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using fallback configuration.');
  // Use fallback values for development
  const fallbackUrl = 'https://placeholder.supabase.co';
  const fallbackKey = 'placeholder-key';
  export const supabase = createClient(fallbackUrl, fallbackKey);
} else {
  export const supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Database types (will be generated from your Supabase schema)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'owner' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: 'owner' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'owner' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          address: string;
          city: string;
          country: string;
          description: string;
          checkin_instructions: string;
          wifi_password: string;
          house_rules: string;
          emergency_contacts: string;
          template_id: string;
          is_published: boolean;
          website_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          address: string;
          city: string;
          country: string;
          description: string;
          checkin_instructions: string;
          wifi_password: string;
          house_rules: string;
          emergency_contacts: string;
          template_id: string;
          is_published?: boolean;
          website_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          address?: string;
          city?: string;
          country?: string;
          description?: string;
          checkin_instructions?: string;
          wifi_password?: string;
          house_rules?: string;
          emergency_contacts?: string;
          template_id?: string;
          is_published?: boolean;
          website_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      local_info: {
        Row: {
          id: string;
          name: string;
          category: 'doctor' | 'pharmacy' | 'supermarket' | 'restaurant' | 'hospital' | 'attraction' | 'beach' | 'activity';
          address: string;
          phone: string | null;
          website: string | null;
          description: string;
          city: string;
          country: string;
          verified: boolean;
          rating: number | null;
          opening_hours: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: 'doctor' | 'pharmacy' | 'supermarket' | 'restaurant' | 'hospital' | 'attraction' | 'beach' | 'activity';
          address: string;
          phone?: string | null;
          website?: string | null;
          description: string;
          city: string;
          country: string;
          verified?: boolean;
          rating?: number | null;
          opening_hours?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: 'doctor' | 'pharmacy' | 'supermarket' | 'restaurant' | 'hospital' | 'attraction' | 'beach' | 'activity';
          address?: string;
         zip_code?: string | null;
          phone?: string | null;
          website?: string | null;
          description?: string;
          city?: string;
          country?: string;
          verified?: boolean;
          rating?: number | null;
          opening_hours?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pdf_templates: {
        Row: {
          id: string;
          name: string;
          category: 'modern' | 'classic' | 'minimal' | 'luxury' | 'cozy';
          colors: {
            primary: string;
            secondary: string;
            accent: string;
          };
          layout: {
            pageSize: 'a4' | 'letter';
            orientation: 'portrait' | 'landscape';
            margins: {
              top: number;
              right: number;
              bottom: number;
              left: number;
            };
            columns: number;
          };
          sections: any[];
          styling: {
            fontFamily: string;
            primaryColor: string;
            secondaryColor: string;
            accentColor: string;
            backgroundColor: string;
            headerGradient: boolean;
            roundedCorners: boolean;
            shadows: boolean;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: 'modern' | 'classic' | 'minimal' | 'luxury' | 'cozy';
          colors: {
            primary: string;
            secondary: string;
            accent: string;
          };
          layout: {
            pageSize: 'a4' | 'letter';
            orientation: 'portrait' | 'landscape';
            margins: {
              top: number;
              right: number;
              bottom: number;
              left: number;
            };
            columns: number;
          };
          sections: any[];
          styling: {
            fontFamily: string;
            primaryColor: string;
            secondaryColor: string;
            accentColor: string;
            backgroundColor: string;
            headerGradient: boolean;
            roundedCorners: boolean;
            shadows: boolean;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: 'modern' | 'classic' | 'minimal' | 'luxury' | 'cozy';
          colors?: {
            primary: string;
            secondary: string;
            accent: string;
          };
          layout?: {
            pageSize: 'a4' | 'letter';
            orientation: 'portrait' | 'landscape';
            margins: {
              top: number;
              right: number;
              bottom: number;
              left: number;
            };
            columns: number;
          };
          sections?: any[];
          styling?: {
            fontFamily: string;
            primaryColor: string;
            secondaryColor: string;
            accentColor: string;
            backgroundColor: string;
            headerGradient: boolean;
            roundedCorners: boolean;
            shadows: boolean;
          };
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'owner' | 'admin';
      property_category: 'doctor' | 'pharmacy' | 'supermarket' | 'restaurant' | 'hospital' | 'attraction' | 'beach' | 'activity';
      template_category: 'modern' | 'classic' | 'minimal' | 'luxury' | 'cozy';
    };
  };
}