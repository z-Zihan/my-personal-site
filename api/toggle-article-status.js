import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
}

// 简单的 token 验证函数（不查数据库）
function validateToken(token) {
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
