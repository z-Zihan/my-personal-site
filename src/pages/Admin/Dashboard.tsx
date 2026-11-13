import { useState, useEffect } from 'react'
import { Card, Statistic, Row, Col, Typography, Table, Progress, Tag, Segmented, Button } from 'antd'
import EmptyState from '../../components/common/EmptyState'
import {
  FileTextOutlined,
  EyeOutlined,
  MessageOutlined,
  FireOutlined,
  UserOutlined,
  ClockCircleOutlined,
  StarOutlined,
  BarChartOutlined,
  GlobalOutlined,
  MobileOutlined,
  PieChartOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  ShareAltOutlined,
  CommentOutlined,
  SearchOutlined,
  ReadOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts'
import { articleApi } from '../../api/article'
import { statsApi } from '../../api/stats'
import { analyticsApi } from '../../api/analytics'
import VisitorMap from '../../components/admin/VisitorMap'
import PageHeader from './PageHeader'
import { useThemeStore } from '../../store/themeStore'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

const COLORS = ['#7000ff', '#1890ff', '#52c41a', '#fa8c16', '#eb2f96', '#13c2c2']

// 统计卡片：跟随主题的 Card（暗色 #1f1f1f / 亮色白底）+ 左侧色条点缀
const statAccent = (color: string) => (
  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: '8px 0 0 8px', background: color }} />
)

function Dashboard() {
  const darkMode = useThemeStore((s) => s.darkMode)
  const navigate = useNavigate()
  const [stats, setStats] = useState<{
    totalArticles?: number
    publishedArticles?: number
    totalMessages?: number
    totalNews?: number
  } | null>(null)
  const [analytics, setAnalytics] = useState<{
    totalVisitors?: number
    totalPageViews?: number
    totalSessions?: number
    totalEvents?: number
    realPageViews?: number
    trafficBreakdown?: { real?: number; bot?: number; dev?: number; owner?: number; unclassified?: number }
    daily?: Array<{ date: string; views: number }>
    pages?: Array<{ path: string; views: number }>
    devices?: Array<{ name: string; value: number }>
    browsers?: Array<{ name: string; value: number }>
    events?: Array<{ event_name: string; count: number }>
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(true)
  const [rangeDays, setRangeDays] = useState<number>(7)
  const [latestArticles, setLatestArticles] = useState<Array<{ id: number; title: string; status: string; views: number; likes: number; comment_count: number; created_at: string; updated_at?: string }>>([])
  const [recommendedArticles, setRecommendedArticles] = useState<Array<{ id: number; title: string; views: number; likes: number; recommend_order?: number; created_at: string }>>([])

  useEffect(() => {
    fetchBaseData()
  }, [])

  useEffect(() => {
    fetchChartData(rangeDays)
  }, [rangeDays])

  const fetchBaseData = async () => {
    setLoading(true)
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
    } catch (error) {
      console.error('Failed to fetch dashboard base data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChartData = async (days: number) => {
    setChartLoading(true)
    try {
      const [daily, pages, devices, browsers, events] = await Promise.all([
        analyticsApi.getDaily(days),
        analyticsApi.getPages(days),
        analyticsApi.getDevices(days),
        analyticsApi.getBrowsers(days),
        analyticsApi.getEvents(days),
      ])

      // 确保数据是数组
      const safeArray = (data: unknown) => Array.isArray(data) ? data : []

      setAnalytics(prev => ({
        ...(prev || {}),
        daily: safeArray((daily as { data?: unknown })?.data),
        pages: safeArray((pages as { data?: unknown })?.data),
        devices: safeArray((devices as { data?: unknown })?.data),
        browsers: safeArray((browsers as { data?: unknown })?.data),
        events: safeArray((events as { data?: unknown })?.data),
      }))
    } catch (error) {
      console.error('Failed to fetch dashboard charts:', error)
    } finally {
      setChartLoading(false)
    }
  }

  const publishedCount = stats?.publishedArticles || 0
  const totalCount = stats?.totalArticles || 0

  if (loading) {
    return (
      <div style={{ padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div className="relative inline-block">
          <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin" style={{ borderLeftColor: '#7000ff' }} />
          <p style={{ marginTop: 16, textAlign: 'center', color: darkMode ? 'rgba(255,255,255,0.45)' : '#999', fontSize: 14 }}>加载中...</p>
        </div>
      </div>
    )
  }

  if (!stats || !analytics) {
    return (
      <div style={{ padding: 48, textAlign: 'center', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <BarChartOutlined style={{ fontSize: 64, color: darkMode ? 'rgba(255,255,255,0.25)' : '#d9d9d9', marginBottom: 16 }} />
          <Title level={4} style={{ color: darkMode ? 'rgba(255,255,255,0.45)' : '#666' }}>暂无数据</Title>
          <Text type="secondary">数据正在收集中，请稍后再来查看</Text>
          <div style={{ marginTop: 24 }}>
            <Button icon={<ReloadOutlined />} onClick={fetchBaseData}>重新加载</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="数据仪表盘"
        actions={
          <Button icon={<ReloadOutlined />} onClick={() => { fetchBaseData(); fetchChartData(rangeDays) }} loading={loading || chartLoading}>
            刷新数据
          </Button>
        }
      />

      {/* 世界地图 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <Card title={<><GlobalOutlined style={{ marginRight: 8 }} />访客地域分布</>}>
            <VisitorMap />
          </Card>
        </Col>
      </Row>

      {/* 访问核心指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ position: 'relative', overflow: 'hidden' }}>
            {statAccent('#7000ff')}
            <Statistic
              title="总访客数"
              value={analytics.totalVisitors || 0}
              prefix={<UserOutlined style={{ color: '#7000ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ position: 'relative', overflow: 'hidden' }}>
            {statAccent('#1890ff')}
            <Statistic
              title="总浏览量"
              value={analytics.totalPageViews || 0}
              prefix={<EyeOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ position: 'relative', overflow: 'hidden' }}>
            {statAccent('#52c41a')}
            <Statistic
              title="真实访问(排除爬虫/开发/本人)"
              value={analytics.realPageViews ?? analytics.trafficBreakdown?.real ?? 0}
              prefix={<ThunderboltOutlined style={{ color: '#52c41a' }} />}
              suffix={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  爬虫 {analytics.trafficBreakdown?.bot ?? 0} · 开发 {analytics.trafficBreakdown?.dev ?? 0} · 本人 {analytics.trafficBreakdown?.owner ?? 0}
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ position: 'relative', overflow: 'hidden' }}>
            {statAccent('#fa8c16')}
            <Statistic
              title="总事件数"
              value={analytics.totalEvents || 0}
              prefix={<BarChartOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 内容统计：口径修正（发布/总数） */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ position: 'relative', overflow: 'hidden' }}>
            {statAccent('#eb2f96')}
            <Statistic
              title="文章数（已发布/全部）"
              value={publishedCount}
              suffix={<Text type="secondary" style={{ fontSize: 14 }}>/ {totalCount} 篇</Text>}
              prefix={<FileTextOutlined style={{ color: '#eb2f96' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ position: 'relative', overflow: 'hidden' }}>
            {statAccent('#13c2c2')}
            <Statistic
              title="留言数"
              value={stats.totalMessages || 0}
              prefix={<MessageOutlined style={{ color: '#13c2c2' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ position: 'relative', overflow: 'hidden' }}>
            {statAccent('#faad14')}
            <Statistic
              title="热点资讯数"
              value={stats.totalNews || 0}
              prefix={<FireOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 推荐文章模块 */}
      {recommendedArticles.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card title={<><StarOutlined style={{ color: '#faad14', marginRight: 8 }} />推荐文章</>}>
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
                    render: (date) => formatDateStr(date),
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
          <Card
            title={<><ClockCircleOutlined style={{ marginRight: 8 }} />最新文章（最多显示 6 篇）</>}
            extra={
              <a onClick={() => navigate('/admin/articles')}>管理文章 →</a>
            }
          >
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
                      <Tag color={status === 'published' ? 'green' : 'default'}>
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
                    render: (date) => formatDateStr(date),
                  },
                  {
                    title: '最后修改',
                    dataIndex: 'updated_at',
                    key: 'updated_at',
                    width: 160,
                    render: (date) => (date ? formatDateStr(date) : '-'),
                  },
                ]}
              />
            ) : (
              <EmptyState description="暂无文章" icon="article" />
            )}
          </Card>
        </Col>
      </Row>

      {/* 图表区域：带时间范围切换 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Title level={5} style={{ margin: 0 }}>趋势分析</Title>
        <Segmented
          value={rangeDays}
          onChange={(value) => setRangeDays(value as number)}
          options={[
            { label: '近 7 天', value: 7 },
            { label: '近 30 天', value: 30 },
            { label: '近 90 天', value: 90 },
          ]}
        />
      </div>
      <Row gutter={[16, 16]}>
        {/* 每日访问趋势 */}
        <Col xs={24} lg={12}>
          <Card title={<><PieChartOutlined style={{ marginRight: 8 }} />访问趋势</>} loading={chartLoading} style={{ marginBottom: 24 }}>
            {analytics.daily && analytics.daily.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#303030' : '#f0f0f0'} />
                  <XAxis dataKey="date" stroke={darkMode ? 'rgba(255,255,255,0.45)' : '#999'} fontSize={12} />
                  <YAxis stroke={darkMode ? 'rgba(255,255,255,0.45)' : '#999'} fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#7000ff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState description="暂无访问数据" icon="chart" />
            )}
          </Card>
        </Col>

        {/* 设备分布 */}
        <Col xs={24} lg={12}>
          <Card title={<><MobileOutlined style={{ marginRight: 8 }} />设备分布</>} loading={chartLoading} style={{ marginBottom: 24 }}>
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
                    dataKey="value"
                  >
                    {analytics.devices.map((entry, index) => (
                      <Cell key={`device-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
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
          <Card title={<><TrophyOutlined style={{ marginRight: 8 }} />热门页面 TOP 10</>} loading={chartLoading} style={{ marginBottom: 24 }}>
            {analytics.pages && analytics.pages.length > 0 ? (
              <Table
                dataSource={analytics.pages.slice(0, 10)}
                pagination={false}
                rowKey={(record: unknown) => `page_${(record as { path?: string }).path || ''}`}
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
                    width: 80,
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
          <Card title={<><GlobalOutlined style={{ marginRight: 8 }} />浏览器分布</>} loading={chartLoading} style={{ marginBottom: 24 }}>
            {analytics.browsers && analytics.browsers.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.browsers}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#303030' : '#f0f0f0'} />
                  <XAxis dataKey="name" stroke={darkMode ? 'rgba(255,255,255,0.45)' : '#999'} fontSize={12} />
                  <YAxis stroke={darkMode ? 'rgba(255,255,255,0.45)' : '#999'} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1890ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState description="暂无浏览器数据" icon="data" />
            )}
          </Card>
        </Col>

        {/* 用户行为事件统计 */}
        <Col xs={24}>
          <Card title={<><ThunderboltOutlined style={{ marginRight: 8, color: '#faad14' }} />用户行为事件统计</>} loading={chartLoading}>
            {analytics.events && analytics.events.length > 0 ? (
              <Table
                dataSource={analytics.events}
                pagination={false}
                rowKey="event_name"
                size="small"
                columns={[
                  {
                    title: '事件名称',
                    dataIndex: 'event_name',
                    key: 'event_name',
                    render: (eventName: string) => {
                      const eventConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
                        'article_view': { label: '文章浏览', icon: <EyeOutlined />, color: '#1890ff' },
                        'article_like': { label: '点赞', icon: <HeartOutlined />, color: '#eb2f96' },
                        'article_unlike': { label: '取消点赞', icon: <HeartOutlined />, color: '#999' },
                        'article_share': { label: '分享文章', icon: <ShareAltOutlined />, color: '#52c41a' },
                        'share_copy_link': { label: '复制链接', icon: <ShareAltOutlined />, color: '#722ed1' },
                        'comment_submit': { label: '提交评论', icon: <CommentOutlined />, color: '#fa8c16' },
                        'search_click': { label: '搜索点击', icon: <SearchOutlined />, color: '#13c2c2' },
                        'reading_progress': { label: '阅读进度', icon: <ReadOutlined />, color: '#2f54eb' },
                        'reading_complete': { label: '阅读完成', icon: <ReadOutlined />, color: '#52c41a' },
                        'click': { label: '点击', icon: <BarChartOutlined />, color: '#faad14' },
                      }
                      const config = eventConfig[eventName] || { label: eventName, icon: <BarChartOutlined />, color: '#666' }
                      return (
                        <span style={{ color: config.color }}>
                          {config.icon} {config.label}
                        </span>
                      )
                    },
                  },
                  {
                    title: '次数',
                    dataIndex: 'count',
                    key: 'count',
                    width: 100,
                    sorter: (a: { count: number }, b: { count: number }) => a.count - b.count,
                    render: (count: number) => <Tag color="blue">{count}</Tag>,
                  },
                ]}
              />
            ) : (
              <EmptyState description="暂无事件数据" icon="data" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

function formatDateStr(date: string) {
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default Dashboard
