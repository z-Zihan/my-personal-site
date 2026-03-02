# 🛠️ 本地开发指南

## 问题说明

本项目使用 Vercel Edge Functions 处理 API 请求（如登录、文章管理等）。
在本地开发时，需要特殊配置才能让 API 正常工作。

---

## ✅ 方案一：使用 Vercel 本地开发（推荐）

这是最准确的方式，完全模拟生产环境。

```bash
# 1. 安装 Vercel CLI（如果还没安装）
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 链接项目（首次运行）
vercel link

# 4. 启动本地开发服务器（包含 API 支持）
vercel dev
```

**访问地址**: http://localhost:3000

**优点**: 
- ✅ 完整模拟生产环境
- ✅ API 函数正常工作
- ✅ 包括 Edge Functions 支持

---

## ⚡ 方案二：使用开发模式绕过登录（快速测试）

如果只需要测试前端页面，可以在 URL 中添加 `?dev=1` 参数绕过登录验证：

```
http://localhost:3000/admin/login?dev=1
http://localhost:3000/admin/dashboard?dev=1
```

**注意**: 这只在前端路由层面绕过验证，API 请求仍需要有效 token。

---

## 🔧 方案三：修改 API 调用（仅开发环境）

编辑 `src/utils/api.js`，在开发环境下使用 mock 数据：

```javascript
const isDev = import.meta.env.DEV

if (isDev) {
  // 开发环境使用 mock
  authApi.login = async (data) => {
    return {
      data: {
        data: {
          token: 'dev_token_123',
          user: { username: 'admin' }
        }
      }
    }
  }
}
```

---

## 🚀 生产部署

```bash
# 1. 构建项目
npm run build

# 2. 部署到 Vercel
vercel --prod
```

---

## 📝 默认管理员账号

**开发环境**:
- 用户名：`admin`
- 密码：`Admin@2026Secure`（在 `.env` 中配置）

**⚠️ 安全提醒**: 生产环境务必修改默认密码！

---

## 🐛 常见问题

### Q: 访问 /admin/login 页面空白
A: 使用 `vercel dev` 而不是 `npm run dev`，因为需要 Edge Functions 支持。

### Q: 登录失败 "Invalid credentials"
A: 检查 `.env` 文件中的 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD`。

### Q: API 请求 404
A: 确保使用 `vercel dev` 启动，Vite 不会处理 Edge Functions。
