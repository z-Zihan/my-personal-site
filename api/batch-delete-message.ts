import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'

export const config = {
  runtime: 'edge',
}

// 简单的 token 验证函数（不查数据库）
function validateToken(token: string | null): boolean {
  if (!token || !token.startsWith('admin_')) {
    return false
  }
  const parts = token.split('_')
  if (parts.length < 3) {
    return false
  }
  const timestamp = parseInt(parts[1])
  if (isNaN(timestamp)) {
    return false
  }
  const expiresAt = timestamp + 7 * 24 * 60 * 60 * 1000
  return Date.now() < expiresAt
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    // 验证管理员 token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('Unauthorized', 401)
    }

    const token = authHeader.substring(7)

    // 验证 token
    if (!validateToken(token)) {
      return errorResponse('Invalid or expired token', 401)
    }

    // 解析请求体
    const { ids } = await req.json() as { ids: string[] }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse('Message IDs are required', 400)
    }

    // 批量删除留言
    const { error } = await supabase
      .from('messages')
      .delete()
      .in('id', ids)

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse({ data: { deleted: true, count: ids.length } })
  } catch (error) {
    console.error('Error batch deleting messages:', error)
    return errorResponse('Internal server error', 500)
  }
}
