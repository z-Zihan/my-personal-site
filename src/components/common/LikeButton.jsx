import React, { useState, useEffect, useCallback } from 'react';
import { post, del } from '../../utils/request';
import { toast } from '../../utils/toast';

// 本地存储 key
const STORAGE_KEY = 'article_likes';

/**
 * 获取本地存储的点赞记录
 * @returns {Object} { articleId: timestamp }
 */
const getLikedArticles = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

/**
 * 检查是否已点赞
 * @param {string|number} articleId - 文章 ID
 */
const hasLiked = (articleId) => {
  const liked = getLikedArticles();
  return !!liked[articleId];
};

/**
 * 设置点赞状态
 * @param {string|number} articleId - 文章 ID
 */
const setLikeStatus = (articleId) => {
  const liked = getLikedArticles();
  liked[articleId] = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(liked));
};

/**
 * 取消点赞状态
 * @param {string|number} articleId - 文章 ID
 */
const removeLikeStatus = (articleId) => {
  const liked = getLikedArticles();
  delete liked[articleId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(liked));
};

export default function LikeButton({ articleId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  // 初始化时检查是否已点赞
  useEffect(() => {
    if (articleId) {
      setIsLiked(hasLiked(articleId));
    }
  }, [articleId]);

  const handleLike = useCallback(async () => {
    if (loading) return;

    setLoading(true);

    // 获取或创建访客 ID
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('visitor_id', visitorId);
    }

    const newLikeStatus = !isLiked;

    // 乐观更新 UI
    setLikes(prev => newLikeStatus ? prev + 1 : Math.max(0, prev - 1));
    setIsLiked(newLikeStatus);

    try {
      if (newLikeStatus) {
        // 点赞
        await post('/api/like-article', {
          article_id: articleId,
          visitor_id: visitorId
        });
        setLikeStatus(articleId);
        toast.success('点赞成功');
      } else {
        // 取消点赞
        await del('/api/like-article', {
          article_id: articleId,
          visitor_id: visitorId
        });
        removeLikeStatus(articleId);
        toast.success('已取消点赞');
      }
    } catch (error) {
      console.error('Like error:', error);
      // 回滚 UI
      setLikes(prev => newLikeStatus ? prev - 1 : prev + 1);
      setIsLiked(!newLikeStatus);

      const errorMsg = error.response?.data?.message || error.message || '操作失败，请重试';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [articleId, isLiked, loading]);

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all duration-300 select-none
        ${isLiked
          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30'
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-md shadow-gray-200/50 dark:shadow-gray-900/50 hover:shadow-lg hover:shadow-pink-500/20 dark:hover:shadow-pink-900/20'
        }
        ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 active:scale-95 cursor-pointer'}
      `}
      aria-label={isLiked ? '取消点赞' : '点赞'}
      aria-pressed={isLiked}
    >
      {/* 光晕效果 */}
      {isLiked && (
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-400/20 to-rose-400/20 animate-pulse" />
      )}

      {/* 爱心图标 */}
      <span
        className={`relative text-xl transition-transform duration-300 ${
          isLiked ? 'animate-heartbeat' : 'group-hover:scale-110'
        }`}
        aria-hidden="true"
      >
        {isLiked ? '❤️' : '🤍'}
      </span>

      {/* 点赞数 */}
      <span className={`relative font-semibold text-base ${isLiked ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>
        {loading ? (
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : likes}
      </span>

      {/* 提示文字 */}
      {!loading && (
        <span className={`relative text-sm transition-all duration-300 ${
          isLiked ? 'text-pink-100' : 'text-gray-500 dark:text-gray-400 group-hover:text-pink-500 dark:group-hover:text-pink-400'
        }`}>
          {isLiked ? '已赞' : '点赞'}
        </span>
      )}
    </button>
  );
}
