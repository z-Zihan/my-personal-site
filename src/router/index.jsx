import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from '../App'
import Home from '../pages/Home'
import BlogList from '../pages/BlogList'
import BlogDetail from '../pages/BlogDetail'
import HotNews from '../pages/HotNews'
import MessageBoard from '../pages/MessageBoard'
import Profile from '../pages/Profile'
import AdminLayout from '../pages/Admin/Layout'
import AdminLogin from '../pages/Admin/Login'
import Dashboard from '../pages/Admin/Dashboard'
import ArticleManager from '../pages/Admin/ArticleManager'
import ArticleEditor from '../pages/Admin/ArticleEditor'
import MessageManager from '../pages/Admin/MessageManager'

const router = createBrowserRouter([
  // 前台路由
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'blog', element: <BlogList /> },
      { path: 'blog/:id', element: <BlogDetail /> },
      { path: 'hot-news', element: <HotNews /> },
      { path: 'message', element: <MessageBoard /> },
      { path: 'profile', element: <Profile /> },
    ],
  },
  
  // 后台登录页面（独立）
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  
  // 后台管理路由（需要认证）
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'articles',
        element: <ArticleManager />,
      },
      {
        path: 'articles/new',
        element: <ArticleEditor />,
      },
      {
        path: 'articles/:id',
        element: <ArticleEditor />,
      },
      {
        path: 'messages',
        element: <MessageManager />,
      },
    ],
  },
])

export default router
