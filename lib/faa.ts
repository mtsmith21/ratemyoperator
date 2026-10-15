import faa from '@/data/faa-part135.json';

// Tails on the FAA's Part 135 operators and aircraft list.
// Regenerate with: node scripts/build_faa_json.mjs <faa.xlsx>
const PART135_TAILS = new Set<string>(faa.tails);

export const FAA_SOURCE_DATE: string = faa.source_date;

export function isPart135Tail(tail: string | null | undefined): boolean {
  if (!tail) return false;
  return PART135_TAILS.has(tail.trim().toUpperCase());
}

export function formatFaaDate(): string {
  return new Date(`${FAA_SOURCE_DATE}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
