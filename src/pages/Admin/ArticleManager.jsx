import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Card, Space, Tag, Popconfirm, message, Switch, Modal, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CommentOutlined, StarOutlined } from '@ant-design/icons';
import { articlesApi, commentsApi } from '../../utils/api';
import { formatDate } from '../../utils/helpers';

function ArticleManager() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusChangingId, setStatusChangingId] = useState(null);
  const [recommendChangingId, setRecommendChangingId] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const { data } = await articlesApi.getList({ limit: 100 });
      setArticles(data.data || []);
    } catch (error) {
      message.error('加载文章失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await articlesApi.delete(id)
      message.success('删除成功')
      fetchArticles()
    } catch (error) {
      message.error(error.response?.data?.error || '删除失败')
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    setStatusChangingId(id);
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    try {
      await articlesApi.toggleStatus({ id, status: currentStatus })
      message.success(`文章已${newStatus === 'published' ? '发布' : '设为草稿'}`)
      fetchArticles()
    } catch (error) {
      message.error(error.response?.data?.error || '状态更新失败')
    } finally {
      setStatusChangingId(null);
    }
  }

  const handleToggleRecommend = async (id, isRecommended) => {
    setRecommendChangingId(id);
    try {
      await articlesApi.updateRecommend({ id, is_recommended: !isRecommended, recommend_order: !isRecommended ? 0 : undefined })
      message.success(isRecommended ? '已取消推荐' : '已设为推荐')
      fetchArticles()
    } catch (error) {
      message.error(error.response?.data?.error || '推荐状态更新失败')
    } finally {
      setRecommendChangingId(null);
    }
  }

  const handleUpdateRecommendOrder = async (id, order) => {
    try {
      await articlesApi.updateRecommend({ id, recommend_order: order })
      message.success('排序已更新')
      // 本地更新，不重新加载
      setArticles(articles.map(art =>
        art.id === id ? { ...art, recommend_order: order } : art
      ))
    } catch (error) {
      message.error(error.response?.data?.error || '排序更新失败')
    }
  }

  const handleBatchRecommend = async (selectedRowKeys) => {
    try {
      for (let i = 0; i < selectedRowKeys.length; i++) {
        await articlesApi.updateRecommend({ id: selectedRowKeys[i], is_recommended: true, recommend_order: i })
      }
      message.success(`已批量设置 ${selectedRowKeys.length} 篇文章为推荐`)
      fetchArticles()
    } catch (error) {
      message.error(error.response?.data?.error || '批量设置失败')
    }
  }

  const handleShowComments = async (article) => {
    if (!article.comment_count || article.comment_count === 0) return;

    setCurrentArticle(article);
    setCommentsModalVisible(true);
    setCommentsLoading(true);
    try {
      const { data } = await commentsApi.getList({ article_id: article.id });
      setComments(data.data || []);
    } catch (error) {
      message.error('加载评论失败');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await commentsApi.delete(id);
      message.success('删除成功');
      handleShowComments(currentArticle); // 刷新评论列表
    } catch (error) {
      message.error(error.response?.data?.error || '删除失败');
    }
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '推荐',
      dataIndex: 'is_recommended',
      key: 'is_recommended',
      width: 80,
      render: (isRecommended, record) => (
        <Switch
          checked={isRecommended}
          checkedChildren="推荐"
          unCheckedChildren=""
          loading={recommendChangingId === record.id}
          onChange={() => handleToggleRecommend(record.id, isRecommended)}
        />
      ),
    },
    {
      title: '排序',
      dataIndex: 'recommend_order',
      key: 'recommend_order',
      width: 100,
      render: (order, record) => (
        <InputNumber
          size="small"
          min={0}
          value={order ?? 0}
          disabled={!record.is_recommended}
          onChange={(value) => handleUpdateRecommendOrder(record.id, value)}
          placeholder="推荐顺序"
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status, record) => (
        <Switch
          checked={status === 'published'}
          checkedChildren="发布"
          unCheckedChildren="草稿"
          loading={statusChangingId === record.id}
          onChange={() => handleToggleStatus(record.id, status)}
        />
      ),
    },
    {
      title: '评论',
      dataIndex: 'comment_count',
      key: 'comment_count',
      width: 80,
      render: (count, record) => (
        <Button
          type="link"
          onClick={() => handleShowComments(record)}
          disabled={!count || count === 0}
          style={{
            padding: 0,
            color: !count || count === 0 ? 'rgba(0,0,0,0.25)' : undefined,
            cursor: !count || count === 0 ? 'not-allowed' : undefined
          }}
        >
          <CommentOutlined /> {count || 0}
        </Button>
      ),
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      width: 80,
    },
    {
      title: '点赞数',
      dataIndex: 'likes',
      key: 'likes',
      width: 80,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => window.open(`/blog/${record.id}`, '_blank')}
          >
            查看
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => navigate(`/admin/articles/${record.id}`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button icon={<DeleteOutlined />} size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="文章管理"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/articles/new')}
            >
              新建文章
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={articles}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1400 }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
        />
      </Card>

      {selectedRowKeys.length > 0 && (
        <Card style={{ marginTop: 16 }}>
          <Space>
            <span>已选择 {selectedRowKeys.length} 篇文章</span>
            <Button
              type="primary"
              icon={<StarOutlined />}
              onClick={() => handleBatchRecommend(selectedRowKeys)}
            >
              批量设为推荐
            </Button>
            <Button
              onClick={() => setSelectedRowKeys([])}
            >
              取消选择
            </Button>
          </Space>
        </Card>
      )}

      {/* 评论列表弹窗 */}
      <Modal
        title={currentArticle ? `《${currentArticle.title}》的评论` : '评论列表'}
        open={commentsModalVisible}
        onCancel={() => setCommentsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          dataSource={comments}
          rowKey="id"
          loading={commentsLoading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
          scroll={{ x: 600 }}
          columns={[
            {
              title: '评论内容',
              dataIndex: 'content',
              key: 'content',
              ellipsis: true,
            },
            {
              title: '访客昵称',
              dataIndex: 'visitor_name',
              key: 'visitor_name',
              width: 120,
              render: (name, record) => name || `访客 ${record.visitor_id?.slice(-6)}`,
            },
            {
              title: '地理位置',
              dataIndex: 'location',
              key: 'location',
              width: 120,
              render: (location) => location || '-',
            },
            {
              title: '评论时间',
              dataIndex: 'created_at',
              key: 'created_at',
              width: 180,
              render: (date) => formatDate(date),
            },
            {
              title: '操作',
              key: 'action',
              width: 80,
              fixed: 'right',
              render: (_, record) => (
                <Popconfirm
                  title="确定删除吗？"
                  onConfirm={() => handleDeleteComment(record.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="link" danger size="small">
                    删除
                  </Button>
                </Popconfirm>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
}

export default ArticleManager;
