import { get, post, put, del, patch } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

export interface Article {
  id?: number;
  title: string;
  content?: string;
  summary?: string;
  category_id?: number;
  category_name?: string;
  cover?: string;
  author?: string;
  status?: 'draft' | 'published' | 'archived';
  recommended?: boolean;
  views?: number;
  likes?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface ArticleListParams {
  page?: number;
  limit?: number;
  status?: string;
  recommended?: boolean;
  categoryId?: number;
  [key: string]: unknown;
}

export interface ArticleListResponse {
  articles?: Article[];
  total?: number;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

/**
 * 文章相关 API
 */
export const articleApi = {
  /**
   * 获取文章列表
   * @param params - 查询参数 { page, limit, status, recommended, categoryId 等 }
   */
  getList: (params: ArticleListParams) => get<ArticleListResponse>(API_ENDPOINTS.ARTICLES, params),

  /**
   * 获取文章详情
   * @param id - 文章 ID
   */
  getDetail: (id: number) => get<Article>(API_ENDPOINTS.ARTICLE_DETAIL, { id }),

  /**
   * 创建文章
   * @param data - 文章数据
   */
  create: (data: Partial<Article>) => post<{ id?: number }>(API_ENDPOINTS.CREATE_ARTICLE, data),

  /**
   * 更新文章
   * @param data - 文章数据
   */
  update: (data: Partial<Article> & { id?: number }) => put<{ success?: boolean }>(API_ENDPOINTS.UPDATE_ARTICLE, data),

  /**
   * 删除文章
   * @param id - 文章 ID
   */
  delete: (id: number) => del(API_ENDPOINTS.DELETE_ARTICLE, {}, { params: { id } }),

  /**
   * 切换文章状态
   * @param data - { id, status }
   */
  toggleStatus: (data: { id: number; status: string }) => patch(API_ENDPOINTS.TOGGLE_ARTICLE_STATUS, data),

  /**
   * 更新文章推荐状态
   * @param data - { id, recommended, recommend_order? }
   */
  updateRecommend: (data: { id: number; recommended: boolean; recommend_order?: number }) => post(API_ENDPOINTS.UPDATE_ARTICLE_RECOMMEND, data),

  /**
   * 检查用户是否已点赞
   * @param params - { article_id, visitor_id }
   */
  checkLikeStatus: (params: { article_id: number; visitor_id: string }) => get(API_ENDPOINTS.LIKE_ARTICLE, params),

  /**
   * 点赞文章
   * @param data - { article_id, visitor_id }
   */
  like: (data: { article_id: number; visitor_id: string }) => post(API_ENDPOINTS.LIKE_ARTICLE, data),

  /**
   * 取消点赞
   * @param params - { article_id, visitor_id }
   */
  unlike: (params: { article_id: number; visitor_id: string }) => del(API_ENDPOINTS.LIKE_ARTICLE, params),
};
