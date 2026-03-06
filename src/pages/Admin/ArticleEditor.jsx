import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Select, Space, Tag, Modal, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined,ArrowLeftOutlined } from '@ant-design/icons';
import RichEditor from '../../components/common/RichEditor';
import ImageUploader from '../../components/common/ImageUploader';
import { articlesApi } from '../../utils/api';
import { categoryApi } from '../../api/category';

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
  const [categoryLoading, setCategoryLoading] = useState(false);

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
      const res = await categoryApi.getList()
      const list = Array.isArray(res) ? res : (res.data || [])
      setCategories(list)
    } catch (error) {
      console.error('Fetch categories error:', error)
      message.error('加载分类失败')
      setCategories([])
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      message.warning('请输入分类名称')
      return
    }
    setCategoryLoading(true)
    try {
      const { data } = await categoryApi.create({ name: newCategoryName.trim() })
      console.log('Add category response:', data)
      // 重新获取分类列表
      await fetchCategories()
      message.success('分类添加成功')
      setNewCategoryName('')
      setAddCategoryVisible(false)
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || '添加失败'
      // 检查是否重复（通过错误消息判断）
      if (errorMessage.includes('already exists') || errorMessage.includes('已存在')) {
        message.error('分类名称已存在')
      } else {
        message.error(errorMessage)
      }
    } finally {
      setCategoryLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId, categoryName) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除分类"${categoryName}"吗？`,
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      okButtonProps: { loading: categoryLoading },
      onOk: async () => {
        setCategoryLoading(true)
        try {
          await categoryApi.delete(categoryId)
          setCategories(categories.filter(cat => cat.id !== categoryId))
          if (form.getFieldValue('category_id') === categoryId) {
            form.setFieldsValue({ category_id: undefined })
          }
          message.success('分类删除成功')
        } catch (error) {
          message.error(error.response?.data?.error || '删除失败')
        } finally {
          setCategoryLoading(false)
        }
      },
    })
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
    setCategoryLoading(true)
    try {
      const { data } = await categoryApi.update({ id: editingCategory.id, name: newCategoryName.trim() })
      // 重新获取分类列表
      await fetchCategories()
      message.success('分类更新成功')
      setNewCategoryName('')
      setEditingCategory(null)
      setAddCategoryVisible(false)
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || '更新失败'
      // 检查是否重复（通过错误消息判断）
      if (errorMessage.includes('already exists') || errorMessage.includes('已存在')) {
        message.error('分类名称已存在')
      } else {
        message.error(errorMessage)
      }
    } finally {
      setCategoryLoading(false)
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
            <Select
              placeholder="请选择分类"
              size="large"
              allowClear
              style={{ width: 300 }}
              optionRender={(option) => (
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <span>{option.label}</span>
                  <Space>
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      disabled={categoryLoading}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditCategory(categories.find(c => c.id === option.value))
                      }}
                    />
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      disabled={categoryLoading}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteCategory(option.value, option.label)
                      }}
                    />
                  </Space>
                </Space>
              )}
              popupRender={(menu) => (
                <>
                  {menu}
                  <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      loading={categoryLoading}
                      onClick={() => {
                        setEditingCategory(null)
                        setNewCategoryName('')
                        setAddCategoryVisible(true)
                      }}
                    >
                      添加分类
                    </Button>
                  </div>
                </>
              )}
            >
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* 添加/编辑分类弹窗 */}
          <Modal
            title={editingCategory ? '编辑分类' : '添加分类'}
            open={addCategoryVisible}
            onOk={editingCategory ? handleUpdateCategory : handleAddCategory}
            okText={editingCategory ? '更新' : '添加'}
            cancelText="取消"
            confirmLoading={categoryLoading}
            onCancel={() => {
              setAddCategoryVisible(false)
              setNewCategoryName('')
              setEditingCategory(null)
            }}
          >
            <Input
              placeholder="请输入分类名称"
              value={newCategoryName}
              maxLength={10}
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
