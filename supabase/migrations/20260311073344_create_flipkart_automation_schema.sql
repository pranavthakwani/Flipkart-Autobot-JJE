/*
  # Flipkart Automation System Schema

  1. New Tables
    - `accounts`
      - `id` (uuid, primary key)
      - `name` (text) - Account display name
      - `cookie_file_name` (text) - Cookie file name (e.g., account1.json)
      - `status` (text) - active, expired, or disabled
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `products`
      - `id` (uuid, primary key)
      - `account_id` (uuid, foreign key)
      - `product_name` (text) - Product search query
      - `product_url` (text) - Flipkart search URL
      - `status` (text) - pending, processing, price-extracted, ready-for-payment, completed, failed
      - `amount` (text) - Extracted price
      - `price_breakdown` (jsonb) - Complete price details
      - `error` (text) - Error message if failed
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
*/

CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cookie_file_name text NOT NULL UNIQUE,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  product_url text NOT NULL,
  status text DEFAULT 'pending',
  amount text DEFAULT '0',
  price_breakdown jsonb,
  error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on accounts"
  ON accounts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_products_account_id ON products(account_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
