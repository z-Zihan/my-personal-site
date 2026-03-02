import { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Layout as AntLayout, Menu } from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  MessageOutlined,
  LogoutOutlined,
  HomeOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  MoonOutlined,
  SunOutlined,
} from '@ant-design/icons'
import useAuthStore from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'

const { Sider, Content, Header } = AntLayout

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { token, logout, checkAuth } = useAuthStore()
  const { setDarkMode } = useThemeStore()

  // 检查认证状态
  useEffect(() => {
    const isAuth = checkAuth()
    setLoading(false)
    
    if (!isAuth) {
      navigate('/admin/login', { replace: true })
    }
  }, [checkAuth, navigate])

  // 初始化主题
  useEffect(() => {
    const dark = localStorage.getItem('darkMode') === 'true'
    setIsDark(dark)
    if (dark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  if (loading || !token) {
    return (
      <AntLayout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p>加载中...</p>
          </div>
        </Content>
      </AntLayout>
    )
  }

  const handleThemeToggle = (checked) => {
    setIsDark(checked)
    setDarkMode(checked)
    localStorage.setItem('darkMode', checked.toString())
    if (checked) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
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
      key: 'home',
      icon: <HomeOutlined />,
      label: (
        <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          返回首页
        </a>
      ),
    },
    {
      type: 'divider',
    },
    // Footer 区域 - 主题切换
    {
      key: 'theme-toggle',
      label: (
        <div
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '8px 0',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <span style={{ fontSize: 14 }}>
            {isDark ? <MoonOutlined /> : <SunOutlined />} 主题
          </span>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={isDark}
              onChange={(e) => handleThemeToggle(e.target.checked)}
              style={{ 
                marginRight: 8,
                cursor: 'pointer',
              }}
            />
          </label>
        </div>
      ),
    },
    // Footer 区域 - 退出登录
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ]

  const handleMenuClick = (e) => {
    if (e.key === 'logout') {
      handleLogout()
    } else if (e.key === 'home') {
      // 已处理
    } else if (e.key !== 'theme-toggle') {
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
    <AntLayout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        width={200}
        style={{
          background: '#ffffff',
          overflow: 'auto',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
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
            <span style={{ color: '#7000ff', fontSize: 24, fontWeight: 'bold' }}>管</span>
          ) : (
            <span style={{ color: '#7000ff', fontSize: 18, fontWeight: 'bold' }}>管理后台</span>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={handleMenuClick}
          theme="light"
          inlineIndent={16}
          style={{ 
            borderRight: 0,
            height: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        />
      </Sider>
      <AntLayout>
        <Header
          style={{
            padding: '0 24px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 18,
                color: '#7000ff',
              }}
            >
              {collapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#666', fontSize: 14 }}>
              <UserOutlined /> 管理员
            </span>
          </div>
        </Header>
        <Content
          style={{
            padding: 24,
            margin: 16,
            background: '#ffffff',
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
