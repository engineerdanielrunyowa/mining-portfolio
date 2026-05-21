import { useState } from 'react';
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (password: string) => Promise<boolean>;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const success = await onLogin(password);
      if (!success) {
        setStatus('error');
        setErrorMsg('Invalid password. Please try again.');
        setPassword('');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Connection error. Please try again.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      {/* Background pattern */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(31,47,64,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(194,155,87,0.05) 0%, transparent 50%)',
        }}
      />

      <div className="w-full max-w-md px-6">
        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 20px 60px var(--shadow-color)',
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: 'linear-gradient(135deg, var(--accent-primary), rgba(31,47,64,0.6))',
                border: '1px solid rgba(194,155,87,0.2)',
              }}
            >
              <Lock size={24} style={{ color: 'var(--accent-secondary)' }} />
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
              Admin Dashboard
            </h1>
            <p className="text-sm mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>
              Mining Engineer Portfolio
            </p>
            <div
              className="w-10 h-0.5 mx-auto mt-3 rounded-full"
              style={{ backgroundColor: 'var(--accent-secondary)' }}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-mono font-semibold tracking-wider uppercase mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="form-input pr-10"
                  placeholder="Enter your password"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {status === 'error' && (
              <div
                className="flex items-center gap-2 p-3 rounded-lg text-xs"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#ef4444',
                }}
              >
                <AlertCircle size={14} />
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !password}
              className="btn-primary w-full justify-center mt-2"
              style={{ opacity: (!password || status === 'loading') ? 0.6 : 1 }}
            >
              {status === 'loading' ? (
                <>
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M22 12a10 10 0 01-10 10" />
                  </svg>
                  Authenticating...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            Secured by Cloudflare Workers · Session expires in 24h
          </p>
        </div>

        <p className="text-center mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <a href="/" className="hover:underline">← Return to portfolio</a>
        </p>
      </div>
    </div>
  );
}
