import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const url = new URL(req.url)
    const article_id = url.searchParams.get('article_id')

    if (!article_id) {
      return errorResponse('Article ID required', 400)
    }

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('article_id', article_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return jsonResponse({ success: true, data })
  } catch (error) {
    console.error('Fetch comments error:', error)
    return errorResponse('Failed to fetch comments', 500)
  }
}
