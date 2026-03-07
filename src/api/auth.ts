import { post } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

export interface LoginData {
  username: string;
  password: string;
  [key: string]: string;
}

export interface LoginResponse {
  token?: string;
  message?: string;
  [key: string]: unknown;
}

/**
 * 认证 API
 */
export const authApi = {
  /**
   * 管理员登录
   * @param data - { username, password }
   */
  login: (data: LoginData) => post<LoginResponse>(API_ENDPOINTS.LOGIN, data),
};
