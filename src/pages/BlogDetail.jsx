import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { articleApi } from "../api/article";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ReadingProgress from "../components/common/ReadingProgress";
import ShareButtons from "../components/common/ShareButtons";
import LikeButton from "../components/common/LikeButton";
import ReadingTime from "../components/common/ReadingTime";
import CommentSection from "../components/common/CommentSection";

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!id) {
      setError("文章 ID 不存在");
      setLoading(false);
      return;
    }
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await articleApi.getDetail(id);
      if ( res.data) {
        setArticle(res.data);
      } else {
        setError("文章不存在");
      }
    } catch (err) {
      console.error("Fetch article error:", err);
      if (err.response?.status === 404) {
        setError("文章不存在");
      } else {
        setError("加载失败，请稍后重试");
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
          <p className="text-center mt-6 text-gray-600 dark:text-gray-400 animate-pulse">加载文章中...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {error || "文章未找到"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            可能的原因：文章已被删除、未发布或链接不正确
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              返回首页
            </button>
            <button
              onClick={() => navigate("/blog")}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              查看文章列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors pb-24">
      <ReadingProgress />
      {/* <TableOfContents contentRef={contentRef} /> */}

      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {article.title}
          </h1>
          {article.summary && (
            <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
              {article.summary}
            </p>
          )}
          <div className="flex items-center justify-center gap-6 text-white/80 flex-wrap">
            <span>
              📅 {new Date(article.created_at).toLocaleDateString("zh-CN")}
            </span>
            <ReadingTime content={article.content} />
            <span>👁️ {article.views || 0} 次阅读</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <article
          ref={contentRef}
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-p:text-gray-700 dark:prose-p:text-gray-300
            prose-a:text-purple-500 hover:prose-a:text-purple-600
            prose-code:text-pink-500 dark:prose-code:text-pink-400
            prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {article.content}
          </ReactMarkdown>
        </article>

        {/* Actions */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <LikeButton articleId={id} initialLikes={article.likes} />
            <ShareButtons title={article.title} url={window.location.href} />
          </div>
        </div>

        {/* Comments */}
        <CommentSection articleId={id} />
      </main>
    </div>
  );
}
