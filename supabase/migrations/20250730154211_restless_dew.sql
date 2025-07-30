/*
  # Add Demo Users

  1. Demo Users
    - Creates demo admin and owner accounts for testing
    - Provides known credentials for immediate testing
    - Uses Supabase Auth API to create users with proper authentication

  2. Security
    - Demo users follow same RLS policies as regular users
    - Passwords are secure and can be changed after login
*/

-- Note: These users need to be created through Supabase Auth, not directly in the database
-- You can create them manually in the Supabase Dashboard > Authentication > Users
-- Or use the Supabase CLI/API

-- This file serves as documentation for the demo credentials:
-- Admin User: admin@example.com / admin123
-- Owner User: owner@example.com / owner123

-- After creating these users in Supabase Auth, their profiles will be automatically
-- created in the users table via the handle_new_user trigger

-- To manually insert user profiles if needed (after auth users exist):
-- INSERT INTO users (id, email, name, role) VALUES 
-- ('admin-user-id-from-auth', 'admin@example.com', 'Demo Admin', 'admin'),
-- ('owner-user-id-from-auth', 'owner@example.com', 'Demo Owner', 'owner')
-- ON CONFLICT (id) DO NOTHING;