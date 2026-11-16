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

    // 解析请求体
    const { ids } = await req.json() as { ids: string[] }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse('Message IDs are required', 400)
    }

    // 批量删除留言
    const { error } = await supabase
      .from('messages')
      .delete()
      .in('id', ids)

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse({ data: { deleted: true, count: ids.length } })
  } catch (error) {
    console.error('Error batch deleting messages:', error)
    return errorResponse('Internal server error', 500)
  }
}
