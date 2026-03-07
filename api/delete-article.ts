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

  if (req.method !== 'DELETE') {
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

    // 删除文章
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return errorResponse('Article ID is required', 400)
    }

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse({ data: { deleted: true } })
  } catch (error) {
    console.error('Error deleting article:', error)
    return errorResponse('Internal server error', 500)
  }
}
