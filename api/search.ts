import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'
import type { Article } from '../src/types/database'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const url = new URL(req.url)
    const q = url.searchParams.get('q')

    if (!q || q.length < 1) {
      return jsonResponse({ data: [] })
    }

    // 转义 PostgREST filter 特殊字符，防止注入
    const safeQ = q.replace(/[%_\\(),."]/g, (ch: string) => `\\${ch}`)

    // 搜索标题和内容
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, summary, cover, views, created_at')
      .eq('status', 'published')
      .or(`title.ilike.%${safeQ}%,content.ilike.%${safeQ}%`)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Search error:', error)
      return errorResponse(error.message, 500)
    }

    return jsonResponse({ data: data || [] })
  } catch (error) {
    console.error('Error searching:', error)
    return errorResponse('Internal server error', 500)
  }
}
