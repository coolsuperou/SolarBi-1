# Design Document - 用户管理后端API

## Overview

本设计文档定义了用户管理后端API的技术架构和实现方案。该API为前端用户管理界面（`/front/src/pages/UserManagement`）提供完整的CRUD操作、权限管理、状态管理和登录时间跟踪功能。

**核心设计原则**：
- 严格遵循三层架构（Controller → Service → Mapper）
- 复用现有代码框架和工具类
- 使用JSON格式存储页面权限配置
- 确保安全性（管理员权限校验、操作日志）

## Steering Document Alignment

### Technical Standards (tech.md)

本设计遵循以下技术标准：
- **Spring Boot** 框架（与现有项目一致）
- **MyBatis-Plus** 作为ORM框架
- **Fastjson** 处理JSON序列化/反序列化
- **RESTful API** 设计规范
- **统一响应格式** `BaseResponse<T>`
- **权限校验** 使用 `@AuthCheck` 注解

### Project Structure (structure.md)

遵循项目现有结构：
```
back2/src/main/java/com/yupi/springbootinit/
├── controller/          # 控制层
│   └── UserManagementController.java
├── service/            # 服务层
│   ├── UserManagementService.java
│   └── impl/
│       └── UserManagementServiceImpl.java
├── mapper/             # 数据访问层
│   └── sqlserver/
│       └── UserMapper.java (扩展现有)
├── model/
│   ├── entity/         # 实体类
│   │   └── User.java (扩展3个新字段)
│   ├── dto/           # 数据传输对象
│   │   └── user/
│   │       ├── UserManagementVO.java
│   │       ├── UserPermissionUpdateRequest.java
│   │       └── UserStatusUpdateRequest.java
│   └── enums/         # 枚举类
│       └── UserStatusEnum.java
└── common/            # 公共类（复用现有）
    └── BaseResponse.java
```

## Code Reuse Analysis

### Existing Components to Extend

- **User Entity**: 扩展现有 `com.yupi.springbootinit.model.entity.User` 实体类
  - 添加 `userStatus`、`lastLoginTime`、`pagePermissions` 三个字段
  
- **UserController**: 扩展现有 `com.yupi.springbootinit.controller.UserController`
  - 已有：`/add`、`/update`、`/delete`、`/get`、`/list/page`
  - 新增：权限管理、状态管理方法

- **UserService**: 扩展现有 `com.yupi.springbootinit.service.UserService` 接口
  - 已有：用户注册/登录/CRUD基础方法
  - 新增：权限管理、状态管理、登录时间更新方法

- **UserServiceImpl**: 扩展现有 `com.yupi.springbootinit.service.impl.UserServiceImpl`
  - 实现新增的Service接口方法

### Existing Components to Reuse (No Changes)

- **BaseResponse**: 复用 `com.yupi.springbootinit.common.BaseResponse<T>` 统一响应格式
- **AuthCheck**: 复用 `com.yupi.springbootinit.annotation.AuthCheck` 权限校验注解
- **ErrorCode**: 复用 `com.yupi.springbootinit.common.ErrorCode` 错误码定义
- **ResultUtils**: 复用 `com.yupi.springbootinit.common.ResultUtils` 响应工具类
- **Fastjson**: 使用 `com.alibaba.fastjson.JSON` 处理权限JSON

### Integration Points

- **用户登录接口**: 需要修改现有登录Service，在登录成功后调用 `updateLastLoginTime()`
  
- **权限校验**: 前端路由守卫需要调用权限查询接口获取用户的 `pagePermissions`
  
- **数据库**: 使用现有 `user` 表，执行DDL添加3个新字段

## Architecture

### 整体架构

```mermaid
graph TD
    A[前端 UserManagement Page] -->|HTTP Request| B[UserManagementController]
    B -->|调用| C[UserManagementService]
    C -->|调用| D[UserMapper]
    D -->|MyBatis| E[(SQL Server Database)]
    C -->|使用| F[EnergyCalculationUtils]
    B -->|使用| G[@AuthCheck 权限校验]
    C -->|使用| H[Fastjson JSON处理]
```

### 三层架构设计

#### 1. Controller Layer（控制层）
- **职责**: 接收HTTP请求、参数校验、权限验证、调用Service、返回响应
- **文件**: `UserManagementController.java`
- **特点**:
  - 所有接口需要 `@AuthCheck(mustRole = "admin")` 管理员权限
  - 使用统一的 `BaseResponse<T>` 包装返回结果
  - 参数校验使用 `@RequestBody` 和 `@PathVariable`

#### 2. Service Layer（服务层）
- **职责**: 业务逻辑处理、权限JSON解析/生成、数据转换
- **文件**: `UserManagementService.java`、`UserManagementServiceImpl.java`
- **特点**:
  - 处理复杂的业务逻辑（权限设置、状态管理）
  - 使用Fastjson处理 `pagePermissions` 的序列化和反序列化
  - 实现默认权限生成逻辑（根据角色）

#### 3. Mapper Layer（数据访问层）
- **职责**: 数据库CRUD操作
- **文件**: 扩展现有 `UserMapper.java`
- **特点**:
  - 使用MyBatis-Plus的BaseMapper提供基础CRUD
  - 只需添加复杂查询的自定义方法（如搜索）

### Modular Design Principles

- **单一职责**: 每个Service方法只处理一个业务逻辑
- **DTO分离**: 前端和Entity之间使用DTO进行数据转换
- **枚举管理**: 用户状态使用枚举类 `UserStatusEnum`
- **工具类复用**: JSON处理统一使用Fastjson

## Components and Interfaces

### Component 1: UserController (不需修改)

- **Purpose**: 现有接口已足够支持所有功能
- **现有接口**（直接复用，不需修改）：
  - POST `/user/add` - 创建用户
  - POST `/user/update` - 更新用户（支持所有字段更新，包括权限、状态）
  - POST `/user/delete` - 删除用户
  - GET `/user/get` - 获取用户（返回User实体，包含所有新字段）
  - POST `/user/list/page` - 分页查询用户列表

- **不需要新增接口**！
  - 权限管理：通过 `/user/update` + 扩展UserUpdateRequest
  - 状态管理：通过 `/user/update` + 扩展UserUpdateRequest
  - 权限查询：通过 `/user/get` 获取User实体，前端解析pagePermissions字段
  - 登录时间：在UserServiceImpl.userLogin()中自动更新

- **Dependencies**: UserService (扩展后的)
- **Reuses**: `@AuthCheck`, `BaseResponse`, `ResultUtils`, `ErrorCode`

### Component 2: UserServiceImpl (只修改实现类)

- **Purpose**: 修改UserServiceImpl，添加权限处理逻辑
- **不需要修改UserService接口**！

- **需要修改的方法**：
  ```java
  // 1. 修改userLogin()方法
  LoginUserVO userLogin(String userAccount, String userPassword, HttpServletRequest request) {
      // ... 现有逻辑 ...
      // 新增：登录成功后更新lastLoginTime
      user.setLastLoginTime(new Date());
      this.updateById(user);
      // ... 返回LoginUserVO ...
  }
  ```

- **不需要新增方法**！
  - MyBatis-Plus的 `updateById()` 已支持所有字段更新
  - MyBatis-Plus的 `getById()` 已支持查询所有字段
  - 权限JSON的序列化/反序列化在前端处理

- **Dependencies**: UserMapper (不需修改)
- **Reuses**: `User Entity`, MyBatis-Plus

### Component 3: UserMapper (不需修改)

- **Purpose**: 数据库访问操作
- **现有功能**: 已继承 `BaseMapper<User>`，提供全部CRUD方法
- **是否需要修改**: ✖️ **不需要**
  - MyBatis-Plus的 `updateById()` 方法已足够支持新字段更新
  - UserController已有 `/list/page` 支持分页查询
  - `getQueryWrapper()` 可以支持关键词搜索
- **Dependencies**: MyBatis-Plus
- **Reuses**: 现有 `UserMapper` 接口，无需扩展

## Data Models

### User Entity (扩展)

```java
@TableName(value = "user")
@Data
public class User implements Serializable {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String userAccount;     // 账号
    private String userPassword;    // 密码（明文）
    private String userName;        // 昵称
    private String userAvatar;      // 头像URL
    private String userRole;        // 角色 (admin/user)
    
    // ✅ 新增字段
    private String userStatus;      // 状态 (直接用字符串: "active" 或 "inactive")
    private Date lastLoginTime;     // 最后登录时间
    private String pagePermissions; // 页面权限（JSON字符串）
    
    private Date createTime;        // 创建时间
    private Date updateTime;        // 更新时间
    
    @TableLogic
    private Integer isDelete;       // 逻辑删除标记
}
```

### UserUpdateRequest (扩展现有DTO)

**不创建新的DTO！扩展现有的 `UserUpdateRequest.java`**

```java
@Data
public class UserUpdateRequest implements Serializable {
    // ========== 现有字段 ==========
    private Long id;
    
    // ✅ 新增字段（用于用户管理功能）
    private String userAccount;     // 账号（支持修改）
    private String userPassword;    // 密码（明文，支持修改）
    private String userStatus;      // 状态 ("active" 或 "inactive")
    private String pagePermissions; // 页面权限（JSON字符串）
    
    // ========== 其他现有字段保持不变 ==========
    private String userName;
    private String userAvatar;
    private String userRole;
}
```

### 返回给前端的VO (复用现有)

**不创建新的VO！直接使用现有的 `UserVO` 或 `LoginUserVO`**

- **获取用户详情**: 使用 `UserVO` (需要确认该VO是否包含新字段)
- **登录接口**: 使用 `LoginUserVO`
- **用户列表**: 返回 `List<UserVO>` 或 `Page<User>` 直接返回Entity

> **前端负责**：解析 `pagePermissions` 字段（JSON字符串 → Map对象）

## 权限JSON格式

**注意**：权限Key使用**英文路由标识符**（不带`/`前缀），简洁清晰，前端可根据需要拼接为完整路由路径。

### 存储格式（数据库）

**示例**（部分权限）:
```json
{
  "monthly-energy": true,
  "hourly-energy": true,
  "user-management": false,
  "airConditioning": false,
  "feeding_workshop": false,
  "granule102": false,
  "canteen": false,
  "dormitory": false
}
```

### 完整的31个权限标识符

```
monthly-energy              (月度能耗统计)
hourly-energy               (日能耗统计)
user-management             (用户管理系统)
airConditioning             (114_空调水机主机)
injection_workshop          (110注射环保设备)
granulation_workshop        (102造粒环保设备)
office_building             (1#办公楼)
feeding_workshop            (101配料)
granule102                  (102造粒)
cold-press-103              (103冷压)
restoration-104             (104还原)
sintering-105               (105烧结)
cleaning-106                (106清洗)
beading-107                 (107串珠)
rubber-109                  (109炼胶)
injection-110               (110注射)
edging-111                  (111开刃)
final-inspection-112        (112终检)
warehouse-113               (113仓库)
elevator-114                (114_2#厂房电梯)
office-area-114             (114_2#楼办公区域)
conference-room-114         (114_2#楼会议室)
laboratory-114              (114_2#楼实验室)
public-114                  (114公共)
air-compressor-114          (114空压机)
charging-pile               (充电桩)
tool-rd-center              (工具研发中心)
guard-room                  (门卫室)
canteen                     (食堂)
dormitory                   (宿舍楼)
```

### 默认权限规则

**管理员（admin）** - 31个页面全部为`true`:
```java
Map<String, Boolean> adminPermissions = new HashMap<>();
// 所有31个权限标识符均为true
adminPermissions.put("monthly-energy", true);
adminPermissions.put("hourly-energy", true);
adminPermissions.put("user-management", true);
adminPermissions.put("airConditioning", true);
adminPermissions.put("injection_workshop", true);
adminPermissions.put("granulation_workshop", true);
adminPermissions.put("office_building", true);
adminPermissions.put("feeding_workshop", true);
adminPermissions.put("granule102", true);
adminPermissions.put("cold-press-103", true);
adminPermissions.put("restoration-104", true);
adminPermissions.put("sintering-105", true);
adminPermissions.put("cleaning-106", true);
adminPermissions.put("beading-107", true);
adminPermissions.put("rubber-109", true);
adminPermissions.put("injection-110", true);
adminPermissions.put("edging-111", true);
adminPermissions.put("final-inspection-112", true);
adminPermissions.put("warehouse-113", true);
adminPermissions.put("elevator-114", true);
adminPermissions.put("office-area-114", true);
adminPermissions.put("conference-room-114", true);
adminPermissions.put("laboratory-114", true);
adminPermissions.put("public-114", true);
adminPermissions.put("air-compressor-114", true);
adminPermissions.put("charging-pile", true);
adminPermissions.put("tool-rd-center", true);
adminPermissions.put("guard-room", true);
adminPermissions.put("canteen", true);
adminPermissions.put("dormitory", true);
```

**普通用户（user）** - 仅2个页面为`true`:
```java
Map<String, Boolean> userPermissions = new HashMap<>();
userPermissions.put("monthly-energy", true);
userPermissions.put("hourly-energy", true);
// 其他29个页面默认为 false
userPermissions.put("user-management", false);
userPermissions.put("airConditioning", false);
// ... (其余26个权限标识符均为false)
```

**完整权限清单请参考**: `requirements.md` 中的31个页面权限详细列表

## Error Handling

### Error Scenarios

1. **账号已存在**
   - **Handling**: 在创建或更新时检查账号唯一性
   - **User Impact**: 返回 400 错误，提示"账号已存在"

2. **用户不存在**
   - **Handling**: 查询用户时验证ID有效性
   - **User Impact**: 返回 404 错误，提示"用户不存在"

3. **权限不足**
   - **Handling**: `@AuthCheck` 注解自动校验
   - **User Impact**: 返回 403 错误，提示"无权限访问"

4. **尝试删除/禁用自己**
   - **Handling**: Service层检查 `userId != currentUserId`
   - **User Impact**: 返回 400 错误，提示"不能操作自己的账号"

5. **JSON解析失败**
   - **Handling**: try-catch捕获Fastjson异常
   - **User Impact**: 返回 400 错误，提示"权限数据格式错误"

6. **数据库操作失败**
   - **Handling**: 捕获MyBatis异常，记录日志
   - **User Impact**: 返回 500 错误，提示"操作失败，请重试"

### 错误响应格式

```json
{
  "code": 40000,
  "data": null,
  "message": "账号已存在"
}
```

## Testing Strategy

### Unit Testing

测试文件: `UserManagementServiceTest.java`

**核心测试用例**:
1. `testCreateUser_Success()` - 测试创建用户成功
2. `testCreateUser_DuplicateAccount()` - 测试账号重复
3. `testUpdateUserPermissions_Success()` - 测试权限更新
4. `testDeleteUser_CannotDeleteSelf()` - 测试禁止删除自己
5. `testGetDefaultPermissions_Admin()` - 测试管理员默认权限
6. `testGetDefaultPermissions_User()` - 测试普通用户默认权限
7. `testParsePermissionsJson()` - 测试JSON解析

### Integration Testing

测试文件: `UserManagementControllerTest.java`

**核心测试流程**:
1. 创建用户 → 查询用户列表 → 验证用户存在
2. 更新权限 → 查询权限 → 验证权限正确
3. 更新状态 → 尝试登录 → 验证状态生效
4. 删除用户 → 查询用户 → 验证用户已删除

### End-to-End Testing

**用户场景测试**:
1. **管理员完整流程**:
   - 登录 → 访问用户管理页面 → 创建用户 → 设置权限 → 保存
   
2. **权限控制验证**:
   - 创建普通用户 → 登录 → 验证只能访问允许的页面
   
3. **状态管理验证**:
   - 禁用用户 → 该用户尝试登录 → 验证登录失败

## Performance Considerations

1. **分页查询**: 用户列表支持分页（PageHelper），单页不超过100条
2. **索引优化**: 为 `userStatus` 和 `userAccount` 添加索引
3. **缓存策略**: 高频访问的用户权限可以使用Redis缓存
4. **JSON大小**: 限制 `pagePermissions` 字段大小在1KB以内

## Security Considerations

1. **权限校验**: 所有接口都需要管理员权限
2. **操作审计**: 关键操作记录日志（创建、删除、权限修改）
3. **防止自我操作**: 禁止删除或禁用自己的账号
4. **密码管理**: 虽然明文存储，但仅管理员可查看

## Database Migration

### DDL语句

```sql
-- 添加3个新字段
ALTER TABLE `user` 
ADD COLUMN `userStatus` varchar(20) NOT NULL DEFAULT 'active' COMMENT '用户状态：active-活跃, inactive-禁用' AFTER `userRole`,
ADD COLUMN `lastLoginTime` datetime NULL DEFAULT NULL COMMENT '最后登录时间' AFTER `userStatus`,
ADD COLUMN `pagePermissions` text NULL COMMENT '页面访问权限（JSON格式）' AFTER `lastLoginTime`,
ADD INDEX `idx_userStatus`(`userStatus`) USING BTREE;

-- 数据迁移：为现有用户设置默认值
UPDATE `user` SET `userStatus` = 'active' WHERE `isDelete` = 0;
UPDATE `user` SET `userStatus` = 'inactive' WHERE `isDelete` = 1;

-- 为管理员设置完整权限（31个页面全部为true）
UPDATE `user` 
SET `pagePermissions` = '{"monthly-energy":true,"hourly-energy":true,"user-management":true,"airConditioning":true,"injection_workshop":true,"granulation_workshop":true,"office_building":true,"feeding_workshop":true,"granule102":true,"cold-press-103":true,"restoration-104":true,"sintering-105":true,"cleaning-106":true,"beading-107":true,"rubber-109":true,"injection-110":true,"edging-111":true,"final-inspection-112":true,"warehouse-113":true,"elevator-114":true,"office-area-114":true,"conference-room-114":true,"laboratory-114":true,"public-114":true,"air-compressor-114":true,"charging-pile":true,"tool-rd-center":true,"guard-room":true,"canteen":true,"dormitory":true}' 
WHERE `userRole` = 'admin';

-- 为普通用户设置基础权限（仅月度和日能耗为true）
UPDATE `user` 
SET `pagePermissions` = '{"monthly-energy":true,"hourly-energy":true,"user-management":false,"airConditioning":false,"injection_workshop":false,"granulation_workshop":false,"office_building":false,"feeding_workshop":false,"granule102":false,"cold-press-103":false,"restoration-104":false,"sintering-105":false,"cleaning-106":false,"beading-107":false,"rubber-109":false,"injection-110":false,"edging-111":false,"final-inspection-112":false,"warehouse-113":false,"elevator-114":false,"office-area-114":false,"conference-room-114":false,"laboratory-114":false,"public-114":false,"air-compressor-114":false,"charging-pile":false,"tool-rd-center":false,"guard-room":false,"canteen":false,"dormitory":false}' 
WHERE `userRole` = 'user';
```

## Implementation Notes

### 开发顺序

1. **第一步**: 扩展 `User.java` Entity
   - 添加三个新字段：`userStatus`, `lastLoginTime`, `pagePermissions`

2. **第二步**: 扩展 `UserUpdateRequest.java` DTO
   - 添加四个字段：`userStatus`, `userPassword`, `userAccount`, `pagePermissions`

3. **第三步**: 修改 `UserServiceImpl.java`
   - 修改 `userLogin()` 方法，添加 `user.setLastLoginTime(new Date())` 和 `updateById(user)`

4. **第四步**: 测试验证
   - 测试权限更新
   - 测试状态管理
   - 测试登录时间更新

### 代码复用原则

- 优先扩展现有文件，不创建新的Controller/Service
- 复用现有的 `@AuthCheck`、`BaseResponse`、`ResultUtils`
- UserMapper不需要任何修改

### 其他注意事项

- **日志记录**: 关键操作使用 `@Slf4j` 记录日志
- **异常处理**: 统一使用 `BusinessException` 处理业务异常
- **文档注释**: 所有public方法都需要Javadoc注释

### 文件修改清单（最终版）

✅ **需要扩展的文件** (仅3个，不创建任何新文件！):
1. `User.java` - 添加3个字段 (`userStatus`, `lastLoginTime`, `pagePermissions`)
2. `UserUpdateRequest.java` - 添加4个字段 (`userStatus`, `userPassword`, `userAccount`, `pagePermissions`)
3. `UserServiceImpl.java` - 修改 `userLogin()` 方法，添加2行代码更新登录时间

❌ **不创建任何新文件**:
- ✖️ 不创建 `UserManagementVO` - 直接使用 `UserVO` / `LoginUserVO`
- ✖️ 不创建 `UserPermissionUpdateRequest` - 使用 `UserUpdateRequest`
- ✖️ 不创建 `UserStatusUpdateRequest` - 使用 `UserUpdateRequest`
- ✖️ 不创建 `UserStatusEnum` - 直接使用字符串 "active"/"inactive"

❌ **不需要修改的文件**:
- `UserController.java` - 现有接口已足够
- `UserService.java` - 不需要新增接口方法
- `UserMapper.java` - 使用MyBatis-Plus默认方法
- 所有common包下的类

**总结：只需修改 3个文件，不创建任何新文件！**
