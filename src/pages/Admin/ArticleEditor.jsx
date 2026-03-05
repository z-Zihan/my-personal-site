import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Select, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import RichEditor from '../../components/common/RichEditor';
import ImageUploader from '../../components/common/ImageUploader';
import axios from 'axios';

// API 基础地址
const API_BASE = 'https://zzihanaini.vercel.app';

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

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
    fetchCategories();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/article-detail?id=${id}`);
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
    // TODO: 从 API 获取分类
    setCategories([
      { id: '1', name: '技术' },
      { id: '2', name: '生活' },
      { id: '3', name: '随笔' },
      { id: '4', name: '分享' },
    ]);
  };

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
        await axios.put(`${API_BASE}/api/update-article`, { id, ...articleData });
        message.success('文章更新成功');
      } else {
        // 创建
        await axios.post(`${API_BASE}/api/create-article`, articleData);
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
            <Select placeholder="请选择分类" size="large">
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>

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
