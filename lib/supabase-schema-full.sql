-- ============================================
-- Supabase Database Schema for Personal Blog - FULL VERSION
-- 包含所有新功能的完整数据库结构
-- 支持重复执行（幂等性）
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========== 第一步：先创建被引用的表 ==========

-- 1. 创建分类表
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#8b5cf6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建标签表
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== 第二步：再修改 articles 表 ==========

-- 3. 添加 articles 表缺失的列
DO $$ 
BEGIN
  -- 添加列（如果不存在）
  ALTER TABLE articles ADD COLUMN IF NOT EXISTS summary TEXT;
  ALTER TABLE articles ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0;
  ALTER TABLE articles ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
  ALTER TABLE articles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
  ALTER TABLE articles ADD COLUMN IF NOT EXISTS category_id UUID;
END $$;

-- 4. 添加外键约束（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_articles_category' AND table_name = 'articles'
  ) THEN
    ALTER TABLE articles ADD CONSTRAINT fk_articles_category 
      FOREIGN KEY (category_id) REFERENCES categories(id);
  END IF;
END $$;

-- ========== 第三步：创建其他表 ==========

-- 5. 文章标签关联表
CREATE TABLE IF NOT EXISTS article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (article_id, tag_id)
);

-- 6. 评论表
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

-- 7. 点赞表
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, visitor_id)
);

-- 8. 收藏表
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, visitor_id)
);

-- 9. 每日访问统计表
CREATE TABLE IF NOT EXISTS daily_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 用户偏好表
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT NOT NULL UNIQUE,
  dark_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. 热点资讯表
CREATE TABLE IF NOT EXISTS hot_news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. 留言板表
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== 第四步：创建索引 ==========

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

-- ========== 第五步：创建触发器 ==========

-- 更新 updated_at 的函数
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

-- 文章 views 触发器
DROP TRIGGER IF EXISTS trigger_increment_daily_views ON articles;
CREATE TRIGGER trigger_increment_daily_views
  AFTER UPDATE OF views ON articles
  FOR EACH ROW
  WHEN (NEW.views > OLD.views)
  EXECUTE FUNCTION increment_daily_views();

-- 处理点赞的函数
CREATE OR REPLACE FUNCTION handle_article_like()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE articles SET likes = likes + 1 WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE articles SET likes = likes - 1 WHERE id = OLD.article_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 点赞触发器
DROP TRIGGER IF EXISTS trigger_article_like ON likes;
CREATE TRIGGER trigger_article_like
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION handle_article_like();

-- ========== 第六步：插入初始数据 ==========

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
