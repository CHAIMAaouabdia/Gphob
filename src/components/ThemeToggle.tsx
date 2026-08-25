import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-slate-700/60 dark:hover:bg-slate-600/60 text-sky-600 dark:text-amber-400 transition-all duration-300 active:scale-90"
      title={theme === 'light' ? 'الوضع الليلي' : 'الوضع النهاري'}
      aria-label="toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
}
