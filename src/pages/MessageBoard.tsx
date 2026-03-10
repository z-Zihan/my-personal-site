import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { messageApi } from "../api/index";
import { toast } from "../utils/toast";
import useVisitorStore from "../store/visitorStore";
import { formatDate } from "../utils/helpers";
import Avatar from "../components/common/Avatar";
import PixelCard from "../components/effects/PixelCard";
import ElectricBorder from "../components/effects/ElectricBorder";
import WorldMap from "../components/effects/WorldMap";
import { useGeolocation } from "../hooks/useGeolocation";
import { cleanUserInput, inputRules } from "../utils/sanitize";
import { Switch, Spin, Segmented } from "antd";
import {
  SortAscendingOutlined,
  SortDescendingOutlined,
  LikeOutlined,
  LikeFilled,
  FireOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  SyncOutlined,
} from "@ant-design/icons";

// 每页显示的留言数量
const PAGE_SIZE = 10;

// 排序模式类型
type SortMode = "random" | "time" | "hot";

// Fisher-Yates 洗牌算法
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function MessageBoard() {
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [displayMessages, setDisplayMessages] = useState<any[]>([]);
  const [content, setContent] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortMode, setSortMode] = useState<SortMode>("random"); // 默认随机排序
  const [loadingMore, setLoadingMore] = useState(false);
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set()); // 已点赞的留言ID
  const [likingInProgress, setLikingInProgress] = useState<Set<string>>(
    new Set(),
  ); // 正在点赞中的留言ID
  const [showMap, setShowMap] = useState(false); // 世界地图弹窗
  const { visitorId, initVisitor, getVisitorName } = useVisitorStore();
  const {
    location: geoLocation,
    loading: locationLoading,
    error: locationError,
    getLocation,
  } = useGeolocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const inputFormRef = useRef<HTMLDivElement>(null);
  const [inputVisible, setInputVisible] = useState(false); // 留言输入框是否可见 2/3

  // 监听输入框可见性
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // 当输入框显示超过 2/3 时
          setInputVisible(entry.intersectionRatio >= 0.66);
        });
      },
      { threshold: [0, 0.33, 0.66, 1] },
    );

    if (inputFormRef.current) {
      observer.observe(inputFormRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    initVisitor();
    fetchMessages();
    getLocation()
      .then(setLocation)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (geoLocation) {
      setLocation(geoLocation);
    }
  }, [geoLocation]);

  // 根据排序模式获取排序后的留言列表
  const getSortedMessages = useCallback((messages: any[], mode: SortMode) => {
    switch (mode) {
      case "time":
        return [...messages].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
      case "hot":
        return [...messages].sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case "random":
      default:
        return shuffleArray(messages);
    }
  }, []);

  // 当排序模式或原始数据变化时，重新计算显示数据
  useEffect(() => {
    if (allMessages.length > 0) {
      const sortedMessages = getSortedMessages(allMessages, sortMode);
      // 重置分页
      setCurrentPage(1);
      const firstPage = sortedMessages.slice(0, PAGE_SIZE);
      setDisplayMessages(firstPage);
      setHasMore(sortedMessages.length > PAGE_SIZE);
    }
  }, [sortMode, allMessages.length, getSortedMessages]);

  // 处理显示数据的更新
  useEffect(() => {
    const sortedMessages = getSortedMessages(allMessages, sortMode);
    const pageData = sortedMessages.slice(0, currentPage * PAGE_SIZE);
    setDisplayMessages(pageData);
    setHasMore(pageData.length < sortedMessages.length);
  }, [currentPage, sortMode, allMessages, getSortedMessages]);

  // 设置 Intersection Observer 实现无限滚动
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, sortMode, allMessages]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    // 模拟加载延迟
    setTimeout(() => {
      setCurrentPage((prev) => prev + 1);
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, hasMore]);

  // 处理点赞
  const handleLike = async (messageId: string) => {
    if (likingInProgress.has(messageId)) return;

    setLikingInProgress((prev) => new Set(prev).add(messageId));

    try {
      const { data, error } = (await messageApi.toggleLike(messageId)) as {
        data: { success: boolean; liked: boolean; likes: number };
        error?: string;
      };

      if (error) {
        toast.error("操作失败，请重试");
        return;
      }

      if (data?.success) {
        // 更新本地状态
        setLikedMessages((prev) => {
          const newSet = new Set(prev);
          if (data.liked) {
            newSet.add(messageId);
          } else {
            newSet.delete(messageId);
          }
          return newSet;
        });

        // 更新留言的点赞数
        setAllMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, likes: data.likes } : msg,
          ),
        );

        // 同步更新显示列表
        setDisplayMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, likes: data.likes } : msg,
          ),
        );
      }
    } catch (error) {
      toast.error("操作失败，请重试");
    } finally {
      setLikingInProgress((prev) => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  const fetchMessages = async () => {
    try {
      const { data } = await messageApi.getList();
      const messages = data || [];
      setAllMessages(messages);
      // 初始显示乱序的第一页
      const shuffled = shuffleArray(messages);
      const firstPage = shuffled.slice(0, PAGE_SIZE);
      setDisplayMessages(firstPage);
      setHasMore(messages.length > PAGE_SIZE);
      setCurrentPage(1);
    } catch (error) {
      // 错误由全局错误边界处理
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    // 验证输入长度
    if (content.length > inputRules.messageMaxLength) {
      toast.error(`留言长度不能超过 ${inputRules.messageMaxLength} 个字符`);
      return;
    }

    setSubmitting(true);
    try {
      const visitorName = getVisitorName();
      // 清理输入内容，防止 XSS 攻击
      const cleanedContent = cleanUserInput(content);

      await messageApi.create({
        visitor_id: visitorId,
        content: cleanedContent,
        visitor_name: visitorName || undefined,
        location: location || undefined,
      });
      setContent("");
      fetchMessages();
      toast.success("留言成功");
    } catch (error) {
      toast.error("留言失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetLocation = async (): Promise<void> => {
    try {
      await getLocation().then(setLocation);
    } catch (err) {
      toast.error("获取位置失败");
    }
  };

  // 切换排序模式
  const handleSortModeChange = (value: string | number) => {
    setSortMode(value as SortMode);
  };

  // 重新随机排序
  const handleShuffle = () => {
    if (sortMode === "random" && allMessages.length > 0) {
      const shuffled = shuffleArray(allMessages);
      const firstPage = shuffled.slice(0, PAGE_SIZE);
      setDisplayMessages(firstPage);
      setCurrentPage(1);
      setHasMore(allMessages.length > PAGE_SIZE);
    }
  };

  // 滚动到留言输入框
  const scrollToInput = () => {
    inputFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <div className="min-h-screen pt-10 pb-30">
      {/* 左下角俏皮悬浮提示 */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        className="fixed left-4 bottom-24 z-50"
      >
        <motion.div
          onClick={scrollToInput}
          animate={{
            y: [0, -8, 0],
            rotate: inputVisible ? [0, 5, -5, 0] : [0, -3, 3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`relative ${!inputVisible ? "cursor-pointer" : ""}`}
        >
          {/* 主气泡 */}
          <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 p-[2px] rounded-2xl shadow-lg shadow-purple-500/30">
            <div className="bg-white rounded-2xl px-4 py-3 min-w-[160px]">
              <div className="flex items-center gap-2">
                {/* 眼睛看向右边 */}
                <motion.svg
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-6 h-6 text-purple-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  <circle cx="14" cy="12" r="2" fill="currentColor" />
                </motion.svg>
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  {inputVisible ? "写句留言吧~" : "下面可以留言哦"}
                </span>
              </div>
            </div>
          </div>

          {/* 小尾巴 - 指向方向根据状态变化 */}
          {inputVisible ? (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -right-3 top-1/2 -translate-y-1/2"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <motion.svg
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-5 h-5 text-pink-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M13.025 1l-2.847 2.828 6.176 6.176H0v3.992h16.354l-6.176 6.176L13.025 23 24 12z" />
                </motion.svg>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -bottom-2 left-6"
            >
              <div className="w-3 h-3 bg-gradient-to-b from-purple-500 to-pink-500 rotate-45 rounded-sm" />
            </motion.div>
          )}

          {/* 星星装饰 */}
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute -top-2 -right-2 text-yellow-400"
          >
            ✦
          </motion.div>
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-1 -left-2 text-xs text-cyan-400"
          >
            ✦
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4">
        {/* 世界地图弹窗 */}
        <WorldMap visible={showMap} onClose={() => setShowMap(false)} />

        {/* 世界地图触发按钮 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <motion.button
            onClick={() => setShowMap(true)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full relative overflow-hidden px-6 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/30 group cursor-pointer"
          >
            {/* 光泽效果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

            {/* 动态光点 */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute top-2 left-1/4 w-2 h-2 bg-white/50 rounded-full animate-ping"
                style={{ animationDelay: "0s" }}
              />
              <div
                className="absolute bottom-2 right-1/4 w-1.5 h-1.5 bg-cyan-300/50 rounded-full animate-ping"
                style={{ animationDelay: "0.5s" }}
              />
              <div
                className="absolute top-1/2 right-10 w-1 h-1 bg-pink-300/50 rounded-full animate-ping"
                style={{ animationDelay: "1s" }}
              />
            </div>

            <div className="relative flex items-center justify-center gap-3">
              <GlobalOutlined className="text-2xl" style={{ color: "white" }} />
              <span className="text-lg font-bold text-white">
                查看全球访客足迹
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white/90 backdrop-blur-sm">
                点击展开世界地图
              </span>
            </div>
          </motion.button>
        </motion.div>

        {/* 留言列表 - 固定高度，可滚动 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-cyan-400 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-800">所有留言</h2>
              {allMessages.length > 0 && (
                <span className="px-3 py-1 bg-purple-100 rounded-full text-sm text-purple-600">
                  {allMessages.length} 条
                </span>
              )}
            </div>

            {/* 排序控制 */}
            <div className="flex items-center gap-3">
              {sortMode === "random" && (
                <motion.button
                  onClick={handleShuffle}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative overflow-hidden text-sm px-4 py-2 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 border border-purple-300/50 text-purple-600 rounded-xl hover:border-purple-400 transition-all duration-300 flex items-center gap-2 cursor-pointer group"
                >
                  {/* 光泽效果 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  {/* 星星装饰 */}
                  <motion.svg
                    animate={{ rotate: [0, 180, 360] }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="w-4 h-4 relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </motion.svg>
                  <span className="relative z-10 font-medium">换一批</span>
                </motion.button>
              )}
              <div className="relative">
                {/* 发光背景 */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-lg blur-sm" />
                <Segmented
                  value={sortMode}
                  onChange={handleSortModeChange}
                  options={[
                    {
                      value: "random",
                      label: (
                        <motion.span
                          className="flex items-center gap-1.5 px-1"
                          whileHover={{ scale: 1.05 }}
                        >
                          <SyncOutlined className="text-purple-500" />
                          <span className="font-medium">随机</span>
                        </motion.span>
                      ),
                    },
                    {
                      value: "time",
                      label: (
                        <motion.span
                          className="flex items-center gap-1.5 px-1"
                          whileHover={{ scale: 1.05 }}
                        >
                          <ClockCircleOutlined className="text-cyan-500" />
                          <span className="font-medium">最新</span>
                        </motion.span>
                      ),
                    },
                    {
                      value: "hot",
                      label: (
                        <motion.span
                          className="flex items-center gap-1.5 px-1"
                          whileHover={{ scale: 1.05 }}
                        >
                          <FireOutlined className="text-orange-500" />
                          <span className="font-medium">热门</span>
                        </motion.span>
                      ),
                    },
                  ]}
                  size="small"
                  className="relative bg-white/80 backdrop-blur-sm border border-purple-200/50"
                />
              </div>
            </div>
          </div>
          {/* 只有这个区域可以滚动 */}
          <div
            ref={scrollContainerRef}
            className="h-[500px] overflow-y-auto overflow-x-hidden space-y-4 custom-scrollbar px-8 py-4"
          >
            <AnimatePresence>
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  {/* 科技风 Loading - 紫色主题 */}
                  <div className="relative mb-8">
                    {/* 外环 */}
                    <div
                      className="w-20 h-20 border-2 border-purple-500/30 rounded-full animate-spin"
                      style={{ animationDuration: "3s" }}
                    />
                    {/* 中环 */}
                    <div
                      className="absolute top-1 left-1 w-18 h-18 border-2 border-cyan-400/50 rounded-full animate-spin"
                      style={{
                        animationDuration: "2s",
                        animationDirection: "reverse",
                      }}
                    />
                    {/* 内环 */}
                    <div className="absolute top-2 left-2 w-16 h-16 border-t-2 border-purple-300 rounded-full animate-spin" />
                    {/* 中心脉冲 */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-pulse shadow-lg shadow-purple-500/50" />
                    {/* 轨道点 */}
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-300 rounded-full animate-ping"
                      style={{ animationDelay: "0s" }}
                    />
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-ping"
                      style={{ animationDelay: "0.5s" }}
                    />
                  </div>
                  <p className="text-lg text-gray-400 animate-pulse">
                    正在加载留言...
                  </p>
                </div>
              ) : allMessages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full py-20"
                >
                  {/* 空状态 SVG 插图 - 对话气泡 */}
                  <div className="relative mb-8">
                    {/* 背景光晕 */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" />

                    {/* SVG 图标 - 对话气泡 */}
                    <svg
                      className="w-32 h-32 text-gray-600 relative z-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                      />
                    </svg>

                    {/* 浮动小点装饰 */}
                    <div
                      className="absolute top-0 right-0 w-2 h-2 bg-purple-400 rounded-full animate-ping"
                      style={{ animationDelay: "0s" }}
                    />
                    <div
                      className="absolute bottom-4 left-4 w-2 h-2 bg-cyan-400 rounded-full animate-ping"
                      style={{ animationDelay: "0.5s" }}
                    />
                    <div
                      className="absolute top-1/2 -right-4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping"
                      style={{ animationDelay: "1s" }}
                    />
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-300 mb-3">
                    暂无留言
                  </h3>
                  <p className="text-gray-500 text-center max-w-md">
                    这里还没有任何留言
                    <br />
                    <span className="text-sm opacity-70">
                      快来抢沙发，留下你的第一条评论吧！
                    </span>
                  </p>
                </motion.div>
              ) : (
                <>
                  {displayMessages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PixelCard
                        variant="cyan"
                        className="p-6 bg-white/90 backdrop-blur-xl border border-purple-100 hover:shadow-lg hover:shadow-purple-200/20 transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <Avatar userId={message.visitor_id} size={48} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span className="font-semibold text-gray-700">
                                {message.visitor_name ||
                                  `访客 ${message.visitor_id?.slice(-6)}`}
                              </span>
                              <span className="text-gray-400 text-sm">
                                {formatDate(message.created_at)}
                              </span>
                              {message.location && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <svg
                                    className="w-3.5 h-3.5 text-purple-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span className="truncate max-w-md">
                                    {message.location}
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="text-gray-700 leading-relaxed break-words text-lg">
                              {message.content}
                            </p>
                          </div>
                          {/* 点赞按钮 - 固定在右边中间 */}
                          <div className="flex-shrink-0 self-center">
                            <motion.button
                              onClick={() => handleLike(message.id)}
                              disabled={likingInProgress.has(message.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                                likedMessages.has(message.id)
                                  ? "bg-pink-100 text-pink-500"
                                  : "bg-gray-100 text-gray-500 hover:bg-pink-50 hover:text-pink-400"
                              }`}
                            >
                              {likedMessages.has(message.id) ? (
                                <LikeFilled className="text-xl" />
                              ) : (
                                <LikeOutlined className="text-xl" />
                              )}
                              <span className="text-sm font-medium">
                                {message.likes || 0}
                              </span>
                            </motion.button>
                          </div>
                        </div>
                      </PixelCard>
                    </motion.div>
                  ))}

                  {/* 加载更多触发器 */}
                  <div ref={loadMoreRef} className="py-4 flex justify-center">
                    {loadingMore && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Spin size="small" />
                        <span>加载更多...</span>
                      </div>
                    )}
                    {!hasMore && displayMessages.length > 0 && (
                      <div className="text-gray-400 text-sm">
                        已加载全部留言
                      </div>
                    )}
                  </div>
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* 留言表单 */}
        <div ref={inputFormRef} className="relative h-[310px]">
          <ElectricBorder
            color="#7df9ff"
            speed={1}
            chaos={0.12}
            borderRadius={16}
          >
            <motion.form
              onSubmit={handleSubmit}
              className="relative bg-white/90 backdrop-blur-xl border border-purple-100 rounded-2xl p-6"
              whileHover={{ scale: 1.002 }}
              transition={{ duration: 0.2 }}
            >
              {/* 位置信息显示 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-purple-600">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="truncate max-w-xs">
                    {locationLoading
                      ? "获取位置中..."
                      : location || "未获取位置信息"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locationLoading}
                  className="text-xs px-3 py-1 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors duration-200 disabled:opacity-50 cursor-pointer"
                >
                  {locationLoading
                    ? "获取中..."
                    : location
                      ? "更新位置"
                      : "获取位置"}
                </button>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="分享你的想法，留下你的足迹..."
                rows={5}
                maxLength={inputRules.messageMaxLength}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700 placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none resize-none transition-all duration-300 cursor-pointer"
                disabled={submitting}
              />

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    {content.length}/{inputRules.messageMaxLength} 字
                  </span>
                </div>

                {/* 炫酷提交按钮 */}
                <motion.button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="relative overflow-hidden px-8 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* 光泽效果 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                  {/* 粒子背景效果 */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-0 left-1/4 w-1 h-1 bg-white rounded-full animate-ping"></div>
                    <div className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-white rounded-full animate-ping delay-100"></div>
                  </div>

                  <span className="relative flex items-center gap-2">
                    {submitting ? (
                      <>
                        <svg
                          className="w-5 h-5 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>提交中...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                        <span>提交留言</span>
                      </>
                    )}
                  </span>
                </motion.button>
              </div>
            </motion.form>
          </ElectricBorder>
        </div>
      </div>
    </div>
  );
}

export default MessageBoard;
