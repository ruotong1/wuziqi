# Cloudflare 部署指南

## 📋 部署步骤

### 第一部分：部署前端（Cloudflare Pages）

1. **访问 Cloudflare Dashboard**
   - 打开：https://dash.cloudflare.com/7e65cba23ca10d7473c68541885b098c/home/developer-platform
   - 点击左侧菜单 "Pages"

2. **创建新的Pages项目**
   - 点击 "Create a project"
   - 选择 "Connect to Git"
   - 授权并选择你的GitHub仓库
   - 如果没有仓库，先推送到GitHub

3. **配置构建设置**
   - **Project name**: `chikawa-frontend`（或你喜欢的名字）
   - **Production branch**: `main`
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`（项目根目录）

4. **环境变量（如果需要）**
   - 可以添加环境变量，比如API端点地址

5. **点击 "Save and Deploy"**

6. **等待部署完成**
   - 部署完成后会获得一个URL，如：`https://your-project.pages.dev`

---

### 第二部分：部署后端（Cloudflare Workers）

由于后端使用Express.js，需要适配为Cloudflare Worker格式。

**选项A：使用Cloudflare Workers（推荐）**

1. **安装Wrangler CLI**（如果还没安装）:
```bash
npm install -g wrangler
```

2. **登录Cloudflare**:
```bash
wrangler login
```

3. **在项目根目录运行**（会使用cloudflare-worker目录）:
```bash
cd cloudflare-worker
wrangler deploy
```

**选项B：使用Cloudflare Workers + Hono框架（更简单）**

我已经为你创建了一个适配版本，位于 `cloudflare-worker/` 目录。

---

## 📝 注意事项

### 前端部署
- ✅ 已创建 `_redirects` 文件（支持React Router）
- ✅ 构建文件在 `dist/` 目录
- ✅ 所有路由会重定向到 index.html

### 后端部署
- ⚠️ Express.js不能直接在Cloudflare Workers上运行
- 需要使用适配器或重写为Worker格式
- 我已经创建了适配版本

### API端点配置
部署后端后，需要在前端更新API端点地址：
- 开发环境：`http://localhost:3000`
- 生产环境：`https://your-worker.your-subdomain.workers.dev`

---

## 🔄 更新部署

**前端更新**：
- 推送到GitHub会自动触发重新部署
- 或在Pages界面手动触发

**后端更新**：
```bash
cd cloudflare-worker
wrangler deploy
```





