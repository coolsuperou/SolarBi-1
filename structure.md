# SolarBi 智能能源监控系统 - 项目结构文档

> **版本**: 1.0.0  
> **最后更新**: 2025-10-10  
> **项目类型**: 全栈 Web 应用 (前后端分离)

---

## 📋 目录

- [1. 项目概述](#1-项目概述)
- [2. 技术栈](#2-技术栈)
- [3. 系统架构](#3-系统架构)
- [4. 目录结构](#4-目录结构)
- [5. 核心模块](#5-核心模块)
- [6. 数据流程](#6-数据流程)
- [7. 开发规范](#7-开发规范)
- [8. 部署架构](#8-部署架构)

---

## 1. 项目概述

### 1.1 项目简介

**SolarBi** 是一个基于 Spring Boot + React 的企业级智能能源监控与数据分析系统，专注于工业场景下的实时能耗监控、数据统计与可视化展示。

### 1.2 核心功能

| 功能模块 | 描述 |
|---------|------|
| **能耗监控** | 实时监控27个车间/区域的能耗数据 |
| **统计分析** | 月度能耗统计、日度（24小时）能耗统计 |
| **数据可视化** | ECharts/Highcharts 图表展示趋势与对比 |
| **用户管理** | RBAC 权限控制、页面级访问控制 |
| **多数据源** | 支持 MySQL (用户/权限) + SQL Server (能耗数据) |
| **缓存优化** | Redis 缓存 + 趋势数据预加载 |

### 1.3 业务场景

- **监控对象**: 27个生产车间/公共区域 (包括配料、造粒、烧结、注射等工艺环节)
- **数据来源**: `TempMonitor` 表 (SQL Server)，存储实时采集的电能数据
- **统计维度**: 月度统计、日度（7:00-次日7:00）小时级统计
- **用户角色**: 管理员 (admin) / 普通用户 (user)

---

## 2. 技术栈

### 2.1 前端技术栈

```yaml
框架: React 18.2.0
UI库: Ant Design 5.2.2 + Ant Design Pro Components
路由: @umijs/max 4.0.52 (Umi.js)
图表: 
  - ECharts 5.6.0
  - Highcharts 12.3.0
  - @ant-design/plots 2.6.3
语言: TypeScript 4.9.5
构建: Umi.js (Webpack)
状态管理: React Hooks + Umi Model
HTTP客户端: @umijs/max request (基于 axios)
```

**关键依赖**:
- `@ant-design/pro-components`: ProTable、ProForm 等高级组件
- `echarts-for-react`: ECharts React 封装
- `moment`: 时间处理
- `lodash`: 工具函数库

### 2.2 后端技术栈

```yaml
框架: Spring Boot 2.7.2
持久层: MyBatis-Plus 3.5.2 + MyBatis 2.2.2
数据库: 
  - MySQL 5.7.40 (主数据源 - 用户/权限)
  - SQL Server (辅助数据源 - 能耗数据)
缓存: Redis + Redisson 3.21.3
API文档: Knife4j 4.4.0 (Swagger3)
工具库: 
  - Hutool 5.8.8
  - Apache Commons Lang3
  - Lombok
语言: Java 8
构建: Maven 3.x
```

**核心特性**:
- **多数据源**: HikariCP 连接池 + 双数据源配置
- **分布式锁**: Redisson 实现限流
- **AOP增强**: 权限校验 (@AuthCheck)、日志拦截
- **异步处理**: ThreadPoolExecutor 配置

---

## 3. 系统架构

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      用户浏览器 (Browser)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   前端应用 (React + Umi.js)                   │
│  ┌──────────────┬──────────────┬──────────────┬────────────┐ │
│  │ Pages        │ Components   │ Services     │ Styles     │ │
│  │ (27个车间页面)│ (图表/表格)   │ (API调用)    │ (主题样式)  │ │
│  └──────────────┴──────────────┴──────────────┴────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │ RESTful API (JSON)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               后端应用 (Spring Boot + MyBatis-Plus)           │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Controller 层 (28个业务控制器 + 用户/权限控制器)            ││
│  └───────────────────────┬──────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Service 层 (业务逻辑 + 能耗计算工具类)                      ││
│  └───────────────────────┬──────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Mapper 层 (MyBatis-Plus + XML映射文件)                     ││
│  └───────────────────────┬──────────────────────────────────┘│
└──────────────────────────┼──────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                                 ▼
┌─────────────────────┐         ┌─────────────────────┐
│   MySQL 5.7.40      │         │   SQL Server        │
│  (主数据源)          │         │  (辅助数据源)         │
│  - user 表          │         │  - TempMonitor 表    │
│  - 权限数据          │         │  - 能耗实时数据        │
└─────────────────────┘         └─────────────────────┘
          │
          ▼
┌─────────────────────┐
│   Redis 缓存        │
│  - Session存储      │
│  - 趋势数据缓存      │
│  - 限流计数器        │
└─────────────────────┘
```

### 3.2 前端架构分层

```
front/
├── src/
│   ├── pages/               # 页面层 (视图组件)
│   │   ├── MonthlyEnergy/   # 月度能耗统计
│   │   ├── HourlyEnergy/    # 日度能耗统计
│   │   ├── UserManagement/  # 用户管理
│   │   └── [27个车间页面]/   # 各车间监控页面
│   │       ├── index.tsx     # 主页面组件
│   │       ├── config/       # 配置 (时间格式、阈值)
│   │       └── components/   # 子组件 (图表、表格、筛选器)
│   ├── services/            # API服务层 (与后端通信)
│   ├── components/          # 全局组件 (Header、Sidebar、Footer)
│   ├── styles/              # 主题样式 (暗黑主题、响应式)
│   ├── access.ts            # 权限控制逻辑
│   ├── app.tsx              # 全局配置
│   └── requestConfig.ts     # HTTP请求拦截器
├── config/
│   ├── routes.ts            # 路由配置
│   ├── config.ts            # 全局配置
│   └── proxy.ts             # 开发代理配置
└── package.json
```

### 3.3 后端架构分层

```
back2/
├── src/main/java/com/yupi/springbootinit/
│   ├── controller/          # 控制器层 (HTTP接口)
│   │   ├── UserController.java
│   │   ├── MonthlyEnergyController.java
│   │   ├── HourlyEnergyController.java
│   │   └── [27个车间Controller]
│   ├── service/             # 服务层 (业务逻辑)
│   │   ├── impl/            # 服务实现类
│   │   ├── cache/           # 缓存服务
│   │   └── UserService.java
│   ├── mapper/              # 数据访问层
│   │   ├── mysql/           # MySQL Mapper
│   │   └── sqlserver/       # SQL Server Mapper
│   ├── model/               # 数据模型
│   │   ├── entity/          # 实体类 (User, TempMonitor)
│   │   ├── dto/             # 数据传输对象
│   │   ├── vo/              # 视图对象
│   │   └── enums/           # 枚举类
│   ├── utils/               # 工具类
│   │   ├── EnergyCalculationUtils.java  # 能耗计算核心工具
│   │   ├── SqlUtils.java
│   │   └── NetUtils.java
│   ├── config/              # 配置类
│   │   ├── PrimaryDataSourceConfig.java    # MySQL配置
│   │   ├── SecondaryDataSourceConfig.java  # SQL Server配置
│   │   ├── RedissonConfig.java
│   │   └── CorsConfig.java
│   ├── aop/                 # AOP切面
│   │   ├── AuthInterceptor.java  # 权限拦截器
│   │   └── LogInterceptor.java   # 日志拦截器
│   ├── annotation/          # 自定义注解
│   │   └── AuthCheck.java   # 权限校验注解
│   ├── exception/           # 异常处理
│   │   ├── BusinessException.java
│   │   └── GlobalExceptionHandler.java
│   └── common/              # 公共类
│       ├── BaseResponse.java
│       ├── ErrorCode.java
│       └── ResultUtils.java
├── src/main/resources/
│   ├── mapper/              # MyBatis XML映射文件
│   │   ├── sqlserver/       # SQL Server映射
│   │   └── UserMapper.xml   # MySQL映射
│   ├── application.yml      # 主配置文件
│   ├── application-dev.yml  # 开发环境配置
│   ├── application-prod.yml # 生产环境配置
│   └── templates/           # FreeMarker模板
├── pom.xml
└── Dockerfile
```

---

## 4. 目录结构

### 4.1 前端目录详解

```
front/
├── .idea/                   # IntelliJ IDEA 配置
├── .umi/                    # Umi 构建缓存 (自动生成)
├── config/                  # 项目配置
│   ├── config.ts            # 全局配置 (标题、主题、布局)
│   ├── defaultSettings.ts   # 默认设置
│   ├── proxy.ts             # 开发代理 (/api -> http://localhost:8101)
│   └── routes.ts            # 路由配置 (30+ 路由)
├── dist/                    # 生产构建输出
├── node_modules/            # 依赖包
├── public/                  # 静态资源
│   ├── favicon.ico
│   ├── logo.svg
│   └── solarlogo.png
├── src/
│   ├── access.ts            # 权限判断 (canAdmin, canUser)
│   ├── app.tsx              # 运行时配置 (请求拦截、错误处理)
│   ├── global.less          # 全局样式
│   ├── global.tsx           # 全局TS配置
│   ├── requestConfig.ts     # 请求/响应拦截器
│   ├── typings.d.ts         # TypeScript 类型声明
│   ├── assets/              # 资源文件
│   │   └── logo.png
│   ├── components/          # 全局组件
│   │   ├── Footer/          # 页脚
│   │   ├── HeaderDropdown/  # 头部下拉菜单
│   │   └── RightContent/    # 头部右侧内容 (用户头像)
│   ├── constants/           # 常量定义
│   │   └── index.ts
│   ├── pages/               # 页面组件 (按业务模块分类)
│   │   ├── 404.tsx          # 404页面
│   │   ├── User/Login/      # 登录页
│   │   ├── Admin/User/      # 管理员用户管理
│   │   ├── MonthlyEnergy/   # 月度能耗统计
│   │   │   ├── index.tsx    # 页面主组件
│   │   │   ├── config.ts    # 配置 (阈值、颜色)
│   │   │   └── styles.css   # 样式
│   │   ├── HourlyEnergy/    # 日度能耗统计 (24小时)
│   │   │   ├── index.tsx
│   │   │   ├── config.ts
│   │   │   └── styles.css
│   │   ├── UserManagement/  # 用户管理系统 (新)
│   │   │   ├── index.tsx
│   │   │   └── styles.css
│   │   └── [车间监控页面]/   # 27个车间/区域页面 (结构相同)
│   │       ├── index.tsx     # 主页面 (数据加载、状态管理)
│   │       ├── config/       # 配置目录
│   │       │   ├── timeFormats.ts    # 时间格式配置
│   │       │   └── chartConfig.tsx   # 图表配置
│   │       ├── components/   # 组件目录
│   │       │   ├── ChartSection.tsx  # 图表区域
│   │       │   ├── TableSection.tsx  # 表格区域
│   │       │   ├── FilterSection.tsx # 筛选器
│   │       │   ├── TrendChart.tsx    # 趋势图
│   │       │   └── CompareChart.tsx  # 对比图
│   │       └── hooks/        # 自定义Hooks (可选)
│   ├── services/            # API服务 (自动生成 + 手动扩展)
│   │   └── SolarBi-front/   # API命名空间
│   │       ├── index.ts     # 导出所有API
│   │       ├── typings.d.ts # API类型声明
│   │       ├── userController.ts          # 用户API
│   │       ├── monthlyEnergyController.ts # 月度能耗API
│   │       ├── hourlyEnergyController.ts  # 日度能耗API
│   │       └── [27个车间Controller].ts     # 车间API
│   └── styles/              # 全局样式模块
│       ├── darkTheme.ts     # 暗黑主题
│       ├── techTheme.ts     # 科技主题
│       ├── pageStyles.ts    # 页面通用样式
│       ├── tableStyles.ts   # 表格样式
│       └── responsiveStyles.ts # 响应式样式
├── .editorconfig            # 编辑器配置
├── .eslintrc.js             # ESLint 配置
├── .prettierrc.js           # Prettier 配置
├── jsconfig.json            # JS编译配置
├── tsconfig.json            # TypeScript 配置
├── package.json             # 依赖配置
└── README.md
```

**关键页面说明**:

| 页面目录 | 业务含义 | 数据来源 |
|---------|---------|---------|
| `MonthlyEnergy/` | 月度能耗统计 | `/monthly/statistics` API |
| `HourlyEnergy/` | 日度24小时能耗统计 | `/hourly/statistics` API |
| `UserManagement/` | 用户管理 (新) | `/user/update`, `/user/get` |
| `AirConditioning/` | 114_空调水机主机 | `/airConditioning/*` API |
| `Injection110/` | 110注射车间 | `/injection110/*` API |
| `Granule102/` | 102造粒车间 | `/granule102/*` API |
| ...其他24个车间 | 生产区域监控 | 对应 Controller API |

### 4.2 后端目录详解

```
back2/
├── .idea/                   # IntelliJ IDEA 配置
├── .mvn/                    # Maven Wrapper
├── doc/                     # 文档
│   └── swagger.png
├── sql/                     # SQL脚本
│   ├── create_table_SolarBi.sql        # MySQL 建表脚本
│   ├── create_table_SolarBi_sqlserver.sql  # SQL Server 脚本
│   └── post_es_mapping.json
├── src/
│   ├── main/
│   │   ├── java/com/yupi/springbootinit/
│   │   │   ├── MainApplication.java    # 启动类
│   │   │   ├── annotation/             # 自定义注解
│   │   │   │   └── AuthCheck.java      # 权限校验注解 (@AuthCheck(mustRole = "admin"))
│   │   │   ├── aop/                    # AOP切面
│   │   │   │   ├── AuthInterceptor.java  # 权限拦截器
│   │   │   │   └── LogInterceptor.java   # 日志拦截器
│   │   │   ├── bizmq/                  # 消息队列 (预留)
│   │   │   ├── cache/                  # 缓存服务
│   │   │   │   └── RedisTrendRepository.java  # Redis趋势数据缓存
│   │   │   ├── common/                 # 公共类
│   │   │   │   ├── BaseResponse.java   # 统一响应体
│   │   │   │   ├── ErrorCode.java      # 错误码枚举
│   │   │   │   ├── ResultUtils.java    # 结果封装工具
│   │   │   │   ├── DeleteRequest.java  # 删除请求DTO
│   │   │   │   └── PageRequest.java    # 分页请求DTO
│   │   │   ├── config/                 # 配置类
│   │   │   │   ├── PrimaryDataSourceConfig.java    # MySQL 数据源配置
│   │   │   │   ├── SecondaryDataSourceConfig.java  # SQL Server 数据源配置
│   │   │   │   ├── MyBatisPlusConfig.java          # MyBatis-Plus 配置
│   │   │   │   ├── RedissonConfig.java             # Redisson 配置
│   │   │   │   ├── CorsConfig.java                 # 跨域配置
│   │   │   │   ├── JsonConfig.java                 # JSON序列化配置
│   │   │   │   ├── CacheConfig.java                # 缓存配置
│   │   │   │   ├── ThreadPoolExecutorConfig.java   # 线程池配置
│   │   │   │   └── EnergyTimeConfig.java           # 能耗时间配置
│   │   │   ├── constant/               # 常量类
│   │   │   │   ├── CommonConstant.java  # 通用常量
│   │   │   │   └── UserConstant.java    # 用户常量
│   │   │   ├── controller/             # 控制器层 (29个)
│   │   │   │   ├── UserController.java              # 用户管理
│   │   │   │   ├── MonthlyEnergyController.java     # 月度能耗
│   │   │   │   ├── HourlyEnergyController.java      # 日度能耗
│   │   │   │   ├── AirConditioningController.java   # 114_空调
│   │   │   │   ├── Injection110Controller.java      # 110注射
│   │   │   │   ├── Granule102Controller.java        # 102造粒
│   │   │   │   └── [24个其他车间Controller]
│   │   │   ├── esdao/                  # ElasticSearch DAO (预留)
│   │   │   ├── exception/              # 异常处理
│   │   │   │   ├── BusinessException.java           # 业务异常
│   │   │   │   ├── GlobalExceptionHandler.java      # 全局异常处理器
│   │   │   │   └── ThrowUtils.java                  # 异常抛出工具
│   │   │   ├── generate/               # 代码生成器
│   │   │   │   └── CodeGenerator.java
│   │   │   ├── job/                    # 定时任务
│   │   │   │   └── once/
│   │   │   ├── manager/                # 管理器类
│   │   │   │   └── RedisLimiterManager.java  # Redis限流管理器
│   │   │   ├── mapper/                 # Mapper接口
│   │   │   │   ├── mysql/              # MySQL Mapper
│   │   │   │   │   └── UserMapper.java
│   │   │   │   └── sqlserver/          # SQL Server Mapper (30个)
│   │   │   │       ├── MonthlyEnergyMapper.java
│   │   │   │       ├── HourlyEnergyMapper.java
│   │   │   │       ├── AirConditioningMapper.java
│   │   │   │       └── [27个车间Mapper]
│   │   │   ├── model/                  # 数据模型
│   │   │   │   ├── entity/             # 实体类
│   │   │   │   │   ├── User.java       # 用户实体 (MySQL)
│   │   │   │   │   └── TempMonitor.java  # 能耗监控实体 (SQL Server)
│   │   │   │   ├── dto/                # 数据传输对象
│   │   │   │   │   ├── user/           # 用户相关DTO (6个)
│   │   │   │   │   │   ├── UserAddRequest.java
│   │   │   │   │   │   ├── UserUpdateRequest.java
│   │   │   │   │   │   ├── UserQueryRequest.java
│   │   │   │   │   │   ├── UserLoginRequest.java
│   │   │   │   │   │   ├── UserRegisterRequest.java
│   │   │   │   │   │   └── UserLogoutRequest.java
│   │   │   │   │   └── tempmonitor/    # 能耗相关DTO (6个)
│   │   │   │   │       ├── MonthlyEnergyStatistics.java
│   │   │   │   │       ├── HourlyEnergyStatistics.java
│   │   │   │   │       ├── TrendRequest.java
│   │   │   │   │       ├── CompareRequest.java
│   │   │   │   │       ├── TableRequest.java
│   │   │   │   │       └── DailyRequest.java
│   │   │   │   ├── vo/                 # 视图对象
│   │   │   │   │   ├── LoginUserVO.java  # 登录用户视图
│   │   │   │   │   └── UserVO.java       # 用户视图
│   │   │   │   └── enums/              # 枚举类
│   │   │   │       └── UserRoleEnum.java  # 用户角色枚举 (ADMIN, USER)
│   │   │   ├── service/                # 服务接口 (30个)
│   │   │   │   ├── UserService.java
│   │   │   │   ├── MonthlyEnergyService.java
│   │   │   │   ├── HourlyEnergyService.java
│   │   │   │   ├── TrendCacheService.java
│   │   │   │   ├── [27个车间Service]
│   │   │   │   ├── cache/              # 缓存服务
│   │   │   │   │   ├── RedisNamespaceService.java
│   │   │   │   │   └── TempMonitorCacheLoader.java
│   │   │   │   └── impl/               # 服务实现类 (31个)
│   │   │   │       ├── UserServiceImpl.java
│   │   │   │       ├── MonthlyEnergyServiceImpl.java
│   │   │   │       ├── HourlyEnergyServiceImpl.java
│   │   │   │       └── [28个车间ServiceImpl]
│   │   │   └── utils/                  # 工具类
│   │   │       ├── EnergyCalculationUtils.java  # 能耗计算核心工具 ⭐
│   │   │       ├── SqlUtils.java                # SQL工具
│   │   │       ├── NetUtils.java                # 网络工具
│   │   │       └── SpringContextUtils.java      # Spring上下文工具
│   │   └── resources/
│   │       ├── application.yml          # 主配置文件
│   │       ├── application-dev.yml      # 开发环境
│   │       ├── application-prod.yml     # 生产环境
│   │       ├── application-test.yml     # 测试环境
│   │       ├── banner.txt               # 启动Banner
│   │       ├── mapper/                  # MyBatis XML映射
│   │       │   ├── sqlserver/           # SQL Server映射 (30个)
│   │       │   │   ├── MonthlyEnergyMapper.xml
│   │       │   │   ├── HourlyEnergyMapper.xml
│   │       │   │   └── [车间Mapper].xml
│   │       │   └── UserMapper.xml       # MySQL映射
│   │       ├── templates/               # FreeMarker模板 (8个)
│   │       └── META-INF/
│   │           └── additional-spring-configuration-metadata.json
│   └── test/                            # 测试代码 (预留)
├── target/                              # Maven构建输出
├── .gitignore
├── Dockerfile                           # Docker镜像构建
├── mvnw / mvnw.cmd                      # Maven Wrapper
├── pom.xml                              # Maven依赖配置
└── README.md
```

**重点文件说明**:

| 文件/目录 | 作用 |
|---------|------|
| `utils/EnergyCalculationUtils.java` | **核心工具类**，封装所有能耗计算逻辑 (月度/日度) |
| `config/PrimaryDataSourceConfig.java` | MySQL 主数据源配置 (用户/权限) |
| `config/SecondaryDataSourceConfig.java` | SQL Server 辅助数据源 (能耗数据) |
| `mapper/sqlserver/` | SQL Server 专属 Mapper，查询 `TempMonitor` 表 |
| `mapper/UserMapper.xml` | MySQL 用户表映射 |
| `aop/AuthInterceptor.java` | 权限拦截器，拦截 `@AuthCheck` 注解 |
| `common/BaseResponse.java` | 统一响应体 `{ code, data, message }` |

---

## 5. 核心模块

### 5.1 前端核心模块

#### 5.1.1 路由配置 (`config/routes.ts`)

```typescript
export default [
  // 登录路由
  { path: '/user', layout: false, routes: [ { path: 'login', component: './User/Login' } ] },
  
  // 统计路由
  { path: '/monthly-energy', name: '月度能耗统计', icon: 'BarChartOutlined', component: './MonthlyEnergy' },
  { path: '/hourly-energy', name: '日能耗统计', icon: 'LineChartOutlined', component: './HourlyEnergy' },
  
  // 用户管理
  { path: '/user-management', name: '用户管理系统', icon: 'UserOutlined', component: './UserManagement' },
  
  // 27个车间路由 (示例)
  { path: '/airConditioning', name: '114_空调水机主机', icon: 'WalletFilled', component: './AirConditioning', access: 'canUser' },
  { path: '/injection110', name: '110注射', icon: 'control', component: './Injection110', access: 'canUser' },
  
  // 管理员路由
  { path: '/admin', icon: 'crown', name: '管理页', access: 'canAdmin', routes: [ { path: 'user', component: './Admin/User', name: '用户管理' } ] },
  
  { path: '/', redirect: '/monthly-energy' },
  { path: '*', layout: false, component: './404' },
];
```

**权限控制**:
- `access: 'canUser'`: 普通用户可访问
- `access: 'canAdmin'`: 仅管理员可访问

#### 5.1.2 API服务层 (`services/SolarBi-front/`)

**示例: 日度能耗API**

```typescript
// hourlyEnergyController.ts
import { request } from '@umijs/max';

export async function getHourlyEnergy(params: { year: number; month: number; day: number }) {
  return request<API.BaseResponse<any>>('/api/hourly/statistics', {
    method: 'GET',
    params,
  });
}
```

#### 5.1.3 权限控制 (`access.ts`)

```typescript
export default function access(initialState: { currentUser?: API.LoginUserVO }) {
  const { currentUser } = initialState || {};
  return {
    canAdmin: currentUser && currentUser.userRole === 'admin',
    canUser: currentUser && currentUser.userRole === 'user',
  };
}
```

#### 5.1.4 请求拦截器 (`app.tsx`)

```typescript
export const request = {
  // 请求拦截器
  requestInterceptors: [(config) => { ... }],
  
  // 响应拦截器
  responseInterceptors: [
    (response) => {
      const data = response.data as API.BaseResponse<any>;
      if (data.code !== 0) {
        message.error(data.message);
        throw new Error(data.message);
      }
      return response;
    },
  ],
};
```

### 5.2 后端核心模块

#### 5.2.1 多数据源配置

**MySQL 主数据源** (`config/PrimaryDataSourceConfig.java`)

```java
@Configuration
@MapperScan(basePackages = "com.yupi.springbootinit.mapper.mysql", sqlSessionFactoryRef = "primarySqlSessionFactory")
public class PrimaryDataSourceConfig {
    @Primary
    @Bean
    @ConfigurationProperties("spring.datasource.primary")
    public DataSource primaryDataSource() { ... }
}
```

**SQL Server 辅助数据源** (`config/SecondaryDataSourceConfig.java`)

```java
@Configuration
@MapperScan(basePackages = "com.yupi.springbootinit.mapper.sqlserver", sqlSessionFactoryRef = "secondarySqlSessionFactory")
public class SecondaryDataSourceConfig {
    @Bean
    @ConfigurationProperties("spring.datasource.secondary")
    public DataSource secondaryDataSource() { ... }
}
```

#### 5.2.2 能耗计算核心工具 (`utils/EnergyCalculationUtils.java`)

**核心方法**:

```java
public class EnergyCalculationUtils {
    /**
     * 计算日度（24小时）能耗
     * @param rawData 原始电能数据
     * @param startTime 起始时间 (7:00)
     * @param endTime 结束时间 (次日7:00)
     * @return 24个小时的能耗数据
     */
    public static List<Double> calculateHourlyEnergyFromRawData(
        List<TempMonitor> rawData, LocalDateTime startTime, LocalDateTime endTime
    ) { ... }
    
    /**
     * 计算月度能耗
     */
    public static List<DailyEnergy> calculateMonthlyEnergy(...) { ... }
}
```

#### 5.2.3 权限校验 AOP (`aop/AuthInterceptor.java`)

```java
@Aspect
@Component
public class AuthInterceptor {
    @Around("@annotation(authCheck)")
    public Object doInterceptor(ProceedingJoinPoint joinPoint, AuthCheck authCheck) {
        String mustRole = authCheck.mustRole();
        // 校验用户角色
        if (!"admin".equals(currentUser.getUserRole())) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        return joinPoint.proceed();
    }
}
```

#### 5.2.4 统一响应体 (`common/BaseResponse.java`)

```java
@Data
public class BaseResponse<T> implements Serializable {
    private int code;
    private T data;
    private String message;
}
```

#### 5.2.5 日度能耗Service实现 (`service/impl/HourlyEnergyServiceImpl.java`)

```java
@Service
public class HourlyEnergyServiceImpl implements HourlyEnergyService {
    @Resource
    private HourlyEnergyMapper hourlyEnergyMapper;
    
    @Override
    public HourlyEnergyStatistics getHourlyStatistics(int year, int month, int day) {
        // 1. 计算时间范围 (7:00 - 次日8:00，多查1小时用于计算)
        LocalDateTime startTime = LocalDateTime.of(year, month, day, 7, 0);
        LocalDateTime endTime = startTime.plusDays(1).plusHours(1);
        
        // 2. 查询原始数据
        List<TempMonitor> rawData = hourlyEnergyMapper.selectAllWorkshopsHourlyData(startTime, endTime);
        
        // 3. 按车间分组
        Map<String, List<TempMonitor>> groupedData = rawData.stream()
            .collect(Collectors.groupingBy(TempMonitor::getDeviceItem));
        
        // 4. 调用工具类计算每个车间的24小时能耗
        Map<String, List<Double>> workshopHourlyData = new HashMap<>();
        for (Map.Entry<String, List<TempMonitor>> entry : groupedData.entrySet()) {
            List<Double> hourlyData = EnergyCalculationUtils.calculateHourlyEnergyFromRawData(
                entry.getValue(), startTime, endTime
            );
            workshopHourlyData.put(entry.getKey(), hourlyData);
        }
        
        // 5. 计算每小时总计
        List<Double> hourlyTotal = calculateHourlyTotal(workshopHourlyData);
        
        // 6. 构造返回结果
        HourlyEnergyStatistics result = new HourlyEnergyStatistics();
        result.setWorkshopHourlyData(workshopHourlyData);
        result.setHourlyTotal(hourlyTotal);
        return result;
    }
}
```

---

## 6. 数据流程

### 6.1 用户登录流程

```
┌──────────┐     1. POST /user/login      ┌─────────────────┐
│  Browser │ ──────────────────────────> │ UserController  │
└──────────┘     { account, password }    └────────┬────────┘
                                                   │
                                                   │ 2. 校验密码
                                                   ▼
                                         ┌─────────────────┐
                                         │  UserService    │
                                         │  - 查询用户      │
                                         │  - MD5校验      │
                                         │  - 更新登录时间  │
                                         └────────┬────────┘
                                                  │
                                                  │ 3. 查询MySQL
                                                  ▼
                                         ┌─────────────────┐
                                         │  UserMapper     │
                                         │  (MySQL)        │
                                         └────────┬────────┘
                                                  │
                                                  │ 4. 存储Session
                                                  ▼
                                         ┌─────────────────┐
                                         │  Redis          │
                                         │  - Session存储   │
                                         └─────────────────┘
```

### 6.2 月度能耗统计流程

```
┌──────────┐   1. GET /monthly/statistics    ┌──────────────────────┐
│  前端页面 │ ────────────────────────────> │ MonthlyEnergyCtrl    │
│          │   { year, month }               └───────────┬──────────┘
└──────────┘                                              │
                                                          │ 2. 查询逻辑
                                                          ▼
                                             ┌──────────────────────┐
                                             │ MonthlyEnergyService │
                                             │ - 计算时间范围        │
                                             │ - 调用Mapper查询     │
                                             └───────────┬──────────┘
                                                         │
                                                         │ 3. 查询SQL Server
                                                         ▼
                                             ┌──────────────────────┐
                                             │ MonthlyEnergyMapper  │
                                             │ (SQL Server)         │
                                             │ SELECT * FROM        │
                                             │   TempMonitor        │
                                             │ WHERE ...            │
                                             └───────────┬──────────┘
                                                         │
                                                         │ 4. 返回原始数据
                                                         ▼
                                             ┌──────────────────────┐
                                             │ Service 层            │
                                             │ - 按车间分组          │
                                             │ - 调用工具类计算      │
                                             └───────────┬──────────┘
                                                         │
                                                         │ 5. 核心计算
                                                         ▼
                                             ┌──────────────────────┐
                                             │ EnergyCalculationUtils│
                                             │ - 按日期分组          │
                                             │ - 计算每日能耗        │
                                             │ - 求和/统计          │
                                             └───────────┬──────────┘
                                                         │
                                                         │ 6. 返回JSON
                                                         ▼
┌──────────┐                                 ┌──────────────────────┐
│  前端页面 │ <───────────────────────────── │ BaseResponse         │
│          │   { code:0, data:{...} }        │ { workshopData, ... }│
└──────────┘                                 └──────────────────────┘
       │
       │ 7. 渲染图表/表格
       ▼
┌──────────────────┐
│ ECharts/Highcharts│
│ - 趋势图          │
│ - 对比图          │
│ - 数据表格        │
└──────────────────┘
```

### 6.3 日度（24小时）能耗统计流程

```
1. 前端发起请求
   GET /api/hourly/statistics?year=2025&month=10&day=10

2. HourlyEnergyController 接收参数
   - 校验参数有效性
   - 调用 HourlyEnergyService

3. HourlyEnergyService 处理逻辑
   ① 计算时间范围：
      startTime = 2025-10-10 07:00:00
      endTime   = 2025-10-11 08:00:00  (多查1小时用于计算最后一小时差值)
   
   ② 调用 Mapper 查询 SQL Server
      SELECT * FROM TempMonitor
      WHERE InsertTime BETWEEN '2025-10-10 07:00:00' AND '2025-10-11 08:00:00'
      ORDER BY DeviceItem, InsertTime
   
   ③ 按车间分组：
      Map<String, List<TempMonitor>> = {
        "114_空调水机主机" -> [数据列表],
        "110注射" -> [数据列表],
        ...
      }
   
   ④ 调用工具类计算每个车间的24小时能耗：
      EnergyCalculationUtils.calculateHourlyEnergyFromRawData(...)
      
      工具类逻辑：
      - 生成25个整点时间戳 (07:00, 08:00, ..., 次日07:00)
      - 对每个时间段 (如 07:00-08:00):
        * 找到该段起始时间最近的数据点 (电能A)
        * 找到该段结束时间最近的数据点 (电能B)
        * 计算差值：能耗 = B - A
      - 返回24个能耗值 (索引0=07:00-08:00, ..., 索引23=次日06:00-07:00)
   
   ⑤ 计算每小时总计：
      hourlyTotal[i] = sum(所有车间第i小时能耗)
   
   ⑥ 构造返回DTO：
      {
        "year": 2025,
        "month": 10,
        "day": 10,
        "workshopList": ["114_空调", "110注射", ...],
        "workshopHourlyData": {
          "114_空调": [51.9, 212.3, ...],
          "110注射": [120.5, 135.2, ...],
          ...
        },
        "hourlyTotal": [500.2, 680.5, ...]
      }

4. Controller 包装为 BaseResponse 返回

5. 前端接收数据并渲染表格
   - 第一列显示时间段 (07:00-08:00, 08:00-09:00, ...)
   - 后续列显示各车间数据
   - 最后一行显示合计
```

### 6.4 Redis缓存流程

```
┌──────────┐   1. 请求趋势数据           ┌─────────────────┐
│  前端    │ ─────────────────────────> │  Controller     │
└──────────┘   GET /airConditioning/trend └────────┬────────┘
                                                   │
                                                   │ 2. 检查缓存
                                                   ▼
                                         ┌─────────────────┐
                                         │  Service        │
                                         │  - 查Redis缓存   │
                                         └────────┬────────┘
                                                  │
                                            有缓存 │ 无缓存
                                                  ▼
                     ┌─────────────────────────────────────┐
                     │           Redis                     │
                     │  Key: trend:airConditioning:2025-10 │
                     │  Value: { data: [...], ttl: 300s }  │
                     └────────┬────────────────────────────┘
                              │
                       有缓存  │  无缓存
                              │
              ┌───────────────┴──────────────┐
              ▼                              ▼
    直接返回缓存数据               查询SQL Server
                                  ↓
                          调用 EnergyCalculationUtils
                                  ↓
                          存入Redis (TTL=5min)
                                  ↓
                          返回前端
```

---

## 7. 开发规范

### 7.1 前端规范

#### 7.1.1 目录命名

- 页面组件目录：大驼峰 (`MonthlyEnergy/`, `UserManagement/`)
- 普通组件目录：小驼峰 (`components/`, `services/`)
- 配置目录：小驼峰 (`config/`, `styles/`)

#### 7.1.2 文件命名

- React 组件：大驼峰 `ChartSection.tsx`
- 配置文件：小驼峰 `timeFormats.ts`, `chartConfig.tsx`
- 样式文件：小驼峰 `styles.css`

#### 7.1.3 代码规范

- 使用 TypeScript，启用严格模式
- 使用 ESLint + Prettier 格式化
- 组件使用函数式组件 + Hooks
- 状态管理：优先使用 `useState` + `useEffect`
- API调用：统一使用 `services/` 下的API函数

#### 7.1.4 样式规范

- 全局样式：`global.less`
- 组件样式：优先使用 CSS Modules 或 `styles.css`
- 主题样式：复用 `styles/darkTheme.ts`, `techTheme.ts`

### 7.2 后端规范

#### 7.2.1 包命名

- Controller: `com.yupi.springbootinit.controller`
- Service: `com.yupi.springbootinit.service` + `impl/`
- Mapper: `com.yupi.springbootinit.mapper.mysql` / `.sqlserver`

#### 7.2.2 类命名

- Controller: `XxxController` (如 `MonthlyEnergyController`)
- Service: `XxxService` + `XxxServiceImpl`
- Mapper: `XxxMapper` (接口) + `XxxMapper.xml` (映射)

#### 7.2.3 API设计规范

- 统一返回 `BaseResponse<T>`
- RESTful 风格：
  - `GET /xxx/statistics` - 查询统计
  - `POST /user/add` - 新增用户
  - `POST /user/update` - 更新用户
  - `GET /user/get` - 获取单个用户
  - `GET /user/list/page` - 分页查询

#### 7.2.4 异常处理

- 业务异常：抛出 `BusinessException(ErrorCode.XXX_ERROR)`
- 全局异常处理器：`GlobalExceptionHandler` 统一捕获
- 错误码：定义在 `ErrorCode` 枚举

#### 7.2.5 日志规范

- 使用 SLF4J: `@Slf4j` (Lombok)
- 日志级别：
  - `INFO`: 关键业务流程
  - `WARN`: 潜在问题
  - `ERROR`: 错误异常

#### 7.2.6 SQL规范

- 复杂查询：写在 MyBatis XML 中
- 简单查询：使用 MyBatis-Plus 内置方法
- 禁止使用 `SELECT *`，明确字段

### 7.3 数据库规范

#### 7.3.1 MySQL (用户/权限)

- 表名：`user`
- 字段命名：驼峰式 (`userAccount`, `userName`)
- 必备字段：`id`, `createTime`, `updateTime`, `isDelete`

#### 7.3.2 SQL Server (能耗数据)

- 表名：`TempMonitor`
- 字段：`Id`, `DeviceItem` (车间), `InsertTime` (时间), `TotalEnergy` (电能)
- 索引：`DeviceItem`, `InsertTime` 联合索引

---

## 8. 部署架构

### 8.1 开发环境

```yaml
前端:
  开发服务器: Umi Dev Server (http://localhost:8000)
  代理配置: /api -> http://localhost:8101
  
后端:
  Spring Boot: http://localhost:8101
  MySQL: 47.105.82.96:3306 (solarbi库)
  SQL Server: 192.168.1.238:1433 (iEMP库)
  Redis: 47.105.82.96:6379
```

### 8.2 生产环境

```yaml
前端:
  构建命令: npm run build
  输出目录: dist/
  部署方式: Nginx 静态托管
  
后端:
  构建命令: mvn clean package
  输出文件: target/springboot-init-0.0.1-SNAPSHOT.jar
  启动命令: java -jar xxx.jar --spring.profiles.active=prod
  
数据库:
  MySQL: 生产数据库 (用户/权限)
  SQL Server: 生产数据库 (能耗数据)
  Redis: 生产Redis服务器
```

### 8.3 Docker部署 (可选)

**Dockerfile** (已提供):

```dockerfile
FROM openjdk:8-jdk-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8101
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
```

**构建镜像**:

```bash
# 后端
cd back2
mvn clean package
docker build -t solarbi-backend:1.0 .

# 前端
cd front
npm run build
docker build -t solarbi-frontend:1.0 .
```

### 8.4 部署架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    Internet (公网)                           │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx (反向代理)                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 前端静态文件托管: /                                     │  │
│  │ 后端API代理: /api -> http://backend:8101              │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────────────┬───────────────────────────────┬─────┘
                        │                               │
           前端静态文件  │                               │ 后端API请求
                        ▼                               ▼
┌─────────────────────────────┐       ┌─────────────────────────────┐
│  前端 (Static Files)         │       │  后端 (Spring Boot JAR)      │
│  - dist/ 目录                │       │  - Port: 8101               │
│  - HTML/CSS/JS               │       │  - Profile: prod            │
└─────────────────────────────┘       └──────────┬──────────────────┘
                                                  │
                              ┌───────────────────┼───────────────────┐
                              ▼                                       ▼
                  ┌─────────────────────┐             ┌─────────────────────┐
                  │   MySQL 5.7.40      │             │   SQL Server        │
                  │  (主数据源)          │             │  (辅助数据源)         │
                  │  - user 表          │             │  - TempMonitor 表    │
                  └─────────────────────┘             └─────────────────────┘
                              │
                              ▼
                  ┌─────────────────────┐
                  │   Redis             │
                  │  - Session          │
                  │  - 趋势缓存          │
                  └─────────────────────┘
```

---

## 9. 关键设计决策

### 9.1 为什么使用双数据源？

- **MySQL**: 存储用户、权限等业务数据，支持事务，读写频繁
- **SQL Server**: 存储海量实时能耗数据 (TempMonitor)，时序数据，读多写少

### 9.2 为什么时间范围是 7:00 - 次日 7:00？

- **业务需求**: 工厂生产班次从早上7点开始，按24小时统计更符合实际生产节奏

### 9.3 为什么 Service 层处理计算而非 Mapper 层？

- **职责分离**: 
  - Mapper 层只负责数据查询 (单一职责)
  - Service 层处理业务逻辑 (分组、计算、汇总)
  - 工具类封装可复用算法 (`EnergyCalculationUtils`)

### 9.4 为什么使用 Redis 缓存？

- **性能优化**: 趋势数据计算复杂，缓存5分钟减少数据库压力
- **用户体验**: 缓存命中时响应时间 < 100ms

### 9.5 为什么前端有27个重复的车间页面？

- **业务需求**: 每个车间/区域独立监控，虽然结构相似但数据源不同
- **可维护性**: 统一结构便于复制和维护

---

## 10. 未来优化方向

1. **前端**:
   - 引入状态管理库 (Redux/Zustand)
   - 实现页面级权限控制 (pagePermissions 字段)
   - 优化图表渲染性能 (虚拟滚动)

2. **后端**:
   - 实现分布式任务调度 (定时统计)
   - 引入消息队列 (RabbitMQ/Kafka) 处理数据采集
   - 优化 SQL 查询 (索引优化、分区表)

3. **架构**:
   - 微服务化 (拆分用户服务/能耗服务)
   - 引入 Elasticsearch 实现全文搜索
   - 实现数据导出功能 (Excel/PDF)

---

## 11. 相关文档

- [产品需求文档 (product.md)](./product.md)
- [技术设计文档 (tech.md)](./tech.md)
- [API文档 (Knife4j)](http://localhost:8101/api/doc.html)
- [前端开发指南 (front/README.md)](./front/README.md)
- [后端开发指南 (back2/README.md)](./back2/README.md)

---

**维护者**: SolarBi 开发团队  
**最后更新**: 2025-10-10  
**文档版本**: v1.0.0
