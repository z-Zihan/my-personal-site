import { get } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

export interface HotNews {
  id?: number;
  title?: string;
  url?: string;
  source?: string;
  heat?: number;
  [key: string]: unknown;
}

/**
 * 热点资讯 API
 */
export const hotNewsApi = {
  /**
   * 获取热点列表
   */
  getList: () => get<HotNews[]>(API_ENDPOINTS.HOT_NEWS),
};
