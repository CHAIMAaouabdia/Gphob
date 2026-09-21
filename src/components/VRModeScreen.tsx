import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Glasses, Play, Wifi, WifiOff, CheckCircle2, Heart, Check, Sparkles, Volume2 } from 'lucide-react';
import Header from './Header';
import { getOrCreatePhobia, type PhobiaId, type LikeId, LIKES, type Level } from '@/data/journey';
import type { QuestionnaireConfig } from '@/data/gameConfig';
import VRHeightsScene from './VRHeightsScene';

interface VRModeScreenProps {
  phobiaType: string;
  likeType: string;
  config: QuestionnaireConfig;
  customPhobiaLabel?: string;
  onBack: () => void;
}

type VRPhase = 'connect' | 'playing' | 'done';

export default function VRModeScreen({ phobiaType, likeType, config, customPhobiaLabel, onBack }: VRModeScreenProps) {
  const phobia = useMemo(
    () => getOrCreatePhobia(phobiaType as PhobiaId, customPhobiaLabel, likeType as LikeId, { intensity: config.intensity, calmingStrategy: config.calmingStrategy, symptom: config.symptom }),
    [phobiaType, customPhobiaLabel, likeType, config],
  );
  const like = LIKES.find((l) => l.id === likeType);

  const [phase, setPhase] = useState<VRPhase>('connect');
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [levelIndex, setLevelIndex] = useState(0);
  const [levelDone, setLevelDone] = useState(false);
  const [breathingActive, setBreathingActive] = useState(false);

  const total = phobia.levels.length;
  const level: Level = phobia.levels[levelIndex];
  const isLast = levelIndex === total - 1;
  const likeEmoji = like?.emoji ?? '🐱';
  const likeLabel = like?.label ?? 'رفيقك';

  function handleConnect() {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 2000);
  }

  function handleStart() {
    setPhase('playing');
  }

  function handleLevelComplete() {
    setLevelDone(true);
  }

  function handleNextLevel() {
    if (isLast) {
      setPhase('done');
      return;
    }
    setLevelIndex((i) => i + 1);
    setLevelDone(false);
    setBreathingActive(false);
  }

  // --- Connect phase ---
  if (phase === 'connect') {
    return (
      <div className="min-h-[100dvh] flex flex-col anim-fade">
        <Header
          sectionLabel="الواقع الافتراضي"
          leftContent={
            <button onClick={onBack} className="flex items-center gap-1 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-800 transition">
              <ChevronRight className="w-4 h-4" />
              رجوع
            </button>
          }
        />
        <div className="max-w-lg mx-auto w-full flex flex-col gap-6 px-6 py-8">
          <div className="text-center anim-fade-up">
            <div className="anim-float inline-flex mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-emerald-500 dark:from-sky-600 dark:to-emerald-600 flex items-center justify-center shadow-lg shadow-sky-200/50 dark:shadow-sky-900/40">
                <Glasses className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-sky-950 dark:text-sky-50">تجربة الواقع الافتراضي</h1>
            <p className="mt-2 text-sm text-sky-700/70 dark:text-slate-400 leading-relaxed">
              ارتدِ نظارات VR واعبر مستويات التعرّض في بيئة غامرة. سيناريو مخصّص لمعالجة «{phobia.label}» {phobia.emoji} مع رفيقك {likeEmoji} {likeLabel}.
            </p>
          </div>

          {/* Scenario summary */}
          <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-sky-100 dark:border-slate-700 p-5 anim-fade-up">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-sky-50 dark:bg-slate-700/40 p-3">
                <p className="text-xs text-sky-500 dark:text-slate-400 mb-1">نوع الخوف</p>
                <p className="font-semibold text-sky-900 dark:text-sky-100">{phobia.emoji} {phobia.label}</p>
              </div>
              <div className="rounded-xl bg-sky-50 dark:bg-slate-700/40 p-3">
                <p className="text-xs text-sky-500 dark:text-slate-400 mb-1">الرفيق</p>
                <p className="font-semibold text-sky-900 dark:text-sky-100">{likeEmoji} {likeLabel}</p>
              </div>
              <div className="rounded-xl bg-sky-50 dark:bg-slate-700/40 p-3">
                <p className="text-xs text-sky-500 dark:text-slate-400 mb-1">المستويات</p>
                <p className="font-semibold text-sky-900 dark:text-sky-100">10 مستويات تدريجية</p>
              </div>
              <div className="rounded-xl bg-sky-50 dark:bg-slate-700/40 p-3">
                <p className="text-xs text-sky-500 dark:text-slate-400 mb-1">المدة المقدّرة</p>
                <p className="font-semibold text-sky-900 dark:text-sky-100">~25 دقيقة</p>
              </div>
            </div>
          </div>

          {/* Connection */}
          <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-sky-100 dark:border-slate-700 p-5 anim-fade-up">
            <div className="flex items-center gap-2 mb-4">
              {connected ? <Wifi className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> : <WifiOff className="w-5 h-5 text-sky-400 dark:text-slate-500" />}
              <h2 className="text-base font-bold text-sky-950 dark:text-sky-50">ربط النظارات</h2>
            </div>
            {!connected ? (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-white text-base font-semibold transition-all duration-200 active:scale-95 disabled:opacity-60 bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-200/50 dark:shadow-sky-900/40"
              >
                {connecting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جارٍ البحث عن النظارات...
                  </>
                ) : (
                  <><Wifi className="w-5 h-5" />ربط نظارات VR</>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">تم الاتصال بنجاح</p>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">النظارات جاهزة لتشغيل السيناريو</p>
                </div>
              </div>
            )}
            {connected && (
              <button
                onClick={handleStart}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-white text-base font-semibold transition-all duration-200 active:scale-95 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 shadow-lg shadow-emerald-200/50"
              >
                <Play className="w-5 h-5" />
                ابدأ تجربة الواقع الافتراضي
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Done phase ---
  if (phase === 'done') {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-10 text-center anim-fade">
        <div className="max-w-md w-full">
          <div className="anim-float mb-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-300 to-emerald-300 dark:from-amber-600 dark:to-emerald-700 flex items-center justify-center shadow-lg shadow-amber-100/60 dark:shadow-emerald-900/40">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-sky-950 dark:text-sky-50 tracking-tight anim-fade-up">أحسنت!</h1>
          <p className="mt-3 text-lg text-sky-800/80 dark:text-slate-300 leading-relaxed anim-fade-up">
            اعبرت المستويات العشرة في تجربة الواقع الافتراضي لـ«{phobia.label}».
          </p>
          <div className="my-8 anim-scale">
            <div className="flex justify-center gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} className="text-3xl">⭐</span>
              ))}
            </div>
          </div>
          <button onClick={onBack} className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all duration-200 px-7 py-3.5 text-white text-base font-semibold shadow-lg shadow-emerald-200/60 dark:shadow-emerald-900/40">
            <Heart className="w-5 h-5" />
            العودة للوحة المريض
          </button>
        </div>
      </div>
    );
  }

  // --- Playing phase ---
  const progressPct = Math.round(((levelIndex + 1) / total) * 100);

  return (
    <div className="min-h-[100dvh] flex flex-col anim-fade">
      <Header
        sectionLabel={`VR · المستوى ${levelIndex + 1}/${total}`}
        leftContent={
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-800 transition">
            <ChevronRight className="w-4 h-4" />
            رجوع
          </button>
        }
      />
      <div className="max-w-lg mx-auto w-full flex flex-col gap-5 px-6 py-8">
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-sky-900/70 dark:text-slate-300">المستوى {levelIndex + 1} من {total}</span>
            <span className="text-sm font-semibold text-sky-900 dark:text-sky-100 tabular-nums">{progressPct}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-sky-100 dark:bg-slate-700 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-700 ease-out" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* VR immersive animated scene */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-sky-200/40 dark:shadow-slate-900/50 anim-scale bg-sky-900" style={{ aspectRatio: '16/10' }}>
          {phobiaType === 'heights' ? (
            <VRHeightsScene
              levelIndex={levelIndex}
              totalLevels={total}
              likeEmoji={likeEmoji}
              breathingActive={breathingActive}
            />
          ) : (
            <img src={level.image} alt={level.alt} className="w-full h-full object-cover" loading="eager" />
          )}
          {/* VR overlay border */}
          <div className="absolute inset-0 border-4 border-white/10 rounded-3xl pointer-events-none" />
          {/* VR badge */}
          <div className="absolute top-3 right-3 bg-sky-950/70 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 z-10">
            <Glasses className="w-4 h-4 text-white" />
            <span className="text-xs font-semibold text-white">VR</span>
          </div>
          {/* Companion badge */}
          <div className="absolute top-3 left-3 bg-white/85 dark:bg-slate-800/85 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-semibold text-sky-900 dark:text-sky-100 shadow-sm flex items-center gap-1.5 z-10">
            <span className="text-base">{likeEmoji}</span>
            {likeLabel} بجانبك
          </div>
          {/* Level indicator on scene */}
          <div className="absolute bottom-3 left-3 bg-sky-950/70 backdrop-blur-sm rounded-lg px-3 py-1.5 z-10">
            <span className="text-xs font-semibold text-white">المشهد {levelIndex + 1} — {phobiaType === 'heights' ? 'ارتفاع تدريجي' : 'تعرّض تدريجي'}</span>
          </div>
        </div>

        {/* Level title */}
        <h2 className="text-xl font-bold text-sky-950 dark:text-sky-50 leading-snug anim-fade-up">{level.title}</h2>

        {/* Scene description */}
        <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-sky-100 dark:border-slate-700 p-5 anim-fade-up">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            <span className="text-xs font-bold tracking-wider text-sky-600 dark:text-sky-400">المشهد</span>
          </div>
          <p className="text-sky-900/90 dark:text-slate-200 leading-loose text-[15px]">{level.scene}</p>
        </div>

        {/* Mission */}
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-5 anim-fade-up">
          <p className="text-xs font-bold tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5">مهمّتك</p>
          <p className="text-emerald-900/90 dark:text-emerald-200/90 leading-loose text-[15px]">{level.mission}</p>
          <button
            onClick={() => setBreathingActive((v) => !v)}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
            {breathingActive ? 'إيقاف تمرين التنفّس' : 'ابدأ تمرين التنفّس'}
          </button>
        </div>

        {/* Actions */}
        {!levelDone ? (
          <button onClick={handleLevelComplete} className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-emerald-700 dark:text-emerald-300 text-base font-semibold transition-all duration-200 active:scale-95 bg-white dark:bg-slate-800 border-2 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
            <Check className="w-5 h-5" />
            أنهيت هذا المستوى
          </button>
        ) : (
          <div className="rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-emerald-200 dark:border-emerald-800 p-5 text-center anim-scale">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed">{level.encouragement}</p>
          </div>
        )}

        <button
          onClick={handleNextLevel}
          disabled={!levelDone}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-white text-base font-semibold transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-500 hover:bg-emerald-600 enabled:shadow-lg enabled:shadow-emerald-200/60 dark:enabled:shadow-emerald-900/40"
        >
          {isLast ? (<><Heart className="w-5 h-5" />إنهاء التجربة</>) : (<>المستوى التالي<ChevronLeft className="w-5 h-5" /></>)}
        </button>
      </div>
    </div>
  );
}
