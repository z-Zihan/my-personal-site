import { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Layout as AntLayout, Menu, Spin } from 'antd'
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

const { Sider, Content, Header } = AntLayout

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { token, logout, checkAuth } = useAuthStore()

  // 检查认证状态
  useEffect(() => {
    const isAuth = checkAuth()
    setLoading(false)
    
    // 未认证，跳转到登录页
    if (!isAuth) {
      navigate('/admin/login', { replace: true })
    }
  }, [checkAuth, navigate])

  // 如果正在检查或 token 无效，显示加载
  if (loading || !token) {
    return (
      <AntLayout style={{ minHeight: '100vh', background: '#0a0a0f' }}>
        <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin size="large" />
        </Content>
      </AntLayout>
    )
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
    return '/admin/dashboard'
  }

  return (
    <AntLayout style={{ minHeight: '100vh', background: '#0a0a0f' }}>
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
          style={{ borderRight: 0 }}
        />
      </Sider>
      <AntLayout>
        <Header
          style={{
            padding: '0 24px',
            background: '#1a1a2e',
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
            background: '#1a1a2e',
            borderRadius: 8,
            minHeight: 'calc(100vh - 128px)',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default AdminLayout
