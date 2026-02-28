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
    const { data, error } = await supabase
      .from('hot_news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse({ data })
  } catch (error) {
    console.error('Error fetching hot news:', error)
    return errorResponse('Internal server error', 500)
  }
}
