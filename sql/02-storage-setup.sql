-- ============================================
-- Storage Bucket 设置脚本
-- ============================================
-- 用途：设置 image bucket 的访问策略
-- 前提：必须先在 Supabase Storage 中手动创建 bucket
-- 执行方式：在 Supabase Dashboard → SQL Editor 中执行
-- ============================================

-- ============================================
-- 重要提示：
-- ============================================
-- 此 SQL 脚本用于配置 Storage Bucket 的访问策略
-- 在执行此脚本之前，请先手动创建 bucket：
--
-- 1. 登录 Supabase Dashboard
-- 2. 进入 Storage 页面
-- 3. 点击 "New bucket"
-- 4. 填写：
--    - Name: image
--    - 勾选 "Public bucket"
--    - File size limit: 5242880 (5MB)
-- 5. 点击 "Create bucket"
--
-- 创建完成后，再执行下面的 SQL 脚本
-- ============================================

-- 允许匿名用户上传文件到 image bucket
CREATE POLICY "Allow public uploads to image"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'image');

-- 允许匿名用户读取 image bucket 中的文件
CREATE POLICY "Allow public reads from image"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'image');

-- 允许匿名用户删除 image bucket 中的文件（可选）
CREATE POLICY "Allow public deletes from image"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'image');

-- 允许匿名用户更新 image bucket 中的文件（可选）
CREATE POLICY "Allow public updates to image"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'image');

-- 授予权限
GRANT ALL ON storage.objects TO anon;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO service_role;

-- ============================================
-- Storage 设置完成！
-- ============================================
