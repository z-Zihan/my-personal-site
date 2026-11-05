import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Select, Space, Modal, Affix } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, ArrowLeftOutlined, SaveOutlined, CheckCircleOutlined } from '@ant-design/icons';
import RichEditor from '../../components/common/RichEditor';
import ImageUploader from '../../components/common/ImageUploader';
import { articleApi } from '../../api/index';
import { categoryApi } from '../../api/category';

const { TextArea } = Input;

function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [savingStatus, setSavingStatus] = useState<'draft' | 'published' | null>(null);
  const [content, setContent] = useState('');
  const [cover, setCover] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [addCategoryVisible, setAddCategoryVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);
  // 未保存修改跟踪：表单字段/正文/封面任一变化且尚未保存 → dirty
  const [dirty, setDirty] = useState(false);
  const [loadedFromDb, setLoadedFromDb] = useState(!id); // 新建文章首次输入即算 dirty
  useEffect(() => {
    if (id) {
      fetchArticle();
    }
    fetchCategories();
  }, [id]);

  // 表单任意字段变化 → 标记 dirty（初始化回填时跳过，由 JSX onValuesChange + RichEditor/ImageUploader onChange 驱动）

  // 关闭/刷新页面前，有未保存修改时提示
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  const fetchArticle = async () => {
    try {
      const { data } = await articleApi.getDetail(id!);
      const article = data;
      form.setFieldsValue({
        title: article.title,
        summary: article.summary,
        category_id: article.category_id,
        content: article.content,
        cover: article.cover,
      });

      setContent(article.content || '');
      setCover(article.cover || '');
      // 回填完成，之后的修改才算 dirty
      setTimeout(() => setLoadedFromDb(true), 0);
    } catch {
      message.error('加载文章失败')
      setLoadedFromDb(true)
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getList()
      // schema 中 categories.id 是 UUID，但 API 层类型声明为 number，这里统一转 string 处理
      const list = Array.isArray(res) ? res : (res as unknown as { data?: { id: string | number; name: string }[] }).data || []
      setCategories(list.map(cat => ({ id: String(cat.id), name: cat.name })))
    } catch {
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
      await categoryApi.create({ name: newCategoryName.trim() })
      // 重新获取分类列表
      await fetchCategories()
      message.success('分类添加成功')
      setNewCategoryName('')
      setAddCategoryVisible(false)
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { error?: string } }; message?: string }).response?.data?.error || (error as { message?: string }).message || '添加失败'
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

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除分类"${categoryName}"吗？`,
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        setCategoryLoading(true)
        try {
          await categoryApi.delete(categoryId as unknown as number)
          setCategories(categories.filter(cat => cat.id !== categoryId))
          if (form.getFieldValue('category_id') === categoryId) {
            form.setFieldsValue({ category_id: undefined })
          }
          message.success('分类删除成功')
        } catch (error: unknown) {
          message.error((error as { response?: { data?: { error?: string } }; message?: string }).response?.data?.error || '删除失败')
        } finally {
          setCategoryLoading(false)
        }
      },
    })
  }

  const handleEditCategory = (category: { id: string; name: string }) => {
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
      await categoryApi.update({ id: editingCategory!.id as unknown as number, name: newCategoryName.trim() })
      // 重新获取分类列表
      await fetchCategories()
      message.success('分类更新成功')
      setNewCategoryName('')
      setEditingCategory(null)
      setAddCategoryVisible(false)
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { error?: string } }; message?: string }).response?.data?.error || (error as { message?: string }).message || '更新失败'
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

  // 统一保存入口：先整体校验表单，再按目标状态提交
  const handleSubmit = async (status: 'draft' | 'published') => {
    if (savingStatus) return; // 防止重复提交
    try {
      await form.validateFields();
    } catch (errorFields: unknown) {
      // 校验失败：提示 + 滚动到第一个出错字段
      const fields = (errorFields as { errorFields?: { name?: (string | number)[] }[] }).errorFields;
      if (fields && fields.length > 0 && fields[0].name) {
        form.scrollToField(fields[0].name, { behavior: 'smooth', block: 'center' });
      }
      message.warning('请先完善表单中标红的必填项');
      return;
    }

    const values = form.getFieldsValue();
    setSavingStatus(status);
    setLoading(true);
    try {
      const articleData = {
        title: values.title,
        summary: values.summary,
        category_id: values.category_id,
        content,
        cover,
        status,
        // 当保存为草稿时，强制取消推荐（草稿不能出现在前台推荐位）
        ...(status === 'draft' ? { is_recommended: false } : {}),
      };

      if (id) {
        // 更新
        await articleApi.update({ id, ...articleData });
        message.success(status === 'published' ? '文章已保存并发布' : '已保存为草稿');
      } else {
        // 创建
        await articleApi.create(articleData);
        message.success(status === 'published' ? '文章已发布' : '草稿已保存');
      }

      setDirty(false);
      navigate('/admin/articles');
    } catch (error: unknown) {
      message.error((error as { response?: { data?: { error?: string } }; message?: string }).response?.data?.error || '操作失败');
    } finally {
      setSavingStatus(null);
      setLoading(false);
    }
  };

  const categorySelect = (
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
                handleEditCategory(categories.find((c) => c.id === option.value)!)
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
                handleDeleteCategory(option.value as string, String(option.label))
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
      {categories.map((cat: { id: string; name: string }) => (
        <Select.Option key={cat.id} value={cat.id}>
          {cat.name}
        </Select.Option>
      ))}
    </Select>
  );

  const formContent = (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ cover: '', content: '' }}
      onValuesChange={() => {
        if (loadedFromDb) setDirty(true);
      }}
    >
      <Form.Item
        name="title"
        label="标题"
        rules={[{ required: true, whitespace: true, message: '请输入标题' }]}
      >
        <Input placeholder="请输入文章标题" size="large" showCount maxLength={100} />
      </Form.Item>

      <Form.Item
        name="summary"
        label="摘要"
        rules={[{ required: true, whitespace: true, message: '请输入摘要' }]}
      >
        <TextArea
          rows={3}
          placeholder="请输入文章摘要（将展示在文章列表）"
          showCount
          maxLength={500}
        />
      </Form.Item>

      <Form.Item
        name="category_id"
        label="分类"
        rules={[{ required: true, message: '请选择分类' }]}
      >
        {categorySelect}
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
        initialValue=""
      >
        <ImageUploader
          value={cover}
          onChange={(v) => {
            setCover(v);
            if (loadedFromDb) setDirty(true);
          }}
        />
      </Form.Item>

      <Form.Item
        name="content"
        label="正文"
        initialValue=""
        rules={[
          {
            validator: async (_rule, value: string) => {
              // wangeditor 空内容可能是 '' 或 '<p><br></p>'，统一按空处理
              const stripped = (value || content || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
              if (!stripped) {
                throw new Error('请输入正文');
              }
            },
          },
        ]}
      >
        <RichEditor
          value={content}
          onChange={(v) => {
            setContent(v);
            if (loadedFromDb) setDirty(true);
          }}
          height={500}
        />
      </Form.Item>
    </Form>
  );

  return (
    <div>
      {/* 顶部固定操作栏：长页面滚动时保存按钮始终可见 */}
      <Affix offsetTop={0}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            marginBottom: 16,
            background: '#ffffff',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
          }}
        >
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/articles')}
            >
              返回列表
            </Button>
            <span style={{ color: '#999', fontSize: 14 }}>
              {id ? '编辑文章' : '创建文章'}
            </span>
            {dirty && (
              <span style={{ color: '#faad14', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#faad14', display: 'inline-block' }} />
                有未保存的修改
              </span>
            )}
          </Space>
          <Space>
            <Button
              icon={<SaveOutlined />}
              loading={savingStatus === 'draft'}
              disabled={loading}
              onClick={() => handleSubmit('draft')}
            >
              存草稿
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={savingStatus === 'published'}
              disabled={loading}
              onClick={() => handleSubmit('published')}
            >
              保存并发布
            </Button>
          </Space>
        </div>
      </Affix>

      <Card bordered={false}>
        {formContent}
      </Card>
    </div>
  );
}

export default ArticleEditor;
