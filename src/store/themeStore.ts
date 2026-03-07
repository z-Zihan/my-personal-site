import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  darkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (isDark: boolean) => void
  initTheme: () => { darkMode: boolean }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      darkMode: false, // 默认浅色模式
      toggleDarkMode: () => {
        const newMode = !get().darkMode
        set({ darkMode: newMode })
        // 立即更新 DOM
        if (newMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      setDarkMode: (isDark) => {
        set({ darkMode: isDark })
        // 立即更新 DOM
        if (isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      initTheme: () => {
        // 从存储或系统偏好初始化
        const stored = localStorage.getItem('darkMode')
        if (stored !== null) {
          const isDark = stored === 'true'
          set({ darkMode: isDark })
          if (isDark) {
            document.documentElement.classList.add('dark')
          }
          return { darkMode: isDark }
        }
        // 检查系统偏好
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          set({ darkMode: true })
          document.documentElement.classList.add('dark')
          return { darkMode: true }
        }
        set({ darkMode: false })
        return { darkMode: false }
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ darkMode: state.darkMode }),
    }
  )
)
