// Year of manufacture per tail, from the FAA Releasable Aircraft registry
// (data/fleet-years.json, rebuild with scripts/build_fleet_years_json.mjs).
import registry from '@/data/fleet-years.json';
import { normTail } from '@/lib/ntsb';

const years = registry.years as unknown as Record<string, number>;

export function yearBuilt(tail: string): number | null {
  const t = normTail(tail);
  return (t && years[t]) || null;
}

export function fleetAge(tailNumbers: string[]) {
  const ys = tailNumbers.map(yearBuilt).filter((y): y is number => y !== null);
  if (!ys.length) return null;
  const avgYear = ys.reduce((s, y) => s + y, 0) / ys.length;
  const now = new Date().getUTCFullYear();
  return {
    known: ys.length,
    total: tailNumbers.length,
    avgYear: Math.round(avgYear),
    avgAge: Math.max(0, Math.round(now - avgYear)),
    oldest: Math.min(...ys),
    newest: Math.max(...ys),
  };
}

export function formatRegistryDate(): string {
  return new Date(registry.source_date + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}
