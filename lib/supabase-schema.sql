-- ============================================
-- Supabase Database Schema for Personal Blog
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Articles Table (文章表)
-- ============================================
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  cover TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);

-- ============================================
-- 2. Hot News Table (热点资讯表)
-- ============================================
CREATE TABLE IF NOT EXISTS hot_news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hot_news_created_at ON hot_news(created_at DESC);

-- ============================================
-- 3. Messages Table (留言板表)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_visitor_id ON messages(visitor_id);

-- ============================================
-- 4. Daily Views Table (每日访问量统计表)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_views_date ON daily_views(date);

-- ============================================
-- 5. Admin Login Sessions (管理员会话表)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- ============================================
-- Function: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for articles table
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Function: Auto-increment daily views
-- ============================================
CREATE OR REPLACE FUNCTION increment_daily_views()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO daily_views (date, count)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET count = daily_views.count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================
-- INSERT INTO articles (title, summary, content, cover, status, views) VALUES
-- ('欢迎来到我的博客', '这是我的第一篇文章', '欢迎来到我的个人博客网站！这里会分享技术文章、热点资讯等内容。', 'https://picsum.photos/800/400', 'published', 100),
-- ('React 18 新特性解析', '深入讲解 React 18 的并发特性', 'React 18 带来了许多令人兴奋的新特性，包括并发渲染、自动批处理、过渡更新等...', 'https://picsum.photos/800/401', 'published', 250),
-- ('Supabase 入门指南', '快速上手 Supabase 数据库', 'Supabase 是一个开源的 Firebase 替代品，提供了完整的后端即服务...', 'https://picsum.photos/800/402', 'published', 180);

-- ============================================
-- Row Level Security (RLS) - Optional
-- ============================================
-- 如果启用 RLS，需要添加相应的策略
-- ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE hot_news ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE daily_views ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
