-- ============================================
-- 修复点赞功能 - 确保 RLS 策略正确
-- ============================================
-- 用途：修复点赞功能失败的问题
-- 执行方式：在 Supabase Dashboard → SQL Editor 中执行
-- ============================================

-- 1. 确保 likes 表的 RLS 策略正确
DROP POLICY IF EXISTS "Allow insert for all" ON likes;
DROP POLICY IF EXISTS "Allow delete for all" ON likes;
DROP POLICY IF EXISTS "Allow public read access" ON likes;

-- 重新创建策略（使用更明确的定义）
CREATE POLICY "Allow public read access" ON likes FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert access" ON likes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public delete access" ON likes FOR DELETE TO anon USING (true);

-- 2. 确保 articles 表允许匿名用户读取（包括已发布的文章）
DROP POLICY IF EXISTS "Allow public read access for published articles" ON articles;
CREATE POLICY "Allow public read access for published articles"
ON articles FOR SELECT TO anon USING (true);

-- 3. 检查 likes 表结构是否正确
-- 如果 article_id 字段类型有问题，执行以下命令：
-- ALTER TABLE likes ALTER COLUMN article_id TYPE UUID USING article_id::UUID;

-- ============================================
-- 修复完成！请重新部署 Vercel 项目
-- ============================================
