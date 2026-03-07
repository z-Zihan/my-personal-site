import { get } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

/**
 * 数据分析 API
 */
export const analyticsApi = {
  /**
   * 获取概览数据
   */
  getOverview: () => get(API_ENDPOINTS.ANALYTICS, { type: 'overview' }),

  /**
   * 获取每日统计数据
   * @param {number} days - 天数
   */
  getDaily: (days = 7) => get(API_ENDPOINTS.ANALYTICS, { type: 'daily', days }),

  /**
   * 获取页面访问数据
   * @param {number} days - 天数
   */
  getPages: (days = 7) => get(API_ENDPOINTS.ANALYTICS, { type: 'pages', days }),

  /**
   * 获取设备分布数据
   * @param {number} days - 天数
   */
  getDevices: (days = 7) => get(API_ENDPOINTS.ANALYTICS, { type: 'devices', days }),

  /**
   * 获取浏览器分布数据
   * @param {number} days - 天数
   */
  getBrowsers: (days = 7) => get(API_ENDPOINTS.ANALYTICS, { type: 'browsers', days }),

  /**
   * 获取地域分布数据
   * @param {number} days - 天数
   */
  getCountries: (days = 30) => get(API_ENDPOINTS.ANALYTICS, { type: 'countries', days }),
};
