-- ============================================
-- MyBlog 数据库初始化脚本 - 完整版
-- ============================================
-- 项目：个人博客系统（含埋点分析）
-- 数据库：Supabase (PostgreSQL)
-- 执行方式：在 Supabase Dashboard → SQL Editor 中执行
-- 最后更新：2026-03-05
-- ============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 第一部分：博客核心表
-- ============================================

-- 1. 分类表
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#8b5cf6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 标签表
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 文章表
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  cover TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'scheduled')),
  views INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 文章标签关联表
CREATE TABLE IF NOT EXISTS article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (article_id, tag_id)
);

-- 5. 评论表
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  visitor_name TEXT,
  visitor_avatar TEXT,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 点赞表
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, visitor_id)
);

-- 7. 收藏表
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, visitor_id)
);

-- 8. 每日访问统计表
CREATE TABLE IF NOT EXISTS daily_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 用户偏好表
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT NOT NULL UNIQUE,
  dark_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 热点资讯表
CREATE TABLE IF NOT EXISTS hot_news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. 留言板表
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 第二部分：埋点分析表（访客追踪）
-- ============================================

-- 12. 访客表
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

-- 13. 会话表
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT NOT NULL,
  session_id TEXT UNIQUE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 1,
  bounce BOOLEAN DEFAULT FALSE,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  region TEXT,
  city TEXT
);

-- 14. 页面访问表
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  entry_path TEXT,
  exit_path TEXT,
  time_on_page INTEGER DEFAULT 0,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. 事件追踪表
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_type TEXT,
  event_data JSONB,
  page_path TEXT,
  element_selector TEXT,
  element_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 第三部分：索引
-- ============================================

-- 博客表索引
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_article ON likes(article_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_article ON bookmarks(article_id);
CREATE INDEX IF NOT EXISTS idx_daily_views_date ON daily_views(date);
CREATE INDEX IF NOT EXISTS idx_user_preferences_visitor ON user_preferences(visitor_id);
CREATE INDEX IF NOT EXISTS idx_hot_news_created_at ON hot_news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_visitor_id ON messages(visitor_id);

-- 埋点分析表索引
CREATE INDEX IF NOT EXISTS idx_visitors_visitor_id ON visitors(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitors_first_seen ON visitors(first_seen_at);
CREATE INDEX IF NOT EXISTS idx_visitors_country ON visitors(country);
CREATE INDEX IF NOT EXISTS idx_sessions_visitor ON sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_events_visitor ON events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_name ON events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);

-- ============================================
-- 第四部分：函数和触发器
-- ============================================

-- 更新 updated_at 时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 文章更新触发器
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 用户偏好更新触发器
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 增加每日访问量的函数
CREATE OR REPLACE FUNCTION increment_daily_views()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO daily_views (date, count)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET count = daily_views.count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 文章浏览量增加触发器
DROP TRIGGER IF EXISTS trigger_increment_daily_views ON articles;
CREATE TRIGGER trigger_increment_daily_views
  AFTER UPDATE OF views ON articles
  FOR EACH ROW
  WHEN (NEW.views > OLD.views)
  EXECUTE FUNCTION increment_daily_views();

-- ============================================
-- 第五部分：初始数据
-- ============================================

-- 初始分类
INSERT INTO categories (name, slug, color) VALUES
  ('技术', 'tech', '#8b5cf6'),
  ('生活', 'life', '#ec4899'),
  ('随笔', 'thoughts', '#06b6d4'),
  ('分享', 'share', '#10b981')
ON CONFLICT (slug) DO NOTHING;

-- 初始标签
INSERT INTO tags (name, slug) VALUES
  ('React', 'react'),
  ('JavaScript', 'javascript'),
  ('前端', 'frontend'),
  ('后端', 'backend'),
  ('数据库', 'database'),
  ('生活感悟', 'life-thoughts'),
  ('学习', 'learning')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 第六部分：行级安全策略 (RLS)
-- ============================================

-- 启用所有表的 RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE hot_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- articles 表策略
CREATE POLICY "Allow public read access for published articles"
ON articles FOR SELECT TO anon USING (status = 'published');

CREATE POLICY "Allow full access for authenticated users"
ON articles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 其他博客表策略
CREATE POLICY "Allow public read access" ON categories FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read access" ON tags FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read access" ON comments FOR SELECT TO anon USING (true);
CREATE POLICY "Allow insert for all" ON comments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public read access" ON likes FOR SELECT TO anon USING (true);
CREATE POLICY "Allow insert for all" ON likes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow delete for all" ON likes FOR DELETE TO anon USING (true);
CREATE POLICY "Allow public read access" ON bookmarks FOR SELECT TO anon USING (true);
CREATE POLICY "Allow insert for all" ON bookmarks FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow delete for all" ON bookmarks FOR DELETE TO anon USING (true);
CREATE POLICY "Allow public read access" ON daily_views FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read access" ON hot_news FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read access" ON messages FOR SELECT TO anon USING (true);
CREATE POLICY "Allow insert for all" ON messages FOR INSERT TO anon WITH CHECK (true);

-- 用户偏好表策略
CREATE POLICY "Allow public read access" ON user_preferences FOR SELECT TO anon USING (true);
CREATE POLICY "Allow upsert for all" ON user_preferences FOR ALL TO anon USING (true) WITH CHECK (true);

-- 埋点分析表策略（允许匿名写入）
CREATE POLICY "Allow public read access" ON visitors FOR SELECT TO anon USING (true);
CREATE POLICY "Allow insert for all" ON visitors FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow update for all" ON visitors FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access" ON sessions FOR SELECT TO anon USING (true);
CREATE POLICY "Allow insert for all" ON sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow update for all" ON sessions FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access" ON page_views FOR SELECT TO anon USING (true);
CREATE POLICY "Allow insert for all" ON page_views FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public read access" ON events FOR SELECT TO anon USING (true);
CREATE POLICY "Allow insert for all" ON events FOR INSERT TO anon WITH CHECK (true);

-- ============================================
-- 数据库初始化完成！
-- ============================================
