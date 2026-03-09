import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RouteErrorBoundary } from '../components/ErrorBoundary'
import App from '../App'
import LoadingSpinner from '../components/effects/LoadingSpinner'

// 路由懒加载 - 减小首屏 bundle 体积
const Home = lazy(() => import('../pages/Home'))
const BlogList = lazy(() => import('../pages/BlogList'))
const BlogDetail = lazy(() => import('../pages/BlogDetail'))
const HotNews = lazy(() => import('../pages/HotNews'))
const MessageBoard = lazy(() => import('../pages/MessageBoard'))
const Profile = lazy(() => import('../pages/Profile'))
const NotFound = lazy(() => import('../pages/NotFound'))

// 后台页面懒加载
const AdminLayout = lazy(() => import('../pages/Admin/Layout'))
const AdminLogin = lazy(() => import('../pages/Admin/Login'))
const Dashboard = lazy(() => import('../pages/Admin/Dashboard'))
const ArticleManager = lazy(() => import('../pages/Admin/ArticleManager'))
const ArticleEditor = lazy(() => import('../pages/Admin/ArticleEditor'))
const MessageManager = lazy(() => import('../pages/Admin/MessageManager'))
const EventManager = lazy(() => import('../pages/Admin/EventManager'))
const MockDataGenerator = lazy(() => import('../pages/Admin/MockDataGenerator'))

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
}

const router = createBrowserRouter([
  // 前台路由
  {
    path: '/',
    element: <App />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <LazyPage><Home /></LazyPage> },
      { path: 'blog', element: <LazyPage><BlogList /></LazyPage> },
      { path: 'blog/:id', element: <LazyPage><BlogDetail /></LazyPage> },
      { path: 'hot-news', element: <LazyPage><HotNews /></LazyPage> },
      { path: 'message', element: <LazyPage><MessageBoard /></LazyPage> },
      { path: 'profile', element: <LazyPage><Profile /></LazyPage> },
    ],
  },

  // 后台登录页面（独立）
  {
    path: '/admin/login',
    element: <LazyPage><AdminLogin /></LazyPage>,
    errorElement: <RouteErrorBoundary />,
  },

  // 后台管理路由（需要认证）
  {
    path: '/admin',
    element: <LazyPage><AdminLayout /></LazyPage>,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <LazyPage><Dashboard /></LazyPage>,
      },
      {
        path: 'articles',
        element: <LazyPage><ArticleManager /></LazyPage>,
      },
      {
        path: 'articles/new',
        element: <LazyPage><ArticleEditor /></LazyPage>,
      },
      {
        path: 'articles/:id',
        element: <LazyPage><ArticleEditor /></LazyPage>,
      },
      {
        path: 'messages',
        element: <LazyPage><MessageManager /></LazyPage>,
      },
      {
        path: 'events',
        element: <LazyPage><EventManager /></LazyPage>,
      },
      {
        path: 'mock-data',
        element: <LazyPage><MockDataGenerator /></LazyPage>,
      },
    ],
  },

  // 404 页面 - 放在最后
  {
    path: '*',
    element: <LazyPage><NotFound /></LazyPage>,
  },
])

export default router
