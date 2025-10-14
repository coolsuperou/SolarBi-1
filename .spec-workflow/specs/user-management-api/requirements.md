# Requirements Document - 用户管理后端API

## Introduction

本功能为用户管理系统提供完整的后端API支持，包括用户CRUD操作、状态管理、权限管理、密码管理和登录时间跟踪。前端已有完整的用户管理界面（`/front/src/pages/UserManagement`），需要后端API来对接数据库并实现业务逻辑。

**核心价值**：
- 为管理员提供完整的用户管理能力
- 支持细粒度的页面权限控制（10种页面权限）
- 提供用户状态管理（活跃/禁用）
- 记录用户登录历史

## Alignment with Product Vision

符合 SolarBi 能耗管理平台的权限管理需求，实现：
- 多用户协同管理
- 基于角色的权限控制（admin/user）
- 页面级访问控制
- 用户操作追踪

## Requirements

### Requirement 1: 用户列表查询

**User Story:** 作为管理员，我希望能够查询和筛选用户列表，以便管理系统中的所有用户。

#### Acceptance Criteria

1. WHEN 管理员访问用户列表接口 THEN 系统 SHALL 返回所有未删除用户的信息（包括：id、账号、昵称、角色、状态、最后登录时间、创建时间）
2. WHEN 提供搜索关键词 THEN 系统 SHALL 支持按账号、昵称、角色进行模糊搜索
3. WHEN 查询结果为空 THEN 系统 SHALL 返回空列表而不是错误
4. WHEN 用户无管理员权限 THEN 系统 SHALL 返回403错误

### Requirement 2: 用户信息查看

**User Story:** 作为管理员，我希望能够查看用户的详细信息（包括密码），以便帮助用户解决登录问题。

#### Acceptance Criteria

1. WHEN 管理员查询指定用户 THEN 系统 SHALL 返回该用户的完整信息
2. WHEN 查询的用户不存在 THEN 系统 SHALL 返回404错误
3. WHEN 普通用户尝试查看其他用户密码 THEN 系统 SHALL 返回403错误
4. WHEN 管理员查看用户信息 THEN 系统 SHALL 返回明文密码（用于显示/隐藏功能）

### Requirement 3: 用户创建

**User Story:** 作为管理员，我希望能够创建新用户并设置其基本信息，以便为新员工开通系统访问权限。

#### Acceptance Criteria

1. WHEN 管理员提交新用户信息 THEN 系统 SHALL 验证必填字段（账号、密码、角色）
2. IF 账号已存在 THEN 系统 SHALL 返回400错误提示账号重复
3. WHEN 创建用户成功 THEN 系统 SHALL 自动设置默认值：
   - `userStatus` = 'active'
   - `pagePermissions` = 根据角色设置默认权限（管理员全部权限，普通用户仅月度和日能耗权限）
   - `lastLoginTime` = NULL
4. WHEN 创建成功 THEN 系统 SHALL 返回新用户的完整信息

### Requirement 4: 用户信息更新

**User Story:** 作为管理员，我希望能够修改用户的基本信息（账号、密码、角色、状态），以便维护用户账号。

#### Acceptance Criteria

1. WHEN 管理员更新用户信息 THEN 系统 SHALL 验证用户是否存在
2. WHEN 修改账号 THEN 系统 SHALL 检查新账号是否与其他用户重复
3. WHEN 修改角色 THEN 系统 SHALL 自动调整该用户的默认权限
4. WHEN 修改状态为'inactive' THEN 系统 SHALL 确保该用户无法登录
5. WHEN 更新成功 THEN 系统 SHALL 返回更新后的用户信息

### Requirement 5: 用户删除

**User Story:** 作为管理员，我希望能够删除用户账号，以便清理离职员工的访问权限。

#### Acceptance Criteria

1. WHEN 管理员删除用户 THEN 系统 SHALL 执行逻辑删除（设置`isDelete`=1）
2. WHEN 删除用户 THEN 系统 SHALL 同时设置`userStatus`='inactive'
3. WHEN 删除自己的账号 THEN 系统 SHALL 返回400错误禁止操作
4. WHEN 删除成功 THEN 系统 SHALL 返回成功状态

### Requirement 6: 用户权限管理（31个页面权限）

**User Story:** 作为管理员，我希望能够为用户设置页面访问权限，以便精细化控制用户能访问哪些功能模块。

#### Acceptance Criteria

1. WHEN 管理员更新用户权限 THEN 系统 SHALL 接收31种页面权限的键值对（JSON格式）
2. WHEN 保存权限 THEN 系统 SHALL 验证JSON格式正确性
3. WHEN 权限更新成功 THEN 系统 SHALL 将JSON字符串存储到`pagePermissions`字段
4. WHEN 查询用户信息 THEN 系统 SHALL 将JSON字符串原样返回给前端（前端负责解析）
5. WHEN 创建新用户 THEN 系统 SHALL 根据角色自动设置默认权限：
   - **管理员**: 31个权限全部为 `true`
   - **普通用户**: 仅统计分析2个为 `true`，其他29个为 `false`

#### 页面权限清单（31个）

**说明**：
- **管理员**：默认拥有全部31个页面的访问权限
- **普通用户**：默认仅有2个页面权限（月度能耗统计、日能耗统计）

| 序号 | 权限Key | 路由Path | 页面名称 | 管理员默认 | 普通用户默认 |
|-----|---------|---------|---------|-----------|-------------|
| 1 | `月度能耗统计` | `/monthly-energy` | 月度能耗统计 | ✅ | ✅ |
| 2 | `日能耗统计` | `/hourly-energy` | 日能耗统计 | ✅ | ✅ |
| 3 | `用户管理系统` | `/user-management` | 用户管理系统 | ✅ | ❌ |
| 4 | `114_空调水机主机` | `/airConditioning` | 114_空调水机主机 | ✅ | ❌ |
| 5 | `110注射环保设备` | `/injection_workshop` | 110注射环保设备 | ✅ | ❌ |
| 6 | `102造粒环保设备` | `/granulation_workshop` | 102造粒环保设备 | ✅ | ❌ |
| 7 | `1#办公楼` | `/office_building` | 1#办公楼 | ✅ | ❌ |
| 8 | `101配料` | `/feeding_workshop` | 101配料 | ✅ | ❌ |
| 9 | `102造粒` | `/granule102` | 102造粒 | ✅ | ❌ |
| 10 | `103冷压` | `/cold-press-103` | 103冷压 | ✅ | ❌ |
| 11 | `104还原` | `/restoration-104` | 104还原 | ✅ | ❌ |
| 12 | `105烧结` | `/sintering-105` | 105烧结 | ✅ | ❌ |
| 13 | `106清洗` | `/cleaning-106` | 106清洗 | ✅ | ❌ |
| 14 | `107串珠` | `/beading-107` | 107串珠 | ✅ | ❌ |
| 15 | `109炼胶` | `/rubber-109` | 109炼胶 | ✅ | ❌ |
| 16 | `110注射` | `/injection-110` | 110注射 | ✅ | ❌ |
| 17 | `111开刃` | `/edging-111` | 111开刃 | ✅ | ❌ |
| 18 | `112终检` | `/final-inspection-112` | 112终检 | ✅ | ❌ |
| 19 | `113仓库` | `/warehouse-113` | 113仓库 | ✅ | ❌ |
| 20 | `114_2#厂房电梯` | `/elevator-114` | 114_2#厂房电梯 | ✅ | ❌ |
| 21 | `114_2#楼办公区域` | `/office-area-114` | 114_2#楼办公区域 | ✅ | ❌ |
| 22 | `114_2#楼会议室` | `/conference-room-114` | 114_2#楼会议室 | ✅ | ❌ |
| 23 | `114_2#楼实验室` | `/laboratory-114` | 114_2#楼实验室 | ✅ | ❌ |
| 24 | `114公共` | `/public-114` | 114公共 | ✅ | ❌ |
| 25 | `114空压机` | `/air-compressor-114` | 114空压机 | ✅ | ❌ |
| 26 | `充电桩` | `/charging-pile` | 充电桩 | ✅ | ❌ |
| 27 | `工具研发中心` | `/tool-rd-center` | 工具研发中心 | ✅ | ❌ |
| 28 | `门卫室` | `/guard-room` | 门卫室 | ✅ | ❌ |
| 29 | `食堂` | `/canteen` | 食堂 | ✅ | ❌ |
| 30 | `宿舍楼` | `/dormitory` | 宿舍楼 | ✅ | ❌ |
| 31 | `管理页` | `/admin/user` | 管理页-用户管理 | ✅ | ❌ |

#### JSON存储格式

**管理员默认权限（31个全部为true）**:
```json
{
  "月度能耗统计": true,
  "日能耗统计": true,
  "用户管理系统": true,
  "114_空调水机主机": true,
  "110注射环保设备": true,
  "102造粒环保设备": true,
  "1#办公楼": true,
  "101配料": true,
  "102造粒": true,
  "103冷压": true,
  "104还原": true,
  "105烧结": true,
  "106清洗": true,
  "107串珠": true,
  "109炼胶": true,
  "110注射": true,
  "111开刃": true,
  "112终检": true,
  "113仓库": true,
  "114_2#厂房电梯": true,
  "114_2#楼办公区域": true,
  "114_2#楼会议室": true,
  "114_2#楼实验室": true,
  "114公共": true,
  "114空压机": true,
  "充电桩": true,
  "工具研发中心": true,
  "门卫室": true,
  "食堂": true,
  "宿舍楼": true,
  "管理页": true
}
```

**普通用户默认权限（仅2个为true）**:
```json
{
  "月度能耗统计": true,
  "日能耗统计": true,
  "用户管理系统": false,
  "114_空调水机主机": false,
  "110注射环保设备": false,
  "102造粒环保设备": false,
  "1#办公楼": false,
  "101配料": false,
  "102造粒": false,
  "103冷压": false,
  "104还原": false,
  "105烧结": false,
  "106清洗": false,
  "107串珠": false,
  "109炼胶": false,
  "110注射": false,
  "111开刃": false,
  "112终检": false,
  "113仓库": false,
  "114_2#厂房电梯": false,
  "114_2#楼办公区域": false,
  "114_2#楼会议室": false,
  "114_2#楼实验室": false,
  "114公共": false,
  "114空压机": false,
  "充电桩": false,
  "工具研发中心": false,
  "门卫室": false,
  "食堂": false,
  "宿舍楼": false,
  "管理页": false
}
```

### Requirement 7: 用户状态管理

**User Story:** 作为管理员，我希望能够启用或禁用用户账号，以便临时限制用户访问而不删除账号。

#### Acceptance Criteria

1. WHEN 管理员设置用户状态为'inactive' THEN 系统 SHALL 更新`userStatus`字段
2. WHEN 用户状态为'inactive' THEN 该用户 SHALL 无法登录系统
3. WHEN 管理员设置用户状态为'active' THEN 该用户 SHALL 恢复登录权限
4. WHEN 修改自己的状态为'inactive' THEN 系统 SHALL 返回400错误禁止操作

### Requirement 8: 最后登录时间更新

**User Story:** 作为系统，我希望能够自动记录用户的最后登录时间，以便追踪用户活跃度。

#### Acceptance Criteria

1. WHEN 用户登录成功 THEN 系统 SHALL 自动更新该用户的`lastLoginTime`为当前时间
2. WHEN 登录失败 THEN 系统 SHALL 不更新`lastLoginTime`
3. WHEN 管理员查看用户列表 THEN 系统 SHALL 显示每个用户的最后登录时间

## Non-Functional Requirements

### Code Architecture and Modularity

- **分层架构**: 严格遵循Controller → Service → Mapper三层架构
- **DTO分离**: 使用独立的DTO类而不是直接返回Entity
- **权限校验**: 在Controller层使用`@AuthCheck`注解进行权限验证
- **JSON处理**: 使用Fastjson处理`pagePermissions`的序列化和反序列化
- **复用现有代码**: 
  - 复用`com.yupi.springbootinit.model.entity.User`实体类（需添加3个新字段）
  - 复用`com.yupi.springbootinit.common.BaseResponse`统一响应格式
  - 复用`com.yupi.springbootinit.annotation.AuthCheck`权限校验注解

### Performance

- 用户列表查询应支持分页，单页不超过100条记录
- 权限JSON字段应控制在1KB以内
- 查询用户时应使用索引（`idx_userAccount`、`idx_userStatus`）
- 避免N+1查询问题

### Security

- 密码虽然明文存储（与现有系统保持一致），但仅管理员可查看
- 所有用户管理接口都需要管理员权限（`@AuthCheck(mustRole = "admin")`）
- 用户无法修改自己的权限
- 用户无法删除或禁用自己的账号
- API接口需要登录态验证

### Reliability

- 数据库操作失败时返回清晰的错误信息
- 并发更新用户信息时使用乐观锁（`updateTime`字段）
- JSON解析失败时返回明确的错误提示
- 关键操作（创建、更新、删除）需记录日志

### Usability

- 错误信息应该清晰易懂（中文）
- API响应格式统一使用`BaseResponse<T>`
- 字段命名与前端保持一致（前端使用username对应后端userAccount）
- 支持批量操作（如批量启用/禁用用户）

### Database

- 使用现有的`user`表，添加3个新字段：
  - `userStatus` varchar(20) NOT NULL DEFAULT 'active'
  - `lastLoginTime` datetime NULL
  - `pagePermissions` text NULL
- 为`userStatus`添加索引以提升查询性能
- 所有现有数据需要迁移默认值
