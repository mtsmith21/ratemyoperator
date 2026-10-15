// Where to send someone after they sign in or confirm their email.
// Only same-site paths are allowed ("/review?operator=..."), never another host.
export const NEXT_STORAGE_KEY = 'rmo_next';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function safeNext(raw: string | null | undefined, fallback = '/'): string {
  if (!raw) return fallback;
  let value = raw;
  try { value = decodeURIComponent(raw); } catch { /* keep raw */ }
  value = value.trim();
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback;
  if (value.startsWith('/login')) return fallback;
  return value;
}

export function loginUrl(next: string): string {
  return `/login?next=${encodeURIComponent(next)}`;
}

// Remember the destination across the email-confirmation round trip
// (the confirmation link may land on the home page if the redirect URL isn't allow-listed).
export function rememberNext(next: string) {
  try { localStorage.setItem(NEXT_STORAGE_KEY, JSON.stringify({ next, at: Date.now() })); } catch { /* private mode */ }
}

export function takeRememberedNext(): string | null {
  try {
    const raw = localStorage.getItem(NEXT_STORAGE_KEY);
    if (!raw) return null;
    localStorage.removeItem(NEXT_STORAGE_KEY);
    const { next, at } = JSON.parse(raw);
    if (typeof next !== 'string' || typeof at !== 'number' || Date.now() - at > MAX_AGE_MS) return null;
    const safe = safeNext(next, '');
    return safe || null;
  } catch {
    return null;
  }
}

export function peekRememberedNext(): boolean {
  try { return !!localStorage.getItem(NEXT_STORAGE_KEY); } catch { return false; }
}
