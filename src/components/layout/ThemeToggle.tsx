import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`group relative inline-flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer border ${
        isDark
          ? 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border-white/10'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300/80 shadow-xs'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-300 transition-transform duration-300 group-hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 group-hover:-rotate-12" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-medium font-mono uppercase tracking-wider">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};
