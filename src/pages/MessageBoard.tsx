import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { messageApi } from '../api/index';
import { toast } from "../utils/toast";
import useVisitorStore from "../store/visitorStore";
import { formatDate } from "../utils/helpers";
import Avatar from "../components/common/Avatar";
import PixelCard from "../components/effects/PixelCard";
import ElectricBorder from "../components/effects/ElectricBorder";
import { useGeolocation } from "../hooks/useGeolocation";
import { cleanUserInput, inputRules } from "../utils/sanitize";

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
      const { data } = await messageApi.getList();
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
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

  const handleGetLocation = async () => {
    try {
      await getLocation().then(setLocation);
    } catch (err) {
      toast.error("获取位置失败");
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-24">
      <div className="max-w-4xl mx-auto px-4">
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
            {messages.length > 0 && (
              <span className="px-3 py-1 bg-purple-100 rounded-full text-sm text-purple-600">
                {messages.length} 条
              </span>
            )}
          </div>

          {/* 只有这个区域可以滚动 */}

          <div className="h-[500px] overflow-y-auto overflow-x-hidden space-y-4 custom-scrollbar  px-8 py-4">
            <AnimatePresence>
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  {/* 科技风 Loading - 紫色主题 */}
                  <div className="relative mb-8">
                    {/* 外环 */}
                    <div className="w-20 h-20 border-2 border-purple-500/30 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                    {/* 中环 */}
                    <div className="absolute top-1 left-1 w-18 h-18 border-2 border-cyan-400/50 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                    {/* 内环 */}
                    <div className="absolute top-2 left-2 w-16 h-16 border-t-2 border-purple-300 rounded-full animate-spin" />
                    {/* 中心脉冲 */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-pulse shadow-lg shadow-purple-500/50" />
                    {/* 轨道点 */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-300 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                  </div>
                  <p className="text-lg text-gray-400 animate-pulse">正在加载留言...</p>
                </div>
              ) : messages.length === 0 ? (
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
                    <div className="absolute top-0 right-0 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
                    <div className="absolute bottom-4 left-4 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                    <div className="absolute top-1/2 -right-4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-300 mb-3">暂无留言</h3>
                  <p className="text-gray-500 text-center max-w-md">
                    这里还没有任何留言
                    <br />
                    <span className="text-sm opacity-70">快来抢沙发，留下你的第一条评论吧！</span>
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
                  <span>{content.length}/{inputRules.messageMaxLength} 字</span>
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
