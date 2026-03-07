import { get, post, del } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

export interface Message {
  id?: number;
  content: string;
  author?: string;
  contact?: string;
  created_at?: string;
  [key: string]: unknown;
}

/**
 * 留言相关 API
 */
export const messageApi = {
  /**
   * 获取留言列表
   */
  getList: () => get<Message[]>(API_ENDPOINTS.MESSAGES),

  /**
   * 创建留言
   * @param data - 留言数据
   */
  create: (data: Partial<Message>) => post<Message>(API_ENDPOINTS.CREATE_MESSAGE, data),

  /**
   * 删除留言
   * @param id - 留言 ID
   */
  delete: (id: number) => del(`/api/delete-message?id=${id}`),
};
