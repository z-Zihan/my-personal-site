# 🛠️ 本地开发指南

## ✅ Supabase 连接测试

运行测试脚本验证连接：

```bash
node test-supabase.js
```

预期输出：
```
🔍 测试 Supabase 连接...
✅ Articles 表连接成功
✅ Categories 表连接成功
✅ Messages 表连接成功
```

---

## 🚀 本地开发模式

### 方式一：使用 ?dev=1 参数（推荐）

访问管理后台时添加 `?dev=1` 参数绕过登录：

```
http://localhost:3000/admin/login?dev=1
http://localhost:3000/admin/dashboard?dev=1
```

**优点**:
- ✅ 直接连接真实 Supabase 数据库
- ✅ 无需登录即可测试后台功能
- ✅ 数据与线上同步

### 方式二：正常登录

1. 启动开发服务器：
```bash
npm run dev
```

2. 访问登录页：
```
http://localhost:3000/admin/login
```

3. 使用默认账号登录：
- 用户名：`admin`
- 密码：`Admin@2026Secure`

---

## 📁 环境变量配置

### 本地开发 (.env.local)

```bash
VITE_SUPABASE_URL=https://lseantwsebvsmavqcjat.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_FkAtim7rD1L2_5AWS9g-VQ_60b2Qbp9
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@2026Secure
```

**注意**: `.env.local` 不会被提交到 Git，每个开发者需要自己创建。

### Vercel 生产环境

在 Vercel 控制台设置环境变量：
1. 进入项目 Settings → Environment Variables
2. 添加以下变量：
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

---

## 🐛 常见问题

### Q: 本地开发 API 返回 500 错误
A: 检查 Supabase 连接，运行 `node test-supabase.js` 测试

### Q: 管理后台白屏
A: 使用 `?dev=1` 参数访问，或清除浏览器缓存

### Q: 登录后仍然白屏
A: 检查浏览器控制台错误，可能是 token 存储问题

---

## 📝 开发流程

1. **启动开发服务器**:
   ```bash
   npm run dev
   ```

2. **访问开发模式**:
   ```
   http://localhost:3000/admin?dev=1
   ```

3. **测试功能**:
   - 所有 API 都会连接真实 Supabase
   - 数据与线上同步
   - 可以安全测试（开发模式使用 Mock 响应）

4. **部署前检查**:
   ```bash
   npm run build
   git push origin main
   ```

---

_最后更新：2026-03-02_
