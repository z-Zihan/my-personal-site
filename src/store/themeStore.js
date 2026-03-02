import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      darkMode: true, // 默认暗黑模式
      toggleDarkMode: () => set((state) => {
        const newMode = !state.darkMode;
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { darkMode: newMode };
      }),
      initTheme: () => {
        // 初始化时检查系统偏好
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
