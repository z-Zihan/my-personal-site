import { querySupabase } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { article_id } = req.query;
  if (!article_id) {
    return res.status(400).json({ error: 'Article ID required' });
  }

  try {
    const { data, error } = await querySupabase(
      `SELECT * FROM comments 
       WHERE article_id = $1 
       ORDER BY created_at DESC`,
      [article_id]
    );

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Fetch comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
}
