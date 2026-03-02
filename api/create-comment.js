import { querySupabase } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { article_id, visitor_id, content } = req.body;
  if (!article_id || !visitor_id || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data, error } = await querySupabase(
      `INSERT INTO comments (article_id, visitor_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [article_id, visitor_id, content]
    );

    if (error) throw error;

    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
}
