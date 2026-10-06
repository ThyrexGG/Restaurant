import { BACKEND_URL } from './auth';

const CACHE_KEY = 'menu_cache_v1';

// Last menu we successfully loaded. It is shown instantly while a fresh copy is
// always fetched in the background, so prices/availability are never stale for more than one load.
export function getCachedMenu(): any[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return Array.isArray(data) && data.length > 0 ? data : null;
  } catch {
    return null;
  }
}

let inflight: Promise<any[]> | null = null;

// Shared by every component that needs the menu: one request at a time, result cached for next visit
export function fetchMenu(): Promise<any[]> {
  if (inflight) return inflight;
  inflight = fetch(`${BACKEND_URL}/api/menu`)
    .then(res => {
      if (!res.ok) throw new Error(`Menu request failed: ${res.status}`);
      return res.json();
    })
    .then((data: any[]) => {
      if (Array.isArray(data) && data.length > 0) {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch {
          // storage full or unavailable; caching is best-effort
        }
      }
      return data;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
