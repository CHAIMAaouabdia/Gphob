interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-sky-900/70 dark:text-slate-300">التقدّم</span>
        <span className="text-sm font-semibold text-sky-900 dark:text-sky-100 tabular-nums">{current}/{total}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-sky-100 dark:bg-slate-700 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
