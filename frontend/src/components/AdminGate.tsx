import React, { useCallback, useEffect, useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { AUTH_EXPIRED_EVENT, BACKEND_URL, getToken, setToken } from '../utils/auth';

type Phase = 'checking' | 'login' | 'ok';

// Wraps staff-only pages. Shows a password screen when the backend has ADMIN_PASSWORD set.
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>('checking');
  const [waking, setWaking] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const check = useCallback(async () => {
    setPhase('checking');
    // Retry until the backend answers: on a free host the first request can take ~30s while it wakes up
    for (;;) {
      try {
        const token = getToken();
        const res = await fetch(`${BACKEND_URL}/api/auth/check`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        setWaking(false);
        setPhase(!data.authRequired || data.valid ? 'ok' : 'login');
        return;
      } catch {
        setWaking(true);
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }, []);

  useEffect(() => {
    check();
    const onExpired = () => setPhase('login');
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [check]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setToken(data.token || '');
        setPassword('');
        setPhase('ok');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Cannot reach the server. Try again in a moment.');
    } finally {
      setBusy(false);
    }
  };

  if (phase === 'ok') return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#05080f] flex items-center justify-center p-6 text-white">
      {phase === 'checking' ? (
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="animate-spin" size={32} />
          <p>{waking ? 'Server is waking up, this can take up to 30 seconds…' : 'Loading…'}</p>
        </div>
      ) : (
        <form onSubmit={submit} className="w-full max-w-sm bg-[#0b1220] border border-gray-800 rounded-2xl p-8 space-y-5">
          <div className="flex flex-col items-center gap-2">
            <Lock className="text-yellow-300" size={28} />
            <h1 className="text-xl font-bold">Staff Login</h1>
          </div>
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            aria-label="Password"
            className="w-full rounded-xl bg-black/40 border border-gray-700 px-4 py-3 outline-none focus:border-yellow-300"
          />
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={busy || !password}
            className="w-full py-3 rounded-xl bg-yellow-300 text-black font-bold disabled:opacity-50"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      )}
    </div>
  );
}
