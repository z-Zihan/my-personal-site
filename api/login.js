import { jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
}

// 管理员账号验证（ hardcoded）
// 注意：Token 验证在需要认证的 API 中进行
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
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // 不再存储到数据库，仅前端验证
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
