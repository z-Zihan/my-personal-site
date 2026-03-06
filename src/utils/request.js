import axios from 'axios';
import { API_BASE } from '../constants/apiConstants';

// 创建 axios 实例
const request = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
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
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 统一处理响应数据
    return response.data;
  },
  (error) => {
    // 统一处理错误
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * 封装的 request 请求方法
 * @param {string} url - 请求地址
 * @param {string} method - 请求方法
 * @param {object} data - 请求数据
 * @param {object} params - 请求参数
 * @param {object} headers - 请求头
 * @returns {Promise}
 */
export default request;

/**
 * GET 请求
 * @param {string} url - 请求地址
 * @param {object} params - 查询参数
 * @param {object} config - 其他配置
 * @returns {Promise}
 */
export function get(url, params = {}, config = {}) {
  return request.get(url, { params, ...config });
}

/**
 * POST 请求
 * @param {string} url - 请求地址
 * @param {object} data - 请求数据
 * @param {object} config - 其他配置
 * @returns {Promise}
 */
export function post(url, data = {}, config = {}) {
  return request.post(url, data, config);
}

/**
 * PUT 请求
 * @param {string} url - 请求地址
 * @param {object} data - 请求数据
 * @param {object} config - 其他配置
 * @returns {Promise}
 */
export function put(url, data = {}, config = {}) {
  return request.put(url, data, config);
}

/**
 * DELETE 请求
 * @param {string} url - 请求地址
 * @param {object} data - 请求数据（作为 body 发送）
 * @param {object} config - 其他配置
 * @returns {Promise}
 */
export function del(url, data = {}, config = {}) {
  return request.delete(url, { data, ...config });
}

/**
 * PATCH 请求
 * @param {string} url - 请求地址
 * @param {object} data - 请求数据
 * @param {object} config - 其他配置
 * @returns {Promise}
 */
export function patch(url, data = {}, config = {}) {
  return request.patch(url, data, config);
}
