import { useEffect, useState, useMemo } from 'react';
import { PlayCircle, ClipboardList, Trophy, TrendingUp, ChevronLeft, Gamepad2, Glasses, Clock, Target, Flame, Award, Activity } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase, type GameProgressRow, type QuestionnaireSession } from '@/lib/supabase';
import { PHOBIAS, getPhobia, LIKES } from '@/data/journey';
import Header from './Header';
import { useNotifications } from '@/lib/notifications';

interface PatientDashboardProps {
  onStartQuestionnaire: () => void;
  onContinueGame: (sessionId: string, phobiaType: string, likeType: string) => void;
  onStartVR: (phobiaType: string, likeType: string) => void;
}

export default function PatientDashboard({ onStartQuestionnaire, onContinueGame, onStartVR }: PatientDashboardProps) {
  const { profile } = useAuth();
  const { addNotification } = useNotifications();
  const [sessions, setSessions] = useState<QuestionnaireSession[]>([]);
  const [progress, setProgress] = useState<GameProgressRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [{ data: sData }, { data: pData }] = await Promise.all([
        supabase.from('questionnaire_sessions').select('*').eq('patient_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('game_progress').select('*').eq('patient_id', profile.id).order('started_at', { ascending: false }),
      ]);
      setSessions((sData as QuestionnaireSession[]) || []);
      setProgress((pData as GameProgressRow[]) || []);
      setLoading(false);
    })();
  }, [profile]);

  const stats = useMemo(() => {
    const completedCount = progress.filter((p) => p.status === 'completed').length;
    const inProgress = progress.filter((p) => p.status === 'in_progress');
    const totalStars = progress.reduce((sum, p) => sum + (p.completed_levels?.length || 0), 0);
    const totalLevelsAttempted = progress.reduce((sum, p) => sum + (p.completed_levels?.length || 0), 0);
    const overallPct = progress.length > 0
      ? Math.round(progress.reduce((sum, p) => {
          const c = p.completed_levels?.length || 0;
          return sum + (c / p.total_levels) * 100;
        }, 0) / progress.length)
      : 0;

    // Streak: consecutive days with activity (simplified — based on started_at dates)
    const days = new Set<string>();
    progress.forEach((p) => {
      const d = new Date(p.started_at).toDateString();
      days.add(d);
    });
    const streak = days.size;

    // Phobia breakdown
    const phobiaBreakdown = PHOBIAS.map((ph) => {
      const relevant = progress.filter((p) => p.phobia_type === ph.id);
      const completed = relevant.filter((p) => p.status === 'completed').length;
      const levelsDone = relevant.reduce((s, p) => s + (p.completed_levels?.length || 0), 0);
      const totalLevels = relevant.reduce((s, p) => s + p.total_levels, 0);
      return { phobia: ph, completed, levelsDone, totalLevels, sessions: relevant.length };
    }).filter((x) => x.sessions > 0);

    return { completedCount, inProgress, totalStars, totalLevelsAttempted, overallPct, streak, phobiaBreakdown };
  }, [progress]);

  useEffect(() => {
    if (!loading && stats.inProgress.length > 0) {
      stats.inProgress.forEach((p) => {
        const completed = p.completed_levels?.length || 0;
        if (completed > 0 && completed < p.total_levels) {
          addNotification({
            title: 'رحلة قيد التقدّم',
            body: `لديك رحلة ${getPhobia(p.phobia_type as any)?.label} توقفت عند المستوى ${completed + 1} من ${p.total_levels}.`,
            type: 'info',
          });
        }
      });
    }
    if (!loading && stats.completedCount > 0) {
      addNotification({
        title: 'إنجاز جديد',
        body: `أكملت ${stats.completedCount} رحلة علاجية بنجاح. واصل التقدّم!`,
        type: 'success',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function handleStartVR() {
    const latest = stats.inProgress[0] || sessions[0];
    if (latest) {
      const pt = ('phobia_type' in latest ? latest.phobia_type : null) as string | null;
      const lt = ('like_type' in latest ? latest.like_type : null) as string | null;
      if (pt && lt) { onStartVR(pt, lt); return; }
    }
    onStartVR('heights', 'cats');
  }

  return (
    <div className="min-h-[100dvh] anim-fade">
      <Header sectionLabel="لوحة المريض" />

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Welcome banner */}
        <div className="rounded-3xl bg-gradient-to-br from-sky-600 to-emerald-600 p-6 text-white shadow-xl shadow-sky-200/40 dark:shadow-sky-900/40 anim-scale">
          <h2 className="text-2xl font-bold mb-1">أهلاً، {profile?.full_name}</h2>
          <p className="text-white/85 text-sm leading-relaxed">«خطوة بخطوة، تتعافى. كل مستوى تمرّ به هو انتصار صغير يقربك من حياة بلا خوف.»</p>
        </div>

        {/* Stats grid - detailed */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger">
          <StatCard icon={Trophy} value={stats.completedCount} label="رحلات مكتملة" color="emerald" />
          <StatCard icon={TrendingUp} value={stats.totalStars} label="نجوم مكتسبة" color="amber" />
          <StatCard icon={ClipboardList} value={sessions.length} label="استبيانات" color="sky" />
          <StatCard icon={Flame} value={stats.streak} label="أيام نشطة" color="orange" />
        </div>

        {/* Overall progress ring + level breakdown */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Progress ring */}
          <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-sky-100 dark:border-slate-700 p-6 flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold text-sky-950 dark:text-sky-50 mb-4 self-start">نسبة التقدّم الإجمالية</h3>
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="56" fill="none" strokeWidth="10" className="stroke-sky-100 dark:stroke-slate-700" />
                <circle
                  cx="64" cy="64" r="56" fill="none" strokeWidth="10"
                  stroke="url(#progress-grad)" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 56}
                  strokeDashoffset={2 * Math.PI * 56 * (1 - stats.overallPct / 100)}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="progress-grad" x1="0" y1="0" x2="128" y2="128">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-sky-950 dark:text-sky-50 tabular-nums">{stats.overallPct}%</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-sky-600 dark:text-slate-400 text-center">
              {stats.totalLevelsAttempted} مستوى مكتمل من أصل {progress.reduce((s, p) => s + p.total_levels, 0)}
            </p>
          </div>

          {/* Phobia breakdown */}
          <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-sky-100 dark:border-slate-700 p-6">
            <h3 className="text-sm font-bold text-sky-950 dark:text-sky-50 mb-4">تقدّمك حسب نوع الخوف</h3>
            {stats.phobiaBreakdown.length === 0 ? (
              <p className="text-sm text-sky-500 dark:text-slate-400 py-8 text-center">لم تبدأ أي رحلة بعد</p>
            ) : (
              <div className="space-y-3">
                {stats.phobiaBreakdown.map((item) => {
                  const pct = item.totalLevels > 0 ? Math.round((item.levelsDone / item.totalLevels) * 100) : 0;
                  return (
                    <div key={item.phobia.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-sky-900 dark:text-sky-100">{item.phobia.emoji} {item.phobia.label}</span>
                        <span className="text-xs text-sky-500 dark:text-slate-400 tabular-nums">{item.levelsDone}/{item.totalLevels}</span>
                      </div>
                      <div className="h-2 rounded-full bg-sky-100 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Start new journey — Game vs VR choice */}
        <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-sky-100 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-sky-950 dark:text-sky-50 mb-2">ابدأ رحلة جديدة</h3>
          <p className="text-sm text-sky-700/70 dark:text-slate-400 mb-4 leading-relaxed">
            اجب عن 10 أسئلة تشخيصية لإنشاء مسار علاجي مخصّص، ثم اختر طريقة التعرّض: لعبة تفاعلية أو واقع افتراضي.
          </p>
          <button onClick={onStartQuestionnaire} className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all duration-200 px-6 py-3 text-white text-sm font-semibold shadow-lg shadow-emerald-200/60 dark:shadow-emerald-900/40">
            <PlayCircle className="w-5 h-5" />
            ابدأ الاستبيان
          </button>
        </div>

        {/* Mode choice for existing sessions */}
        {stats.inProgress.length > 0 && (
          <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-sky-950 dark:text-sky-50 mb-4">رحلات قيد التقدّم — اختر وضع المتابعة</h3>
            <div className="space-y-4">
              {stats.inProgress.map((p) => {
                const phobia = getPhobia(p.phobia_type as any);
                const like = LIKES.find((l) => l.id === p.like_type);
                const completed = p.completed_levels?.length || 0;
                const pct = Math.round((completed / p.total_levels) * 100);
                return (
                  <div key={p.id} className="rounded-xl bg-sky-50 dark:bg-slate-700/40 border border-sky-100 dark:border-slate-600 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{phobia?.emoji}</span>
                        <span className="font-semibold text-sky-900 dark:text-sky-100">{phobia?.label}</span>
                        <span className="text-sm text-sky-500 dark:text-slate-400">· {like?.emoji} {like?.label}</span>
                      </div>
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">{completed}/{p.total_levels}</span>
                    </div>
                    <div className="h-2 rounded-full bg-sky-100 dark:bg-slate-600 overflow-hidden mb-4">
                      <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button onClick={() => onContinueGame(p.session_id || '', p.phobia_type, p.like_type)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-white dark:bg-slate-600 border-2 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm font-semibold px-4 py-2.5 transition-all">
                        <Gamepad2 className="w-4 h-4" />
                        متابعة باللعب
                      </button>
                      <button onClick={() => onStartVR(p.phobia_type, p.like_type)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white text-sm font-semibold px-4 py-2.5 transition-all shadow-md shadow-sky-200/40 dark:shadow-sky-900/30">
                        <Glasses className="w-4 h-4" />
                        متابعة بـ VR
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VR quick access */}
        {sessions.length > 0 && stats.inProgress.length === 0 && (
          <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 dark:from-sky-700 dark:to-indigo-800 p-6 text-white shadow-lg shadow-sky-200/40 dark:shadow-sky-900/40 anim-scale">
            <div className="flex items-center gap-3 mb-3">
              <Glasses className="w-6 h-6" />
              <h3 className="text-lg font-bold">جرّب وضع الواقع الافتراضي</h3>
            </div>
            <p className="text-white/85 text-sm mb-4 leading-relaxed">
              تجربة غامرة ثلاثية الأبعاد لمواجهة مخاوفك في بيئة آمنة ومتحكم بها.
            </p>
            <button onClick={handleStartVR} className="inline-flex items-center gap-2 rounded-full bg-white text-sky-700 hover:bg-sky-50 transition-all px-5 py-2.5 text-sm font-semibold">
              <Glasses className="w-4 h-4" />
              ابدأ تجربة VR
            </button>
          </div>
        )}

        {/* Recent sessions history */}
        {sessions.length > 0 && (
          <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-sky-500 dark:text-sky-400" />
              <h3 className="text-lg font-bold text-sky-950 dark:text-sky-50">سجلّ الاستبيانات</h3>
            </div>
            <div className="space-y-2">
              {sessions.slice(0, 5).map((s) => {
                const phobia = PHOBIAS.find((p) => p.id === s.phobia_type);
                return (
                  <div key={s.id} className="flex items-center justify-between rounded-xl bg-sky-50 dark:bg-slate-700/40 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{phobia?.emoji || '📋'}</span>
                      <div>
                        <p className="text-sm font-semibold text-sky-900 dark:text-sky-100">{phobia?.label || 'استبيان'}</p>
                        <p className="text-xs text-sky-500 dark:text-slate-400">{new Date(s.created_at).toLocaleDateString('ar')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">شدّة: {s.intensity}/10</span>
                      {s.recommended && <span className="text-xs text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/30 px-2 py-1 rounded-full hidden sm:inline">{s.recommended}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Achievements */}
        {stats.totalStars > 0 && (
          <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-sky-950 dark:text-sky-50">إنجازاتك</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Achievement icon={Target} label="أول خطوة" unlocked={stats.totalLevelsAttempted >= 1} />
              <Achievement icon={TrendingUp} label="5 مستويات" unlocked={stats.totalLevelsAttempted >= 5} />
              <Achievement icon={Trophy} label="رحلة كاملة" unlocked={stats.completedCount >= 1} />
              <Achievement icon={Flame} label="3 أيام نشطة" unlocked={stats.streak >= 3} />
            </div>
          </div>
        )}

        {!loading && sessions.length === 0 && progress.length === 0 && (
          <div className="text-center py-10">
            <Activity className="w-12 h-12 text-sky-200 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sky-600/60 dark:text-slate-400 text-sm">لم تبدأ أي رحلة بعد. ابدأ الاستبيان لإنشاء مسارك.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color }: { icon: any; value: number; label: string; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-500 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
    amber: 'text-amber-500 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
    sky: 'text-sky-500 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/30',
    orange: 'text-orange-500 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
  };
  return (
    <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 p-4 text-center">
      <div className={`w-10 h-10 rounded-xl ${colorMap[color]} flex items-center justify-center mx-auto mb-2`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-sky-950 dark:text-sky-50 tabular-nums">{value}</p>
      <p className="text-xs text-sky-600 dark:text-slate-400 mt-1">{label}</p>
    </div>
  );
}

function Achievement({ icon: Icon, label, unlocked }: { icon: any; label: string; unlocked: boolean }) {
  return (
    <div className={`rounded-xl p-3 text-center transition-all ${unlocked ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' : 'bg-sky-50 dark:bg-slate-700/40 border border-sky-100 dark:border-slate-600 opacity-50'}`}>
      <Icon className={`w-6 h-6 mx-auto mb-1 ${unlocked ? 'text-amber-500' : 'text-sky-300 dark:text-slate-500'}`} />
      <p className={`text-xs font-medium ${unlocked ? 'text-amber-700 dark:text-amber-400' : 'text-sky-400 dark:text-slate-500'}`}>{label}</p>
    </div>
  );
}
