import { useState, useEffect } from 'react'
import { Card, Statistic, Row, Col, Typography, Spin, Empty, Table, Progress } from 'antd'
import {
  FileTextOutlined,
  EyeOutlined,
  MessageOutlined,
  FireOutlined,
  UserOutlined,
  GlobalOutlined,
  LaptopOutlined,
} from '@ant-design/icons'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts'
import axios from 'axios'

const { Title } = Typography

const COLORS = ['#00f0ff', '#7000ff', '#00ff88', '#ff6600', '#ff0066', '#00ccff']

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        axios.get('/api/stats'),
        axios.get('/api/analytics?type=overview')
      ])
      setStats(statsRes.data.data || statsRes.data)
      setAnalytics(analyticsRes.data.data || analyticsRes.data)

      // 获取详细统计数据
      const [daily, pages, devices, browsers] = await Promise.all([
        axios.get('/api/analytics?type=daily&days=7'),
        axios.get('/api/analytics?type=pages&days=7'),
        axios.get('/api/analytics?type=devices&days=7'),
        axios.get('/api/analytics?type=browsers&days=7'),
      ])

      setAnalytics(prev => ({
        ...prev,
        daily: daily.data.data || daily.data,
        pages: pages.data.data || pages.data,
        devices: devices.data.data || devices.data,
        browsers: browsers.data.data || browsers.data,
      }))
    } catch (error) {
      console.error('Fetch data error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>加载数据中...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 0' }}>
      <Title level={3} style={{ marginBottom: 24 }}>📊 数据仪表盘</Title>

      {/* 核心指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总访客数"
              value={analytics?.totalVisitors || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#00f0ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总浏览量"
              value={analytics?.totalPageViews || 0}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#7000ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总会话数"
              value={analytics?.totalSessions || 0}
              prefix={<LaptopOutlined />}
              valueStyle={{ color: '#00ff88' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总事件数"
              value={analytics?.totalEvents || 0}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#ff6600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 原有统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="总文章数"
              value={stats?.totalArticles || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#00f0ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="总留言数"
              value={stats?.totalMessages || 0}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#00ff88' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="总热点数"
              value={stats?.totalNews || 0}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#ff6600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]}>
        {/* 每日访问趋势 */}
        <Col xs={24} lg={12}>
          <Card title="📈 近 7 天访问趋势" style={{ marginBottom: 24 }}>
            {analytics?.daily && analytics.daily.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid #00f0ff',
                      borderRadius: '8px',
                    }}
                  />
                  <Line type="monotone" dataKey="views" stroke="#00f0ff" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="暂无数据" style={{ padding: 40 }} />
            )}
          </Card>
        </Col>

        {/* 设备分布 */}
        <Col xs={24} lg={12}>
          <Card title="📱 设备分布" style={{ marginBottom: 24 }}>
            {analytics?.devices && analytics.devices.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.devices}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.devices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="暂无数据" style={{ padding: 40 }} />
            )}
          </Card>
        </Col>

        {/* 热门页面 */}
        <Col xs={24} lg={12}>
          <Card title="🔥 热门页面 TOP 10" style={{ marginBottom: 24 }}>
            {analytics?.pages && analytics.pages.length > 0 ? (
              <Table
                dataSource={analytics.pages}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: '页面',
                    dataIndex: 'path',
                    key: 'path',
                    render: (path) => <code style={{ fontSize: 12 }}>{path}</code>,
                  },
                  {
                    title: '浏览量',
                    dataIndex: 'views',
                    key: 'views',
                    sorter: (a, b) => b.views - a.views,
                  },
                  {
                    title: '占比',
                    key: 'percentage',
                    render: (_, record, index) => {
                      const total = analytics.pages.reduce((sum, p) => sum + p.views, 0)
                      const percentage = Math.round((record.views / total) * 100)
                      return <Progress percent={percentage} size="small" strokeColor="#00f0ff" />
                    },
                  },
                ]}
              />
            ) : (
              <Empty description="暂无数据" style={{ padding: 40 }} />
            )}
          </Card>
        </Col>

        {/* 浏览器分布 */}
        <Col xs={24} lg={12}>
          <Card title="🌐 浏览器分布" style={{ marginBottom: 24 }}>
            {analytics?.browsers && analytics.browsers.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.browsers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid #00f0ff',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#7000ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="暂无数据" style={{ padding: 40 }} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
