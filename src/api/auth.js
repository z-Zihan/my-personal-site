import { post } from '../utils/request';

/**
 * 认证 API
 */
export const authApi = {
  /**
   * 管理员登录
   * @param {object} data - { username, password }
   */
  login: (data) => post('/api/login', data),
};
