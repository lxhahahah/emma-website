# Firebase 配置指南

这个个人主页支持 Firebase 实时数据库来持久化存储你的博客文章。按照以下步骤设置 Firebase。

## 第一步：创建 Firebase 项目

1. 访问 [Firebase 控制台](https://console.firebase.google.com/)
2. 使用 Google 账号登录
3. 点击 "新建项目"
4. 输入项目名称（如 "Emma-PersonalWebsite"）
5. 选择创建项目，等待项目创建完成

## 第二步：启用 Realtime Database

1. 在 Firebase 控制台左侧菜单中，找到 "构建" → "Realtime Database"
2. 点击 "创建数据库"
3. 选择数据库位置（离你最近的地区）
4. **选择"以测试模式启动"**（生产环境需要配置安全规则）
5. 点击"启用"

## 第三步：获取 Firebase 配置

1. 在 Firebase 控制台主页，点击 "设置" → "项目设置"
2. 下滑到 "你的应用" 部分
3. 如果还没有应用，点击 "</> 网络应用" 图标添加应用
4. 复制整个配置对象，看起来像这样：

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyDx...",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

## 第四步：配置个人主页

1. 打开项目文件中的 `firebase-config.js`
2. 将你的 Firebase 配置替换掉 `firebaseConfig` 对象中的值
3. 取消注释初始化代码：

```javascript
try {
    firebase.initializeApp(firebaseConfig);
    window.database = firebase.database();
    window.firebaseEnabled = true;
} catch (error) {
    console.warn('Firebase 初始化失败:', error);
    window.firebaseEnabled = false;
}
```

4. 保存文件

## 第五步：配置数据库规则（重要！）

为了让网站能够读写数据，你需要配置数据库规则：

1. 在 Firebase 控制台，进入 "Realtime Database"
2. 点击 "规则" 标签
3. 粘贴以下规则（仅用于开发/演示）：

```json
{
  "rules": {
    "posts": {
      ".read": true,
      ".write": true
    }
  }
}
```

⚠️ **安全提示**：这个规则允许任何人读写数据。对于生产应用，应该实现更严格的安全规则。

4. 点击 "发布"

## 测试 Firebase 集成

1. 打开个人主页
2. 进入 "写文章" 页面
3. 发布一篇文章
4. 回到控制台的 Realtime Database 查看
5. 你应该能看到新文章已保存到 `posts` 节点

## 常见问题

### 1. 我看不到我的文章被保存
- 检查浏览器控制台是否有错误（F12 → Console）
- 确保 Firebase 配置正确
- 验证数据库规则已发布
- 文章会保存到本地存储作为备份

### 2. 如何在不同设备上共享文章？
- 使用相同的 Firebase 项目
- 所有设备都会自动同步数据
- 这就是 Realtime Database 的强大之处！

### 3. 我的数据安全吗？
- 对于个人使用，这个设置是安全的
- 对于公开应用，应该实现用户认证和更细粒度的规则
- Firebase 提供了强大的安全功能

### 4. 如何备份我的数据？
- Firebase 控制台提供了导出功能
- 你也可以在设置中启用自动备份

## 部署到 GitHub Pages 后

如果你把这个网站部署到 GitHub Pages，Firebase 配置仍然有效。你的数据将持久化存储在 Firebase 上，可以从任何地方访问。

## 更多资源

- [Firebase 文档](https://firebase.google.com/docs)
- [Realtime Database 指南](https://firebase.google.com/docs/database)
- [Web 安全规则](https://firebase.google.com/docs/database/security)

祝你使用愉快！ 🚀
