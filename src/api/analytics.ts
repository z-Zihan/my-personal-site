import { get } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

export interface AnalyticsOverview {
  totalViews?: number;
  totalVisitors?: number;
  [key: string]: unknown;
}

export interface AnalyticsDaily {
  date?: string;
  views?: number;
  visitors?: number;
  [key: string]: unknown;
}

export interface AnalyticsPage {
  path?: string;
  views?: number;
  [key: string]: unknown;
}

export interface AnalyticsDevice {
  device?: string;
  count?: number;
  [key: string]: unknown;
}

export interface AnalyticsBrowser {
  browser?: string;
  count?: number;
  [key: string]: unknown;
}

export interface AnalyticsCountry {
  country?: string;
  count?: number;
  [key: string]: unknown;
}

export interface AnalyticsEvent {
  event_name: string;
  count?: number;
  [key: string]: unknown;
}

type AnalyticsType = 'overview' | 'daily' | 'pages' | 'devices' | 'browsers' | 'countries' | 'events' | 'event_detail';

/**
 * 数据分析 API
 */
export const analyticsApi = {
  /**
   * 获取概览数据
   */
  getOverview: () => get<AnalyticsOverview>(API_ENDPOINTS.ANALYTICS, { type: 'overview' as AnalyticsType }),

  /**
   * 获取每日统计数据
   * @param days - 天数
   */
  getDaily: (days = 7) => get<AnalyticsDaily[]>(API_ENDPOINTS.ANALYTICS, { type: 'daily' as AnalyticsType, days }),

  /**
   * 获取页面访问数据
   * @param days - 天数
   */
  getPages: (days = 7) => get<AnalyticsPage[]>(API_ENDPOINTS.ANALYTICS, { type: 'pages' as AnalyticsType, days }),

  /**
   * 获取设备分布数据
   * @param days - 天数
   */
  getDevices: (days = 7) => get<AnalyticsDevice[]>(API_ENDPOINTS.ANALYTICS, { type: 'devices' as AnalyticsType, days }),

  /**
   * 获取浏览器分布数据
   * @param days - 天数
   */
  getBrowsers: (days = 7) => get<AnalyticsBrowser[]>(API_ENDPOINTS.ANALYTICS, { type: 'browsers' as AnalyticsType, days }),

  /**
   * 获取地域分布数据
   * @param days - 天数
   */
  getCountries: (days = 30) => get<AnalyticsCountry[]>(API_ENDPOINTS.ANALYTICS, { type: 'countries' as AnalyticsType, days }),

  /**
   * 获取事件统计数据
   * @param days - 天数
   */
  getEvents: (days = 7) => get<AnalyticsEvent[]>(API_ENDPOINTS.ANALYTICS, { type: 'events' as AnalyticsType, days }),

  /**
   * 获取事件详情数据
   * @param eventName - 事件名称
   * @param days - 天数
   */
  getEventDetail: (eventName: string, days = 7) => get<{
    dailyTrend: Array<{ date: string; count: number }>;
    devices: Array<{ name: string; value: number }>;
    browsers: Array<{ name: string; value: number }>;
    countries: Array<{ name: string; value: number }>;
    pagePaths: Array<{ path: string; count: number }>;
    paramDistributions: Array<{
      paramName: string;
      values: Array<{ value: string; count: number }>;
    }>;
    recentEvents: Array<{
      id: number;
      visitor_id: string;
      page_path: string;
      created_at: string;
      event_data: Record<string, unknown>;
    }>;
  }>(API_ENDPOINTS.ANALYTICS, { type: 'event_detail' as AnalyticsType, event_name: eventName, days }),
};
