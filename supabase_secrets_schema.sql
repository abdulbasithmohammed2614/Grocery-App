-- =========================================================================
-- Supabase Schema & Initial Secrets Seed for Grocery Quick Commerce
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- =========================================================================

-- 1. Create app_secrets table
create table if not exists public.app_secrets (
  id text primary key,
  secret_value text not null,
  description text,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.app_secrets enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Public read public secrets" on public.app_secrets;
drop policy if exists "Service role full access" on public.app_secrets;

-- Allow reading only public secrets (is_public = true) for frontend clients
create policy "Public read public secrets" on public.app_secrets 
  for select using (is_public = true);

-- Allow reading all secrets using the service_role key or backend queries
create policy "Allow backend select all" on public.app_secrets 
  for select using (true);

-- Allow backend update/insert
create policy "Allow backend modify all" on public.app_secrets 
  for all using (true);

-- 3. Insert / Seed all required application secrets
insert into public.app_secrets (id, secret_value, description, is_public)
values
  -- Razorpay Payment Gateway Credentials
  ('RAZORPAY_KEY_ID', 'rzp_test_YourRazorpayKeyIdHere', 'Razorpay API Key ID (Public/Test or Live)', true),
  ('RAZORPAY_KEY_SECRET', 'YourRazorpayKeySecretHere', 'Razorpay API Secret Key for HMAC Verification', false),
  ('REACT_APP_RAZORPAY_KEY_ID', 'rzp_test_YourRazorpayKeyIdHere', 'Public Razorpay Key for Frontend Checkout Modal', true),

  -- Merchant / Seller Login Credentials
  ('SELLER_EMAIL', 'seller@grocery.com', 'Store Merchant Portal Login Email', false),
  ('SELLER_PASSWORD', 'storepassword123', 'Store Merchant Portal Login Password', false),

  -- Supabase Connection Credentials (for backup verification)
  ('SUPABASE_URL', 'https://pmlqyypgixxffceyipze.supabase.co', 'Supabase Project REST URL', true),
  ('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbHF5eXBnaXh4ZmZjZXlpcHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ2NjgxMTUsImV4cCI6MjExMDI0NDExNX0.1H1I5PJ0puigmWg3pUor03R4FkVAUsHXlY76kxdy9lk', 'Supabase Public Anon Key', true),

  -- Application Configuration
  ('APP_NAME', 'FreshCart Grocery Quick-Commerce', 'Store Brand Name', true),
  ('DEFAULT_DELIVERY_TIME', '10-15 mins', 'Default Express Delivery Promise', true),
  ('FREE_DELIVERY_THRESHOLD', '499', 'Order amount in INR above which delivery is free', true)
on conflict (id) do update set
  secret_value = excluded.secret_value,
  description = excluded.description,
  is_public = excluded.is_public,
  updated_at = timezone('utc'::text, now());
