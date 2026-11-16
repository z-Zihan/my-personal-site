import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'
import { createAdminToken } from './_auth'
import type { LoginRequest, LoginResponse } from '../src/types/database'

export const config = {
  runtime: 'edge',
}

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const body = await req.json() as LoginRequest
    const { username, password } = body

    // 速率限制
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 }

    if (attempts.count >= MAX_ATTEMPTS && Date.now() - attempts.lastAttempt < LOCKOUT_TIME) {
      const remainingTime = Math.ceil((LOCKOUT_TIME - (Date.now() - attempts.lastAttempt)) / 60000)
      return errorResponse(`尝试次数过多，请${remainingTime}分钟后再试`, 429)
    }

    if (attempts.count >= MAX_ATTEMPTS && Date.now() - attempts.lastAttempt >= LOCKOUT_TIME) {
      attempts.count = 0
    }

    if (!username || !password) {
      return errorResponse('请输入用户名和密码', 400)
    }

    // 从环境变量读取管理员账号密码（2026-11-13: 密码不进源码,只在 Vercel 环境变量配置）
    const validUsername = process.env.ADMIN_USERNAME || 'admin'
    const validPassword = process.env.ADMIN_PASSWORD

    if (!validPassword) {
      console.error('ADMIN_PASSWORD environment variable is not configured')
      return errorResponse('服务端未配置管理员密码，请在 Vercel 环境变量中设置 ADMIN_PASSWORD', 500)
    }

    if (username !== validUsername || password !== validPassword) {
      attempts.count += 1
      attempts.lastAttempt = Date.now()
      loginAttempts.set(ip, attempts)
      return errorResponse('用户名或密码错误', 401)
    }

    loginAttempts.delete(ip)

    // 生成 v2 HMAC 签名 token（2026-11-16: 取代无签名的 admin_<ts>_<hex>）
    // 签名密钥从 ADMIN_PASSWORD 派生，见 _auth.ts；有效期 7 天
    const token = await createAdminToken()
    if (!token) {
      // 与上方密码校验的 fail-closed 分支保持一致（防御性：走到这里说明密码必然已配置）
      return errorResponse('服务端未配置管理员密码，请在 Vercel 环境变量中设置 ADMIN_PASSWORD', 500)
    }
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 天后过期

    const response: LoginResponse = {
      token,
      expires_at: expiresAt.toISOString(),
      user: { username: 'admin' },
      password_hint: process.env.ADMIN_PASSWORD_HINT || undefined,
    }

    return jsonResponse({ data: response })
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('服务器错误', 500)
  }
}
