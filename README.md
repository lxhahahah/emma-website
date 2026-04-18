# 个人主页

一个简约可爱风格的个人主页，包含介绍和博客功能。

## 功能特性

✨ **简约可爱设计** - 柔和的配色方案和现代化布局  
📝 **个人介绍** - 展示你的故事和专业背景  
📚 **博客系统** - 展示你的文章和思考  
📱 **完全响应式** - 在各种设备上完美展示  
⚡ **零依赖** - 纯 HTML/CSS/JavaScript，无需任何构建工具

## 项目结构

```
personal-website/
├── index.html      # 主页面
├── styles.css      # 样式文件
├── script.js       # 交互脚本
└── README.md       # 说明文档
```

## 快速开始

### 本地运行

1. 克隆或下载这个项目
2. 在项目目录中打开 `index.html` 文件到浏览器
3. 或者使用本地服务器（推荐）：

```bash
# 如果有 Python
python -m http.server 8000

# 或者使用 Node.js 的 http-server
npx http-server
```

然后访问 `http://localhost:8000`

## 自定义内容

### 修改个人信息

编辑 `index.html` 中的以下部分：

- **主标题**: 修改 `<h1 class="hero-title">` 的文本
- **副标题**: 修改 `<p class="hero-subtitle">` 的文本
- **关于我内容**: 修改 "关于" 部分的文本和卡片

### 添加博客文章

编辑 `script.js` 中的 `blogPosts` 数组：

```javascript
const blogPosts = [
    {
        id: 1,
        title: '文章标题',
        date: '2024-04-17',
        emoji: '📱',
        excerpt: '文章摘要'
    },
    // 添加更多文章...
];
```

### 修改颜色主题

编辑 `styles.css` 中的 CSS 变量（根部）：

```css
:root {
    --primary-color: #FF6B9D;      /* 主色调 */
    --secondary-color: #A8D8FF;    /* 次色调 */
    --accent-color: #FFD93D;       /* 强调色 */
    --light-bg: #FFF9F0;           /* 浅色背景 */
}
```

### 修改社交链接

编辑 `index.html` 中的 footer 部分：

```html
<div class="social-links">
    <a href="https://github.com/yourname" class="social-link">GitHub</a>
    <a href="https://twitter.com/yourname" class="social-link">Twitter</a>
    <a href="mailto:your@email.com" class="social-link">Email</a>
</div>
```

## 部署到 GitHub Pages

### 步骤 1: 创建 GitHub 仓库

1. 访问 [GitHub](https://github.com) 并登录
2. 点击 "New" 创建新仓库
3. 仓库名称设为 `<你的用户名>.github.io`
4. 选择 "Public" 并点击 "Create repository"

### 步骤 2: 上传文件

```bash
# 初始化 git 仓库
git init

# 添加文件
git add .

# 提交
git commit -m "Initial commit"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/<你的用户名>/<你的用户名>.github.io.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 步骤 3: 访问你的主页

等待几分钟后，访问 `https://<你的用户名>.github.io` 就能看到你的主页！

## 浏览器兼容性

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT License - 随意使用和修改

## 更多帮助

- 需要帮助？查看 HTML、CSS 和 JavaScript 的注释
- 想要更高级的功能？考虑升级到 Vue.js 或 React 版本

---

**祝你的个人主页创建愉快！** 🎉
