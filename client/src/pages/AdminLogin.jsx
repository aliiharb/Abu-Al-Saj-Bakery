import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, LockKeyhole } from 'lucide-react';
import api from '../api.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('abu_saj_token')) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { username, password });
      localStorage.setItem('abu_saj_token', response.data.token);
      navigate('/admin/dashboard', { replace: true });
    } catch (loginError) {
      setError(loginError.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-shell flex items-center justify-center px-4 py-10" dir="ltr">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur"
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-gold-500 text-black">
            <LockKeyhole size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Abu Al-Saj Admin</h1>
            <p className="text-sm text-stone-400">Secure menu management</p>
          </div>
        </div>

        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-semibold text-stone-300">Username</span>
          <input
            className="focus-ring w-full rounded-md border border-white/10 bg-black/35 px-3 py-2 text-white"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className="mb-5 block">
          <span className="mb-2 block text-sm font-semibold text-stone-300">Password</span>
          <input
            className="focus-ring w-full rounded-md border border-white/10 bg-black/35 px-3 py-2 text-white"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error ? (
          <div className="mb-4 rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <button
          className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold-500 px-4 py-2.5 font-bold text-black transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          Sign in to dashboard
        </button>
      </form>
    </main>
  );
}
