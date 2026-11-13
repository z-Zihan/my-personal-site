-- ============================================
-- 流量真实性区分改造 (2026-11-13)
-- 目的: 让埋点数据能区分 真实访客 / 爬虫 / 本地开发 / 博主本人
-- 幂等: 可重复执行
-- ============================================

-- 1. page_views 增加流量分类列
--    traffic_class: real(真实) | bot(爬虫) | dev(开发) | owner(博主) | NULL(改造前旧数据)
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS traffic_class TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- 2. events 增加流量分类列
ALTER TABLE events ADD COLUMN IF NOT EXISTS traffic_class TEXT;

-- 3. visitors 补充 user_agent(建表时有但实际未存)
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- 4. 索引: 按分类统计常用
CREATE INDEX IF NOT EXISTS idx_page_views_traffic_class ON page_views(traffic_class);
CREATE INDEX IF NOT EXISTS idx_events_traffic_class ON events(traffic_class);

-- 5. (可选)真实流量每日聚合 RPC —— 管理端未来可用
CREATE OR REPLACE FUNCTION get_daily_real_pageviews(p_start_date TIMESTAMPTZ)
RETURNS TABLE (date TEXT, views BIGINT)
LANGUAGE sql
AS $$
  SELECT to_char(created_at AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD') AS date,
         COUNT(*)::BIGINT AS views
  FROM page_views
  WHERE created_at >= p_start_date
    AND traffic_class = 'real'
  GROUP BY 1
  ORDER BY 1;
$$;
