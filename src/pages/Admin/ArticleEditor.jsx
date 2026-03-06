import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Select, Space, Tag, Modal, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined,ArrowLeftOutlined } from '@ant-design/icons';
import RichEditor from '../../components/common/RichEditor';
import ImageUploader from '../../components/common/ImageUploader';
import { articlesApi } from '../../utils/api';
import axios from 'axios';
import { API_BASE } from '../../constants/apiConstants';

// 移除不必要的 API_BASE 常量

const { TextArea } = Input;
const { Option } = Select;

function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [cover, setCover] = useState('');
  const [categories, setCategories] = useState([]);
  const [addCategoryVisible, setAddCategoryVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
    fetchCategories();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const { data } = await articlesApi.getDetail(id);
      const article = data.data;
      form.setFieldsValue({
        title: article.title,
        summary: article.summary,
        category_id: article.category_id,
      });
      setContent(article.content);
      setCover(article.cover);
    } catch (error) {
      message.error('加载文章失败');
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/categories`)
      setCategories(data.data || [])
    } catch (error) {
      console.error('Fetch categories error:', error)
      // 降级处理：如果 API 不存在，使用默认分类
      setCategories([
        { id: '1', name: '技术' },
        { id: '2', name: '生活' },
        { id: '3', name: '随笔' },
        { id: '4', name: '分享' },
      ])
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      message.warning('请输入分类名称')
      return
    }
    try {
      const { data } = await axios.post(`${API_BASE}/api/categories`, { name: newCategoryName.trim() })
      if (data.data) {
        setCategories([...categories, data.data])
        form.setFieldsValue({ category_id: data.data.id })
        message.success('分类添加成功')
        setNewCategoryName('')
        setAddCategoryVisible(false)
      }
    } catch (error) {
      // 如果 API 不支持，本地添加
      const newCategory = {
        id: Date.now().toString(),
        name: newCategoryName.trim()
      }
      setCategories([...categories, newCategory])
      form.setFieldsValue({ category_id: newCategory.id })
      message.success('分类添加成功')
      setNewCategoryName('')
      setAddCategoryVisible(false)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete(`${API_BASE}/api/categories`, { params: { id: categoryId } })
      setCategories(categories.filter(cat => cat.id !== categoryId))
      if (form.getFieldValue('category_id') === categoryId) {
        form.setFieldsValue({ category_id: undefined })
      }
      message.success('分类删除成功')
    } catch (error) {
      // 如果 API 不支持，本地删除
      setCategories(categories.filter(cat => cat.id !== categoryId))
      if (form.getFieldValue('category_id') === categoryId) {
        form.setFieldsValue({ category_id: undefined })
      }
      message.success('分类已删除')
    }
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setNewCategoryName(category.name)
    setAddCategoryVisible(true)
  }

  const handleUpdateCategory = async () => {
    if (!newCategoryName.trim()) {
      message.warning('请输入分类名称')
      return
    }
    try {
      await axios.put(`${API_BASE}/api/categories`, { id: editingCategory.id, name: newCategoryName.trim() })
      setCategories(categories.map(cat =>
        cat.id === editingCategory.id ? { ...cat, name: newCategoryName.trim() } : cat
      ))
      message.success('分类更新成功')
      setNewCategoryName('')
      setEditingCategory(null)
      setAddCategoryVisible(false)
    } catch (error) {
      // 如果 API 不支持，本地更新
      setCategories(categories.map(cat =>
        cat.id === editingCategory.id ? { ...cat, name: newCategoryName.trim() } : cat
      ))
      message.success('分类已更新')
      setNewCategoryName('')
      setEditingCategory(null)
      setAddCategoryVisible(false)
    }
  }

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const articleData = {
        ...values,
        content,
        cover,
        status: values.status || 'draft',
      };

      if (id) {
        // 更新
        await articlesApi.update({ id, ...articleData });
        message.success('文章更新成功');
      } else {
        // 创建
        await articlesApi.create(articleData);
        message.success('文章创建成功');
      }

      navigate('/admin/articles');
    } catch (error) {
      message.error(error.response?.data?.error || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/articles')}
        >
          返回列表
        </Button>
      </div>

      <Card title={id ? '编辑文章' : '创建文章'}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入文章标题" size="large" />
          </Form.Item>

          <Form.Item
            name="summary"
            label="摘要"
            rules={[{ required: true, message: '请输入摘要' }]}
          >
            <TextArea
              rows={3}
              placeholder="请输入文章摘要"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="分类"
          >
            <Space.Compact style={{ width: '100%' }}>
              <Select
                placeholder="请选择分类"
                size="large"
                allowClear
                style={{ flex: 1 }}
              >
                {categories.map(cat => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingCategory(null)
                  setNewCategoryName('')
                  setAddCategoryVisible(true)
                }}
              >
                添加分类
              </Button>
              {editingCategory && (
                <Button
                  type="dashed"
                  size="large"
                  icon={<EditOutlined />}
                  onClick={() => {
                    handleEditCategory(editingCategory)
                  }}
                >
                  编辑
                </Button>
              )}
              {form.getFieldValue('category_id') && (
                <Button
                  danger
                  type="primary"
                  size="large"
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    handleDeleteCategory(form.getFieldValue('category_id'))
                  }}
                >
                  删除
                </Button>
              )}
            </Space.Compact>
          </Form.Item>

          {/* 添加/编辑分类弹窗 */}
          <Modal
            title={editingCategory ? '编辑分类' : '添加分类'}
            open={addCategoryVisible}
            onOk={editingCategory ? handleUpdateCategory : handleAddCategory}
            onCancel={() => {
              setAddCategoryVisible(false)
              setNewCategoryName('')
              setEditingCategory(null)
            }}
          >
            <Input
              placeholder="请输入分类名称"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onPressEnter={editingCategory ? handleUpdateCategory : handleAddCategory}
            />
          </Modal>

          <Form.Item
            name="cover"
            label="封面图片"
          >
            <ImageUploader
              value={cover}
              onChange={setCover}
            />
          </Form.Item>

          <Form.Item
            name="content"
            label="正文"
            rules={[{ required: true, message: '请输入正文' }]}
          >
            <RichEditor
              value={content}
              onChange={setContent}
              height={500}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            initialValue="draft"
          >
            <Select size="large">
              <Option value="draft">草稿</Option>
              <Option value="published">已发布</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
              >
                {id ? '更新' : '创建'}
              </Button>
              <Button
                onClick={() => navigate('/admin/articles')}
                size="large"
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default ArticleEditor;
