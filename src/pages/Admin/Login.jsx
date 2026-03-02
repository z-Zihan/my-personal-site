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
  const { login } = useAuthStore()

  // 检查是否是开发模式
  const isDev = new URLSearchParams(location.search).get('dev') === '1'

  // 如果已经是开发模式，直接跳转到 dashboard
  useEffect(() => {
    if (isDev) {
      // 开发模式：自动"登录"，跳转到 dashboard
      login('dev_token', { username: 'admin (dev)' })
      message.success('开发模式 - 已自动登录')
      navigate('/admin/dashboard?dev=1', { replace: true })
    }
  }, [isDev, navigate, login])

  const handleSubmit = async (values) => {
    try {
      const { data } = await authApi.login(values)
      login(data.data.token, data.data.user)
      message.success('登录成功')
      navigate('/admin/dashboard')
    } catch (err) {
      message.error(err.response?.data?.error || '登录失败')
    }
  }

  // 如果是开发模式，显示提示信息并等待跳转
  if (isDev) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)'
      }}>
        <Card style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p style={{ color: '#00ff88' }}>🟢 开发模式 - 自动登录中...</p>
        </Card>
      </div>
    )
  }

  // 正常登录模式
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
            后台管理
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
          <p style={{ color: 'rgba(0, 255, 136, 0.6)', fontSize: 12, marginTop: 8 }}>
            💡 开发模式访问：添加 ?dev=1 参数
          </p>
        </div>
      </Card>
    </div>
  )
}

export default AdminLogin
