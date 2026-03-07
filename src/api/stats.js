import { get } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

/**
 * 统计 API
 */
export const statsApi = {
  /**
   * 获取统计数据
   */
  getStats: () => get(API_ENDPOINTS.STATS),
};
