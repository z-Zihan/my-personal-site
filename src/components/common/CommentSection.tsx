import React, { useRef, useState, useEffect } from 'react'
import { commentApi } from '../../api/comment'
import { toast } from '../../utils/toast'
import Avatar from './Avatar'
import { cleanUserInput, inputRules } from '../../utils/sanitize'
import useVisitorStore from '../../store/visitorStore'
import { trackEvent } from '../../utils/analytics'

interface Comment {
  id: number
  article_id: string
  visitor_id: string
  visitor_name?: string
  content: string
  location?: string
  created_at: string
  [key: string]: unknown
}

interface CommentSectionProps {
  articleId: string
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const { getVisitorId, getVisitorName, initVisitor } = useVisitorStore()
  const [visitorId, setVisitorId] = useState('')
  const [visitorName, setVisitorName] = useState('')

  useEffect(() => {
    // 初始化访客信息
    const vid = initVisitor()
    setVisitorId(vid)
    setVisitorName(getVisitorName() || '')
    fetchComments()
  }, [articleId])

  const fetchComments = async () => {
    try {
      const res = await commentApi.getList({ article_id: articleId })
      const commentData = res as unknown as { comments?: Comment[] }
      setComments(commentData.comments || [])
    } catch (error) {
      // 错误由全局错误边界处理
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    // 验证输入长度
    if (newComment.length > inputRules.commentMaxLength) {
      toast.error(`评论长度不能超过 ${inputRules.commentMaxLength} 个字符`)
      return
    }

    // 验证输入安全性
    if (!newComment.trim()) {
      toast.error('请输入评论内容')
      return
    }

    setLoading(true)
    try {
      // 获取地理位置
      const location = await Promise.race([
        fetch('https://ipapi.co/json/')
          .then((res) => res.json())
          .then((data) => {
            if (data && !data.error) {
              return (`${data.city || ''} ${data.country_name || ''}`.trim() || '未知') as string
            }
            return '未知'
          })
          .catch(() => '未知'),
        new Promise((resolve) => setTimeout(() => resolve('未知'), 3000)),
      ])

      // 清理输入内容，防止 XSS 攻击
      const cleanedComment = cleanUserInput(newComment)

      await commentApi.create({
        article_id: articleId,
        visitor_id: visitorId,
        content: cleanedComment,
        visitor_name: visitorName || undefined,
        location: location || undefined,
      })
      // 评论埋点
      trackEvent('comment_submit', 'engagement', {
        article_id: articleId,
        page_path: window.location.pathname,
      })
      setNewComment('')
      fetchComments()
      toast.success('评论成功')
    } catch (error) {
      toast.error('评论失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const getAvatar = (id: string) => {
    const avatars = ['🐱', '🐶', '🦊', '🦁', '🐯', '🐼', '🐨', '🐸']
    let hash = 0
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i)
      hash = hash & hash
    }
    return avatars[Math.abs(hash) % avatars.length]
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">评论 ({comments.length})</h3>

      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="写下你的评论..."
          rows={4}
          maxLength={inputRules.commentMaxLength}
          data-max-length={inputRules.commentMaxLength}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-500">
            {newComment.length}/{inputRules.commentMaxLength} 字
          </span>
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? '提交中...' : '发表评论'}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Avatar userId={comment.visitor_id} size={40} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {comment.visitor_name || `访客 ${comment.visitor_id?.slice(-6)}`}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    })}
                  </span>
                  {comment.location && (
                    <span className="text-xs text-gray-500">📍 {comment.location}</span>
                  )}
                </div>
                <p className="text-gray-900 dark:text-white">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}