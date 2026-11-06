import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion as Motion } from "framer-motion";
import { hotNewsApi } from "../api/index";
import type { HotNews } from "../api/index";
import PixelCard from "../components/effects/PixelCard";
import Crosshair from "../components/effects/Crosshair";
import { useLanguage } from "../utils/useLanguage";
import type { Translations } from "../utils/i18n";

// 前端本地缓存时间：5 分钟
const CLIENT_CACHE_DURATION = 5 * 60 * 1000;
// v2：数据源切换为 GitHub / Hacker News / V2EX，旧缓存作废
const CACHE_KEY = "hot_news_cache_v2";

type SourceFilter = "all" | "GitHub" | "Hacker News" | "V2EX";
const SOURCE_FILTERS: SourceFilter[] = ["all", "GitHub", "Hacker News", "V2EX"];

// 来源徽章样式（来源名是专有名词，不翻译）
const SOURCE_STYLES: Record<string, { dot: string; badge: string; hotIcon: string }> = {
  GitHub: { dot: "bg-gray-800", badge: "bg-gray-800/10 text-gray-800", hotIcon: "⭐" },
  "Hacker News": { dot: "bg-orange-500", badge: "bg-orange-500/10 text-orange-600", hotIcon: "▲" },
  V2EX: { dot: "bg-blue-500", badge: "bg-blue-500/10 text-blue-600", hotIcon: "💬" },
};
const DEFAULT_SOURCE_STYLE = { dot: "bg-purple-500", badge: "bg-purple-500/10 text-purple-600", hotIcon: "🔥" };

const formatHot = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);

type TFn = (key: keyof Translations, params?: Record<string, string | number>) => string;

// 相对时间：just now / 5m ago / 2h ago / 3d ago（7 天以上显示日期）
const formatRelative = (iso: string | undefined, t: TFn, lang: string): string => {
  if (!iso) return "";
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return "";
  const diff = Math.max(0, Date.now() - time);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return t("justNow");
  if (minutes < 60) return t("minutesAgo", { n: minutes });
  if (hours < 24) return t("hoursAgo", { n: hours });
  if (days < 7) return t("daysAgo", { n: days });
  return new Date(time).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US");
};

function HotNewsPage() {
  const { t, lang } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [news, setNews] = useState<HotNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<SourceFilter>("all");

  const fetchNews = useCallback(async (force = false) => {
    let cached: string | null = null;
    try {
      cached = localStorage.getItem(CACHE_KEY);
    } catch {
      /* localStorage 不可用 */
    }

    // 先尝试从本地缓存获取（手动刷新时跳过）
    if (cached && !force) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CLIENT_CACHE_DURATION && data.length > 0) {
          setNews(data);
          setLoading(false);
          return;
        }
      } catch {
        /* 缓存损坏，忽略 */
      }
    }

    try {
      const data = await hotNewsApi.getList();
      const newsData = (data as unknown as { data?: HotNews[] }).data || [];
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
      // 如果请求失败，使用旧缓存（如果有）
      if (cached) {
        try {
          setNews(JSON.parse(cached).data || []);
        } catch {
          /* ignore */
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    fetchNews(true);
  };

  const filteredNews = useMemo(
    () => (filter === "all" ? news : news.filter((item) => item.source === filter)),
    [news, filter],
  );

  return (
    <div ref={containerRef} className="min-h-screen pt-20 pb-24 relative overflow-hidden">
      <Crosshair color="#f97316" containerRef={containerRef as React.RefObject<HTMLElement>} />
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <Motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-center mb-12 neon-text"
        >
          {t("hotNewsTitle")}
        </Motion.h1>

        {/* 来源过滤 + 刷新 */}
        {!loading && news.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div className="flex flex-wrap items-center gap-2">
              {SOURCE_FILTERS.map((key) => {
                const active = filter === key;
                const style = key === "all" ? null : SOURCE_STYLES[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer border ${
                      active
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent shadow-md shadow-orange-500/30"
                        : "bg-white/70 text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600"
                    }`}
                  >
                    {style && (
                      <span className={`w-2 h-2 rounded-full ${active ? "bg-white" : style.dot}`} />
                    )}
                    {key === "all" ? t("hotNewsAll") : key}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-white/70 text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-600 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
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
              </svg>
              {t("hotNewsRefresh")}
            </button>
          </div>
        )}

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
              {t("loadingHotNews")}
            </p>
          </div>
        ) : filteredNews.length === 0 ? (
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
              {t("noHotNews")}
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              {t("noHotNewsHint")}
              <br />
              <span className="text-sm opacity-70">
                {t("noHotNewsHintSub")}
              </span>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNews.map((item, index) => {
              const style = (item.source && SOURCE_STYLES[item.source]) || DEFAULT_SOURCE_STYLE;
              const relative = formatRelative(item.created_at, t, lang);
              return (
              <Motion.a
                key={`hot_news_${item.id ?? item.link}${index}`}
                href={item.link || item.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index, 12) * 0.04 }}
                className="block"
              >
                <PixelCard
                  variant="orange"
                  className="p-6 hover:bg-primary/10 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-3xl font-bold text-primary">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {item.source && (
                          <span
                            className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${style.badge}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {item.source}
                          </span>
                        )}
                        {typeof item.hot === "number" && item.hot > 0 && (
                          <span className="text-xs font-medium text-gray-500 tabular-nums">
                            {style.hotIcon} {formatHot(item.hot)}
                          </span>
                        )}
                        {relative && (
                          <span className="text-xs text-gray-400">{relative}</span>
                        )}
                      </div>
                      <h3 className="text-xl font-medium ml-12 break-words">
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default HotNewsPage;