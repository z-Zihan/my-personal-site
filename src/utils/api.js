import axios from 'axios'

const API_BASE = '/api'
const isDev = import.meta.env.DEV

// 开发模式 Mock API（连接真实数据库）
const mockApi = {
  // 搜索 API
  search: async (q) => {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
    return await res.json()
  },
  
  // 文章列表
  articles: {
    getList: async (params) => {
      const query = new URLSearchParams(params).toString()
      const res = await fetch(`/api/articles?${query}`)
      return await res.json()
    }
  },
  
  // 留言
  messages: {
    getList: async () => {
      const res = await fetch('/api/messages')
      return await res.json()
    },
    create: async (data) => {
      const res = await fetch('/api/create-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return await res.json()
    }
  },
  
  // 热点资讯 - 调用真实 API
  hotNews: {
    getList: async () => {
      const res = await fetch('/api/hot-news')
      return await res.json()
    }
  },
  
  // 统计
  stats: {
    getStats: async () => {
      const res = await fetch('/api/stats')
      return await res.json()
    }
  },
  
  // 登录
  login: async (data) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const json = await res.json()
    if (!res.ok) throw json
    return { data: json }
  }
}

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 自动添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 文章相关 API
export const articlesApi = {
  getList: (params) => isDev ? mockApi.articles.getList(params) : api.get('/articles', { params }),
  getDetail: (id) => isDev ? Promise.resolve({ data: { data: {} } }) : api.get('/article-detail', { params: { id } }),
  create: (data) => isDev ? Promise.resolve({ data: { success: true } }) : api.post('/create-article', data),
  update: (data) => isDev ? Promise.resolve({ data: { success: true } }) : api.put('/update-article', data),
  delete: (id) => isDev ? Promise.resolve({ data: { success: true } }) : api.delete('/delete-article', { params: { id } }),
  toggleStatus: (data) => isDev ? Promise.resolve({ data: { success: true } }) : api.patch('/toggle-article-status', data),
}

// 留言相关 API
export const messagesApi = {
  getList: () => isDev ? mockApi.messages.getList() : api.get('/messages'),
  create: (data) => isDev ? mockApi.messages.create(data) : api.post('/create-message', data),
  delete: (id) => isDev ? Promise.resolve({ data: { success: true } }) : api.delete('/delete-message', { params: { id } }),
}

// 热点资讯 API
export const hotNewsApi = {
  getList: () => isDev ? mockApi.hotNews.getList() : api.get('/hot-news'),
}

// 统计 API
export const statsApi = {
  getStats: () => isDev ? mockApi.stats.getStats() : api.get('/stats'),
}

// 搜索 API
export const searchApi = {
  search: (q) => isDev ? mockApi.search(q) : api.get('/search', { params: { q } }),
}

// 登录 API
export const authApi = isDev ? mockApi : {
  login: (data) => api.post('/login', data),
}

export default api
