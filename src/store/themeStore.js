import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      darkMode: false, // 默认浅色模式
      toggleDarkMode: () => {
        const newMode = !get().darkMode;
        // 立即更新 DOM
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        set({ darkMode: newMode });
      },
      setDarkMode: (isDark) => {
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        set({ darkMode: isDark });
      },
      initTheme: () => {
        // 从存储或系统偏好初始化
        const stored = localStorage.getItem('darkMode');
        if (stored !== null) {
          const isDark = stored === 'true';
          if (isDark) {
            document.documentElement.classList.add('dark');
          }
          return { darkMode: isDark };
        }
        // 检查系统偏好
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
          return { darkMode: true };
        }
        return { darkMode: false };
      }
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ darkMode: state.darkMode })
    }
  )
);
