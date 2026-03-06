import { get, post, put, del } from '../utils/request';

/**
 * 分类相关 API
 */
export const categoryApi = {
  /**
   * 获取分类列表
   */
  getList: () => get('/api/categories'),

  /**
   * 创建分类
   * @param {object} data - 分类数据
   */
  create: (data) => post('/api/categories', data),

  /**
   * 更新分类
   * @param {object} data - 分类数据
   */
  update: (data) => put('/api/categories', data),

  /**
   * 删除分类
   * @param {number} id - 分类 ID
   */
  delete: (id) => del('/api/categories', {}, { params: { id } }),
};
