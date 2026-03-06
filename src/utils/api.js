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
  updateRecommend: (data) => api.post('/update-article-recommend', data),
}

// 留言相关 API
export const messagesApi = {
  getList: () => api.get('/messages'),
  create: (data) => api.post('/create-message', data),
  delete: (id) => api.delete('/delete-message', { params: { id } }),
  batchDelete: (ids) => api.post('/batch-delete-message', { ids }),
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

// 分类相关 API
export const categoriesApi = {
  getList: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (data) => api.put('/categories', data),
  delete: (id) => api.delete('/categories', { params: { id } }),
}

// 图片上传 API
export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

export default api
