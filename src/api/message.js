import { get, post, del } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

/**
 * 留言相关 API
 */
export const messageApi = {
  /**
   * 获取留言列表
   */
  getList: () => get(API_ENDPOINTS.MESSAGES),

  /**
   * 创建留言
   * @param {object} data - 留言数据
   */
  create: (data) => post(API_ENDPOINTS.CREATE_MESSAGE, data),

  /**
   * 删除留言
   * @param {number} id - 留言 ID
   */
  delete: (id) => del(`/api/delete-message?id=${id}`),
};
