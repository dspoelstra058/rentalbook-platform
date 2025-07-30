/*
  # Add Admin User

  1. New User
    - Creates admin user with email admin@platform.com
    - Sets role as 'admin' 
    - Uses auth.users table for authentication
    - Creates corresponding profile in users table

  2. Security
    - User will need to confirm email or have email confirmation disabled
    - Password will need to be set through Supabase dashboard or auth API
*/

-- Insert admin user into auth.users (this requires Supabase's auth system)
-- Note: This approach creates the user profile, but the actual auth user needs to be created through Supabase Dashboard

-- First, let's create a function to handle admin user creation
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Generate a UUID for the admin user
  admin_user_id := gen_random_uuid();
  
  -- Insert into users table (this will be linked when the auth user is created)
  INSERT INTO users (id, email, name, role, created_at, updated_at)
  VALUES (
    admin_user_id,
    'admin@platform.com',
    'Platform Administrator',
    'admin',
    now(),
    now()
  )
  ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    name = 'Platform Administrator',
    updated_at = now();
  
  -- Log the admin user ID for reference
  RAISE NOTICE 'Admin user profile created with ID: %', admin_user_id;
END;
$$;

-- Execute the function
SELECT create_admin_user();

-- Drop the function as it's no longer needed
DROP FUNCTION create_admin_user();

-- Note: To complete the admin user setup, you need to:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User"
-- 3. Use email: admin@platform.com
-- 4. Set password: admin123
-- 5. The user profile will automatically link via the handle_new_user trigger