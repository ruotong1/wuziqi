# 🚂 后端部署指南 - 使用 Railway

## ✅ 前端部署状态

恭喜！前端已成功部署到Cloudflare Pages！🎉

现在需要部署后端，以便前端可以调用API。

---

## ⚠️ 重要说明

你的后端使用 **Express.js** 和 Node.js 原生模块，**不能部署到Cloudflare Workers**。

**推荐方案：使用 Railway 部署**（最简单、最稳定）

---

## 🚀 部署步骤（Railway）

### 第一步：注册 Railway 账号

1. **访问 Railway**
   - 打开：https://railway.app
   - 点击右上角 **"Login"** 或 **"Start a New Project"**

2. **使用GitHub登录**
   - 选择 **"Login with GitHub"**
   - 授权Railway访问你的GitHub账号

### 第二步：创建新项目

1. **点击 "New Project"**
   - 在Railway Dashboard首页，点击 **"New Project"** 按钮

2. **选择部署方式**
   - 选择 **"Deploy from GitHub repo"**
   - 如果提示授权，点击 **"Configure GitHub App"** 并授权

3. **选择仓库**
   - 在仓库列表中找到：**`ruotong1/wuziqi`**
   - 点击选择

### 第三步：配置项目

1. **设置根目录**
   - Railway会自动检测项目
   - 点击项目卡片进入设置
   - 在 **Settings** → **Source** → **Root Directory**
   - 设置为：`chikawa-server`

2. **配置启动命令**
   - 在 **Settings** → **Deploy** → **Start Command**
   - 设置为：`npm start`
   - （Railway通常会自动检测，确认一下即可）

3. **配置环境变量**
   - 在项目页面，点击 **Variables** 标签
   - 点击 **"New Variable"** 添加以下环境变量：

   | 变量名 | 值 | 说明 |
   |--------|-----|------|
   | `PORT` | `3000` | （可选，Railway会自动分配端口） |
   | `JWT_SECRET` | `你的JWT密钥` | 用于生成JWT token |
   | `JWT_REFRESH_SECRET` | `你的刷新密钥` | 用于刷新token |
   | `VOLCENGINE_SECRET_KEY` | `你的火山引擎密钥` | 火山引擎API密钥 |

   **如何生成密钥？**
   ```bash
   # 在终端运行（生成随机密钥）
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   **⚠️ 注意**：
   - `VOLCENGINE_SECRET_KEY` 需要从火山引擎控制台获取
   - `JWT_SECRET` 和 `JWT_REFRESH_SECRET` 可以使用上面的命令生成
   - 密钥要保密，不要提交到Git

### 第四步：部署

1. **Railway会自动部署**
   - 配置完成后，Railway会自动开始部署
   - 可以在 **Deployments** 标签查看部署进度

2. **查看日志**
   - 在项目页面点击 **Deployments** → 点击最新的部署
   - 查看构建和运行日志，确认部署成功

3. **获取部署URL**
   - 部署成功后，Railway会自动分配一个URL
   - 在项目页面可以看到：`https://your-app.up.railway.app`
   - 或者点击 **Settings** → **Networking** → **Generate Domain**

### 第五步：测试API

1. **访问健康检查**
   - 打开：`https://your-app.up.railway.app/health`
   - 应该看到API服务页面

2. **测试API端点**
   ```bash
   # 测试注册接口
   curl -X POST https://your-app.up.railway.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"test","password":"test123"}'
   ```

---

## 🔗 连接前端和后端

部署后端后，需要在前端配置API地址：

### 方法1：在Cloudflare Pages中设置环境变量（推荐）

1. **访问Cloudflare Dashboard**
   - 进入你的Pages项目
   - 点击 **Settings** → **Environment variables**

2. **添加环境变量**
   - 点击 **"Add variable"**
   - 添加：
     - **Name**: `VITE_API_URL`
     - **Value**: `https://your-app.up.railway.app`
     - **Environment**: 选择 **Production** 或 **Both**

3. **重新部署**
   - 在 **Deployments** 标签中
   - 点击最新的部署 → **"Retry deployment"**
   - 或者推送一个新的commit到GitHub

### 方法2：修改前端代码（如果不使用环境变量）

找到前端代码中API配置的地方（如果有），更新API地址。

---

## 📋 部署检查清单

- [ ] Railway账号已注册
- [ ] 已创建新项目并连接GitHub仓库
- [ ] 已设置根目录为 `chikawa-server`
- [ ] 已配置环境变量（JWT_SECRET, JWT_REFRESH_SECRET, VOLCENGINE_SECRET_KEY）
- [ ] 部署成功，获得URL
- [ ] 测试 `/health` 端点可以访问
- [ ] 在Cloudflare Pages中配置了 `VITE_API_URL`
- [ ] 前端重新部署并测试API连接

---

## 🆘 常见问题

### Q1: 部署失败怎么办？

**检查日志**：
- 在Railway项目页面 → **Deployments** → 查看构建日志
- 常见原因：
  - 依赖安装失败：检查 `package.json` 是否正确
  - 启动命令错误：确认是 `npm start`
  - 环境变量缺失：检查是否配置了必要的环境变量

### Q2: 如何查看应用日志？

- 在Railway项目页面，点击 **View Logs** 按钮
- 或者进入 **Deployments** → 点击部署 → 查看日志

### Q3: 如何更新代码？

- 推送代码到GitHub的 `deploy` 分支
- Railway会自动检测并重新部署
- 或者在Railway中点击 **"Redeploy"**

### Q4: 如何获取自定义域名？

1. 在Railway项目页面 → **Settings** → **Networking**
2. 点击 **"Generate Domain"** 获取免费域名
3. 或者点击 **"Custom Domain"** 添加自己的域名

### Q5: 免费额度够用吗？

Railway提供：
- **$5免费额度/月**
- 适合小型项目使用
- 超出后需要付费，但价格合理

### Q6: 数据库怎么办？

当前后端使用内存存储（开发环境）。
**生产环境建议**：
- 使用Railway的PostgreSQL插件
- 或者使用外部数据库服务（如Supabase、MongoDB Atlas）

---

## 🔐 安全提示

1. **环境变量安全**
   - 不要在代码中硬编码密钥
   - 使用环境变量存储敏感信息
   - 不要将 `.env` 文件提交到Git

2. **JWT密钥**
   - 使用强随机密钥
   - 生产环境和开发环境使用不同的密钥

3. **CORS配置**
   - 确保后端CORS配置允许前端域名访问
   - 当前代码使用 `app.use(cors())`，允许所有来源（开发环境）
   - 生产环境建议限制特定域名

---

## 📝 下一步

部署后端后：

1. ✅ 测试所有API端点
2. ✅ 在前端配置API地址
3. ✅ 测试前端与后端的连接
4. ✅ 配置自定义域名（可选）
5. ✅ 设置数据库（如果需要持久化存储）

---

## 🔗 相关链接

- Railway Dashboard: https://railway.app
- Railway文档: https://docs.railway.app
- 项目GitHub: https://github.com/ruotong1/wuziqi

---

祝你部署顺利！🚀





