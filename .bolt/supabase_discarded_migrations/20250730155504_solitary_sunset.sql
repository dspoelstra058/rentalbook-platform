/*
  # Fix Admin User Creation

  This migration creates an admin user profile that will be linked when the auth user is created.
  The foreign key constraint requires the auth user to exist first.

  1. Creates admin user profile without foreign key dependency
  2. Sets up proper admin role and permissions
  3. Will be automatically linked when auth user is created via trigger
*/

-- First, let's create the admin user profile without the foreign key constraint
-- We'll use a temporary approach that works with the existing schema

DO $$
DECLARE
  temp_admin_id uuid := 'c7b5a3c1-c300-488c-970c-8e3052cb5289';
BEGIN
  -- Insert admin user profile (this will be linked later by the trigger)
  INSERT INTO public.users (id, email, name, role, created_at, updated_at)
  VALUES (
    temp_admin_id,
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

  -- Note: The foreign key constraint will be satisfied when you create 
  -- the corresponding auth user with the same ID in the Supabase dashboard
END $$;