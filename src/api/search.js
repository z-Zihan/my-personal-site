import { get } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

/**
 * 搜索 API
 */
export const searchApi = {
  /**
   * 搜索文章
   * @param {string} keyword - 搜索关键词
   * @returns {Promise} 搜索结果
   */
  search: (keyword) => get(API_ENDPOINTS.SEARCH, { q: keyword }),
};
