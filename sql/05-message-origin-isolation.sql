-- ============================================
-- 留言来源隔离 (2026-11-13)
-- 需求: 系统生成的留言(seed/mock/intl)只存在于后台"系统留言"入口,
--       不进入前台留言板、不计入仪表盘留言数
-- 方案: get_messages_random RPC 只返回真实留言(visitor_<ts>_<rand> 前缀)
--       /api/messages 列表接口同样过滤
-- 幂等: 可重复执行
-- ============================================

-- 1. 重建随机排序 RPC:只返回真实留言
--    真实留言 visitor_id 格式: visitor_<13位时间戳>_<随机串>
--    排除: owner_*(博主) / visitor_<纯数字>(seed) / mock_visitor_* / intl_*(生成)
DROP FUNCTION IF EXISTS get_messages_random(NUMERIC, INTEGER, INTEGER);
CREATE OR REPLACE FUNCTION get_messages_random(
  p_seed NUMERIC,
  p_limit INTEGER,
  p_offset INTEGER
)
RETURNS TABLE (
  id UUID,
  visitor_id TEXT,
  content TEXT,
  visitor_name TEXT,
  location TEXT,
  likes INTEGER,
  created_at TIMESTAMPTZ,
  total_count BIGINT
)
LANGUAGE sql
AS $$
  WITH real_messages AS (
    -- 锚定开头 ^ 避免误匹配 mock_visitor_*
    SELECT *
    FROM messages
    WHERE visitor_id ~ '^visitor_[0-9]{13,}_'
  )
  SELECT id, visitor_id, content, visitor_name, location, likes, created_at,
         (SELECT COUNT(*) FROM real_messages)::BIGINT AS total_count
  FROM real_messages
  ORDER BY md5(id::text || p_seed::text)
  LIMIT p_limit
  OFFSET p_offset;
$$;

GRANT EXECUTE ON FUNCTION get_messages_random(NUMERIC, INTEGER, INTEGER) TO anon, authenticated;

-- 2. 真实留言数统计 RPC(仪表盘用)
--    返回真实留言数量(real)与博主留言数量(owner)
DROP FUNCTION IF EXISTS get_real_message_count();
CREATE OR REPLACE FUNCTION get_real_message_count()
RETURNS TABLE (real_count BIGINT, owner_count BIGINT)
LANGUAGE sql
AS $$
  SELECT
    -- 真实留言: visitor_<13位以上时间戳>_ 开头(锚定开头,避免误匹配 mock_visitor_*)
    COUNT(*) FILTER (WHERE visitor_id ~ '^visitor_[0-9]{13,}_')::BIGINT AS real_count,
    -- 博主留言: owner_ 开头
    COUNT(*) FILTER (WHERE visitor_id LIKE 'owner\_%')::BIGINT AS owner_count
  FROM messages;
$$;

GRANT EXECUTE ON FUNCTION get_real_message_count() TO anon, authenticated;
