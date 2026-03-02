import { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, theme } from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  MessageOutlined,
  LogoutOutlined,
  HomeOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons'
import useAuthStore from '../../store/authStore'

const { Sider, Content, Header } = Layout

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { token, logout } = useAuthStore()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  useEffect(() => {
    // 检查是否登录或有 dev=1 参数
    const isDev = new URLSearchParams(location.search).get('dev') === '1'
    const hasToken = !!token
    
    if (isDev || hasToken) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
    setChecking(false)
  }, [location.search, token])

  if (checking) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="animate-spin text-4xl">⏳</div>
        </Content>
      </Layout>
    )
  }

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
      navigate('/admin/login', { replace: true })
    } else {
      navigate(e.key)
    }
  }

  const getSelectedKey = () => {
    const path = location.pathname
    if (path.includes('articles')) return '/admin/articles'
    if (path.includes('messages')) return '/admin/messages'
    if (path.includes('login')) return '/admin/login'
    return '/admin/dashboard'
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={200}
        style={{
          background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '16px 0',
          }}
        >
          {collapsed ? (
            <span style={{ color: '#00f0ff', fontSize: 24, fontWeight: 'bold' }}>管</span>
          ) : (
            <span style={{ color: '#00f0ff', fontSize: 18, fontWeight: 'bold' }}>管理后台</span>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={handleMenuClick}
          theme="dark"
          inlineIndent={16}
          style={{
            borderRight: 0,
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
          }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 18,
              color: '#00f0ff',
            }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        </Header>
        <Content
          style={{
            padding: 24,
            margin: 16,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 'calc(100vh - 128px)',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
