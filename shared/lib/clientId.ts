const STORAGE_KEY = 'base-tap-client-id';

export function getClientId() {
  if (typeof window === 'undefined') return 'server';
  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;
  const created = `guest-${crypto.randomUUID()}`;
  window.localStorage.setItem(STORAGE_KEY, created);
  return created;
}
