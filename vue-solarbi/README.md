# Vue SolarBi - 工具制造电能数据平台

基于 Vue 3 + TypeScript + Bootstrap 5 构建的现代化电能数据监控系统。

## ✨ 特性

- 🚀 **Vue 3** + **TypeScript** + **Vite** 现代化技术栈
- 🎨 **Bootstrap 5** 响应式UI框架
- 📊 **ECharts** 专业图表库
- 🔧 **Pinia** 状态管理
- 🛡️ **Vue Router** 路由管理
- 🌙 **科技感深色主题** 参考原项目设计
- 📱 **完全响应式** 支持移动端

## 🔧 技术栈

### 前端框架
- Vue 3.4+ (Composition API)
- TypeScript 5.0+
- Vite 5.0+

### UI组件
- Bootstrap 5.3+
- Bootstrap Icons
- 自定义科技感主题

### 图表可视化
- ECharts 5.6+
- Vue-ECharts

### 工具库
- Axios (HTTP客户端)
- Moment.js (时间处理)
- Lodash-ES (工具函数)

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0 或 pnpm >= 7.0.0

### 安装依赖
```bash
# 使用 npm
npm install

# 使用 yarn
yarn install

# 使用 pnpm
pnpm install
```

### 启动开发服务器
```bash
# 使用 npm
npm run dev

# 使用 yarn
yarn dev

# 使用 pnpm
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本
```bash
# 使用 npm
npm run build

# 使用 yarn
yarn build

# 使用 pnpm
pnpm build
```

## 📁 项目结构

```
vue-solarbi/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API接口
│   ├── components/        # 通用组件
│   ├── layouts/           # 布局组件
│   ├── router/            # 路由配置
│   ├── stores/            # Pinia状态管理
│   ├── styles/            # 样式文件
│   ├── types/             # TypeScript类型定义
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── index.html             # HTML模板
├── package.json           # 依赖配置
├── tsconfig.json          # TypeScript配置
├── vite.config.ts         # Vite配置
└── README.md              # 项目说明
```

## 🎯 主要功能

### 1. 用户认证
- 登录/登出
- 权限管理（管理员/普通用户）
- 路由守卫

### 2. 电能监控
- 实时数据展示
- 统计卡片
- 趋势图表（小时/日模式）
- 数据表格
- 时间范围筛选

### 3. 用户管理（管理员权限）
- 用户列表
- 新增/编辑用户
- 用户状态管理
- 数据搜索和筛选

### 4. 系统特性
- 响应式设计
- 科技感UI主题
- 发光效果
- 暗色模式
- 加载状态
- 错误处理

## 🎨 设计特色

### 科技感主题
- 深色背景渐变
- 蓝色发光效果
- 网格背景纹理
- 粒子动画效果

### 响应式设计
- 移动端适配
- 平板端优化
- 桌面端体验

### 交互体验
- 平滑过渡动画
- 悬停效果
- 加载指示器
- 用户反馈

## 🔌 API接口

项目使用模拟数据进行演示。在实际部署时，需要：

1. 配置 `.env` 文件中的 `VITE_API_BASE_URL`
2. 替换 `src/api/` 目录下的API接口实现
3. 调整数据类型定义

## 📊 数据流

```
用户操作 -> Vue组件 -> Pinia Store -> API服务 -> 后端接口
                ↓
           UI更新 <- 数据响应 <- HTTP响应 <- 数据处理
```

## 🛠️ 开发指南

### 组件开发
- 使用 Composition API
- TypeScript 类型安全
- Props 验证
- Emit 事件

### 样式规范
- SCSS 变量管理
- BEM 命名规范
- 响应式断点
- 主题色彩系统

### 状态管理
- Pinia stores
- 模块化管理
- 持久化存储
- 类型定义

## 🚀 部署

### 开发环境
```bash
npm run dev
```

### 生产构建
```bash
npm run build
npm run preview
```

### Docker部署
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系

如有问题或建议，请创建 Issue 或联系开发团队。
