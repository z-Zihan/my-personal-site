import { useState, useEffect, useCallback, useMemo } from 'react'
import { Table, Button, Popconfirm, message, Typography, Modal, Input, Form, Space, Tag } from 'antd'
import type { Key } from 'antd/es/table/interface'
import { DeleteOutlined, ReloadOutlined, PlusOutlined, EditOutlined, SearchOutlined, LinkOutlined } from '@ant-design/icons'
import { hotNewsApi, type HotNews } from '../../api/hotNews'
import PageHeader from './PageHeader'
import { formatDate } from '../../utils/helpers'

interface AdminHotNews extends HotNews {
  id: string
  title: string
  link: string
  source?: string
  created_at?: string
}

function HotNewsManager() {
  const [newsList, setNewsList] = useState<AdminHotNews[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<AdminHotNews | null>(null)
  const [keyword, setKeyword] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [form] = Form.useForm()

  const fetchNews = useCallback(async () => {
    setLoading(true)
    try {
      const res = await hotNewsApi.getList()
      const list = Array.isArray(res)
        ? res
        : ((res as unknown as { data?: AdminHotNews[] })?.data || [])
      // 带 id 的（数据库记录）排前面，聚合 API 的无 id 数据排后面
      const withId = list.filter((n) => n.id) as AdminHotNews[]
      const withoutId = list.filter((n) => !n.id) as AdminHotNews[]
      setNewsList([...withId, ...withoutId])
    } catch (error) {
      console.error('Failed to fetch hot news:', error)
      message.error('加载热点资讯失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  // 前端过滤：标题 / 来源 / 链接
  const filteredList = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return newsList
    return newsList.filter(
      (n) =>
        (n.title || '').toLowerCase().includes(kw) ||
        (n.source || '').toLowerCase().includes(kw) ||
        (n.link || '').toLowerCase().includes(kw)
    )
  }, [newsList, keyword])

  const openCreateModal = () => {
    setEditingNews(null)
    form.setFieldsValue({ title: '', link: '', source: '' })
    setModalOpen(true)
  }

  const openEditModal = (news: AdminHotNews) => {
    setEditingNews(news)
    form.setFieldsValue({ title: news.title, link: news.link, source: news.source })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const title = (values.title || '').trim()
      const link = (values.link || '').trim()
      if (!title || !link) {
        message.warning('请填写标题和链接')
        return
      }
      setSubmitting(true)
      if (editingNews) {
        await hotNewsApi.update({ id: editingNews.id, title, link, source: (values.source || '').trim() })
        message.success('热点资讯已更新')
      } else {
        await hotNewsApi.create({ title, link, source: (values.source || '').trim() })
        message.success('热点资讯已创建')
      }
      setModalOpen(false)
      await fetchNews()
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) return
      const err = error as { response?: { data?: { error?: string } }; message?: string }
      message.error(err.response?.data?.error || err.message || '操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (news: AdminHotNews) => {
    setDeletingId(news.id)
    try {
      await hotNewsApi.delete(news.id)
      message.success('删除成功')
      setNewsList((prev) => prev.filter((n) => n.id !== news.id))
      setSelectedRowKeys((prev) => prev.filter((k) => k !== news.id))
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string }
      message.error(err.response?.data?.error || '删除失败')
    } finally {
      setDeletingId(null)
    }
  }

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return
    setDeletingId('__batch__')
    try {
      await Promise.all((selectedRowKeys as string[]).map((id) => hotNewsApi.delete(id)))
      message.success(`成功删除 ${selectedRowKeys.length} 条热点资讯`)
      const deletedSet = new Set(selectedRowKeys)
      setNewsList((prev) => prev.filter((n) => !n.id || !deletedSet.has(n.id)))
      setSelectedRowKeys([])
    } catch (error: unknown) {
      message.error('批量删除失败，请重试')
    } finally {
      setDeletingId(null)
    }
  }

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string, record: AdminHotNews) => (
        <a href={record.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
          <LinkOutlined style={{ marginRight: 4 }} />
          {title}
        </a>
      ),
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 140,
      ellipsis: true,
      render: (source: string) => (source ? <Tag>{source}</Tag> : '-'),
    },
    {
      title: '链接',
      dataIndex: 'link',
      key: 'link',
      width: 220,
      ellipsis: true,
      render: (link: string) => (
        <Typography.Text type="secondary" style={{ fontSize: 12 }} ellipsis>
          {link}
        </Typography.Text>
      ),
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
      width: 150,
      fixed: 'right' as const,
      render: (_: unknown, record: AdminHotNews) =>
        record.id ? (
          <Space size={4}>
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
              编辑
            </Button>
            <Popconfirm
              title="删除热点资讯"
              description={`确定删除「${record.title}」吗？`}
              onConfirm={() => handleDelete(record)}
              okText="删除"
              cancelText="取消"
              okButtonProps={{ danger: true, loading: deletingId === record.id }}
            >
              <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ) : (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            聚合数据（不可编辑）
          </Typography.Text>
        ),
    },
  ]

  const editableRows = newsList.filter((n) => n.id)

  return (
    <div>
      <PageHeader
        title="热点资讯管理"
        actions={<Space wrap>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="搜索标题 / 来源 / 链接"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 240 }}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchNews} loading={loading}>
            刷新
          </Button>
          <Popconfirm
            title={`确定删除选中的 ${selectedRowKeys.length} 条热点资讯吗？`}
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
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            新增热点
          </Button>
        </Space>}
      />

      <Table
        columns={columns}
        dataSource={filteredList}
        rowKey={(record) => record.id || `agg_${record.title}`}
        loading={loading}
        pagination={{
          pageSize: 15,
          showSizeChanger: true,
          pageSizeOptions: [15, 30, 50],
          showTotal: (total) => `共 ${total} 条`,
        }}
        scroll={{ x: 900 }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
          // 聚合数据（无 id）不可选中
          getCheckboxProps: (record) => ({ disabled: !record.id }),
        }}
        locale={{
          emptyText: keyword ? '没有匹配的热点资讯' : '暂无热点资讯，点击右上角「新增热点」创建',
        }}
        footer={
          editableRows.length !== newsList.length
            ? () => (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  注：前台「热点资讯」页在缓存失效时会自动聚合外部热榜数据（无 id、不可编辑），此处仅管理手动创建的资讯。
                </Typography.Text>
              )
            : undefined
        }
      />

      <Modal
        title={editingNews ? '编辑热点资讯' : '新增热点资讯'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingNews ? '保存' : '创建'}
        cancelText="取消"
        confirmLoading={submitting}
        destroyOnHidden
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="title"
            label="标题"
            rules={[
              { required: true, message: '请输入标题' },
              { max: 100, message: '标题不能超过 100 个字符' },
            ]}
          >
            <Input placeholder="热点标题" />
          </Form.Item>
          <Form.Item
            name="link"
            label="链接"
            rules={[
              { required: true, message: '请输入链接' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve()
                  try {
                    new URL(String(value))
                    return Promise.resolve()
                  } catch {
                    return Promise.reject(new Error('请输入合法的 URL（以 http:// 或 https:// 开头）'))
                  }
                },
              },
            ]}
          >
            <Input placeholder="https://example.com/article" />
          </Form.Item>
          <Form.Item name="source" label="来源（可选）">
            <Input placeholder="例如：GitHub / 微博 / 知乎" maxLength={30} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default HotNewsManager
