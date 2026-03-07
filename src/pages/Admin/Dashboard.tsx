import { useState, useEffect } from 'react'
import { Card, Statistic, Row, Col, Typography, Table, Progress, Tag } from 'antd'
import EmptyState from '../../components/common/EmptyState'
import {
  FileTextOutlined,
  EyeOutlined,
  MessageOutlined,
  FireOutlined,
  UserOutlined,
  LaptopOutlined,
  ClockCircleOutlined,
  StarOutlined,
  BarChartOutlined,
  GlobalOutlined,
  MobileOutlined,
  PieChartOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie,
  LineChart, Line,
} from 'recharts'
import { articleApi } from '../../api/article'
import { statsApi } from '../../api/stats'
import { analyticsApi } from '../../api/analytics'
import VisitorMap from '../../components/admin/VisitorMap'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography

const COLORS = ['#00f0ff', '#7000ff', '#00ff88', '#ff6600', '#ff0066', '#00ccff']

function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<{ totalArticles?: number; totalMessages?: number; totalNews?: number } | null>(null)
  const [analytics, setAnalytics] = useState<{
    totalVisitors?: number
    totalPageViews?: number
    totalSessions?: number
    totalEvents?: number
    daily?: Array<{ date: string; views: number }>
    pages?: Array<{ path: string; views: number }>
    devices?: Array<{ name: string; value: number }>
    browsers?: Array<{ name: string; value: number }>
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [latestArticles, setLatestArticles] = useState<Array<{ id: number; title: string; status: string; views: number; likes: number; comment_count: number; created_at: string; updated_at?: string }>>([])
  const [recommendedArticles, setRecommendedArticles] = useState<Array<{ id: number; title: string; views: number; likes: number; recommend_order?: number; created_at: string }>>([])

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const [statsRes, analyticsRes, latestRes] = await Promise.all([
        statsApi.getStats(),
        analyticsApi.getOverview(),
        articleApi.getList({ page: 1, limit: 6, status: 'published' })
      ])
      setStats(statsRes?.data || null)
      setAnalytics(analyticsRes?.data || null)
      const articlesData = ((latestRes as unknown as { data?: Array<{ id: number; title: string; status: string; views: number; likes: number; comment_count: number; created_at: string; updated_at?: string }> }).data) || []
      setLatestArticles(articlesData)
      // 推荐文章必须是已发布的文章
      const recommendedData = articlesData.filter(a => (a as unknown as { is_recommended?: boolean }).is_recommended && a.status === 'published').slice(0, 10)
      setRecommendedArticles(recommendedData as Array<{ id: number; title: string; views: number; likes: number; recommend_order?: number; created_at: string }>)

      // 获取详细统计数据
      const [daily, pages, devices, browsers] = await Promise.all([
        analyticsApi.getDaily(7),
        analyticsApi.getPages(7),
        analyticsApi.getDevices(7),
        analyticsApi.getBrowsers(7),
      ])

      // 确保数据是数组
      const safeArray = (data: unknown) => Array.isArray(data) ? data : []

      setAnalytics(prev => ({
        ...prev,
        daily: safeArray((daily as { data?: unknown })?.data || daily.data),
        pages: safeArray((pages as { data?: unknown })?.data || pages.data),
        devices: safeArray((devices as { data?: unknown })?.data || devices.data),
        browsers: safeArray((browsers as { data?: unknown })?.data || browsers.data),
      }))
    } catch (error) {
      console.error('Fetch data error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
        {/* 科技风 Loading 动画 */}
        <div className="relative inline-block">
          {/* 外环 */}
          <div className="w-20 h-20 border-4 border-purple-300 rounded-full animate-spin" style={{ animationDuration: '2s', borderLeftColor: '#7000ff', borderTopColor: '#00f0ff' }} />
          {/* 中环 */}
          <div className="absolute top-1 left-1 w-18 h-18 border-4 border-cyan-300 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse', borderRightColor: '#00f0ff' }} />
          {/* 内环 */}
          <div className="absolute top-2 left-2 w-14 h-14 border-t-4 border-purple-400 rounded-full animate-spin" style={{ animationDuration: '1s' }} />
          {/* 中心脉冲 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full animate-pulse shadow-lg shadow-purple-500/50" />
        </div>
        <p style={{ marginTop: 24, color: '#666', fontSize: 16 }}>加载数据仪表盘中...</p>
      </div>
    )
  }

  if (!stats || !analytics) {
    return (
      <div style={{ padding: 48, textAlign: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* 空状态 - 科技风插图 */}
        <div className="relative">
          {/* 背景光晕 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />

          {/* SVG 图标 - 数据图表 */}
          <svg
            className="w-32 h-32 text-gray-400 relative z-10 mx-auto mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>

          <h3 className="text-2xl font-semibold text-gray-600 mb-3">暂无数据</h3>
          <p className="text-gray-500 text-center max-w-md">
            数据正在收集中
            <br />
            <span className="text-sm opacity-70">请稍后再来查看，统计数据将会在这里展示</span>
          </p>

          {/* 浮动装饰点 */}
          <div className="absolute top-0 right-0 w-3 h-3 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
          <div className="absolute bottom-4 left-4 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 0' }}>
      <Title level={3} style={{ marginBottom: 24 }}><BarChartOutlined style={{ marginRight: 8 }} />数据仪表盘</Title>

      {/* 世界地图 - 移到最顶部 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card title={<><GlobalOutlined style={{ marginRight: 8 }} />访客地域分布</>}>
            <VisitorMap />
          </Card>
        </Col>
      </Row>

      {/* 核心指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.55) 0%, rgba(118, 75, 162, 0.55) 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>总访客数</span>}
              value={analytics.totalVisitors || 0}
              prefix={<UserOutlined style={{ color: 'rgba(0, 0, 0, 0.65)' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.55) 0%, rgba(0, 204, 255, 0.55) 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>总浏览量</span>}
              value={analytics.totalPageViews || 0}
              prefix={<EyeOutlined style={{ color: 'rgba(0, 0, 0, 0.65)' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.55) 0%, rgba(0, 204, 136, 0.55) 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>总会话数</span>}
              value={analytics.totalSessions || 0}
              prefix={<LaptopOutlined style={{ color: 'rgba(0, 0, 0, 0.65)' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: 'linear-gradient(135deg, rgba(255, 102, 0, 0.55) 0%, rgba(255, 136, 0, 0.55) 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>总事件数</span>}
              value={analytics.totalEvents || 0}
              prefix={<ThunderboltOutlined style={{ color: 'rgba(0, 0, 0, 0.65)' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 原有统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ background: 'linear-gradient(135deg, rgba(255, 99, 132, 0.55) 0%, rgba(255, 159, 64, 0.55) 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>总文章数</span>}
              value={stats.totalArticles || 0}
              prefix={<FileTextOutlined style={{ color: 'rgba(0, 0, 0, 0.65)' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ background: 'linear-gradient(135deg, rgba(54, 162, 235, 0.55) 0%, rgba(75, 192, 192, 0.55) 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>总留言数</span>}
              value={stats.totalMessages || 0}
              prefix={<MessageOutlined style={{ color: 'rgba(0, 0, 0, 0.65)' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ background: 'linear-gradient(135deg, rgba(255, 205, 86, 0.55) 0%, rgba(255, 183, 77, 0.55) 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>总热点数</span>}
              value={stats.totalNews || 0}
              prefix={<FireOutlined style={{ color: 'rgba(0, 0, 0, 0.65)' }} />}
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
                scroll={{ x: 900 }}
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
                    width: 160,
                    render: (date) => {
                      const d = new Date(date)
                      return d.toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    },
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
          <Card title={<><ClockCircleOutlined style={{ marginRight: 8 }} />最新文章（最多显示 6 篇）</>}>
            {latestArticles.length > 0 ? (
              <Table
                dataSource={latestArticles}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ x: 1000 }}
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
                    width: 160,
                    render: (date) => {
                      const d = new Date(date)
                      return d.toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    },
                  },
                  {
                    title: '最后修改时间',
                    dataIndex: 'updated_at',
                    key: 'updated_at',
                    width: 160,
                    render: (date) => {
                      if (!date) return '-'
                      const d = new Date(date)
                      return d.toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    },
                  },
                ]}
              />
            ) : (
              <EmptyState description="暂无文章" icon="article" />
            )}
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]}>
        {/* 每日访问趋势 */}
        <Col xs={24} lg={12}>
          <Card title={<><PieChartOutlined style={{ marginRight: 8 }} />近 7 天访问趋势</>} style={{ marginBottom: 24 }}>
            {analytics.daily && analytics.daily.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#7000ff" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState description="暂无访问数据" icon="chart" />
            )}
          </Card>
        </Col>

        {/* 设备分布 */}
        <Col xs={24} lg={12}>
          <Card title={<><MobileOutlined style={{ marginRight: 8 }} />设备分布</>} style={{ marginBottom: 24 }}>
            {analytics.devices && analytics.devices.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.devices.map((entry, index) => ({
                      ...entry,
                      fill: COLORS[index % COLORS.length]
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState description="暂无设备数据" icon="data" />
            )}
          </Card>
        </Col>

        {/* 热门页面 */}
        <Col xs={24} lg={12}>
          <Card title={<><TrophyOutlined style={{ marginRight: 8 }} />热门页面 TOP 10</>} style={{ marginBottom: 24 }}>
            {analytics.pages && analytics.pages.length > 0 ? (
              <Table
                dataSource={analytics.pages}
                pagination={false}
                rowKey={(record: unknown) => `page_${(record as { path?: string }).path || ''}_`}
                size="small"
                columns={[
                  {
                    title: '页面',
                    dataIndex: 'path',
                    key: 'path',
                    render: (path: unknown) => <code style={{ fontSize: 12 }}>{String(path)}</code>,
                  },
                  {
                    title: '浏览量',
                    dataIndex: 'views',
                    key: 'views',
                    sorter: (a: unknown, b: unknown) => (b as { views: number }).views - (a as { views: number }).views,
                  },
                  {
                    title: '占比',
                    key: 'percentage',
                    render: (_: unknown, record: unknown) => {
                      const total = (analytics.pages || []).reduce((sum, p) => sum + (p as { views: number }).views, 0)
                      const percentage = total > 0 ? Math.round((((record as { views: number }).views || 0) / total) * 100) : 0
                      return <Progress percent={percentage} size="small" strokeColor="#1890ff" />
                    },
                  },
                ]}
              />
            ) : (
              <EmptyState description="暂无页面数据" icon="data" />
            )}
          </Card>
        </Col>

        {/* 浏览器分布 */}
        <Col xs={24} lg={12}>
          <Card title={<><GlobalOutlined style={{ marginRight: 8 }} />浏览器分布</>} style={{ marginBottom: 24 }}>
            {analytics.browsers && analytics.browsers.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.browsers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1890ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState description="暂无浏览器数据" icon="data" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
