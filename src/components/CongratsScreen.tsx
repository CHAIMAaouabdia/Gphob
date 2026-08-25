import { RefreshCw, Sparkles } from 'lucide-react';
import type { Phobia, LikeId } from '@/data/journey';
import { LIKES } from '@/data/journey';
import StarBadge from './StarBadge';
import Logo from './Logo';

interface CongratsScreenProps {
  phobia: Phobia;
  like: LikeId;
  onRestart: () => void;
}

export default function CongratsScreen({ phobia, like, onRestart }: CongratsScreenProps) {
  const likeLabel = LIKES.find((l) => l.id === like)?.label ?? '';

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
          اعبرت المستويات العشرة في رحلة «{phobia.label}».
        </p>

        <div className="my-8 anim-scale">
          <StarBadge level={9} total={10} />
        </div>

        <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-sky-100 dark:border-slate-700 p-5 text-right anim-fade-up">
          <p className="text-xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">ملخّص الرحلة</p>
          <ul className="space-y-2 text-sm text-sky-900/90 dark:text-slate-200">
            <li><span className="font-semibold">الخوف المُعالَج:</span> {phobia.emoji} {phobia.label}</li>
            <li><span className="font-semibold">الرفيق:</span> {likeLabel}</li>
            <li><span className="font-semibold">المستويات المكتملة:</span> 10 / 10</li>
          </ul>
        </div>

        <p className="mt-6 text-sm text-sky-700/70 dark:text-slate-400 leading-relaxed anim-fade-up">
          كل انتصار صغير يُحسَب. عُد متى شئت لإعادة الرحلة بإيقاعك الخاص.
        </p>

        <button onClick={onRestart} className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all duration-200 px-7 py-3.5 text-white text-base font-semibold shadow-lg shadow-emerald-200/60 dark:shadow-emerald-900/40">
          <RefreshCw className="w-5 h-5" />
          ابدأ رحلة جديدة
        </button>
      </div>
    </div>
  );
}
