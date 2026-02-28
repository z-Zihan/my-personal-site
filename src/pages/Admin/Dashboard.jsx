import { useEffect } from 'react'
import { useStats } from '../../hooks/useStats'
import { Card, Statistic, Row, Col, Typography } from 'antd'
import {
  FileTextOutlined,
  EyeOutlined,
  MessageOutlined,
  FireOutlined,
} from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const { Title } = Typography

function Dashboard() {
  const { stats, loading, refetch } = useStats()

  useEffect(() => {
    refetch()
  }, [])

  if (loading || !stats) {
    return <div style={{ padding: 24 }}>加载中...</div>
  }

  // 格式化每日访问数据
  const chartData = (stats.dailyViews || []).map((item) => ({
    date: new Date(item.date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
    views: item.count,
  }))

  return (
    <div style={{ padding: '24px 0' }}>
      <Title level={3} style={{ marginBottom: 24 }}>仪表盘</Title>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总文章数"
              value={stats.totalArticles}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#00f0ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总阅读量"
              value={stats.totalViews}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#7000ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="留言数"
              value={stats.totalMessages}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#00ff88' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="热点数"
              value={stats.totalNews}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#ff6600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 访问量图表 */}
      <Card title="最近 7 天访问量" style={{ marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
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
            <Bar dataKey="views" fill="#00f0ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

export default Dashboard
