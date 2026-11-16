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

  if (req.method !== 'PUT') {
    return errorResponse('Method not allowed', 405)
  }

  try {

    // 更新文章
    const body = await req.json() as {
      id: string
      title?: string
      content?: string
      summary?: string
      cover?: string
      status?: 'published' | 'draft' | 'scheduled'
      category_id?: string
    }
    const { id, title, content, summary, cover, status, category_id } = body

    if (!id) {
      return errorResponse('Article ID is required', 400)
    }

    const updateData: Partial<Article> = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (summary !== undefined) updateData.summary = summary
    if (cover !== undefined) updateData.cover = cover
    if (status !== undefined) updateData.status = status
    if (category_id !== undefined) updateData.category_id = category_id
    // 添加最后修改时间
    updateData.updated_at = new Date().toISOString()

    const { data: article, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse({ data: article })
  } catch (error) {
    console.error('Error updating article:', error)
    return errorResponse('Internal server error', 500)
  }
}
