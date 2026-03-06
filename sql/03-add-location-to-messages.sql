-- ============================================
-- 添加 location 字段到 messages 表
-- ============================================
-- 用途：支持留言板显示用户地理位置
-- 执行方式：在 Supabase Dashboard → SQL Editor 中执行
-- ============================================

-- 添加 location 字段
ALTER TABLE messages ADD COLUMN IF NOT EXISTS location TEXT;

-- 添加索引以优化查询
CREATE INDEX IF NOT EXISTS idx_messages_location ON messages(location);

-- ============================================
-- 迁移完成！
-- ============================================
