import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
}

// 简单的 token 验证函数 - 只验证时间戳格式
function validateToken(token) {
  if (!token || !token.startsWith('admin_')) {
    return false
  }
  const timestamp = token.split('_')[1]
  return timestamp && !isNaN(parseInt(timestamp))
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
    const { title, content, summary, cover, status = 'draft', category_id } = body

    if (!title || !content) {
      return errorResponse('Title and content are required', 400)
    }

    const insertData = {
      title,
      content,
      summary: summary || '',
      cover: cover || '',
      status,
      views: 0,
    }

    if (category_id) {
      insertData.category_id = category_id
    }

    const { data: article, error } = await supabase
      .from('articles')
      .insert([insertData])
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
