import { get, post, del } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

/**
 * 评论相关 API
 */
export const commentApi = {
  /**
   * 获取评论列表
   * @param {object} params - 查询参数
   */
  getList: (params) => get(API_ENDPOINTS.COMMENTS, params),

  /**
   * 创建评论
   * @param {object} data - 评论数据
   */
  create: (data) => post(API_ENDPOINTS.CREATE_COMMENT, data),

  /**
   * 删除评论
   * @param {number} id - 评论 ID
   */
  delete: (id) => del(API_ENDPOINTS.DELETE_COMMENT, {}, { params: { id } }),

  /**
   * 批量删除评论
   * @param {array} ids - 评论 ID 数组
   */
  batchDelete: (ids) => post(API_ENDPOINTS.BATCH_DELETE_COMMENT, { ids }),
};
