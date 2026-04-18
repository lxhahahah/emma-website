# ⚡ GitHub Pages 快速部署 (5分钟)

## 🎯 快速步骤

### 1️⃣ 准备 Git 配置 (仅首次)

```bash
# 配置你的信息 (替换为实际信息)
git config --global user.name "Emma"
git config --global user.email "emmaliu8023@gmail.com"
```

### 2️⃣ 创建 GitHub 仓库

访问: https://github.com/new

- 仓库名: `emma-website`
- 选择: **Public**
- ✅ Add a README

点击 **Create repository**

### 3️⃣ 复制仓库链接

创建完成后，你会看到一个像这样的链接:
```
https://github.com/你的用户名/emma-website.git
```

复制这个链接！

### 4️⃣ 在本地推送代码

```bash
cd /tmp/personal-website

git init
git add .
git commit -m "Initial commit"
git remote add origin 这里粘贴你复制的链接
git branch -M main
git push -u origin main
```

系统会要求输入 GitHub 用户名和密码。

### 5️⃣ 启用 GitHub Pages

1. 打开你的仓库: https://github.com/你的用户名/emma-website
2. 点击 **Settings**
3. 左侧菜单 **Pages**
4. Source → Branch: `main`, Folder: `/ (root)`
5. 点击 **Save**

等待 1-2 分钟...

### 6️⃣ 访问你的网站！

你的网站 URL:
```
https://你的用户名.github.io/emma-website/
```

例如: `https://xiaohan.github.io/emma-website/`

---

## ✅ 验证成功

1. 打开上面的 URL
2. 按 F12 看控制台
3. 应该看到: ✅ Firebase 初始化成功
4. 测试发布文章 → 应该正常工作！

---

## 🔄 以后更新网站

```bash
cd /tmp/personal-website
git add .
git commit -m "更新内容"
git push origin main
```

等待 1-2 分钟网站自动更新。

---

## 💡 遇到问题?

**Git 找不到?**
```bash
brew install git
```

**密码不对?**
- 使用 GitHub Personal Access Token
- 设置 → Developer settings → Personal access tokens → Generate new token
- 粘贴 token 代替密码

**网站还是 404?**
- 等待 5 分钟后重新刷新
- 检查 Pages 设置是否正确
- 确认 Branch 是 `main`

---

**就这么简单！你的网站已经在线了！** 🚀
