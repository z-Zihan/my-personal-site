import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Card, Space, Tag, Popconfirm, message, Switch, Modal, InputNumber, Drawer } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CommentOutlined, StarOutlined, DragOutlined } from '@ant-design/icons';
import { articleApi, commentApi } from '../../api/index';
import { formatDate } from '../../utils/helpers';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// 可排序的行组件
function SortableRow(props) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    style,
  } = useSortable({
    id: props['data-row-key'],
  });

  const sortableStyle = {
    ...style,
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: 'move',
  };

  return (
    <tr
      {...props}
      ref={setNodeRef}
      style={sortableStyle}
      {...attributes}
      {...listeners}
      className="sortable-row"
    />
  );
}

function ArticleManager() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [recommendedArticles, setRecommendedArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusChangingId, setStatusChangingId] = useState(null);
  const [recommendChangingId, setRecommendChangingId] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [recommendDrawerVisible, setRecommendDrawerVisible] = useState(false);
  const [selectedCommentKeys, setSelectedCommentKeys] = useState([]);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const { data } = await articleApi.getList({ limit: 100 });
      setArticles(data || []);
    } catch (error) {
      message.error('加载文章失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedArticles = async () => {
    try {
      const { data } = await articleApi.getList({ recommended: true, limit: 50 });
      // 按 recommend_order 排序
      const sorted = (data?.data || []).sort((a, b) => (a.recommend_order ?? 0) - (b.recommend_order ?? 0));
      setRecommendedArticles(sorted);
    } catch (error) {
      console.error('加载推荐文章失败:', error);
    }
  };

  const handleOpenRecommendDrawer = () => {
    fetchRecommendedArticles();
    setRecommendDrawerVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await articleApi.delete(id)
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
      await articleApi.toggleStatus({ id, status: currentStatus })
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
      await articleApi.updateRecommend({ id, is_recommended: !isRecommended, recommend_order: !isRecommended ? 0 : undefined })
      message.success(isRecommended ? '已取消推荐' : '已设为推荐')
      fetchArticles()
    } catch (error) {
      message.error(error.response?.data?.error || '推荐状态更新失败')
    } finally {
      setRecommendChangingId(null);
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = recommendedArticles.findIndex(item => item.id === active.id);
    const newIndex = recommendedArticles.findIndex(item => item.id === over.id);

    // 本地更新顺序
    const newOrder = arrayMove(recommendedArticles, oldIndex, newIndex);
    setRecommendedArticles(newOrder);

    // 批量更新顺序到后端
    try {
      const updates = newOrder.map((item, index) => ({
        id: item.id,
        recommend_order: index
      }));

      // 并行发送更新请求
      await Promise.all(updates.map(update =>
        articleApi.updateRecommend({ id: update.id, recommend_order: update.recommend_order })
      ));

      message.success('排序已更新');
    } catch (error) {
      message.error('排序更新失败');
      // 失败后重新加载
      fetchRecommendedArticles();
    }
  };

  const handleBatchRecommend = async (selectedRowKeys) => {
    try {
      for (let i = 0; i < selectedRowKeys.length; i++) {
        await articleApi.updateRecommend({ id: selectedRowKeys[i], is_recommended: true, recommend_order: i })
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
      const { data } = await commentApi.getList({ article_id: article.id });
      setComments(data?.data || []);
    } catch (error) {
      message.error('加载评论失败');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await commentApi.delete(id);
      message.success('删除成功');
      handleShowComments(currentArticle); // 刷新评论列表
    } catch (error) {
      message.error(error.response?.data?.error || '删除失败');
    }
  };

  const handleBatchDeleteComments = async () => {
    if (selectedCommentKeys.length === 0) {
      message.warning('请选择要删除的评论');
      return;
    }
    try {
      await commentApi.batchDelete(selectedCommentKeys);
      message.success(`成功删除 ${selectedCommentKeys.length} 条评论`);
      setSelectedCommentKeys([]);
      handleShowComments(currentArticle); // 刷新评论列表
    } catch (error) {
      message.error(error.response?.data?.error || '批量删除失败');
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
      title: '分类',
      key: 'category',
      width: 100,
      render: (_, record) => record.categories?.name || '-',
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
      fixed: 'right',
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

  const recommendedColumns = [
    {
      title: '排序',
      key: 'drag',
      width: 60,
      render: (_, record) => (
        <DragOutlined style={{ cursor: 'move', color: '#999' }} className="drag-handle" />
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '分类',
      key: 'category',
      width: 100,
      render: (_, record) => record.categories?.name || '-',
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
      title: '推荐顺序',
      dataIndex: 'recommend_order',
      key: 'recommend_order',
      width: 100,
      render: (order) => order ?? 0,
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
              icon={<StarOutlined />}
              onClick={handleOpenRecommendDrawer}
            >
              管理推荐
            </Button>
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
          scroll={{ x: 1600 }}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            {selectedCommentKeys.length > 0 && (
              <span style={{ color: '#666' }}>已选择 {selectedCommentKeys.length} 项</span>
            )}
          </Space>
          <Popconfirm
            title={`确定删除选中的 ${selectedCommentKeys.length} 条评论吗？`}
            onConfirm={handleBatchDeleteComments}
            okText="确定"
            cancelText="取消"
            disabled={selectedCommentKeys.length === 0}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={selectedCommentKeys.length === 0}
            >
              批量删除
            </Button>
          </Popconfirm>
        </div>
        <Table
          dataSource={comments}
          rowKey="id"
          loading={commentsLoading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
          scroll={{ x: 600 }}
          rowSelection={{
            selectedRowKeys: selectedCommentKeys,
            onChange: setSelectedCommentKeys,
          }}
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
              title: '评论时间',
              dataIndex: 'created_at',
              key: 'created_at',
              width: 160,
              render: (date) => formatDate(date),
            },
            {
              title: '地理位置',
              dataIndex: 'location',
              key: 'location',
              width: 120,
              render: (location) => location || '-',
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

      {/* 推荐管理抽屉 */}
      <Drawer
        title="推荐文章管理"
        placement="right"
        size="large"
        open={recommendDrawerVisible}
        onClose={() => setRecommendDrawerVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setRecommendDrawerVisible(false)}>关闭</Button>
            <Button type="primary" onClick={() => { fetchRecommendedArticles(); message.success('列表已刷新'); }}>
              刷新列表
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: '#666' }}>
            <DragOutlined style={{ color: '#999' }} /> 拖拽文章标题调整推荐顺序，释放后自动保存
          </p>
        </div>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={recommendedArticles.map(item => item.id)} strategy={verticalListSortingStrategy}>
            <Table
              components={{
                body: {
                  row: SortableRow,
                },
              }}
              columns={recommendedColumns}
              dataSource={recommendedArticles}
              rowKey="id"
              pagination={false}
              scroll={{ x: 600 }}
            />
          </SortableContext>
        </DndContext>
      </Drawer>
    </div>
  );
}

export default ArticleManager;
