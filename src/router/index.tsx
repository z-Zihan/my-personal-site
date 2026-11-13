import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, useParams, useLocation } from 'react-router-dom'
import { RouteErrorBoundary } from '../components/ErrorBoundary'
import App from '../App'
import LoadingSpinner from '../components/effects/LoadingSpinner'

// 路由懒加载 - 减小首屏 bundle 体积
// 首屏页静态引入：省掉一轮 Home chunk 及其依赖（request/ArticleCard 等）的串行发现
import Home from '../pages/Home'
const BlogList = lazy(() => import('../pages/BlogList'))
const BlogDetail = lazy(() => import('../pages/BlogDetail'))
const HotNews = lazy(() => import('../pages/HotNews'))
const MessageBoard = lazy(() => import('../pages/MessageBoard'))
const Profile = lazy(() => import('../pages/Profile'))
const About = lazy(() => import('../pages/About'))
const NotFound = lazy(() => import('../pages/NotFound'))

// 后台页面懒加载
const AdminLayout = lazy(() => import('../pages/Admin/Layout'))
const AdminLogin = lazy(() => import('../pages/Admin/Login'))
const Dashboard = lazy(() => import('../pages/Admin/Dashboard'))
const ArticleManager = lazy(() => import('../pages/Admin/ArticleManager'))
const ArticleEditor = lazy(() => import('../pages/Admin/ArticleEditor'))
const MessageManager = lazy(() => import('../pages/Admin/MessageManager'))
const SystemMessageManager = lazy(() => import('../pages/Admin/SystemMessageManager'))
const CommentManager = lazy(() => import('../pages/Admin/CommentManager'))
const CategoryManager = lazy(() => import('../pages/Admin/CategoryManager'))
const HotNewsManager = lazy(() => import('../pages/Admin/HotNewsManager'))
const EventManager = lazy(() => import('../pages/Admin/EventManager'))
// Mock 数据生成器暂时下线 (2026-11-13: 数据已全部清零,防止再生成假数据)
// const MockDataGenerator = lazy(() => import('../pages/Admin/MockDataGenerator'))
const PerfDashboard = lazy(() => import('../pages/Admin/PerfDashboard'))

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
}

/** /article/:id → /blog/:id 兼容跳转(带 query 保留) */
function LegacyArticleRedirect() {
  const { id } = useParams()
  const location = useLocation()
  return <Navigate to={`/blog/${id}${location.search}`} replace />
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
      { path: 'about', element: <LazyPage><About /></LazyPage> },
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
        path: 'system-messages',
        element: <LazyPage><SystemMessageManager /></LazyPage>,
      },
      {
        path: 'comments',
        element: <LazyPage><CommentManager /></LazyPage>,
      },
      {
        path: 'categories',
        element: <LazyPage><CategoryManager /></LazyPage>,
      },
      {
        path: 'hot-news',
        element: <LazyPage><HotNewsManager /></LazyPage>,
      },
      {
        path: 'events',
        element: <LazyPage><EventManager /></LazyPage>,
      },
      {
        path: 'perf',
        element: <LazyPage><PerfDashboard /></LazyPage>,
      },
      // Mock 数据生成器暂时下线 (2026-11-13: 数据已全部清零,防止再生成假数据)
      // {
      //   path: 'mock-data',
      //   element: <LazyPage><MockDataGenerator /></LazyPage>,
      // },
    ],
  },

  // 旧 /article/:id 链接兼容重定向(2026-11-13:Twitter 帖子里发过 /article/xxx 格式链接)
  // /article/<uuid> → /blog/<uuid>,老链接自动跳转不再 404
  {
    path: '/article/:id',
    element: <LegacyArticleRedirect />,
  },

  // 404 页面 - 放在最后
  {
    path: '*',
    element: <LazyPage><NotFound /></LazyPage>,
  },
])

export default router
