import { get } from '../utils/request';

/**
 * 统计 API
 */
export const statsApi = {
  /**
   * 获取统计数据
   */
  getStats: () => get('/api/stats'),
};
