import { get, post, put, del, patch } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

/**
 * 文章相关 API
 */
export const articleApi = {
  /**
   * 获取文章列表
   * @param {object} params - 查询参数 { page, limit, status, recommended, categoryId 等 }
   */
  getList: (params) => get(API_ENDPOINTS.ARTICLES, params),

  /**
   * 获取文章详情
   * @param {number} id - 文章 ID
   */
  getDetail: (id) => get(API_ENDPOINTS.ARTICLE_DETAIL, { id }),

  /**
   * 创建文章
   * @param {object} data - 文章数据
   */
  create: (data) => post(API_ENDPOINTS.CREATE_ARTICLE, data),

  /**
   * 更新文章
   * @param {object} data - 文章数据
   */
  update: (data) => put(API_ENDPOINTS.UPDATE_ARTICLE, data),

  /**
   * 删除文章
   * @param {number} id - 文章 ID
   */
  delete: (id) => del(API_ENDPOINTS.DELETE_ARTICLE, {}, { params: { id } }),

  /**
   * 切换文章状态
   * @param {object} data - { id, status }
   */
  toggleStatus: (data) => patch(API_ENDPOINTS.TOGGLE_ARTICLE_STATUS, data),

  /**
   * 更新文章推荐状态
   * @param {object} data - { id, recommended }
   */
  updateRecommend: (data) => post(API_ENDPOINTS.UPDATE_ARTICLE_RECOMMEND, data),

  /**
   * 检查用户是否已点赞
   * @param {object} params - { article_id, visitor_id }
   */
  checkLikeStatus: (params) => get(API_ENDPOINTS.LIKE_ARTICLE, params),

  /**
   * 取消点赞
   * @param {object} params - { article_id, visitor_id }
   */
  deleteLike: (params) => del(API_ENDPOINTS.LIKE_ARTICLE, params),
};

/**
 * 点赞文章
 * @param {object} data - { article_id, visitor_id }
 */
export const likeArticle = (data) => post(API_ENDPOINTS.LIKE_ARTICLE, data);

/**
 * 取消点赞
 * @param {object} params - { article_id, visitor_id }
 */
export const unlikeArticle = (params) => del(API_ENDPOINTS.LIKE_ARTICLE, params);
