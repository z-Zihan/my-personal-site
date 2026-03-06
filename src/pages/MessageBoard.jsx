import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { messagesApi } from "../utils/api";
import { toast } from "../utils/toast";
import useVisitorStore from "../store/visitorStore";
import { formatDate } from "../utils/helpers";
import Avatar from "../components/common/Avatar";
import PixelCard from "../components/effects/PixelCard";
import ElectricBorder from "../components/effects/ElectricBorder";
import { useGeolocation } from "../hooks/useGeolocation";

function MessageBoard() {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { visitorId, initVisitor, getVisitorName } = useVisitorStore();
  const {
    location: geoLocation,
    loading: locationLoading,
    error: locationError,
    getLocation,
  } = useGeolocation();

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

  const fetchMessages = async () => {
    try {
      const { data } = await messagesApi.getList();
      setMessages(data.data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const visitorName = getVisitorName();
      await messagesApi.create({
        visitor_id: visitorId,
        content,
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

  const handleGetLocation = async () => {
    try {
      await getLocation().then(setLocation);
    } catch (err) {
      toast.error("获取位置失败");
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            留言板
          </h1>
          <p className="text-gray-400">分享你的想法，留下你的足迹</p>
        </motion.div>

        {/* 留言列表 - 固定高度，可滚动 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-cyan-400 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800">所有留言</h2>
            <span className="px-3 py-1 bg-purple-100 rounded-full text-sm text-purple-600">
              {messages.length} 条
            </span>
          </div>

          {/* 只有这个区域可以滚动 */}

          <div className="h-[500px] overflow-y-auto overflow-x-hidden space-y-4 pr-2 custom-scrollbar">
            <AnimatePresence>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white/80 backdrop-blur-xl p-6 rounded-xl animate-pulse border border-purple-100"
                    />
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-xl text-gray-500">
                    暂无留言，快来抢沙发吧！
                  </p>
                </motion.div>
              ) : (
                messages.map((message, index) => (
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
                          <p className="text-gray-700 leading-relaxed break-words text-lg mb-3">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </PixelCard>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* 留言表单 */}
        <div className="relative h-[310px]">
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
                  className="text-xs px-3 py-1 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors duration-200 disabled:opacity-50"
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
                placeholder="分享你的想法和建议..."
                rows={5}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700 placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none resize-none transition-all duration-300"
                disabled={submitting}
                maxLength={200}
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
                  <span>{content.length} 字</span>
                </div>

                {/* 炫酷提交按钮 */}
                <motion.button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="relative overflow-hidden px-8 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed group"
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
