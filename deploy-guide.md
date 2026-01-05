# 🚀 部署指南

## ✅ 项目已构建完成
构建文件位于 `dist/` 目录

## 🎯 推荐部署方式

### 方式一：Vercel（最简单，推荐）

1. **访问**: https://vercel.com
2. **登录**: 使用GitHub账号登录
3. **导入项目**:
   - 点击 "Add New Project"
   - 选择你的GitHub仓库
   - 如果没有仓库，先推送到GitHub
4. **配置**:
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **部署**: 点击 "Deploy"
6. **完成**: 部署完成后会获得一个URL（如：https://your-project.vercel.app）

### 方式二：Netlify

1. **访问**: https://www.netlify.com
2. **登录**: 使用GitHub账号登录
3. **导入项目**:
   - 点击 "Add new site" → "Import an existing project"
   - 连接GitHub仓库
4. **配置**:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **部署**: 点击 "Deploy site"

### 方式三：GitHub Pages

如果项目已经在GitHub上：

```bash
# 安装gh-pages
npm install --save-dev gh-pages

# 在package.json的scripts中添加：
# "predeploy": "npm run build",
# "deploy": "gh-pages -d dist"

# 部署
npm run deploy
```

然后在GitHub仓库设置中启用GitHub Pages。

## 📝 注意事项

- ✅ 已创建 `vercel.json` 和 `netlify.toml` 配置文件（支持React Router路由）
- ✅ 所有路由都会重定向到 index.html（单页应用支持）
- ✅ 项目使用Vite构建，构建后的文件在 `dist/` 目录

## 🔄 更新部署

代码更新后，如果使用Vercel或Netlify：
- 推送到GitHub会自动触发重新部署
- 或者手动在平台触发部署

如果使用GitHub Pages：
```bash
npm run deploy
```
