import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../utils/api'
import useAuthStore from '../../store/authStore'
import { Layout, Form, Input, Button, Card, message, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

const { Title } = Typography

function AdminLogin() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      const { data } = await authApi.login(values)
      login(data.data.token, data.data.user)
      message.success('登录成功')
      navigate('/admin/dashboard')
    } catch (err) {
      message.error(err.response?.data?.error || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
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
                loading={loading}
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
              默认账号：admin / admin
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  )
}

export default AdminLogin
