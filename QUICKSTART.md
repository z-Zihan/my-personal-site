# 🚀 MyBlog 新手入门指南

> 快速部署指南 - 从 0 到上线只需 10 分钟
> 版本：2.1.0 | 更新时间：2026-03-05

---

## 📋 目录

1. [项目简介](#-项目简介)
2. [快速部署（推荐）](#-快速部署推荐)
3. [本地开发](#-本地开发)
4. [数据库设置](#-数据库设置)
5. [Storage 设置](#-storage-设置)
6. [常见问题](#-常见问题)

---

## 📖 项目简介

这是一个现代化的个人博客系统，基于 **React 19** + **Vite 7** + **Supabase** 构建。

### 核心功能

| 模块 | 功能 |
|------|------|
| 📰 前台 | 文章展示、分类筛选、搜索、点赞、评论、留言板 |
| 🛠️ 后台 | 文章管理、数据统计、访客分析、留言管理 |
| 📊 分析 | 访客追踪、页面浏览、事件埋点、地域分布 |
| 📲 PWA | 离线缓存、可安装到桌面 |

### 技术栈

- **前端**: React 19, Vite 7, Ant Design 6, Tailwind CSS 4
- **后端**: Vercel Edge Functions, Supabase (PostgreSQL)
- **服务**: TinyMCE (编辑器), Vercel Analytics (统计)

---

## 🚀 快速部署（推荐）

### 步骤 1: 准备工作

1. **GitHub 账号** - 用于托管代码
2. **Vercel 账号** - 用于部署（可用 GitHub 登录）
3. **Supabase 账号** - 用于数据库和存储

### 步骤 2: 创建 Supabase 项目

1. 登录 [Supabase](https://supabase.com/dashboard)
2. 点击 **New Project**
3. 填写项目信息：
   - Name: `myblog`（或任意名称）
   - Database Password: 设置一个强密码（请保存）
   - Region: 选择离你最近的区域
4. 等待项目创建完成（约 2 分钟）

### 步骤 3: 获取 Supabase 配置

1. 进入项目 Dashboard
2. 点击左侧 **Settings** → **API**
3. 复制以下两个值：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyxxxxx`

### 步骤 4: 初始化数据库

1. 点击左侧 **SQL Editor** → **New query**
2. 复制本项目的 [`db-init.sql`](db-init.sql) 文件全部内容
3. 粘贴到 SQL Editor
4. 点击 **Run** 执行
5. 看到 "Success" 表示数据库初始化完成

### 步骤 5: 配置 Storage

1. 点击左侧 **Storage**
2. 点击 **New bucket**
3. 填写：
   - **Name**: `image`
   - 勾选 **Public bucket**
   - **File size limit**: `5242880` (5MB)
4. 点击 **Create bucket**
5. 点击刚创建的 `image` bucket
6. 点击 **Policies** 标签 → **New policy**
7. 复制 [`db-storage.sql`](db-storage.sql) 中的 SQL 语句并执行

### 步骤 6: Fork 并部署到 Vercel

1. **Fork 项目** 到你的 GitHub
2. 登录 [Vercel](https://vercel.com)
3. 点击 **Add New Project**
4. 选择 **Import Git Repository**，选择你的项目
5. 配置环境变量：
   ```
   VITE_SUPABASE_URL=https://你的项目 supabase.co
   VITE_SUPABASE_ANON_KEY=你的 anon key
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin
   ```
6. 点击 **Deploy**
7. 等待部署完成（约 3 分钟）

### 步骤 7: 访问博客

- **前台**: `https://your-project.vercel.app/`
- **后台**: `https://your-project.vercel.app/admin/login`
- **默认账号**: `admin` / `admin`

---

## 💻 本地开发

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/你的用户名/my-personal-site.git
cd my-personal-site

# 2. 安装依赖
npm install

# 3. 复制环境变量文件
cp .env.example .env.local

# 4. 编辑 .env.local，填入你的 Supabase 配置
```

### .env.local 配置示例

```env
# Supabase
VITE_SUPABASE_URL=https://lseantwsebvsmavqcjat.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxx

# 管理员配置
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin

```

### 启动开发服务器

```bash
# 启动 Vite 开发服务器
npm run dev

# 访问
# 前台：http://localhost:5173/
# 后台：http://localhost:5173/admin?dev=1
```

### 常用命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
npm run lint     # 代码检查
```

---

## 🗄️ 数据库设置

### 执行 SQL 脚本

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧 **SQL Editor**
4. 点击 **New query**
5. 复制 [`db-init.sql`](db-init.sql) 内容并执行

### 脚本说明

`db-init.sql` 会创建以下内容：

| 表名 | 说明 |
|------|------|
| `categories` | 文章分类表 |
| `tags` | 文章标签表 |
| `articles` | 文章表 |
| `article_tags` | 文章标签关联表 |
| `comments` | 评论表 |
| `likes` | 点赞表 |
| `bookmarks` | 收藏表 |
| `daily_views` | 每日访问统计表 |
| `user_preferences` | 用户偏好表 |
| `hot_news` | 热点资讯表 |
| `messages` | 留言板表 |

同时会自动插入：
- 4 个默认分类（技术、生活、随笔、分享）
- 7 个默认标签（React、JavaScript、前端、后端、数据库、生活感悟、学习）

---

## 📦 Storage 设置

### 手动创建 Bucket

1. 登录 Supabase Dashboard
2. 点击左侧 **Storage**
3. 点击 **New bucket**
4. 填写：
   - **Name**: `image`
   - 勾选 **Public bucket**
   - **File size limit**: `5242880` (5MB)
5. 点击 **Create bucket**

### 配置访问策略

1. 点击 `image` bucket
2. 点击 **Policies** 标签
3. 点击 **New policy**
4. 复制 [`db-storage.sql`](db-storage.sql) 中的 SQL 并执行

或者使用图形界面添加以下策略：

| 操作 | 策略 |
|------|------|
| INSERT | 允许匿名用户上传 |
| SELECT | 允许匿名用户读取 |
| DELETE | 允许匿名用户删除（可选） |

---

## ❓ 常见问题

### 1. 图片上传失败 "Bucket not found"

**原因**: Storage bucket 未创建

**解决**: 按照 [Storage 设置](#-storage-设置) 创建 `image` bucket

### 2. 删除文章报错 "column likes does not exist"

**原因**: 数据库表结构不完整

**解决**: 重新执行 `db-init.sql` 脚本

### 3. 更新文章报 "Unauthorized"

**原因**: 前端调用 API 时未携带 token

**解决**: 确保已登录后台，且使用 `api` 模块调用接口（已自动添加 token）

### 4. 本地开发无法连接数据库

**检查**:
- `.env.local` 文件是否存在
- `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 是否正确
- Supabase 项目是否正常运行

### 5. Vercel 部署失败

**检查**:
- 环境变量是否正确配置
- `package.json` 中的 build 命令是否正确
- 查看 Vercel 部署日志获取详细错误信息

### 6. 如何修改默认密码？

编辑 `.env.local`（本地）或 Vercel 环境变量（生产）：

```env
ADMIN_PASSWORD=你的新密码
```

## 📚 更多文档

| 文档 | 说明 |
|------|------|
| [STORAGE_SETUP.md](STORAGE_SETUP.md) | Storage 详细设置指南 |
| [LOCAL-DEV.md](LOCAL-DEV.md) | 本地开发指南 |
| [FEATURES.md](FEATURES.md) | 功能清单 |
| [CHANGELOG.md](CHANGELOG.md) | 更新日志 |

---

## 🆘 获取帮助

- 查看 [GitHub Issues](https://github.com/z-Zihan/my-personal-site/issues)
- 提交 Issue 描述你的问题
- 查看项目博客：https://zzihanaini.vercel.app/

---

**祝你部署成功！🎉**

_Made with ❤️ by Zihan_
