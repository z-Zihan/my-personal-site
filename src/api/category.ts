import { get, post, put, del } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

export interface Category {
  id?: number;
  name: string;
  slug?: string;
  color?: string;
  description?: string;
  created_at?: string;
  [key: string]: unknown;
}

/**
 * 分类相关 API
 */
export const categoryApi = {
  /**
   * 获取分类列表
   */
  getList: () => get<Category[]>(API_ENDPOINTS.CATEGORIES, {}, { skipAuth: true }),

  /**
   * 创建分类
   * @param data - 分类数据
   */
  create: (data: Partial<Category>) => post<Category>(API_ENDPOINTS.CATEGORIES, data),

  /**
   * 更新分类
   * @param data - 分类数据
   */
  update: (data: Partial<Category> & { id?: number }) => put<Category>(API_ENDPOINTS.CATEGORIES, data),

  /**
   * 删除分类
   * @param id - 分类 ID
   */
  delete: (id: number) => del(API_ENDPOINTS.CATEGORIES, { params: { id } }),
};
