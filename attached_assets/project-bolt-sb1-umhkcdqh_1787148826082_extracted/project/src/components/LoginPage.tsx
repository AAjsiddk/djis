import { useState } from 'react';
import { Eye, EyeOff, Loader2, Lock, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function LoginPage() {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const ok = login(password);
      if (!ok) setError('كلمة السر غير صحيحة');
      setLoading(false);
    }, 400);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 p-4">
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute right-10 top-1/4 h-64 w-2 rotate-12 bg-gold-400" />
        <div className="absolute right-24 top-1/4 h-64 w-2 rotate-12 bg-gold-400" />
        <div className="absolute right-16 top-1/3 h-40 w-px rotate-12 bg-white/40" />
        <div className="absolute left-20 bottom-1/4 h-80 w-2 -rotate-12 bg-gold-400/60" />
        <div className="absolute left-40 bottom-1/4 h-80 w-2 -rotate-12 bg-gold-400/60" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gold-500 shadow-glow">
            <TrendingUp size={42} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">سلم الصعود</h1>
          <p className="mt-2 text-sm font-medium text-primary-200">
            كل يوم وانت طالع درجة
          </p>
        </div>

        <div className="rounded-2xl bg-white/95 p-7 shadow-card backdrop-blur dark:bg-slate-800/95">
          <h2 className="mb-6 text-center text-lg font-bold text-slate-800 dark:text-slate-100">
            تسجيل الدخول
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">كلمة السر</label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input px-10"
                  placeholder="أدخل كلمة السر"
                  dir="ltr"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPass ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="animate-fade-in rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-900/30 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                'دخول'
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-primary-200">
          بياناتك محفوظة على جهازك فقط — لا أحد يراها سواك
        </p>
      </div>
    </div>
  );
}
