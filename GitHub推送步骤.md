# GitHub 推送步骤

## ⚠️ 重要提示

GitHub 从 2021年8月开始**不再支持密码认证**，必须使用 **Personal Access Token (PAT)**。

## 📋 操作步骤

### 步骤 1：在 GitHub 上创建仓库

1. 访问 https://github.com 并登录
2. 点击右上角 "+" → "New repository"
3. 填写信息：
   - **Repository name**: `chikawa1`
   - **Description**: `Chikawa视频生成器后端服务`
   - 选择 **Public** 或 **Private**
   - ⚠️ **不要勾选** "Initialize this repository with a README"
4. 点击 "Create repository"

### 步骤 2：创建 Personal Access Token

1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 填写信息：
   - **Note**: `chikawa1-push`（描述用途）
   - **Expiration**: 选择过期时间（建议 90 days 或 No expiration）
   - **Select scopes**: 勾选 `repo`（完整仓库权限）
4. 点击 "Generate token"
5. ⚠️ **立即复制 token**（格式类似：`ghp_xxxxxxxxxxxxxxxxxxxx`），只显示一次！

### 步骤 3：推送代码

在终端执行以下命令（将 `YOUR_TOKEN` 替换为步骤2中复制的 token）：

```bash
cd "/Users/xianshu/Desktop/cursor zrt"

# 推送代码（使用 token）
git push -u https://YOUR_TOKEN@github.com/1501187653@qq.com/chikawa1.git main
```

或者，先设置远程仓库，然后推送：

```bash
cd "/Users/xianshu/Desktop/cursor zrt"

# 设置远程仓库（使用 token）
git remote set-url origin https://YOUR_TOKEN@github.com/1501187653@qq.com/chikawa1.git

# 推送
git push -u origin main
```

### 步骤 4：验证

访问 https://github.com/1501187653@qq.com/chikawa1 查看是否成功上传。

## 🔐 更安全的方式：使用 SSH Key（推荐）

如果经常推送代码，建议配置 SSH Key：

### 1. 生成 SSH Key

```bash
ssh-keygen -t ed25519 -C "1501187653@qq.com"
# 按 Enter 使用默认路径
# 可以设置密码或直接按 Enter
```

### 2. 复制公钥

```bash
cat ~/.ssh/id_ed25519.pub
# 复制输出的内容
```

### 3. 添加到 GitHub

1. 访问：https://github.com/settings/keys
2. 点击 "New SSH key"
3. 填写：
   - **Title**: `MacBook`（描述）
   - **Key**: 粘贴刚才复制的公钥
4. 点击 "Add SSH key"

### 4. 使用 SSH 推送

```bash
cd "/Users/xianshu/Desktop/cursor zrt"

# 修改远程仓库地址为 SSH
git remote set-url origin git@github.com:1501187653@qq.com/chikawa1.git

# 推送
git push -u origin main
```

## 📝 后续更新

修改代码后，使用以下命令更新：

```bash
cd "/Users/xianshu/Desktop/cursor zrt"

# 查看修改
git status

# 添加修改
git add chikawa-server/server.js

# 提交
git commit -m "更新 server.js"

# 推送
git push
```

## ❓ 常见问题

### Q: 提示 "remote: Support for password authentication was removed"
**A**: 必须使用 Personal Access Token，不能使用密码。

### Q: Token 在哪里查看？
**A**: Token 创建后只显示一次，如果忘记了需要重新创建。

### Q: 如何保存 Token 避免每次都输入？
**A**: 使用 Git Credential Helper：
```bash
git config --global credential.helper osxkeychain
```
然后第一次推送时输入 token，系统会保存。

### Q: 如何撤销已保存的密码？
**A**: 
```bash
git credential-osxkeychain erase
host=github.com
protocol=https
```
然后按 Enter 两次。









