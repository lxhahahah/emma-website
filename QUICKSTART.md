# ⚡ 快速开始指南

## 5 分钟快速上手

### 步骤 1️⃣：打开网站（选择一种方式）

**方式 A - 直接打开（最简单）**
```bash
open /tmp/personal-website/index.html
```

**方式 B - 本地服务器（推荐）**
```bash
cd /tmp/personal-website
python -m http.server 8000
# 打开浏览器访问 http://localhost:8000
```

### 步骤 2️⃣：探索页面

- 首页：看你的个人介绍
- 关于：了解你的信息和联系方式
- 博客：查看已发布的文章
- 写文章：发布新文章

### 步骤 3️⃣：发布你的第一篇文章

1. 点击导航栏 "写文章"
2. 填写表单：
   ```
   标题：我的第一篇文章
   表情：✨
   内容：这是我的第一篇文章！
   标签：第一篇, 开始
   分组：💭 思考
   ```
3. 点击 "发布文章"
4. 自动跳转到博客页面

### 步骤 4️⃣：查看和编辑

1. 在博客页面点击你的文章卡片
2. 进入文章详情页
3. 点击 "编辑" 修改内容
4. 或点击 "删除" 删除文章

### 步骤 5️⃣：试试新功能

- **关键词云**：向下滚动看关键词分析
- **标签过滤**：点击标签按钮过滤文章
- **搜索**：用搜索框找文章
- **分组**：查看不同分组的文章

## 📋 常用操作

### 发布文章
```
写文章 → 填表单 → 发布
```

### 修改文章
```
博客 → 点击文章 → 编辑按钮 → 修改 → 发布
```

### 删除文章
```
博客 → 点击文章 → 删除按钮 → 确认
```

### 按标签过滤
```
博客 → 点击标签按钮 → 查看过滤结果
```

### 搜索文章
```
博客 → 在搜索框输入 → 查看搜索结果
```

## 🎨 自定义（编辑文件）

### 改你的名字和信息
编辑 `index.html`，找到关于页面：
```html
<h3>Hi, I'm Emma ✨</h3>
<!-- 改成你的信息 -->
```

### 改主题色
编辑 `styles.css`，找到 `:root` 变量：
```css
--primary-color: #E8A0C1;  /* 改这个粉色 */
```

### 改分组类别
编辑 `script.js`，找到 `categoryMap`：
```javascript
const categoryMap = {
    'tech': '💻 技术',
    // 添加你自己的分组...
};
```

## 🔧 配置 Firebase（可选）

如果想跨设备同步文章：

1. 去 https://firebase.google.com 创建项目
2. 启用 Realtime Database
3. 复制配置到 `script.js`
4. 取消注释初始化代码
5. 完成！

详见 `FIREBASE_SETUP.md`

## 📱 在手机上使用

如果用本地服务器：

```bash
# 1. 查看你的 IP
ifconfig | grep "inet "

# 2. 在手机上访问
http://<你的IP>:8000
```

## 💾 备份你的数据

### 导出所有文章
打开浏览器开发工具 (F12)，粘贴：
```javascript
copy(localStorage.getItem('blogPosts'))
```

### 导入数据
粘贴到控制台：
```javascript
localStorage.setItem('blogPosts', '你复制的数据')
```

## 🐛 出问题了？

### 页面白屏
- 检查浏览器控制台 (F12) 看错误信息
- 尝试清空缓存后刷新
- 确认所有文件都在同一目录

### 数据丢失
- 检查是否用了隐私模式（不保存数据）
- 查看浏览器是否清除了存储
- 用 F12 检查 localStorage

### 关键词云不显示
- 确认发布了足够多的文章
- 刷新页面重试
- 检查文章内容长度 (>50 字符)

## 📚 更多文档

- `README.md` - 基础说明
- `v3_FEATURES.md` - 详细功能介绍
- `TESTING_GUIDE.md` - 测试指南
- `CHANGELOG.md` - 版本历史
- `FIREBASE_SETUP.md` - Firebase 配置

## ✨ 下一步

1. ✅ 发布几篇文章测试
2. ✅ 自定义你的信息和颜色
3. ✅ 尝试标签和分组
4. ✅ 观察关键词云分析
5. ✅ 部署到 GitHub Pages 分享给朋友

## 🚀 部署到 GitHub Pages

```bash
# 1. 创建 GitHub 仓库（用你的用户名）
# 仓库名：<username>.github.io

# 2. 上传文件
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<你的用户名>/<你的用户名>.github.io.git
git push -u origin main

# 3. 访问你的网站
# https://<你的用户名>.github.io
```

## 💡 提示

- 文章会自动保存，无需手动保存
- 删除操作无法撤销，谨慎操作
- 关键词云会自动更新
- 标签需要在发布时添加

---

**开始写你的故事吧！** ✍️✨
