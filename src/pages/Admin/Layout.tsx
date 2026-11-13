import { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation, useNavigate, Link } from 'react-router-dom'
import { Layout as AntLayout, Menu, Button, Dropdown, ConfigProvider, theme as antdTheme } from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  MessageOutlined,
  CommentOutlined,
  RobotOutlined,
  TagsOutlined,
  FireOutlined,
  LogoutOutlined,
  HomeOutlined,
  MoonOutlined,
  SunOutlined,
  ThunderboltOutlined,
  // DatabaseOutlined, // Mock 数据生成器暂时下线
  UserOutlined,
  DownOutlined,
} from '@ant-design/icons'
import useAuthStore from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { initAdminTheme, toggleAdminTheme } from '../../components/admin/adminTheme'

const { Sider, Content, Header } = AntLayout

type MenuItem = Required<MenuProps>['items'][number]

// 站点主色（与品牌一致）
const PRIMARY_COLOR = '#7000ff'

// 路由 → 页面名映射（Header 面包屑用）
const PAGE_TITLES: Array<[prefix: string, title: string]> = [
  ['/admin/dashboard', '仪表盘'],
  ['/admin/articles/new', '新建文章'],
  ['/admin/articles', '文章管理'],
  ['/admin/comments', '评论管理'],
  ['/admin/messages', '留言管理'],
  ['/admin/system-messages', '系统留言'],
  ['/admin/categories', '分类管理'],
  ['/admin/hot-news', '热点资讯'],
  ['/admin/events', '埋点管理'],
  ['/admin/perf', '性能监控'],
  // ['/admin/mock-data', '数据生成'], // Mock 数据生成器暂时下线 (2026-11-13)
]

function getPageTitle(pathname: string): string {
  // 编辑器子路由：新建 / 编辑（数字 id）
  if (pathname === '/admin/articles/new') return '新建文章'
  if (/^\/admin\/articles\/[^/]+$/.test(pathname)) return '编辑文章'
  for (const [prefix, title] of PAGE_TITLES) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) return title
  }
  return '管理后台'
}

function AdminLayout() {
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { token, logout, checkAuth, user } = useAuthStore()

  // 主题：与前台共用同一套 themeStore（一个开关全局同步）
  const darkMode = useThemeStore((s) => s.darkMode)

  // 检查认证状态
  useEffect(() => {
    const isAuth = checkAuth()
    setLoading(false)

    if (!isAuth) {
      navigate('/admin/login', { replace: true })
    }
  }, [checkAuth, navigate])

  // 初始化主题：读取统一存储（并迁移旧的后台独立存储）
  useEffect(() => {
    initAdminTheme()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

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
      key: '/admin/system-messages',
      icon: <RobotOutlined />,
      label: '系统留言',
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
      key: '/admin/perf',
      icon: <DashboardOutlined />,
      label: '性能监控',
    },
    // Mock 数据生成器暂时下线 (2026-11-13: 数据已全部清零,防止再生成假数据)
    // {
    //   key: '/admin/mock-data',
    //   icon: <DatabaseOutlined />,
    //   label: '数据生成',
    // },
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
    if (path.startsWith('/admin/system-messages')) return '/admin/system-messages'
    if (path.startsWith('/admin/messages')) return '/admin/messages'
    if (path.startsWith('/admin/categories')) return '/admin/categories'
    if (path.startsWith('/admin/hot-news')) return '/admin/hot-news'
    if (path.startsWith('/admin/events')) return '/admin/events'
    if (path.startsWith('/admin/perf')) return '/admin/perf'
    if (path.startsWith('/admin/mock-data')) return '/admin/mock-data'
    return '/admin/dashboard'
  }

  if (loading) {
    return (
      <AntLayout style={{ minHeight: '100vh', background: darkMode ? '#141414' : '#f5f7fa' }}>
        <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-300 rounded-full animate-spin" style={{ animationDuration: '2s', borderLeftColor: PRIMARY_COLOR, borderTopColor: '#00f0ff' }} />
            <p style={{ marginTop: 24, textAlign: 'center', color: darkMode ? 'rgba(255,255,255,0.45)' : '#666', fontSize: 16 }}>加载中...</p>
          </div>
        </Content>
      </AntLayout>
    )
  }

  // 未登录（含 token 过期）：跳登录页。Login 页自己做主题初始化 + ConfigProvider
  if (!token) {
    return <Navigate to="/admin/login" replace />
  }

  // Header 右侧用户下拉菜单
  const userMenu: MenuProps = {
    items: [
      {
        key: 'identity',
        label: (
          <div style={{ padding: '4px 0', minWidth: 160 }}>
            <div style={{ fontWeight: 600 }}>{user?.username || '管理员'}</div>
            <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>管理员</div>
          </div>
        ),
        disabled: true,
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        danger: true,
        onClick: handleLogout,
      },
    ],
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: PRIMARY_COLOR,
          borderRadius: 8,
        },
      }}
    >
      <AntLayout style={{ minHeight: '100vh', background: darkMode ? '#141414' : '#f5f7fa' }}>
        <Sider
          width={220}
          theme={darkMode ? 'dark' : 'light'}
          style={{
            background: darkMode ? '#1f1f1f' : '#ffffff',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            overflow: 'hidden',
            borderRight: `1px solid ${darkMode ? '#303030' : '#f0f0f0'}`,
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
              borderBottom: `1px solid ${darkMode ? '#303030' : '#f0f0f0'}`,
              flexShrink: 0,
            }}
          >
            <span style={{ color: PRIMARY_COLOR, fontSize: 18, fontWeight: 600 }}>管理后台</span>
          </div>
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <Menu
              mode="inline"
              selectedKeys={[getSelectedKey()]}
              items={menuItems}
              onClick={handleMenuClick}
              theme={darkMode ? 'dark' : 'light'}
              inlineIndent={20}
              style={{
                borderRight: 0,
                flex: 1,
                background: 'transparent',
              }}
            />
          </div>
        </Sider>
        <AntLayout style={{ marginLeft: 220, transition: 'margin-left 0.3s', background: darkMode ? '#141414' : '#f5f7fa' }}>
          <Header
            style={{
              padding: '0 24px',
              background: darkMode ? '#1f1f1f' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 64,
              borderBottom: `1px solid ${darkMode ? '#303030' : '#f0f0f0'}`,
              boxShadow: 'none',
              position: 'sticky',
              top: 0,
              zIndex: 99,
            }}
          >
            {/* 左侧：面包屑（管理后台 / 当前页面） */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <span style={{ color: darkMode ? 'rgba(255,255,255,0.45)' : '#8c8c8c' }}>管理后台</span>
              <span style={{ color: darkMode ? 'rgba(255,255,255,0.25)' : '#d9d9d9' }}>/</span>
              <span style={{ color: darkMode ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.88)', fontWeight: 500 }}>
                {getPageTitle(location.pathname)}
              </span>
            </div>

            {/* 右侧操作区：前台链接 + 主题切换 + 用户菜单 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link
                to="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: darkMode ? 'rgba(255,255,255,0.65)' : '#595959',
                  fontSize: 14,
                  textDecoration: 'none',
                  padding: '6px 12px',
                  borderRadius: 8,
                  transition: 'color 0.2s, background 0.2s',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.08)' : '#f5f5f5'
                  e.currentTarget.style.color = PRIMARY_COLOR
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = darkMode ? 'rgba(255,255,255,0.65)' : '#595959'
                }}
              >
                <HomeOutlined style={{ fontSize: 15 }} /> 前台
              </Link>

              <Button
                type="text"
                aria-label="切换主题"
                icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggleAdminTheme}
                style={{ color: darkMode ? 'rgba(255,255,255,0.65)' : '#595959' }}
              />

              <Dropdown menu={userMenu} trigger={['hover', 'click']} placement="bottomRight">
                <button
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: 8,
                    color: darkMode ? 'rgba(255,255,255,0.65)' : '#595959',
                    fontSize: 14,
                  }}
                >
                  {user?.username ? (
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: PRIMARY_COLOR,
                        color: '#fff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {user.username.slice(0, 1).toUpperCase()}
                    </span>
                  ) : (
                    <UserOutlined style={{ fontSize: 16 }} />
                  )}
                  <span>{user?.username || '管理员'}</span>
                  <DownOutlined style={{ fontSize: 10, opacity: 0.6 }} />
                </button>
              </Dropdown>
            </div>
          </Header>
          <Content
            style={{
              padding: 24,
              margin: 16,
              background: darkMode ? '#1f1f1f' : '#ffffff',
              borderRadius: 8,
              minHeight: 'calc(100vh - 128px)',
              overflow: 'auto',
              transition: 'background 0.3s',
            }}
          >
            <Outlet />
          </Content>
        </AntLayout>
      </AntLayout>
    </ConfigProvider>
  )
}

export default AdminLayout
