import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function LikeButton({ articleId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes || 0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const hasLiked = localStorage.getItem(`liked_${articleId}`);
    if (hasLiked) setLiked(true);
  }, [articleId]);

  const handleLike = async () => {
    if (liked) return;

    try {
      const visitorId = localStorage.getItem('visitor_id') || 
        ('visitor_' + Date.now().toString(36));
      
      await axios.post('/api/like-article', {
        article_id: articleId,
        visitor_id: visitorId
      });
      
      setLikes(likes + 1);
      setLiked(true);
      localStorage.setItem(`liked_${articleId}`, 'true');
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={liked}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
        liked
          ? 'bg-pink-500 text-white'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-pink-100 dark:hover:bg-pink-900'
      }`}
    >
      <span>{liked ? '❤️' : '🤍'}</span>
      <span>{likes}</span>
    </button>
  );
}
