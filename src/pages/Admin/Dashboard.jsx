import { useState, useEffect } from 'react'
import { Card, Statistic, Row, Col, Typography, Spin, Empty } from 'antd'
import {
  FileTextOutlined,
  EyeOutlined,
  MessageOutlined,
  FireOutlined,
} from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { statsApi } from '../../utils/api'

const { Title } = Typography

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data } = await statsApi.getStats()
      setStats(data.data || data)
    } catch (error) {
      console.error('Fetch stats error:', error)
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

  if (!stats) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="暂无数据" />
      </div>
    )
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
              value={stats.totalArticles || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#00f0ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总阅读量"
              value={stats.totalViews || 0}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#7000ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="留言数"
              value={stats.totalMessages || 0}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#00ff88' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="热点数"
              value={stats.totalNews || 0}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#ff6600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 访问量图表 */}
      <Card title="最近 7 天访问量" style={{ marginBottom: 24 }}>
        {chartData.length > 0 ? (
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
        ) : (
          <Empty description="暂无访问数据" style={{ padding: 40 }} />
        )}
      </Card>
    </div>
  )
}

export default Dashboard
