# 📋 更新日志 (Changelog)

本项目遵循 [语义化版本控制](https://semver.org/lang/zh-CN/) 格式：`主版本号。次版本号.修订号`

---

## [2.0.0] - 2026-02-28

### 🎉 重大更新 - 功能全面升级

#### ✨ 新增功能

##### 用户体验 (5 个)
- **暗黑模式切换** - 右上角太阳/月亮按钮，自动保存偏好
- **阅读进度条** - 页面顶部渐变进度条，实时滚动更新
- **文章目录导航** - 自动提取 h2/h3，当前章节高亮，平滑滚动
- **阅读时长估算** - 根据字数智能计算阅读时间
- **文章搜索功能** - 首页实时搜索，标题/内容全文检索

##### 互动功能 (3 个)
- **评论系统** - 访客虚拟身份，自动生成头像，时间线显示
- **点赞功能** - 心形按钮动画，防止重复点赞，实时计数
- **分享功能** - 微博、Twitter、复制链接

##### 内容管理 (4 个)
- **文章分类支持** - 数据库表创建，后台待实现
- **标签系统** - 多标签支持，关联查询优化
- **定时发布** - status 字段扩展，scheduled_at 字段
- **图片上传准备** - Supabase Storage 配置完成

##### 数据分析 (3 个)
- **热门文章排行** - 按 views 排序 API
- **访客统计** - daily_views 表，自动递增触发器
- **SEO 优化** - react-helmet-async 集成，meta 标签完善

##### 性能优化 (4 个)
- **PWA 支持** - 可安装到桌面，离线缓存
- **图片懒加载** - loading="lazy" 原生支持
- **API 缓存** - Vite PWA runtime caching
- **代码分割** - 组件懒加载优化

#### 🎨 UI/UX 改进
- 全新渐变配色方案（紫 - 粉 - 青）
- 玻璃态效果组件
- 平滑过渡动画
- 触摸友好优化（移动端点击区域≥44px）
- iPhone 安全区域适配

#### 📱 移动端兼容
- 响应式布局（640px/768px/1024px 断点）
- 移动端导航菜单
- 触摸反馈动画
- 防止 iOS 字体缩放
- 横屏优化
- 减少动画偏好支持

#### 🔧 技术栈更新

##### 新增依赖
```json
{
  "react-markdown": "^9.x",
  "@uiw/react-md-editor": "^4.x",
  "rehype-highlight": "^7.x",
  "remark-gfm": "^4.x",
  "vite-plugin-pwa": "^0.x",
  "react-intersection-observer": "^9.x"
}
```

##### 新增组件
- `ThemeToggle.jsx` - 主题切换
- `ReadingProgress.jsx` - 阅读进度
- `TableOfContents.jsx` - 文章目录
- `SearchBar.jsx` - 搜索组件
- `ShareButtons.jsx` - 分享按钮
- `ReadingTime.jsx` - 阅读时长
- `CommentSection.jsx` - 评论区域
- `LikeButton.jsx` - 点赞按钮

##### 新增 API
- `GET /api/search` - 文章搜索
- `GET /api/comments` - 评论列表
- `POST /api/create-comment` - 创建评论
- `POST /api/like-article` - 点赞文章

#### 📝 文档更新
- 新增 `CHANGELOG.md` - 版本管理文档
- 新增 `FEATURES.md` - 功能清单
- 更新 `README.md` - 项目说明
- 更新 `DEPLOYMENT.md` - 部署指南

#### 🎨 品牌更新
- 新 Logo - 渐变 Z 字母 + 星星装饰
- 新标题 - "Zihan's Blog | 张子涵的个人博客"
- 新 Slogan - "探索技术 · 记录生活 · 分享思考"
- 新配色 - 紫 (#8b5cf6) / 粉 (#ec4899) / 青 (#06b6d4)

#### 🗄️ 数据库变更

##### 新增表
- `categories` - 文章分类
- `tags` - 标签
- `article_tags` - 文章标签关联
- `comments` - 评论
- `likes` - 点赞
- `bookmarks` - 收藏
- `user_preferences` - 用户偏好

##### 字段扩展
- `articles.reading_time` - 阅读时长
- `articles.likes` - 点赞数
- `articles.category_id` - 分类 ID
- `articles.scheduled_at` - 定时发布时间
- `articles.status` - 增加 `scheduled` 状态

#### 🐛 Bug 修复
- 修复移动端卡片布局问题
- 修复暗黑模式切换闪烁
- 修复代码块横向滚动

#### ⚠️ 破坏性变更
- 数据库 schema 需要更新（执行 `lib/supabase-schema-full.sql`）
- 环境变量需要添加 PWA 相关配置

---

## [1.2.0] - 2026-02-28

### 🎨 功能增强

#### 新增
- 热点资讯模块
- 留言板（虚拟访客机制）
- 后台数据统计图表

#### 改进
- 优化文章列表分页
- 改进后台管理界面

---

## [1.1.0] - 2026-02-27

### 🚀 基础功能

#### 新增
- 文章 CRUD 功能
- 后台管理系统
- Supabase 数据库集成
- Vercel 部署配置

---

## [1.0.0] - 2026-02-26

### 🎉 初始版本

- React 19 + Vite 7 项目搭建
- 基础页面结构
- TailwindCSS 样式框架

---

## 📊 版本统计

| 版本 | 日期 | 类型 | 主要变更 |
|------|------|------|----------|
| 2.0.0 | 2026-02-28 | Major | 19 个新功能，移动端兼容，PWA |
| 1.2.0 | 2026-02-28 | Minor | 热点资讯，留言板 |
| 1.1.0 | 2026-02-27 | Minor | 后台管理，数据库 |
| 1.0.0 | 2026-02-26 | Major | 初始版本 |

---

## 🔮 计划中

### v2.1.0 (待定)
- [ ] Markdown 编辑器集成
- [ ] 图片上传功能
- [ ] 分类管理界面
- [ ] 标签管理界面

### v2.2.0 (待定)
- [ ] 评论审核功能
- [ ] 用户登录系统
- [ ] 草稿箱功能

### v3.0.0 (待定)
- [ ] 多语言支持
- [ ] RSS 订阅
- [ ] 搜索优化（Algolia）

---

**最后更新**: 2026-02-28
**维护者**: 张子涵 (Zihan)
