import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from '../App'
import Home from '../pages/Home'
import BlogList from '../pages/BlogList'
import BlogDetail from '../pages/BlogDetail'
import HotNews from '../pages/HotNews'
import MessageBoard from '../pages/MessageBoard'
import AdminLayout from '../pages/Admin/Layout'
import AdminLogin from '../pages/Admin/Login'
import Dashboard from '../pages/Admin/Dashboard'
import ArticleManager from '../pages/Admin/ArticleManager'
import MessageManager from '../pages/Admin/MessageManager'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'blog',
        element: <BlogList />,
      },
      {
        path: 'blog/:id',
        element: <BlogDetail />,
      },
      {
        path: 'hot-news',
        element: <HotNews />,
      },
      {
        path: 'message',
        element: <MessageBoard />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: 'login',
        element: <AdminLogin />,
      },
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
        path: 'messages',
        element: <MessageManager />,
      },
    ],
  },
])

export default router
