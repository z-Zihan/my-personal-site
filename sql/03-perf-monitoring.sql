-- ============================================
-- 性能监控 + 错误监控表
-- ============================================
-- 项目：个人博客（前端性能/错误埋点系统）
-- 数据库：Supabase (PostgreSQL)
-- 执行方式：在 Supabase Dashboard → SQL Editor 中执行
-- 最后更新：2026-11-05
--
-- 设计说明：
-- 性能指标与前端错误统一存入 perf_metrics 单表，通过 type 字段区分：
--   web_vital      - Web Vitals 快照（LCP/FCP/CLS/TTFB/INP + 导航各阶段耗时）
--   route_timing   - SPA 路由切换耗时（含首屏）
--   resource_summary - 资源加载耗时 Top10（每次页面加载一条汇总）
--   slow_resource  - 慢资源（duration > 3s）
--   api_timing     - 接口耗时采样（快速正常请求按 10% 采样）
--   api_slow       - 慢接口（duration > 1s，全量上报）
--   api_error      - 接口错误（401 静音）
--   js_error       - JS 运行时错误（window.onerror）
--   promise_error  - Promise 未处理拒绝
--   resource_error - 资源加载失败（img/script/link）
-- 具体数据放在 data JSONB 中。错误不单独建表，避免表爆炸；
-- 后台 PerfDashboard 通过 type 过滤做错误列表/聚合展示。
-- ============================================

-- 性能/错误监控表
CREATE TABLE IF NOT EXISTS perf_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  type TEXT NOT NULL,
  page_path TEXT,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引：按类型 + 时间查询（后台聚合主路径）
CREATE INDEX IF NOT EXISTS idx_perf_metrics_type_created ON perf_metrics(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_perf_metrics_created ON perf_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_perf_metrics_visitor ON perf_metrics(visitor_id);
CREATE INDEX IF NOT EXISTS idx_perf_metrics_page_path ON perf_metrics(page_path);

-- 启用 RLS（与 01-database-init.sql 中埋点表策略保持一致）
ALTER TABLE perf_metrics ENABLE ROW LEVEL SECURITY;

-- 允许公开读（后台聚合查询走 service key 不受影响，此处对齐现有风格）
CREATE POLICY "Allow public read access" ON perf_metrics FOR SELECT TO anon, authenticated USING (true);

-- 允许匿名写入（前端埋点上报）
CREATE POLICY "Allow insert for all" ON perf_metrics FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 授权（对齐 01-database-init.sql 末尾的 GRANT 风格）
GRANT ALL ON perf_metrics TO anon;
GRANT ALL ON perf_metrics TO authenticated;
GRANT ALL ON perf_metrics TO service_role;
