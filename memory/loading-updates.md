# Loading 和空状态样式更新

## 更新日期：2026-03-07

## 修改内容

### 1. 前端页面 Loading 样式修改

所有 `⏳` loading 样式已替换为不同的科技风加载动画：

#### BlogDetail.jsx
- 脉冲光环加载器（紫色主题）
- 位置：`src/pages/BlogDetail.jsx:52-64`

#### Profile.jsx
- 旋转渐变圆环（粉色 + 紫色主题）
- 位置：`src/pages/Profile.jsx:63-78`

#### VisitorMap.jsx
- 地球仪风格加载器（紫色 + 青色主题）
- 位置：`src/components/admin/VisitorMap.jsx:197-210`

#### Admin/Login.jsx
- 科技风双环加载器（紫色 + 青色）
- 位置：`src/pages/Admin/Login.jsx:58-73`

#### Admin/Layout.jsx
- 科技风双环加载器（紫色 + 青色）
- 位置：`src/pages/Admin/Layout.jsx:72-86`

### 2. 后台管理 Loading 和空状态

#### Dashboard.jsx
- Loading: 三环科技风加载器
- 空状态：自定义插图 + 浮动装饰点
- 位置：`src/pages/Admin/Dashboard.jsx:77-132`

#### 空状态组件 EmptyState.jsx
- 新建通用空状态组件
- 支持多种图标类型：default, article, message, data, chart
- 位置：`src/components/common/EmptyState.jsx`

### 3. 404 页面

#### NotFound.jsx
- 渐变背景
- 404 数字动画
- 迷失星球 SVG 插图
- 返回首页/返回上一页按钮
- 自动跳转倒计时提示
- 位置：`src/pages/NotFound.jsx`

### 4. 错误边界组件

#### ErrorBoundary.jsx
- 类组件错误边界
- RouteErrorBoundary 路由错误处理
- 错误详情显示
- 刷新页面/返回首页按钮
- 发送邮件反馈功能
- 自动刷新倒计时（30 秒）
- 位置：`src/components/ErrorBoundary.jsx`

### 5. 路由配置更新

#### router/index.jsx
- 导入 NotFound 和 ErrorBoundary
- 为每个路由添加 errorElement
- 添加 404 通配符路由
- 位置：`src/router/index.jsx`

## 设计特点

1. **多样化 Loading 样式**：每个页面使用不同的加载动画，避免单调
2. **统一设计语言**：都采用科技风、渐变色、脉冲动画等元素
3. **空状态插图**：使用 SVG 图标 + 背景光晕 + 浮动装饰点
4. **用户引导**：404 和错误页面提供明确的操作指引
5. **响应式设计**：所有组件都支持移动端和桌面端

## 相关文件

- `src/pages/BlogDetail.jsx`
- `src/pages/Profile.jsx`
- `src/components/admin/VisitorMap.jsx`
- `src/pages/Admin/Login.jsx`
- `src/pages/Admin/Layout.jsx`
- `src/pages/Admin/Dashboard.jsx`
- `src/pages/NotFound.jsx` (新建)
- `src/components/ErrorBoundary.jsx` (新建)
- `src/components/common/EmptyState.jsx` (新建)
- `src/router/index.jsx`
