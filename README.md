# 📝 Zihan's Blog - 张子涵的个人博客系统

> **Version**: 2.1.0 Complete Edition  
> **Build**: 2026-03-02  
> **Status**: Production Ready ✅

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/z-Zihan/my-personal-site)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Deployed with Vercel](https://img.shields.io/badge/deployed%20with-Vercel-black.svg)](https://vercel.com)
[![Powered by Supabase](https://img.shields.io/badge/powered%20by-Supabase-3ECF8E.svg)](https://supabase.com)

---

## 🌟 功能特性

### 📱 前台功能

- ✨ **首页** - 文章展示、统计数据、热点资讯
- 📰 **文章列表** - 分页、分类筛选、搜索
- 📖 **文章详情** - Markdown 渲染、目录、阅读进度
- 👍 **点赞系统** - 点赞/取消点赞、防重复
- 💬 **评论系统** - 访客评论、头像生成
- 🔥 **热点资讯** - 自动生成/手动添加
- 📝 **留言板** - 留言提交、列表展示
- 👤 **个人中心** - 访客信息、语言切换、主题切换
- 🔍 **全文搜索** - 实时搜索、高亮显示
- 📲 **PWA 支持** - 离线缓存、可安装

### 🛠️ 后台管理

- 🔐 **登录系统** - 独立登录页、Token 验证、1 天有效期
- 📊 **数据仪表盘** - 核心指标、统计图表、世界地图
- 📝 **文章管理** - 创建、编辑、删除、富文本编辑器
- 💬 **留言管理** - 列表、删除
- 🌍 **访客分析** - 地域分布、设备统计、浏览器分布
- 🎨 **主题切换** - 浅色/暗黑模式
- 🌐 **语言切换** - 中文/English

### 📊 埋点分析

- 👥 **访客追踪** - 匿名 ID、设备信息、地域
- 📄 **页面浏览** - 自动记录、来源追踪
- 🖱️ **事件追踪** - 点击、交互事件
- 🗺️ **地域分布** - 世界地图可视化
- 📈 **趋势分析** - 7 天访问趋势

---

## 🚀 快速开始

### 在线访问

- **前台**: https://zzihanaini.vercel.app/
- **后台**: https://zzihanaini.vercel.app/admin/login
- **开发模式**: https://zzihanaini.vercel.app/admin?dev=1

**默认账号**:
- 用户名：`admin`
- 密码：`Admin@2026Secure`

### 本地开发

```bash
# 克隆项目
git clone https://github.com/z-Zihan/my-personal-site.git
cd my-personal-site

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入 Supabase 配置

# 启动开发服务器
npm run dev

# 访问
# 前台：http://localhost:3000/
# 后台：http://localhost:3000/admin?dev=1
```

---

## 📦 技术栈

### 前端

- **React 19** - UI 框架
- **Vite 7** - 构建工具
- **React Router 7** - 路由管理
- **Ant Design 6** - UI 组件库
- **Tailwind CSS 4** - 样式框架
- **Framer Motion** - 动画库
- **Zustand** - 状态管理

### 后端

- **Vercel Edge Functions** - 无服务器 API
- **Supabase** - 数据库 + 认证 + 存储

### 第三方服务

- **TinyMCE** - 富文本编辑器
- **react-simple-maps** - 世界地图
- **Vercel Analytics** - 访问统计

---

## 📁 项目结构

```
myBlog/
├── src/
│   ├── pages/              # 页面组件
│   │   ├── Home.jsx        # 首页
│   │   ├── BlogList.jsx    # 文章列表
│   │   ├── BlogDetail.jsx  # 文章详情
│   │   ├── Profile.jsx     # 个人中心
│   │   └── Admin/          # 后台管理
│   ├── components/         # 通用组件
│   │   ├── common/         # 通用组件
│   │   └── admin/          # 后台组件
│   ├── utils/              # 工具函数
│   │   ├── api.js          # API 封装
│   │   ├── analytics.js    # 埋点 SDK
│   │   ├── i18n.js         # 国际化
│   │   └── toast.js        # 通知系统
│   ├── store/              # 状态管理
│   └── router/             # 路由配置
├── api/                    # Vercel Edge Functions
├── lib/                    # SQL 脚本
├── public/                 # 静态资源
└── package.json
```

---

## 📖 文档

| 文档 | 说明 |
|------|------|
| [VERSION.md](VERSION.md) | 版本管理指南 |
| [CHANGELOG.md](CHANGELOG.md) | 更新日志 |
| [RELEASE-NOTES.md](RELEASE-NOTES.md) | 发布说明 |
| [ANALYTICS-GUIDE.md](ANALYTICS-GUIDE.md) | 埋点分析使用指南 |
| [LOCAL-DEV.md](LOCAL-DEV.md) | 本地开发指南 |
| [FEATURES.md](FEATURES.md) | 功能清单 |

---

## 🔧 部署

### Vercel 部署

1. Fork 本项目到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 自动部署

### 环境变量

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# 管理员配置
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@2026Secure
```

### 数据库迁移

在 Supabase SQL Editor 执行：

1. `lib/supabase-schema-full.sql` - 博客主表
2. `lib/supabase-analytics-schema.sql` - 埋点分析表

### Storage 配置

创建 Bucket: `blog-images`（Public）

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License © 2026 张子涵

---

## 📞 联系

- **GitHub**: [@z-Zihan](https://github.com/z-Zihan)
- **Blog**: https://zzihanaini.vercel.app/

---

_Made with ❤️ by Zihan_
