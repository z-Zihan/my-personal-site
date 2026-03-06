import { get, post } from '../utils/request';

/**
 * 搜索 API
 */
export const searchApi = {
  /**
   * 搜索文章
   * @param {string} keyword - 搜索关键词
   */
  search: (keyword) => get('/api/search', { q: keyword }),
};
