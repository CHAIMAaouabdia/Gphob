import { useState, useMemo } from 'react';
import { ChevronRight, Glasses, Play, Wifi, WifiOff, CheckCircle2, Heart, Sparkles } from 'lucide-react';
import Header from './Header';
import { getOrCreatePhobia, type PhobiaId, type LikeId, LIKES } from '@/data/journey';
import type { QuestionnaireConfig } from '@/data/gameConfig';
import VR3DScene from './VR3DScene';

interface VRModeScreenProps {
  phobiaType: string;
  likeType: string;
  config: QuestionnaireConfig;
  customPhobiaLabel?: string;
  onBack: () => void;
}

type Phase = 'connect' | 'scene' | 'done';

export default function VRModeScreen({ phobiaType, likeType, config, customPhobiaLabel, onBack }: VRModeScreenProps) {
  const phobia = useMemo(
    () => getOrCreatePhobia(phobiaType as PhobiaId, customPhobiaLabel, likeType as LikeId, { intensity: config.intensity, calmingStrategy: config.calmingStrategy, symptom: config.symptom }),
    [phobiaType, customPhobiaLabel, likeType, config],
  );
  const like = LIKES.find((l) => l.id === likeType);

  const [phase, setPhase] = useState<Phase>('connect');
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [levelIndex, setLevelIndex] = useState(0);
  const [missionsCompleted, setMissionsCompleted] = useState(0);

  const totalVRLevels = 5;
  const likeEmoji = like?.emoji ?? '🐱';
  const likeLabel = like?.label ?? 'رفيقك';

  function handleConnect() {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 1800);
  }

  function handleStart() {
    setPhase('scene');
  }

  function handleMissionComplete() {
    setMissionsCompleted((m) => m + 1);
  }

  function handleNextLevel() {
    if (levelIndex >= totalVRLevels - 1) {
      setPhase('done');
      return;
    }
    setLevelIndex((i) => i + 1);
  }

  function handleExit() {
    onBack();
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
            اعبرت جميع المستويات الخمسة في تجربة الواقع الافتراضي لـ«{phobia.label}».
          </p>
          <div className="my-8 anim-scale">
            <div className="flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
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

  // --- 3D Scene phase ---
  if (phase === 'scene') {
    return (
      <VR3DScene
        phobiaType={phobiaType}
        levelIndex={levelIndex}
        totalLevels={totalVRLevels}
        onMissionComplete={handleMissionComplete}
        onNextLevel={handleNextLevel}
        onBack={handleExit}
      />
    );
  }

  // --- Connect phase ---
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
          <h1 className="text-2xl font-bold text-sky-950 dark:text-sky-50">تجربة الواقع الافتراضي 3D</h1>
          <p className="mt-2 text-sm text-sky-700/70 dark:text-slate-400 leading-relaxed">
            سيناريو ثلاثي الأبعاد مخصّص لمعالجة «{phobia.label}» {phobia.emoji} مع رفيقك {likeEmoji} {likeLabel}. 5 مستويات تفاعلية.
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-3 text-sm anim-fade-up">
          <div className="rounded-xl bg-white/70 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 p-4">
            <p className="text-xs text-sky-500 dark:text-slate-400 mb-1">نوع الخوف</p>
            <p className="font-semibold text-sky-900 dark:text-sky-100">{phobia.emoji} {phobia.label}</p>
          </div>
          <div className="rounded-xl bg-white/70 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 p-4">
            <p className="text-xs text-sky-500 dark:text-slate-400 mb-1">المستويات</p>
            <p className="font-semibold text-sky-900 dark:text-sky-100">5 مستويات 3D</p>
          </div>
          <div className="rounded-xl bg-white/70 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 p-4">
            <p className="text-xs text-sky-500 dark:text-slate-400 mb-1">التحكّم</p>
            <p className="font-semibold text-sky-900 dark:text-sky-100">WASD + Souris / VR</p>
          </div>
          <div className="rounded-xl bg-white/70 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 p-4">
            <p className="text-xs text-sky-500 dark:text-slate-400 mb-1">التقنية</p>
            <p className="font-semibold text-sky-900 dark:text-sky-100">Three.js + WebXR</p>
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
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">النظارات جاهزة — يمكنك أيضًا اللعب في وضع المحاكاة</p>
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

        <p className="text-xs text-center text-sky-500 dark:text-slate-400 leading-relaxed">
          يمكنك اللعب مباشرة على الكمبيوتر في وضع المحاكاة، أو دخول وضع VR إذا كان لديك نظارات متوافقة.
        </p>
      </div>
    </div>
  );
}
