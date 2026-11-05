import React from 'react'
import { Typography, Space } from 'antd'

const { Title, Text } = Typography

interface PageHeaderProps {
  /** 页面主标题 */
  title: React.ReactNode
  /** 可选副标题（标题下方的小字说明） */
  subtitle?: React.ReactNode
  /** 右侧操作区（按钮等） */
  actions?: React.ReactNode
}

/**
 * 后台统一页面标题栏：左侧标题(+副标题)，右侧操作区。
 * 所有 Admin 页面统一使用，替代各自手写的 Title + flex 布局。
 */
function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <Title level={4} style={{ margin: 0 }}>{title}</Title>
        {subtitle && (
          <Text type="secondary" style={{ fontSize: 13, marginTop: 4, display: 'block' }}>
            {subtitle}
          </Text>
        )}
      </div>
      {actions && <Space wrap>{actions}</Space>}
    </div>
  )
}

export default PageHeader
