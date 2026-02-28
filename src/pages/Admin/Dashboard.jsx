import { useState, useEffect } from 'react'
import { useStats } from '../../hooks/useStats'
import { Card, Statistic, Row, Col, Table, Tag } from 'antd'
import {
  FileTextOutlined,
  EyeOutlined,
  MessageOutlined,
  FireOutlined,
} from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function Dashboard() {
  const { stats, loading, refetch } = useStats()

  useEffect(() => {
    refetch()
  }, [])

  if (loading || !stats) {
    return <div className="p-6">加载中...</div>
  }

  // 格式化每日访问数据
  const chartData = (stats.dailyViews || []).map((item) => ({
    date: new Date(item.date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
    views: item.count,
  }))

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">仪表盘</h1>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-8">
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
      <Card title="最近 7 天访问量" className="mb-8">
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

      {/* 快速操作 */}
      <Card title="快速操作">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              className="text-center cursor-pointer"
              onClick={() => (window.location.href = '/admin/articles')}
            >
              <FileTextOutlined className="text-3xl text-primary mb-2" />
              <p>管理文章</p>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              className="text-center cursor-pointer"
              onClick={() => (window.location.href = '/admin/messages')}
            >
              <MessageOutlined className="text-3xl text-green mb-2" />
              <p>管理留言</p>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default Dashboard
