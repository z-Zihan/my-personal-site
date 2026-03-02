import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CommentSection({ articleId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [visitorId, setVisitorId] = useState('');

  useEffect(() => {
    // 获取或创建访客 ID
    let vid = localStorage.getItem('visitor_id');
    if (!vid) {
      vid = 'visitor_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('visitor_id', vid);
    }
    setVisitorId(vid);
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/api/comments?article_id=${articleId}`);
      setComments(res.data.data || []);
    } catch (error) {
      console.error('Fetch comments error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await axios.post('/api/create-comment', {
        article_id: articleId,
        visitor_id: visitorId,
        content: newComment
      });
      setNewComment('');
      fetchComments();
    } catch (error) {
      alert('评论失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const getAvatar = (id) => {
    const avatars = ['🐱', '🐶', '🦊', '🦁', '🐯', '🐼', '🐨', '🐸'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash = hash & hash;
    }
    return avatars[Math.abs(hash) % avatars.length];
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">评论 ({comments.length})</h3>
      
      {/* 评论表单 */}
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="写下你的评论..."
          rows="4"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-3 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? '提交中...' : '发表评论'}
        </button>
      </form>

      {/* 评论列表 */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <span className="text-4xl">{getAvatar(comment.visitor_id)}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {comment.visitor_name || '访客'}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-gray-500 py-8">暂无评论，快来抢沙发吧！</p>
        )}
      </div>
    </div>
  );
}
