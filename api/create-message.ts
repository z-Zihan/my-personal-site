import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'
import type { Message } from '../src/types/database'

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
      visitor_id: string
      content: string
      visitor_name?: string
      location?: string
    }
    const { visitor_id, content, visitor_name, location } = body

    if (!visitor_id || !content) {
      return errorResponse('Visitor ID and content are required', 400)
    }

    if (content.trim().length === 0) {
      return errorResponse('Message content cannot be empty', 400)
    }

    const insertData: Partial<Message> = {
      visitor_id,
      content: content.trim(),
      visitor_name: visitor_name || null,
      location: location || null
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse({ data: message }, 201)
  } catch (error) {
    console.error('Error creating message:', error)
    return errorResponse('Internal server error', 500)
  }
}
