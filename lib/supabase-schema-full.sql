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

-- 3. 添加 articles 表缺失的列（category_id 最后添加）
ALTER TABLE articles ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- 4. 最后添加外键约束
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category_id UUID;
ALTER TABLE articles ADD CONSTRAINT fk_articles_category
FOREIGN KEY (category_id) REFERENCES categories(id);

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

-- ========== 第四步：插入初始数据 ==========

INSERT INTO categories (name, slug, color) VALUES
('技术', 'tech', '#8b5cf6'),
('生活', 'life', '#ec4899'),
('随笔', 'thoughts', '#06b6d4'),
('分享', 'share', '#10b981')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tags (name, slug) VALUES
('React', 'react'),
('JavaScript', 'javascript'),
('前端', 'frontend'),
('后端', 'backend'),
('数据库', 'database')
ON CONFLICT (slug) DO NOTHING;