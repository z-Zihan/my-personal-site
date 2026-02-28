import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
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
    const { data: session } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('token', token)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (!session) {
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
