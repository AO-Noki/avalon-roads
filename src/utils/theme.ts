export type Theme = 'light' | 'dark' | 'system';

export const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const setTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  const isDark = theme === 'dark' || (theme === 'system' && getSystemTheme() === 'dark');

  root.classList.toggle('dark', isDark);
  localStorage.setItem('theme', theme);
};

export const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem('theme') as Theme) || 'system';
};

export const initTheme = () => {
  if (typeof window === 'undefined') return;

  const theme = getStoredTheme();
  setTheme(theme);

  // Listen for system theme changes
  if (theme === 'system') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      setTheme('system');
    });
  }
};
