import axios from 'axios'

const api = axios.create({
  baseURL: 'https://zzihanaini.vercel.app/api',
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
  getList: (params) => api.get('/articles', { params }),
  getDetail: (id) => api.get('/article-detail', { params: { id } }),
  create: (data) => api.post('/create-article', data),
  update: (data) => api.put('/update-article', data),
  delete: (id) => api.delete('/delete-article', { params: { id } }),
  toggleStatus: (data) => api.patch('/toggle-article-status', data),
}

// 留言相关 API
export const messagesApi = {
  getList: () => api.get('/messages'),
  create: (data) => api.post('/create-message', data),
  delete: (id) => api.delete('/delete-message', { params: { id } }),
}

// 热点资讯 API
export const hotNewsApi = {
  getList: () => api.get('/hot-news'),
}

// 统计 API
export const statsApi = {
  getStats: () => api.get('/stats'),
}

// 搜索 API
export const searchApi = {
  search: (q) => api.get('/search', { params: { q } }),
}

// 登录 API
export const authApi = {
  login: (data) => api.post('/login', data),
}

// 评论相关 API
export const commentsApi = {
  getList: (params) => api.get('/comments', { params }),
  delete: (id) => api.delete('/delete-comment', { params: { id } }),
}

export default api
