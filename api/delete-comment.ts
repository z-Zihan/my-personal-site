import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request): Promise<Response> {
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
      return errorResponse('Comment ID is required', 400)
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)

    if (error) throw error

    return jsonResponse({ data: { deleted: true } })
  } catch (error) {
    console.error('Delete comment error:', error)
    return errorResponse('Failed to delete comment', 500)
  }
}
