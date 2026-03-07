import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'
import type { Comment } from '../src/types/database'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const body = await req.json() as {
      article_id: string
      visitor_id: string
      content: string
      visitor_name?: string
      location?: string
    }
    const { article_id, visitor_id, content, visitor_name, location } = body

    if (!article_id || !visitor_id || !content) {
      return errorResponse('Missing required fields', 400)
    }

    const insertData: Partial<Comment> = {
      article_id,
      visitor_id,
      content,
      visitor_name,
      location
    }

    const { data, error } = await supabase
      .from('comments')
      .insert(insertData)
      .select()
      .single()

    if (error) throw error

    return jsonResponse({ data }, 201)
  } catch (error) {
    console.error('Create comment error:', error)
    return errorResponse('Failed to create comment', 500)
  }
}
