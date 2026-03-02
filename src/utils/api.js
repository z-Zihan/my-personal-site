import axios from 'axios'

const API_BASE = '/api'
const isDev = import.meta.env.DEV

// 开发模式 Mock API
const mockApi = {
  login: async (data) => {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 简单的验证
    if (data.username === 'admin' && data.password === 'Admin@2026Secure') {
      return {
        data: {
          data: {
            token: 'dev_token_' + Date.now(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            user: { username: 'admin' }
          }
        }
      }
    }
    throw { response: { data: { error: 'Invalid credentials' } } }
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
  getList: (params) => isDev ? Promise.resolve({ data: { data: [] } }) : api.get('/articles', { params }),
  getDetail: (id) => isDev ? Promise.resolve({ data: { data: {} } }) : api.get('/article-detail', { params: { id } }),
  create: (data) => isDev ? Promise.resolve({ data: { success: true } }) : api.post('/create-article', data),
  update: (data) => isDev ? Promise.resolve({ data: { success: true } }) : api.put('/update-article', data),
  delete: (id) => isDev ? Promise.resolve({ data: { success: true } }) : api.delete('/delete-article', { params: { id } }),
  toggleStatus: (data) => isDev ? Promise.resolve({ data: { success: true } }) : api.patch('/toggle-article-status', data),
}

// 留言相关 API
export const messagesApi = {
  getList: () => isDev ? Promise.resolve({ data: { data: [] } }) : api.get('/messages'),
  create: (data) => isDev ? Promise.resolve({ data: { success: true } }) : api.post('/create-message', data),
  delete: (id) => isDev ? Promise.resolve({ data: { success: true } }) : api.delete('/delete-message', { params: { id } }),
}

// 热点资讯 API
export const hotNewsApi = {
  getList: () => isDev ? Promise.resolve({ data: { data: [] } }) : api.get('/hot-news'),
}

// 统计 API
export const statsApi = {
  getStats: () => isDev ? Promise.resolve({ data: { data: { views: 0, articles: 0 } } }) : api.get('/stats'),
}

// 登录 API
export const authApi = isDev ? mockApi : {
  login: (data) => api.post('/login', data),
}

export default api
