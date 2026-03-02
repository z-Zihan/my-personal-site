import { jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
}

// 简单内存存储用于速率限制
const loginAttempts = new Map()
const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const body = await req.json()
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

    // 从环境变量读取（Vercel 会自动注入）
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2026Secure'

    if (username !== adminUsername || password !== adminPassword) {
      attempts.count += 1
      attempts.lastAttempt = Date.now()
      loginAttempts.set(ip, attempts)
      return errorResponse('用户名或密码错误', 401)
    }

    loginAttempts.delete(ip)

    // 生成安全 token
    const randomBytes = new Uint8Array(32)
    crypto.getRandomValues(randomBytes)
    const token = `admin_${Date.now()}_${Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')}`
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    return jsonResponse({
      data: {
        token,
        expires_at: expiresAt.toISOString(),
        user: { username: adminUsername },
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('服务器错误', 500)
  }
}
