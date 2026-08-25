import { LogOut, Bell, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import { useAuth } from '@/lib/auth';

interface HeaderProps {
  /** Label shown next to the logo, e.g. "لوحة المريض" */
  sectionLabel?: string;
  /** Show notification bell (default true) */
  showNotifications?: boolean;
  /** Show sign-out button (default true) */
  showSignOut?: boolean;
  /** Back button rendered on the left side */
  leftContent?: React.ReactNode;
}

export default function Header({ sectionLabel, showNotifications = true, showSignOut = true, leftContent }: HeaderProps) {
  const { profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border-b border-sky-100 dark:border-slate-700 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: back button or section label */}
        <div className="flex items-center gap-3 min-w-0">
          {leftContent}
          <div className="flex items-center gap-2.5 min-w-0">
            <Logo size={36} showText textClassName="text-base text-sky-950 dark:text-sky-50 hidden sm:inline" />
            {sectionLabel && (
              <span className="text-xs font-medium text-sky-600 dark:text-slate-400 truncate hidden md:inline">
                {sectionLabel}
              </span>
            )}
          </div>
        </div>

        {/* Right: profile + actions */}
        <div className="flex items-center gap-2">
          {profile && (
            <div className="hidden sm:flex items-center gap-2.5 pl-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {profile.full_name.charAt(0)}
              </div>
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold text-sky-950 dark:text-sky-50 truncate max-w-[120px]">{profile.full_name}</p>
                <p className="text-[10px] text-sky-500 dark:text-slate-400">
                  {profile.role === 'therapist' ? 'معالج' : 'مريض'}
                </p>
              </div>
            </div>
          )}

          {showNotifications && <NotificationBell />}
          <ThemeToggle />

          {showSignOut && (
            <button
              onClick={signOut}
              className="hidden sm:inline-flex p-2 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-slate-700/60 dark:hover:bg-slate-600/60 text-sky-600 dark:text-slate-300 transition"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}

          {/* Mobile menu */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="sm:hidden p-2 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-slate-700/60 dark:hover:bg-slate-600/60 text-sky-600 dark:text-slate-300 transition"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-sky-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 space-y-3 anim-fade">
          {profile && (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center text-white text-sm font-bold">
                {profile.full_name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-sky-950 dark:text-sky-50">{profile.full_name}</p>
                <p className="text-[10px] text-sky-500 dark:text-slate-400">
                  {profile.role === 'therapist' ? 'معالج' : 'مريض'}
                </p>
              </div>
            </div>
          )}
          {showSignOut && (
            <button
              onClick={() => { signOut(); setMenuOpen(false); }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-50 dark:bg-slate-700/60 text-sky-700 dark:text-slate-300 text-sm font-semibold py-2.5 transition"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
          )}
        </div>
      )}
    </header>
  );
}
