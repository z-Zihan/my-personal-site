import { useState, useEffect } from 'react'
import { messageApi, Message } from '../../api/index'
import { Table, Button, Popconfirm, message, Typography, Popover, Space } from 'antd'
import type { Key } from 'antd/es/table/interface'
import { DeleteOutlined } from '@ant-design/icons'
import { formatDate } from '../../utils/helpers'

const { Title } = Typography

function MessageManager() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const { data } = await messageApi.getList()
      setMessages(data || [])
    } catch (error) {
      message.error('加载留言失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await messageApi.delete(id)
      message.success('删除成功')
      fetchMessages()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的留言')
      return
    }
    try {
      await messageApi.batchDelete(selectedRowKeys as number[])
      message.success(`成功删除 ${selectedRowKeys.length} 条留言`)
      setSelectedRowKeys([])
      fetchMessages()
    } catch (error) {
      message.error('批量删除失败')
    }
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys)
    },
  }

  const columns = [
    {
      title: '留言内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    } as const,
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 150,
      ellipsis: true,
      render: (location: string) => location ? (
        <Popover content={location} title="地理位置">
          <span style={{ cursor: 'pointer', color: '#1890ff' }}>{location}</span>
        </Popover>
      ) : '-',
    } as const,
    {
      title: '访客 ID',
      dataIndex: 'visitor_id',
      key: 'visitor_id',
      width: 150,
      render: (id: string) => `...${id?.slice(-8)}`,
    } as const,
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => formatDate(date),
    } as const,
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_: unknown, record: Message) => (
        <Popconfirm
          title="确定删除吗？"
          onConfirm={() => handleDelete(record.id as number)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    } as const,
  ]

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>留言管理</Title>
        <Space>
          {selectedRowKeys.length > 0 && (
            <span style={{ color: '#666' }}>已选择 {selectedRowKeys.length} 项</span>
          )}
          <Popconfirm
            title={`确定删除选中的 ${selectedRowKeys.length} 条留言吗？`}
            onConfirm={handleBatchDelete}
            okText="确定"
            cancelText="取消"
            disabled={selectedRowKeys.length === 0}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={selectedRowKeys.length === 0}
            >
              批量删除
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={messages}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        scroll={{ x: 800 }}
        rowSelection={rowSelection}
      />
    </div>
  )
}

export default MessageManager
