import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, Card, message, ConfigProvider, theme as antdTheme } from 'antd'
import { UserOutlined, LockOutlined, HomeOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { authApi } from '../../api/index'
import useAuthStore, { type User } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { initAdminTheme, toggleAdminTheme } from '../../components/admin/adminTheme'

const PRIMARY_COLOR = '#7000ff'

function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuthStore()
  const [submitting, setSubmitting] = useState(false)
  const [passwordHint, setPasswordHint] = useState<string | null>(null)
  const darkMode = useThemeStore((s) => s.darkMode)

  // 检查是否是开发模式(仅本地 dev server 有效;生产构建 import.meta.env.DEV 恒为 false,
  // 防止线上通过 ?dev=1 绕过登录 —— 2026-11-13 安全修复)
  const isDev =
    import.meta.env.DEV &&
    new URLSearchParams(location.search).get('dev') === '1'

  // 主题初始化：跟随全站主题存储（未设置过则跟随系统偏好）
  useEffect(() => {
    initAdminTheme()
    document.documentElement.style.backgroundColor = darkMode ? '#141414' : '#f0f2f5'

    return () => {
      document.documentElement.style.backgroundColor = ''
    }
  }, [darkMode])

  // 如果已经登录，跳转到 dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // 拉取密码提示(公开接口;忘记密码时在登录前就能看到)
  useEffect(() => {
    let cancelled = false
    fetch('/api/password-hint')
      .then((r) => r.json())
      .then((res) => {
        const hint = res?.data?.password_hint
        if (!cancelled && typeof hint === 'string' && hint) {
          setPasswordHint(hint)
          localStorage.setItem('admin_password_hint', hint)
        }
      })
      .catch(() => {
        // 接口失败时回退 localStorage 缓存
        const cached = localStorage.getItem('admin_password_hint')
        if (!cancelled && cached) setPasswordHint(cached)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // 开发模式自动登录
  useEffect(() => {
    if (isDev && !isAuthenticated()) {
      const expiresAt = (Date.now() + 24 * 60 * 60 * 1000).toString()
      login('dev_token', { username: 'admin (dev)' }, expiresAt)
      message.success('🟢 开发模式 -  已自动登录')
      navigate('/admin/dashboard', { replace: true })
    }
  }, [isDev, isAuthenticated, login, navigate])

  const handleSubmit = async (values: { username: string; password: string }) => {
    if (submitting) return // 防止重复提交

    setSubmitting(true)
    try {
      const { data } = await authApi.login(values)
      const expiresAt = (Date.now() + 24 * 60 * 60 * 1000).toString()
      if (data?.token) {
        const user: User = data?.user as User || { username: values.username }
        const hint = data?.password_hint
        if (typeof hint === 'string' && hint) {
          localStorage.setItem('admin_password_hint', hint)
        }
        login(data.token, user, expiresAt)
        message.success('登录成功')
        navigate('/admin/dashboard')
      } else {
        message.error('登录失败：未获取到 token')
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string }; status?: number }; code?: string; message?: string }
      // 401：后端返回「用户名或密码错误」；网络层错误（无 response）统一给友好提示
      const msg =
        error.response?.data?.error ||
        (error.response ? `登录失败（${error.response.status}）` : error.code === 'ERR_NETWORK' ? '网络连接失败，请检查网络后试' : '登录失败，请稍后重试')
      // 登录失败时刷新一次密码提示(服务端可能在期间更新过)
      setPasswordHint(localStorage.getItem('admin_password_hint'))
      message.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // 如果已认证，显示加载提示
  if (isAuthenticated()) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: darkMode ? '#141414' : '#f0f2f5'
      }}>
        <Card style={{ textAlign: 'center', background: darkMode ? '#1f1f1f' : '#ffffff' }}>
          <div className="relative mb-4">
            {/* 科技风加载器 */}
            <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin" style={{ borderLeftColor: PRIMARY_COLOR, borderTopColor: '#00f0ff' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-4 border-cyan-200 rounded-full animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse', borderRightColor: '#00f0ff' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
          </div>
          <p style={{ color: PRIMARY_COLOR }}>已登录，跳转中...</p>
        </Card>
      </div>
    )
  }

  // 登录页面
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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: darkMode ? '#141414' : '#f0f2f5',
        transition: 'background 0.3s',
      }}>
        {/* 主题切换（右上角悬浮） */}
        <Button
          type="text"
          aria-label="切换主题"
          icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleAdminTheme}
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 10,
            color: darkMode ? 'rgba(255,255,255,0.65)' : '#595959',
          }}
        />

        <Card
          style={{
            width: '100%',
            maxWidth: 400,
            background: darkMode ? '#1f1f1f' : '#ffffff',
            boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
          }}
          styles={{ body: { padding: '32px' } }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: `${PRIMARY_COLOR}1a`,
                color: PRIMARY_COLOR,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <UserOutlined style={{ fontSize: 28 }} />
            </div>
            <h1 style={{ color: darkMode ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.88)', fontSize: 22, fontWeight: 600, margin: '0 0 8px' }}>
              后台管理登录
            </h1>
            <p style={{ color: darkMode ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)', margin: 0 }}>请输入管理员账号</p>
          </div>
          <Form
            name="login"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
            layout="vertical"
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
              style={{ marginBottom: 20 }}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'rgba(128,128,128,0.6)' }} />}
                placeholder="请输入用户名"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
              style={{ marginBottom: 8 }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'rgba(128,128,128,0.6)' }} />}
                placeholder="请输入密码"
                size="large"
              />
            </Form.Item>

            {passwordHint && (
              <div style={{
                marginBottom: 16,
                padding: '6px 10px',
                borderRadius: 6,
                background: darkMode ? 'rgba(112, 0, 255, 0.12)' : 'rgba(112, 0, 255, 0.06)',
                color: darkMode ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
                fontSize: 12,
              }}>
                💡 密码提示：{passwordHint}
              </div>
            )}

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={submitting}
                disabled={submitting}
                style={{
                  width: '100%',
                  height: 44,
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                color: darkMode ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
                fontSize: 13,
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = PRIMARY_COLOR }}
              onMouseLeave={(e) => { e.currentTarget.style.color = darkMode ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}
            >
              <HomeOutlined /> 返回前台
            </Link>
          </div>
        </Card>
      </div>
    </ConfigProvider>
  )
}

export default AdminLogin
