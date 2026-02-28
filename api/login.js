import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
}

// 简单 hardcoded 管理员账号
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin'

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

    if (!username || !password) {
      return errorResponse('Username and password are required', 400)
    }

    // 验证账号密码
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return errorResponse('Invalid credentials', 401)
    }

    // 生成 token (简单 UUID)
    const token = `admin_${Date.now()}_${Math.random().toString(36).substring(2)}`

    // 存储 session 到数据库 (7 天有效期)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const { error } = await supabase
      .from('admin_sessions')
      .insert([{
        token,
        expires_at: expiresAt.toISOString(),
      }])

    if (error) {
      console.error('Error storing session:', error)
      // 即使存储失败也返回成功，token 仍然有效
    }

    return jsonResponse({
      data: {
        token,
        expires_at: expiresAt.toISOString(),
        user: { username: ADMIN_USERNAME },
      },
    })
  } catch (error) {
    console.error('Error logging in:', error)
    return errorResponse('Internal server error', 500)
  }
}
