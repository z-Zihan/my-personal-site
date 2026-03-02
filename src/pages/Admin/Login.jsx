import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, Card, message, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { authApi } from '../../utils/api'
import useAuthStore from '../../store/authStore'

const { Title } = Typography

function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuthStore()

  // 检查是否是开发模式
  const isDev = new URLSearchParams(location.search).get('dev') === '1'

  // 如果已经登录，跳转到 dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // 开发模式自动登录
  useEffect(() => {
    if (isDev && !isAuthenticated()) {
      // 开发模式：自动"登录"，有效期 1 天
      const expiresAt = (Date.now() + 24 * 60 * 60 * 1000).toString()
      login('dev_token', { username: 'admin (dev)' }, expiresAt)
      message.success('🟢 开发模式 - 已自动登录（有效期 1 天）')
      navigate('/admin/dashboard', { replace: true })
    }
  }, [isDev, isAuthenticated, login, navigate])

  const handleSubmit = async (values) => {
    try {
      const { data } = await authApi.login(values)
      const expiresAt = (Date.now() + 24 * 60 * 60 * 1000).toString()
      login(data.data.token, data.data.user, expiresAt)
      message.success('登录成功（有效期 1 天）')
      navigate('/admin/dashboard')
    } catch (err) {
      message.error(err.response?.data?.error || '登录失败')
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
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)'
      }}>
        <Card style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p style={{ color: '#00ff88' }}>已登录，跳转中...</p>
        </Card>
      </div>
    )
  }

  // 登录页面（独立，无侧边栏）
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#00f0ff', marginBottom: 8 }}>
            后台管理登录
          </Title>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>请输入管理员账号</p>
        </div>

        <Form
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#00f0ff' }} />}
              placeholder="用户名"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                color: '#fff',
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#00f0ff' }} />}
              placeholder="密码"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                color: '#fff',
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              style={{
                width: '100%',
                background: '#00f0ff',
                border: 'none',
                color: '#0a0a0f',
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12 }}>
            默认账号：admin / Admin@2026Secure
          </p>
          {isDev && (
            <p style={{ color: '#00ff88', fontSize: 12, marginTop: 8 }}>
              🟢 开发模式
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}

export default AdminLogin
