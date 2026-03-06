import { get, post, put, del, patch } from '../utils/request';

/**
 * 文章相关 API
 */
export const articleApi = {
  /**
   * 获取文章列表
   * @param {object} params - 查询参数 { page, limit, status, recommended, categoryId 等 }
   */
  getList: (params) => get('/api/articles', params),

  /**
   * 获取文章详情
   * @param {number} id - 文章 ID
   */
  getDetail: (id) => get('/api/article-detail', { id }),

  /**
   * 创建文章
   * @param {object} data - 文章数据
   */
  create: (data) => post('/api/create-article', data),

  /**
   * 更新文章
   * @param {object} data - 文章数据
   */
  update: (data) => put('/api/update-article', data),

  /**
   * 删除文章
   * @param {number} id - 文章 ID
   */
  delete: (id) => del('/api/delete-article', { id }),

  /**
   * 切换文章状态
   * @param {object} data - { id, status }
   */
  toggleStatus: (data) => patch('/api/toggle-article-status', data),

  /**
   * 更新文章推荐状态
   * @param {object} data - { id, recommended }
   */
  updateRecommend: (data) => post('/api/update-article-recommend', data),

  /**
   * 检查用户是否已点赞
   * @param {object} params - { article_id, visitor_id }
   */
  checkLikeStatus: (params) => get('/api/like-article', params),
};

/**
 * 点赞文章
 * @param {object} data - { article_id, visitor_id }
 */
export const likeArticle = (data) => post('/api/like-article', data);

/**
 * 取消点赞
 * @param {object} params - { article_id, visitor_id }
 */
export const unlikeArticle = (params) => del('/api/like-article', params);
