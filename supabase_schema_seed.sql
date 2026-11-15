-- =========================================================================
-- Supabase Schema & Dummy Data Seed for Blinkit-Style Grocery App
-- Run this in your Supabase SQL Editor (>_) to create and populate tables!
-- =========================================================================

-- 1. Create Products Table
create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  price numeric(10, 2) not null,
  old_price numeric(10, 2),
  unit text default '1 pc',
  rating numeric(3, 2) default 4.5,
  reviews integer default 50,
  badge text,
  image text,
  is_popular boolean default true,
  is_best_seller boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Categories Table
create table if not exists public.categories (
  id text primary key,
  name text not null unique,
  item_count integer default 10,
  icon text
);

-- 3. Create Stores Table
create table if not exists public.stores (
  id text primary key,
  name text not null,
  type text not null,
  location text not null,
  delivery_time text not null default '10-15 mins',
  min_order numeric(10, 2) default 99,
  rating numeric(3, 2) default 4.8,
  status text default 'Open Now',
  distance text default '1.5 km',
  tags text[] default array['Quick Delivery', 'Groceries']
);

-- 4. Enable Row Level Security (RLS) & Public Read Access
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.stores enable row level security;

create policy "Public read products" on public.products for select using (true);
create policy "Public read categories" on public.categories for select using (true);
create policy "Public read stores" on public.stores for select using (true);

-- 5. Insert Categories
insert into public.categories (id, name, item_count, icon)
values
  ('c1', 'Dairy, Bread & Eggs', 18, '🥛'),
  ('c2', 'Snacks & Munchies', 24, '🍿'),
  ('c3', 'Fruits & Vegetables', 32, '🥦'),
  ('c4', 'Bakery & Biscuits', 15, '🍞'),
  ('c5', 'Instant Food', 12, '🍜'),
  ('c6', 'Cold Drinks & Juices', 14, '🥤'),
  ('c7', 'Atta, Rice & Dal', 28, '🌾')
on conflict (id) do update set name = excluded.name;

-- 6. Insert Products with Dummy Grocery Data
insert into public.products (id, name, category, price, old_price, unit, rating, reviews, badge, is_popular, is_best_seller)
values
  ('p1', 'Haldiram''s Sev Bhujia', 'Snacks & Munchies', 45, 55, '200 g', 4.5, 148, 'Sale', true, false),
  ('p2', 'NutriChoice Digestive High Fibre', 'Bakery & Biscuits', 35, 40, '1 kg', 4.6, 95, 'Hot', true, true),
  ('p3', 'Cadbury Dairy Milk Silk', 'Bakery & Biscuits', 80, 90, '150 g', 4.9, 420, '15%', true, true),
  ('p4', 'Farm Fresh Desi Eggs (Pack of 6)', 'Dairy, Bread & Eggs', 65, 75, '6 pcs', 4.8, 312, 'Fresh', true, true),
  ('p5', 'Amul Taaza Homogenised Toned Milk', 'Dairy, Bread & Eggs', 27, 30, '500 ml', 4.9, 890, 'Bestseller', true, true),
  ('p6', 'Fresh Hybrid Tomato', 'Fruits & Vegetables', 38, 48, '1 kg', 4.4, 210, 'Fresh', true, false),
  ('p7', 'Robusta Banana Organic', 'Fruits & Vegetables', 42, 50, '1 kg', 4.7, 165, 'Organic', true, true),
  ('p8', 'Maggi 2-Minute Masala Noodles', 'Instant Food', 56, 60, 'Pack of 4 (280 g)', 4.8, 734, 'Popular', true, true),
  ('p9', 'Lays India''s Magic Masala Chips', 'Snacks & Munchies', 20, 20, '52 g', 4.6, 580, 'Quick', true, false),
  ('p10', 'Coca-Cola Zero Sugar Can', 'Cold Drinks & Juices', 40, 45, '300 ml', 4.7, 340, 'Chilled', true, false),
  ('p11', 'Aashirvaad Superior MP Sharbati Atta', 'Atta, Rice & Dal', 260, 295, '5 kg', 4.9, 1120, 'Essential', false, true),
  ('p12', 'Tata Sampann Unpolished Toor Dal', 'Atta, Rice & Dal', 165, 185, '1 kg', 4.7, 430, 'Protein', false, true)
on conflict (id) do update set price = excluded.price;

-- 7. Insert Stores
insert into public.stores (id, name, type, location, delivery_time, min_order, rating, status, distance, tags)
values
  ('st1', 'Blinkit Darkstore - Indiranagar', 'Express Quick Delivery', '100ft Road, Indiranagar, Bangalore', '10-15 mins', 99, 4.9, 'Open Now', '1.2 km', array['Vegetables', 'Dairy', 'Snacks', 'Quick 10m']),
  ('st2', 'FreshCart Daily Supermarket', 'Supermarket & Groceries', '4th Block, Koramangala, Bangalore', '15-20 mins', 149, 4.8, 'Open Now', '2.5 km', array['Organic', 'Bakery', 'Household', 'Groceries']),
  ('st3', 'Nature''s Basket Organic Express', 'Gourmet & Organic', 'CMH Road, Indiranagar, Bangalore', '15-25 mins', 199, 4.9, 'Open Now', '3.1 km', array['Exotic Fruits', 'Artisanal Cheese', 'Organic']),
  ('st4', 'Daily Fresh Meat & Fish Market', 'Fresh Cuts & Protein', 'Sector 2, HSR Layout, Bangalore', '20-30 mins', 199, 4.7, 'Open Now', '4.0 km', array['Fresh Chicken', 'Mutton', 'Fish & Seafood']),
  ('st5', 'Heritage Milk & Dairy Mart', 'Dairy & Breakfast', 'Old Airport Road, Bangalore', '10-15 mins', 49, 4.8, 'Open Now', '1.8 km', array['Milk', 'Paneer', 'Butter', 'Eggs', 'Bread']),
  ('st6', 'Green Valley Farm Produce', 'Farmer''s Direct Produce', 'Sarjapur Main Road, Bangalore', '20-25 mins', 99, 4.6, 'Open Now', '3.8 km', array['Farm Vegetables', 'Fresh Greens', 'Cold Pressed Oils'])
on conflict (id) do update set name = excluded.name;
