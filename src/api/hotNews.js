import { get } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

/**
 * 热点资讯 API
 */
export const hotNewsApi = {
  /**
   * 获取热点列表
   */
  getList: () => get(API_ENDPOINTS.HOT_NEWS),
};
