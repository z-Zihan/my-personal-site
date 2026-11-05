import { useState, useEffect, useMemo } from 'react'
import { messageApi, Message } from '../../api/index'
import { Table, Button, Popconfirm, message, Typography, Input, Space } from 'antd'
import type { Key } from 'antd/es/table/interface'
import { DeleteOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import PageHeader from './PageHeader'
import { formatDate } from '../../utils/helpers'

const { Text } = Typography

function MessageManager() {
  const [messages, setMessages] = useState<Message[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [keyword, setKeyword] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])

  useEffect(() => {
    fetchMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize])

  const fetchMessages = async (pageArg = page, pageSizeArg = pageSize) => {
    setLoading(true)
    try {
      // 服务端分页：返回 { data, total, hasMore }
      const res = await messageApi.getList({ page: pageArg, pageSize: pageSizeArg })
      const payload = res as unknown as { data?: Message[]; total?: number }
      setMessages(payload?.data || [])
      setTotal(payload?.total ?? payload?.data?.length ?? 0)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      message.error('加载留言失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchMessages(page, pageSize)
  }

  // 前端过滤当前页：内容 / 昵称 / 位置
  const filteredMessages = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return messages
    return messages.filter(
      (m) =>
        (m.content || '').toLowerCase().includes(kw) ||
        (m.author || '').toLowerCase().includes(kw) ||
        ((m as unknown as { location?: string }).location || '').toLowerCase().includes(kw) ||
        (m.contact || '').toLowerCase().includes(kw)
    )
  }, [messages, keyword])

  const handlePageChange = (newPage: number, newPageSize: number) => {
    if (newPageSize !== pageSize) {
      setPage(1)
      setPageSize(newPageSize)
    } else {
      setPage(newPage)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await messageApi.delete(id)
      message.success('删除成功')
      // 若当前页删完则回退一页
      if (filteredMessages.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        fetchMessages()
      }
      setSelectedRowKeys((prev) => prev.filter((k) => k !== id))
    } catch (error) {
      console.error('Failed to delete message:', error)
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
      // 批量删完当前页则回退一页
      if (filteredMessages.length === selectedRowKeys.length && page > 1) {
        setPage(page - 1)
      } else {
        fetchMessages()
      }
    } catch (error) {
      console.error('Failed to batch delete messages:', error)
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
    },
    {
      title: '访客昵称',
      dataIndex: 'author',
      key: 'author',
      width: 130,
      ellipsis: true,
      render: (author: string) => author || '访客',
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 150,
      ellipsis: true,
      render: (location: string) => location || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
      render: (date: string) => (date ? formatDate(date) : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      fixed: 'right' as const,
      render: (_: unknown, record: Message) => (
        <Popconfirm
          title="确定删除这条留言吗？"
          onConfirm={() => handleDelete(record.id as number)}
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <Button type="link" danger icon={<DeleteOutlined />} size="small">
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="留言管理"
        actions={<Space wrap>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="搜索当前页：内容 / 昵称 / 位置"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 240 }}
          />
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            刷新
          </Button>
          {selectedRowKeys.length > 0 && (
            <Text type="secondary">已选择 {selectedRowKeys.length} 项</Text>
          )}
          <Popconfirm
            title={`确定删除选中的 ${selectedRowKeys.length} 条留言吗？`}
            onConfirm={handleBatchDelete}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            disabled={selectedRowKeys.length === 0}
          >
            <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0}>
              批量删除{selectedRowKeys.length > 0 ? ` (${selectedRowKeys.length})` : ''}
            </Button>
          </Popconfirm>
        </Space>}
      />

      <Table
        columns={columns}
        dataSource={filteredMessages}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: [15, 30, 50],
          showTotal: (t) => `共 ${t} 条`,
          showQuickJumper: true,
          onChange: handlePageChange,
        }}
        scroll={{ x: 800 }}
        rowSelection={rowSelection}
        locale={{
          emptyText: keyword ? '当前页没有匹配的留言（搜索仅作用于当前页）' : '暂无留言数据',
        }}
      />
    </div>
  )
}

export default MessageManager
