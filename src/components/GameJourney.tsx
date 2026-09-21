import { useEffect, useState } from 'react';
import { Check, ChevronLeft, Heart } from 'lucide-react';
import type { Level, LikeId, PhobiaId } from '@/data/journey';
import { LIKES, getOrCreatePhobia, getPhobia, type Phobia } from '@/data/journey';
import { supabase, type GameProgressRow } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProgressBar from './ProgressBar';
import StarBadge from './StarBadge';
import CongratsScreen from './CongratsScreen';
import Header from './Header';
import type { QuestionnaireConfig } from '@/data/gameConfig';

interface GameJourneyProps {
  sessionId: string | null;
  phobiaType: string;
  likeType: string;
  config: QuestionnaireConfig;
  customPhobiaLabel?: string;
  onBack: () => void;
}

const LIKE_EMOJI: Record<LikeId, string> = Object.fromEntries(LIKES.map((l) => [l.id, l.emoji])) as Record<LikeId, string>;
const LIKE_LABEL: Record<LikeId, string> = Object.fromEntries(LIKES.map((l) => [l.id, l.label])) as Record<LikeId, string>;

export default function GameJourney({ sessionId, phobiaType, likeType, config, customPhobiaLabel, onBack }: GameJourneyProps) {
  const { profile } = useAuth();
  const phobia: Phobia = getOrCreatePhobia(phobiaType as PhobiaId, customPhobiaLabel, likeType as LikeId, { intensity: config.intensity, calmingStrategy: config.calmingStrategy, symptom: config.symptom });
  const total = phobia.levels.length;
  const [progressRow, setProgressRow] = useState<GameProgressRow | null>(null);
  const [levelIndex, setLevelIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-[100dvh] flex flex-col anim-fade">
      <Header
        sectionLabel={`رحلة الخيال · المستوى ${levelIndex + 1}/${total}`}
        leftContent={
          <button onClick={onBack} className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-800 transition">
            ← رجوع
          </button>
        }
      />
      <div className="max-w-md mx-auto w-full flex flex-col gap-5 px-6 py-8">
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

// Re-export for TherapistDashboard compatibility
export { getPhobia };
