import { get } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

export interface Stats {
  totalArticles?: number;
  totalComments?: number;
  totalMessages?: number;
  totalViews?: number;
  [key: string]: unknown;
}

/**
 * 统计 API
 */
export const statsApi = {
  /**
   * 获取统计数据
   */
  getStats: () => get<Stats>(API_ENDPOINTS.STATS),
};
