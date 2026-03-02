import { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Layout as AntLayout, Menu, Switch, Popover } from 'antd'
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
import { useAdminThemeStore } from '../../store/adminThemeStore'

const { Sider, Content, Header } = AntLayout

function AdminLayout() {
  const [loading, setLoading] = useState(true)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { token, logout, checkAuth } = useAuthStore()
  const { adminDarkMode, setAdminDarkMode, initAdminTheme } = useAdminThemeStore()

  // 检查认证状态
  useEffect(() => {
    const isAuth = checkAuth()
    setLoading(false)
    
    if (!isAuth) {
      navigate('/admin/login', { replace: true })
    }
  }, [checkAuth, navigate])

  // 初始化后台主题（独立于博客主题）
  useEffect(() => {
    initAdminTheme()
  }, [])

  // 监听后台主题变化
  useEffect(() => {
    if (adminDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [adminDarkMode])

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
    setAdminDarkMode(checked)
    localStorage.setItem('adminDarkMode', checked.toString())
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
            {adminDarkMode ? <MoonOutlined /> : <SunOutlined />} 主题
          </span>
          <Switch
            size="small"
            checked={adminDarkMode}
            onChange={handleThemeToggle}
            checkedChildren="🌙"
            unCheckedChildren="☀️"
          />
        </div>
      </div>
      <div
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
          borderRadius: 6,
          cursor: 'pointer',
          color: '#ff4d4f',
          transition: 'background 0.3s',
          fontWeight: 500,
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
    // Menu Footer - 设置（弹出卡片）- 始终在最下方
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
      // 不跳转，由 Popover 处理
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
            itemStyle={{
              height: 56,
              margin: '4px 8px',
              borderRadius: 8,
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
