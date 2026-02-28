import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
}

// 简单的 token 验证函数（不查数据库）
function validateToken(token) {
  // 检查 token 格式：admin_时间戳_随机字符串
  if (!token || !token.startsWith('admin_')) {
    return false
  }
  const parts = token.split('_')
  if (parts.length < 3) {
    return false
  }
  // 简单验证时间戳（7 天有效期）
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

    // 创建文章
    const body = await req.json()
    const { title, content, summary, cover, status = 'draft' } = body

    if (!title || !content) {
      return errorResponse('Title and content are required', 400)
    }

    const { data: article, error } = await supabase
      .from('articles')
      .insert([{
        title,
        content,
        summary: summary || '',
        cover: cover || '',
        status,
        views: 0,
      }])
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse({ data: article }, 201)
  } catch (error) {
    console.error('Error creating article:', error)
    return errorResponse('Internal server error', 500)
  }
}
