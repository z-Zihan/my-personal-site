import { get, post, put, del } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

export interface HotNews {
  /** 注意：数据库里是 UUID 字符串，但前台 useHotNews hook 将 id 归一为 number，此处保持 number 兼容 */
  id?: number | string;
  title?: string;
  url?: string;
  link?: string;
  source?: string;
  heat?: number;
  created_at?: string;
  [key: string]: unknown;
}

export interface HotNewsPayload {
  title: string;
  link: string;
  source?: string;
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

  /**
   * 创建热点资讯（管理员）
   */
  create: (data: HotNewsPayload) => post<HotNews>(API_ENDPOINTS.CREATE_HOT_NEWS, data),

  /**
   * 更新热点资讯（管理员）
   */
  update: (data: HotNewsPayload & { id: string }) =>
    put<HotNews>(API_ENDPOINTS.UPDATE_HOT_NEWS, data),

  /**
   * 删除热点资讯（管理员）
   */
  delete: (id: string) => del(API_ENDPOINTS.DELETE_HOT_NEWS, {}, { params: { id } }),
};
