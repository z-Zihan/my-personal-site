import { querySupabase } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;
  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Query too short' });
  }

  try {
    const { data, error } = await querySupabase(
      `SELECT id, title, summary, cover, created_at 
       FROM articles 
       WHERE status = 'published' 
       AND (title ILIKE $1 OR summary ILIKE $1 OR content ILIKE $1)
       ORDER BY created_at DESC
       LIMIT 10`,
      [`%${q}%`]
    );

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
}
