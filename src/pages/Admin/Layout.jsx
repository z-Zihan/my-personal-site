import { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Layout as AntLayout, Menu, Dropdown } from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  MessageOutlined,
  LogoutOutlined,
  HomeOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  GlobalOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons'
import useAuthStore from '../../store/authStore'
import { getLanguage, setLanguage } from '../../utils/i18n'
import ThemeToggle from '../../components/common/ThemeToggle'

const { Sider, Content, Header } = AntLayout

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { token, logout, checkAuth } = useAuthStore()
  const [language, setLang] = useState(getLanguage())

  // 检查认证状态
  useEffect(() => {
    const isAuth = checkAuth()
    setLoading(false)
    
    if (!isAuth) {
      navigate('/admin/login', { replace: true })
    }
  }, [checkAuth, navigate])

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

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    setLang(lang)
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
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ]

  const handleMenuClick = (e) => {
    if (e.key === 'logout') {
      handleLogout()
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

  // 语言切换菜单
  const languageMenu = (
    <Menu onClick={(e) => handleLanguageChange(e.key)} selectedKeys={[language]}>
      <Menu.Item key="zh">🇨🇳 中文</Menu.Item>
      <Menu.Item key="en">🇺🇸 English</Menu.Item>
    </Menu>
  )

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
          style={{ borderRight: 0 }}
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
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* 返回首页 */}
            <a
              href="/"
              style={{ color: '#666', textDecoration: 'none', fontSize: 14 }}
            >
              🏠 返回首页
            </a>
            
            {/* 语言切换 */}
            <Dropdown overlay={languageMenu} trigger={['click']}>
              <span style={{ cursor: 'pointer', fontSize: 18 }}>
                <GlobalOutlined />
              </span>
            </Dropdown>
            
            {/* 主题切换 */}
            <ThemeToggle />
            
            {/* 用户信息 */}
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
