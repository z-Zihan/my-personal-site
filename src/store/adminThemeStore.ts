import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 管理后台独立的主题存储（与博客主题分离）
interface AdminThemeState {
  adminDarkMode: boolean
  setAdminDarkMode: (isDark: boolean) => void
  toggleAdminDarkMode: () => void
  initAdminTheme: () => { adminDarkMode: boolean }
}

export const useAdminThemeStore = create<AdminThemeState>()(
  persist(
    (set, get) => ({
      adminDarkMode: false, // 管理后台默认浅色
      setAdminDarkMode: (isDark) => {
        set({ adminDarkMode: isDark })
        // 立即更新 DOM（仅管理后台）
        if (isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      toggleAdminDarkMode: () => {
        const newMode = !get().adminDarkMode
        set({ adminDarkMode: newMode })
        if (newMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      initAdminTheme: () => {
        const stored = localStorage.getItem('adminDarkMode')
        if (stored !== null) {
          const isDark = stored === 'true'
          set({ adminDarkMode: isDark })
          if (isDark) {
            document.documentElement.classList.add('dark')
          }
          return { adminDarkMode: isDark }
        }
        // 管理后台默认浅色
        set({ adminDarkMode: false })
        document.documentElement.classList.remove('dark')
        return { adminDarkMode: false }
      },
    }),
    {
      name: 'admin-theme-storage',
      partialize: (state) => ({ adminDarkMode: state.adminDarkMode }),
    }
  )
)
