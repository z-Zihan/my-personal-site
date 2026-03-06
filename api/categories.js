import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  // GET - 获取分类列表
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return errorResponse(error.message, 500)
      }

      return jsonResponse({ data: data || [] })
    } catch (error) {
      console.error('Error fetching categories:', error)
      return errorResponse('Internal server error', 500)
    }
  }

  // POST - 创建新分类
  if (req.method === 'POST') {
    try {
      const { name, description } = await req.json()

      if (!name || !name.trim()) {
        return errorResponse('分类名称不能为空', 400)
      }

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: name.trim(),
          description: description || null
        }])
        .select()
        .single()

      if (error) {
        return errorResponse(error.message, 500)
      }

      return jsonResponse({ data }, 201)
    } catch (error) {
      console.error('Error creating category:', error)
      return errorResponse('Internal server error', 500)
    }
  }

  // PUT - 更新分类
  if (req.method === 'PUT') {
    try {
      const { id, name, description } = await req.json()

      if (!id) {
        return errorResponse('分类 ID 不能为空', 400)
      }

      if (!name || !name.trim()) {
        return errorResponse('分类名称不能为空', 400)
      }

      const { data, error } = await supabase
        .from('categories')
        .update({
          name: name.trim(),
          description: description || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return errorResponse(error.message, 500)
      }

      return jsonResponse({ data })
    } catch (error) {
      console.error('Error updating category:', error)
      return errorResponse('Internal server error', 500)
    }
  }

  // DELETE - 删除分类
  if (req.method === 'DELETE') {
    try {
      const url = new URL(req.url)
      const id = url.searchParams.get('id')

      if (!id) {
        return errorResponse('分类 ID 不能为空', 400)
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) {
        return errorResponse(error.message, 500)
      }

      return jsonResponse({ success: true })
    } catch (error) {
      console.error('Error deleting category:', error)
      return errorResponse('Internal server error', 500)
    }
  }

  return errorResponse('Method not allowed', 405)
}
