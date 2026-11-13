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

export interface MessageListParams {
  page?: number;
  pageSize?: number;
  sort?: 'time' | 'hot' | 'random';
  seed?: number;
}

export interface MessageListResponse {
  data: Message[];
  total: number;
  hasMore: boolean;
}

/**
 * 留言相关 API
 */
export const messageApi = {
  /**
   * 获取留言列表（服务端分页+排序）
   */
  getList: (params: MessageListParams = {}) =>
    get<MessageListResponse>(API_ENDPOINTS.MESSAGES, {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      sort: params.sort ?? 'time',
      ...(params.seed !== undefined ? { seed: params.seed } : {}),
    }),

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
   * 更新留言(后台系统留言编辑用)
   * @param data - { id, content?, visitor_name?, location?, likes?, created_at? }
   */
  update: (data: { id: string } & Record<string, unknown>) => post(API_ENDPOINTS.UPDATE_MESSAGE, data),

  /**
   * 系统留言列表(origin=system,与前台隔离)
   */
  getSystemList: (params: { page?: number; pageSize?: number } = {}) =>
    get<MessageListResponse>(API_ENDPOINTS.MESSAGES, {
      origin: 'system',
      sort: 'time',
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 15,
    }),

  /**
   * 点赞/取消点赞留言
   * @param messageId - 留言 ID
   */
  toggleLike: (messageId: string, visitorId?: string) =>
    post(API_ENDPOINTS.LIKE_MESSAGE, { messageId, visitorId }),
};