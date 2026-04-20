-- ════════════════════════════════════════════════════════════════
-- Accra Creatives Hub — Row Level Security Policies
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════════════════════════

-- ── Drop existing policies first (safe to re-run) ────────────────

DROP POLICY IF EXISTS "users_read_own_orders"          ON orders;
DROP POLICY IF EXISTS "clients_insert_orders"          ON orders;
DROP POLICY IF EXISTS "clients_update_own_orders"      ON orders;
DROP POLICY IF EXISTS "designers_update_own_orders"    ON orders;
DROP POLICY IF EXISTS "admin_all_orders"               ON orders;

DROP POLICY IF EXISTS "users_read_own_messages"        ON messages;
DROP POLICY IF EXISTS "users_insert_own_messages"      ON messages;
DROP POLICY IF EXISTS "admin_read_all_messages"        ON messages;

DROP POLICY IF EXISTS "anyone_read_reviews"            ON reviews;
DROP POLICY IF EXISTS "clients_insert_reviews"         ON reviews;
DROP POLICY IF EXISTS "admin_all_reviews"              ON reviews;

DROP POLICY IF EXISTS "participants_read_disputes"     ON disputes;
DROP POLICY IF EXISTS "clients_insert_disputes"        ON disputes;
DROP POLICY IF EXISTS "admin_all_disputes"             ON disputes;

DROP POLICY IF EXISTS "users_read_own_profile"         ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile"       ON profiles;
DROP POLICY IF EXISTS "users_insert_own_profile"       ON profiles;
DROP POLICY IF EXISTS "admin_all_profiles"             ON profiles;

DROP POLICY IF EXISTS "public_read_visible_designers"  ON designers;
DROP POLICY IF EXISTS "designers_update_own_record"    ON designers;
DROP POLICY IF EXISTS "designers_insert_own_record"    ON designers;
DROP POLICY IF EXISTS "admin_all_designers"            ON designers;


-- ════════════════════════════════════════════════════════════════
-- ORDERS
-- ════════════════════════════════════════════════════════════════

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can only read orders they are part of
CREATE POLICY "users_read_own_orders" ON orders
  FOR SELECT
  USING (
    auth.uid() = client_id
    OR auth.uid() = designer_id
  );

-- Only clients can create orders (as themselves)
CREATE POLICY "clients_insert_orders" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- Clients can update only their own orders
CREATE POLICY "clients_update_own_orders" ON orders
  FOR UPDATE
  USING  (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- Designers can update only their own orders
CREATE POLICY "designers_update_own_orders" ON orders
  FOR UPDATE
  USING  (auth.uid() = designer_id)
  WITH CHECK (auth.uid() = designer_id);

-- Admins have full access
CREATE POLICY "admin_all_orders" ON orders
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );


-- ════════════════════════════════════════════════════════════════
-- MESSAGES
-- ════════════════════════════════════════════════════════════════

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can only read messages for orders they belong to
CREATE POLICY "users_read_own_messages" ON messages
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders
      WHERE client_id = auth.uid() OR designer_id = auth.uid()
    )
  );

-- Users can only send messages to orders they belong to, and only as themselves
CREATE POLICY "users_insert_own_messages" ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND order_id IN (
      SELECT id FROM orders
      WHERE client_id = auth.uid() OR designer_id = auth.uid()
    )
  );

-- Admins can read all messages (for dispute resolution)
CREATE POLICY "admin_read_all_messages" ON messages
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );


-- ════════════════════════════════════════════════════════════════
-- REVIEWS
-- ════════════════════════════════════════════════════════════════

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Reviews are public (displayed on designer profiles)
CREATE POLICY "anyone_read_reviews" ON reviews
  FOR SELECT USING (true);

-- Only clients can submit reviews, only for orders they own
CREATE POLICY "clients_insert_reviews" ON reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = client_id
    AND order_id IN (SELECT id FROM orders WHERE client_id = auth.uid())
  );

-- Admins have full access
CREATE POLICY "admin_all_reviews" ON reviews
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );


-- ════════════════════════════════════════════════════════════════
-- DISPUTES
-- ════════════════════════════════════════════════════════════════

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Both order participants can read disputes for their orders
CREATE POLICY "participants_read_disputes" ON disputes
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders
      WHERE client_id = auth.uid() OR designer_id = auth.uid()
    )
  );

-- Only clients can open disputes, only for orders they own
CREATE POLICY "clients_insert_disputes" ON disputes
  FOR INSERT
  WITH CHECK (
    order_id IN (SELECT id FROM orders WHERE client_id = auth.uid())
  );

-- Admins have full access (needed for dispute resolution panel)
CREATE POLICY "admin_all_disputes" ON disputes
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );


-- ════════════════════════════════════════════════════════════════
-- PROFILES
-- ════════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile row
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update only their own profile
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE
  USING  (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile on signup
CREATE POLICY "users_insert_own_profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins have full access
CREATE POLICY "admin_all_profiles" ON profiles
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );


-- ════════════════════════════════════════════════════════════════
-- DESIGNERS
-- ════════════════════════════════════════════════════════════════

ALTER TABLE designers ENABLE ROW LEVEL SECURITY;

-- Anyone can read public designer profiles (marketplace browsing)
CREATE POLICY "public_read_visible_designers" ON designers
  FOR SELECT
  USING (public_visible = true OR auth.uid() = id);

-- Designers can update only their own record
CREATE POLICY "designers_update_own_record" ON designers
  FOR UPDATE
  USING  (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Designers can insert their own record on signup
CREATE POLICY "designers_insert_own_record" ON designers
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins have full access
CREATE POLICY "admin_all_designers" ON designers
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );


-- ════════════════════════════════════════════════════════════════
-- REALTIME — enable for messages and orders so subscriptions work
-- Run these separately if the above already ran:
-- ════════════════════════════════════════════════════════════════

-- Allow realtime replication on these tables (required for postgres_changes)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
