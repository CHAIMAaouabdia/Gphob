import { useEffect, useState, useMemo } from 'react';
import { LogOut, Users, Activity, TrendingUp, Heart, Clock, ChevronLeft, Target, Award, AlertCircle, Stethoscope, Mail, ClipboardList, Trophy } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase, type GameProgressRow, type QuestionnaireSession, type Profile, type PatientProfile } from '@/lib/supabase';
import { PHOBIAS, getPhobia } from '@/data/journey';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import { useNotifications } from '@/lib/notifications';

interface PatientWithInfo {
  patientProfile: PatientProfile;
  profile: Profile;
  sessions: QuestionnaireSession[];
  progress: GameProgressRow[];
}

export default function TherapistDashboard() {
  const { profile, signOut } = useAuth();
  const { addNotification } = useNotifications();
  const [patients, setPatients] = useState<PatientWithInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithInfo | null>(null);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: patientProfiles } = await supabase.from('patient_profiles').select('*').eq('therapist_id', profile.id);
      if (!patientProfiles) { setLoading(false); return; }

      const patientsData: PatientWithInfo[] = [];
      for (const pp of patientProfiles as PatientProfile[]) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', pp.profile_id).maybeSingle();
        const { data: sessions } = await supabase.from('questionnaire_sessions').select('*').eq('patient_id', pp.profile_id).order('created_at', { ascending: false });
        const { data: progress } = await supabase.from('game_progress').select('*').eq('patient_id', pp.profile_id).order('started_at', { ascending: false });
        if (prof) {
          patientsData.push({ patientProfile: pp, profile: prof as Profile, sessions: (sessions as QuestionnaireSession[]) || [], progress: (progress as GameProgressRow[]) || [] });
        }
      }
      setPatients(patientsData);
      setLoading(false);
    })();
  }, [profile]);

  const stats = useMemo(() => {
    const totalCompleted = patients.reduce((sum, p) => sum + p.progress.filter((pr) => pr.status === 'completed').length, 0);
    const totalStars = patients.reduce((sum, p) => sum + p.progress.reduce((s, pr) => s + (pr.completed_levels?.length || 0), 0), 0);
    const totalInProgress = patients.reduce((sum, p) => sum + p.progress.filter((pr) => pr.status === 'in_progress').length, 0);
    const totalSessions = patients.reduce((sum, p) => sum + p.sessions.length, 0);
    const avgProgress = patients.length > 0
      ? Math.round(patients.reduce((sum, p) => {
          if (p.progress.length === 0) return sum;
          const patientAvg = p.progress.reduce((s, pr) => s + ((pr.completed_levels?.length || 0) / pr.total_levels) * 100, 0) / p.progress.length;
          return sum + patientAvg;
        }, 0) / patients.length)
      : 0;

    // Phobia distribution across all patients
    const phobiaDist = PHOBIAS.map((ph) => ({
      phobia: ph,
      count: patients.reduce((sum, p) => sum + p.progress.filter((pr) => pr.phobia_type === ph.id).length, 0),
    })).filter((x) => x.count > 0);

    return { totalCompleted, totalStars, totalInProgress, totalSessions, avgProgress, phobiaDist };
  }, [patients]);

  useEffect(() => {
    if (!loading) {
      patients.forEach((p) => {
        const completed = p.progress.filter((pr) => pr.status === 'completed').length;
        if (completed > 0) {
          addNotification({
            title: `إنجاز مريض: ${p.profile.full_name}`,
            body: `أكمل ${completed} رحلة علاجية بنجاح.`,
            type: 'success',
          });
        }
        const stuck = p.progress.filter((pr) => pr.status === 'in_progress' && (pr.completed_levels?.length || 0) < pr.total_levels / 2);
        if (stuck.length > 0) {
          addNotification({
            title: `مريض يحتاج متابعة: ${p.profile.full_name}`,
            body: `توقّف عند منتصف الرحلة. قد يحتاج تشجيعًا إضافيًا.`,
            type: 'warning',
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (selectedPatient) {
    const p = selectedPatient;
    const patientCompleted = p.progress.filter((pr) => pr.status === 'completed').length;
    const patientStars = p.progress.reduce((s, pr) => s + (pr.completed_levels?.length || 0), 0);
    const patientPct = p.progress.length > 0
      ? Math.round(p.progress.reduce((s, pr) => s + ((pr.completed_levels?.length || 0) / pr.total_levels) * 100, 0) / p.progress.length)
      : 0;

    return (
      <div className="min-h-[100dvh] anim-fade">
        <header className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-b border-sky-100 dark:border-slate-700 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <button onClick={() => setSelectedPatient(null)} className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-800 transition flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              رجوع لقائمة المرضى
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-sky-950 dark:text-sky-50">{p.profile.full_name}</h1>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {/* Patient overview */}
          <div className="rounded-3xl bg-gradient-to-br from-sky-600 to-emerald-600 p-6 text-white shadow-xl shadow-sky-200/40 dark:shadow-sky-900/40 anim-scale">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">{p.profile.full_name.charAt(0)}</div>
              <div>
                <h2 className="text-xl font-bold">{p.profile.full_name}</h2>
                <p className="text-white/80 text-sm flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {p.profile.email}</p>
              </div>
            </div>
          </div>

          {/* Patient stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger">
            <PatientStat icon={Trophy} value={patientCompleted} label="رحلات مكتملة" />
            <PatientStat icon={TrendingUp} value={patientStars} label="نجوم" />
            <PatientStat icon={ClipboardList} value={p.sessions.length} label="استبيانات" />
            <PatientStat icon={Target} value={`${patientPct}%`} label="التقدّم" />
          </div>

          {/* Questionnaire history */}
          <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-sky-500 dark:text-sky-400" />
              <h3 className="text-lg font-bold text-sky-950 dark:text-sky-50">سجلّ الاستبيانات</h3>
            </div>
            {p.sessions.length === 0 ? (
              <p className="text-sm text-sky-500 dark:text-slate-400">لا توجد استبيانات بعد.</p>
            ) : (
              <div className="space-y-2">
                {p.sessions.map((s) => {
                  const phobia = PHOBIAS.find((ph) => ph.id === s.phobia_type);
                  return (
                    <div key={s.id} className="flex items-center justify-between rounded-xl bg-sky-50 dark:bg-slate-700/40 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{phobia?.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold text-sky-900 dark:text-sky-100">{phobia?.label}</p>
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
            )}
          </div>

          {/* Progress detail */}
          <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-sky-950 dark:text-sky-50 mb-4">تقدّم الرحلات</h3>
            {p.progress.length === 0 ? (
              <p className="text-sm text-sky-500 dark:text-slate-400">لا توجد رحلات بعد.</p>
            ) : (
              <div className="space-y-4">
                {p.progress.map((pr) => {
                  const phobia = PHOBIAS.find((ph) => ph.id === pr.phobia_type);
                  const completed = pr.completed_levels?.length || 0;
                  const pct = Math.round((completed / pr.total_levels) * 100);
                  return (
                    <div key={pr.id} className="rounded-xl bg-sky-50 dark:bg-slate-700/40 border border-sky-100 dark:border-slate-600 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{phobia?.emoji}</span>
                          <span className="font-semibold text-sky-900 dark:text-sky-100">{phobia?.label}</span>
                          {pr.status === 'completed' && <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">مكتملة</span>}
                        </div>
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">{completed}/{pr.total_levels}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-sky-100 dark:bg-slate-600 overflow-hidden mb-2">
                        <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-sky-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> بدأت: {new Date(pr.started_at).toLocaleDateString('ar')}</span>
                        {pr.completed_at && <span className="flex items-center gap-1"><Award className="w-3 h-3" /> اكتملت: {new Date(pr.completed_at).toLocaleDateString('ar')}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] anim-fade">
      <header className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-b border-sky-100 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={40} showText textClassName="text-lg text-sky-950 dark:text-sky-50" />
            <span className="text-xs text-sky-600 dark:text-slate-400 mr-1">لوحة المعالج</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-sky-800 dark:text-slate-300 hidden sm:block">{profile?.full_name}</span>
            <NotificationBell />
            <ThemeToggle />
            <button onClick={signOut} className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-slate-700/60 dark:hover:bg-slate-600/60 text-sky-600 dark:text-slate-300 transition" title="تسجيل الخروج">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Welcome */}
        <div className="rounded-3xl bg-gradient-to-br from-sky-600 to-emerald-600 p-6 text-white shadow-xl shadow-sky-200/40 dark:shadow-sky-900/40 anim-scale">
          <h2 className="text-2xl font-bold mb-1">مرحباً، {profile?.full_name}</h2>
          <p className="text-white/85 text-sm leading-relaxed">تابع تقدّم مرضاك في رحلة العلاج بالتعرّض التدريجي.</p>
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger">
          <OverviewStat icon={Users} value={patients.length} label="مرضى" />
          <OverviewStat icon={Activity} value={stats.totalCompleted} label="رحلات مكتملة" />
          <OverviewStat icon={TrendingUp} value={stats.totalStars} label="نجوم مكتسبة" />
          <OverviewStat icon={ClipboardList} value={stats.totalSessions} label="استبيانات" />
        </div>

        {/* Average progress + phobia distribution */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-sky-100 dark:border-slate-700 p-6 flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold text-sky-950 dark:text-sky-50 mb-4 self-start">متوسط تقدّم المرضى</h3>
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="56" fill="none" strokeWidth="10" className="stroke-sky-100 dark:stroke-slate-700" />
                <circle cx="64" cy="64" r="56" fill="none" strokeWidth="10" stroke="url(#therapist-grad)" strokeLinecap="round" strokeDasharray={2 * Math.PI * 56} strokeDashoffset={2 * Math.PI * 56 * (1 - stats.avgProgress / 100)} className="transition-all duration-1000" />
                <defs>
                  <linearGradient id="therapist-grad" x1="0" y1="0" x2="128" y2="128">
                    <stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-sky-950 dark:text-sky-50 tabular-nums">{stats.avgProgress}%</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-sky-600 dark:text-slate-400 text-center">{stats.totalInProgress} رحلة جارية حالياً</p>
          </div>

          <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-sky-100 dark:border-slate-700 p-6">
            <h3 className="text-sm font-bold text-sky-950 dark:text-sky-50 mb-4">توزيع أنواع المخاوف</h3>
            {stats.phobiaDist.length === 0 ? (
              <p className="text-sm text-sky-500 dark:text-slate-400 py-8 text-center">لا توجد بيانات بعد</p>
            ) : (
              <div className="space-y-3">
                {stats.phobiaDist.map((item) => {
                  const maxCount = Math.max(...stats.phobiaDist.map((d) => d.count));
                  const pct = maxCount > 0 ? Math.round((item.count / maxCount) * 100) : 0;
                  return (
                    <div key={item.phobia.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-sky-900 dark:text-sky-100">{item.phobia.emoji} {item.phobia.label}</span>
                        <span className="text-xs text-sky-500 dark:text-slate-400 tabular-nums">{item.count} رحلة</span>
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

        {/* Patient list */}
        <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <h3 className="text-lg font-bold text-sky-950 dark:text-sky-50">قائمة المرضى</h3>
          </div>
          {loading ? (
            <p className="text-sm text-sky-500 dark:text-slate-400">جارٍ التحميل...</p>
          ) : patients.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-10 h-10 text-sky-200 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sky-600/60 dark:text-slate-400 text-sm">لا يوجد مرضى مسجّلون لديك بعد.</p>
              <p className="text-sky-500/50 dark:text-slate-500 text-xs mt-1">عند تسجيل مرضى واختيارك كمعالج لهم، سيظهرون هنا.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patients.map((p) => {
                const completed = p.progress.filter((pr) => pr.status === 'completed').length;
                const inProgressCount = p.progress.filter((pr) => pr.status === 'in_progress').length;
                const totalStarsP = p.progress.reduce((s, pr) => s + (pr.completed_levels?.length || 0), 0);
                const patientPct = p.progress.length > 0
                  ? Math.round(p.progress.reduce((s, pr) => s + ((pr.completed_levels?.length || 0) / pr.total_levels) * 100, 0) / p.progress.length)
                  : 0;
                const needsAttention = inProgressCount > 0 && totalStarsP < p.progress.reduce((s, pr) => s + pr.total_levels, 0) / 2;
                return (
                  <button key={p.profile.id} onClick={() => setSelectedPatient(p)} className="w-full text-right rounded-xl bg-sky-50 dark:bg-slate-700/40 border border-sky-100 dark:border-slate-600 p-4 hover:bg-sky-100/60 dark:hover:bg-slate-700/60 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-200 to-emerald-200 dark:from-sky-700 dark:to-emerald-700 flex items-center justify-center text-sky-700 dark:text-sky-100 font-bold">{p.profile.full_name.charAt(0)}</div>
                        <div>
                          <p className="font-semibold text-sky-900 dark:text-sky-100 flex items-center gap-2">
                            {p.profile.full_name}
                            {needsAttention && <AlertCircle className="w-4 h-4 text-amber-500" />}
                          </p>
                          <p className="text-xs text-sky-500 dark:text-slate-400">{p.sessions.length} استبيان · {inProgressCount} رحلة جارية</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full">{totalStarsP} نجوم</span>
                        {completed > 0 && <span className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full">{completed} مكتملة</span>}
                      </div>
                    </div>
                    {p.progress.length > 0 && (
                      <div className="h-1.5 rounded-full bg-sky-100 dark:bg-slate-600 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-500" style={{ width: `${patientPct}%` }} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function OverviewStat({ icon: Icon, value, label }: { icon: any; value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 p-4 text-center">
      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-2">
        <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <p className="text-2xl font-bold text-sky-950 dark:text-sky-50 tabular-nums">{value}</p>
      <p className="text-xs text-sky-600 dark:text-slate-400 mt-1">{label}</p>
    </div>
  );
}

function PatientStat({ icon: Icon, value, label }: { icon: any; value: number | string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 p-4 text-center">
      <Icon className="w-6 h-6 text-emerald-500 dark:text-emerald-400 mx-auto mb-2" />
      <p className="text-2xl font-bold text-sky-950 dark:text-sky-50 tabular-nums">{value}</p>
      <p className="text-xs text-sky-600 dark:text-slate-400 mt-1">{label}</p>
    </div>
  );
}
