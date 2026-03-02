# 🔧 待完成的修复清单

## 已完成 ✅

1. ✅ 首页去掉管理入口 - Navbar.jsx
2. ✅ 文章默认封面 - defaultCovers.js + ArticleCard.jsx
3. ✅ 评论和点赞 API 修复 - like-article.js, comments.js, create-comment.js
4. ✅ 语言切换基础 - i18n.js

## 待完成 📝

### 4. 个人管理页面
- 创建 `/profile` 页面
- 包含：语言切换、主题切换、访客 ID 显示
- 我的评论、我的点赞历史

### 5. 后台管理优化
- Header 右上角添加语言/主题切换
- 移除"返回首页"菜单项
- 退出登录移到 menu 最下方

### 6. 富文本编辑器
- 安装：`npm install @tinymce/tinymce-react`
- 创建文章编辑页面
- 支持样式切换

### 7. 后台主题修复
- 默认浅色主题
- 修复黑色文字问题

### 8. 世界地图
- 安装：`npm install react-simple-maps`
- Dashboard 添加访客地域分布地图

---

## 执行步骤

```bash
cd ~/Desktop/vibeCoding/myBlog

# 安装富文本编辑器
npm install @tinymce/tinymce-react

# 安装地图组件
npm install react-simple-maps d3-geo

# 提交所有修改
git add -A
git commit -m "feat: 批量修复 8 个问题"
git push origin main
```

---

_详细代码实现见各组件文件_
