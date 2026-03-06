import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import './index.css'
import router from './router/index.jsx'
import { initAnalytics } from './utils/analytics'

// 初始化埋点
initAnalytics()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider>
      <RouterProvider router={router} />
    </ConfigProvider>
  </StrictMode>,
)
