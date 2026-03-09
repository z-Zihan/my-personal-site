import { useState } from 'react'
import { Card, Row, Col, Button, InputNumber, Typography, Space, message, Progress, Tag, Divider, Statistic } from 'antd'
import {
  MessageOutlined,
  FileTextOutlined,
  UserOutlined,
  EyeOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

interface GenerateResult {
  type: string
  count: number
  success: boolean
}

const mockDataTypes = [
  {
    key: 'messages',
    title: '留言数据',
    description: '生成留言板的留言数据，包含随机昵称、内容、位置等信息',
    icon: <MessageOutlined style={{ fontSize: 24 }} />,
    color: '#722ed1',
    defaultCount: 20,
  },
  {
    key: 'articles',
    title: '文章数据',
    description: '生成博客文章数据，包含标题、内容、摘要、封面等信息',
    icon: <FileTextOutlined style={{ fontSize: 24 }} />,
    color: '#1890ff',
    defaultCount: 10,
  },
  {
    key: 'visitors',
    title: '访客数据',
    description: '生成访客追踪数据，包含IP、地理位置、设备信息等',
    icon: <UserOutlined style={{ fontSize: 24 }} />,
    color: '#52c41a',
    defaultCount: 50,
  },
  {
    key: 'sessions',
    title: '会话数据',
    description: '生成用户会话数据，包含访问时长、页面浏览数等（需先有访客数据）',
    icon: <EyeOutlined style={{ fontSize: 24 }} />,
    color: '#faad14',
    defaultCount: 30,
  },
  {
    key: 'pageViews',
    title: '页面访问数据',
    description: '生成页面访问记录，包含页面路径、停留时间等（需先有访客数据）',
    icon: <DatabaseOutlined style={{ fontSize: 24 }} />,
    color: '#eb2f96',
    defaultCount: 100,
  },
  {
    key: 'dailyViews',
    title: '每日访问统计',
    description: '生成每日访问量统计数据，用于图表展示',
    icon: <LineChartOutlined style={{ fontSize: 24 }} />,
    color: '#13c2c2',
    defaultCount: 30,
    isDays: true,
  },
  {
    key: 'events',
    title: '事件追踪数据',
    description: '生成用户行为事件数据，如点击、滚动等（需先有访客数据）',
    icon: <ThunderboltOutlined style={{ fontSize: 24 }} />,
    color: '#fa541c',
    defaultCount: 50,
  },
]

function MockDataGenerator() {
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    mockDataTypes.forEach(type => {
      initial[type.key] = type.defaultCount
    })
    return initial
  })
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [results, setResults] = useState<GenerateResult[]>([])
  const [generatingAll, setGeneratingAll] = useState(false)

  const generateData = async (type: string) => {
    setLoading(prev => ({ ...prev, [type]: true }))

    try {
      const response = await fetch('/api/generate-mock-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, count: counts[type] }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '生成失败')
      }

      message.success(`成功生成 ${result.count} 条${mockDataTypes.find(t => t.key === type)?.title}`)
      setResults(prev => [...prev, { type, count: result.count, success: true }])
    } catch (error) {
      message.error(error instanceof Error ? error.message : '生成失败')
      setResults(prev => [...prev, { type, count: 0, success: false }])
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }))
    }
  }

  const generateAll = async () => {
    setGeneratingAll(true)
    setResults([])

    // 按顺序生成，因为有依赖关系
    const order = ['visitors', 'articles', 'messages', 'sessions', 'pageViews', 'dailyViews', 'events']

    for (const type of order) {
      const config = mockDataTypes.find(t => t.key === type)
      if (config) {
        await generateData(type)
        // 添加短暂延迟，避免请求过快
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    setGeneratingAll(false)
    message.success('全部数据生成完成！')
  }

  const totalGenerated = results.filter(r => r.success).reduce((sum, r) => sum + r.count, 0)

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Mock 数据生成器</Title>
          <Text type="secondary">一键生成测试数据，用于开发和演示</Text>
        </div>
        <Space>
          {results.length > 0 && (
            <Tag color="green" style={{ padding: '4px 12px', fontSize: 14 }}>
              已生成 {totalGenerated} 条数据
            </Tag>
          )}
          <Button
            type="primary"
            size="large"
            onClick={generateAll}
            loading={generatingAll}
            icon={<DatabaseOutlined />}
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
          >
            一键生成全部数据
          </Button>
        </Space>
      </div>

      {generatingAll && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <Progress
              percent={Math.round((results.length / mockDataTypes.length) * 100)}
              status="active"
              style={{ maxWidth: 400, margin: '0 auto' }}
            />
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              正在生成数据... ({results.length}/{mockDataTypes.length})
            </Text>
          </div>
        </Card>
      )}

      <Row gutter={[16, 16]}>
        {mockDataTypes.map(config => (
          <Col xs={24} sm={12} lg={8} xl={6} key={config.key}>
            <Card
              hoverable
              style={{
                height: '100%',
                borderColor: loading[config.key] ? config.color : undefined,
                boxShadow: loading[config.key] ? `0 0 0 2px ${config.color}22` : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: `${config.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: config.color,
                  }}
                >
                  {loading[config.key] ? <LoadingOutlined style={{ fontSize: 24 }} /> : config.icon}
                </div>
                <div style={{ marginLeft: 12, flex: 1 }}>
                  <Title level={5} style={{ margin: 0 }}>{config.title}</Title>
                </div>
                {results.find(r => r.type === config.key && r.success) && (
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                )}
              </div>

              <Paragraph
                type="secondary"
                style={{ fontSize: 12, marginBottom: 16, minHeight: 40 }}
                ellipsis={{ rows: 2 }}
              >
                {config.description}
              </Paragraph>

              <Divider style={{ margin: '12px 0' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Space>
                  <Text style={{ fontSize: 12 }}>数量:</Text>
                  <InputNumber
                    min={1}
                    max={500}
                    value={counts[config.key]}
                    onChange={(v) => setCounts(prev => ({ ...prev, [config.key]: v || 1 }))}
                    size="small"
                    style={{ width: 70 }}
                    disabled={loading[config.key] || generatingAll}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {config.isDays ? '天' : '条'}
                  </Text>
                </Space>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => generateData(config.key)}
                  loading={loading[config.key]}
                  disabled={generatingAll}
                  style={{ background: config.color, borderColor: config.color }}
                >
                  生成
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ marginTop: 24 }}>
        <Title level={5}>
          <DatabaseOutlined style={{ marginRight: 8 }} />
          使用说明
        </Title>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#666' }}>
          <li>点击「一键生成全部数据」会按正确顺序依次生成所有类型的数据</li>
          <li>也可以单独生成某个类型的数据</li>
          <li><Text type="warning">注意</Text>：会话数据、页面访问数据、事件数据依赖访客数据，请先生成访客数据</li>
          <li>生成的数据会直接插入到数据库中</li>
          <li>如果需要清空数据，请直接在数据库中操作</li>
        </ul>
      </Card>
    </div>
  )
}

export default MockDataGenerator