import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'
import { requireAdmin } from './_auth'

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

    const body = await req.json() as {
      id: string
      is_recommended?: boolean
      recommended?: boolean
      recommend_order?: number
    }
    const { id, is_recommended, recommended, recommend_order } = body

    if (!id) {
      return errorResponse('Article ID is required', 400)
    }

    // 兼容两种参数名：recommended 和 is_recommended
    const recommendedValue = is_recommended !== undefined ? is_recommended : recommended
    if (recommendedValue === undefined) {
      return errorResponse('recommended or is_recommended is required', 400)
    }

    const updateData: { is_recommended?: boolean; recommend_order?: number } = {
      is_recommended: recommendedValue
    }
    if (recommend_order !== undefined) updateData.recommend_order = recommend_order

    const { data: article, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) {
      return errorResponse(error.message, 500)
    }

    if (!article) {
      return errorResponse('Article not found', 404)
    }

    return jsonResponse({ success: true, is_recommended: article?.is_recommended })
  } catch (error) {
    console.error('Error updating article recommend:', error)
    return errorResponse('Internal server error', 500)
  }
}
