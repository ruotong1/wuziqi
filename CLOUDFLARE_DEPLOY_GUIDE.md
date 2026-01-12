# 🌐 Cloudflare 部署完整指南

## ⚠️ 重要说明

**后端限制**：你的后端使用Express.js和Node.js原生模块（`https`、`crypto`），**不能直接在Cloudflare Workers上运行**。

**解决方案**：
1. **前端部署到Cloudflare Pages** ✅（可以直接部署）
2. **后端有两个选择**：
   - 选项A：使用其他平台部署后端（推荐：Railway, Render, Fly.io）
   - 选项B：重写后端为Cloudflare Worker兼容格式（需要大量修改）

---

## 🎨 第一部分：部署前端（Cloudflare Pages）

### 步骤1：访问Cloudflare Dashboard
打开：https://dash.cloudflare.com/7e65cba23ca10d7473c68541885b098c/home/developer-platform

### 步骤2：创建Pages项目
1. 点击左侧菜单 **"Pages"**
2. 点击 **"Create a project"**
3. 选择 **"Connect to Git"**
4. 授权GitHub账号并选择你的仓库
   - 如果还没推送到GitHub，先执行：
   ```bash
   git add .
   git commit -m "准备部署"
   git push
   ```

### 步骤3：配置项目
- **Project name**: `chikawa-frontend`
- **Production branch**: `main`
- **Framework preset**: `Vite` 或选择 `None`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` （留空即可）

### 步骤4：环境变量（可选）
如果需要配置API地址，在构建设置中添加：
- 变量名：`VITE_API_URL`
- 值：你的后端API地址（部署后端后再填）

### 步骤5：部署
点击 **"Save and Deploy"**

### 步骤6：完成
等待1-2分钟，部署完成后会显示URL：
`https://chikawa-frontend.pages.dev`

---

## 🔧 第二部分：部署后端

### ⚠️ 由于Express应用的限制，推荐使用其他平台

### 推荐方案：使用 Railway 部署后端（最简单）

1. **访问**: https://railway.app
2. **登录**: 使用GitHub账号
3. **创建项目**: 
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库
4. **配置**:
   - Root Directory: `chikawa-server`
   - Start Command: `npm start`
   - 添加环境变量：
     - `JWT_SECRET`: 你的密钥
     - `JWT_REFRESH_SECRET`: 你的刷新密钥
     - `VOLCENGINE_SECRET_KEY`: 火山引擎密钥
5. **部署**: Railway会自动部署
6. **获取URL**: 部署后会获得URL，如：`https://your-app.railway.app`

---

## 🔄 第三部分：连接前端和后端

部署后端后，更新前端配置：

### 方法1：在Cloudflare Pages中设置环境变量
1. 进入你的Pages项目
2. 点击 **Settings** → **Environment variables**
3. 添加：
   - `VITE_API_URL`: `https://your-backend.railway.app`

### 方法2：修改前端代码
找到API配置文件（通常在 `src/config/` 或 `src/services/`），更新：
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend.railway.app';
```

然后重新推送代码，Cloudflare会自动重新部署。

---

## 📝 快速部署命令总结

### 前端（一次性设置，之后自动）
1. 在Cloudflare Dashboard创建Pages项目
2. 连接GitHub仓库
3. 配置构建设置
4. 之后每次push到GitHub会自动部署

### 后端（使用Railway）
```bash
# 1. 确保代码已推送
git add .
git commit -m "准备部署后端"
git push

# 2. 在Railway网站操作（见上面步骤）
```

---

## 🚀 如果坚持使用Cloudflare Workers

如果你想使用Cloudflare Workers，需要重写后端代码，因为：
- Workers不支持Node.js的`https`模块
- Workers不支持`crypto`的某些方法
- Workers使用Web标准API

需要我帮你创建一个简化版的Worker适配器吗？（功能会受限）

---

## ✅ 推荐部署架构

```
前端: Cloudflare Pages (免费，CDN加速)
后端: Railway/Render (支持Node.js，免费额度)
```

这样组合最稳定、最简单！





