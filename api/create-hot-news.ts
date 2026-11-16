import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'

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

    const body = await req.json() as {
      title?: string
      link?: string
      source?: string
    }
    const title = body.title?.trim()
    const link = body.link?.trim()

    if (!title || !link) {
      return errorResponse('Title and link are required', 400)
    }

    // 简单校验 link 必须是合法 URL
    try {
      new URL(link)
    } catch {
      return errorResponse('Link must be a valid URL', 400)
    }

    const { data, error } = await supabase
      .from('hot_news')
      .insert([{ title, link, source: body.source?.trim() || '' }])
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse({ data }, 201)
  } catch (error) {
    console.error('Error creating hot news:', error)
    return errorResponse('Internal server error', 500)
  }
}
