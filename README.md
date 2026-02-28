# Personal Blog - 个人博客系统

基于 React + Vite + Supabase + Vercel Serverless 的现代化个人博客系统。

## 🚀 技术栈

### 前端
- **React 19** - UI 框架
- **Vite 7** - 构建工具
- **React Router 7** - 路由管理
- **Zustand 5** - 状态管理
- **Axios** - HTTP 请求
- **Ant Design 6** - 管理后台 UI
- **Framer Motion** - 动画效果
- **Recharts** - 数据可视化
- **TailwindCSS 4** - 样式框架

### 后端
- **Vercel Serverless Functions** - 无服务器 API
- **Supabase** - PostgreSQL 数据库

### 部署
- **Vercel** - 前端和 API 部署
- **Supabase** - 数据库托管

## 📁 项目结构

```
my-personal-site/
├── api/                      # Vercel Serverless API
│   ├── _lib.js              # API 工具函数
│   ├── articles.js          # 文章列表 API
│   ├── article-detail.js    # 文章详情 API
│   ├── create-article.js    # 创建文章 API
│   ├── update-article.js    # 更新文章 API
│   ├── delete-article.js    # 删除文章 API
│   ├── toggle-article-status.js  # 切换文章状态 API
│   ├── messages.js          # 留言列表 API
│   ├── create-message.js    # 创建留言 API
│   ├── delete-message.js    # 删除留言 API
│   ├── hot-news.js          # 热点资讯 API
│   ├── stats.js             # 统计数据 API
│   └── login.js             # 管理员登录 API
│
├── lib/
│   ├── supabase.js          # Supabase 客户端配置
│   └── supabase-schema.sql  # 数据库表结构
│
├── src/
│   ├── components/          # 公共组件
│   ├── pages/               # 页面组件
│   ├── hooks/               # 自定义 Hooks
│   ├── store/               # Zustand 状态管理
│   ├── utils/               # 工具函数
│   ├── router/              # 路由配置
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── public/                   # 静态资源
├── package.json
├── vercel.json              # Vercel 配置
└── .env.example             # 环境变量示例
```

## 🛠️ 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 Supabase 配置：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 初始化数据库

在 Supabase 控制台的 SQL Editor 中运行 `lib/supabase-schema.sql` 文件内容。

### 4. 本地开发

```bash
npm run dev
```

访问 http://localhost:3000

### 5. 构建生产版本

```bash
npm run build
```

## 📊 功能模块

### 前台功能
- ✅ 首页（Hero + 精选文章 + 热点）
- ✅ 文章列表（分页）
- ✅ 文章详情（阅读量统计）
- ✅ 热点资讯
- ✅ 留言板（虚拟访客机制）

### 后台功能
- ✅ 仪表盘（数据统计 + 图表）
- ✅ 文章管理（CRUD + 上架/下架）
- ✅ 留言管理（查看 + 删除）
- ✅ Token 认证

## 🔐 管理员登录

- 默认账号：`admin`
- 默认密码：`admin`
- 登录路径：`/admin/login`
- 开发模式：访问 `/admin?dev=1` 可直接进入（接口仍需验证）

## 🌐 部署

详细部署步骤请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 简要看

1. 在 Supabase 创建项目并运行 SQL schema
2. 复制环境变量到 Vercel
3. 推送代码到 GitHub
4. Vercel 导入项目并部署

## 📄 License

MIT
