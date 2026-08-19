import { useEffect, useState } from 'react';
import { Check, ChevronLeft, Heart, LogOut, Gamepad2, BookOpen } from 'lucide-react';
import type { Level, LikeId } from '@/data/journey';
import { LIKES, getPhobia, type PhobiaId } from '@/data/journey';
import { supabase, type GameProgressRow } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProgressBar from './ProgressBar';
import StarBadge from './StarBadge';
import CongratsScreen from './CongratsScreen';
import ThemeToggle from './ThemeToggle';
import PlatformerGame from './PlatformerGame';

interface GameJourneyProps {
  sessionId: string | null;
  phobiaType: string;
  likeType: string;
  onBack: () => void;
}

const LIKE_EMOJI: Record<LikeId, string> = Object.fromEntries(LIKES.map((l) => [l.id, l.emoji])) as Record<LikeId, string>;
const LIKE_LABEL: Record<LikeId, string> = Object.fromEntries(LIKES.map((l) => [l.id, l.label])) as Record<LikeId, string>;

type Mode = 'story' | 'platformer' | null;

export default function GameJourney({ sessionId, phobiaType, likeType, onBack }: GameJourneyProps) {
  const { profile, signOut } = useAuth();
  const phobia = getPhobia(phobiaType as PhobiaId);
  const total = phobia.levels.length;
  const [progressRow, setProgressRow] = useState<GameProgressRow | null>(null);
  const [levelIndex, setLevelIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>(null);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      if (sessionId) {
        const { data: existing } = await supabase.from('game_progress').select('*').eq('patient_id', profile.id).eq('session_id', sessionId).maybeSingle();
        if (existing) { const row = existing as GameProgressRow; setProgressRow(row); setLevelIndex(row.current_level); setLoading(false); return; }
      }
      const { data: newRow } = await supabase.from('game_progress').insert({ patient_id: profile.id, session_id: sessionId, phobia_type: phobiaType, like_type: likeType, current_level: 0, total_levels: total, completed_levels: [], status: 'in_progress' }).select().maybeSingle();
      if (newRow) setProgressRow(newRow as GameProgressRow);
      setLoading(false);
    })();
  }, [profile, sessionId, phobiaType, likeType, total]);

  async function updateProgress(level: number, completedLevels: number[], status: 'in_progress' | 'completed') {
    if (!progressRow || !profile) return;
    await supabase.from('game_progress').update({ current_level: level, completed_levels: completedLevels, status, completed_at: status === 'completed' ? new Date().toISOString() : null }).eq('id', progressRow.id);
  }

  async function handleComplete() {
    setDone(true);
    const completed = [...(progressRow?.completed_levels || []), levelIndex];
    const updatedRow = { ...progressRow, completed_levels: completed, current_level: levelIndex } as GameProgressRow;
    setProgressRow(updatedRow);
    await updateProgress(levelIndex, completed, 'in_progress');
  }

  async function handleNext() {
    const isLast = levelIndex === total - 1;
    if (isLast) {
      await updateProgress(levelIndex, [...(progressRow?.completed_levels || []), levelIndex], 'completed');
      setShowCongrats(true);
    } else {
      const next = levelIndex + 1;
      setLevelIndex(next);
      setDone(false);
      setMode(null);
      await updateProgress(next, progressRow?.completed_levels || [], 'in_progress');
    }
  }

  if (loading) {
    return <div className="min-h-[100dvh] flex items-center justify-center"><p className="text-sky-600 dark:text-sky-400">جارٍ التحميل...</p></div>;
  }

  if (showCongrats && profile) {
    return <CongratsScreen phobia={phobia} like={likeType as LikeId} onRestart={onBack} />;
  }

  const level: Level = phobia.levels[levelIndex];
  const isLast = levelIndex === total - 1;
  const completedCount = (progressRow?.completed_levels || []).length;

  // Mode selection screen — shown at the start of each level
  if (mode === null) {
    return (
      <div className="min-h-[100dvh] flex flex-col px-6 py-8 anim-fade">
        <div className="max-w-md mx-auto w-full flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-800 transition">← رجوع</button>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button onClick={signOut} className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-slate-700/60 dark:hover:bg-slate-600/60 text-sky-600 dark:text-slate-300 transition" title="خروج"><LogOut className="w-4 h-4" /></button>
            </div>
          </div>

          <ProgressBar current={levelIndex + 1} total={total} />

          <h2 className="text-xl font-bold text-sky-950 dark:text-sky-50 leading-snug anim-fade-up">{level.title}</h2>

          <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-sky-100 dark:border-slate-700 p-5 anim-fade-up">
            <p className="text-sky-900/90 dark:text-slate-200 leading-loose text-[15px]">{level.scene}</p>
          </div>

          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-5 anim-fade-up">
            <p className="text-xs font-bold tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5">مهمّتك</p>
            <p className="text-emerald-900/90 dark:text-emerald-200/90 leading-loose text-[15px]">{level.mission}</p>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm font-semibold text-sky-800 dark:text-slate-300 mb-4">اختر طريقة اجتياز المستوى</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Platformer mode */}
            <button
              onClick={() => setMode('platformer')}
              className="group flex items-center gap-4 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 dark:from-sky-600 dark:to-emerald-600 p-5 text-white text-right shadow-lg shadow-sky-200/40 dark:shadow-sky-900/30 hover:scale-[1.02] active:scale-95 transition-all anim-fade-up"
            >
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Gamepad2 className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-0.5">لعبة تفاعلية</h3>
                <p className="text-sm text-white/85 leading-relaxed">اقفز، اجمع النجوم، واصل إلى الهدف في لعبة ممتعة بأسلوب المنصّات</p>
              </div>
              <ChevronLeft className="w-6 h-6 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Story mode (classic) */}
            <button
              onClick={() => setMode('story')}
              className="group flex items-center gap-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-sky-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-700 p-5 text-right shadow-sm hover:shadow-md transition-all anim-fade-up"
            >
              <div className="w-14 h-14 rounded-xl bg-sky-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-7 h-7 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-sky-950 dark:text-sky-50 mb-0.5">مشهد هادئ</h3>
                <p className="text-sm text-sky-700/70 dark:text-slate-400 leading-relaxed">اقرأ المشهد، تأمّل الصورة، وأنهِ المستوى بطمأنينة</p>
              </div>
              <ChevronLeft className="w-6 h-6 flex-shrink-0 text-sky-400 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>

          {completedCount > 0 && (
            <div className="rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-emerald-200 dark:border-emerald-800 p-4 text-center">
              <StarBadge level={completedCount - 1} total={total} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Platformer mode
  if (mode === 'platformer') {
    return (
      <PlatformerGame
        phobia={phobia}
        likeType={likeType as LikeId}
        level={level}
        levelIndex={levelIndex}
        totalLevels={total}
        onWin={async () => {
          if (!done) await handleComplete();
          await handleNext();
        }}
        onBack={() => setMode(null)}
      />
    );
  }

  // Story mode (classic)
  return (
    <div className="min-h-[100dvh] flex flex-col px-6 py-8 anim-fade">
      <div className="max-w-md mx-auto w-full flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <button onClick={() => setMode(null)} className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-800 transition">← تغيير الوضع</button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={signOut} className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-slate-700/60 dark:hover:bg-slate-600/60 text-sky-600 dark:text-slate-300 transition" title="خروج"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>

        <ProgressBar current={levelIndex + 1} total={total} />

        <h2 className="text-xl font-bold text-sky-950 dark:text-sky-50 leading-snug anim-fade-up">{level.title}</h2>

        <div className="relative rounded-3xl overflow-hidden shadow-md shadow-sky-100 dark:shadow-slate-900/50 anim-scale">
          <img src={level.image} alt={level.alt} className="w-full h-56 object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-sky-950/30 to-transparent pointer-events-none" />
          <div className="absolute top-3 left-3 bg-white/85 dark:bg-slate-800/85 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-semibold text-sky-900 dark:text-sky-100 shadow-sm">
            {LIKE_EMOJI[likeType as LikeId]} {LIKE_LABEL[likeType as LikeId]} بجانبك
          </div>
        </div>

        <div key={`scene-${levelIndex}`} className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-sky-100 dark:border-slate-700 p-5 anim-fade-up">
          <p className="text-sky-900/90 dark:text-slate-200 leading-loose text-[15px]">{level.scene}</p>
        </div>

        <div key={`mission-${levelIndex}`} className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-5 anim-fade-up">
          <p className="text-xs font-bold tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5">مهمّتك</p>
          <p className="text-emerald-900/90 dark:text-emerald-200/90 leading-loose text-[15px]">{level.mission}</p>
        </div>

        {!done ? (
          <button onClick={handleComplete} className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-emerald-700 dark:text-emerald-300 text-base font-semibold transition-all duration-200 active:scale-95 bg-white dark:bg-slate-800 border-2 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
            <Check className="w-5 h-5" />
            أنهيت هذا المستوى
          </button>
        ) : (
          <div className="rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-emerald-200 dark:border-emerald-800 p-5 text-center anim-scale">
            <StarBadge level={completedCount - 1} total={total} />
            <p className="mt-3 text-sm text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed">{level.encouragement}</p>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!done}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-white text-base font-semibold transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-500 hover:bg-emerald-600 enabled:shadow-lg enabled:shadow-emerald-200/60 dark:enabled:shadow-emerald-900/40"
        >
          {isLast ? (<><Heart className="w-5 h-5" />إنهاء الرحلة</>) : (<>المستوى التالي<ChevronLeft className="w-5 h-5" /></>)}
        </button>
      </div>
    </div>
  );
}
