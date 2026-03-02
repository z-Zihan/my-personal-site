-- ============================================
-- 访客追踪和埋点分析数据库结构
-- ============================================

-- 1. 访客表 (visitors)
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  language TEXT,
  screen_resolution TEXT,
  timezone TEXT,
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitors_visitor_id ON visitors(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitors_first_seen ON visitors(first_seen_at);
CREATE INDEX IF NOT EXISTS idx_visitors_country ON visitors(country);

-- 2. 页面访问表 (page_views)
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  entry_path TEXT,
  exit_path TEXT,
  time_on_page INTEGER DEFAULT 0, -- 秒
  device_type TEXT, -- mobile, tablet, desktop
  browser TEXT,
  os TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(page_path);

-- 3. 事件追踪表 (events)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  event_name TEXT NOT NULL, -- click, scroll, form_submit, etc.
  event_type TEXT, -- interaction, navigation, conversion
  event_data JSONB, -- 额外数据
  page_path TEXT,
  element_selector TEXT,
  element_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_visitor ON events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_name ON events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);

-- 4. 会话表 (sessions)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT NOT NULL,
  session_id TEXT UNIQUE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER DEFAULT 0, -- 秒
  page_views INTEGER DEFAULT 1,
  bounce BOOLEAN DEFAULT FALSE,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  region TEXT,
  city TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_visitor ON sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start ON sessions(start_time);

-- ============================================
-- 统计视图（修复歧义列引用）
-- ============================================

-- 每日访客统计
CREATE OR REPLACE VIEW daily_visitors AS
SELECT 
  DATE(pv.created_at) as date,
  COUNT(DISTINCT pv.visitor_id) as unique_visitors,
  COUNT(*) as total_visits,
  COUNT(DISTINCT pv.session_id) as sessions
FROM page_views pv
GROUP BY DATE(pv.created_at)
ORDER BY date DESC;

-- 热门页面统计
CREATE OR REPLACE VIEW popular_pages AS
SELECT 
  pv.page_path,
  pv.page_title,
  COUNT(*) as views,
  COUNT(DISTINCT pv.visitor_id) as unique_visitors,
  AVG(pv.time_on_page) as avg_time_on_page
FROM page_views pv
GROUP BY pv.page_path, pv.page_title
ORDER BY views DESC;

-- 地域统计
CREATE OR REPLACE VIEW visitor_countries AS
SELECT 
  v.country,
  COUNT(DISTINCT pv.visitor_id) as visitors,
  COUNT(*) as page_views
FROM page_views pv
LEFT JOIN visitors v ON pv.visitor_id = v.visitor_id
GROUP BY v.country
ORDER BY visitors DESC;

-- 设备统计
CREATE OR REPLACE VIEW device_stats AS
SELECT 
  pv.device_type,
  COUNT(DISTINCT pv.visitor_id) as visitors,
  COUNT(*) as page_views
FROM page_views pv
GROUP BY pv.device_type;

-- 浏览器统计
CREATE OR REPLACE VIEW browser_stats AS
SELECT 
  pv.browser,
  COUNT(DISTINCT pv.visitor_id) as visitors
FROM page_views pv
GROUP BY pv.browser
ORDER BY visitors DESC
LIMIT 10;

-- ============================================
-- 初始数据
-- ============================================
INSERT INTO visitors (visitor_id, country, created_at) 
SELECT 'init_cn', 'China', NOW()
WHERE NOT EXISTS (SELECT 1 FROM visitors WHERE visitor_id = 'init_cn');
