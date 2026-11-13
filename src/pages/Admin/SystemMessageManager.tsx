import { useState, useEffect, useMemo } from 'react'
import { messageApi, Message } from '../../api/index'
import { Table, Button, Popconfirm, message, Typography, Input, Space, Modal, Form, InputNumber, Tag, Tooltip } from 'antd'
import { DeleteOutlined, ReloadOutlined, SearchOutlined, EditOutlined, ThunderboltOutlined } from '@ant-design/icons'
import type { Key } from 'antd/es/table/interface'
import PageHeader from './PageHeader'
import { formatDate } from '../../utils/helpers'

const { Text } = Typography

/** 来源标记(与 src/utils/messageFlags.ts 分类规则一致) */
function originTag(visitorId: string | undefined) {
  const id = visitorId || ''
  if (id.startsWith('mock_visitor_')) return <Tag color="purple">mock</Tag>
  if (id.startsWith('intl_')) return <Tag color="geekblue">intl seed</Tag>
  if (/^visitor_\d+$/.test(id)) return <Tag color="cyan">seed</Tag>
  return <Tag>unknown</Tag>
}

function SystemMessageManager() {
  const [messages, setMessages] = useState<Message[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [keyword, setKeyword] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [editing, setEditing] = useState<Message | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [genOpen, setGenOpen] = useState(false)
  const [genCount, setGenCount] = useState(10)
  const [genLoading, setGenLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize])

  const fetchMessages = async (pageArg = page, pageSizeArg = pageSize) => {
    setLoading(true)
    try {
      const res = await messageApi.getSystemList({ page: pageArg, pageSize: pageSizeArg })
      const payload = res as unknown as { data?: Message[]; total?: number }
      setMessages(payload?.data || [])
      setTotal(payload?.total ?? 0)
    } catch (error) {
      console.error('Failed to fetch system messages:', error)
      message.error('加载系统留言失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => fetchMessages(page, pageSize)

  const filteredMessages = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return messages
    return messages.filter(
      (m) =>
        (m.content || '').toLowerCase().includes(kw) ||
        ((m as unknown as { visitor_name?: string }).visitor_name || '').toLowerCase().includes(kw) ||
        ((m as unknown as { location?: string }).location || '').toLowerCase().includes(kw)
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

  const handleDelete = async (id: string) => {
    try {
      await messageApi.delete(id as unknown as number)
      message.success('删除成功')
      if (filteredMessages.length === 1 && page > 1) setPage(page - 1)
      else fetchMessages()
      setSelectedRowKeys((prev) => prev.filter((k) => k !== id))
    } catch {
      message.error('删除失败')
    }
  }

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return
    try {
      await messageApi.batchDelete(selectedRowKeys as number[])
      message.success(`成功删除 ${selectedRowKeys.length} 条留言`)
      setSelectedRowKeys([])
      if (filteredMessages.length === selectedRowKeys.length && page > 1) setPage(page - 1)
      else fetchMessages()
    } catch {
      message.error('批量删除失败')
    }
  }

  const openEdit = (record: Message) => {
    setEditing(record)
    form.setFieldsValue({
      content: record.content,
      visitor_name: (record as unknown as { visitor_name?: string }).visitor_name,
      location: (record as unknown as { location?: string }).location,
      likes: (record as unknown as { likes?: number }).likes ?? 0,
    })
    setEditOpen(true)
  }

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields()
      await messageApi.update({ id: editing?.id as unknown as string, ...values })
      message.success('更新成功')
      setEditOpen(false)
      setEditing(null)
      fetchMessages()
    } catch {
      // validateFields 校验失败不提示
    }
  }

  const handleGenerate = async () => {
    setGenLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch('/api/generate-mock-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ type: 'messages', count: genCount }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || '生成失败')
      message.success(`已生成 ${result.count} 条系统留言(仅后台可见,前台不展示)`)
      setGenOpen(false)
      fetchMessages(1, pageSize)
      setPage(1)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '生成失败')
    } finally {
      setGenLoading(false)
    }
  }

  const columns = [
    {
      title: '来源',
      key: 'origin',
      width: 100,
      render: (_: unknown, record: Message) => originTag((record as unknown as { visitor_id?: string }).visitor_id),
    },
    {
      title: '留言内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: { showTitle: false },
      render: (content: string) => <Tooltip title={content}>{content}</Tooltip>,
    },
    {
      title: '昵称',
      key: 'visitor_name',
      width: 120,
      ellipsis: true,
      render: (_: unknown, record: Message) =>
        (record as unknown as { visitor_name?: string }).visitor_name || '访客',
    },
    {
      title: '位置',
      key: 'location',
      width: 140,
      ellipsis: true,
      render: (_: unknown, record: Message) => (record as unknown as { location?: string }).location || '-',
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (date: string) => (date ? formatDate(date) : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, record: Message) => (
        <Space size={4}>
          <Button type="link" icon={<EditOutlined />} size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除这条系统留言吗？"
            onConfirm={() => handleDelete((record as unknown as { id: string }).id)}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="系统留言（生成的数据）"
        actions={
          <Space wrap>
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
            <Button type="primary" icon={<ThunderboltOutlined />} onClick={() => setGenOpen(true)}>
              生成留言
            </Button>
            {selectedRowKeys.length > 0 && <Text type="secondary">已选择 {selectedRowKeys.length} 项</Text>}
            <Popconfirm
              title={`确定删除选中的 ${selectedRowKeys.length} 条系统留言吗？`}
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
          </Space>
        }
      />

      <Typography.Paragraph type="warning" style={{ marginBottom: 16 }}>
        这里管理的是系统生成的氛围留言（seed / mock）。前台留言板自 2026-11-13 起只展示真实访客留言，
        此处数据的增删改<b>不会影响前台展示</b>；仪表盘的「留言数」也只统计真实留言。
      </Typography.Paragraph>

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
        scroll={{ x: 900 }}
        rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys) }}
        locale={{
          emptyText: keyword ? '当前页没有匹配的留言（搜索仅作用于当前页）' : '暂无系统留言',
        }}
      />

      <Modal
        title="编辑系统留言"
        open={editOpen}
        onOk={handleEditSubmit}
        onCancel={() => {
          setEditOpen(false)
          setEditing(null)
        }}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="content"
            label="留言内容"
            rules={[{ required: true, message: '内容不能为空' }]}
          >
            <Input.TextArea rows={4} maxLength={500} showCount />
          </Form.Item>
          <Form.Item name="visitor_name" label="昵称">
            <Input maxLength={30} placeholder="访客昵称" />
          </Form.Item>
          <Form.Item name="location" label="位置">
            <Input maxLength={60} placeholder="如：Beijing / Tokyo" />
          </Form.Item>
          <Form.Item name="likes" label="点赞数">
            <InputNumber min={0} precision={0} style={{ width: 120 }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="生成系统留言"
        open={genOpen}
        onOk={handleGenerate}
        onCancel={() => setGenOpen(false)}
        okText={genLoading ? '生成中…' : '生成'}
        cancelText="取消"
        confirmLoading={genLoading}
      >
        <Typography.Paragraph type="secondary">
          使用内置 mock 生成器创建氛围留言。生成后只出现在本页（系统留言），前台留言板不会展示。
        </Typography.Paragraph>
        <Space>
          <span>数量：</span>
          <InputNumber min={1} max={100} value={genCount} onChange={(v) => setGenCount(v || 10)} />
          <span>条</span>
        </Space>
      </Modal>
    </div>
  )
}

export default SystemMessageManager
