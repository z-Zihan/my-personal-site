import { useState, useEffect } from 'react'
import { Card, Statistic, Row, Col, Typography, Spin, Empty, Table, Progress, Tag } from 'antd'
import {
  FileTextOutlined,
  EyeOutlined,
  MessageOutlined,
  FireOutlined,
  UserOutlined,
  LaptopOutlined,
  ClockCircleOutlined,
  StarOutlined,
} from '@ant-design/icons'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts'
import { get } from '../../utils/request'
import VisitorMap from '../../components/admin/VisitorMap'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography

const COLORS = ['#00f0ff', '#7000ff', '#00ff88', '#ff6600', '#ff0066', '#00ccff']

function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [latestArticles, setLatestArticles] = useState([])
  const [recommendedArticles, setRecommendedArticles] = useState([])

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const [statsRes, analyticsRes, latestRes] = await Promise.all([
        get('/api/stats'),
        get('/api/analytics', { type: 'overview' }),
        get('/api/articles', { page: 1, limit: 6, status: 'published' })
      ])
      setStats(statsRes.data?.data || statsRes.data)
      setAnalytics(analyticsRes.data?.data || analyticsRes.data)
      setLatestArticles(latestRes.data?.data || [])
      setRecommendedArticles(latestRes.data?.data?.filter(a => a.is_recommended).slice(0, 10) || [])

      // 获取详细统计数据
      const [daily, pages, devices, browsers] = await Promise.all([
        get('/api/analytics', { type: 'daily', days: 7 }),
        get('/api/analytics', { type: 'pages', days: 7 }),
        get('/api/analytics', { type: 'devices', days: 7 }),
        get('/api/analytics', { type: 'browsers', days: 7 }),
      ])

      // 确保数据是数组
      const safeArray = (data) => Array.isArray(data) ? data : []

      setAnalytics(prev => ({
        ...prev,
        daily: safeArray(daily.data?.data || daily.data),
        pages: safeArray(pages.data?.data || pages.data),
        devices: safeArray(devices.data?.data || devices.data),
        browsers: safeArray(browsers.data?.data || browsers.data),
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

  if (!stats || !analytics) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="暂无数据" />
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 0' }}>
      <Title level={3} style={{ marginBottom: 24 }}>📊 数据仪表盘</Title>

      {/* 世界地图 - 移到最顶部 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card title="🌍 访客地域分布">
            <VisitorMap />
          </Card>
        </Col>
      </Row>

      {/* 核心指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总访客数"
              value={analytics.totalVisitors || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#00f0ff' }}
              styles={{ content: { color: '#00f0ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总浏览量"
              value={analytics.totalPageViews || 0}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#7000ff' }}
              styles={{ content: { color: '#7000ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总会话数"
              value={analytics.totalSessions || 0}
              prefix={<LaptopOutlined />}
              valueStyle={{ color: '#00ff88' }}
              styles={{ content: { color: '#00ff88' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总事件数"
              value={analytics.totalEvents || 0}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#ff6600' }}
              styles={{ content: { color: '#ff6600' } }}
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
              value={stats.totalArticles || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#00f0ff' }}
              styles={{ content: { color: '#00f0ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="总留言数"
              value={stats.totalMessages || 0}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#00ff88' }}
              styles={{ content: { color: '#00ff88' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="总热点数"
              value={stats.totalNews || 0}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#ff6600' }}
              styles={{ content: { color: '#ff6600' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* 推荐文章模块 */}
      {recommendedArticles.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card title={<><StarOutlined style={{ color: '#fadb14', marginRight: 8 }} />推荐文章</>}>
              <Table
                dataSource={recommendedArticles}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ x: 800 }}
                columns={[
                  {
                    title: '标题',
                    dataIndex: 'title',
                    key: 'title',
                    ellipsis: true,
                    render: (title, record) => (
                      <a onClick={() => navigate(`/blog/${record.id}`)} target="_blank" rel="noopener noreferrer">
                        {title}
                      </a>
                    ),
                  },
                  {
                    title: '排序',
                    dataIndex: 'recommend_order',
                    key: 'recommend_order',
                    width: 80,
                    render: (order) => order ?? '-',
                  },
                  {
                    title: '浏览量',
                    dataIndex: 'views',
                    key: 'views',
                    width: 80,
                    sorter: (a, b) => a.views - b.views,
                  },
                  {
                    title: '点赞数',
                    dataIndex: 'likes',
                    key: 'likes',
                    width: 80,
                    sorter: (a, b) => a.likes - b.likes,
                  },
                  {
                    title: '发布时间',
                    dataIndex: 'created_at',
                    key: 'created_at',
                    width: 120,
                    render: (date) => new Date(date).toLocaleDateString('zh-CN'),
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 最新文章模块 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card title={<><ClockCircleOutlined style={{ color: '#00f0ff', marginRight: 8 }} />最新文章（最多显示 6 篇）</>}>
            {latestArticles.length > 0 ? (
              <Table
                dataSource={latestArticles}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ x: 800 }}
                columns={[
                  {
                    title: '标题',
                    dataIndex: 'title',
                    key: 'title',
                    ellipsis: true,
                    render: (title, record) => (
                      <a onClick={() => navigate(`/blog/${record.id}`)} target="_blank" rel="noopener noreferrer">
                        {title}
                      </a>
                    ),
                  },
                  {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    width: 80,
                    render: (status) => (
                      <Tag color={status === 'published' ? 'green' : 'gray'}>
                        {status === 'published' ? '已发布' : '草稿'}
                      </Tag>
                    ),
                  },
                  {
                    title: '浏览量',
                    dataIndex: 'views',
                    key: 'views',
                    width: 80,
                  },
                  {
                    title: '点赞数',
                    dataIndex: 'likes',
                    key: 'likes',
                    width: 80,
                  },
                  {
                    title: '评论数',
                    dataIndex: 'comment_count',
                    key: 'comment_count',
                    width: 80,
                  },
                  {
                    title: '创建时间',
                    dataIndex: 'created_at',
                    key: 'created_at',
                    width: 120,
                    render: (date) => new Date(date).toLocaleDateString('zh-CN'),
                  },
                ]}
              />
            ) : (
              <Empty description="暂无文章" />
            )}
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]}>
        {/* 每日访问趋势 */}
        <Col xs={24} lg={12}>
          <Card title="📈 近 7 天访问趋势" style={{ marginBottom: 24 }}>
            {analytics.daily && analytics.daily.length > 0 ? (
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
              <Empty description="暂无访问数据" style={{ padding: 40 }} />
            )}
          </Card>
        </Col>

        {/* 设备分布 */}
        <Col xs={24} lg={12}>
          <Card title="📱 设备分布" style={{ marginBottom: 24 }}>
            {analytics.devices && analytics.devices.length > 0 ? (
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
              <Empty description="暂无设备数据" style={{ padding: 40 }} />
            )}
          </Card>
        </Col>

        {/* 热门页面 */}
        <Col xs={24} lg={12}>
          <Card title="🔥 热门页面 TOP 10" style={{ marginBottom: 24 }}>
            {analytics.pages && analytics.pages.length > 0 ? (
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
                    render: (_, record) => {
                      const total = analytics.pages.reduce((sum, p) => sum + p.views, 0)
                      const percentage = total > 0 ? Math.round((record.views / total) * 100) : 0
                      return <Progress percent={percentage} size="small" strokeColor="#00f0ff" />
                    },
                  },
                ]}
              />
            ) : (
              <Empty description="暂无页面数据" style={{ padding: 40 }} />
            )}
          </Card>
        </Col>

        {/* 浏览器分布 */}
        <Col xs={24} lg={12}>
          <Card title="🌐 浏览器分布" style={{ marginBottom: 24 }}>
            {analytics.browsers && analytics.browsers.length > 0 ? (
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
              <Empty description="暂无浏览器数据" style={{ padding: 40 }} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
