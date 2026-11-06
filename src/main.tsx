import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import router from './router/index.jsx'
import { initAnalytics } from './utils/analytics'
import { initPerfMonitor } from './utils/perfMonitor'
import { preloadHomeData } from './api/homePreload'

// 首页直达时立即发起数据请求，与后续 JS 下载/渲染并行
if (window.location.pathname === '/') {
  preloadHomeData()
}

// 初始化埋点
initAnalytics()

// 初始化性能 + 错误监控
initPerfMonitor()

// 说明：原先这里包了一层 <ConfigProvider>（antd），但没有任何配置项，
// 却导致整个 antd（gzip ~320KB）进入首屏。已移除，antd 页面按需加载不受影响。
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
