# Zihan's Blog - 个人博客系统

> 探索技术 · 记录生活 · 分享思考

![Version](https://img.shields.io/badge/version-2.0.0-purple)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-7-ff69b4)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8)
![PWA](https://img.shields.io/badge/PWA-Supported-green)

## 🌟 特性亮点

- ✨ **暗黑模式** - 自动/手动切换，保护视力
- 📱 **移动端兼容** - 响应式设计，完美适配各种设备
- 🚀 **PWA 支持** - 可安装到桌面，离线访问
- 📖 **阅读体验** - 进度条、目录导航、时长估算
- 💬 **互动功能** - 评论、点赞、分享
- 🔍 **全文搜索** - 快速找到想要的文章
- 📊 **数据统计** - 阅读量、访客统计、热门排行

## 🚀 快速开始

### 环境要求

- Node.js >= 20
- npm >= 9
- Supabase 账号

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 初始化数据库

在 Supabase 控制台 SQL Editor 执行：

```bash
cat lib/supabase-schema-full.sql
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 5. 构建生产版本

```bash
npm run build
npm run preview
```

## 📁 项目结构

```
my-personal-site/
├── api/                      # Vercel Serverless API
│   ├── articles.js          # 文章相关 API
│   ├── comments.js          # 评论 API
│   ├── like-article.js      # 点赞 API
│   ├── search.js            # 搜索 API
│   └── ...
├── src/
│   ├── components/
│   │   └── common/          # 共享组件
│   │       ├── ThemeToggle.jsx      # 主题切换
│   │       ├── ReadingProgress.jsx  # 阅读进度
│   │       ├── TableOfContents.jsx  # 文章目录
│   │       ├── SearchBar.jsx        # 搜索
│   │       ├── ShareButtons.jsx     # 分享
│   │       ├── ReadingTime.jsx      # 阅读时长
│   │       ├── CommentSection.jsx   # 评论
│   │       └── LikeButton.jsx       # 点赞
│   ├── pages/               # 页面组件
│   ├── store/               # 状态管理
│   │   └── themeStore.js    # 主题状态
│   ├── hooks/               # 自定义 Hooks
│   └── utils/               # 工具函数
├── lib/
│   ├── supabase.js          # Supabase 客户端
│   └── supabase-schema-full.sql  # 数据库 schema
├── public/                  # 静态资源
│   ├── favicon.svg          # 网站图标
│   └── pwa-*.svg            # PWA 图标
├── package.json
├── vite.config.js           # Vite 配置（含 PWA）
└── CHANGELOG.md             # 更新日志
```

## 📊 功能模块

### 前台功能

| 功能 | 状态 | 描述 |
|------|------|------|
| 首页 | ✅ | Hero + 精选文章 + 热点 + 搜索 |
| 文章列表 | ✅ | 分页 + 分类筛选 |
| 文章详情 | ✅ | 目录 + 进度条 + 评论 + 点赞 + 分享 |
| 热点资讯 | ✅ | 最新技术热点 |
| 留言板 | ✅ | 虚拟访客机制 |
| 搜索 | ✅ | 全文搜索 |
| PWA | ✅ | 可安装 + 离线缓存 |

### 后台功能

| 功能 | 状态 | 描述 |
|------|------|------|
| 仪表盘 | ✅ | 数据统计 + 图表 |
| 文章管理 | ✅ | CRUD + 上架/下架 |
| 留言管理 | ✅ | 查看 + 删除 |
| 评论管理 | 🔄 待实现 | 审核 + 删除 |
| 分类管理 | 🔄 待实现 | CRUD |
| 标签管理 | 🔄 待实现 | CRUD |

## 🛠️ 技术栈

### 前端
- **React 19** - UI 框架
- **Vite 7** - 构建工具
- **React Router 7** - 路由管理
- **Zustand 5** - 状态管理
- **TailwindCSS 4** - 样式框架
- **Framer Motion** - 动画效果

### 后端
- **Vercel Serverless Functions** - API
- **Supabase** - PostgreSQL 数据库

### PWA
- **vite-plugin-pwa** - PWA 支持
- **Workbox** - 服务工作者

## 📱 移动端兼容

- ✅ 响应式布局（640px/768px/1024px 断点）
- ✅ 触摸友好（点击区域≥44px）
- ✅ 防止 iOS 字体缩放
- ✅ 安全区域适配（iPhone X+）
- ✅ 横屏优化
- ✅ 减少动画偏好支持

## 🎨 主题定制

修改 `src/index.css` 中的 CSS 变量：

```css
:root {
  --color-primary: #8b5cf6;   /* 紫色 */
  --color-primary-light: #a78bfa;
  --color-accent: #ec4899;    /* 粉色 */
}
```

## 📝 更新日志

查看 [CHANGELOG.md](./CHANGELOG.md) 了解版本更新详情。

### 最新版本：v2.0.0 (2026-02-28)

- ✨ 新增 19 个功能
- 📱 移动端完全兼容
- 🚀 PWA 支持
- 🎨 全新 UI 设计

## 🌐 部署

详细部署步骤查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 快速部署

1. **Supabase**: 创建项目，执行 SQL schema
2. **Vercel**: 导入 GitHub 仓库，配置环境变量
3. **完成**: 自动部署，获得 HTTPS 域名

## 📄 License

MIT License © 2026 张子涵 (Zihan)

## 👤 关于作者

**张子涵 (Zihan)**

- 📧 Email: your-email@example.com
- 🌐 Blog: https://your-domain.com
- 💻 GitHub: [@z-Zihan](https://github.com/z-Zihan)

---

<div align="center">

**Made with ❤️ by Zihan**

[⭐ Star on GitHub](https://github.com/z-Zihan/my-personal-site) · [📖 View Changelog](./CHANGELOG.md)

</div>
