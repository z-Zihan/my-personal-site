import { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Layout as AntLayout, Menu, Popover } from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  MessageOutlined,
  LogoutOutlined,
  HomeOutlined,
  SettingOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons'
import useAuthStore from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'

const { Sider, Content, Header } = AntLayout

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
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
    setPopoverOpen(false)
    navigate('/admin/login', { replace: true })
  }

  // Menu Footer 弹出卡片内容
  const footerContent = (
    <div style={{ padding: 12, minWidth: 200 }}>
      <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, color: '#666' }}>
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
                width: 16,
                height: 16,
                cursor: 'pointer',
              }}
            />
          </label>
        </div>
      </div>
      <div
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          borderRadius: 6,
          cursor: 'pointer',
          color: '#ff4d4f',
          transition: 'background 0.3s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#fff1f0'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <LogoutOutlined />
        <span>退出登录</span>
      </div>
    </div>
  )

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
    // Menu Footer - 设置按钮（弹出卡片）
    {
      type: 'divider',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: (
        <Popover
          content={footerContent}
          trigger="click"
          open={popoverOpen}
          onOpenChange={setPopoverOpen}
          placement="rightTop"
          overlayStyle={{ maxWidth: 250 }}
        >
          <span onClick={(e) => e.stopPropagation()}>设置</span>
        </Popover>
      ),
    },
  ]

  const handleMenuClick = (e) => {
    if (e.key === 'home') {
      // 已处理
    } else if (e.key !== 'settings') {
      setPopoverOpen(false)
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
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        width={200}
        style={{
          background: '#ffffff',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          overflow: 'auto',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <span style={{ color: '#7000ff', fontSize: 18, fontWeight: 'bold' }}>管理后台</span>
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
            overflow: 'auto',
          }}
        />
      </Sider>
      <AntLayout style={{ marginLeft: collapsed ? 0 : 200, transition: 'margin-left 0.3s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            height: 64,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <span style={{ color: '#666', fontSize: 14 }}>
            <UserOutlined /> 管理员
          </span>
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
