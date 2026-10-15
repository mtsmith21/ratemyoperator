// Stable, URL-safe slug from an operator name: "Jet Linx" -> "jet-linx".
export function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/ı/g, 'i')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'operator';
}

// Company-name normalizer used to match operators to FAA aircraft rows:
// "Jet Linx Aviation, LLC" -> "jet linx aviation".
const SUFFIXES = /\b(l\s*l\s*c|inc|incorporated|corp|corporation|ltd|limited|co|company|lp|llp|pllc|dba)\b/g;

export function normalizeCompany(name: string | null | undefined): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(SUFFIXES, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
