import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
}

// 简单的 token 验证函数（不查数据库）
function validateToken(token) {
  if (!token || !token.startsWith('admin_')) {
    return false
  }
  // token 格式：admin_timestamp_randombytes
  const match = token.match(/^admin_(\d+)_/)
  if (!match) {
    return false
  }
  const timestamp = parseInt(match[1])
  if (isNaN(timestamp)) {
    return false
  }
  // 验证时间戳是否合理（不能是未来时间，且不能太旧）
  const now = Date.now()
  const minTimestamp = now - 24 * 60 * 60 * 1000 // 最多 24 小时前
  if (timestamp > now || timestamp < minTimestamp) {
    return false
  }
  return true
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'PATCH') {
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

    // 切换文章状态
    const body = await req.json()
    const { id, status } = body

    if (!id) {
      return errorResponse('Article ID is required', 400)
    }

    const newStatus = status === 'published' ? 'draft' : 'published'

    const { data: article, error } = await supabase
      .from('articles')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse({ data: article, message: `Article ${newStatus === 'published' ? 'published' : 'unpublished'} successfully` })
  } catch (error) {
    console.error('Error toggling article status:', error)
    return errorResponse('Internal server error', 500)
  }
}
