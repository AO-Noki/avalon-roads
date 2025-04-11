export type Theme = 'light' | 'dark' | 'system';

export const getStoredTheme = (): Theme => {
  return (localStorage.getItem('theme') as Theme) || 'system';
};

export const setTheme = (theme: Theme) => {
  localStorage.setItem('theme', theme);
  applyTheme(theme);
};

export const applyTheme = (theme: Theme) => {
  const isDark = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  document.documentElement.classList.toggle('dark', isDark);
};

export const initTheme = () => {
  const theme = getStoredTheme();
  applyTheme(theme);
};
