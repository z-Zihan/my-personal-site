import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from '../../utils/toast';
import { API_BASE } from '../../constants/apiConstants';

export default function LikeButton({ articleId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes || 0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 检查是否已点赞
    const hasLiked = localStorage.getItem(`liked_${articleId}`);
    if (hasLiked === 'true') {
      setLiked(true);
    }
  }, [articleId]);

  const handleLike = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const visitorId = localStorage.getItem('visitor_id') || 
        ('visitor_' + Date.now().toString(36));
      
      if (liked) {
        // 取消点赞
        await axios.delete(`${API_BASE}/api/like-article`, {
          data: { article_id: articleId, visitor_id: visitorId }
        });
        setLikes(Math.max(0, likes - 1));
        setLiked(false);
        localStorage.removeItem(`liked_${articleId}`);
        toast.success('已取消点赞');
      } else {
        // 点赞
        await axios.post(`${API_BASE}/api/like-article`, {
          article_id: articleId,
          visitor_id: visitorId
        });
        setLikes(likes + 1);
        setLiked(true);
        localStorage.setItem(`liked_${articleId}`, 'true');
        toast.success('点赞成功');
      }
    } catch (error) {
      console.error('Like error:', error);
      toast.error('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
        liked
          ? 'bg-pink-500 text-white'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-pink-100 dark:hover:bg-pink-900'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span>{liked ? '❤️' : '🤍'}</span>
      <span>{loading ? '...' : likes}</span>
    </button>
  );
}
