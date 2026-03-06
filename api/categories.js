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

// 统一错误响应格式
function apiError(code, message, status = 400) {
  return jsonResponse({ code, message, success: false }, status)
}

// 统一成功响应格式
function apiSuccess(data = null, message = '操作成功', status = 200) {
  return jsonResponse({ code: 0, message, data, success: true }, status)
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  // 验证管理员 token
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return apiError('UNAUTHORIZED', '未授权访问', 401)
  }

  const token = authHeader.substring(7)

  // 验证 token
  if (!validateToken(token)) {
    return apiError('INVALID_TOKEN', 'Token 无效或已过期', 401)
  }

  // GET - 获取分类列表
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        return apiError('FETCH_ERROR', error.message, 500)
      }

      return apiSuccess(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      return apiError('SERVER_ERROR', '服务器错误', 500)
    }
  }

  // POST - 创建新分类
  if (req.method === 'POST') {
    try {
      const { name } = await req.json()

      if (!name || !name.trim()) {
        return apiError('INVALID_PARAMS', '分类名称不能为空', 400)
      }

      const trimName = name.trim()

      // 检查是否已存在同名分类
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('name', trimName)
        .single()

      if (existing) {
        return apiError('DUPLICATE_CATEGORY', '分类名称已存在', 409)
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
          return apiError('DUPLICATE_CATEGORY', '分类名称已存在', 409)
        }
        return apiError('CREATE_ERROR', error.message, 500)
      }

      return apiSuccess(null, '添加成功', 201)
    } catch (error) {
      console.error('Error creating category:', error)
      return apiError('SERVER_ERROR', '服务器错误', 500)
    }
  }

  // PUT - 更新分类
  if (req.method === 'PUT') {
    try {
      const { id, name } = await req.json()

      if (!id) {
        return apiError('INVALID_PARAMS', '分类 ID 不能为空', 400)
      }

      if (!name || !name.trim()) {
        return apiError('INVALID_PARAMS', '分类名称不能为空', 400)
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
        return apiError('DUPLICATE_CATEGORY', '分类名称已存在', 409)
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
          return apiError('DUPLICATE_CATEGORY', '分类名称已存在', 409)
        }
        return apiError('UPDATE_ERROR', error.message, 500)
      }

      return apiSuccess(null, '更新成功')
    } catch (error) {
      console.error('Error updating category:', error)
      return apiError('SERVER_ERROR', '服务器错误', 500)
    }
  }

  // DELETE - 删除分类
  if (req.method === 'DELETE') {
    try {
      const url = new URL(req.url)
      const id = url.searchParams.get('id')

      if (!id) {
        return apiError('INVALID_PARAMS', '分类 ID 不能为空', 400)
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) {
        return apiError('DELETE_ERROR', error.message, 500)
      }

      return apiSuccess(null, '删除成功')
    } catch (error) {
      console.error('Error deleting category:', error)
      return apiError('SERVER_ERROR', '服务器错误', 500)
    }
  }

  return apiError('METHOD_NOT_ALLOWED', '方法不允许', 405)
}
