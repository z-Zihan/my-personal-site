import { get } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

export interface SearchResult {
  id?: number;
  title?: string;
  content?: string;
  [key: string]: unknown;
}

/**
 * 搜索 API
 */
export const searchApi = {
  /**
   * 搜索文章
   * @param keyword - 搜索关键词
   * @returns 搜索结果
   */
  search: (keyword: string) => get<SearchResult[]>(API_ENDPOINTS.SEARCH, { q: keyword }),
};
