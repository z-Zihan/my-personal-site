import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE } from '../constants/apiConstants';

// 创建 axios 实例
const request = axios.create({
  baseURL: API_BASE,
  timeout: 180000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 自动添加 token
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 统一处理响应数据
    return response.data;
  },
  (error: AxiosError) => {
    // 统一处理错误
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * GET 请求
 * @param url - 请求地址
 * @param params - 查询参数
 * @param config - 其他配置
 * @returns Promise
 */
export function get<T = unknown>(url: string, params: Record<string, unknown> | URLSearchParams = {}, config: AxiosRequestConfig = {}) {
  return request.get<T>(url, { params, ...config });
}

/**
 * POST 请求
 * @param url - 请求地址
 * @param data - 请求数据
 * @param config - 其他配置
 * @returns Promise
 */
export function post<T = unknown>(url: string, data: Record<string, unknown> | FormData | Partial<Record<string, unknown>> = {}, config: AxiosRequestConfig = {}) {
  return request.post<T>(url, data, config);
}

/**
 * PUT 请求
 * @param url - 请求地址
 * @param data - 请求数据
 * @param config - 其他配置
 * @returns Promise
 */
export function put<T = unknown>(url: string, data: Record<string, unknown> | Partial<Record<string, unknown>> = {}, config: AxiosRequestConfig = {}) {
  return request.put<T>(url, data, config);
}

/**
 * DELETE 请求
 * @param url - 请求地址
 * @param data - 请求数据（作为 body 发送）
 * @param config - 其他配置
 * @returns Promise
 */
export function del<T = unknown>(url: string, data: Record<string, unknown> | Partial<Record<string, unknown>> = {}, config: AxiosRequestConfig = {}) {
  // 如果只传了两个参数，且第二个参数包含 params/config 配置项，则视为 config
  if (arguments.length === 2 && !dataHasBody(data as Record<string, unknown>)) {
    config = data as AxiosRequestConfig;
    data = {};
  }
  return request.delete<T>(url, { data, ...config });
}

/**
 * 判断 data 是否是请求体数据（而非 config 配置）
 */
function dataHasBody(data: Record<string, unknown>): boolean {
  if (!data) return false;
  // 如果包含常见的 config 配置项，则认为不是 body 数据
  const configKeys = ['params', 'headers', 'timeout', 'baseURL', 'responseType'];
  return !configKeys.some(key => key in data);
}

/**
 * PATCH 请求
 * @param url - 请求地址
 * @param data - 请求数据
 * @param config - 其他配置
 * @returns Promise
 */
export function patch<T = unknown>(url: string, data: Record<string, unknown> | Partial<Record<string, unknown>> = {}, config: AxiosRequestConfig = {}) {
  return request.patch<T>(url, data, config);
}

export default request;
