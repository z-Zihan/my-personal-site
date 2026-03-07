import { create } from 'zustand'

interface VisitorState {
  visitorId: string | null
  visitorName: string | null
  initVisitor: () => string
  getVisitorId: () => string | null
  getVisitorName: () => string | null
  updateVisitorName: (name: string) => void
}

const useVisitorStore = create<VisitorState>((set, get) => ({
  visitorId: null,
  visitorName: null,

  initVisitor: () => {
    let visitorId = localStorage.getItem('visitor_id')
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      localStorage.setItem('visitor_id', visitorId)
    }
    const visitorName = localStorage.getItem('userName') || null
    set({ visitorId, visitorName })
    return visitorId
  },

  getVisitorId: () => {
    return localStorage.getItem('visitor_id')
  },

  getVisitorName: () => {
    return localStorage.getItem('userName')
  },

  updateVisitorName: (name) => {
    localStorage.setItem('userName', name)
    set({ visitorName: name })
  },
}))

export default useVisitorStore
