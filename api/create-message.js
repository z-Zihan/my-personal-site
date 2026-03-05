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
    const { visitor_id, content, visitor_name } = body

    if (!visitor_id || !content) {
      return errorResponse('Visitor ID and content are required', 400)
    }

    if (content.trim().length === 0) {
      return errorResponse('Message content cannot be empty', 400)
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert([{ visitor_id, content: content.trim(), visitor_name: visitor_name || null }])
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
