import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'
import type { Article } from '../src/types/database'

export const config = {
  runtime: 'edge',
}

// 简单的 token 验证函数
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

    // 创建文章
    const body = await req.json() as {
      title: string
      content: string
      summary?: string
      cover?: string
      status?: 'published' | 'draft' | 'scheduled'
      category_id?: string
    }
    const { title, content, summary, cover, status = 'draft', category_id } = body

    if (!title || !content) {
      return errorResponse('Title and content are required', 400)
    }

    const insertData: Partial<Article> = {
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
