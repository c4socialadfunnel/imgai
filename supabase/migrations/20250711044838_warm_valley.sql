/*
  # IMGAI Platform Database Schema

  1. New Tables
    - `users` - Extended user profiles with roles and credits
    - `subscriptions` - Stripe subscription management
    - `images` - Image processing history and metadata
    - `admin_logs` - Admin action audit trail
    - `credit_transactions` - Credit usage and purchase tracking
    - `ai_models` - Available AI models configuration

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure admin operations with proper authorization

  3. Features
    - Credit system with transaction tracking
    - Subscription tier management
    - Image processing history
    - Admin audit logging
*/

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid');
CREATE TYPE credit_transaction_type AS ENUM ('purchase', 'usage', 'admin_adjustment', 'subscription_bonus');
CREATE TYPE ai_operation_type AS ENUM ('enhance', 'remove_object', 'style_transfer', 'text_to_image', 'avatar_generation');

-- Users table with extended profile
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role user_role DEFAULT 'user',
  credits integer DEFAULT 0,
  banned_at timestamptz,
  stripe_customer_id text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE NOT NULL,
  plan_id text NOT NULL,
  status subscription_status DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Images table for processing history
CREATE TABLE IF NOT EXISTS images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  original_url text NOT NULL,
  processed_url text,
  operation_type ai_operation_type NOT NULL,
  credits_used integer DEFAULT 0,
  processing_status text DEFAULT 'pending',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Credit transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  transaction_type credit_transaction_type NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Admin logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- AI models configuration
CREATE TABLE IF NOT EXISTS ai_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  model_type ai_operation_type NOT NULL,
  endpoint text NOT NULL,
  credit_cost integer DEFAULT 1,
  enabled boolean DEFAULT true,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Subscriptions policies
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Images policies
CREATE POLICY "Users can read own images"
  ON images
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own images"
  ON images
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own images"
  ON images
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all images"
  ON images
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Credit transactions policies
CREATE POLICY "Users can read own credit transactions"
  ON credit_transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all credit transactions"
  ON credit_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert credit transactions"
  ON credit_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin logs policies
CREATE POLICY "Admins can read all admin logs"
  ON admin_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert admin logs"
  ON admin_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- AI models policies
CREATE POLICY "All users can read enabled AI models"
  ON ai_models
  FOR SELECT
  TO authenticated
  USING (enabled = true);

CREATE POLICY "Admins can manage AI models"
  ON ai_models
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default AI models
INSERT INTO ai_models (name, model_type, endpoint, credit_cost, config) VALUES
  ('Image Enhancer', 'enhance', 'gemini-pro-vision', 2, '{"max_resolution": "2048x2048"}'),
  ('Object Remover', 'remove_object', 'gemini-pro-vision', 3, '{"precision": "high"}'),
  ('Style Transfer', 'style_transfer', 'gemini-pro-vision', 4, '{"styles": ["artistic", "photorealistic", "abstract"]}'),
  ('Text to Image', 'text_to_image', 'gemini-pro-vision', 5, '{"max_resolution": "1024x1024"}'),
  ('Avatar Generator', 'avatar_generation', 'gemini-pro-vision', 6, '{"styles": ["professional", "cartoon", "realistic"]}');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_status ON images(processing_status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_ai_models_type ON ai_models(model_type);

-- Function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, email, credits)
  VALUES (NEW.id, NEW.email, 10); -- Give new users 10 free credits
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update user credits
CREATE OR REPLACE FUNCTION update_user_credits(
  p_user_id uuid,
  p_amount integer,
  p_transaction_type credit_transaction_type,
  p_description text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Update user credits
  UPDATE users 
  SET credits = credits + p_amount,
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Record transaction
  INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
  VALUES (p_user_id, p_amount, p_transaction_type, p_description);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;