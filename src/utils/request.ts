import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE } from '../constants/apiConstants';
import { trackApiTiming, trackApiError } from './perfMonitor';

// 扩展 AxiosRequestConfig 支持 skipAuth 选项
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
}

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
  (config: InternalAxiosRequestConfig & { skipAuth?: boolean }) => {
    // 记录请求开始时间（接口耗时埋点）
    (config as InternalAxiosRequestConfig & { _startTime?: number })._startTime = Date.now();
    // 自动添加 token（除非明确指定 skipAuth）
    if (!config.skipAuth) {
      const token = localStorage.getItem('admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 从 config 取请求开始时间
const getRequestDuration = (config?: InternalAxiosRequestConfig): number => {
  const startTime = (config as (InternalAxiosRequestConfig & { _startTime?: number }) | undefined)?._startTime;
  return startTime ? Date.now() - startTime : 0;
};

// 上报接口耗时（正常按采样率，慢接口全量）
const reportApiTiming = (url: string, method: string, duration: number, status: number) => {
  try {
    // 上报端点自身不埋点，避免自上报循环
    if (url.includes('/api/perf-metrics') || url.includes('/api/analytics')) return;
    trackApiTiming(url, method, duration, status);
  } catch {
    /* 埋点失败静默 */
  }
};

// 上报接口错误（401 静音）
const reportApiError = (url: string, method: string, duration: number, status: number, summary: string) => {
  try {
    if (url.includes('/api/perf-metrics') || url.includes('/api/analytics')) return;
    trackApiError(url, method, duration, status, summary);
  } catch {
    /* 埋点失败静默 */
  }
};

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 接口耗时埋点：trackApiTiming 内部已做策略分流（>1s 全量报 api_slow，其余 10% 采样报 api_timing）
    const duration = getRequestDuration(response.config);
    const url = response.config.url || '';
    const method = (response.config.method || 'get').toUpperCase();
    reportApiTiming(url, method, duration, response.status);
    // 统一处理响应数据
    return response.data;
  },
  (error: AxiosError) => {
    // 接口错误埋点：4xx/5xx/网络错误都记（401 静音在 trackApiError 内部处理）
    const duration = getRequestDuration(error.config);
    const url = error.config?.url || '';
    const method = (error.config?.method || 'get').toUpperCase();
    const status = error.response?.status || 0; // 0 = 网络错误/超时
    const summary = error.response
      ? JSON.stringify(error.response.data).slice(0, 500)
      : error.message || 'network error';
    reportApiError(url, method, duration, status, summary);
    // 统一处理错误
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
export function get<T = unknown>(url: string, params: Record<string, unknown> | URLSearchParams = {}, config: CustomAxiosRequestConfig = {}) {
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
