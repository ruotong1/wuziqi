# 🚀 Cloudflare Pages 部署步骤

## 当前状态
✅ 代码已准备好提交
✅ 构建配置已就绪
✅ 路由重定向文件已创建

## 部署步骤

### 第一步：推送到GitHub（如果还没推送）

```bash
# 检查是否有远程仓库
git remote -v

# 如果没有远程仓库，需要先添加（替换YOUR_USERNAME和REPO_NAME）
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 推送到GitHub
git push -u origin main
```

### 第二步：在Cloudflare Dashboard部署

1. **访问Cloudflare Dashboard**
   - 打开：https://dash.cloudflare.com/7e65cba23ca10d7473c68541885b098c/home/developer-platform
   - 或直接访问：https://dash.cloudflare.com

2. **进入Pages**
   - 点击左侧菜单 **"Pages"**
   - 如果没有看到，点击 "Workers & Pages" → "Pages"

3. **创建新项目**
   - 点击 **"Create a project"** 按钮
   - 选择 **"Connect to Git"**

4. **授权GitHub**
   - 点击 "Authorize Cloudflare"
   - 授权访问你的GitHub账号
   - 选择要部署的仓库

5. **配置项目设置**
   - **Project name**: `chikawa-app` 或 `mermaid-song-app`
   - **Production branch**: `main`
   - **Framework preset**: 选择 **"Vite"** 或 **"None"**
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` （留空或填 `/`）

6. **环境变量（可选，稍后可以添加）**
   - 如果有API地址需要配置，可以在这里添加
   - 变量名：`VITE_API_URL`
   - 值：你的后端API地址

7. **开始部署**
   - 点击 **"Save and Deploy"**
   - 等待构建完成（大约1-2分钟）

8. **完成**
   - 部署成功后会显示部署URL
   - 格式：`https://your-project-name.pages.dev`
   - 可以点击URL访问你的应用

## 📝 后续更新

每次你推送代码到GitHub的main分支，Cloudflare Pages会自动重新部署！

```bash
git add .
git commit -m "更新内容"
git push
```

## 🔧 自定义域名（可选）

1. 进入你的Pages项目
2. 点击 **"Custom domains"**
3. 添加你的域名
4. 按照提示配置DNS记录

## ⚙️ 环境变量配置

如果需要配置环境变量：

1. 进入项目设置
2. 点击 **"Settings"** → **"Environment variables"**
3. 添加变量：
   - **Variable name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.com`
4. 保存后需要重新部署才会生效

## 📊 查看部署日志

- 进入项目
- 点击 **"Deployments"** 标签
- 点击任意部署查看详细日志

## ✅ 部署检查清单

- [ ] 代码已推送到GitHub
- [ ] 在Cloudflare创建了Pages项目
- [ ] 连接了GitHub仓库
- [ ] 配置了构建设置（Build command: `npm run build`, Output: `dist`）
- [ ] 点击了 "Save and Deploy"
- [ ] 等待部署完成
- [ ] 测试访问部署的URL

