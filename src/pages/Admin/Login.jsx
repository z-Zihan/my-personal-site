import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, Card, message, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { authApi } from '../../api/index'
import useAuthStore from '../../store/authStore'

const { Title } = Typography

function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuthStore()

  // 检查是否是开发模式
  const isDev = new URLSearchParams(location.search).get('dev') === '1'

  // 强制浅色模式（仅登录页）
  useEffect(() => {
    document.documentElement.classList.remove('dark')
    document.documentElement.style.backgroundColor = '#f0f2f5'
    
    return () => {
      document.documentElement.style.backgroundColor = ''
    }
  }, [])

  // 如果已经登录，跳转到 dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // 开发模式自动登录
  useEffect(() => {
    if (isDev && !isAuthenticated()) {
      const expiresAt = (Date.now() + 24 * 60 * 60 * 1000).toString()
      login('dev_token', { username: 'admin (dev)' }, expiresAt)
      message.success('🟢 开发模式 -  已自动登录')
      navigate('/admin/dashboard', { replace: true })
    }
  }, [isDev, isAuthenticated, login, navigate])

  const handleSubmit = async (values) => {
    try {
      const { data } = await authApi.login(values)
      const expiresAt = (Date.now() + 24 * 60 * 60 * 1000).toString()
      login(data?.token, data?.user, expiresAt)
      message.success('登录成功')
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
        background: '#f0f2f5'
      }}>
        <Card style={{ textAlign: 'center', background: '#ffffff' }}>
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p style={{ color: '#7000ff' }}>已登录，跳转中...</p>
        </Card>
      </div>
    )
  }

  // 登录页面（独立，浅色模式）
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#7000ff', marginBottom: 8 }}>
            后台管理登录
          </Title>
          <p style={{ color: '#666' }}>请输入管理员账号</p>
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
              prefix={<UserOutlined style={{ color: '#7000ff' }} />}
              placeholder="请输入用户名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
            style={{ marginBottom: 24 }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#7000ff' }} />}
              placeholder="请输入密码"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              style={{
                width: '100%',
                height: 44,
                background: '#7000ff',
                border: 'none',
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default AdminLogin
