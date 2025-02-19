/*
  # Database Schema Update

  1. Tables Created:
    - profiles: User profile information
    - plans: Available subscription plans
    - user_plans: User plan subscriptions
    - trading_accounts: User trading accounts
    - daily_pnl: Daily profit and loss records
    - wallets: User wallets
    - transactions: Wallet transactions

  2. Security:
    - Row Level Security (RLS) enabled on all tables
    - Policies for user access and admin management
    - Secure function for new user handling

  3. Default Data:
    - Three default trading plans (Silver, Gold, Platinum)
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Profiles policies
  DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
  DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
  DROP POLICY IF EXISTS "Admin can update all profiles" ON profiles;

  -- Plans policies
  DROP POLICY IF EXISTS "Anyone can view plans" ON plans;
  DROP POLICY IF EXISTS "Admin can manage plans" ON plans;

  -- User plans policies
  DROP POLICY IF EXISTS "Users can view their plans" ON user_plans;
  DROP POLICY IF EXISTS "Admin can view all plans" ON user_plans;
  DROP POLICY IF EXISTS "Admin can manage plans" ON user_plans;

  -- Trading accounts policies
  DROP POLICY IF EXISTS "Users can view their accounts" ON trading_accounts;
  DROP POLICY IF EXISTS "Users can create accounts" ON trading_accounts;
  DROP POLICY IF EXISTS "Admin can view all accounts" ON trading_accounts;
  DROP POLICY IF EXISTS "Admin can manage accounts" ON trading_accounts;

  -- Daily PnL policies
  DROP POLICY IF EXISTS "Users can view their PnL" ON daily_pnl;
  DROP POLICY IF EXISTS "Admin can view all PnL" ON daily_pnl;
  DROP POLICY IF EXISTS "Admin can manage PnL" ON daily_pnl;

  -- Wallets policies
  DROP POLICY IF EXISTS "Users can view their wallet" ON wallets;
  DROP POLICY IF EXISTS "Admin can view all wallets" ON wallets;
  DROP POLICY IF EXISTS "Admin can manage wallets" ON wallets;

  -- Transactions policies
  DROP POLICY IF EXISTS "Users can view their transactions" ON transactions;
  DROP POLICY IF EXISTS "Admin can view all transactions" ON transactions;
  DROP POLICY IF EXISTS "Admin can manage transactions" ON transactions;
END $$;

-- Create new policies with proper syntax
-- Profiles policies
CREATE POLICY "view_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "admin_view_profiles" ON profiles
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "admin_update_profiles" ON profiles
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Plans policies
CREATE POLICY "view_plans" ON plans
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "admin_manage_plans" ON plans
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- User plans policies
CREATE POLICY "view_own_user_plans" ON user_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "admin_view_user_plans" ON user_plans
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "admin_manage_user_plans" ON user_plans
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Trading accounts policies
CREATE POLICY "view_own_trading_accounts" ON trading_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "create_own_trading_accounts" ON trading_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_view_trading_accounts" ON trading_accounts
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "admin_manage_trading_accounts" ON trading_accounts
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Daily PnL policies
CREATE POLICY "view_own_pnl" ON daily_pnl
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "admin_view_pnl" ON daily_pnl
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "admin_manage_pnl" ON daily_pnl
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Wallets policies
CREATE POLICY "view_own_wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "admin_view_wallets" ON wallets
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "admin_manage_wallets" ON wallets
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Transactions policies
CREATE POLICY "view_own_transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = transactions.wallet_id
      AND wallets.user_id = auth.uid()
    )
  );

CREATE POLICY "admin_view_transactions" ON transactions
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "admin_manage_transactions" ON transactions
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');