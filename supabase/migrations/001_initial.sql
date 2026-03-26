-- ============================================
-- DiraTrak - Initial Schema
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. Profiles table
-- ============================================
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 2. Apartments table
-- ============================================
CREATE TABLE apartments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  source text NOT NULL CHECK (source IN ('YAD2', 'FACEBOOK', 'OTHER')),
  source_url text,
  status text NOT NULL DEFAULT 'NEW' CHECK (status IN (
    'NEW', 'CONTACTED', 'RESPONDED', 'VIEWING_SCHEDULED',
    'VIEWED', 'INTERESTED', 'REJECTED', 'RENTED'
  )),
  price integer,
  rooms real,
  neighborhood text,
  address text,
  contact_name text,
  contact_phone text,
  floor integer,
  size integer,
  notes text,
  viewing_date timestamptz,
  rating smallint CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  created_by uuid REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can do everything on apartments"
  ON apartments FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER apartments_updated_at
  BEFORE UPDATE ON apartments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 3. Status logs table
-- ============================================
CREATE TABLE status_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id uuid NOT NULL REFERENCES apartments ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  note text,
  changed_by uuid NOT NULL REFERENCES auth.users DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE status_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can do everything on status_logs"
  ON status_logs FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 4. Change status RPC (atomic status + log)
-- ============================================
CREATE OR REPLACE FUNCTION change_apartment_status(
  p_apartment_id uuid,
  p_new_status text,
  p_note text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_old_status text;
BEGIN
  -- Validate status value
  IF p_new_status NOT IN (
    'NEW', 'CONTACTED', 'RESPONDED', 'VIEWING_SCHEDULED',
    'VIEWED', 'INTERESTED', 'REJECTED', 'RENTED'
  ) THEN
    RAISE EXCEPTION 'Invalid status: %', p_new_status;
  END IF;

  SELECT status INTO v_old_status FROM apartments WHERE id = p_apartment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Apartment not found: %', p_apartment_id;
  END IF;

  UPDATE apartments SET status = p_new_status WHERE id = p_apartment_id;

  INSERT INTO status_logs (apartment_id, from_status, to_status, note, changed_by)
  VALUES (p_apartment_id, v_old_status, p_new_status, p_note, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. Enable Realtime
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE apartments;

-- ============================================
-- 6. Indexes
-- ============================================
CREATE INDEX idx_apartments_status ON apartments (status);
CREATE INDEX idx_apartments_created_at ON apartments (created_at DESC);
CREATE INDEX idx_status_logs_apartment_id ON status_logs (apartment_id);
CREATE INDEX idx_status_logs_created_at ON status_logs (created_at DESC);
