import { get, post, del } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

export interface Comment {
  id?: number;
  article_id?: string;
  content: string;
  author?: string;
  email?: string;
  parent_id?: number;
  status?: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  [key: string]: unknown;
}

export interface CommentListParams {
  page?: number;
  limit?: number;
  article_id?: string;
  status?: string;
  [key: string]: unknown;
}

export interface CommentListResponse extends Array<Comment> {
  data?: Comment[];
  total?: number;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

/**
 * 评论相关 API
 */
export const commentApi = {
  /**
   * 获取评论列表
   * @param params - 查询参数
   */
  getList: (params: CommentListParams) => get<CommentListResponse>(API_ENDPOINTS.COMMENTS, params),

  /**
   * 创建评论
   * @param data - 评论数据
   */
  create: (data: Partial<Comment>) => post<{ id?: number }>(API_ENDPOINTS.CREATE_COMMENT, data),

  /**
   * 删除评论
   * @param id - 评论 ID
   */
  delete: (id: number) => del(API_ENDPOINTS.DELETE_COMMENT, {}, { params: { id } }),

  /**
   * 批量删除评论
   * @param ids - 评论 ID 数组
   */
  batchDelete: (ids: number[]) => post(API_ENDPOINTS.BATCH_DELETE_COMMENT, { ids }),
};
