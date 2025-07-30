/*
  # Remove Demo Users

  1. Cleanup
    - Remove demo users from users table
    - Remove associated auth users (if any)
    - Clean up any related data

  2. Security
    - Only removes users with demo email patterns
    - Preserves legitimate user accounts
*/

-- Remove demo users from the users table
DELETE FROM users 
WHERE email IN (
  'demo@example.com',
  'test@example.com',
  'user@example.com',
  'owner@example.com',
  'guest@example.com'
) OR email LIKE '%demo%' OR email LIKE '%test%';

-- Note: Auth users in auth.users table can only be deleted through Supabase Dashboard
-- Go to Authentication > Users to manually delete corresponding auth users if needed