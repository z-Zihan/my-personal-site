import { useEffect, useState } from 'react'
import { messagesApi } from '../utils/api'

export function useMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMessages = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await messagesApi.getList()
      setMessages(data.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  return { messages, loading, error, refetch: fetchMessages }
}
