import React, { useRef, useState, useEffect, ChangeEvent } from 'react'
import { uploadApi } from '../../api/upload'
import { toast } from '../../utils/toast'
import { sanitizeInput, inputRules } from '../../utils/sanitize'

interface ImageUploaderProps {
  onChange: (value: string) => void
  value?: string
  accept?: string
}

export default function ImageUploader({ onChange, value, accept = 'image/*' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 监听 value 变化，支持外部回填
  useEffect(() => {
    setPreview(value || '')
  }, [value])

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const { data } = await uploadApi.uploadImage(file)

      if ((data as { success: boolean }).success) {
        setPreview((data as { url: string }).url)
        onChange((data as { url: string }).url)
        toast.success('上传成功')
      }
    } catch (error) {
      toast.error((error as any).response?.data?.error || '上传失败')
    } finally {
      setUploading(false)
      // 清空 input 允许重复选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-2">
      {/* 预览区域 */}
      {preview && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => {
              setPreview(null as unknown as string)
              onChange('')
            }}
            className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 cursor-pointer"
          >
            删除
          </button>
        </div>
      )}

      {/* 上传按钮 */}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 cursor-pointer"
        >
          {uploading ? '上传中...' : '选择图片'}
        </button>

        {/* URL 输入 */}
        <input
          type="url"
          placeholder="或输入图片 URL"
          value={preview || ''}
          onChange={(e) => {
            setPreview(sanitizeInput(e.target.value))
            onChange(sanitizeInput(e.target.value))
          }}
          maxLength={inputRules.urlMaxLength}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
          disabled={uploading}
        />
      </div>
    </div>
  )
}
