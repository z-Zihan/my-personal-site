import { create } from 'zustand'

export interface User {
  id?: number
  username?: string
  [key: string]: unknown
}

interface AuthState {
  token: string | null
  expiresAt: string | null
  user: User | null
  login: (token: string, user: User, expiresAt?: string) => void
  logout: () => void
  isAuthenticated: () => boolean
  checkAuth: () => boolean
}

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000 // 1 天

// 检查 token 是否过期
const isTokenExpired = (expiresAt: string | null) => {
  if (!expiresAt) return true
  return Date.now() > parseInt(expiresAt)
}

// 获取存储的 token 和过期时间
const getStoredToken = () => {
  const token = localStorage.getItem('admin_token')
  const expiresAt = localStorage.getItem('admin_token_expires_at')

  if (!token || isTokenExpired(expiresAt)) {
    // token 不存在或已过期，清除
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_token_expires_at')
    localStorage.removeItem('admin_user')
    return null
  }

  return { token, expiresAt }
}

const stored = getStoredToken()

const useAuthStore = create<AuthState>((set, get) => ({
  token: stored?.token || null,
  expiresAt: stored?.expiresAt || null,
  user: stored ? JSON.parse(localStorage.getItem('admin_user') || 'null') : null,

  login: (token, user, expiresAt) => {
    const expiryTime = expiresAt || (Date.now() + TOKEN_EXPIRY_MS).toString()
    localStorage.setItem('admin_token', token)
    localStorage.setItem('admin_token_expires_at', expiryTime)
    localStorage.setItem('admin_user', JSON.stringify(user))
    set({ token, expiresAt: expiryTime, user })
  },

  logout: () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_token_expires_at')
    localStorage.removeItem('admin_user')
    set({ token: null, expiresAt: null, user: null })
  },

  isAuthenticated: () => {
    const stored = getStoredToken()
    return !!stored?.token
  },

  // 检查是否已认证（用于路由守卫）
  checkAuth: () => {
    return getStoredToken() !== null
  },
}))

export default useAuthStore
