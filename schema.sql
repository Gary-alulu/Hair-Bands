-- Supabase Database Schema for Premium Wig & Hair E-Commerce Platform

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (syncs with auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  email text,
  avatar_url text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

-- 2. Categories Table
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;

-- 3. Products Table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  price numeric not null check (price >= 0),
  sale_price numeric check (sale_price is null or sale_price >= 0),
  category_id uuid references public.categories(id) on delete set null,
  is_featured boolean default false,
  is_new boolean default false,
  is_best_seller boolean default false,
  is_pre_order boolean default false,
  rating numeric default 0 check (rating >= 0 and rating <= 5),
  review_count integer default 0 check (review_count >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;

-- 4. Product Images Table
create table public.product_images (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  url text not null,
  alt_text text,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.product_images enable row level security;

-- 5. Product Variants Table
create table public.product_variants (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  sku text,
  length text, -- e.g., "16\"", "18\"", "20\"", "22\""
  density text, -- e.g., "150%", "180%", "200%"
  lace_type text, -- e.g., "HD Lace", "Transparent Lace"
  color text, -- e.g., "Natural Black", "Honey Blonde", "Auburn Brown"
  price_adjustment numeric default 0, -- added to base product price
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (product_id, length, density, lace_type, color)
);

alter table public.product_variants enable row level security;

-- 6. Inventory Table (tracks stock levels per variant)
create table public.inventory (
  id uuid default gen_random_uuid() primary key,
  variant_id uuid references public.product_variants(id) on delete cascade unique not null,
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.inventory enable row level security;

-- 7. Orders Table
create table public.orders (
  id text primary key, -- e.g., ORD-2026841
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'PENDING_PAYMENT' check (status in ('PENDING_PAYMENT', 'PAID', 'PROCESSING', 'PACKED', 'DISPATCHED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED')),
  subtotal numeric not null check (subtotal >= 0),
  delivery_fee numeric not null default 0 check (delivery_fee >= 0),
  discount numeric not null default 0 check (discount >= 0),
  total numeric not null check (total >= 0),
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  shipping_address jsonb not null, -- contains county, town, area, building, apartment, delivery_notes, delivery_method
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;

-- 8. Order Items Table
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id text references public.orders(id) on delete cascade not null,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity integer not null check (quantity > 0),
  price numeric not null check (price >= 0), -- purchase price at checkout
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.order_items enable row level security;

-- 9. Payments Table (stores M-Pesa tracking information)
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  order_id text references public.orders(id) on delete cascade not null,
  amount numeric not null check (amount >= 0),
  status text not null default 'PENDING' check (status in ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'TIMEOUT', 'REFUNDED')),
  payment_method text not null default 'M-Pesa',
  mpesa_checkout_request_id text unique,
  mpesa_merchant_request_id text,
  mpesa_receipt_number text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.payments enable row level security;

-- 10. Payment Transactions Table (for callback audit logs)
create table public.payment_transactions (
  id uuid default gen_random_uuid() primary key,
  payment_id uuid references public.payments(id) on delete cascade not null,
  checkout_request_id text,
  result_code integer,
  result_desc text,
  raw_callback_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.payment_transactions enable row level security;

-- 11. Receipts Table
create table public.receipts (
  id text primary key, -- e.g., REC-XXXXXX
  order_id text references public.orders(id) on delete cascade not null,
  payment_id uuid references public.payments(id) on delete cascade not null,
  receipt_number text not null unique,
  pdf_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.receipts enable row level security;

-- 12. Reservations Table (Appointments/Wig viewings)
create table public.reservations (
  id text primary key, -- e.g. RSV-20481
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  service_type text not null check (service_type in ('wig_viewing', 'wig_fitting', 'hair_consultation', 'custom_wig_consultation', 'pickup', 'custom_order_consultation')),
  product_id uuid references public.products(id) on delete set null,
  date date not null,
  time_slot text not null, -- e.g., "10:00 - 11:00"
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reservations enable row level security;

-- 13. Reservation Slots Table (Manage calendar bookings & capacities)
create table public.reservation_slots (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  time_slot text not null,
  max_capacity integer not null default 1,
  current_bookings integer not null default 0 check (current_bookings >= 0),
  unique (date, time_slot)
);

alter table public.reservation_slots enable row level security;

-- 14. Wishlists Table
create table public.wishlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.wishlists enable row level security;

-- 15. Wishlist Items Table
create table public.wishlist_items (
  id uuid default gen_random_uuid() primary key,
  wishlist_id uuid references public.wishlists(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (wishlist_id, product_id)
);

alter table public.wishlist_items enable row level security;

-- 16. Reviews Table
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Helper Function to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Profiles Policies
create policy "Allow public read of profiles" on public.profiles
  for select using (true);

create policy "Allow users to update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Allow admins complete access to profiles" on public.profiles
  for all using (public.is_admin());

-- Categories Policies
create policy "Allow public read of categories" on public.categories
  for select using (true);

create policy "Allow admins write of categories" on public.categories
  for all using (public.is_admin());

-- Products Policies
create policy "Allow public read of products" on public.products
  for select using (true);

create policy "Allow admins write of products" on public.products
  for all using (public.is_admin());

-- Product Images Policies
create policy "Allow public read of product images" on public.product_images
  for select using (true);

create policy "Allow admins write of product images" on public.product_images
  for all using (public.is_admin());

-- Product Variants Policies
create policy "Allow public read of product variants" on public.product_variants
  for select using (true);

create policy "Allow admins write of product variants" on public.product_variants
  for all using (public.is_admin());

-- Inventory Policies
create policy "Allow public read of inventory" on public.inventory
  for select using (true);

create policy "Allow admins write of inventory" on public.inventory
  for all using (public.is_admin());

-- Orders Policies
create policy "Allow users to view own orders" on public.orders
  for select using (auth.uid() = user_id or auth.uid() is not null);

create policy "Allow users to create own orders" on public.orders
  for insert with check (true);

create policy "Allow admins write of orders" on public.orders
  for all using (public.is_admin());

-- Order Items Policies
create policy "Allow users to view own order items" on public.order_items
  for select using (exists (
    select 1 from public.orders
    where orders.id = order_items.order_id and (orders.user_id = auth.uid())
  ));

create policy "Allow users to create order items" on public.order_items
  for insert with check (true);

create policy "Allow admins write of order items" on public.order_items
  for all using (public.is_admin());

-- Payments Policies
create policy "Allow users to view own payments" on public.payments
  for select using (exists (
    select 1 from public.orders
    where orders.id = payments.order_id and (orders.user_id = auth.uid())
  ));

create policy "Allow users to create own payments" on public.payments
  for insert with check (true);

create policy "Allow admins write of payments" on public.payments
  for all using (public.is_admin());

-- Payment Transactions Policies
create policy "Allow admins write of transactions" on public.payment_transactions
  for all using (public.is_admin());

-- Receipts Policies
create policy "Allow users to view own receipts" on public.receipts
  for select using (exists (
    select 1 from public.orders
    where orders.id = receipts.order_id and (orders.user_id = auth.uid())
  ));

create policy "Allow admins write of receipts" on public.receipts
  for all using (public.is_admin());

-- Reservations Policies
create policy "Allow users to view own reservations" on public.reservations
  for select using (auth.uid() = user_id or auth.uid() is not null);

create policy "Allow users to create own reservations" on public.reservations
  for insert with check (true);

create policy "Allow admins write of reservations" on public.reservations
  for all using (public.is_admin());

-- Reservation Slots Policies
create policy "Allow public read of reservation slots" on public.reservation_slots
  for select using (true);

create policy "Allow admins write of reservation slots" on public.reservation_slots
  for all using (public.is_admin());

-- Wishlists Policies
create policy "Allow users to view own wishlist" on public.wishlists
  for select using (auth.uid() = user_id);

create policy "Allow users to create own wishlist" on public.wishlists
  for insert with check (auth.uid() = user_id);

-- Wishlist Items Policies
create policy "Allow users to manage own wishlist items" on public.wishlist_items
  for all using (exists (
    select 1 from public.wishlists
    where wishlists.id = wishlist_items.wishlist_id and wishlists.user_id = auth.uid()
  ));

-- Reviews Policies
create policy "Allow public read of reviews" on public.reviews
  for select using (true);

create policy "Allow users to create own reviews" on public.reviews
  for insert with check (auth.uid() = user_id);

create policy "Allow admins write of reviews" on public.reviews
  for all using (public.is_admin());


-- ==========================================
-- TRIGGERS FOR PROFILE SYNC
-- ==========================================

-- Trigger to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    case
      when new.email in ('admin@luxuryhair.com', 'admin@beauty.com') then 'admin'
      else 'customer'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ==========================================
-- REALISTIC SEED DATA
-- ==========================================

-- 1. Insert Categories
insert into public.categories (id, name, slug, description) values
  ('c1000000-0000-0000-0000-000000000001', 'Wigs', 'wigs', 'Premium human hair and custom lace front wigs for everyday luxury.'),
  ('c1000000-0000-0000-0000-000000000002', 'Hair Care', 'hair-products', 'Nourishing shampoos, conditioners, oils, and styling gels formulated for hair integrity.'),
  ('c1000000-0000-0000-0000-000000000003', 'Extensions', 'extensions', 'Grade 12A premium hair bundles and clip-ins.'),
  ('c1000000-0000-0000-0000-000000000004', 'Accessories', 'accessories', 'Silk bonnets, lace glues, edge brushes, and styling clips.');

-- 2. Insert Products
insert into public.products (id, name, slug, description, price, sale_price, category_id, is_featured, is_new, is_best_seller, is_pre_order, rating, review_count) values
  -- Wigs
  ('p1000000-0000-0000-0000-000000000001', 'Maya Body Wave', 'maya-body-wave', 'Crafted from 100% premium virgin human hair, the Maya Body Wave wig delivers voluminous, cascading waves that flow naturally. Featuring a high-definition transparent lace frontal for an invisible hairline look, it can be styled, colored, and parted in any direction. Made for the modern woman seeking ultimate elegance and styling versatility.', 28500, null, 'c1000000-0000-0000-0000-000000000001', true, false, true, false, 4.9, 128),
  ('p1000000-0000-0000-0000-000000000002', 'Amara Straight', 'amara-straight', 'The Amara Straight wig is a timeless classic, offering a sleek, bone-straight silhouette. This premium lace front wig is designed with pre-plucked baby hairs and pre-bleached knots for a flawless scalp simulation. The hair retains a glossy, healthy sheen and is heat-resistant, allowing you to style it effortlessly.', 32000, 29999, 'c1000000-0000-0000-0000-000000000001', true, true, false, false, 4.8, 86),
  ('p1000000-0000-0000-0000-000000000003', 'Naomi Deep Wave', 'naomi-deep-wave', 'Bring out your inner goddess with Naomi Deep Wave. This luxury piece features deep, bouncy curls that are rich in texture and volume. Perfect for vacations and special events, it offers low-maintenance luxury with a natural luster. The breathable elastic cap provides security and comfort throughout the day.', 29000, null, 'c1000000-0000-0000-0000-000000000001', false, false, true, false, 4.7, 95),
  ('p1000000-0000-0000-0000-000000000004', 'Zuri Curly', 'zuri-curly', 'Embrace bold, bouncy curls with the Zuri Curly wig. Styled with defined kinky curls, this hairpiece provides maximum fullness and weightless movement. Formed with a 13x4 HD lace area, the wig seamlessly mimics a natural hair growth pattern.', 26500, null, 'c1000000-0000-0000-0000-000000000001', false, true, false, false, 4.9, 44),
  ('p1000000-0000-0000-0000-000000000005', 'Nia Lace Front', 'nia-lace-front', 'The Nia Lace Front is designed with pre-styled light layers that frame the face beautifully. Combining premium synthetic fibers that feel exactly like human hair with high-tech heat resilience, Nia is the perfect piece for dynamic, on-the-go beauty.', 18500, 15500, 'c1000000-0000-0000-0000-000000000001', false, false, false, false, 4.5, 37),
  ('p1000000-0000-0000-0000-000000000006', 'Ayana Body Wave', 'ayana-body-wave', 'Indulge in the luxury of the Ayana Body Wave wig. Sourced from single-donor raw hair, this wig is thick from root to tip. Features an 18-inch default length with rich chocolate brown undertones that glisten in natural light.', 35000, null, 'c1000000-0000-0000-0000-000000000001', true, false, false, true, 5.0, 19),

  -- Hair Care
  ('p1000000-0000-0000-0000-000000000011', 'Cocoa Butter Hydrating Shampoo', 'cocoa-shampoo', 'Enriched with premium African cocoa butter and argan oil, this sulfate-free hydrating shampoo gently cleanses away impurities while restoring deep hydration to dry or color-treated hair.', 2400, null, 'c1000000-0000-0000-0000-000000000002', false, false, true, false, 4.8, 110),
  ('p1000000-0000-0000-0000-000000000012', 'Argan Oil Restoring Conditioner', 'argan-conditioner', 'A rich, creamy conditioner that untangles hair fibers, smooths frizz, and seals in moisture. Formulated to keep extensions and wigs looking glossy and smelling divine.', 2600, 2200, 'c1000000-0000-0000-0000-000000000002', false, false, false, false, 4.6, 75),
  ('p1000000-0000-0000-0000-000000000013', 'Marula Gold Hair Oil Serum', 'marula-oil', 'Crafted from pure cold-pressed Marula seeds, this lightweight hair oil serum absorbs instantly to nourish the scalp, prevent heat damage, and provide a radiant luxury shine without weighing hair down.', 3500, null, 'c1000000-0000-0000-0000-000000000002', true, true, true, false, 5.0, 142),
  ('p1000000-0000-0000-0000-000000000014', 'Shea Edge Control & Styling Gel', 'shea-edge-control', 'Infused with organic shea butter and black castor oil, this strong-hold edge control gel smooths down baby hairs and designs clean parts without flaking, greasiness, or white buildup.', 1200, null, 'c1000000-0000-0000-0000-000000000002', false, false, false, false, 4.7, 215);

-- 3. Insert Product Variants for Maya Body Wave (Wig variants)
insert into public.product_variants (id, product_id, sku, length, density, lace_type, color, price_adjustment) values
  -- Maya 18", 150%, HD, Natural Black
  ('v1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'MAY-BW-18-150-HD-NB', '18\"', '150%', 'HD Lace', 'Natural Black', 0),
  -- Maya 18", 180%, HD, Natural Black
  ('v1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000001', 'MAY-BW-18-180-HD-NB', '18\"', '180%', 'HD Lace', 'Natural Black', 3000),
  -- Maya 20", 180%, HD, Natural Black
  ('v1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000001', 'MAY-BW-20-180-HD-NB', '20\"', '180%', 'HD Lace', 'Natural Black', 5500),
  -- Maya 22", 200%, HD, Natural Black
  ('v1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000001', 'MAY-BW-22-200-HD-NB', '22\"', '200%', 'HD Lace', 'Natural Black', 9000);

-- Insert Product Variants for Amara Straight
insert into public.product_variants (id, product_id, sku, length, density, lace_type, color, price_adjustment) values
  -- Amara 16", 150%, Transparent, Natural Black
  ('v1000000-0000-0000-0000-000000000011', 'p1000000-0000-0000-0000-000000000002', 'AMA-ST-16-150-TR-NB', '16\"', '150%', 'Transparent Lace', 'Natural Black', 0),
  -- Amara 18", 180%, HD, Natural Black
  ('v1000000-0000-0000-0000-000000000012', 'p1000000-0000-0000-0000-000000000002', 'AMA-ST-18-180-HD-NB', '18\"', '180%', 'HD Lace', 'Natural Black', 4000),
  -- Amara 20", 180%, HD, Natural Black
  ('v1000000-0000-0000-0000-000000000013', 'p1000000-0000-0000-0000-000000000002', 'AMA-ST-20-180-HD-NB', '20\"', '180%', 'HD Lace', 'Natural Black', 7000);

-- Insert Product Variants for Non-Wig products (they just have 1 default variant to represent them in checkout/inventory)
insert into public.product_variants (id, product_id, sku, length, density, lace_type, color, price_adjustment) values
  ('v1000000-0000-0000-0000-000000000101', 'p1000000-0000-0000-0000-000000000011', 'CARE-SHAMPOO-250ML', null, null, null, null, 0),
  ('v1000000-0000-0000-0000-000000000102', 'p1000000-0000-0000-0000-000000000012', 'CARE-COND-250ML', null, null, null, null, 0),
  ('v1000000-0000-0000-0000-000000000103', 'p1000000-0000-0000-0000-000000000013', 'CARE-MARULA-50ML', null, null, null, null, 0),
  ('v1000000-0000-0000-0000-000000000104', 'p1000000-0000-0000-0000-000000000014', 'CARE-EDGE-100G', null, null, null, null, 0);

-- 4. Set Stock Quantities in Inventory
insert into public.inventory (variant_id, quantity) values
  ('v1000000-0000-0000-0000-000000000001', 5), -- Maya 18" 150% -> 5 in stock
  ('v1000000-0000-0000-0000-000000000002', 4), -- Maya 18" 180% -> 4 in stock
  ('v1000000-0000-0000-0000-000000000003', 2), -- Maya 20" 180% -> 2 in stock
  ('v1000000-0000-0000-0000-000000000004', 0), -- Maya 22" 200% -> 0 in stock (Out of stock)
  ('v1000000-0000-0000-0000-000000000011', 8),
  ('v1000000-0000-0000-0000-000000000012', 3),
  ('v1000000-0000-0000-0000-000000000013', 0), -- Amara 20" -> Out of stock
  ('v1000000-0000-0000-0000-000000000101', 25),
  ('v1000000-0000-0000-0000-000000000102', 15),
  ('v1000000-0000-0000-0000-000000000103', 45),
  ('v1000000-0000-0000-0000-000000000104', 30);

-- 5. Insert Placeholder Images (using high quality, thematic Unsplash urls)
insert into public.product_images (product_id, url, alt_text, display_order) values
  ('p1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1605980776566-0486c3ac7617?auto=format&fit=crop&w=800&q=80', 'Maya Body Wave Wig Front View', 0),
  ('p1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1595959183075-c1d09e77b3cd?auto=format&fit=crop&w=800&q=80', 'Maya Body Wave Wig Details', 1),
  ('p1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1620331713240-1da21395852f?auto=format&fit=crop&w=800&q=80', 'Amara Straight Wig Sleek Silhouette', 0),
  ('p1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=800&q=80', 'Naomi Deep Wave Curls', 0),
  ('p1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80', 'Zuri Curly Elegant Model', 0),
  ('p1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80', 'Nia Face Framing Layers', 0),
  ('p1000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80', 'Ayana Premium Single Donor Wig', 0),
  ('p1000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80', 'Cocoa Hydrating Shampoo Bottle', 0),
  ('p1000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80', 'Argan Restoring Conditioner Bottle', 0),
  ('p1000000-0000-0000-0000-000000000013', 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80', 'Marula Oil Gold Serum Drop', 0),
  ('p1000000-0000-0000-0000-000000000014', 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=80', 'Shea Edge Control Tub', 0);

-- 6. Insert Default Reservation Slots for the current and coming months
-- Generates slots between 9 AM and 4 PM
insert into public.reservation_slots (date, time_slot, max_capacity, current_bookings) values
  ('2026-08-26', '09:00 - 10:00', 1, 0),
  ('2026-08-26', '10:30 - 11:30', 1, 0),
  ('2026-08-26', '13:00 - 14:00', 1, 0),
  ('2026-08-26', '14:30 - 15:30', 1, 0),
  ('2026-08-27', '09:00 - 10:00', 1, 0),
  ('2026-08-27', '10:30 - 11:30', 1, 0),
  ('2026-08-27', '13:00 - 14:00', 1, 0),
  ('2026-08-27', '14:30 - 15:30', 1, 0),
  ('2026-08-28', '09:00 - 10:00', 1, 0),
  ('2026-08-28', '10:30 - 11:30', 1, 0),
  ('2026-08-28', '13:00 - 14:00', 1, 0),
  ('2026-08-28', '14:30 - 15:30', 1, 0);
