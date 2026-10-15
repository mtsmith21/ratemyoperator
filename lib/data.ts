// Server-side data access for statically rendered pages (home, operator pages, sitemap).
// Uses the public anon key: only rows RLS lets the public read are returned.
import { createClient } from '@supabase/supabase-js';
import { slugify, normalizeCompany } from '@/lib/slug';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export interface OperatorRow {
  id: string;
  name: string;
  slug: string;
  fleet_size: string | null;
  region: string | null;
  aircraft_count: number | null;
  is_claimed: boolean | null;
  website: string | null;
  description: string | null;
  created_at: string;
}

export interface ReviewRow {
  id: string;
  operator_id: string;
  safety_score: number;
  service_score: number;
  punctuality_score: number;
  value_score: number;
  review_text: string;
  tail_number: string | null;
  date_flown: string | null;
  created_at: string;
}

export interface AircraftRow {
  tail_number: string;
  aircraft_type: string;
  operator_name: string;
  dba_name: string | null;
}

const PAGE = 1000;
const TTL_MS = 10 * 60 * 1000;

// Small in-process memo so a build (684 pages) or a warm server
// fetches each table once instead of once per page.
function memo<T>(fn: () => Promise<T>): () => Promise<T> {
  let value: Promise<T> | null = null;
  let at = 0;
  return () => {
    if (!value || Date.now() - at > TTL_MS) {
      at = Date.now();
      value = fn().catch(err => {
        value = null;
        throw err;
      });
    }
    return value;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAll<T>(table: string, columns: string, apply?: (q: any) => any): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    let q = supabase.from(table).select(columns).order('id').range(from, from + PAGE - 1);
    if (apply) q = apply(q);
    const { data, error } = await q;
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...((data || []) as T[]));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

export const getOperators = memo(async (): Promise<OperatorRow[]> => {
  const rows = await fetchAll<Omit<OperatorRow, 'slug'>>(
    'operators',
    'id, name, fleet_size, region, aircraft_count, is_claimed, website, description, created_at'
  );
  // Oldest first, so an existing operator keeps its slug if a same-named one is added later.
  rows.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || '') || a.id.localeCompare(b.id));
  const used = new Set<string>();
  const withSlugs = rows.map(op => {
    const base = slugify(op.name);
    let slug = base;
    for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
    used.add(slug);
    return { ...op, slug };
  });
  return withSlugs.sort((a, b) => a.name.localeCompare(b.name));
});

export const getApprovedReviews = memo(async (): Promise<ReviewRow[]> => {
  const rows = await fetchAll<ReviewRow>(
    'reviews',
    'id, operator_id, safety_score, service_score, punctuality_score, value_score, review_text, tail_number, date_flown, created_at',
    q => q.eq('is_approved', true)
  );
  return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
});

// All aircraft with their company names normalized once, for fleet matching.
const getAircraftIndex = memo(async () => {
  const rows = await fetchAll<AircraftRow>('aircraft', 'tail_number, aircraft_type, operator_name, dba_name');
  return rows.map(a => ({ row: a, op: normalizeCompany(a.operator_name), dba: normalizeCompany(a.dba_name) }));
});

export async function getOperatorBySlug(slug: string): Promise<OperatorRow | undefined> {
  const ops = await getOperators();
  return ops.find(op => op.slug === slug);
}

// Fleet for an operator, matched by company name against the FAA aircraft rows.
// Conservative on purpose: an exact (normalized) name or DBA match wins; otherwise a
// "starts with" match is used only when it points to a single FAA company.
// Better to show no fleet than someone else's airplanes.
export async function getFleet(operatorName: string): Promise<AircraftRow[]> {
  const target = normalizeCompany(operatorName);
  if (!target) return [];
  const aircraft = await getAircraftIndex();
  let fleet = aircraft.filter(a => a.op === target || a.dba === target);
  if (!fleet.length) {
    const prefix = aircraft.filter(a => a.op.startsWith(target + ' ') || a.dba.startsWith(target + ' '));
    const companies = new Set(prefix.map(a => a.op));
    fleet = companies.size === 1 ? prefix : [];
  }
  return fleet
    .map(a => a.row)
    .sort(
    (a, b) => a.aircraft_type.localeCompare(b.aircraft_type) || a.tail_number.localeCompare(b.tail_number)
  );
}

export function scoreSummary(reviews: ReviewRow[]) {
  const count = reviews.length;
  if (!count) return null;
  const avg = (k: 'safety_score' | 'service_score' | 'punctuality_score' | 'value_score') =>
    reviews.reduce((s, r) => s + r[k], 0) / count;
  const safety = avg('safety_score');
  const service = avg('service_score');
  const punctuality = avg('punctuality_score');
  const value = avg('value_score');
  return { count, safety, service, punctuality, value, overall: (safety + service + punctuality + value) / 4 };
}
