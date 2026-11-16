import { useState } from 'react'
import { Tabs } from 'antd'
import { MessageOutlined, RobotOutlined } from '@ant-design/icons'
import PageHeader from './PageHeader'
import MessageManager from './MessageManager'
import SystemMessageManager from './SystemMessageManager'

/**
 * 留言管理（合并入口,2026-11-16）
 * Tab 1: 真实留言 —— 前台留言板展示的访客留言
 * Tab 2: 系统留言 —— seed/mock 生成的氛围留言(前台不可见)
 * 原「系统留言」独立页面/侧边栏入口已移除,统一收进本页
 */
function MessagesPage() {
  const [activeTab, setActiveTab] = useState<string>('real')

  return (
    <div>
      <PageHeader title="留言管理" />
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        destroyOnHidden
        items={[
          {
            key: 'real',
            label: (
              <span>
                <MessageOutlined style={{ marginRight: 6 }} />
                真实留言
              </span>
            ),
            children: <MessageManager />,
          },
          {
            key: 'system',
            label: (
              <span>
                <RobotOutlined style={{ marginRight: 6 }} />
                系统留言
              </span>
            ),
            children: <SystemMessageManager />,
          },
        ]}
      />
    </div>
  )
}

export default MessagesPage
