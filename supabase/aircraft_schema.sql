-- Run this in your Supabase SQL Editor
-- Creates the aircraft table and sets up RLS

CREATE TABLE IF NOT EXISTS public.aircraft (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_name text NOT NULL,
  aircraft_type text NOT NULL,
  tail_number   text NOT NULL UNIQUE,
  cfr           text,
  created_at    timestamptz DEFAULT now()
);

-- Indexes for fast search
CREATE INDEX IF NOT EXISTS idx_aircraft_operator_name ON public.aircraft (operator_name);
CREATE INDEX IF NOT EXISTS idx_aircraft_type ON public.aircraft (aircraft_type);
CREATE INDEX IF NOT EXISTS idx_aircraft_tail ON public.aircraft (tail_number);
CREATE INDEX IF NOT EXISTS idx_aircraft_operator_lower ON public.aircraft (lower(operator_name));

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_aircraft_fts ON public.aircraft
  USING gin(to_tsvector('english', operator_name || ' ' || aircraft_type || ' ' || tail_number));

-- Enable RLS
ALTER TABLE public.aircraft ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can search)
CREATE POLICY "Public read access" ON public.aircraft
  FOR SELECT USING (true);

-- Only service role can insert/update (for bulk import)
CREATE POLICY "Service role write" ON public.aircraft
  FOR ALL USING (auth.role() = 'service_role');
