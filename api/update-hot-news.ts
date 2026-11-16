import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'

export const config = {
  runtime: 'edge',
}


export default requireAdmin(async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'PUT') {
    return errorResponse('Method not allowed', 405)
  }

  try {

    const body = await req.json() as {
      id?: string
      title?: string
      link?: string
      source?: string
    }

    if (!body.id) {
      return errorResponse('Hot news ID is required', 400)
    }

    const updates: Record<string, string> = {}
    if (body.title !== undefined) {
      const title = body.title.trim()
      if (!title) return errorResponse('Title cannot be empty', 400)
      updates.title = title
    }
    if (body.link !== undefined) {
      const link = body.link.trim()
      if (!link) return errorResponse('Link cannot be empty', 400)
      try {
        new URL(link)
      } catch {
        return errorResponse('Link must be a valid URL', 400)
      }
      updates.link = link
    }
    if (body.source !== undefined) {
      updates.source = body.source.trim()
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('No fields to update', 400)
    }

    const { data, error } = await supabase
      .from('hot_news')
      .update(updates)
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse({ data })
  } catch (error) {
    console.error('Error updating hot news:', error)
    return errorResponse('Internal server error', 500)
  }
}
