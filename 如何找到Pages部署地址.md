# 🔍 如何找到Cloudflare Pages部署地址

## ⚠️ 重要提示

你当前在 **Cloudflare Workers** 页面，但五子棋游戏部署在 **Cloudflare Pages**！

需要切换到 Pages 才能找到游戏地址。

---

## 📍 正确步骤

### 步骤1：切换到Pages

1. **在左侧导航栏中找到 "工人和页面" (Workers & Pages)**
2. **点击展开它**
3. **找到 "Pages" 标签或选项**（不是Workers）
4. **点击 "Pages"**

或者：

1. **直接访问Pages页面**
   - 在左侧导航中寻找 "Pages" 选项
   - 或者在URL栏输入：`https://dash.cloudflare.com/7e65cba23ca10d7473c68541885b098c/pages`

### 步骤2：找到你的项目

1. **在Pages列表中**，找到你的项目
   - 项目名称可能是：`wuziqi` 或你在创建时设置的名字
   - 如果列表中有多个项目，找到包含五子棋的那个

2. **点击项目名称**进入项目详情页

### 步骤3：查看部署URL

在项目详情页中，你会看到：

1. **顶部显示部署URL**
   - 格式类似：`https://wuziqi.pages.dev`
   - 或者：`https://wuziqi-xxxxx.pages.dev`

2. **或者在 "Deployments" 标签中查看**
   - 点击 "Deployments" 标签
   - 找到最新的部署
   - 点击部署，查看URL

### 步骤4：获取游戏链接

游戏链接 = **部署URL + `/gomoku`**

例如：
```
部署URL: https://wuziqi.pages.dev
游戏链接: https://wuziqi.pages.dev/gomoku
```

---

## 🔄 快速导航路径

```
Cloudflare Dashboard
  └── Workers & Pages (左侧导航)
      └── Pages ← 点击这里！
          └── wuziqi (你的项目)
              └── 查看URL或进入Deployments
```

---

## 📋 区别说明

| 类型 | 你当前的位置 | 应该去的位置 |
|------|------------|------------|
| **Workers** | ✅ 你现在在这里 | ❌ 不对 |
| **Pages** | ❌ 需要切换 | ✅ 应该去这里 |

---

## 🎯 快速查找方法

### 方法1：通过左侧导航

1. 看左侧导航栏
2. 找到 "工人和页面" (Workers & Pages)
3. 展开后应该能看到两个选项：
   - Workers（你现在的位置）
   - **Pages** ← 点击这个！

### 方法2：直接搜索

1. 在左侧导航的搜索框输入 "Pages"
2. 点击搜索结果中的 "Pages"

### 方法3：通过URL

直接访问（替换你的账号ID）：
```
https://dash.cloudflare.com/7e65cba23ca10d7473c68541885b098c/pages
```

---

## ✅ 找到后应该看到

在Pages页面，你应该看到：
- ✅ 项目列表（包含 `wuziqi` 或你的项目名）
- ✅ 每个项目旁边有URL显示
- ✅ 可以点击项目进入详情

在项目详情页，你应该看到：
- ✅ 项目名称
- ✅ 部署URL（通常在顶部）
- ✅ Deployments标签（查看部署历史）
- ✅ Settings标签（项目设置）

---

## 🆘 如果找不到Pages选项

可能的原因：
1. **账号权限问题**：确认你有Pages访问权限
2. **还未创建Pages项目**：如果之前只创建了Workers，需要创建Pages项目
3. **界面版本不同**：某些账号界面可能略有不同

**解决方案**：
- 尝试直接访问URL：`https://dash.cloudflare.com/7e65cba23ca10d7473c68541885b098c/pages`
- 或者在左侧导航仔细查找 "Pages" 选项

---

## 🎮 找到URL后

一旦找到Pages部署URL，游戏链接格式为：
```
https://你的项目名.pages.dev/gomoku
```

然后就可以分享给朋友了！

---

**提示**：Workers和Pages是不同的服务。五子棋是前端应用，应该部署在Pages上。





