import { useState, useEffect } from 'react'
import { articlesApi } from '../../utils/api'
import { Table, Button, Space, Tag, Popconfirm, message, Modal, Form, Input, Select, Typography } from 'antd'
import { EditOutlined, DeleteOutlined, PoweroffOutlined, PlusOutlined } from '@ant-design/icons'
import { formatDate } from '../../utils/helpers'

const { TextArea } = Input
const { Title } = Typography

function ArticleManager() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingArticle, setEditingArticle] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const { data } = await articlesApi.getList({ limit: 100 })
      setArticles(data.data || [])
    } catch (error) {
      message.error('加载文章失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await articlesApi.delete(id)
      message.success('删除成功')
      fetchArticles()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleToggleStatus = async (article) => {
    try {
      await articlesApi.toggleStatus({ id: article.id, status: article.status })
      message.success('状态更新成功')
      fetchArticles()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleEdit = (article) => {
    setEditingArticle(article)
    form.setFieldsValue(article)
    setModalVisible(true)
  }

  const handleCreate = () => {
    setEditingArticle(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingArticle) {
        await articlesApi.update({ id: editingArticle.id, ...values })
        message.success('更新成功')
      } else {
        await articlesApi.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchArticles()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status === 'published' ? '已发布' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '阅读量',
      dataIndex: 'views',
      key: 'views',
      width: 80,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date) => formatDate(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<PoweroffOutlined />}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === 'published' ? '下架' : '上架'}
          </Button>
          <Popconfirm
            title="确定删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
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
    <div style={{ padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>文章管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建文章
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={articles}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        scroll={{ x: 1000 }}
      />

      <Modal
        title={editingArticle ? '编辑文章' : '新建文章'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入文章标题" />
          </Form.Item>
          <Form.Item
            name="summary"
            label="摘要"
          >
            <TextArea rows={2} placeholder="请输入文章摘要" />
          </Form.Item>
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextArea rows={10} placeholder="请输入文章内容" />
          </Form.Item>
          <Form.Item
            name="cover"
            label="封面图片 URL"
          >
            <Input placeholder="请输入封面图片链接" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            initialValue="draft"
          >
            <Select>
              <Select.Option value="published">已发布</Select.Option>
              <Select.Option value="draft">草稿</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ArticleManager
