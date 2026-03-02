import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ReadingProgress from '../components/common/ReadingProgress';
import TableOfContents from '../components/common/TableOfContents';
import ShareButtons from '../components/common/ShareButtons';
import LikeButton from '../components/common/LikeButton';
import ReadingTime from '../components/common/ReadingTime';
import CommentSection from '../components/common/CommentSection';

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const res = await axios.get(`/api/article-detail?id=${id}`);
      setArticle(res.data.data);
      
      // 增加阅读量
      axios.post('/api/increment-views', { id }).catch(() => {});
    } catch (error) {
      console.error('Fetch article error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">文章未找到</h1>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <ReadingProgress />
      <TableOfContents contentRef={contentRef} />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {article.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-white/80">
            <span>📅 {new Date(article.created_at).toLocaleDateString('zh-CN')}</span>
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
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content}
          </ReactMarkdown>
        </article>

        {/* Actions */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <LikeButton articleId={id} initialLikes={article.likes} />
            <ShareButtons 
              title={article.title} 
              url={window.location.href}
            />
          </div>
        </div>

        {/* Comments */}
        <CommentSection articleId={id} />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black py-8 text-center text-gray-400">
        <p>© 2026 Zihan's Blog. All rights reserved.</p>
      </footer>
    </div>
  );
}
