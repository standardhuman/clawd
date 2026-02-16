import { useState, useEffect } from 'react';

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

const HASH = -982936170;
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    // Check URL param (for iframe embedding)
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'embed') {
      const parentAuth = localStorage.getItem('dashboard-auth');
      if (parentAuth && (Date.now() - parseInt(parentAuth)) < SEVEN_DAYS) {
        setAuthed(true);
        return;
      }
    }
    const authTime = parseInt(localStorage.getItem('billing-auth') || '0');
    if (authTime && (Date.now() - authTime) < SEVEN_DAYS) {
      setAuthed(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hashString(input) === HASH) {
      localStorage.setItem('billing-auth', Date.now().toString());
      setAuthed(true);
    } else {
      setError(true);
    }
  };

  if (authed) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="text-center">
        <div className="text-4xl mb-4">⛵</div>
        <input
          type="password"
          value={input}
          onChange={e => { setInput(e.target.value); setError(false); }}
          placeholder="Enter passphrase"
          autoFocus
          className="px-5 py-3 rounded-lg border border-gray-600 bg-gray-800 text-gray-200 text-center text-lg w-64 outline-none focus:border-blue-500"
        />
        {error && <div className="text-red-400 mt-2 text-sm">Nope.</div>}
      </form>
    </div>
  );
}
