/*
  # Initial Schema Setup
  
  1. Tables
    - profiles: User profiles linked to auth.users
    - plans: Available subscription plans
    - user_plans: User plan subscriptions
    - trading_accounts: User trading accounts
    - daily_pnl: Daily profit and loss records
    - wallets: User wallets
    - transactions: Wallet transactions
  
  2. Security
    - RLS enabled on all tables
    - Policies for user and admin access
    - Trigger for new user creation
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  email text,
  phone_code text,
  phone text,
  role text DEFAULT 'customer',
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  min_deposit numeric NOT NULL,
  max_deposit numeric NOT NULL,
  max_accounts integer NOT NULL,
  profit_sharing_customer numeric NOT NULL,
  profit_sharing_platform numeric NOT NULL,
  upfront_fee numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_plans table
CREATE TABLE IF NOT EXISTS user_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES plans(id) ON DELETE CASCADE,
  status text DEFAULT 'Active',
  start_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trading_accounts table
CREATE TABLE IF NOT EXISTS trading_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  account_no text NOT NULL,
  server text NOT NULL,
  password text NOT NULL,
  status text DEFAULT 'Pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create daily_pnl table
CREATE TABLE IF NOT EXISTS daily_pnl (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  symbol text NOT NULL,
  total_pnl numeric NOT NULL,
  customer_share numeric NOT NULL,
  platform_share numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  balance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES wallets(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  type text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_pnl ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update profiles" ON profiles
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for plans
CREATE POLICY "Anyone can view plans" ON plans
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can insert plans" ON plans
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update plans" ON plans
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can delete plans" ON plans
  FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for user_plans
CREATE POLICY "Users can view their plans" ON user_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all plans" ON user_plans
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can manage plans" ON user_plans
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for trading_accounts
CREATE POLICY "Users can view their accounts" ON trading_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create accounts" ON trading_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all accounts" ON trading_accounts
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can manage accounts" ON trading_accounts
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for daily_pnl
CREATE POLICY "Users can view their PnL" ON daily_pnl
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all PnL" ON daily_pnl
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can manage PnL" ON daily_pnl
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for wallets
CREATE POLICY "Users can view their wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all wallets" ON wallets
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can manage wallets" ON wallets
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for transactions
CREATE POLICY "Users can view their transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = transactions.wallet_id
      AND wallets.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can view all transactions" ON transactions
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can manage transactions" ON transactions
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Insert default plans
INSERT INTO plans (name, min_deposit, max_deposit, max_accounts, profit_sharing_customer, profit_sharing_platform, upfront_fee)
VALUES
  ('Silver', 250, 500, 2, 40, 60, 50),
  ('Gold', 250, 1000, 4, 50, 50, 150),
  ('Platinum', 250, 10000, 40, 60, 40, 250);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (new.id, new.email, 'customer');
  
  INSERT INTO wallets (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();