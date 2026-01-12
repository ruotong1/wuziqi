# 🚀 Cloudflare Pages 部署指南

## ✅ 当前状态

- ✅ 代码已推送到GitHub：`ruotong1/wuziqi`
- ✅ 部署分支：`deploy`
- ✅ 本地构建测试通过
- ✅ `_redirects` 文件已配置（用于SPA路由）

---

## 📋 部署步骤

### 第一步：访问Cloudflare Dashboard

1. **打开Cloudflare Dashboard**
   - 直接访问：https://dash.cloudflare.com/7e65cba23ca10d7473c68541885b098c/home/developer-platform
   - 或访问：https://dash.cloudflare.com → 登录 → **Workers & Pages** → **Pages**

### 第二步：创建新项目

1. 点击右上角 **"Create a project"** 按钮
2. 选择 **"Connect to Git"**

### 第三步：授权GitHub（如果还没有）

1. 点击 **"Authorize Cloudflare"** 按钮
2. 选择你的GitHub账号
3. 授权Cloudflare访问仓库权限
4. 如果只需要访问特定仓库，选择 **"Only select repositories"**，然后选择 `ruotong1/wuziqi`

### 第四步：选择仓库和分支

1. 在仓库列表中找到：**`ruotong1/wuziqi`**
2. 点击 **"Begin setup"** 或 **"Set up and deploy"**

### 第五步：配置项目设置

#### 基本信息
- **Project name**: `wuziqi`（或你喜欢的名字，比如 `mermaid-song-app`）
- **Production branch**: `deploy` ⚠️ **重要：选择 `deploy` 分支**

#### 构建设置

**Framework preset**: 选择 **"Vite"**

如果选择Vite，会自动填充：
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`（留空，表示根目录）

如果选择 "None"，手动填写：
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`

#### 环境变量（可选，暂时不需要）

如果需要配置API地址等环境变量，可以稍后在项目设置中添加。

### 第六步：保存并部署

1. 点击 **"Save and Deploy"** 按钮
2. 等待构建过程（通常1-3分钟）
3. 构建过程中可以在页面查看实时日志

### 第七步：部署完成

构建成功后：
- 会显示部署URL，格式类似：`https://wuziqi.pages.dev`
- 点击URL可以访问你的应用
- 可以在 **Deployments** 标签查看所有部署历史

---

## ✅ 部署配置总结

| 配置项 | 值 |
|--------|-----|
| GitHub仓库 | `ruotong1/wuziqi` |
| 分支 | `deploy` |
| Framework preset | `Vite` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

---

## 🔄 后续更新部署

每次推送代码到 `deploy` 分支，Cloudflare Pages会自动重新部署：

```bash
cd "/Users/xianshu/Desktop/cursor zrt"

# 修改代码后
git add .
git commit -m "更新描述"
git push origin deploy
```

部署状态可以在Cloudflare Dashboard的 **Deployments** 标签中查看。

---

## 🆘 常见问题

### Q1: 构建失败怎么办？

**检查构建日志**：
1. 在Cloudflare Dashboard → 项目 → Deployments
2. 点击失败的部署查看日志

**常见原因**：
- 依赖安装失败：检查 `package.json` 是否正确
- 构建命令错误：确保是 `npm run build`
- 输出目录错误：确保是 `dist`

**解决方案**：
- 在本地运行 `npm run build` 测试构建
- 检查构建日志中的具体错误信息

### Q2: 页面404错误（路由不工作）？

确保 `_redirects` 文件在项目根目录且内容正确：

```
/*    /index.html   200
```

这个文件应该会被自动复制到 `dist` 目录。

### Q3: 如何添加自定义域名？

1. 在Cloudflare Dashboard → 项目 → **Custom domains**
2. 点击 **"Set up a custom domain"**
3. 输入你的域名（如：`wuziqi.yourdomain.com`）
4. 按照提示配置DNS记录

### Q4: 如何查看构建日志？

1. 在Cloudflare Dashboard → 项目 → **Deployments**
2. 点击具体的部署
3. 查看 **Build logs** 标签

### Q5: 如何回滚到之前的部署？

1. 在Cloudflare Dashboard → 项目 → **Deployments**
2. 找到想要回滚的部署
3. 点击右侧的 **"..."** 菜单
4. 选择 **"Retry deployment"** 或 **"Create deployment"**

### Q6: 如何配置环境变量？

1. 在Cloudflare Dashboard → 项目 → **Settings** → **Environment variables**
2. 点击 **"Add variable"**
3. 填写：
   - **Variable name**: 例如 `VITE_API_URL`
   - **Value**: 变量值
   - **Environment**: 选择 Production、Preview 或 Both
4. 保存后需要重新部署才会生效

---

## 📝 部署检查清单

- [x] 代码已推送到GitHub（`deploy`分支）
- [x] 本地构建测试通过
- [x] `_redirects` 文件已配置
- [ ] 在Cloudflare创建了Pages项目
- [ ] 连接了GitHub仓库 `ruotong1/wuziqi`
- [ ] 选择了 `deploy` 分支
- [ ] 配置了构建设置（Vite）
- [ ] 点击了 "Save and Deploy"
- [ ] 等待部署完成
- [ ] 测试访问部署的URL
- [ ] 检查路由是否正常工作

---

## 🎯 下一步

部署前端后，如果需要：

1. **配置后端API地址**（如果有后端）
   - 在环境变量中添加 `VITE_API_URL`
   - 重新部署

2. **添加自定义域名**
   - 在Custom domains中配置

3. **配置自定义域名SSL**
   - Cloudflare会自动配置SSL证书

4. **监控和日志**
   - 查看部署状态和构建日志
   - 配置Analytics（如果需要）

---

## 🔗 相关链接

- Cloudflare Dashboard: https://dash.cloudflare.com
- GitHub仓库: https://github.com/ruotong1/wuziqi
- Cloudflare Pages文档: https://developers.cloudflare.com/pages/

---

祝你部署顺利！🎉





