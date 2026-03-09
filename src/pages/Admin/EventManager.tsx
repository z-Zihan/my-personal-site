import { useState, useEffect } from 'react'
import { Card, Table, Tag, Modal, Row, Col, Statistic, Typography, Progress, DatePicker, Button, Space } from 'antd'
import EmptyState from '../../components/common/EmptyState'
import {
  EyeOutlined,
  HeartOutlined,
  ShareAltOutlined,
  CommentOutlined,
  SearchOutlined,
  ReadOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  MobileOutlined,
  DesktopOutlined,
  TabletOutlined,
  CalendarOutlined,
  UserOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts'
import { analyticsApi } from '../../api/analytics'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const COLORS = ['#00f0ff', '#7000ff', '#00ff88', '#ff6600', '#ff0066', '#00ccff', '#fadb14', '#52c41a']

// 事件配置映射
const EVENT_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  'article_view': { label: '文章浏览', icon: <EyeOutlined />, color: '#1890ff', description: '用户查看文章详情页面' },
  'article_like': { label: '点赞', icon: <HeartOutlined />, color: '#eb2f96', description: '用户对文章进行点赞操作' },
  'article_unlike': { label: '取消点赞', icon: <HeartOutlined />, color: '#999', description: '用户取消文章点赞' },
  'article_share': { label: '分享文章', icon: <ShareAltOutlined />, color: '#52c41a', description: '用户分享文章到社交平台' },
  'share_copy_link': { label: '复制链接', icon: <ShareAltOutlined />, color: '#722ed1', description: '用户复制文章链接' },
  'comment_submit': { label: '提交评论', icon: <CommentOutlined />, color: '#fa8c16', description: '用户提交文章评论' },
  'search_click': { label: '搜索点击', icon: <SearchOutlined />, color: '#13c2c2', description: '用户点击搜索结果' },
  'reading_progress': { label: '阅读进度', icon: <ReadOutlined />, color: '#2f54eb', description: '用户阅读文章进度' },
  'reading_complete': { label: '阅读完成', icon: <ReadOutlined />, color: '#52c41a', description: '用户完成文章阅读' },
  'click': { label: '点击', icon: <BarChartOutlined />, color: '#faad14', description: '用户点击操作' },
}

interface EventDetail {
  eventName: string
  totalCount: number
  dailyTrend: Array<{ date: string; count: number }>
  devices: Array<{ name: string; value: number }>
  browsers: Array<{ name: string; value: number }>
  countries: Array<{ name: string; value: number }>
  pagePaths: Array<{ path: string; count: number }>
  recentEvents: Array<{
    id: number
    visitor_id: string
    page_path: string
    created_at: string
    event_data: Record<string, unknown>
  }>
}

function EventManager() {
  const [events, setEvents] = useState<Array<{ event_name: string; count: number }>>([])
  const [loading, setLoading] = useState(true)
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'days'),
    dayjs(),
  ])

  useEffect(() => {
    fetchEvents()
  }, [dateRange])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const days = dateRange[1].diff(dateRange[0], 'day') || 7
      const res = await analyticsApi.getEvents(days)
      const data = (res as { data?: Array<{ event_name: string; count: number }> }).data || []
      setEvents(data)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEventDetail = async (eventName: string) => {
    setDetailLoading(true)
    setDetailVisible(true)
    try {
      const days = dateRange[1].diff(dateRange[0], 'day') || 7
      const res = await analyticsApi.getEventDetail(eventName, days)
      const result = (res as { data?: {
        dailyTrend: Array<{ date: string; count: number }>;
        devices: Array<{ name: string; value: number }>;
        browsers: Array<{ name: string; value: number }>;
        countries: Array<{ name: string; value: number }>;
        pagePaths: Array<{ path: string; count: number }>;
        recentEvents: Array<{
          id: number;
          visitor_id: string;
          page_path: string;
          created_at: string;
          event_data: Record<string, unknown>;
        }>;
      } })

      if (result.data) {
        setSelectedEvent({
          eventName,
          totalCount: events.find(e => e.event_name === eventName)?.count || 0,
          dailyTrend: result.data.dailyTrend || [],
          devices: result.data.devices || [],
          browsers: result.data.browsers || [],
          countries: result.data.countries || [],
          pagePaths: result.data.pagePaths || [],
          recentEvents: result.data.recentEvents || [],
        })
      }
    } catch (error) {
      console.error('Failed to fetch event detail:', error)
    } finally {
      setDetailLoading(false)
    }
  }

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <MobileOutlined />
      case 'tablet':
        return <TabletOutlined />
      default:
        return <DesktopOutlined />
    }
  }

  const columns = [
    {
      title: '事件名称',
      dataIndex: 'event_name',
      key: 'event_name',
      render: (eventName: string) => {
        const config = EVENT_CONFIG[eventName] || { label: eventName, icon: <BarChartOutlined />, color: '#666' }
        return (
          <Space>
            <span style={{ color: config.color, fontSize: 18 }}>{config.icon}</span>
            <span style={{ fontWeight: 500 }}>{config.label}</span>
          </Space>
        )
      },
    },
    {
      title: '事件标识',
      dataIndex: 'event_name',
      key: 'event_id',
      render: (eventName: string) => <Tag color="blue">{eventName}</Tag>,
    },
    {
      title: '触发次数',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: { count: number }, b: { count: number }) => a.count - b.count,
      render: (count: number) => (
        <Tag color={count > 100 ? 'green' : count > 10 ? 'orange' : 'default'}>
          {count} 次
        </Tag>
      ),
    },
    {
      title: '说明',
      dataIndex: 'event_name',
      key: 'description',
      render: (eventName: string) => {
        const config = EVENT_CONFIG[eventName]
        return config?.description || '-'
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: { event_name: string }) => (
        <Button
          type="link"
          icon={<BarChartOutlined />}
          onClick={() => fetchEventDetail(record.event_name)}
        >
          查看详情
        </Button>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px 0' }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        <ThunderboltOutlined style={{ marginRight: 8, color: '#faad14' }} />
        埋点事件管理
      </Title>

      {/* 筛选区域 */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="large">
          <span>
            <CalendarOutlined style={{ marginRight: 8 }} />
            时间范围：
          </span>
          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            allowClear={false}
          />
          <Button type="primary" onClick={fetchEvents}>
            查询
          </Button>
        </Space>
      </Card>

      {/* 事件列表 */}
      <Card title={<><BarChartOutlined style={{ marginRight: 8 }} />事件列表</>}>
        <Table
          dataSource={events}
          columns={columns}
          rowKey="event_name"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 事件详情弹窗 */}
      <Modal
        title={
          selectedEvent && (
            <Space>
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => setDetailVisible(false)}
              />
              {EVENT_CONFIG[selectedEvent.eventName]?.icon}
              <span>{EVENT_CONFIG[selectedEvent.eventName]?.label || selectedEvent.eventName} - 详细分析</span>
            </Space>
          )
        }
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={1200}
        style={{ top: 20 }}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto" />
            <p style={{ marginTop: 16, color: '#666' }}>加载数据中...</p>
          </div>
        ) : selectedEvent ? (
          <div>
            {/* 概览统计 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={12} sm={6}>
                <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>总触发次数</span>}
                    value={selectedEvent.totalCount}
                    prefix={<ThunderboltOutlined style={{ color: '#fff' }} />}
                    valueStyle={{ color: '#fff' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>日均触发</span>}
                    value={Math.round(selectedEvent.totalCount / (dateRange[1].diff(dateRange[0], 'day') || 1))}
                    prefix={<CalendarOutlined style={{ color: '#fff' }} />}
                    valueStyle={{ color: '#fff' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>设备类型</span>}
                    value={selectedEvent.devices.length}
                    prefix={<MobileOutlined style={{ color: '#fff' }} />}
                    valueStyle={{ color: '#fff' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>覆盖地区</span>}
                    value={selectedEvent.countries.length}
                    prefix={<GlobalOutlined style={{ color: '#fff' }} />}
                    valueStyle={{ color: '#fff' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* 趋势图 */}
            <Card title="每日趋势" style={{ marginBottom: 24 }}>
              {selectedEvent.dailyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={selectedEvent.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#7000ff" strokeWidth={2} dot={{ fill: '#7000ff' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState description="暂无趋势数据" icon="chart" />
              )}
            </Card>

            <Row gutter={[16, 16]}>
              {/* 设备分布 */}
              <Col xs={24} lg={12}>
                <Card title={<><MobileOutlined style={{ marginRight: 8 }} />设备分布</>}>
                  {selectedEvent.devices.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={selectedEvent.devices}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {selectedEvent.devices.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

              {/* 浏览器分布 */}
              <Col xs={24} lg={12}>
                <Card title={<><GlobalOutlined style={{ marginRight: 8 }} />浏览器分布</>}>
                  {selectedEvent.browsers.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={selectedEvent.browsers}>
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

              {/* 地域分布 */}
              <Col xs={24} lg={12}>
                <Card title={<><GlobalOutlined style={{ marginRight: 8 }} />地域分布 TOP 10</>}>
                  {selectedEvent.countries.length > 0 ? (
                    <Table
                      dataSource={selectedEvent.countries.slice(0, 10)}
                      pagination={false}
                      rowKey="name"
                      size="small"
                      columns={[
                        {
                          title: '地区',
                          dataIndex: 'name',
                          key: 'name',
                          render: (name: string) => <Tag color="blue">{name}</Tag>,
                        },
                        {
                          title: '次数',
                          dataIndex: 'value',
                          key: 'value',
                          sorter: (a: { value: number }, b: { value: number }) => a.value - b.value,
                        },
                        {
                          title: '占比',
                          key: 'percentage',
                          render: (_: unknown, record: { value: number }) => {
                            const total = selectedEvent.countries.reduce((sum, c) => sum + c.value, 0)
                            const percentage = total > 0 ? Math.round((record.value / total) * 100) : 0
                            return <Progress percent={percentage} size="small" strokeColor="#1890ff" />
                          },
                        },
                      ]}
                    />
                  ) : (
                    <EmptyState description="暂无地域数据" icon="data" />
                  )}
                </Card>
              </Col>

              {/* 页面路径分布 */}
              <Col xs={24} lg={12}>
                <Card title={<><BarChartOutlined style={{ marginRight: 8 }} />页面路径 TOP 10</>}>
                  {selectedEvent.pagePaths.length > 0 ? (
                    <Table
                      dataSource={selectedEvent.pagePaths.slice(0, 10)}
                      pagination={false}
                      rowKey="path"
                      size="small"
                      columns={[
                        {
                          title: '路径',
                          dataIndex: 'path',
                          key: 'path',
                          render: (path: string) => <code style={{ fontSize: 12 }}>{path}</code>,
                        },
                        {
                          title: '次数',
                          dataIndex: 'count',
                          key: 'count',
                          sorter: (a: { count: number }, b: { count: number }) => a.count - b.count,
                        },
                      ]}
                    />
                  ) : (
                    <EmptyState description="暂无页面数据" icon="data" />
                  )}
                </Card>
              </Col>

              {/* 最近事件记录 */}
              <Col xs={24}>
                <Card title={<><CalendarOutlined style={{ marginRight: 8 }} />最近触发记录</>}>
                  {selectedEvent.recentEvents.length > 0 ? (
                    <Table
                      dataSource={selectedEvent.recentEvents.slice(0, 20)}
                      pagination={false}
                      rowKey="id"
                      size="small"
                      columns={[
                        {
                          title: '访客ID',
                          dataIndex: 'visitor_id',
                          key: 'visitor_id',
                          render: (id: string) => <Tag>{id?.slice(-8) || '-'}</Tag>,
                        },
                        {
                          title: '页面路径',
                          dataIndex: 'page_path',
                          key: 'page_path',
                          render: (path: string) => <code style={{ fontSize: 12 }}>{path}</code>,
                        },
                        {
                          title: '时间',
                          dataIndex: 'created_at',
                          key: 'created_at',
                          render: (date: string) => new Date(date).toLocaleString('zh-CN'),
                        },
                      ]}
                    />
                  ) : (
                    <EmptyState description="暂无事件记录" icon="data" />
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export default EventManager