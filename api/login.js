import { jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
}

// 简单内存存储用于速率限制（生产环境应用 Redis）
const loginAttempts = new Map()

// 速率限制配置
const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 分钟

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

    // 检查 IP 速率限制
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 }
    
    // 检查是否被锁定
    if (attempts.count >= MAX_ATTEMPTS && Date.now() - attempts.lastAttempt < LOCKOUT_TIME) {
      const remainingTime = Math.ceil((LOCKOUT_TIME - (Date.now() - attempts.lastAttempt)) / 60000)
      return errorResponse(`Too many login attempts. Try again in ${remainingTime} minutes.`, 429)
    }
    
    // 重置计数器如果超过锁定时间
    if (attempts.count >= MAX_ATTEMPTS && Date.now() - attempts.lastAttempt >= LOCKOUT_TIME) {
      attempts.count = 0
    }

    if (!username || !password) {
      return errorResponse('Username and password are required', 400)
    }

    // 从环境变量读取管理员账号（优先）或使用默认值
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin'

    // 验证账号密码
    if (username !== adminUsername || password !== adminPassword) {
      // 增加失败计数
      attempts.count += 1
      attempts.lastAttempt = Date.now()
      loginAttempts.set(ip, attempts)
      
      return errorResponse('Invalid credentials', 401)
    }

    // 登录成功，重置计数器
    loginAttempts.delete(ip)

    // 生成更安全的 token（使用 crypto）
    const randomBytes = new Uint8Array(32)
    crypto.getRandomValues(randomBytes)
    const token = `admin_${Date.now()}_${Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')}`
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 天

    return jsonResponse({
      data: {
        token,
        expires_at: expiresAt.toISOString(),
        user: { username: adminUsername },
      },
    })
  } catch (error) {
    console.error('Error logging in:', error)
    return errorResponse('Internal server error', 500)
  }
}
