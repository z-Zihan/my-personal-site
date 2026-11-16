import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'
import { requireAdmin } from './_auth'

export const config = {
  runtime: 'edge',
}

export default requireAdmin(async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'DELETE') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return errorResponse('Hot news ID is required', 400)
    }

    const { error } = await supabase
      .from('hot_news')
      .delete()
      .eq('id', id)

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse({ data: { deleted: true } })
  } catch (error) {
    console.error('Error deleting hot news:', error)
    return errorResponse('Internal server error', 500)
  }
})
