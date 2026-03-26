-- Apartment conversation notes (free-form timestamped messages per apartment)
CREATE TABLE apartment_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id uuid NOT NULL REFERENCES apartments ON DELETE CASCADE,
  content text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE apartment_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can do everything on apartment_notes"
  ON apartment_notes FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX idx_apartment_notes_apartment_id ON apartment_notes (apartment_id);
