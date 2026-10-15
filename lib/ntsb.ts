// NTSB accidents and incidents per tail, from data/ntsb-events.json
// (rebuild with scripts/build_ntsb_json.mjs). Matched by N-number AND airframe serial number.
import ntsb from '@/data/ntsb-events.json';

export interface NtsbEvent {
  date: string | null;
  type: string;
  injury: string;
  fatal: number;
  serious: number;
  damage: string | null;
  far_part: string | null;
  location: string | null;
  ntsb_no: string;
}

const tails = ntsb.tails as unknown as Record<string, NtsbEvent[]>;

export const NTSB_SINCE_YEAR: number = ntsb.since_year;

// Same normalization the build script uses: "N-4827K" / "4827K" -> "N4827K".
export function normTail(raw: string | null | undefined): string | null {
  let t = String(raw ?? '').toUpperCase().replace(/[\s-]/g, '');
  if (/^[1-9][0-9A-Z]{0,4}$/.test(t)) t = 'N' + t;
  return /^N[1-9][0-9A-Z]{0,4}$/.test(t) ? t : null;
}

export function ntsbEventsForTail(tail: string): NtsbEvent[] {
  const t = normTail(tail);
  return (t && tails[t]) || [];
}

export function ntsbEventsForFleet(tailNumbers: string[]): (NtsbEvent & { tail: string })[] {
  const seen = new Set<string>();
  const out: (NtsbEvent & { tail: string })[] = [];
  for (const tail of tailNumbers) {
    const t = normTail(tail);
    if (!t || seen.has(t)) continue;
    seen.add(t);
    for (const e of tails[t] || []) out.push({ ...e, tail });
  }
  return out.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export function ntsbLink(ntsbNo: string): string {
  return `https://data.ntsb.gov/Docket/?NTSBNumber=${encodeURIComponent(ntsbNo)}`;
}

export function formatNtsbDate(): string {
  return new Date(ntsb.source_date + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export function formatEventDate(date: string | null): string {
  if (!date) return 'Date unknown';
  return new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export const INJURY_COLORS: Record<string, string> = {
  Fatal: '#f87171',
  Serious: '#fb923c',
  Minor: '#facc15',
  None: '#9ca3af',
  'Not reported': '#9ca3af',
};
