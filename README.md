# 📝 zZihan's Blog — Personal Blog System

> **Version**: 2.2.0 · **Status**: Production Ready ✅
> **Live**: [zzihanaini.vercel.app](https://zzihanaini.vercel.app) · **Language**: [中文文档](#中文文档)

[![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)](https://github.com/z-Zihan/my-personal-site)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Deployed with Vercel](https://img.shields.io/badge/deployed%20with-Vercel-black.svg)](https://vercel.com)
[![Powered by Supabase](https://img.shields.io/badge/powered%20by-Supabase-3ECF8E.svg)](https://supabase.com)
![React 19](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)

A full-stack personal blog system I built and run in production: **React 19 + Vite 7 + TypeScript strict** on the front, **Vercel Edge Functions + Supabase (Postgres/Storage/RLS)** behind it — all on free tiers. Ships with an admin console, full-text search, i18n (中/EN), PWA support, and a front-end monitoring stack.

**Highlights**

- ✍️ **Blog core** — articles with categories/search/reading-time, comments, likes, message board with world-map visitor visualization
- 🖥️ **Admin console** — rich-text editor, draft/publish flow, comment & message moderation, category manager, visitor analytics, perf dashboard
- 📡 **Hot tech news** — aggregated live from GitHub Trending / Hacker News / V2EX / dev.to / Ruanyf Weekly / freeCodeCamp (per-source fault isolation, 30-min cache)
- 🌐 **i18n** — full 中/EN switching including article pages, search, and admin flows
- 📲 **PWA** — installable, slim precache (~1MB) with StaleWhileRevalidate for lazy chunks
- 📊 **Built-in monitoring** — page perf metrics + error tracking, visualized in an admin dashboard

> 🪴 This is also where I dogfood my own writing — read about the architecture in [从零部署一个人的博客：Vercel + Supabase 免费套餐的极限](https://zzihanaini.vercel.app/blog) or [Why I Built My Own Blog Instead of Using Medium](https://zzihanaini.vercel.app/blog).

## 🚀 Quick Start

**New here?** Read [QUICKSTART.md](QUICKSTART.md) — 10-minute deployment guide.

**Live demo**
- Front: <https://zzihanaini.vercel.app/>
- Admin: <https://zzihanaini.vercel.app/admin/login> (default `admin` / `admin` — change it!)

**One-click deploy**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/z-Zihan/my-personal-site)

```bash
npm install
npm run dev      # local dev
npm run build    # production build
npm run db:test  # verify Supabase connection
```

## 🗄️ Database Setup

1. Create a [Supabase](https://supabase.com) project
2. Run [`sql/01-database-init.sql`](sql/01-database-init.sql) in SQL Editor
3. Create a public Storage bucket named `image`
4. Run [`sql/02-storage-setup.sql`](sql/02-storage-setup.sql) for access policies

Full guide: [sql/DATABASE-SETUP.md](sql/DATABASE-SETUP.md) · Local dev notes: [LOCAL-DEV.md](LOCAL-DEV.md) · Feature list: [FEATURES.md](FEATURES.md)

## 🧱 Tech Stack

| Layer | Tech |
|------|------|
| Frontend | React 19 · Vite 7 · TypeScript (strict) · Tailwind CSS 4 · Ant Design 6 |
| State / Routing | Zustand · React Router 7 |
| Backend | Vercel Edge Functions · Supabase (Postgres + Storage + RLS) |
| Content | wangEditor · react-markdown + rehype-highlight |
| Animation | Framer Motion · GSAP |

## 📁 Project Structure

```
my-personal-site/
├── src/                    # Frontend source
│   ├── pages/              # Route pages (Home / Blog / HotNews / About / Admin...)
│   ├── components/         # Shared & effect components
│   ├── api/                # Typed API client (axios)
│   ├── utils/              # i18n, analytics, sanitize, helpers
│   ├── store/              # Zustand stores
│   └── router/             # Lazy-loaded routes
├── api/                    # Vercel Edge Functions (backend API)
├── sql/                    # DB init / storage policies / setup guide ⭐
├── public/                 # Static assets (icons, og-image)
└── test-supabase.js        # DB connection self-test
```

## 🤝 Contributing

Issues and PRs are welcome — fork, branch, PR.

## 📄 License

MIT License © 2026 [zZihan](https://github.com/z-Zihan)

## 🔗 Links

- **Blog**: https://zzihanaini.vercel.app/
- **GitHub**: [@z-Zihan](https://github.com/z-Zihan)
- **X (Twitter)**: [@zZihan01](https://x.com/zZihan01)

---

_Made with ❤️ by Zihan_

---

<a id="中文文档"></a>
# 中文文档

> **Version**: 2.2.0 · **状态**: 生产环境运行中 ✅

我构建并在生产环境长期运行的全栈个人博客系统：前端 **React 19 + Vite 7 + TypeScript strict**，后端 **Vercel Edge Functions + Supabase（Postgres / Storage / RLS）**，全部跑在免费套餐上。自带管理后台、全文搜索、中英双语、PWA 支持和一套前端监控体系。

**核心功能**

- ✍️ **博客核心** — 文章分类/搜索/阅读时长、评论、点赞、带世界地图访客可视化的留言板
- 🖥️ **管理后台** — 富文本编辑器、草稿发布流、评论留言管理、分类管理、访客分析、性能看板
- 📡 **热点资讯** — 实时聚合 GitHub Trending / Hacker News / V2EX / dev.to / 阮一峰周刊 / freeCodeCamp（单源故障隔离，30 分钟缓存）
- 🌐 **国际化** — 中/英全站切换，覆盖文章、搜索与后台流程
- 📲 **PWA** — 可安装，精简预缓存（约 1MB），懒加载 chunk 走 StaleWhileRevalidate
- 📊 **内置监控** — 页面性能指标 + 错误追踪，后台可视化看板

> 🪴 这个项目也是我写作的试验田——架构与踩坑实录见 [从零部署一个人的博客：Vercel + Supabase 免费套餐的极限](https://zzihanaini.vercel.app/blog)。

## 🚀 快速开始

新手请先读 [QUICKSTART.md](QUICKSTART.md)（10 分钟部署指南）。

- **前台**: https://zzihanaini.vercel.app/
- **后台**: https://zzihanaini.vercel.app/admin/login （默认 `admin` / `admin`，部署后请修改！）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/z-Zihan/my-personal-site)

```bash
npm install       # 安装依赖
npm run dev       # 本地开发
npm run build     # 生产构建
npm run db:test   # 校验 Supabase 连接
```

## 🗄️ 数据库设置

1. 创建 [Supabase](https://supabase.com) 项目
2. SQL Editor 执行 [`sql/01-database-init.sql`](sql/01-database-init.sql)
3. 创建公开 Storage Bucket：`image`
4. 执行 [`sql/02-storage-setup.sql`](sql/02-storage-setup.sql) 设置访问策略

详细步骤：[sql/DATABASE-SETUP.md](sql/DATABASE-SETUP.md) · 本地开发：[LOCAL-DEV.md](LOCAL-DEV.md) · 功能清单：[FEATURES.md](FEATURES.md)

## 🧱 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 · Vite 7 · TypeScript (strict) · Tailwind CSS 4 · Ant Design 6 |
| 状态/路由 | Zustand · React Router 7 |
| 后端 | Vercel Edge Functions · Supabase (Postgres + Storage + RLS) |
| 内容 | wangEditor · react-markdown + rehype-highlight |
| 动画 | Framer Motion · GSAP |

## 📁 项目结构

```
my-personal-site/
├── src/                    # 前端源代码
│   ├── pages/              # 页面组件（首页/文章/热点/关于/后台...）
│   ├── components/         # 通用与特效组件
│   ├── api/                # 类型化 API 客户端（axios）
│   ├── utils/              # i18n、埋点、sanitize、工具函数
│   ├── store/              # Zustand 状态
│   └── router/             # 懒加载路由
├── api/                    # Vercel Edge Functions（后端 API）
├── sql/                    # 建库/存储策略/设置指南 ⭐
├── public/                 # 静态资源（图标、og-image）
└── test-supabase.js        # 数据库连接自检脚本
```

## 🤝 贡献

欢迎 Issue 和 PR——fork、建分支、提 PR。

## 📄 许可证

MIT License © 2026 [zZihan](https://github.com/z-Zihan)

## 🔗 联系

- **博客**: https://zzihanaini.vercel.app/
- **GitHub**: [@z-Zihan](https://github.com/z-Zihan)
- **X (Twitter)**: [@zZihan01](https://x.com/zZihan01)

---

_Made with ❤️ by Zihan_
