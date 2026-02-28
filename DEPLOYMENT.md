# 部署指南

## 一、Supabase 配置

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 点击 "Start your project"
3. 填写项目名称、数据库密码
4. 选择区域（推荐 Asia (Singapore)）

### 2. 获取 API 凭证

1. 进入项目后，点击左下角 "Settings"
2. 选择 "API"
3. 复制以下值：
   - Project URL → `SUPABASE_URL`
   - anon public → `SUPABASE_ANON_KEY`

### 3. 初始化数据库

1. 进入左侧 "SQL Editor"
2. 点击 "New query"
3. 复制项目根目录 `lib/supabase-schema.sql` 的全部内容
4. 粘贴并点击 "Run" 执行

### 4. （可选）插入测试数据

在 SQL Editor 中运行：

```sql
INSERT INTO articles (title, summary, content, cover, status, views) VALUES
('欢迎来到我的博客', '这是我的第一篇文章', '欢迎来到我的个人博客网站！这里会分享技术文章、热点资讯等内容。', 'https://picsum.photos/800/400', 'published', 100),
('React 18 新特性解析', '深入讲解 React 18 的并发特性', 'React 18 带来了许多令人兴奋的新特性，包括并发渲染、自动批处理、过渡更新等...', 'https://picsum.photos/800/401', 'published', 250),
('Supabase 入门指南', '快速上手 Supabase 数据库', 'Supabase 是一个开源的 Firebase 替代品，提供了完整的后端即服务...', 'https://picsum.photos/800/402', 'published', 180);
```

---

## 二、本地开发配置

### 1. 创建 .env 文件

在项目根目录创建 `.env` 文件：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

---

## 三、GitHub 仓库设置

### 1. 初始化 Git

```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. 创建私有仓库

1. 访问 [GitHub](https://github.com)
2. 点击 "New repository"
3. 填写仓库名称（如 `my-personal-site`）
4. 选择 **Private**
5. 点击 "Create repository"

### 3. 推送代码

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## 四、Vercel 部署

### 1. 登录 Vercel

1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 账号登录

### 2. 导入项目

1. 点击 "Add New Project"
2. 选择 "Import Git Repository"
3. 找到你的仓库 `my-personal-site`
4. 点击 "Import"

### 3. 配置环境变量

在 Vercel 项目设置中，添加以下环境变量：

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | `your-anon-key` |

**注意**：Vercel 需要同时配置：
- Build & Development Settings → Environment Variables
- Functions → Environment Variables

### 4. 部署

1. 点击 "Deploy"
2. 等待构建完成（约 1-2 分钟）
3. 点击生成的域名访问

### 5. 绑定自定义域名（可选）

1. 进入项目 Settings → Domains
2. 添加你的域名
3. 按提示配置 DNS

---

## 五、验证部署

### 前台验证

1. 访问 Vercel 分配的域名
2. 检查首页是否正常显示
3. 点击文章列表、热点、留言板
4. 查看文章详情（阅读量应 +1）

### 后台验证

1. 访问 `/admin/login`
2. 使用默认账号登录：`admin` / `admin`
3. 检查仪表盘数据
4. 尝试创建/编辑/删除文章
5. 检查留言管理

### API 验证

访问以下 API 端点检查是否正常：

```bash
# 获取文章列表
curl https://your-domain.vercel.app/api/articles

# 获取统计数据
curl https://your-domain.vercel.app/api/stats

# 获取热点
curl https://your-domain.vercel.app/api/hot-news
```

---

## 六、常见问题

### 1. API 返回 500 错误

检查 Vercel 环境变量是否正确配置：
- 进入 Vercel Project Settings → Environment Variables
- 确认 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 已设置
- 重新部署项目

### 2. 数据库连接失败

确认 Supabase 项目状态正常，检查：
- Project URL 是否正确
- anon key 是否复制完整
- 数据库表是否已创建

### 3. 本地开发正常但部署后失败

- 确保 `.env` 文件没有被提交到 Git
- 环境变量名区分大小写
- Vercel 需要同时配置 Build 和 Runtime 环境变量

### 4. 图片无法显示

- 检查图片 URL 是否可公开访问
- 推荐使用 Unsplash、Picsum 等图床
- 或配置 Supabase Storage

---

## 七、后续维护

### 更新代码

```bash
git add .
git commit -m "Update description"
git push
```

Vercel 会自动检测并重新部署。

### 查看日志

1. Vercel Dashboard → 选择项目
2. 点击 "Deployments"
3. 查看最近的部署日志

### 数据库管理

- 数据浏览：Supabase Dashboard → Table Editor
- SQL 查询：Supabase Dashboard → SQL Editor
- API 文档：Supabase Dashboard → API Settings
