# 上传 server.js 到 GitHub 指南

## ✅ 已完成
- ✅ 初始化 Git 仓库
- ✅ 创建 .gitignore 文件
- ✅ 提交 server.js 和相关文件

## 📋 下一步操作

### 1. 在 GitHub 上创建新仓库

1. 访问 https://github.com 并登录
2. 点击右上角 "+" → "New repository"
3. 填写信息：
   - **Repository name**: `chikawa-video-generator`（或自定义名称）
   - **Description**: `Chikawa风格视频生成器后端服务`
   - 选择 **Public** 或 **Private**
   - ⚠️ **不要勾选** "Initialize this repository with a README"
4. 点击 "Create repository"

### 2. 连接本地仓库到 GitHub

创建仓库后，GitHub 会显示命令。在终端执行：

```bash
cd "/Users/xianshu/Desktop/cursor zrt"

# 添加远程仓库（将 YOUR_USERNAME 和 REPO_NAME 替换为实际值）
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 或者使用 SSH（如果已配置 SSH key）
# git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git

# 查看远程仓库
git remote -v
```

### 3. 推送到 GitHub

```bash
# 重命名分支为 main（GitHub 默认使用 main）
git branch -M main

# 推送到 GitHub
git push -u origin main
```

### 4. 验证

访问你的 GitHub 仓库页面，应该能看到 `chikawa-server/server.js` 文件。

## 🔄 后续更新

如果修改了 server.js，使用以下命令更新：

```bash
cd "/Users/xianshu/Desktop/cursor zrt"

# 查看修改
git status

# 添加修改的文件
git add chikawa-server/server.js

# 提交
git commit -m "更新 server.js: 描述你的修改"

# 推送到 GitHub
git push
```

## 📝 常用 Git 命令

```bash
# 查看状态
git status

# 查看提交历史
git log --oneline

# 查看远程仓库
git remote -v

# 拉取最新代码
git pull

# 查看分支
git branch
```

## ⚠️ 注意事项

1. **不要提交敏感信息**：
   - JWT 密钥
   - 数据库密码
   - API 密钥
   - 使用 `.env` 文件存储，并确保在 `.gitignore` 中

2. **如果遇到认证问题**：
   - 使用 Personal Access Token（GitHub Settings → Developer settings → Personal access tokens）
   - 或配置 SSH key

3. **如果仓库已存在文件**：
   ```bash
   git pull origin main --allow-unrelated-histories
   git push -u origin main
   ```










