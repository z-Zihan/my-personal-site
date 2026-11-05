import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Popconfirm, message, Typography, Modal, Input, Space, Form } from 'antd'
import type { Key } from 'antd/es/table/interface'
import { DeleteOutlined, ReloadOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons'
import { categoryApi } from '../../api/category'
import PageHeader from './PageHeader'
import { formatDate } from '../../utils/helpers'

interface AdminCategory {
  id: string
  name: string
  slug?: string
  color?: string
  created_at?: string
  [key: string]: unknown
}

function CategoryManager() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null)
  const [form] = Form.useForm()

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await categoryApi.getList()
      const list = Array.isArray(res)
        ? res
        : ((res as unknown as { data?: AdminCategory[] })?.data || [])
      setCategories(list as AdminCategory[])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      message.error('加载分类失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const openCreateModal = () => {
    setEditingCategory(null)
    form.setFieldsValue({ name: '' })
    setModalOpen(true)
  }

  const openEditModal = (category: AdminCategory) => {
    setEditingCategory(category)
    form.setFieldsValue({ name: category.name })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const name = (values.name || '').trim()
      if (!name) {
        message.warning('请输入分类名称')
        return
      }
      setSubmitting(true)
      if (editingCategory) {
        await categoryApi.update({ id: editingCategory.id as unknown as number, name })
        message.success('分类已重命名')
      } else {
        await categoryApi.create({ name })
        message.success('分类创建成功')
      }
      setModalOpen(false)
      await fetchCategories()
    } catch (error: unknown) {
      // validateFields 校验失败静默处理（表单已标红）
      if (error && typeof error === 'object' && 'errorFields' in error) return
      const err = error as { response?: { data?: { error?: string } }; message?: string }
      const errText = err.response?.data?.error || err.message || '操作失败'
      if (errText.includes('already exists') || errText.includes('已存在')) {
        message.error('分类名称已存在，换个名字试试')
      } else {
        message.error(errText)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (category: AdminCategory) => {
    setDeletingId(category.id)
    try {
      await categoryApi.delete(category.id as unknown as number)
      message.success(`已删除分类「${category.name}」`)
      setCategories((prev) => prev.filter((c) => c.id !== category.id))
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string }
      message.error(err.response?.data?.error || '删除失败')
    } finally {
      setDeletingId(null)
    }
  }

  const columns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 200,
      ellipsis: true,
      render: (slug: string) => <code style={{ fontSize: 12 }}>{slug || '-'}</code>,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => (date ? formatDate(date) : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: unknown, record: AdminCategory) => (
        <Space size={4}>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            重命名
          </Button>
          <Popconfirm
            title="删除分类"
            description={`确定删除「${record.name}」吗？该分类下的文章将变为未分类。`}
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
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="分类管理"
        actions={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchCategories} loading={loading}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              新建分类
            </Button>
          </Space>
        }
      />

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
        pagination={categories.length > 20 ? { pageSize: 20, showTotal: (total) => `共 ${total} 条` } : false}
        locale={{ emptyText: '暂无分类，点击右上角「新建分类」创建' }}
      />

      <Modal
        title={editingCategory ? `重命名分类：${editingCategory.name}` : '新建分类'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingCategory ? '保存' : '创建'}
        cancelText="取消"
        confirmLoading={submitting}
        destroyOnHidden
        width={420}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="分类名称"
            rules={[
              { required: true, message: '请输入分类名称' },
              { max: 20, message: '分类名称不能超过 20 个字符' },
            ]}
          >
            <Input placeholder="例如：技术、生活、随笔" onPressEnter={handleSubmit} autoFocus />
          </Form.Item>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {editingCategory
              ? '重命名后，文章与该分类的关联保持不变。'
              : '创建后可在文章编辑器中选择该分类。'}
          </Typography.Text>
        </Form>
      </Modal>
    </div>
  )
}

export default CategoryManager
