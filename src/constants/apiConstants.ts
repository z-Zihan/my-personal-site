// API 基础配置
// 使用环境变量，允许在不同环境中自定义 API 地址
// 如果没有配置环境变量，则使用默认值
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://zzihanaini.vercel.app';

// API 端点常量
export const API_ENDPOINTS = {
  // 文章相关
  ARTICLES: '/api/articles',
  ARTICLE_DETAIL: '/api/article-detail',
  HOT_NEWS: '/api/hot-news',
  SEARCH: '/api/search',
  MESSAGES: '/api/messages',
  LIKE_ARTICLE: '/api/like-article',
  CATEGORIES: '/api/categories',
  CREATE_ARTICLE: '/api/create-article',
  UPDATE_ARTICLE: '/api/update-article',
  DELETE_ARTICLE: '/api/delete-article',
  TOGGLE_ARTICLE_STATUS: '/api/toggle-article-status',
  UPDATE_ARTICLE_RECOMMEND: '/api/update-article-recommend',

  // 评论相关
  COMMENTS: '/api/comments',
  CREATE_COMMENT: '/api/create-comment',
  DELETE_COMMENT: '/api/delete-comment',

  // 点赞相关

  // 统计相关
  STATS: '/api/stats',
  ANALYTICS: '/api/analytics',

  // 上传相关
  UPLOAD_IMAGE: '/api/upload-image',

  // 消息相关
  CREATE_MESSAGE: '/api/create-message',
  DELETE_MESSAGE: '/api/delete-message',
  BATCH_DELETE_MESSAGE: '/api/batch-delete-message',
  UPDATE_MESSAGE: '/api/update-message',
  LIKE_MESSAGE: '/api/like-message',

  // 认证相关
  LOGIN: '/api/login',

  // 性能监控
  PERF_METRICS: '/api/perf-metrics',

  // 热点资讯管理相关
  CREATE_HOT_NEWS: '/api/create-hot-news',
  UPDATE_HOT_NEWS: '/api/update-hot-news',
  DELETE_HOT_NEWS: '/api/delete-hot-news',
  // 其他
  BATCH_DELETE_COMMENT: '/api/batch-delete-comment',
} as const;

export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];

export default {
  API_BASE,
  API_ENDPOINTS,
};
