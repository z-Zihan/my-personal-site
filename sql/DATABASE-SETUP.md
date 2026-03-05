# 🗄️ MyBlog 数据库设置指南

> 本文档详细说明如何设置 MyBlog 项目的数据库
> 适合不熟悉后端的开发者

---

## 📋 前置准备

在开始之前，请确保你已经：

1. ✅ 注册了 [Supabase](https://supabase.com) 账号
2. ✅ 创建了一个新的 Supabase 项目
3. ✅ 获取了项目 URL 和 anon key（在 Settings → API 页面）

---

## 📁 SQL 文件说明

项目根目录下有一个 `sql` 文件夹，包含以下文件：

| 文件 | 说明 | 必须执行 |
|------|------|----------|
| `01-database-init.sql` | 数据库初始化脚本（包含所有表结构） | ✅ 是 |
| `02-storage-setup.sql` | Storage bucket 访问策略 | ✅ 是 |

### 旧的 SQL 文件（已废弃）

`lib/` 文件夹下的旧 SQL 文件已被整合，不再使用：
- `lib/supabase-schema.sql` - 已废弃 ❌
- `lib/supabase-schema-full.sql` - 已废弃 ❌
- `lib/supabase-analytics-schema.sql` - 已整合到 `01-database-init.sql` ✅

---

## 🚀 数据库设置步骤

### 第一步：执行数据库初始化脚本

1. **打开 Supabase Dashboard**
   - 访问 https://supabase.com/dashboard
   - 选择你的项目

2. **进入 SQL Editor**
   - 点击左侧菜单的 **SQL Editor**
   - 点击 **New query** 按钮

3. **复制并执行 SQL**
   - 打开项目根目录的 `sql/01-database-init.sql` 文件
   - 复制全部内容
   - 粘贴到 SQL Editor
   - 点击 **Run** 按钮

4. **等待执行完成**
   - 看到 "Success. No rows returned" 表示执行成功
   - 如果看到错误，请仔细阅读错误信息

**这个脚本会创建：**
- 11 个博客核心表（articles, categories, tags, comments 等）
- 4 个埋点分析表（visitors, sessions, page_views, events）
- 所有必要的索引
- 触发器和函数
- 初始数据（4 个分类、7 个标签）
- 行级安全策略（RLS）

---

### 第二步：创建 Storage Bucket

> Storage 用于存储用户上传的图片（如文章封面图）

1. **进入 Storage 页面**
   - 点击左侧菜单的 **Storage**
   - 点击 **New bucket** 按钮

2. **创建 bucket**
   - **Name**: `image`
   - 勾选 **Public bucket**
   - **File size limit**: `5242880` (5MB)
   - 点击 **Create bucket**

3. **配置访问策略**
   - 点击刚创建的 `image` bucket
   - 点击 **Policies** 标签
   - 点击 **New policy**

4. **执行策略 SQL**
   - 打开项目根目录的 `sql/02-storage-setup.sql` 文件
   - 复制全部内容
   - 粘贴到 SQL Editor（新建一个查询）
   - 点击 **Run** 按钮

**或者手动添加策略（图形界面）：**

如果你不想用 SQL，也可以手动添加以下 4 个策略：

| 操作 | 策略名称 | 允许 |
|------|----------|------|
| INSERT | Allow public uploads | 匿名用户上传 |
| SELECT | Allow public reads | 匿名用户读取 |
| DELETE | Allow public deletes | 匿名用户删除（可选） |
| UPDATE | Allow public updates | 匿名用户更新（可选） |

---

### 第三步：验证数据库设置

执行完上述两步后，你可以验证数据库是否正确设置：

#### 方法一：使用测试脚本（推荐）

```bash
# 1. 确保已配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入你的 Supabase 配置

# 2. 运行测试脚本
node test-supabase.js
```

如果看到类似以下输出，表示设置成功：

```
🔍 测试 Supabase 连接...

📌 测试博客核心表...
   ✅ articles: OK
   ✅ categories: OK
   ✅ tags: OK
   ✅ comments: OK
   ✅ likes: OK
   ✅ messages: OK

📌 测试埋点分析表...
   ✅ visitors: OK
   ✅ sessions: OK
   ✅ page_views: OK
   ✅ events: OK

📌 测试 Storage...
   ✅ image bucket: 存在

📌 测试数据...
   📝 文章总数：0
   🏷️  分类总数：4
   💬 留言总数：0

==================================================
✅ 所有测试通过！数据库配置正确。
==================================================
```

#### 方法二：手动检查

1. **检查表结构**
   - 在 Supabase Dashboard 点击 **Table Editor**
   - 应该能看到所有表（articles, categories, tags 等）

2. **检查初始数据**
   - 点击 `categories` 表
   - 应该能看到 4 个分类（技术、生活、随笔、分享）

3. **检查 Storage**
   - 点击 **Storage**
   - 应该能看到 `image` bucket

---

## ❓ 常见问题

### 1. SQL 执行失败，提示 "relation already exists"

**原因**: 表已经存在

**解决**: 这是正常的。脚本使用了 `IF NOT EXISTS`，可以安全忽略。或者删除已存在的表重新执行。

### 2. 测试脚本提示 "Bucket not found"

**原因**: Storage bucket 未创建

**解决**: 按照 [第二步](#第二步创建 Storage Bucket) 创建 `image` bucket

### 3. 看不到某些表

**原因**: 可能执行脚本时出错了

**解决**:
1. 检查 SQL Editor 的执行历史
2. 重新执行 `01-database-init.sql`
3. 查看具体的错误信息

### 4. 如何删除所有表重新来过？

如果你需要重置数据库，可以执行以下 SQL：

```sql
-- 删除所有表（谨慎操作！）
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS page_views CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS visitors CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS article_tags CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS hot_news CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS daily_views CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
```

然后再重新执行 `01-database-init.sql`

---

## 📊 数据库表结构说明

### 博客核心表

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `categories` | 文章分类 | id, name, slug, color |
| `tags` | 文章标签 | id, name, slug |
| `articles` | 文章 | id, title, content, summary, cover, status, views |
| `article_tags` | 文章标签关联 | article_id, tag_id |
| `comments` | 评论 | id, article_id, visitor_id, content, parent_id |
| `likes` | 点赞 | id, article_id, visitor_id |
| `bookmarks` | 收藏 | id, article_id, visitor_id |
| `messages` | 留言 | id, visitor_id, content |
| `hot_news` | 热点资讯 | id, title, link, source |
| `daily_views` | 每日访问统计 | id, date, count |
| `user_preferences` | 用户偏好 | id, visitor_id, dark_mode |

### 埋点分析表

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `visitors` | 访客信息 | id, visitor_id, country, city, device_type |
| `sessions` | 会话 | id, visitor_id, session_id, duration, page_views |
| `page_views` | 页面访问 | id, visitor_id, session_id, page_path, time_on_page |
| `events` | 事件追踪 | id, visitor_id, session_id, event_name, event_data |

---

## 🔗 相关文档

- [QUICKSTART.md](QUICKSTART.md) - 新手入门指南
- [README.md](README.md) - 项目总览
- [test-supabase.js](test-supabase.js) - 数据库连接测试脚本

---

## 🆘 获取帮助

如果遇到问题：

1. 查看本文档的 [常见问题](#-常见问题) 部分
2. 运行 `node test-supabase.js` 查看详细错误
3. 查看 Supabase Dashboard 的错误日志
4. 提交 Issue: https://github.com/z-Zihan/my-personal-site/issues

---

**祝你设置成功！🎉**

_Last updated: 2026-03-05_
