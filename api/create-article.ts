import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'
import { requireAdmin } from './_auth'
import type { Article } from '../src/types/database'

export const config = {
  runtime: 'edge',
}


export default requireAdmin(async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  try {

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
