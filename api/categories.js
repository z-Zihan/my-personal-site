import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
}

// 简单的 token 验证函数 - 只验证时间戳格式
function validateToken(token) {
  if (!token || !token.startsWith('admin_')) {
    return false
  }
  const timestamp = token.split('_')[1]
  return timestamp && !isNaN(parseInt(timestamp))
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  // 验证管理员 token
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse('Unauthorized', 401)
  }

  const token = authHeader.substring(7)

  // 验证 token
  if (!validateToken(token)) {
    return errorResponse('Invalid or expired token', 401)
  }

  // GET - 获取分类列表
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true })

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
      const { name } = await req.json()

      if (!name || !name.trim()) {
        return errorResponse('Category name is required', 400)
      }

      const trimName = name.trim()

      // 检查是否已存在同名分类
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('name', trimName)
        .single()

      if (existing) {
        return errorResponse('Category name already exists', 409)
      }

      const slug = trimName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: trimName,
          slug: slug
        }])
        .select()
        .single()

      if (error) {
        // 处理唯一约束冲突
        if (error.code === '23505') {
          return errorResponse('Category name already exists', 409)
        }
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
      const { id, name } = await req.json()

      if (!id) {
        return errorResponse('Category ID is required', 400)
      }

      if (!name || !name.trim()) {
        return errorResponse('Category name is required', 400)
      }

      const trimName = name.trim()

      // 检查是否有其他分类使用了相同的名称
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('name', trimName)
        .neq('id', id)
        .single()

      if (existing) {
        return errorResponse('Category name already exists', 409)
      }

      const { data, error } = await supabase
        .from('categories')
        .update({
          name: trimName,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          return errorResponse('Category name already exists', 409)
        }
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
        return errorResponse('Category ID is required', 400)
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) {
        return errorResponse(error.message, 500)
      }

      return jsonResponse({ data: { id } })
    } catch (error) {
      console.error('Error deleting category:', error)
      return errorResponse('Internal server error', 500)
    }
  }

  return errorResponse('Method not allowed', 405)
}
