// API 基础配置
export const API_BASE = 'https://zzihanaini.vercel.app';

// API 端点常量
export const API_ENDPOINTS = {
  // 文章相关
  ARTICLES: '/api/articles',
  ARTICLE_DETAIL: '/api/article-detail',
  HOT_NEWS: '/api/hot-news',
  SEARCH: '/api/search',

  // 评论相关
  COMMENTS: '/api/comments',
  CREATE_COMMENT: '/api/create-comment',
  DELETE_COMMENT: '/api/delete-comment',

  // 点赞相关
  LIKE_ARTICLE: '/api/like-article',

  // 统计相关
  STATS: '/api/stats',
  ANALYTICS: '/api/analytics',

  // 上传相关
  UPLOAD_IMAGE: '/api/upload-image',

  // 消息相关
  CREATE_MESSAGE: '/api/create-message',
};

export default {
  API_BASE,
  API_ENDPOINTS,
};
