import { useThemeStore } from '../../store/themeStore'

/**
 * 后台统一主题初始化。
 *
 * 优先级（与全站 themeStore / localStorage 约定对齐）：
 * 1. theme-storage（zustand persist，前台 ThemeToggle 与后台共用，最新语义）
 * 2. darkMode 裸键（Profile 页 setDarkMode 时双写的旧约定）
 * 3. admin-theme-storage（旧后台独立存储，一次性迁移进 theme-storage 后弃用）
 * 4. 都没有 → 跟随系统偏好
 *
 * 结果统一通过 themeStore.setDarkMode 应用：同时更新 store、html.dark、theme-storage。
 */
export function initAdminTheme(): boolean {
  const store = useThemeStore.getState()
  const hasThemeStorage = localStorage.getItem('theme-storage') !== null
  const rawKey = localStorage.getItem('darkMode')

  let resolved: boolean

  if (hasThemeStorage) {
    // zustand persist 已在 store 创建时同步 rehydrate，直接取 store 值
    resolved = store.darkMode
  } else if (rawKey !== null) {
    resolved = rawKey === 'true'
  } else {
    const legacy = localStorage.getItem('admin-theme-storage')
    if (legacy) {
      try {
        resolved = JSON.parse(legacy)?.state?.adminDarkMode ?? false
      } catch {
        resolved = false
      }
      // 旧后台偏好迁移到统一存储，之后前台/后台共用
      localStorage.removeItem('admin-theme-storage')
    } else {
      // 全新用户：跟随系统偏好
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }

  store.setDarkMode(resolved)
  // 双写裸键，保持与 Profile 页约定一致（其 initTheme 优先读裸键）
  localStorage.setItem('darkMode', String(resolved))
  return resolved
}

/**
 * 切换主题：走统一 themeStore（更新 store + DOM + theme-storage），
 * 并双写裸键保持全站一致。
 */
export function toggleAdminTheme(): void {
  const store = useThemeStore.getState()
  store.toggleDarkMode()
  localStorage.setItem('darkMode', String(!store.darkMode))
}
