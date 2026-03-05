import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { messagesApi } from '../utils/api'
import { toast } from '../utils/toast'
import useVisitorStore from '../store/visitorStore'
import { formatDate } from '../utils/helpers'
import Avatar from '../components/common/Avatar'

function MessageBoard() {
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { visitorId, initVisitor, getVisitorName } = useVisitorStore()

  useEffect(() => {
    initVisitor()
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const { data } = await messagesApi.getList()
      setMessages(data.data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)
    try {
      const visitorName = getVisitorName()
      await messagesApi.create({
        visitor_id: visitorId,
        content,
        visitor_name: visitorName || undefined
      })
      setContent('')
      fetchMessages()
      toast.success('留言成功')
    } catch (error) {
      toast.error('留言失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-center mb-12 neon-text"
        >
          留言板
        </motion.h1>

        {/* 留言列表 - 移到上方 */}
        <div className="space-y-4 mb-12">
          <h2 className="text-2xl font-bold mb-6">所有留言</h2>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="glass p-6 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-400">暂无留言，快来抢沙发吧！</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass p-6 rounded-xl neon-border"
              >
                <div className="flex items-start gap-4">
                  <Avatar userId={message.visitor_id} size={40} />
                  <div className="flex-1">
                    <p className="text-gray-300 mb-2">{message.content}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="font-medium text-gray-400">{message.visitor_name || `访客 ${message.visitor_id?.slice(-6)}`}</span>
                      <span>•</span>
                      <span>{formatDate(message.created_at)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* 留言表单 - 移到下方 */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="glass p-6 rounded-2xl neon-border"
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的留言..."
            rows={4}
            className="w-full bg-transparent border border-gray-700 rounded-lg p-4 focus:border-primary focus:outline-none resize-none"
            disabled={submitting}
          />
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-8 py-3 bg-primary text-dark font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary hover:text-white transition-all"
            >
              {submitting ? '提交中...' : '提交留言'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  )
}

export default MessageBoard
