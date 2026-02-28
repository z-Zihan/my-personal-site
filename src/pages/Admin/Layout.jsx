import { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  MessageOutlined,
  LogoutOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import useAuthStore from '../../store/authStore'

const { Sider, Content } = Layout

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { token, logout } = useAuthStore()

  // 检查是否登录或有 dev=1 参数
  const isAuthenticated = token || new URLSearchParams(location.search).get('dev') === '1'

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/admin/articles',
      icon: <FileTextOutlined />,
      label: '文章管理',
    },
    {
      key: '/admin/messages',
      icon: <MessageOutlined />,
      label: '留言管理',
    },
    {
      type: 'divider',
    },
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '返回首页',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ]

  const handleMenuClick = (e) => {
    if (e.key === 'logout') {
      logout()
      window.location.href = '/admin/login'
    } else {
      window.location.href = e.key
    }
  }

  const currentKey = location.pathname.includes('articles')
    ? '/admin/articles'
    : location.pathname.includes('messages')
    ? '/admin/messages'
    : '/admin/dashboard'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        style={{
          background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)',
        }}
      >
        <div className="h-16 flex items-center justify-center">
          <h1 className={`text-white font-bold ${collapsed ? 'text-lg' : 'text-xl'}`}>
            {collapsed ? 'ADMIN' : '管理后台'}
          </h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[currentKey]}
          items={menuItems}
          onClick={handleMenuClick}
          theme="dark"
        />
      </Sider>
      <Layout>
        <Content
          style={{
            margin: 0,
            background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 100%)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
