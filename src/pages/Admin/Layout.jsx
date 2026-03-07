import { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Layout as AntLayout, Menu, Switch, Popover, Button } from 'antd'
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

const { Sider, Content, Header } = AntLayout

function AdminLayout() {
  const [loading, setLoading] = useState(true)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { token, logout, checkAuth } = useAuthStore()

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
    const stored = localStorage.getItem('admin-theme-storage')
    let darkMode = false
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        darkMode = parsed.state?.adminDarkMode || false
      } catch (e) {
        darkMode = false
      }
    }
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // 切换主题处理
  const handleToggleTheme = (checked) => {
    setIsDark(checked)
    if (checked) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    // 同步到 localStorage
    localStorage.setItem('admin-theme-storage', JSON.stringify({
      state: { adminDarkMode: checked },
      version: 0
    }))
  }

  if (loading || !token) {
    return (
      <AntLayout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="relative">
            {/* 科技风 Loading 动画 */}
            <div className="w-20 h-20 border-4 border-purple-300 rounded-full animate-spin" style={{ animationDuration: '2s', borderLeftColor: '#7000ff', borderTopColor: '#00f0ff' }} />
            <div className="absolute top-1 left-1 w-18 h-18 border-4 border-cyan-300 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse', borderRightColor: '#00f0ff' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full animate-pulse shadow-lg shadow-purple-500/50" />
            <p style={{ marginTop: 24, textAlign: 'center', color: '#666', fontSize: 16 }}>加载中...</p>
          </div>
        </Content>
      </AntLayout>
    )
  }

  const handleLogout = () => {
    logout()
    setPopoverOpen(false)
    navigate('/admin/login', { replace: true })
  }

  // 弹出卡片内容
  const popoverContent = (
    <div style={{ padding: 12, minWidth: 220 }}>
      <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, color: '#666' }}>
            {isDark ? <MoonOutlined /> : <SunOutlined />} 主题
          </span>
          <Switch
            size="small"
            checked={isDark}
            onChange={handleToggleTheme}
            checkedChildren="🌙"
            unCheckedChildren="☀️"
          />
        </div>
      </div>
      <Button
        danger
        block
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        style={{ marginTop: 8 }}
      >
        退出登录
      </Button>
    </div>
  )

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined style={{ fontSize: 18 }} />,
      label: <span style={{ fontSize: 15, fontWeight: 500 }}>仪表盘</span>,
    },
    {
      key: '/admin/articles',
      icon: <FileTextOutlined style={{ fontSize: 18 }} />,
      label: <span style={{ fontSize: 15, fontWeight: 500 }}>文章管理</span>,
    },
    {
      key: '/admin/messages',
      icon: <MessageOutlined style={{ fontSize: 18 }} />,
      label: <span style={{ fontSize: 15, fontWeight: 500 }}>留言管理</span>,
    },
    {
      type: 'divider',
    },
    // Menu Footer - 设置（弹出卡片）
    {
      key: 'settings',
      icon: <SettingOutlined style={{ fontSize: 18 }} />,
      label: (
        <Popover
          content={popoverContent}
          trigger="click"
          open={popoverOpen}
          onOpenChange={setPopoverOpen}
          placement="rightTop"
          overlayStyle={{ maxWidth: 250 }}
          arrow={false}
        >
          <span 
            style={{ 
              fontSize: 15, 
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation()
              setPopoverOpen(!popoverOpen)
            }}
          >
            <span>设置</span>
            <span style={{ fontSize: 10, color: '#999' }}>▼</span>
          </span>
        </Popover>
      ),
    },
  ]

  const handleMenuClick = (e) => {
    if (e.key === 'settings') {
      // 不跳转
    } else {
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
        width={240}
        style={{
          background: '#ffffff',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          overflow: 'hidden',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
            flexShrink: 0,
          }}
        >
          <span style={{ color: '#7000ff', fontSize: 20, fontWeight: 'bold' }}>管理后台</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={menuItems}
            onClick={handleMenuClick}
            theme="light"
            inlineIndent={16}
            style={{
              borderRight: 0,
              flex: 1,
            }}
            itemstyle={{
              height: 56,
              margin: '4px 8px',
            }}
          />
        </div>
      </Sider>
      <AntLayout style={{ marginLeft: 240, transition: 'margin-left 0.3s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <a 
            href="/" 
            style={{ 
              color: '#666', 
              fontSize: 14,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              borderRadius: 8,
              transition: 'all 0.3s',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f0f0f0'
              e.currentTarget.style.color = '#7000ff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#666'
            }}
          >
            <HomeOutlined style={{ fontSize: 16 }} /> 返回首页
          </a>
          <span style={{ color: '#666', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
            <UserOutlined style={{ fontSize: 16 }} /> 管理员
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
