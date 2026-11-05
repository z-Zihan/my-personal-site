import { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation, useNavigate, Link } from 'react-router-dom'
import { Layout as AntLayout, Menu, Switch, Popover, Button } from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  MessageOutlined,
  CommentOutlined,
  TagsOutlined,
  FireOutlined,
  LogoutOutlined,
  HomeOutlined,
  SettingOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'
import useAuthStore from '../../store/authStore'

const { Sider, Content, Header } = AntLayout

type MenuItem = Required<MenuProps>['items'][number]

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
  const handleToggleTheme = (checked: boolean) => {
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
      <AntLayout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
        <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-300 rounded-full animate-spin" style={{ animationDuration: '2s', borderLeftColor: '#7000ff', borderTopColor: '#00f0ff' }} />
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
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
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

  const menuItems: MenuItem[] = [
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
      key: '/admin/comments',
      icon: <CommentOutlined />,
      label: '评论管理',
    },
    {
      key: '/admin/messages',
      icon: <MessageOutlined />,
      label: '留言管理',
    },
    {
      key: '/admin/categories',
      icon: <TagsOutlined />,
      label: '分类管理',
    },
    {
      key: '/admin/hot-news',
      icon: <FireOutlined />,
      label: '热点资讯',
    },
    {
      key: '/admin/events',
      icon: <ThunderboltOutlined />,
      label: '埋点管理',
    },
    {
      key: '/admin/mock-data',
      icon: <DatabaseOutlined />,
      label: '数据生成',
    },
  ]

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key)
  }

  // 根据 pathname 精确计算高亮菜单：编辑器子路由归入文章管理
  const getSelectedKey = () => {
    const path = location.pathname
    if (path.startsWith('/admin/dashboard')) return '/admin/dashboard'
    if (path.startsWith('/admin/articles')) return '/admin/articles'
    if (path.startsWith('/admin/comments')) return '/admin/comments'
    if (path.startsWith('/admin/messages')) return '/admin/messages'
    if (path.startsWith('/admin/categories')) return '/admin/categories'
    if (path.startsWith('/admin/hot-news')) return '/admin/hot-news'
    if (path.startsWith('/admin/events')) return '/admin/events'
    if (path.startsWith('/admin/mock-data')) return '/admin/mock-data'
    return '/admin/dashboard'
  }

  // 菜单底部：返回前台 + 设置
  const menuFooter = (
    <div style={{ borderTop: '1px solid #f0f0f0', padding: '12px 16px', flexShrink: 0 }}>
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: '#595959',
          fontSize: 14,
          textDecoration: 'none',
          padding: '8px 10px',
          borderRadius: 8,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f5f5f5'
          e.currentTarget.style.color = '#7000ff'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = '#595959'
        }}
      >
        <HomeOutlined />
        <span>返回前台</span>
      </Link>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 10px',
          borderRadius: 8,
          cursor: 'pointer',
          color: '#595959',
          fontSize: 14,
        }}
        onClick={(e) => {
          e.stopPropagation()
          setPopoverOpen(!popoverOpen)
        }}
      >
        <Popover
          content={popoverContent}
          trigger="click"
          open={popoverOpen}
          onOpenChange={setPopoverOpen}
          placement="rightBottom"
          overlayStyle={{ maxWidth: 250 }}
          arrow={false}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            <SettingOutlined />
            <span>设置</span>
          </span>
        </Popover>
      </div>
    </div>
  )

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        width={220}
        style={{
          background: '#ffffff',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          overflow: 'hidden',
          borderRight: '1px solid #f0f0f0',
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
          <span style={{ color: '#7000ff', fontSize: 18, fontWeight: 600 }}>管理后台</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={menuItems}
            onClick={handleMenuClick}
            theme="light"
            inlineIndent={20}
            style={{
              borderRight: 0,
              flex: 1,
            }}
          />
          {menuFooter}
        </div>
      </Sider>
      <AntLayout style={{ marginLeft: 220, transition: 'margin-left 0.3s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
            borderBottom: '1px solid #f0f0f0',
            boxShadow: 'none',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <a
            href="/"
            style={{
              color: '#595959',
              fontSize: 14,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 8,
              transition: 'all 0.2s',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f5f5f5'
              e.currentTarget.style.color = '#7000ff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#595959'
            }}
          >
            <HomeOutlined style={{ fontSize: 16 }} /> 返回前台
          </a>
          <span style={{ color: '#595959', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
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
