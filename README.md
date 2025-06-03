# 项目介绍

本项目涵盖前端与后端两大部分。前端基于 React + Ant Design 框架技术，后端为 SpringBoot 项目。此外，项目还封装了讯飞星火 API，具备调用接口生成各类分析图表以及管理用户和图表的功能。

## 作者信息

作者：[每天十点睡](https://github.com/coolsuperou)

## 前端部分

### 主流框架与特性

- **SolarBi 6.0.0**
- **React 18.2.0**
- **Node 至少 16 版本及以上**
- **antd 5.2.2**
- **TypeScript**
- **动态路由**
- **Eslint**
- **Prettier**

### SolarBi 架构

#### Umi

- **Node.js**：前端开发基础环境
- **webpack**：前端打包工具
- **react - router**：路由库
- **proxy**：反向代理工具
- **dva**：轻量级应用框架
- **fabric**：lint 规则集（包含 eslint、stylelint、prettier）
- **TypeScript**：带类型的 JavaScript

#### umi 插件

- 内置布局
- 国际化
- 权限管理
- 数据流管理

#### ProComponents 模板组件

- **ProLayout**：提供菜单和面包屑功能
- **ProForm**：预设表单布局和行为
- **ProTable**：抽象网格请求和单元格样式
- **ProCard**：提供卡片切分和栅格布局能力

### 模板特点

#### 业务特性

- **栅格布局**：可自定义，适应不同页面布局需求
- **简单权限管理**：实现基本权限控制
- **全局初始数据**：通过 `getInitialState` 获取
- **默认使用 less**：方便样式开发
- **OpenAPI 自动生成后端请求代码**：提高开发效率
- **统一错误处理**：统一处理请求错误

### 业务功能

- **OpenAPI 后端接口自动生成**：快速生成对应代码
- **用户管理**：支持登录、注册，管理员可进行修改、新建、查询、删除用户操作
- **动态路由展示（权限管理）**：根据用户权限动态展示路由

### 运行命令

- `npm run dev`：启动开发环境
- `npm run build`：打包项目
- `npm run preview`：预览打包后项目

### 快速上手

1. 先启动后端的万用模板
2. 使用命令生成后端请求代码
3. 将标题和 logo 等切换为个人
4. 测试业务功能

具体万用模板教程：[前端万用模板使用教程 ([yuque.com](https://yuque.com/))](https://bcdh.yuque.com/staff - wpxfif/resource/rnv6shm2l57rsx6x)

## 后端部分（SpringBoot 项目）

### 主流框架与特性

- **Spring Boot 2.7.x**：提供强大开发支持
- **Spring MVC**：构建 Web 应用程序
- **MyBatis + MyBatis Plus**：开启分页功能，方便数据库操作
- **Spring Boot 调试工具和项目处理器**：辅助开发和调试
- **Spring AOP**：实现横切关注点统一处理
- **Spring Scheduler**：支持定时任务
- **Spring 事务注解**：方便事务管理

### 模板特点

#### 数据存储

- **MySQL 数据库**：主要关系型数据库
- **Redis 内存数据库**：用于缓存和分布式登录
- **Elasticsearch 搜索引擎**：提供灵活搜索功能
- **腾讯云 COS 对象存储**：用于文件存储

#### 工具类

- **Easy Excel**：处理 Excel 文件读写
- **Hutool 工具库**：提供丰富工具方法
- **Apache Commons Lang3 工具类**：增强 Java 语言功能
- **Lombok 注解**：减少样板代码

#### 业务特性

- **业务代码生成器**：支持自动生成 Service、Controller、数据模型代码
- **Spring Session Redis 分布式登录**：实现分布式登录管理
- **全局请求响应拦截器**：记录日志
- **全局异常处理器**：统一处理异常，增强系统健壮性
- **自定义错误码**：区分不同类型错误
- **封装通用响应类**：规范接口返回格式
- **Swagger + Knife4j 接口文档**：方便接口查看和测试
- **自定义权限注解 + 全局校验**：实现细粒度权限控制
- **全局跨域处理**：解决跨域访问问题
- **长整数丢失精度解决**：避免长整数传输精度丢失
- **多环境配置**：支持不同环境配置切换

### 业务功能

#### 架构设计

合理分层，使代码结构清晰，易于维护和扩展。

#### 单元测试

- **JUnit5 单元测试**：确保代码正确性
- **示例单元测试类**：提供参考代码

#### 具体业务功能

- **提供示例 SQL**：包含用户、帖子、帖子点赞、帖子收藏表等
- **用户管理**：支持登录、注册、注销、更新、检索、权限管理
- **帖子管理**：可进行创建、删除、编辑、更新、数据库检索、ES 灵活检索
- **帖子互动**：支持点赞、取消点赞，收藏、取消收藏、检索已收藏帖子
- **同步任务**：包含帖子全量同步 ES、增量同步 ES 定时任务
- **微信相关功能**：支持微信开放平台登录，微信公众号订阅、收发消息、设置菜单
- **文件上传**：支持分业务的文件上传

### 快速上手

#### 配置修改

所有需修改处标记了 `todo`，主要修改以下配置文件：

- `application.yml`：数据库、Redis、Elasticsearch、微信、对象存储等配置
- `application - test.yml`：测试环境配置
- `application - prod.yml`：生产环境配置
- `FileConstant.java`：COS 访问地址配置

#### MySQL 数据库

1. 修改 `application.yml` 的数据库配置：

yaml











```yaml
spring:
  datasource:
    driver - class - name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/my_db
    username: root
    password: 123456
```

1. 执行 `sql/create_table.sql` 中的数据库语句，自动创建库表
2. 启动项目，访问 `http://localhost:8101/api/doc.html` 打开接口文档进行在线调试

#### Redis 分布式登录

1. 修改 `application.yml` 的 Redis 配置：

yaml











```yaml
spring:
  redis:
    database: 1
    host: localhost
    port: 6379
    timeout: 5000
    password: 123456
```

1. 修改 `application.yml` 中的 session 存储方式：

yaml











```yaml
spring:
  session:
    store - type: redis
```

1. 移除 `MainApplication` 类开头 `@SpringBootApplication` 注解内的 exclude 参数：
   修改前：

java











```java
@SpringBootApplication(exclude = {RedisAutoConfiguration.class})
```

修改后：

java











```java
@SpringBootApplication
```











#### 业务代码生成器

找到 `generate.CodeGenerator` 类，修改生成参数和生成路径，可注释不需要的生成逻辑后运行。生成代码后，移动到实际项目并按 `// todo` 注释提示修改。

java











```java
// 指定生成参数
String packageName = "com.yupi.springbootinit";
String dataName = "用户评论";
String dataKey = "userComment";
String upperDataKey = "UserComment";
```
