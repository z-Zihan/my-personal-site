import { get } from '../utils/request';

/**
 * 热点资讯 API
 */
export const hotNewsApi = {
  /**
   * 获取热点列表
   */
  getList: () => get('/api/hot-news'),
};
