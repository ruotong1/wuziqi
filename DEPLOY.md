# 部署指南

项目已构建完成，`dist` 目录包含所有静态文件。

## 快速部署方式

### 方式一：使用 Vercel（推荐，最简单）

1. 安装 Vercel CLI（如果还没安装）:
```bash
npm i -g vercel
```

2. 在项目根目录运行:
```bash
vercel
```

3. 按照提示操作，选择默认设置即可。

4. 或者直接访问 https://vercel.com，使用GitHub账号登录，导入项目，自动部署。

### 方式二：使用 Netlify

1. 访问 https://www.netlify.com
2. 使用GitHub账号登录
3. 点击 "Add new site" -> "Import an existing project"
4. 连接你的GitHub仓库
5. 构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
6. 点击 "Deploy site"

### 方式三：使用 GitHub Pages

1. 安装 gh-pages:
```bash
npm install --save-dev gh-pages
```

2. 在 package.json 的 scripts 中添加:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

3. 运行部署:
```bash
npm run deploy
```

4. 在GitHub仓库设置中启用GitHub Pages，选择 gh-pages 分支。

### 方式四：使用 Cloudflare Pages

1. 访问 https://pages.cloudflare.com
2. 使用GitHub账号登录
3. 连接仓库
4. 构建设置：
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`

## 手动部署

如果你有自己的服务器，可以将 `dist` 目录的内容上传到服务器的静态文件目录（如 nginx 的 html 目录）。

## 注意事项

- 确保所有路由都能正常工作（React Router 需要服务器配置支持）
- 如果使用单页应用，服务器需要配置重定向所有路由到 index.html
- Vercel 和 Netlify 会自动处理路由配置





