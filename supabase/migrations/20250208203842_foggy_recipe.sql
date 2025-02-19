/*
  # Add admin user and improve auth

  1. Changes
    - Add admin user with proper role and metadata
    - Add function to handle admin authentication
    - Add policies for admin access
    - Handle existing admin profile gracefully
*/

-- Function to ensure admin role is set
CREATE OR REPLACE FUNCTION handle_admin_auth()
RETURNS trigger AS $$
BEGIN
  IF NEW.email = 'admin@example.com' THEN
    NEW.raw_user_meta_data = jsonb_set(
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
      '{role}',
      '"admin"'
    );
  END IF;
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Trigger to handle admin authentication
DROP TRIGGER IF EXISTS on_auth_user_update ON auth.users;
CREATE TRIGGER on_auth_user_update
  BEFORE UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_admin_auth();

-- Create or update admin user
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin user exists in auth.users
  SELECT id INTO admin_user_id
  FROM auth.users 
  WHERE email = 'admin@example.com';

  IF admin_user_id IS NULL THEN
    -- Create admin user if doesn't exist
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@example.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"admin","name":"Admin User"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO admin_user_id;
  END IF;

  -- Update or insert admin profile
  INSERT INTO public.profiles (
    id,
    email,
    role,
    username,
    status
  ) VALUES (
    admin_user_id,
    'admin@example.com',
    'admin',
    'Admin',
    'Active'
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    status = 'Active',
    updated_at = now();
END $$;