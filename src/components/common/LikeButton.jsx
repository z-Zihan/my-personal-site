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
        await del('/api/like-article', { article_id: articleId, visitor_id: visitorId }, {
          headers: { 'Content-Type': 'application/json' }
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
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all select-none ${
        isLiked
          ? 'bg-pink-500 text-white'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-pink-100 dark:hover:bg-pink-900'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
      aria-label={isLiked ? '取消点赞' : '点赞'}
      aria-pressed={isLiked}
    >
      <span className="text-lg" aria-hidden="true">{isLiked ? '❤️' : '🤍'}</span>
      <span className="font-medium">{loading ? '...' : likes}</span>
    </button>
  );
}
