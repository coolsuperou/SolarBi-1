# 登录落地页

## 📁 文件说明

- `login.html` - 登录页面HTML结构
- `login.css` - 样式文件
- `login.js` - 交互逻辑
- `首页素材.gif` - 背景动画素材

## 🎨 设计特性

### 1. 视觉设计
- **动态背景**：使用首页素材.gif作为背景，配合暗色遮罩和渐变叠加
- **玻璃态效果**：登录卡片采用毛玻璃效果（backdrop-filter）
- **霓虹风格**：渐变色Logo、发光按钮和边框
- **深色主题**：深蓝紫色调，符合现代科技感

### 2. 交互特性
- **动画效果**
  - 页面加载淡入动画
  - Logo漂浮动画
  - 按钮悬停发光效果
  - 装饰性圆球漂浮
  - 鼠标视差效果

- **表单功能**
  - 账号密码输入
  - 密码显示/隐藏切换
  - 表单验证
  - 忘记密码链接
  - Apple登录集成
  - 注册提示

- **用户体验**
  - 输入框焦点动画
  - 消息提示（Toast）
  - 防重复提交
  - Enter键快捷提交
  - 响应式设计

### 3. 响应式适配
- **桌面端**：完整UI，最大宽度480px
- **平板**：自适应布局
- **移动端**：优化的触摸体验，调整字体和间距
- **高度适配**：针对不同屏幕高度优化内间距

## 🚀 使用方法

### 直接打开
1. 确保`首页素材.gif`文件在同一目录
2. 双击打开`login.html`即可预览

### 在服务器中使用
```bash
# 使用Python简单服务器
python -m http.server 8000

# 或使用Node.js
npx http-server
```

然后访问 `http://localhost:8000/login.html`

## 🎯 集成到项目

### 1. 集成到现有前端项目

将以下文件复制到项目中：
```
src/pages/Login/
  ├── index.html (login.html)
  ├── styles.css (login.css)
  └── script.js (login.js)
```

### 2. 配置API接口

在`login.js`的表单提交处理中，替换模拟登录为实际API调用：

```javascript
// 找到这段代码（约第36行）
setTimeout(() => {
  // 这里应该是实际的API调用
  console.log('登录信息:', { account, password });
  
  // 替换为：
  fetch('/api/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userAccount: account,
      userPassword: password
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.code === 0) {
      showMessage('登录成功！', 'success');
      setTimeout(() => {
        window.location.href = '/dashboard'; // 跳转到主页
      }, 1000);
    } else {
      showMessage(data.message || '登录失败', 'error');
    }
  })
  .catch(error => {
    showMessage('网络错误，请重试', 'error');
  })
  .finally(() => {
    // 恢复按钮状态
    loginBtn.querySelector('.btn-text').textContent = originalText;
    loginBtn.disabled = false;
    loginBtn.style.opacity = '1';
  });
}, 1500);
```

### 3. 与Spring Boot后端集成

修改跨域配置和API端点：

```javascript
// 在login.js开头添加配置
const API_BASE_URL = 'http://localhost:8080'; // 后端地址

// 然后在fetch中使用
fetch(`${API_BASE_URL}/api/user/login`, {
  // ...
})
```

## 🎨 自定义配置

### 修改主题色
在`login.css`中搜索以下颜色值进行替换：

- **主色调（紫色）**：`#7c3aed`, `#a855f7`
- **强调色（蓝色）**：`#00d4ff`, `#6366f1`
- **成功色（绿色）**：`#22c55e`
- **错误色（红色）**：`#ef4444`

### 修改背景
替换`首页素材.gif`文件，或在CSS中修改：

```css
.background-gif {
  /* 替换为其他图片或视频 */
  background-image: url('your-background.jpg');
}
```

### 修改Logo
在`login.html`中找到SVG logo代码（约第18-33行）进行替换

## 📱 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE11 不支持（需要polyfill）

## 🔧 技术栈

- **HTML5**：语义化标签
- **CSS3**：Grid、Flexbox、动画、滤镜
- **JavaScript (ES6+)**：原生JS，无框架依赖
- **设计理念**：
  - 玻璃态拟态设计
  - 渐变和霓虹效果
  - 微交互动画
  - 响应式布局

## 📝 注意事项

1. **背景文件**：确保`首页素材.gif`文件存在且路径正确
2. **安全性**：实际部署时需要添加HTTPS和CSRF保护
3. **性能**：GIF文件较大，建议优化或转换为视频格式
4. **无障碍**：已添加基础的语义化标签，可进一步增强ARIA支持

## 🎯 待实现功能

- [ ] 记住我功能（localStorage）
- [ ] 多语言支持（i18n）
- [ ] 第三方登录（Google, GitHub等）
- [ ] 双因素认证
- [ ] 验证码集成
- [ ] 密码强度检测
- [ ] 自动填充优化

## 📄 许可证

MIT License



