# 📊 埋点分析系统使用指南

## 🚀 快速开始

### 1. 执行数据库迁移

登录 Supabase 控制台，在 SQL Editor 中执行：

```bash
# 复制 lib/supabase-analytics-schema.sql 内容并执行
```

**访问**: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

### 2. 配置环境变量（可选）

埋点数据会自动存储到你的 Supabase 数据库，无需额外配置。

---

## 📍 自动追踪的事件

系统会自动追踪以下事件：

### 页面浏览
- ✅ 首次加载自动追踪
- ✅ SPA 路由切换自动追踪
- ✅ 记录页面路径、标题、来源

### 用户交互
- ✅ 所有链接点击
- ✅ 所有按钮点击
- ✅ 记录元素选择器和文本

### 设备信息
- ✅ 设备类型（mobile/tablet/desktop）
- ✅ 浏览器类型
- ✅ 操作系统
- ✅ 屏幕分辨率
- ✅ 语言和时区

---

## 📈 后台管理功能

访问：`/admin/dashboard`

### 核心指标卡片
- 总访客数
- 总浏览量
- 总会话数
- 总事件数

### 图表展示

| 图表 | 说明 |
|------|------|
| 📈 近 7 天访问趋势 | 折线图展示每日访问量 |
| 📱 设备分布 | 饼图展示 mobile/desktop/tablet 占比 |
| 🔥 热门页面 TOP 10 | 表格展示最受欢迎页面 |
| 🌐 浏览器分布 | 柱状图展示浏览器使用率 |

---

## 🔍 API 使用

### 上报事件
```javascript
POST /api/analytics
Content-Type: application/json

{
  "events": [
    {
      "event_name": "page_view",
      "page_path": "/blog/123",
      "visitor_id": "v_xxx",
      "session_id": "s_xxx"
    }
  ]
}
```

### 查询统计
```javascript
// 概览数据
GET /api/analytics?type=overview

// 每日趋势（近 7 天）
GET /api/analytics?type=daily&days=7

// 热门页面
GET /api/analytics?type=pages&days=7

// 设备分布
GET /api/analytics?type=devices&days=7

// 浏览器分布
GET /api/analytics?type=browsers&days=7
```

---

## 🛠️ 自定义事件

```javascript
import { trackEvent } from './utils/analytics'

// 追踪下载事件
trackEvent('download', 'conversion', {
  file_name: 'report.pdf',
  file_size: '2MB'
})

// 追踪视频播放
trackEvent('video_play', 'engagement', {
  video_id: '123',
  duration: 120
})

// 追踪购买
trackEvent('purchase', 'conversion', {
  product_id: 'xxx',
  amount: 99.99
})
```

---

## 📊 数据库表结构

| 表名 | 说明 |
|------|------|
| `visitors` | 访客信息表 |
| `page_views` | 页面访问记录 |
| `events` | 事件追踪记录 |
| `sessions` | 会话记录 |

---

## 🔒 隐私保护

- ✅ 不收集个人敏感信息
- ✅ 使用匿名访客 ID
- ✅ 数据存储在自有数据库
- ✅ 符合 GDPR 基本要求

---

## 📝 注意事项

1. **首次部署**: 必须先执行数据库迁移 SQL
2. **数据延迟**: 埋点数据最多 5 秒延迟上报
3. **性能影响**: 异步上报，不影响页面性能
4. **数据清理**: 建议定期清理 90 天前的旧数据

---

_最后更新：2026-03-02_
