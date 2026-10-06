const TOKEN_KEY = 'admin_token';

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const AUTH_CHANGED_EVENT = 'admin-auth-changed';
export const AUTH_EXPIRED_EVENT = 'admin-auth-expired';

export function getToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setToken(token: string) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage unavailable (private mode); the session just won't persist
  }
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearToken() {
  setToken('');
}

// fetch() with the admin token attached. A 401 clears the token and sends the user back to the login screen.
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(input, { ...init, headers });
  if (res.status === 401) {
    clearToken();
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
  return res;
}
