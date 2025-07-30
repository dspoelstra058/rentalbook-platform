/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Current RLS policies on users table are causing infinite recursion
    - Policies are querying the users table from within the users table policies
    - This creates a circular dependency that causes database errors

  2. Solution
    - Drop all existing problematic policies on users table
    - Create new, safe policies that don't cause recursion
    - Use auth.uid() directly instead of querying users table within policies
    - Implement role-based access using JWT claims or simpler approaches

  3. New Policies
    - Users can read their own profile using auth.uid() = id
    - Users can update their own profile using auth.uid() = id
    - Users can insert their own profile during registration
    - Remove admin policies that cause recursion
*/

-- Drop all existing policies on users table to start fresh
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Create safe, non-recursive policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- For admin functionality, we'll handle role checks in the application layer
-- instead of in RLS policies to avoid recursion
CREATE POLICY "Service role can manage all users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);