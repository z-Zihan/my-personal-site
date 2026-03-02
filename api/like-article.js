import { querySupabase } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { article_id, visitor_id } = req.body;
  if (!article_id || !visitor_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 插入点赞记录（会触发 trigger 自动增加文章点赞数）
    const { data, error } = await querySupabase(
      `INSERT INTO likes (article_id, visitor_id)
       VALUES ($1, $2)
       ON CONFLICT (article_id, visitor_id) DO NOTHING
       RETURNING *`,
      [article_id, visitor_id]
    );

    if (error) throw error;

    // 获取最新点赞数
    const { data: article } = await querySupabase(
      'SELECT likes FROM articles WHERE id = $1',
      [article_id]
    );

    res.status(200).json({ 
      success: true, 
      likes: article?.[0]?.likes || 0 
    });
  } catch (error) {
    console.error('Like article error:', error);
    res.status(500).json({ error: 'Failed to like article' });
  }
}
