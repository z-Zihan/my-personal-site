import { create } from 'zustand'

const useVisitorStore = create((set) => ({
  visitorId: null,

  initVisitor: () => {
    let visitorId = localStorage.getItem('visitor_id')
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      localStorage.setItem('visitor_id', visitorId)
    }
    set({ visitorId })
    return visitorId
  },

  getVisitorId: () => {
    return localStorage.getItem('visitor_id')
  },
}))

export default useVisitorStore
