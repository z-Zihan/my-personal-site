import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'
import { requireAdmin } from './_auth'

export const config = {
  runtime: 'edge',
}


export default requireAdmin(async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'PATCH') {
    return errorResponse('Method not allowed', 405)
  }

  try {

    // 切换文章状态
    const body = await req.json() as { id: string; status: 'published' | 'draft' | 'scheduled' }
    const { id, status } = body

    if (!id) {
      return errorResponse('Article ID is required', 400)
    }

    const { data: article, error } = await supabase
      .from('articles')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse({ data: article })
  } catch (error) {
    console.error('Error toggling article status:', error)
    return errorResponse('Internal server error', 500)
  }
}
