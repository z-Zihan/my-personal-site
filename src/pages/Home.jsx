import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from '../components/common/ThemeToggle';
import SearchBar from '../components/common/SearchBar';
import ReadingTime from '../components/common/ReadingTime';
import { getArticleCover } from '../utils/defaultCovers';

export default function Home() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [hotNews, setHotNews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [articlesRes, newsRes, statsRes] = await Promise.all([
        axios.get('/api/articles?page=1&limit=6&status=published'),
        axios.get('/api/hot-news'),
        axios.get('/api/stats')
      ]);
      setArticles(articlesRes.data.data || []);
      setHotNews(newsRes.data.data || []);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <ThemeToggle />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 py-32">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            Zihan's Blog
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-8 animate-fade-in-up">
            探索技术 · 记录生活 · 分享思考
          </p>
          
          <div className="max-w-md mx-auto mb-8">
            <SearchBar />
          </div>
          
          {stats && (
            <div className="flex justify-center gap-8 text-white animate-fade-in-up">
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.totalArticles || 0}</div>
                <div className="text-white/70">文章</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.totalViews || 0}</div>
                <div className="text-white/70">阅读</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.totalMessages || 0}</div>
                <div className="text-white/70">留言</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Articles */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          ✨ 最新文章
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <article
              key={article.id}
              onClick={() => navigate(`/blog/${article.id}`)}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <img
                src={getArticleCover(article)}
                alt={article.title}
                className="w-full h-48 object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop'
                }}
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {article.summary}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <ReadingTime content={article.content} />
                  <span>👁️ {article.views || 0}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        {articles.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/blog')}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:opacity-90 transition-opacity"
            >
              查看全部文章 →
            </button>
          </div>
        )}
      </section>

      {/* Hot News */}
      {hotNews.length > 0 && (
        <section className="bg-gray-100 dark:bg-gray-800 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              🔥 热点资讯
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {hotNews.slice(0, 6).map((news, index) => (
                <a
                  key={news.id}
                  href={news.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white dark:bg-gray-700 p-4 rounded-lg hover:shadow-lg transition-shadow flex items-center gap-4"
                >
                  <span className="text-2xl">📰</span>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                      {news.title}
                    </h4>
                    <span className="text-sm text-gray-500">{news.source}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black py-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400">
          <p className="mb-4">Made with ❤️ by Zihan</p>
          <p>© 2026 Zihan's Blog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
