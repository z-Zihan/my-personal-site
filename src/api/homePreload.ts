// 首页数据预取：在 main.tsx 模块顶层提前发起请求，让 API 往返与 JS 下载/解析重叠，
// Home 挂载时直接复用同一个 promise，而不是 mount 后才开始请求。
import { articleApi } from './article';
import { hotNewsApi } from './hotNews';
import { statsApi } from './stats';

const fetchHomeData = () =>
  Promise.all([
    articleApi.getList({ page: 1, limit: 6, status: 'published' }),
    // 推荐文章必须是发布状态
    articleApi.getList({ page: 1, limit: 6, recommended: true, status: 'published' }),
    hotNewsApi.getList(),
    statsApi.getStats(),
  ]);

let pending: ReturnType<typeof fetchHomeData> | null = null;

/** 提前发起首页数据请求（重复调用复用同一个 promise） */
export function preloadHomeData() {
  if (!pending) {
    pending = fetchHomeData();
    // 预取失败不在此处抛出未处理异常，由消费方处理
    pending.catch(() => {});
  }
  return pending;
}

/** 取用预取结果；取用后清空，之后再次进入首页会重新请求最新数据 */
export function consumeHomeData() {
  const p = pending ?? fetchHomeData();
  pending = null;
  return p;
}
