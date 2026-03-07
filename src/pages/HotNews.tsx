import { useState, useEffect, useRef } from "react";
import { motion as Motion } from "framer-motion";
import { hotNewsApi } from "../api/index";
import PixelCard from "../components/effects/PixelCard";
import Crosshair from "../components/effects/Crosshair";

// 前端本地缓存时间：5 分钟
const CLIENT_CACHE_DURATION = 5 * 60 * 1000;
const CACHE_KEY = "hot_news_cache";

function HotNews() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      // 先尝试从本地缓存获取
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CLIENT_CACHE_DURATION && data.length > 0) {
          setNews(data);
          setLoading(false);
          console.log("Using client-side cached news");
          return;
        }
      }

      try {
        const { data } = await hotNewsApi.getList();
        const newsData = data || [];
        setNews(newsData);

        // 更新本地缓存
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: newsData,
            timestamp: Date.now(),
          }),
        );
      } catch (error) {
        console.error("Error fetching news:", error);
        // 如果请求失败，使用旧缓存（如果有）
        if (cached) {
          const { data } = JSON.parse(cached);
          setNews(data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen pt-20 pb-24">
      <Crosshair color="#f97316" containerRef={containerRef} />
      <div className="max-w-4xl mx-auto px-4">
        <Motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-center mb-12 neon-text"
        >
          热点资讯
        </Motion.h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            {/* 科技风 Loading */}
            <div className="relative mb-8">
              {/* 外环旋转 */}
              <div
                className="w-20 h-20 border-2 border-orange-500/30 rounded-full animate-spin"
                style={{ animationDuration: "3s" }}
              />
              {/* 中环反向 */}
              <div
                className="absolute top-1 left-1 w-18 h-18 border-2 border-orange-400/50 rounded-full animate-spin"
                style={{
                  animationDuration: "2s",
                  animationDirection: "reverse",
                }}
              />
              {/* 内环 */}
              <div className="absolute top-2 left-2 w-16 h-16 border-t-2 border-orange-300 rounded-full animate-spin" />
              {/* 中心脉冲点 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse shadow-lg shadow-orange-500/50" />
              {/* 轨道卫星点 */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-orange-300 rounded-full animate-ping"
                style={{ animationDelay: "0s" }}
              />
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-400 rounded-full animate-ping"
                style={{ animationDelay: "0.5s" }}
              />
            </div>
            <p className="text-lg text-gray-400 animate-pulse">
              正在加载热点资讯...
            </p>
          </div>
        ) : news.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            {/* 空状态 SVG 插图 */}
            <div className="relative mb-8">
              {/* 背景光晕 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse" />

              {/* SVG 图标 - 报纸/新闻 */}
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
                  d="M12.75 19.5v-.75a7.5 7.5 0 00-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M12 12.75l2.25-2.25M12 12.75V18m0 0l2.25-2.25M12 12.75L9.75 10.5"
                />
              </svg>

              {/* 浮动小点装饰 */}
              <div
                className="absolute top-0 right-0 w-2 h-2 bg-orange-400 rounded-full animate-ping"
                style={{ animationDelay: "0s" }}
              />
              <div
                className="absolute bottom-4 left-4 w-2 h-2 bg-red-400 rounded-full animate-ping"
                style={{ animationDelay: "0.5s" }}
              />
              <div
                className="absolute top-1/2 -right-4 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping"
                style={{ animationDelay: "1s" }}
              />
            </div>

            <h3 className="text-2xl font-semibold text-gray-300 mb-3">
              暂无热点资讯
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              暂时还没有获取到热点信息
              <br />
              <span className="text-sm opacity-70">
                请稍后再来查看最新资讯动态
              </span>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item, index) => (
              <Motion.a
                key={`hot_news_${item.id}${index}`}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="block"
              >
                <PixelCard
                  variant="orange"
                  className="p-6 hover:bg-primary/10 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl font-bold text-primary">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {item.source && (
                          <span className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded">
                            {item.source}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-medium ml-12">
                        {item.title}
                      </h3>
                    </div>
                    <svg
                      className="w-6 h-6 text-gray-500 flex-shrink-0 ml-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </div>
                </PixelCard>
              </Motion.a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HotNews;