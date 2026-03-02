import { jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
}

// 简单的 token 验证（生产环境应使用数据库或 Redis 存储）
const validTokens = new Map()

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const body = await req.json()
    const { token } = body

    if (!token) {
      return jsonResponse({ valid: false })
    }

    // 验证 token 格式
    if (!token.startsWith('admin_')) {
      return jsonResponse({ valid: false })
    }

    // 提取时间戳并检查是否过期（7 天）
    const parts = token.split('_')
    if (parts.length < 3) {
      return jsonResponse({ valid: false })
    }

    const timestamp = parseInt(parts[1])
    const expiresAt = timestamp + 7 * 24 * 60 * 60 * 1000

    if (Date.now() > expiresAt) {
      return jsonResponse({ valid: false })
    }

    return jsonResponse({ valid: true })
  } catch (error) {
    console.error('Error verifying token:', error)
    return errorResponse('Internal server error', 500)
  }
}
