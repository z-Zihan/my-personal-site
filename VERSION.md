# 📦 版本管理指南

## 当前版本

**Version**: 2.1.0  
**Release Date**: 2026-03-02  
**Code Name**: Complete Edition

---

## 版本号规则

本项目遵循 [语义化版本控制 2.0.0](https://semver.org/lang/zh-CN/)：

```
主版本号。次版本号.修订号
  ↑      ↑      ↑
 Major  Minor  Patch
```

### 版本号格式

- **主版本号 (Major)**: 不兼容的 API 变更或重大功能更新
- **次版本号 (Minor)**: 向下兼容的功能性新增
- **修订号 (Patch)**: 向下兼容的问题修正

---

## 更新日志

### [2.1.0] - 2026-03-02 - Complete Edition

#### ✨ 新增功能

**前台功能**:
- 个人中心页面 (`/profile`)
- 语言切换（中文/English）
- 主题切换（浅色/暗黑）
- 点赞/取消点赞功能
- 全局 Toast 通知系统
- 图片上传功能（本地/URL）
- 文章默认封面（5 张随机图）

**后台管理**:
- 独立登录页面
- 富文本编辑器（TinyMCE）
- 文章管理（创建/编辑/删除）
- 访客地域分布世界地图
- Header 语言/主题切换
- 默认浅色主题

**埋点分析**:
- 访客追踪系统
- 页面浏览自动记录
- 事件追踪（点击/交互）
- 地域分布可视化

#### 🐛 Bug 修复

- 修复点赞数量显示问题
- 修复文章封面显示问题
- 修复评论功能 API 错误
- 修复后台管理白屏问题
- 修复 SQL 约束重复错误

#### 📦 依赖更新

```json
{
  "@tinymce/tinymce-react": "^5.0.0",
  "react-simple-maps": "^3.0.0",
  "d3-geo": "^3.1.0",
  "vite-plugin-pwa": "^1.2.0"
}
```

---

### [2.0.0] - 2026-02-28 - Evolution

#### 重大更新

- 暗黑模式切换
- 评论系统
- 点赞功能
- 文章分类
- 标签系统
- PWA 支持
- 阅读进度条
- 文章目录导航

---

## 发布流程

### 1. 更新版本号

编辑 `package.json`:

```json
{
  "version": "2.1.0"
}
```

### 2. 更新 CHANGELOG.md

在顶部添加新版本记录

### 3. 更新 VERSION.md

添加新版本信息

### 4. 提交并推送

```bash
git add -A
git commit -m "release: v2.1.0 Complete Edition"
git push origin main
```

### 5. 创建 Git Tag

```bash
git tag -a v2.1.0 -m "Complete Edition"
git push origin v2.1.0
```

---

_最后更新：2026-03-02_
