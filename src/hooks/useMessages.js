import { useEffect, useState } from 'react'
import { messageApi } from '../api/index'

export function useMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMessages = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await messageApi.getList()
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
