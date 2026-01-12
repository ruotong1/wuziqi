# 🚀 Cloudflare 部署完整指南

## 前置准备

1. **确保代码已推送到GitHub**
2. **安装Wrangler CLI**（用于部署Workers）:
```bash
npm install -g wrangler
```

---

## 第一部分：部署前端（Cloudflare Pages）

### 步骤1：访问Cloudflare Dashboard
打开：https://dash.cloudflare.com/7e65cba23ca10d7473c68541885b098c/home/developer-platform

### 步骤2：创建Pages项目
1. 点击左侧菜单 **"Pages"**
2. 点击 **"Create a project"**
3. 选择 **"Connect to Git"**
4. 授权GitHub并选择你的仓库
5. 配置项目：
   - **Project name**: `chikawa-frontend`
   - **Production branch**: `main`
   - **Framework preset**: `Vite` 或 `None`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` （留空或填 `/`）

6. 点击 **"Save and Deploy"**

### 步骤3：等待部署
- 部署需要1-2分钟
- 完成后会显示部署URL，如：`https://chikawa-frontend.pages.dev`

---

## 第二部分：部署后端（Cloudflare Workers）

### 注意
Express.js应用需要转换为Cloudflare Worker格式。我为你创建了一个适配版本。

### 步骤1：配置Worker

1. **登录Wrangler**:
```bash
wrangler login
```
浏览器会自动打开，授权即可。

2. **创建Worker项目**（如果还没创建）:
```bash
cd cloudflare-worker
wrangler init
```

3. **部署Worker**:
```bash
wrangler deploy
```

### 步骤2：设置环境变量

在Cloudflare Dashboard中：
1. 进入 **Workers & Pages** → 选择你的Worker
2. 点击 **Settings** → **Variables**
3. 添加环境变量：
   - `JWT_SECRET`: 你的JWT密钥
   - `JWT_REFRESH_SECRET`: 你的刷新密钥
   - `VOLCENGINE_SECRET_KEY`: 火山引擎密钥

### 步骤3：获取Worker URL

部署成功后，会显示Worker URL，如：
`https://chikawa-api.your-subdomain.workers.dev`

---

## 第三部分：配置前端API端点

部署后端后，需要更新前端代码中的API地址：

1. **找到API配置文件**（通常在 `src/config/` 或 `src/services/`）
2. **更新API基础URL**:
```javascript
// 开发环境
const API_BASE_URL = 'http://localhost:3000';

// 生产环境（使用你的Worker URL）
const API_BASE_URL = 'https://chikawa-api.your-subdomain.workers.dev';
```

或者使用环境变量：
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

在Cloudflare Pages的环境变量中添加：
- `VITE_API_URL`: `https://chikawa-api.your-subdomain.workers.dev`

---

## 快速部署命令

### 前端（自动部署）
推送到GitHub后，Cloudflare Pages会自动部署。

### 后端（手动部署）
```bash
cd cloudflare-worker
wrangler deploy
```

---

## 常见问题

### Q: Worker部署失败？
A: 检查代码是否使用了Node.js特定的API，Cloudflare Workers使用Web标准API。

### Q: 如何查看Worker日志？
A: 在Cloudflare Dashboard → Workers → 选择Worker → Logs

### Q: 如何更新部署？
A: 
- 前端：推送到GitHub自动更新
- 后端：运行 `wrangler deploy`

### Q: CORS错误？
A: 在Worker代码中添加CORS头，或使用Cloudflare的CORS设置。

---

## 下一步

由于Express应用需要适配，我建议：

1. **简单方案**：将后端适配为Cloudflare Worker格式（使用Hono框架）
2. **完整方案**：保持Express，但部署到其他平台（如Railway, Render等）

需要我帮你创建Worker适配版本吗？





