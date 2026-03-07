import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'
import type { ImageUploadResponse } from '../src/types/database'

export const config = {
  runtime: 'edge',
}

// 检查并创建 bucket（如果不存在）- 需要 service role key
async function ensureBucketExists(): Promise<boolean> {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error('Error listing buckets:', error.message)
      return false
    }

    const bucketExists = buckets.some(b => b.name === 'image')

    if (!bucketExists) {
      console.log('Creating image bucket...')
      const { error: createError } = await supabase.storage.createBucket('image', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
      })

      if (createError) {
        console.error('Error creating bucket:', createError.message)
        return false
      }

      console.log('image bucket created successfully')
    }

    return true
  } catch (error) {
    console.error('ensureBucketExists error:', error)
    return false
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method === 'POST') {
    try {
      const formData = await req.formData()
      const file = formData.get('image') as File | null

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

      // 尝试确保 bucket 存在（如果有权限）
      await ensureBucketExists()

      // 上传到 Supabase Storage
      const { error } = await supabase.storage
        .from('image')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        console.error('Supabase storage error:', error)
        // 检查是否是 bucket 不存在的错误
        if (error.message.includes('Bucket not found') || error.message.includes('The bucket does not exist')) {
          return errorResponse(
            'Upload failed: Bucket "image" does not exist. ' +
            'Please create it in Supabase Dashboard: Storage → New bucket → Name: "image", check "Public bucket". ' +
            'See STORAGE_SETUP.md for details.',
            500
          )
        }
        return errorResponse('Upload failed: ' + error.message, 500)
      }

      // 获取公开 URL
      const { data: { publicUrl } } = supabase.storage
        .from('image')
        .getPublicUrl(fileName)

      const response: ImageUploadResponse = {
        success: true,
        url: publicUrl,
        fileName,
        size: file.size,
      }

      return jsonResponse({ ...response })
    } catch (error) {
      console.error('Upload error:', error)
      return errorResponse('Upload failed: ' + (error as Error).message, 500)
    }
  }

  return errorResponse('Method not allowed', 405)
}
