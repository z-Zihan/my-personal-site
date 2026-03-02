import { create } from 'zustand'

// 开发模式检查
const isDev = import.meta.env.DEV && new URLSearchParams(window.location.search).get('dev') === '1'

const useAuthStore = create((set, get) => ({
  token: isDev ? 'dev_token' : localStorage.getItem('admin_token'),
  user: isDev ? { username: 'admin (dev)' } : JSON.parse(localStorage.getItem('admin_user') || 'null'),
  isDev: isDev,

  login: (token, user) => {
    if (!isDev) {
      localStorage.setItem('admin_token', token)
      localStorage.setItem('admin_user', JSON.stringify(user))
    }
    set({ token, user })
  },

  logout: () => {
    if (!isDev) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
    }
    set({ token: null, user: null })
  },

  isAuthenticated: () => {
    return isDev || !!localStorage.getItem('admin_token')
  },
}))

export default useAuthStore
