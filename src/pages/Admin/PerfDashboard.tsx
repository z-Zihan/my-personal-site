import { useState, useEffect, useCallback } from 'react'
import { Card, Table, Tag, Row, Col, Statistic, Typography, Progress, Button, Space, Segmented, Tooltip } from 'antd'
import EmptyState from '../../components/common/EmptyState'
import {
  DashboardOutlined,
  BugOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer,
} from 'recharts'
import { get } from '../../utils/request'
import { API_ENDPOINTS } from '../../constants/apiConstants'
import PageHeader from './PageHeader'
import { useThemeStore } from '../../store/themeStore'

const { Text } = Typography

// Google 标准 Web Vitals 阈值：绿 <good / 黄 <needsImprovement / 红 ≥poor
const VITAL_THRESHOLDS: Record<string, { good: number; poor: number; unit: string; label: string; desc: string }> = {
  lcp: { good: 2500, poor: 4000, unit: 'ms', label: 'LCP 最大内容绘制', desc: '<2.5s 优 · <4s 良' },
  fcp: { good: 1800, poor: 3000, unit: 'ms', label: 'FCP 首次内容绘制', desc: '<1.8s 优 · <3s 良' },
  cls: { good: 0.1, poor: 0.25, unit: '', label: 'CLS 累积布局偏移', desc: '<0.1 优 · <0.25 良' },
  ttfb: { good: 800, poor: 1800, unit: 'ms', label: 'TTFB 首字节时间', desc: '<0.8s 优 · <1.8s 良' },
  inp: { good: 200, poor: 500, unit: 'ms', label: 'INP 交互延迟', desc: '<200ms 优 · <500ms 良' },
}

// 按阈值返回颜色（绿/黄/红）
const vitalColor = (metric: string, value: number): string => {
  const t = VITAL_THRESHOLDS[metric]
  if (!t || !value) return '#999'
  return value < t.good ? '#52c41a' : value < t.poor ? '#faad14' : '#f5222d'
}

interface Percentiles {
  p50: number
  p75: number
  p95: number
  count?: number
}

interface PerfOverview {
  lcp: Percentiles
  fcp: Percentiles
  cls: Percentiles
  ttfb: Percentiles
  inp: Percentiles
  dom_ready: Percentiles
  route: Percentiles
  errors: {
    total: number
    breakdown: Record<string, number>
  }
}

interface DailyTrend {
  date: string
  lcp: number
  fcp: number
  cls: number
  ttfb: number
}

interface ErrorRow {
  id: string
  type: string
  page_path: string
  data: Record<string, unknown>
  created_at: string
}

interface SlowApi {
  url: string
  method: string
  count: number
  avg: number
  p95: number
  errors: number
}

const ERROR_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  js_error: { label: 'JS 错误', color: 'red' },
  promise_error: { label: 'Promise 拒绝', color: 'orange' },
  resource_error: { label: '资源加载失败', color: 'gold' },
  api_error: { label: '接口错误', color: 'volcano' },
}

// 错误行摘要文案
const errorSummary = (type: string, data: Record<string, unknown>): string => {
  switch (type) {
    case 'js_error':
      return `${String(data.message || '')}${data.lineno ? ` (${String(data.source || '')}:${String(data.lineno)})` : ''}`
    case 'promise_error':
      return String(data.message || '')
    case 'resource_error':
      return `${String(data.tag || '')} ${String(data.url || '')}`
    case 'api_error':
      return `[${String(data.status || 0)}] ${String(data.method || '')} ${String(data.url || '')} - ${String(data.summary || '').slice(0, 80)}`
    default:
      return JSON.stringify(data).slice(0, 100)
  }
}

function PerfDashboard() {
  const darkMode = useThemeStore((s) => s.darkMode)
  const [days, setDays] = useState<number>(7)
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<PerfOverview | null>(null)
  const [daily, setDaily] = useState<DailyTrend[]>([])
  const [errors, setErrors] = useState<ErrorRow[]>([])
  const [slowApis, setSlowApis] = useState<SlowApi[]>([])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [overviewRes, dailyRes, errorsRes, apisRes] = await Promise.all([
        get<{ data?: PerfOverview }>(API_ENDPOINTS.PERF_METRICS, { type: 'overview', days }),
        get<{ data?: DailyTrend[] }>(API_ENDPOINTS.PERF_METRICS, { type: 'daily', days }),
        get<{ data?: ErrorRow[] }>(API_ENDPOINTS.PERF_METRICS, { type: 'errors', days, limit: 50 }),
        get<{ data?: SlowApi[] }>(API_ENDPOINTS.PERF_METRICS, { type: 'slow_apis', days }),
      ])
      setOverview((overviewRes as unknown as { data?: PerfOverview }).data || null)
      setDaily((dailyRes as unknown as { data?: DailyTrend[] }).data || [])
      setErrors((errorsRes as unknown as { data?: ErrorRow[] }).data || [])
      setSlowApis((apisRes as unknown as { data?: SlowApi[] }).data || [])
    } catch (error) {
      console.error('Failed to fetch perf data:', error)
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Web Vitals 卡片
  const renderVitalCard = (metric: string) => {
    const t = VITAL_THRESHOLDS[metric]
    const p = overview?.[metric as keyof PerfOverview] as Percentiles | undefined
    const p75 = p?.p75 || 0
    const display = metric === 'cls' ? p75.toFixed(3) : `${Math.round(p75)}${t.unit ? ` ${t.unit}` : ''}`
    const color = vitalColor(metric, p75)

    return (
      <Col xs={12} sm={8} lg={4} xl={4} key={metric}>
        <Card style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: color }} />
          <Tooltip title={`${t.desc} · 样本数 ${p?.count || 0} · P50 ${metric === 'cls' ? (p?.p50 || 0).toFixed(3) : Math.round(p?.p50 || 0)} / P95 ${metric === 'cls' ? (p?.p95 || 0).toFixed(3) : Math.round(p?.p95 || 0)}`}>
            <Statistic
              title={t.label}
              value={display}
              valueStyle={{ color, fontSize: 22, fontWeight: 600 }}
              prefix={<DashboardOutlined style={{ color }} />}
            />
          </Tooltip>
          <Text type="secondary" style={{ fontSize: 11 }}>{t.desc}（P75）</Text>
        </Card>
      </Col>
    )
  }

  // 趋势图 Y 轴单位
  const chartYUnit = (metric: string) => (metric === 'cls' ? '' : ' ms')

  return (
    <div>
      <PageHeader
        title={
          <span>
            <DashboardOutlined style={{ marginRight: 8, color: '#7000ff' }} />
            性能监控
          </span>
        }
        subtitle="Web Vitals / 路由耗时 / 错误 / 慢接口一览"
        actions={
          <Space>
            <Segmented
              value={days}
              onChange={(value) => setDays(value as number)}
              options={[
                { label: '近 7 天', value: 7 },
                { label: '近 30 天', value: 30 },
              ]}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchAll}>
              刷新
            </Button>
          </Space>
        }
      />

      {/* 核心 Web Vitals 卡片（P75，Google 阈值着色） */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {Object.keys(VITAL_THRESHOLDS).map(renderVitalCard)}
        <Col xs={12} sm={8} lg={4} xl={4}>
          <Card style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: '#7000ff' }} />
            <Statistic
              title="路由切换 P75"
              value={Math.round(overview?.route?.p75 || 0)}
              suffix="ms"
              prefix={<ThunderboltOutlined style={{ color: '#7000ff' }} />}
            />
            <Text type="secondary" style={{ fontSize: 11 }}>SPA 路由切换耗时</Text>
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4} xl={4}>
          <Card style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: (overview?.errors?.total || 0) > 50 ? '#f5222d' : '#52c41a' }} />
            <Statistic
              title="错误总数"
              value={overview?.errors?.total || 0}
              prefix={<BugOutlined style={{ color: (overview?.errors?.total || 0) > 50 ? '#f5222d' : '#52c41a' }} />}
            />
            <Text type="secondary" style={{ fontSize: 11 }}>JS/Promise/资源/接口错误</Text>
          </Card>
        </Col>
      </Row>

      {/* Web Vitals 趋势图 */}
      <Card title={<><GlobalOutlined style={{ marginRight: 8 }} />Web Vitals 每日趋势（P75）</>} style={{ marginBottom: 24 }}>
        {daily.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#303030' : '#eee'} />
              <XAxis dataKey="date" stroke={darkMode ? 'rgba(255,255,255,0.45)' : '#666'} />
              <YAxis stroke={darkMode ? 'rgba(255,255,255,0.45)' : '#666'} />
              <ReTooltip />
              <Line type="monotone" dataKey="lcp" name="LCP" stroke="#7000ff" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="fcp" name="FCP" stroke="#1890ff" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ttfb" name="TTFB" stroke="#52c41a" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cls" name="CLS" stroke="#faad14" strokeWidth={2} dot={false} yAxisId={0} hide={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState description="暂无趋势数据（需前台产生访问后才有数据）" icon="chart" />
        )}
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* 错误列表 */}
        <Col xs={24} lg={14}>
          <Card title={<><BugOutlined style={{ marginRight: 8 }} />最近错误（{errors.length} 条）</>}>
            <Table
              dataSource={errors}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 10, showSizeChanger: false }}
              columns={[
                {
                  title: '类型',
                  dataIndex: 'type',
                  key: 'type',
                  width: 110,
                  render: (type: string) => {
                    const cfg = ERROR_TYPE_LABELS[type] || { label: type, color: 'default' }
                    return <Tag color={cfg.color}>{cfg.label}</Tag>
                  },
                },
                {
                  title: '内容',
                  key: 'summary',
                  ellipsis: true,
                  render: (_: unknown, record: ErrorRow) => (
                    <Text style={{ fontSize: 12 }} ellipsis={{ tooltip: errorSummary(record.type, record.data) }}>
                      {errorSummary(record.type, record.data)}
                    </Text>
                  ),
                },
                {
                  title: '页面',
                  dataIndex: 'page_path',
                  key: 'page_path',
                  width: 130,
                  render: (path: string) => <code style={{ fontSize: 11 }}>{path}</code>,
                },
                {
                  title: '时间',
                  dataIndex: 'created_at',
                  key: 'created_at',
                  width: 150,
                  render: (date: string) => (
                    <Space size={4}>
                      <ClockCircleOutlined style={{ color: '#999' }} />
                      <Text type="secondary" style={{ fontSize: 11 }}>{new Date(date).toLocaleString('zh-CN')}</Text>
                    </Space>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* 慢接口 Top10 */}
        <Col xs={24} lg={10}>
          <Card title={<><ThunderboltOutlined style={{ marginRight: 8 }} />慢接口 TOP 10</>}>
            {slowApis.length > 0 ? (
              <Table
                dataSource={slowApis}
                rowKey="url"
                size="small"
                pagination={false}
                columns={[
                  {
                    title: '接口',
                    key: 'url',
                    ellipsis: true,
                    render: (_: unknown, record: SlowApi) => (
                      <Space size={4}>
                        <Tag color="blue" style={{ fontSize: 10 }}>{record.method}</Tag>
                        <Text style={{ fontSize: 11 }} ellipsis={{ tooltip: record.url }}>{record.url.replace('/api/', '')}</Text>
                      </Space>
                    ),
                  },
                  {
                    title: 'P95',
                    dataIndex: 'p95',
                    key: 'p95',
                    width: 80,
                    sorter: (a: SlowApi, b: SlowApi) => a.p95 - b.p95,
                    render: (p95: number) => (
                      <Tag color={p95 > 3000 ? 'red' : p95 > 1000 ? 'orange' : 'green'}>{Math.round(p95)}ms</Tag>
                    ),
                  },
                  {
                    title: '次数',
                    dataIndex: 'count',
                    key: 'count',
                    width: 60,
                  },
                  {
                    title: '错误',
                    dataIndex: 'errors',
                    key: 'errors',
                    width: 60,
                    render: (errors: number) => errors > 0 ? <Tag color="red">{errors}</Tag> : <Text type="secondary">0</Text>,
                  },
                ]}
              />
            ) : (
              <EmptyState description="暂无慢接口记录" icon="data" />
            )}
          </Card>
        </Col>
      </Row>

      {/* 错误分类统计 */}
      {overview?.errors?.breakdown && Object.keys(overview.errors.breakdown).length > 0 && (
        <Card title="错误分类统计" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            {Object.entries(overview.errors.breakdown).map(([type, count]) => {
              const cfg = ERROR_TYPE_LABELS[type] || { label: type, color: 'blue' }
              const total = overview.errors.total || 1
              return (
                <Col xs={12} sm={6} key={type}>
                  <div style={{ marginBottom: 8 }}>
                    <Tag color={cfg.color}>{cfg.label}</Tag>
                    <Text strong>{count}</Text>
                  </div>
                  <Progress percent={Math.round((count / total) * 100)} size="small" strokeColor="#7000ff" />
                </Col>
              )
            })}
          </Row>
        </Card>
      )}
    </div>
  )
}

export default PerfDashboard
