import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNotifications } from '@/lib/notifications';

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const iconFor = (type: string) => {
    if (type === 'success') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (type === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <Info className="w-4 h-4 text-sky-500" />;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen((o) => !o); if (!open && unreadCount > 0) markAllRead(); }}
        className="relative p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-slate-700/60 dark:hover:bg-slate-600/60 text-sky-600 dark:text-slate-300 transition-all duration-300 active:scale-90"
        title="الإشعارات"
        aria-label="notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center anim-scale">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-slate-800 border border-sky-100 dark:border-slate-700 shadow-xl shadow-sky-100/50 dark:shadow-black/40 anim-scale z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-sky-100 dark:border-slate-700 flex items-center justify-between">
            <span className="text-sm font-bold text-sky-950 dark:text-sky-50">الإشعارات</span>
            {notifications.length === 0 ? (
              <span className="text-xs text-sky-400 dark:text-slate-500">لا إشعارات</span>
            ) : (
              <button onClick={markAllRead} className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline">
                <Check className="w-3 h-3" /> تعليم الكل كمقروء
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto scene-scroll">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-sky-200 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-sky-500 dark:text-slate-400">لا توجد إشعارات حالياً</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`px-4 py-3 border-b border-sky-50 dark:border-slate-700/50 flex gap-3 ${n.read ? 'opacity-60' : ''}`}>
                  <div className="flex-shrink-0 mt-0.5">{iconFor(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-sky-950 dark:text-sky-100">{n.title}</p>
                    <p className="text-xs text-sky-700/70 dark:text-slate-400 mt-0.5 leading-relaxed">{n.body}</p>
                    <p className="text-[10px] text-sky-400 dark:text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString('ar')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
