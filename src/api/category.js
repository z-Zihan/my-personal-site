import { get, post, put, del } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

/**
 * 分类相关 API
 */
export const categoryApi = {
  /**
   * 获取分类列表
   */
  getList: () => get(API_ENDPOINTS.CATEGORIES),

  /**
   * 创建分类
   * @param {object} data - 分类数据
   */
  create: (data) => post(API_ENDPOINTS.CATEGORIES, data),

  /**
   * 更新分类
   * @param {object} data - 分类数据
   */
  update: (data) => put(API_ENDPOINTS.CATEGORIES, data),

  /**
   * 删除分类
   * @param {number} id - 分类 ID
   */
  delete: (id) => del(API_ENDPOINTS.CATEGORIES, {}, { params: { id } }),
};
