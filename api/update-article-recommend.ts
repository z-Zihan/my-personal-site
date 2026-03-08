import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'

export const config = {
  runtime: 'edge',
}

// 简单的 token 验证函数 - 只验证时间戳格式
function validateToken(token: string | null): boolean {
  if (!token || !token.startsWith('admin_')) {
    return false
  }
  const timestamp = token.split('_')[1]
  return timestamp && !isNaN(parseInt(timestamp))
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

    const body = await req.json() as {
      id: string
      is_recommended?: boolean
      recommend_order?: number
    }
    const { id, is_recommended, recommend_order } = body

    if (!id) {
      return errorResponse('Article ID is required', 400)
    }

    const updateData: { is_recommended?: boolean; recommend_order?: number } = {}
    if (is_recommended !== undefined) updateData.is_recommended = is_recommended
    if (recommend_order !== undefined) updateData.recommend_order = recommend_order

    const { data: article, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse({ success: true, is_recommended: article?.is_recommended })
  } catch (error) {
    console.error('Error updating article recommend:', error)
    return errorResponse('Internal server error', 500)
  }
}
