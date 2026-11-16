import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'
import { requireAdmin } from './_auth'
import type { Message } from '../src/types/database'

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

    // 更新留言
    const body = await req.json() as {
      id?: string
      content?: unknown
      visitor_name?: unknown
      location?: unknown
      likes?: unknown
      created_at?: unknown
    }
    const { id, content, visitor_name, location, likes, created_at } = body

    if (!id) {
      return errorResponse('Message ID is required', 400)
    }

    // visitor_id 不允许修改
    const updateData: Partial<Omit<Message, 'id' | 'visitor_id'>> = {}

    if (content !== undefined) {
      if (typeof content !== 'string' || !content.trim()) {
        return errorResponse('Content cannot be empty', 400)
      }
      updateData.content = content.trim()
    }

    if (visitor_name !== undefined) {
      if (typeof visitor_name !== 'string') {
        return errorResponse('Invalid visitor_name', 400)
      }
      updateData.visitor_name = visitor_name
    }

    if (location !== undefined) {
      if (typeof location !== 'string') {
        return errorResponse('Invalid location', 400)
      }
      updateData.location = location
    }

    if (likes !== undefined) {
      if (typeof likes !== 'number' || !Number.isInteger(likes) || likes < 0) {
        return errorResponse('Likes must be a non-negative integer', 400)
      }
      updateData.likes = likes
    }

    if (created_at !== undefined) {
      const date = typeof created_at === 'string' ? new Date(created_at) : null
      if (!date || isNaN(date.getTime())) {
        return errorResponse('created_at must be a valid ISO date', 400)
      }
      updateData.created_at = date.toISOString()
    }

    const { data: message, error } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse({ data: message })
  } catch (error) {
    console.error('Error updating message:', error)
    return errorResponse('Internal server error', 500)
  }
}
