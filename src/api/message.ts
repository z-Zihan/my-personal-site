import { get, post, del } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

export interface Message {
  id?: number;
  content: string;
  author?: string;
  contact?: string;
  likes?: number;
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
  getList: (limit?: number) =>
    get<Message[]>(API_ENDPOINTS.MESSAGES, limit ? { limit } : {}),

  /**
   * 创建留言
   * @param data - 留言数据
   */
  create: (data: Partial<Message>) => post<Message>(API_ENDPOINTS.CREATE_MESSAGE, data),

  /**
   * 删除留言
   * @param id - 留言 ID
   */
  delete: (id: number) => del(API_ENDPOINTS.DELETE_MESSAGE, {}, { params: { id } }),

  /**
   * 批量删除留言
   * @param ids - 留言 ID 数组
   */
  batchDelete: (ids: number[]) => post(API_ENDPOINTS.BATCH_DELETE_MESSAGE, { ids }),

  /**
   * 点赞/取消点赞留言
   * @param messageId - 留言 ID
   */
  toggleLike: (messageId: string, visitorId?: string) =>
    post(API_ENDPOINTS.LIKE_MESSAGE, { messageId, visitorId }),
};