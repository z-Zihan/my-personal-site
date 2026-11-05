import { useState, useEffect, useMemo } from 'react'
import { Table, Button, Popconfirm, message, Typography, Input, Space, Tooltip } from 'antd'
import type { Key } from 'antd/es/table/interface'
import { DeleteOutlined, ReloadOutlined, SearchOutlined, LinkOutlined } from '@ant-design/icons'
import { commentApi } from '../../api/comment'
import { formatDate } from '../../utils/helpers'

const { Title, Text } = Typography

interface AdminComment {
  id: string
  article_id: string
  article_title?: string
  visitor_name?: string
  visitor_id?: string
  content: string
  location?: string
  is_admin?: boolean
  created_at?: string
  [key: string]: unknown
}

function CommentManager() {
  const [comments, setComments] = useState<AdminComment[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [keyword, setKeyword] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const res = await commentApi.getList({ all: true })
      // API 返回 { data: Comment[] }，带 article_title
      const payload = res as unknown as { data?: AdminComment[] } | AdminComment[]
      const list = Array.isArray(payload) ? payload : payload?.data || []
      setComments(list)
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      message.error('加载评论失败')
    } finally {
      setLoading(false)
    }
  }

  // 前端过滤：内容 / 昵称 / 文章标题
  const filteredComments = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return comments
    return comments.filter(
      (c) =>
        (c.content || '').toLowerCase().includes(kw) ||
        (c.visitor_name || '').toLowerCase().includes(kw) ||
        (c.article_title || '').toLowerCase().includes(kw)
    )
  }, [comments, keyword])

  const handleDelete = async (id: string) => {
    setDeleting(true)
    try {
      await commentApi.delete(id as unknown as number)
      message.success('删除成功')
      // 本地移除，避免整表重拉
      setComments((prev) => prev.filter((c) => c.id !== id))
      setSelectedRowKeys((prev) => prev.filter((k) => k !== id))
    } catch (error) {
      console.error('Failed to delete comment:', error)
      message.error('删除失败')
    } finally {
      setDeleting(false)
    }
  }

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return
    setDeleting(true)
    try {
      await commentApi.batchDelete(selectedRowKeys as number[])
      message.success(`成功删除 ${selectedRowKeys.length} 条评论`)
      const deletedSet = new Set(selectedRowKeys)
      setComments((prev) => prev.filter((c) => !deletedSet.has(c.id)))
      setSelectedRowKeys([])
    } catch (error) {
      console.error('Failed to batch delete comments:', error)
      message.error('批量删除失败')
    } finally {
      setDeleting(false)
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
      title: '评论内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: { showTitle: false },
      render: (content: string) => (
        <Tooltip title={content} placement="topLeft">
          <Text style={{ maxWidth: 360 }}>{content}</Text>
        </Tooltip>
      ),
    },
    {
      title: '所属文章',
      dataIndex: 'article_title',
      key: 'article_title',
      width: 220,
      ellipsis: true,
      render: (title: string, record: AdminComment) =>
        title ? (
          <a
            href={`/blog/${record.article_id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <LinkOutlined style={{ marginRight: 4 }} />
            {title}
          </a>
        ) : (
          '-'
        ),
    },
    {
      title: '访客昵称',
      dataIndex: 'visitor_name',
      key: 'visitor_name',
      width: 120,
      ellipsis: true,
      render: (name: string, record: AdminComment) =>
        record.is_admin ? (
          <Space size={4}>
            <span>{name || '访客'}</span>
            <Text type="warning" style={{ fontSize: 12 }}>[管理员]</Text>
          </Space>
        ) : (
          name || '访客'
        ),
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 160,
      ellipsis: true,
      render: (location: string) => location || '-',
    },
    {
      title: '评论时间',
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
      render: (_: unknown, record: AdminComment) => (
        <Popconfirm
          title="删除评论"
          description="确定删除这条评论吗？"
          onConfirm={() => handleDelete(record.id)}
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true, loading: deleting }}
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
        <Title level={3} style={{ margin: 0 }}>
          评论管理
        </Title>
        <Space wrap>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
            placeholder="搜索评论内容 / 昵称 / 文章标题"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 260 }}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchComments} loading={loading}>
            刷新
          </Button>
          <Popconfirm
            title={`确定删除选中的 ${selectedRowKeys.length} 条评论吗？`}
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
      </div>

      <Table
        columns={columns}
        dataSource={filteredComments}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 15,
          showSizeChanger: true,
          pageSizeOptions: [15, 30, 50, 100],
          showTotal: (total) => `共 ${total} 条`,
          showQuickJumper: true,
        }}
        scroll={{ x: 900 }}
        rowSelection={rowSelection}
        locale={{
          emptyText: keyword ? '没有匹配的评论，试试换个关键词' : '暂无评论数据',
        }}
      />
    </div>
  )
}

export default CommentManager
