# 🔧 配置Cloudflare Pages路由 - 详细步骤

## ⚠️ 重要说明

我不能直接访问你的账户（出于安全考虑），但我会提供详细的步骤指导。

**好消息**：Cloudflare Pages 的路由配置是自动的！你只需要找到部署URL即可。

---

## 📋 第一步：登录Cloudflare

1. **访问**：https://dash.cloudflare.com
2. **登录**：使用你的账户信息
   - 邮箱：1501187653@qq.com
   - 密码：Zhangruotong1!

---

## 📍 第二步：找到Pages项目

### 方法1：通过导航栏

1. **在左侧导航栏**，找到 **"Workers & Pages"**（工人和页面）
2. **点击展开**
3. **点击 "Pages"**（不是Workers）
4. **在项目列表中**，找到 `wuziqi` 或你创建的项目名

### 方法2：直接访问

直接在浏览器地址栏输入：
```
https://dash.cloudflare.com/pages
```

---

## 🎯 第三步：查看部署URL

进入Pages项目后：

1. **点击项目名称**（如：`wuziqi`）进入项目详情
2. **查看顶部**，你会看到部署URL
   - 格式类似：`https://wuziqi.pages.dev`
   - 或者：`https://wuziqi-xxxxx.pages.dev`

3. **或者在 "Deployments" 标签中查看**
   - 点击 "Deployments" 标签
   - 找到最新的成功部署
   - 部署卡片上会显示URL

---

## ✅ 第四步：测试游戏路由

游戏路由配置是**自动的**，因为我们已经配置了 `_redirects` 文件！

### 测试步骤：

1. **复制部署URL**（例如：`https://wuziqi.pages.dev`）
2. **添加路由路径**：在URL后面加上 `/gomoku`
   ```
   https://wuziqi.pages.dev/gomoku
   ```
3. **在浏览器中打开这个链接**
4. **应该能看到五子棋游戏**

---

## 🔍 如果路由不工作

### 检查1：确认 `_redirects` 文件存在

`_redirects` 文件应该在你的项目根目录，内容为：
```
/*    /index.html   200
```

这个文件应该已经被包含在部署中。

### 检查2：查看部署日志

1. 在Pages项目页面，点击 **"Deployments"** 标签
2. 查看最新部署的构建日志
3. 确认构建成功，`_redirects` 文件被包含

### 检查3：检查文件是否在dist目录

如果本地测试，确认构建后 `dist/_redirects` 文件存在。

---

## 🛠️ 如果路由真的不工作（很少见）

### 手动配置（通常不需要）

1. **进入项目 Settings**
   - 在Pages项目页面，点击 **"Settings"** 标签
   - 找到 **"Builds & deployments"**

2. **检查构建输出目录**
   - **Build output directory** 应该是：`dist`
   - 确认构建配置正确

3. **检查框架预设**
   - **Framework preset** 应该是：`Vite` 或 `None`
   - 这通常自动配置

---

## 🎮 完整的游戏访问URL

找到部署URL后，游戏链接格式：

```
https://你的项目名.pages.dev/gomoku
```

例如：
```
https://wuziqi.pages.dev/gomoku
```

---

## 📝 检查清单

按照以下清单操作：

- [ ] 已登录Cloudflare Dashboard
- [ ] 已切换到Pages（不是Workers）
- [ ] 找到了 `wuziqi` 项目
- [ ] 看到了部署URL
- [ ] 测试访问 `/gomoku` 路由
- [ ] 游戏可以正常加载

---

## 🆘 常见问题

### Q: 找不到Pages选项？

**A**: 确认你登录的是正确的账户，Pages是免费功能，所有账户都有。

### Q: 项目列表是空的？

**A**: 可能还没有创建Pages项目，或者项目在不同的账户下。

### Q: 部署URL显示404？

**A**: 
1. 确认项目已经成功部署（查看Deployments）
2. 确认路由路径正确：`/gomoku`
3. 尝试访问根路径：`/`（应该能看到应用的首页）

### Q: 路由不工作？

**A**: 
1. 确认 `_redirects` 文件在项目中
2. 重新部署项目（推送代码到GitHub会自动触发）
3. 清除浏览器缓存后重试

---

## 🚀 快速操作步骤总结

1. **登录**：https://dash.cloudflare.com
2. **导航**：Workers & Pages → Pages
3. **找到项目**：点击 `wuziqi`
4. **复制URL**：部署URL（如：`https://wuziqi.pages.dev`）
5. **访问游戏**：URL + `/gomoku`
6. **分享给朋友**：把游戏链接发给朋友

---

**重要提示**：Cloudflare Pages 的 SPA 路由是自动处理的，只要 `_redirects` 文件存在，路由就会正常工作！





