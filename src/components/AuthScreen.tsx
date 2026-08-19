import { useState } from 'react';
import { Mail, Lock, User, Stethoscope, UserCircle, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import type { UserRole } from '@/lib/supabase';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

interface AuthScreenProps {
  onSuccess: () => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('الرجاء إدخال الاسم الكامل');
        setLoading(false);
        return;
      }
      const { error: err } = await signUp(email, password, fullName, role);
      if (err) setError(err);
      else onSuccess();
    } else {
      const { error: err } = await signIn(email, password);
      if (err) setError(err);
      else onSuccess();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-10 anim-fade">
      <div className="absolute top-4 left-4 z-20">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="anim-float inline-flex mb-4">
            <Logo size={64} />
          </div>
          <h1 className="text-3xl font-bold text-sky-950 dark:text-sky-50">
            Phob<span className="text-emerald-500">_</span>G
          </h1>
          <p className="mt-2 text-sm text-sky-700/70 dark:text-slate-400">
            {mode === 'signin' ? 'سجّل الدخول لمتابعة رحلتك' : 'أنشئ حسابًا لبدء رحلتك'}
          </p>
        </div>

        <div className="rounded-3xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-sky-100 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex gap-2 mb-6 p-1 bg-sky-50 dark:bg-slate-700/50 rounded-full">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
                mode === 'signin' ? 'bg-white dark:bg-slate-600 text-sky-900 dark:text-sky-100 shadow-sm' : 'text-sky-600 dark:text-slate-400'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
                mode === 'signup' ? 'bg-white dark:bg-slate-600 text-sky-900 dark:text-sky-100 shadow-sm' : 'text-sky-600 dark:text-slate-400'
              }`}
            >
              حساب جديد
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="text-sm font-medium text-sky-800 dark:text-slate-300 mb-1.5 block">الاسم الكامل</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-400 dark:text-slate-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-sky-200 dark:border-slate-600 bg-white/80 dark:bg-slate-700/50 pr-11 pl-4 py-3 text-sky-900 dark:text-sky-100 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/40 transition"
                      placeholder="اسمك الكامل"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-sky-800 dark:text-slate-300 mb-1.5 block">نوع الحساب</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('patient')}
                      className={`flex flex-col items-center gap-1.5 rounded-xl p-3 border-2 transition-all ${
                        role === 'patient' ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : 'border-sky-100 dark:border-slate-600 bg-white/60 dark:bg-slate-700/40 hover:border-sky-300'
                      }`}
                    >
                      <UserCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-semibold text-sky-900 dark:text-sky-100">مريض</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('therapist')}
                      className={`flex flex-col items-center gap-1.5 rounded-xl p-3 border-2 transition-all ${
                        role === 'therapist' ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : 'border-sky-100 dark:border-slate-600 bg-white/60 dark:bg-slate-700/40 hover:border-sky-300'
                      }`}
                    >
                      <Stethoscope className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-semibold text-sky-900 dark:text-sky-100">معالج</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium text-sky-800 dark:text-slate-300 mb-1.5 block">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-400 dark:text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-sky-200 dark:border-slate-600 bg-white/80 dark:bg-slate-700/50 pr-11 pl-4 py-3 text-sky-900 dark:text-sky-100 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/40 transition"
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-sky-800 dark:text-slate-300 mb-1.5 block">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-400 dark:text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-sky-200 dark:border-slate-600 bg-white/80 dark:bg-slate-700/50 pr-11 pl-4 py-3 text-sky-900 dark:text-sky-100 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/40 transition"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all duration-200 px-6 py-3.5 text-white text-base font-semibold shadow-lg shadow-emerald-200/60 dark:shadow-emerald-900/40 disabled:opacity-50"
            >
              {loading ? 'جارٍ المعالجة...' : mode === 'signin' ? 'دخول' : 'إنشاء الحساب'}
              <ChevronLeft className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
