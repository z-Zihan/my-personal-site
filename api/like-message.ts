import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'

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
    const body = await req.json()
    const { messageId, visitorId } = body

    if (!messageId) {
      return errorResponse('Message ID is required', 400)
    }

    // 从请求头获取 visitorId，如果没有则从 body 获取
    const visitor = visitorId || req.headers.get('x-visitor-id')

    if (!visitor) {
      return errorResponse('Visitor ID is required', 400)
    }

    // 检查是否已点赞
    const { data: existingLike, error: checkError } = await supabase
      .from('message_likes')
      .select('id')
      .eq('message_id', messageId)
      .eq('visitor_id', visitor)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 是 "没有找到匹配行" 的错误码，其他错误需要处理
      console.error('Error checking like:', checkError)
      return errorResponse('Failed to check like status', 500)
    }

    let liked: boolean
    let newLikesCount: number

    if (existingLike) {
      // 已点赞，执行取消点赞
      const { error: deleteError } = await supabase
        .from('message_likes')
        .delete()
        .eq('id', existingLike.id)

      if (deleteError) {
        console.error('Error removing like:', deleteError)
        return errorResponse('Failed to remove like', 500)
      }

      // 减少点赞计数
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('likes')
        .eq('id', messageId)
        .single()

      if (fetchError) {
        console.error('Error fetching message:', fetchError)
      }

      const currentLikes = message?.likes || 0
      newLikesCount = Math.max(0, currentLikes - 1)

      await supabase
        .from('messages')
        .update({ likes: newLikesCount })
        .eq('id', messageId)

      liked = false
    } else {
      // 未点赞，执行点赞
      const { error: insertError } = await supabase
        .from('message_likes')
        .insert({
          message_id: messageId,
          visitor_id: visitor,
        })

      if (insertError) {
        console.error('Error adding like:', insertError)
        return errorResponse('Failed to add like', 500)
      }

      // 增加点赞计数
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('likes')
        .eq('id', messageId)
        .single()

      if (fetchError) {
        console.error('Error fetching message:', fetchError)
      }

      const currentLikes = message?.likes || 0
      newLikesCount = currentLikes + 1

      await supabase
        .from('messages')
        .update({ likes: newLikesCount })
        .eq('id', messageId)

      liked = true
    }

    return jsonResponse({
      success: true,
      liked,
      likes: newLikesCount,
    })
  } catch (error) {
    console.error('Error toggling like:', error)
    return errorResponse('Internal server error', 500)
  }
}