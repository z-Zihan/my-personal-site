import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Card,
  Space,
  Popconfirm,
  message,
  Switch,
  Modal,
  Drawer,
  Typography,
  Select,
  Row,
  Col,
} from "antd";
import type { Key } from "antd/es/table/interface";
import type { ColumnType } from "antd/es/table";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CommentOutlined,
  StarOutlined,
  DragOutlined,
  CopyOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  articleApi,
  commentApi,
  categoryApi,
  Article,
  Comment as CommentType,
  Category,
} from "../../api/index";
import { formatDate } from "../../utils/helpers";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string | number;
}

// 可排序的行组件
function SortableRow(props: SortableRowProps) {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({
      id: props["data-row-key"],
    });

  const sortableStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: "move",
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

interface ArticleWithExtra extends Article {
  is_recommended?: boolean;
  recommend_order?: number;
  comment_count?: number;
  categories?: { name: string; id: string };
}

function ArticleManager() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<ArticleWithExtra[]>([]);
  const [recommendedArticles, setRecommendedArticles] = useState<
    ArticleWithExtra[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [statusChangingId, setStatusChangingId] = useState<string | null>(null);
  const [recommendChangingId, setRecommendChangingId] = useState<string | null>(
    null,
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<ArticleWithExtra | null>(
    null,
  );
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [recommendDrawerVisible, setRecommendDrawerVisible] = useState(false);
  const [selectedCommentKeys, setSelectedCommentKeys] = useState<Key[]>([]);

  // 筛选相关状态
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterRecommended, setFilterRecommended] = useState<string | undefined>(undefined);
  const [filterCategoryId, setFilterCategoryId] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, []);

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const { data } = await categoryApi.getList();
      setCategories(data || []);
    } catch {
      // 错误静默处理
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { limit: 100 };
      if (filterStatus) params.status = filterStatus;
      if (filterRecommended !== undefined) params.recommended = filterRecommended === 'true';
      if (filterCategoryId) params.category_id = filterCategoryId;

      const { data } = await articleApi.getList(params);
      setArticles(data || []); //不要修改这一句 现在是对的
    } catch {
      message.error("加载文章失败");
    } finally {
      setLoading(false);
    }
  };

  // 重置筛选
  const handleResetFilter = () => {
    setFilterStatus(undefined);
    setFilterRecommended(undefined);
    setFilterCategoryId(undefined);
  };

  // 筛选条件改变时重新获取数据
  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterRecommended, filterCategoryId]);

  const fetchRecommendedArticles = async () => {
    try {
      // 推荐文章必须是已发布的文章
      const { data } = await articleApi.getList({
        recommended: true,
        status: "published",
        limit: 50,
      });
      // 按 recommend_order 排序
      const sorted = ((data as ArticleWithExtra[]) || []).sort(
        (a, b) => (a.recommend_order ?? 0) - (b.recommend_order ?? 0),
      );
      setRecommendedArticles(sorted);
    } catch {
      // 错误由全局错误边界处理
    }
  };

  const handleOpenRecommendDrawer = () => {
    fetchRecommendedArticles();
    setRecommendDrawerVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await articleApi.delete(id);
      message.success("删除成功");
      fetchArticles();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || "删除失败");
    }
  };

  const handleToggleStatus = async (
    id: string,
    currentStatus: string,
    isRecommended: boolean,
  ) => {
    setStatusChangingId(id);
    const newStatus = currentStatus === "published" ? "draft" : "published";
    try {
      // 如果从发布状态改为草稿，且文章是推荐状态，自动取消推荐
      if (
        currentStatus === "published" &&
        newStatus === "draft" &&
        isRecommended
      ) {
        await articleApi.updateRecommend({ id, recommended: false });
        message.success("文章已设为草稿，并自动取消推荐");
      }
      await articleApi.toggleStatus({ id, status: newStatus });
      message.success(
        `文章已${newStatus === "published" ? "发布" : "设为草稿"}`,
      );
      fetchArticles();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || "状态更新失败");
    } finally {
      setStatusChangingId(null);
    }
  };

  const handleToggleRecommend = async (
    id: string,
    isRecommended: boolean,
    status: string,
  ) => {
    // 草稿文章不能设置推荐
    if (!isRecommended && status === "draft") {
      message.warning("未发布文章不能设置推荐");
      return;
    }
    setRecommendChangingId(id);
    try {
      await articleApi.updateRecommend({
        id,
        recommended: !isRecommended,
        recommend_order: !isRecommended ? 0 : undefined,
      });
      message.success(isRecommended ? "已取消推荐" : "已设为推荐");
      fetchArticles();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || "推荐状态更新失败");
    } finally {
      setRecommendChangingId(null);
    }
  };

  const handleDragEnd = async (event: {
    active: { id: string | number };
    over: { id: string | number } | null;
  }) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = recommendedArticles.findIndex(
      (item) => item.id === active.id,
    );
    const newIndex = recommendedArticles.findIndex(
      (item) => item.id === over.id,
    );

    // 本地更新顺序
    const newOrder = arrayMove(recommendedArticles, oldIndex, newIndex);
    setRecommendedArticles(newOrder);

    // 批量更新顺序到后端
    try {
      const updates = newOrder.map((item, index) => ({
        id: item.id as string,
        recommend_order: index,
      }));

      // 并行发送更新请求
      await Promise.all(
        updates.map((update) =>
          articleApi.updateRecommend({
            id: update.id,
            recommended: true,
            recommend_order: update.recommend_order,
          }),
        ),
      );

      message.success("排序已更新");
    } catch {
      message.error("排序更新失败");
      // 失败后重新加载
      fetchRecommendedArticles();
    }
  };

  const handleBatchRecommend = async (selectedRowKeys: Key[]) => {
    try {
      for (let i = 0; i < selectedRowKeys.length; i++) {
        await articleApi.updateRecommend({
          id: selectedRowKeys[i] as string,
          recommended: true,
          recommend_order: i,
        });
      }
      message.success(`已批量设置 ${selectedRowKeys.length} 篇文章为推荐`);
      fetchArticles();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || "批量设置失败");
    }
  };

  const handleShowComments = async (article: ArticleWithExtra) => {
    if (!article.comment_count || article.comment_count === 0) return;

    setCurrentArticle(article);
    setCommentsModalVisible(true);
    setCommentsLoading(true);
    try {
      const { data } = await commentApi.getList({ article_id: article.id });
      setComments((data) || []); //也不要修改这一句 现在也是对的
    } catch {
      message.error("加载评论失败");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCloseCommentsModal = () => {
    setCommentsModalVisible(false);
    setCurrentArticle(null);
    setSelectedCommentKeys([]);
    fetchArticles(); // 关闭后重新请求文章管理数据
  };

  const handleDeleteComment = async (id: number) => {
    try {
      await commentApi.delete(id);
      message.success("删除成功");
      // 刷新评论列表
      if (currentArticle?.id) {
        const { data } = await commentApi.getList({
          article_id: currentArticle.id,
        });
        setComments((data) || []); //不要修改这一句
        // 如果评论数量为 0，自动关闭弹窗
        if (!data || data.length === 0) { //不要修改这一句
          message.info("评论已全部删除");
          handleCloseCommentsModal();
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || "删除失败");
    }
  };

  const handleBatchDeleteComments = async () => {
    if (selectedCommentKeys.length === 0) {
      message.warning("请选择要删除的评论");
      return;
    }
    try {
      await commentApi.batchDelete(selectedCommentKeys as number[]);
      message.success(`成功删除 ${selectedCommentKeys.length} 条评论`);
      setSelectedCommentKeys([]);
      // 刷新评论列表
      if (currentArticle?.id) {
        const { data } = await commentApi.getList({
          article_id: currentArticle.id,
        });
        setComments((data as unknown as CommentType[]) || []);
        // 如果评论数量为 0，自动关闭弹窗
        if (!(data as unknown as CommentType[]) || (data as unknown as CommentType[]).length === 0) {
          message.info("评论已全部删除");
          handleCloseCommentsModal();
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || "批量删除失败");
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard
      .writeText(id.toString())
      .then(() => {
        message.success(`文章 ID ${id} 已复制到剪切板`);
      })
      .catch(() => {
        message.error("复制失败");
      });
  };

  const handleCopyLink = (id: string) => {
    const link = `${window.location.origin}/blog/${id}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        message.success("链接已复制到剪切板");
      })
      .catch(() => {
        message.error("复制失败");
      });
  };

  const columns: ColumnType<ArticleWithExtra>[] = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (_title, record) => (
        <Space>
          <Typography.Link
            onClick={() => handleCopyId(record.id as string)}
            style={{ cursor: "pointer", maxWidth: 400 }}
          >
            {record.title}
          </Typography.Link>
          <CopyOutlined
            style={{ cursor: "pointer", color: "#1890ff" }}
            onClick={() => handleCopyId(record.id as string)}
            title="复制文章 ID"
          />
        </Space>
      ),
    },
    {
      title: "分类",
      key: "category",
      width: 100,
      render: (_, record) => record.categories?.name || "-",
    },
    {
      title: "推荐",
      dataIndex: "is_recommended",
      key: "is_recommended",
      width: 80,
      render: (isRecommended, record) => (
        <Switch
          checked={isRecommended}
          checkedChildren="推荐"
          unCheckedChildren=""
          loading={recommendChangingId === record.id}
          onChange={() =>
            handleToggleRecommend(
              record.id as string,
              isRecommended,
              record.status as string,
            )
          }
        />
      ),
    },
    {
      title: "发布状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status, record) => (
        <Switch
          checked={status === "published"}
          checkedChildren="发布"
          unCheckedChildren="草稿"
          loading={statusChangingId === record.id}
          onChange={() =>
            handleToggleStatus(
              record.id as string,
              status as string,
              record.is_recommended || false,
            )
          }
        />
      ),
    },
    {
      title: "评论",
      dataIndex: "comment_count",
      key: "comment_count",
      width: 80,
      render: (_count, record) => (
        <Button
          type="link"
          onClick={() => handleShowComments(record)}
          disabled={!record.comment_count || record.comment_count === 0}
          style={{
            padding: 0,
            color:
              !record.comment_count || record.comment_count === 0
                ? "rgba(0,0,0,0.25)"
                : undefined,
            cursor:
              !record.comment_count || record.comment_count === 0
                ? "not-allowed"
                : undefined,
          }}
        >
          <CommentOutlined /> {record.comment_count || 0}
        </Button>
      ),
    },
    {
      title: "浏览量",
      dataIndex: "views",
      key: "views",
      width: 80,
    },
    {
      title: "点赞数",
      dataIndex: "likes",
      key: "likes",
      width: 80,
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (date: string) => {
        const d = new Date(date);
        return d.toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      },
    },
    {
      title: "最后修改时间",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 180,
      render: (date: string) => {
        if (!date) return "-";
        const d = new Date(date);
        return d.toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      },
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      fixed: "right" as const,
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Space>
            <Button
              icon={<EyeOutlined />}
              onClick={() => window.open(`/blog/${record.id}`, "_blank")}
            >
              查看
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/articles/${record.id}`)}
            >
              编辑
            </Button>
          </Space>
          <Space>
            <Button
              icon={<CopyOutlined />}
              onClick={() => handleCopyLink(record.id as string)}
            >
              复制
            </Button>
            <Popconfirm
              title="确定删除吗？"
              onConfirm={() => handleDelete(record.id as string)}
            >
              <Button icon={<DeleteOutlined />} danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        </div>
      ),
    },
  ];

  const recommendedColumns: ColumnType<ArticleWithExtra>[] = [
    {
      title: "排序",
      key: "drag",
      width: 60,
      render: (_, record) => (
        <DragOutlined
          style={{ cursor: "move", color: "#999" }}
          className="drag-handle"
        />
      ),
    },
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "分类",
      key: "category",
      width: 100,
      render: (_, record) => record.categories?.name || "-",
    },
    {
      title: "浏览量",
      dataIndex: "views",
      key: "views",
      width: 80,
    },
    {
      title: "点赞数",
      dataIndex: "likes",
      key: "likes",
      width: 80,
    },
    {
      title: "推荐顺序",
      dataIndex: "recommend_order",
      key: "recommend_order",
      width: 100,
      render: (order: number) => order ?? 0,
    },
  ];

  const handleRowSelectionChange = (newSelectedRowKeys: Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

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
              onClick={() => navigate("/admin/articles/new")}
            >
              新建文章
            </Button>
          </Space>
        }
      >
        {/* 筛选区域 */}
        <Card size="small" style={{ marginBottom: 16 }} bordered={false}>
          <Row gutter={[16, 16]} align="middle">
            <Col>
              <Space>
                <FilterOutlined style={{ color: '#1890ff' }} />
                <span style={{ fontWeight: 500 }}>筛选条件：</span>
              </Space>
            </Col>
            <Col>
              <Space>
                <span>发布状态：</span>
                <Select
                  allowClear
                  placeholder="全部状态"
                  style={{ width: 120 }}
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={[
                    { label: '已发布', value: 'published' },
                    { label: '草稿', value: 'draft' },
                  ]}
                />
              </Space>
            </Col>
            <Col>
              <Space>
                <span>推荐状态：</span>
                <Select
                  allowClear
                  placeholder="全部"
                  style={{ width: 120 }}
                  value={filterRecommended}
                  onChange={setFilterRecommended}
                  options={[
                    { label: '已推荐', value: 'true' },
                    { label: '未推荐', value: 'false' },
                  ]}
                />
              </Space>
            </Col>
            <Col>
              <Space>
                <span>分类：</span>
                <Select
                  allowClear
                  placeholder="全部分类"
                  style={{ width: 150 }}
                  value={filterCategoryId}
                  onChange={setFilterCategoryId}
                  options={categories.map(cat => ({
                    label: cat.name,
                    value: cat.id,
                  }))}
                />
              </Space>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleResetFilter}
                  disabled={!filterStatus && !filterRecommended && !filterCategoryId}
                >
                  重置筛选
                </Button>
                <Button type="primary" onClick={fetchArticles} loading={loading}>
                  刷新
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Table
          columns={columns}
          dataSource={articles}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1800 }}
          rowSelection={{
            selectedRowKeys,
            onChange: handleRowSelectionChange,
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
            <Button onClick={() => setSelectedRowKeys([])}>取消选择</Button>
          </Space>
        </Card>
      )}

      {/* 评论列表弹窗 */}
      <Modal
        title={
          currentArticle ? `《${currentArticle.title}》的评论` : "评论列表"
        }
        open={commentsModalVisible}
        // onCancel={handleCloseCommentsModal}
        footer={null}
        width={800}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Space>
            {selectedCommentKeys.length > 0 && (
              <span style={{ color: "#666" }}>
                已选择 {selectedCommentKeys.length} 项
              </span>
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
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 600 }}
          rowSelection={{
            selectedRowKeys: selectedCommentKeys,
            onChange: setSelectedCommentKeys,
          }}
          columns={[
            {
              title: "评论内容",
              dataIndex: "content",
              key: "content",
              ellipsis: true,
            } as const,
            {
              title: "访客昵称",
              dataIndex: "visitor_name",
              key: "visitor_name",
              width: 120,
              render: (name: unknown, record: CommentType) =>
                (name as string) ||
                `访客 ${String(record.visitor_id || "").slice(-6)}`,
            } as const,
            {
              title: "评论时间",
              dataIndex: "created_at",
              key: "created_at",
              width: 160,
              render: (date: string) => formatDate(date),
            } as const,
            {
              title: "地理位置",
              dataIndex: "location",
              key: "location",
              width: 120,
              render: (location: string) => location || "-",
            } as const,
            {
              title: "操作",
              key: "action",
              width: 80,
              fixed: "right" as const,
              render: (_: unknown, record: CommentType) => (
                <Popconfirm
                  title="确定删除吗？"
                  onConfirm={() => handleDeleteComment(record.id as number)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="link" danger size="small">
                    删除
                  </Button>
                </Popconfirm>
              ),
            } as const,
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
            <Button onClick={() => setRecommendDrawerVisible(false)}>
              关闭
            </Button>
            <Button
              type="primary"
              onClick={() => {
                fetchRecommendedArticles();
                message.success("列表已刷新");
              }}
            >
              刷新列表
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: "#666" }}>
            <DragOutlined style={{ color: "#999" }} />{" "}
            拖拽文章标题调整推荐顺序，释放后自动保存
          </p>
        </div>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={recommendedArticles.map((item) => item.id as string)}
            strategy={verticalListSortingStrategy}
          >
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
