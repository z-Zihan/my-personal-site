import { get, post, del } from '../utils/request';

/**
 * 评论相关 API
 */
export const commentApi = {
  /**
   * 获取评论列表
   * @param {object} params - 查询参数
   */
  getList: (params) => get('/api/comments', params),

  /**
   * 创建评论
   * @param {object} data - 评论数据
   */
  create: (data) => post('/api/create-comment', data),

  /**
   * 删除评论
   * @param {number} id - 评论 ID
   */
  delete: (id) => del('/api/delete-comment', { id }),
};
