# 📱 部署到 GitHub Pages - 完整指南

## 🚀 为什么要用 GitHub Pages?

**当前问题**: 本地文件协议 (`file://`) 有安全限制
- ❌ Firebase SDK 加载失败
- ❌ 某些 JavaScript 功能受限
- ❌ 跨域加载失败

**GitHub Pages 解决方案**: 通过 HTTPS 正式部署
- ✅ Firebase 正常工作
- ✅ 全球可访问
- ✅ 免费托管
- ✅ 自动 HTTPS

---

## 📋 前置要求

1. **GitHub 账号**
   - 访问 https://github.com (如果没有则注册)
   - 准备好用户名和密码

2. **Git 命令行工具**
   - 已安装在你的电脑上
   - 验证: 终端输入 `git --version`

---

## 🎯 分步指南

### 步骤 1: 创建 GitHub 仓库

1. 登录 GitHub: https://github.com/login

2. 点击右上角 **+** → **New repository**

3. 填写信息:
   ```
   Repository name: emma-website
   (或其他你喜欢的名字)
   
   Description: Emma's Personal Website (可选)
   
   Public (选择公开)
   ✅ Add a README file
   ✅ Add .gitignore (选择 Node)
   ```

4. 点击 **Create repository**

### 步骤 2: 初始化本地 Git (仅需一次)

在 Mac 终端执行:

```bash
# 进入项目目录
cd /tmp/personal-website

# 初始化 Git
git init

# 配置用户信息 (首次使用 Git)
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Emma's Personal Website"
```

### 步骤 3: 连接到 GitHub 仓库

```bash
# 查看你在 GitHub 创建的仓库的 URL
# 格式: https://github.com/你的用户名/emma-website.git

# 添加远程仓库
git remote add origin https://github.com/你的用户名/emma-website.git

# 重命名分支为 main (GitHub 默认分支)
git branch -M main

# 推送到 GitHub
git push -u origin main

# 系统可能会要求输入 GitHub 用户名和密码
```

### 步骤 4: 启用 GitHub Pages

1. 进入你的仓库: https://github.com/你的用户名/emma-website

2. 点击 **Settings** (设置)

3. 左侧菜单 → **Pages**

4. 在 "Source" 下:
   - Branch: 选择 `main`
   - Folder: 选择 `/ (root)`
   - 点击 **Save**

5. 等待 1-2 分钟，会看到:
   ```
   Your site is published at:
   https://你的用户名.github.io/emma-website/
   ```

### 步骤 5: 验证部署成功

1. 打开上面的 URL (例如: `https://xiaohan.github.io/emma-website/`)

2. 按 F12 打开控制台 → Console 标签

3. 应该看到:
   ```
   ✅ Firebase 初始化成功
   ```

4. 测试发布文章:
   - 点击 "写文章"
   - 填写表单
   - 点击 "发布文章"
   - ✅ 应该正常工作！

---

## 🔄 以后如何更新网站?

每次修改文件后:

```bash
# 进入项目目录
cd /tmp/personal-website

# 查看修改了哪些文件
git status

# 添加所有修改
git add .

# 提交修改 (描述你做了什么)
git commit -m "说明修改内容，例如：修复某个bug或添加新功能"

# 推送到 GitHub
git push origin main

# 等待 1-2 分钟，网站会自动更新
```

---

## 🐛 故障排查

### 问题 1: Git 命令找不到
```bash
# 安装 Git
# Mac: brew install git
# 或访问 https://git-scm.com/download/mac
```

### 问题 2: GitHub 密码过期
```bash
# 使用 Personal Access Token 代替密码
# 1. GitHub 设置 → Developer settings → Personal access tokens
# 2. 生成新 token (勾选 repo)
# 3. 复制 token，粘贴到密码提示框
```

### 问题 3: Pages 显示 404
```
等待 5 分钟后重新刷新
或检查:
1. Repository 设置中 Pages 是否启用
2. Branch 是否设置为 main
3. Folder 是否设置为 / (root)
```

### 问题 4: Firebase 仍然不工作
```
1. 检查 Firebase 规则是否正确
2. 检查 projectId 是否正确
3. 查看浏览器控制台错误信息
```

---

## 📝 快速参考

| 操作 | 命令 |
|------|------|
| 进入项目 | `cd /tmp/personal-website` |
| 查看状态 | `git status` |
| 查看历史 | `git log` |
| 提交修改 | `git commit -m "message"` |
| 推送更新 | `git push origin main` |
| 查看远程 | `git remote -v` |

---

## 🎯 完成后可以做什么?

### 分享网址
你的网站 URL:
```
https://你的用户名.github.io/emma-website/
```

### 自定义域名 (可选)
1. 注册自己的域名 (例如: emma.com)
2. GitHub Pages 设置中配置自定义域名
3. 在域名提供商配置 DNS 指向 GitHub

### 部署其他项目
相同方法可以部署任何静态网站:
- 个人作品集
- 技术博客
- 项目文档
- 等等

---

## 💡 小提示

- **频繁更新**: 尽量一次提交多个修改
- **好的提交信息**: 描述清楚你改了什么
- **隐私**: Public 仓库任何人都能看到源代码
- **备份**: GitHub 自动备份你的代码

---

## 🎉 成功标志

✅ GitHub 仓库已创建  
✅ 文件已推送  
✅ GitHub Pages 已启用  
✅ 网站已上线  
✅ Firebase 正常工作  
✅ 可以发布文章  
✅ 全球可访问  

恭喜！你的个人博客已经在线了！🚀

---

**常见问题**: 部署完成后我的数据会不会丢失?

**答**: 不会! 你的文章数据存储在 Firebase 云端，与网站部署位置无关。
- 本地备份: localStorage
- 云端备份: Firebase Realtime Database
- 双备份保证数据永不丢失

