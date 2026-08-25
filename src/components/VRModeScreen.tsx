import { useState } from 'react';
import { ChevronRight, Glasses, Play, Wifi, WifiOff, CheckCircle2, Info, Monitor } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import type { PhobiaId, LikeId } from '@/data/journey';
import { getPhobia, LIKES } from '@/data/journey';

interface VRModeScreenProps {
  phobiaType: string;
  likeType: string;
  onBack: () => void;
}

export default function VRModeScreen({ phobiaType, likeType, onBack }: VRModeScreenProps) {
  const phobia = getPhobia(phobiaType as PhobiaId);
  const like = LIKES.find((l) => l.id === likeType);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [videoLaunched, setVideoLaunched] = useState(false);

  function handleConnect() {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 2000);
  }

  function handleLaunch() {
    setVideoLaunched(true);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col px-6 py-8 anim-fade">
      <div className="max-w-lg mx-auto w-full flex flex-col gap-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-800 transition">
            <ChevronRight className="w-4 h-4" />
            رجوع
          </button>
          <div className="flex items-center gap-3">
            <Logo size={36} showText textClassName="text-base text-sky-950 dark:text-sky-50" />
            <ThemeToggle />
          </div>
        </div>

        {/* Header */}
        <div className="text-center anim-fade-up">
          <div className="anim-float inline-flex mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 dark:from-sky-600 dark:to-indigo-700 flex items-center justify-center shadow-lg shadow-sky-200/50 dark:shadow-sky-900/40">
              <Glasses className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-sky-950 dark:text-sky-50">وضع الواقع الافتراضي</h1>
          <p className="mt-2 text-sm text-sky-700/70 dark:text-slate-400 leading-relaxed">
            ارتدِ نظارات الواقع الافتراضي واعبر مستويات التعرّض في بيئة غامرة ثلاثية الأبعاد.
            سيناريو مخصّص لمعالجة «{phobia.label}» {phobia.emoji} مع رفيقك {like?.emoji} {like?.label}.
          </p>
        </div>

        {/* Scenario card */}
        <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-sky-100 dark:border-slate-700 p-5 anim-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <Monitor className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-sky-950 dark:text-sky-50">السيناريو المخصّص</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-sky-50 dark:bg-slate-700/40 p-3">
              <p className="text-xs text-sky-500 dark:text-slate-400 mb-1">نوع الخوف</p>
              <p className="font-semibold text-sky-900 dark:text-sky-100">{phobia.emoji} {phobia.label}</p>
            </div>
            <div className="rounded-xl bg-sky-50 dark:bg-slate-700/40 p-3">
              <p className="text-xs text-sky-500 dark:text-slate-400 mb-1">الرفيق</p>
              <p className="font-semibold text-sky-900 dark:text-sky-100">{like?.emoji} {like?.label}</p>
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

        {/* Connection card */}
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
                <>
                  <Wifi className="w-5 h-5" />
                  ربط نظارات VR
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">تم الاتصال بنجاح</p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">النظارات جاهزة لتشغيل السيناريو</p>
              </div>
            </div>
          )}
        </div>

        {/* Video launch card */}
        <div className={`rounded-2xl border p-5 anim-fade-up transition-all duration-300 ${
          videoLaunched
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
            : 'bg-white/70 dark:bg-slate-800/70 border-sky-100 dark:border-slate-700'
        }`}>
          {!videoLaunched ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Play className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                <h2 className="text-base font-bold text-sky-950 dark:text-sky-50">تشغيل السيناريو</h2>
              </div>
              <button
                onClick={handleLaunch}
                disabled={!connected}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-white text-base font-semibold transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 enabled:shadow-lg enabled:shadow-emerald-200/50"
              >
                <Play className="w-5 h-5" />
                ابدأ تجربة الواقع الافتراضي
              </button>
              {!connected && (
                <p className="mt-3 text-xs text-sky-500 dark:text-slate-400 text-center">يرجى ربط النظارات أولاً</p>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <div className="anim-float inline-flex mb-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <Play className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <p className="text-base font-bold text-emerald-800 dark:text-emerald-300">تم إطلاق السيناريو</p>
              <p className="mt-1 text-sm text-emerald-700/70 dark:text-emerald-400/70">ارتدِ النظارات وابدأ رحلتك الغامرة</p>
            </div>
          )}
        </div>

        {/* Info banner */}
        <div className="rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 px-4 py-3 flex gap-3 anim-fade-up">
          <Info className="w-5 h-5 text-sky-500 dark:text-sky-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-sky-700/70 dark:text-slate-400 leading-relaxed">
            هذه واجهة تمهيدية لتجربة الواقع الافتراضي. سيتم دعم تشغيل المشاهد ثلاثية الأبعاد
            بكامل تفاصيلها في إصدارات قادمة. حالياً، يمكنك المتابعة عبر اللعب التفاعلي.
          </p>
        </div>
      </div>
    </div>
  );
}
