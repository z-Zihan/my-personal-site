import { useEffect, useState } from 'react'
import { messageApi, Message as MessageType } from '../api/index'

export interface Message {
  id?: number
  content: string
  author?: string
  email?: string
  created_at?: string
  [key: string]: unknown
}

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await messageApi.getList()
      const messagesData = data as unknown as MessageType[]
      setMessages(messagesData.map(item => ({
        ...item,
        id: item.id || 0,
        content: item.content || '',
      })) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  return { messages, loading, error, refetch: fetchMessages }
}
