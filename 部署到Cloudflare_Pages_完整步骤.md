# 🚀 部署到 Cloudflare Pages - 完整步骤

## ✅ 第一步：代码已准备好
代码已经提交到本地git仓库。

---

## 📤 第二步：推送到GitHub

### 情况A：如果还没有GitHub仓库

1. **在GitHub创建新仓库**
   - 访问：https://github.com/new
   - Repository name: `mermaid-song-app`（或你喜欢的名字）
   - 选择 Public 或 Private
   - ⚠️ **不要**勾选 "Initialize this repository with a README"
   - 点击 "Create repository"

2. **添加远程仓库并推送**
   ```bash
   cd "/Users/xianshu/Desktop/cursor zrt"
   
   # 添加远程仓库（替换YOUR_USERNAME和REPO_NAME）
   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
   
   # 推送到GitHub
   git push -u origin main
   ```

### 情况B：如果已经有GitHub仓库

```bash
cd "/Users/xianshu/Desktop/cursor zrt"

# 检查远程仓库
git remote -v

# 如果有远程仓库，直接推送
git push -u origin main

# 如果没有，先添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

---

## 🌐 第三步：在Cloudflare Pages部署

### 1. 访问Cloudflare Dashboard
打开：https://dash.cloudflare.com/7e65cba23ca10d7473c68541885b098c/home/developer-platform

或者：
- 访问：https://dash.cloudflare.com
- 登录你的账号
- 点击左侧菜单 **"Workers & Pages"**
- 点击 **"Pages"** 标签

### 2. 创建新项目
- 点击右上角 **"Create a project"** 按钮
- 选择 **"Connect to Git"**

### 3. 授权GitHub
- 如果没有授权，点击 **"Authorize Cloudflare"**
- 选择要授权的GitHub账号
- 授权访问仓库权限

### 4. 选择仓库
- 在仓库列表中找到你的仓库（如：`mermaid-song-app`）
- 点击 **"Begin setup"**

### 5. 配置项目设置

**基本信息：**
- **Project name**: `mermaid-song-app`（会自动填充，可以修改）
- **Production branch**: `main`

**构建设置：**
- **Framework preset**: 选择 **"Vite"** 或 **"None"**
  - 如果选择Vite，会自动填充构建命令
  - 如果选择None，需要手动填写：
    - **Build command**: `npm run build`
    - **Build output directory**: `dist`
- **Root directory**: `/` （留空，表示根目录）

### 6. 环境变量（可选）
如果需要配置环境变量（比如API地址）：
- 点击 **"Add variable"**
- 添加变量：
  - Name: `VITE_API_URL`
  - Value: `https://your-api-url.com`（后端部署后再填）
- 可以稍后在设置中修改

### 7. 开始部署
- 点击 **"Save and Deploy"** 按钮
- 等待构建过程（通常1-2分钟）

### 8. 部署完成
- 构建成功后，会显示部署URL
- 格式：`https://mermaid-song-app.pages.dev`
- 点击URL可以访问你的应用！

---

## ✅ 部署检查清单

- [ ] 代码已提交到本地git（✅ 已完成）
- [ ] GitHub仓库已创建（如果没有）
- [ ] 代码已推送到GitHub
- [ ] 在Cloudflare创建了Pages项目
- [ ] 连接了GitHub仓库
- [ ] 配置了构建设置
- [ ] 点击了 "Save and Deploy"
- [ ] 等待部署完成
- [ ] 测试访问部署的URL

---

## 🔄 后续更新

每次你推送代码到GitHub，Cloudflare Pages会自动重新部署：

```bash
git add .
git commit -m "更新描述"
git push
```

部署状态可以在Cloudflare Dashboard的 "Deployments" 标签中查看。

---

## 🆘 常见问题

### Q: 构建失败？
A: 检查构建日志，通常是因为：
- 依赖未安装（确保package.json正确）
- 构建命令错误
- 输出目录错误

### Q: 页面404错误？
A: 确保 `_redirects` 文件已包含在项目中（✅ 已创建）

### Q: 如何查看构建日志？
A: 在Cloudflare Dashboard → 项目 → Deployments → 点击部署查看日志

### Q: 如何添加自定义域名？
A: 项目设置 → Custom domains → Add custom domain

---

## 📝 下一步

部署前端后，记得：
1. 部署后端（推荐使用Railway）
2. 在Cloudflare Pages的环境变量中配置API地址
3. 重新部署前端以应用环境变量

