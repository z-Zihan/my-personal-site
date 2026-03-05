# 📝 zZihan'sBlog - 张子涵的个人博客系统

> **Version**: 2.1.0 Complete Edition
> **Status**: Production Ready ✅

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/z-Zihan/my-personal-site)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Deployed with Vercel](https://img.shields.io/badge/deployed%20with-Vercel-black.svg)](https://vercel.com)
[![Powered by Supabase](https://img.shields.io/badge/powered%20by-Supabase-3ECF8E.svg)](https://supabase.com)

---

## 🚀 快速开始

**🆕 新手请先阅读**: [QUICKSTART.md](QUICKSTART.md) - 10 分钟快速部署指南

### 在线演示

- **前台**: https://zzihanaini.vercel.app/
- **后台**: https://zzihanaini.vercel.app/admin/login
- 默认账号：`admin` / `admin`

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/z-Zihan/my-personal-site)

---

## 📖 文档导航

| 文档 | 说明 |
|------|------|
| [📘 新手入门](QUICKSTART.md) | **必读** - 从 0 到上线部署指南 |
| [🗄️ 数据库设置](sql/DATABASE-SETUP.md) | 详细的数据库设置指南 |
| [数据库初始化](sql/01-database-init.sql) | 执行此 SQL 初始化数据库 |
| [Storage 设置](sql/02-storage-setup.sql) | 配置图片上传 bucket |
| [本地开发](LOCAL-DEV.md) | 本地开发环境配置 |
| [功能清单](FEATURES.md) | 完整功能列表 |

---

## 🎯 功能特性

### 前台
- 📰 文章展示、分类筛选、全文搜索
- 👍 点赞收藏、评论系统
- 📝 留言板、热点资讯
- 📲 PWA 支持（可安装）
- 🌓 暗黑/浅色主题切换

### 后台
- 🛠️ 文章管理（富文本编辑器）
- 📊 数据统计、访客分析
- 🌍 世界地图可视化
- 💬 留言管理

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 · Vite 7 · Ant Design 6 · Tailwind CSS 4 |
| 状态 | Zustand · React Router 7 |
| 后端 | Vercel Edge Functions · Supabase |
| 动画 | Framer Motion |
| 编辑器 | TinyMCE |

---

## 📦 快速命令

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 测试数据库连接
npm run db:test
```

---

## 🗄️ 数据库设置

1. 创建 [Supabase](https://supabase.com) 项目
2. 在 SQL Editor 执行 [`sql/01-database-init.sql`](sql/01-database-init.sql)
3. 创建 Storage Bucket: `image`（Public）
4. 执行 [`sql/02-storage-setup.sql`](sql/02-storage-setup.sql) 设置访问策略

详细步骤见：[sql/DATABASE-SETUP.md](sql/DATABASE-SETUP.md)

---

## 📁 项目结构

```
myBlog/
├── src/                    # 前端源代码
│   ├── pages/              # 页面组件
│   ├── components/         # 通用组件
│   ├── utils/              # 工具函数（API 封装、埋点 SDK 等）
│   ├── store/              # 状态管理
│   └── router/             # 路由配置
├── api/                    # Vercel Edge Functions（后端 API）
├── sql/                    # SQL 脚本 ⭐
│   ├── 01-database-init.sql    # 数据库初始化
│   ├── 02-storage-setup.sql    # Storage 设置
│   └── DATABASE-SETUP.md       # 数据库设置指南
├── public/                 # 静态资源
├── test-supabase.js        # 数据库测试脚本
└── package.json
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

MIT License © 2026 张子涵

---

## 📞 联系

- **GitHub**: [@z-Zihan](https://github.com/z-Zihan)
- **Blog**: https://zzihanaini.vercel.app/

---

_Made with ❤️ by Zihan_
