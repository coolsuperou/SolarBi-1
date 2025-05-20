# 项目介绍

本项目包含前端和后端两部分，前端是基于 React + Ant Design 的框架技术，后端是 SpringBoot 项目。以下是对整个项目的详细介绍以及快速上手的指南。

## 后端（SpringBoot 项目初始模板）

### 作者信息

作者：[每天十点睡](https://github.com/coolsuperou)

### 模板特点

#### 主流框架 & 特性

- **Spring Boot 2.7.x**：采用较新的 Spring Boot 版本，提供强大的开发支持。
- **Spring MVC**：用于构建 Web 应用程序。
- **MyBatis + MyBatis Plus 数据访问**：开启分页功能，方便进行数据库操作。
- **Spring Boot 调试工具和项目处理器**：有助于开发和调试。
- **Spring AOP 切面编程**：实现横切关注点的统一处理。
- **Spring Scheduler 定时任务**：支持定时执行任务。
- **Spring 事务注解**：方便进行事务管理。

#### 数据存储

- **MySQL 数据库**：作为主要的关系型数据库。
- **Redis 内存数据库**：用于缓存和分布式登录等。
- **Elasticsearch 搜索引擎**：提供灵活的搜索功能。
- **腾讯云 COS 对象存储**：用于文件存储。

#### 业务特性

- **业务代码生成器**：支持自动生成 Service、Controller、数据模型代码。
- **Spring Session Redis 分布式登录**：实现分布式环境下的用户登录管理。
- **全局请求响应拦截器**：记录日志，方便后续分析。
- **全局异常处理器**：统一处理异常，提高系统的健壮性。
- **自定义错误码**：便于对不同类型的错误进行区分和处理。
- **封装通用响应类**：规范接口返回格式。
- **Swagger + Knife4j 接口文档**：方便开发人员查看和测试接口。
- **自定义权限注解 + 全局校验**：实现细粒度的权限控制。
- **全局跨域处理**：解决跨域访问问题。
- **长整数丢失精度解决**：避免长整数在传输过程中丢失精度。
- **多环境配置**：支持不同环境的配置切换。

#### 工具类

- **Easy Excel 表格处理**：方便进行 Excel 文件的读写操作。
- **Hutool 工具库**：提供丰富的工具方法。
- **Apache Commons Lang3 工具类**：增强 Java 语言的功能。
- **Lombok 注解**：减少样板代码的编写。

### 业务功能

#### 架构设计

合理分层，使代码结构清晰，易于维护和扩展。

#### 单元测试

- **JUnit5 单元测试**：使用 JUnit5 进行单元测试，确保代码的正确性。
- **示例单元测试类**：提供示例代码，方便开发人员参考。

#### 具体业务功能

- **提供示例 SQL**：包括用户、帖子、帖子点赞、帖子收藏表等。
- **用户管理**：支持用户登录、注册、注销、更新、检索、权限管理。
- **帖子管理**：可以进行帖子的创建、删除、编辑、更新、数据库检索、ES 灵活检索。
- **帖子互动**：支持帖子点赞、取消点赞，帖子收藏、取消收藏、检索已收藏帖子。
- **同步任务**：包含帖子全量同步 ES、增量同步 ES 定时任务。
- **微信相关功能**：支持微信开放平台登录，微信公众号订阅、收发消息、设置菜单。
- **文件上传**：支持分业务的文件上传。

### 快速上手

#### 配置修改

所有需要修改的地方都标记了 `todo`，便于大家找到修改的位置。主要需要修改的配置文件包括：

- `application.yml`：数据库、Redis、Elasticsearch、微信、对象存储等配置。
- `application-test.yml`：测试环境的配置。
- `application-prod.yml`：生产环境的配置。
- `FileConstant.java`：COS 访问地址配置。

#### Redis 分布式登录

修改 `application.yml` 的 Redis 配置为你自己的：

```yml
spring:
  redis:
    database: 1
    host: localhost
    port: 6379
    timeout: 5000
    password: 123456
```

- 修改 `application.yml` 中的 session 存储方式：



```yml
spring:
  session:
    store-type: redis
```

- 移除 `MainApplication` 类开头 `@SpringBootApplication` 注解内的 exclude 参数：

​        修改前：



```java
@SpringBootApplication(exclude = {RedisAutoConfiguration.class})
```

​         修改后：



```java
@SpringBootApplication
```

#### 业务代码生成器

- 支持自动生成 Service、Controller、数据模型代码，配合 MyBatisX 插件，可以快速开发增删改查等实用基础功能。
- 找到 `generate.CodeGenerator` 类，修改生成参数和生成路径，并且支持注释掉不需要的生成逻辑，然后运行即可。

```java
// 指定生成参数
String packageName = "com.yupi.springbootinit";
String dataName = "用户评论";
String dataKey = "userComment";
String upperDataKey = "UserComment";
```

生成代码后，可以移动到实际项目中，并且按照 `// todo` 注释的提示来针对自己的业务需求进行修改。

## 前端（前端万用模板）

### 作者信息

作者：[每天十点睡](https://github.com/coolsuperou)

### 模板特点

#### 主流框架 & 特性

- **SolarBi 6.0.0**
- **React 18.2.0**
- **node 至少 16 版本及以上**
- **antd 5.2.2**
- **Type Script**
- **动态路由**
- **Eslint**
- **Prettier**

#### SolarBi 架构

- Umi
  - **Node.js 前端开发基础环境**
  - **webpack 前端必学必会的打包工具**
  - **react-router 路由库**
  - **proxy 反向代理工具**
  - **dva 轻量级的应用框架**
  - **fabric 严格但是不严苛的 lint 规则集（eslint、stylelint、prettier)**
  - **Type Script 带类型的 JavaScript**
- umi 插件
  - **内置布局**
  - **国际化**
  - **权限**
  - **数据流**
- ProComponents 模板组件
  - **ProLayout**：提供开箱即用的菜单和面包屑功能。
  - **ProForm**：表单模板组件，预设常见布局和行为。
  - **ProTable**：表格模板组件，抽象网格请求和单元格样式。
  - **ProCard**：提供卡片切分以及栅格布局能力。

#### 业务特性

- **栅格布局**：可自定义，可适应不同的页面布局需求。
- **简单权限管理**：实现基本的权限控制。
- **全局初始数据**：通过 `getInitialState` 获取全局初始数据。
- **默认使用 less 作为样式语言**：方便进行样式开发。
- **OpenAPI 自动生成后端请求代码**：提高开发效率。
- **统一错误处理**：统一处理请求过程中出现的错误。

### 业务功能

- **提供 OpenAPI 后端接口自动生成**：快速生成与后端接口对应的代码。
- **用户管理**：支持用户登录、用户注册，管理员可以进行修改用户、新建用户、查询用户、删除用户等操作。
- **动态路由展示（权限管理）**：根据用户权限动态展示路由。

### 运行命令

在 `package.json` 中定义了一系列运行命令，常用的命令如下：

- `npm run dev`：启动开发环境。
- `npm run build`：打包项目。
- `npm run preview`：预览打包后的项目。

通过以上的介绍和指南，你可以快速了解和上手本项目，根据自己的需求进行开发和扩展。
