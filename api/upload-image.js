import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method === 'POST') {
    try {
      const formData = await req.formData()
      const file = formData.get('image')
      
      if (!file) {
        return errorResponse('No image provided', 400)
      }

      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        return errorResponse('Invalid file type. Allowed: jpeg, png, gif, webp', 400)
      }

      // 验证文件大小（最大 5MB）
      if (file.size > 5 * 1024 * 1024) {
        return errorResponse('File size must be less than 5MB', 400)
      }

      // 生成文件名
      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = `upload_${Date.now()}.${ext}`
      
      // 上传到 Supabase Storage
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // 获取公开 URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName)

      return jsonResponse({
        success: true,
        url: publicUrl,
        fileName,
        size: file.size,
      })
    } catch (error) {
      console.error('Upload error:', error)
      return errorResponse('Upload failed: ' + error.message, 500)
    }
  }

  return errorResponse('Method not allowed', 405)
}
