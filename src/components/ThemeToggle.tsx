'use client';

import { useTheme } from '@/context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="ml-4 p-2 rounded-lg bg-accent-primary text-white hover:bg-opacity-90 transition-colors"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <FiMoon className="h-6 w-6" />
      ) : (
        <FiSun className="h-6 w-6" />
      )}
    </button>
  );
}
