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
    const body = await req.json()
    const { article_id, visitor_id, content } = body

    if (!article_id || !visitor_id || !content) {
      return errorResponse('Missing required fields', 400)
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({ article_id, visitor_id, content })
      .select()
      .single()

    if (error) throw error

    return jsonResponse({ success: true, data }, 201)
  } catch (error) {
    console.error('Create comment error:', error)
    return errorResponse('Failed to create comment', 500)
  }
}
