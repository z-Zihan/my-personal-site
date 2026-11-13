import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Eye, Type } from "lucide-react";
import { articleApi, Article } from "../api/article";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import TableOfContents from "../components/common/TableOfContents";
import ReadingProgress from "../components/common/ReadingProgress";
import ShareButtons from "../components/common/ShareButtons";
import LikeButton from "../components/common/LikeButton";
import ReadingTime from "../components/common/ReadingTime";
import CommentSection from "../components/common/CommentSection";
import ArticleNav from "../components/common/ArticleNav";
import { trackEvent } from "../utils/analytics";
import { trackPageRender } from "../utils/perfMonitor";
import { useLanguage } from "../utils/useLanguage";

/** 阅读字号三档：小 / 标准 / 大 */
type FontSizeLevel = "small" | "standard" | "large";

/** 文章加载错误类型（渲染时按类型取 i18n 文案，避免状态里存中文） */
type ErrorKind = "noId" | "notFound" | "loadFailed";

const FONT_SIZE_STORAGE_KEY = "***";

const FONT_SIZE_MAP: Record<FontSizeLevel, string> = {
  small: "15px",
  standard: "17px",
  large: "19px",
};

function getInitialFontSize(): FontSizeLevel {
  try {
    const stored = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
    if (stored === "small" || stored === "standard" || stored === "large") {
      return stored;
    }
  } catch {
    /* localStorage 不可用时用默认档 */
  }
  return "standard";
}

/** 语言徽章显示名映射（hljs class → 展示名） */
const LANGUAGE_LABELS: Record<string, string> = {
  ts: "TS",
  tsx: "TSX",
  js: "JS",
  jsx: "JSX",
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  py: "Python",
  bash: "Shell",
  sh: "Shell",
  shell: "Shell",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  sql: "SQL",
  css: "CSS",
  html: "HTML",
  xml: "XML",
  markdown: "Markdown",
  md: "Markdown",
  go: "Go",
  rust: "Rust",
  java: "Java",
  cpp: "C++",
  c: "C",
  toml: "TOML",
  dockerfile: "Dockerfile",
};

/** 从 code 元素的 className 提取语言名（language-xxx） */
function getLanguageLabel(className?: string): string | null {
  if (!className) return null;
  const match = /language-([\w-]+)/.exec(className);
  if (!match) return null;
  const raw = match[1].toLowerCase();
  return LANGUAGE_LABELS[raw] || raw.toUpperCase();
}

/** 复制按钮：成功后显示「已复制 ✓」1.5s 还原（文案由父组件注入） */
function CopyButton({ getText, copiedText, copyText }: { getText: () => string; copiedText: string; copyText: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 剪贴板不可用（非安全上下文等），静默失败 */
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`code-copy-btn ${copied ? "is-copied" : ""}`}
      aria-label={copied ? copiedText : copyText}
    >
      {copied ? copiedText : copyText}
    </button>
  );
}

/**
 * 覆写 pre 渲染：外层 div.code-block（相对定位）承载语言徽章 + 复制按钮，
 * 内层保持原 <pre> 结构不变（rehypeHighlight 的 hljs 类照常生效）。
 */
function createPreOverride(copiedText: string, copyText: string): Components["pre"] {
  return ({ children, node, ...props }) => {
    // 从子 code 元素提取语言名和源码文本
    let langLabel: string | null = null;
    let rawText = "";
    const child = Array.isArray(children) ? children[0] : children;
    if (child && typeof child === "object" && "props" in (child as { props?: { className?: string; children?: unknown } })) {
      const childProps = (child as { props?: { className?: string; children?: unknown } }).props;
      langLabel = getLanguageLabel(childProps?.className);
      rawText = extractText(childProps?.children);
    } else if (typeof child === "string") {
      rawText = child;
    }

    return (
      <div className="code-block">
        {langLabel && <span className="code-lang-badge">{langLabel}</span>}
        <CopyButton getText={() => rawText} copiedText={copiedText} copyText={copyText} />
        <pre {...props}>{children}</pre>
      </div>
    );
  };
}

/** 递归提取 React 子树里的纯文本（用于复制） */
function extractText(node: unknown): string {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && node !== null && "props" in node) {
    const props = (node as { props?: { children?: unknown } }).props;
    return extractText(props?.children);
  }
  return "";
}

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorKind | null>(null);
  const [headerVisible, setHeaderVisible] = useState(true);
  const contentRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // 字号标签（小/标准/大）跟随语言
  const FONT_SIZE_LABELS: Record<FontSizeLevel, string> = useMemo(
    () => ({
      small: t("fontSizeSmall"),
      standard: t("fontSizeStandard"),
      large: t("fontSizeLarge"),
    }),
    [t]
  );

  // 语言切换时重渲染（useLanguage 内部已处理），pre 覆写按当前文案生成
  const markdownComponents = useMemo<Components>(
    () => ({
      pre: createPreOverride(t("copied"), t("copyCode")),
    }),
    [t]
  );

  // 阅读字号（localStorage 持久化）
  const [fontSize, setFontSize] = useState<FontSizeLevel>(getInitialFontSize);
  const handleFontSizeChange = useCallback((level: FontSizeLevel) => {
    setFontSize(level);
    try {
      localStorage.setItem(FONT_SIZE_STORAGE_KEY, level);
    } catch {
      /* 忽略存储失败 */
    }
  }, []);

  // 文章内容稳定后重新提取目录（TableOfContents 以 contentRef 变化为信号）
  const [contentReady, setContentReady] = useState(0);
  useEffect(() => {
    if (article && !loading) {
      setContentReady((n) => n + 1);
    }
  }, [article, loading]);

  // 页面级渲染耗时埋点：mount → 文章数据渲染完成
  const perfMountAt = useRef<number>(performance.now());
  useEffect(() => {
    if (article && !loading) {
      trackPageRender(performance.now() - perfMountAt.current);
    }
  }, [article, loading]);

  useEffect(() => {
    if (!id) {
      setError("noId");
      setLoading(false);
      return;
    }
    // 切换文章时滚动复位（轻量处理，不影响滚动监听）
    window.scrollTo(0, 0);
    fetchArticle();
  }, [id]);

  // 监听滚动，控制 header 和底部磨合的显示/隐藏
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          let newHeaderVisible = true;
          // 向下滚动且超过一定距离时，隐藏 header 和底部磨合
          if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
            newHeaderVisible = false;
          } else {
            // 向上滚动时，显示 header 和底部磨合
            newHeaderVisible = true;
          }
          lastScrollY.current = currentScrollY;
          ticking.current = false;

          // 只在状态变化时触发事件，避免不必要的更新
          if (newHeaderVisible !== headerVisible) {
            setHeaderVisible(newHeaderVisible);
            // 触发自定义事件通知 App.jsx
            window.dispatchEvent(new CustomEvent('header-visibility-change', {
              detail: { visible: newHeaderVisible }
            }));
          }
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headerVisible]);

  // 文章加载成功后，记录浏览埋点
  useEffect(() => {
    if (article) {
      trackEvent('article_view', 'engagement', {
        article_id: article.id,
        article_title: article.title,
        page_path: window.location.pathname,
      });
    }
  }, [article]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await articleApi.getDetail(id!);
      const articleData = (response as { data?: Article }).data;
      if (articleData) {
        setArticle(articleData);
      } else {
        // 文章不存在(假链接/已删除):上报 404 埋点
        trackEvent("page_404", "error", {
          path: window.location.pathname,
          reason: "article_not_found",
          referrer: document.referrer,
        });
        setError("notFound");
      }
    } catch (err: unknown) {
      if ((err as { response?: { status?: number } })?.response?.status === 404) {
        setError("notFound");
      } else {
        setError("loadFailed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="relative">
          {/* 脉冲光环加载器 */}
          <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-900 rounded-full animate-ping" />
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-purple-500 rounded-full animate-spin" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50 animate-pulse" />
          <p className="text-center mt-6 text-gray-600 dark:text-gray-400 animate-pulse">{t("loadingArticle")}</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    const isNotFound = !error || error !== "loadFailed";
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {isNotFound ? t("articleNotFound") : t("loadFailed")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {isNotFound ? t("articleNotFoundHint") : t("networkErrorHint")}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors cursor-pointer"
            >
              {t("backHome")}
            </button>
            <button
              onClick={() => navigate("/blog")}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
              {t("viewArticleList")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 日期按当前语言显示（en → 英文格式）
  const locale = lang === "zh" ? "zh-CN" : "en-US";

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors pb-24"
    >
      <ReadingProgress />

      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {article.title}
          </h1>
          {article.summary && (
            <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
              {article.summary}
            </p>
          )}
          <div className="flex items-center justify-center gap-6 text-white/80 flex-wrap">
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5" /> {new Date(article.created_at || Date.now()).toLocaleDateString(locale)}
            </span>
            <ReadingTime content={article.content} />
            <span className="flex items-center gap-2">
              <Eye className="w-5 h-5" /> {article.views || 0} {t("viewsSuffix")}
            </span>
          </div>
        </div>
      </header>

      {/* 阅读工具栏：字号切换 + 长文导航提示 */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between flex-wrap gap-3 -mb-6 mt-6 pb-4 border-b border-gray-200/60 dark:border-gray-700/60">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Type className="w-4 h-4" />
            <span>{t("fontSize")}</span>
            <div
              className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              role="group"
              aria-label={t("fontSize")}
            >
              {(Object.keys(FONT_SIZE_MAP) as FontSizeLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => handleFontSizeChange(level)}
                  aria-pressed={fontSize === level}
                  title={`${FONT_SIZE_LABELS[level]}${t("fontSize")}`}
                  className={`px-3 py-1 text-xs transition-colors cursor-pointer ${
                    fontSize === level
                      ? "bg-purple-500 text-white font-medium"
                      : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {FONT_SIZE_LABELS[level]}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {t("tocHint")}
          </span>
        </div>
      </div>

      {/* Content：正文 max-w-4xl + 右侧 TOC 栏（xl 以上显示） */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex gap-10 items-start">
          <div className="flex-1 min-w-0 max-w-4xl mx-auto">
        {article.content && article.content.trim() !== "" ? (
          <article
            ref={contentRef}
            style={{ '--article-font-size': FONT_SIZE_MAP[fontSize] } as React.CSSProperties}
            className="article-body prose dark:prose-invert max-w-none
            prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-p:text-gray-700 dark:prose-p:text-gray-300
            prose-a:text-purple-500 hover:prose-a:text-purple-600
            prose-code:text-pink-500 dark:prose-code:text-pink-400
            prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700
            prose-pre:overflow-x-auto prose-pre:whitespace-pre
            prose-img:rounded-xl prose-img:shadow-md
            prose-table:border-collapse
            prose-th:border prose-th:border-gray-200 dark:prose-th:border-gray-700 prose-th:px-3 prose-th:py-2 prose-th:bg-gray-100 dark:prose-th:bg-gray-800
            prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-700 prose-td:px-3 prose-td:py-2"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
              components={markdownComponents}
            >
              {article.content}
            </ReactMarkdown>
          </article>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg
              className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <p className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">
              {t("noContent")}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {t("noContentHint")}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-12">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-gray-100/80 dark:bg-gray-800/60 rounded-2xl px-6 py-5">
            <LikeButton articleId={id || ''} initialLikes={article.likes || 0} />
            <ShareButtons title={article.title} url={window.location.href} articleId={id} />
          </div>
        </div>

        {/* Article Navigation */}
        <ArticleNav currentArticleId={id || ''} />

        {/* Comments */}
        <CommentSection articleId={id || ''} />
          </div>

          {/* 右侧目录栏（xl 及以上屏幕显示） */}
          <aside className="hidden xl:block w-60 flex-shrink-0 sticky top-24">
            <TableOfContents contentRef={contentRef} />
          </aside>
        </div>
      </main>
    </div>
  );
}
