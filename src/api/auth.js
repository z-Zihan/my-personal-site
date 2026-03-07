import { post } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

/**
 * 认证 API
 */
export const authApi = {
  /**
   * 管理员登录
   * @param {object} data - { username, password }
   */
  login: (data) => post(API_ENDPOINTS.LOGIN, data),
};
