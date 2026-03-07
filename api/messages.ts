import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'
import type { Message } from '../src/types/database'

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
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse({ data })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return errorResponse('Internal server error', 500)
  }
}
