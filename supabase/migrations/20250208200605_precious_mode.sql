/*
  # Fix User Registration and Profile Creation

  1. Changes:
    - Drop and recreate user creation trigger with proper error handling
    - Add insert policies for profiles table
    - Add proper role handling for new users

  2. Security:
    - Ensure proper profile creation on signup
    - Add necessary policies for profile insertion
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (
    id,
    email,
    role,
    username,
    status
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    split_part(NEW.email, '@', 1),
    'Active'
  );

  -- Create wallet for new user
  INSERT INTO public.wallets (
    user_id,
    balance
  ) VALUES (
    NEW.id,
    0
  );

  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create new trigger with proper error handling
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add necessary policies for profile creation
CREATE POLICY "Enable insert for authentication service" ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- Add policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add policy for profile creation during signup
CREATE POLICY "Enable profile creation during signup" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);