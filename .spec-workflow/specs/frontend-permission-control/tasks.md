# Tasks Document - 前端权限控制系统

## Overview

本任务文档将前端权限控制系统的设计分解为可执行的具体任务。根据Design文档，整个实现**仅需修改4个文件**，不创建任何新文件。

**实现策略**：
- ✅ 扩展现有文件，不创建新文件
- ✅ 复用Umi Max内置权限机制
- ✅ 30个业务页面权限 + 管理页独立控制

**核心变化**：
- UserManagement 已移至 `/admin` 目录，由 `canAdmin` 统一控制
- pagePermissions 从31个减少到30个（移除 `user-management`）

---

## Task 1: 扩展 TypeScript 类型定义

- [x] 1. 在typings.d.ts中添加权限相关类型定义
  - **Status**: Pending
  - **File**: `front/src/typings.d.ts`
  - **Description**: 为权限系统添加完整的 TypeScript 类型支持，扩展InitialState和API接口
  - **Details**:
    - 扩展 `InitialState` 接口，添加 `pagePermissions?: Record<string, boolean>` 字段
    - 扩展 `API.User` 接口，添加3个新字段：
      - `userStatus?: string` - 用户状态
      - `lastLoginTime?: string` - 最后登录时间
      - `pagePermissions?: string` - 页面权限（JSON字符串）
    - 扩展 `API.LoginUserVO` 接口，添加相同的3个字段
    - 为每个字段添加TypeScript类型注释
    - 保持现有类型定义不变
  - **_Leverage**:
    - 现有的 `InitialState` 类型定义
    - 现有的 `API` 命名空间
    - 现有的类型定义模式
  - **_Requirements**: Requirements 1.1, 2.1
  - **_Prompt**:
    ```
    Implement the task for spec frontend-permission-control, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: TypeScript Developer specializing in type systems and interfaces
    
    Task: Extend existing TypeScript type definitions in front/src/typings.d.ts to support the permission system following Requirements 1.1 and 2.1.
    
    Requirements:
    - Extend InitialState interface with pagePermissions field (type: Record<string, boolean>)
    - Extend API.User interface with 3 new fields:
      - userStatus?: string
      - lastLoginTime?: string
      - pagePermissions?: string (JSON string type)
    - Extend API.LoginUserVO interface with the same 3 fields
    - Add TypeScript comments for each field
    - Do NOT modify existing type definitions
    
    Leverage:
    - Existing InitialState type definition
    - Existing API namespace structure
    - Existing type definition patterns in the file
    
    Restrictions:
    - Only ADD type definitions, do NOT modify existing ones
    - Keep naming consistent with existing patterns
    - Do NOT add complex nested types
    - Ensure all types are properly exported/declared
    
    Success Criteria:
    - [x] InitialState.pagePermissions added (type: Record<string, boolean>)
    - [x] API.User extended with 3 new fields
    - [x] API.LoginUserVO extended with 3 new fields
    - [x] All fields have proper TypeScript types
    - [x] TypeScript compiles without errors
    - [x] No breaking changes to existing types
    
    After completing:
    1. Mark task 1 as in progress [-] in tasks.md
    2. Implement the code
    3. Run `npm run build` to verify TypeScript compilation
    4. Mark as completed [x] in tasks.md
    5. Proceed to Task 2
    ```

**Implementation Code**:
```typescript
// front/src/typings.d.ts

// 定义 InitialState 类型
interface InitialState {
  currentUser?: API.LoginUserVO | API.User;
  pagePermissions?: Record<string, boolean>; // 新增：页面权限对象
}

// 扩展 User 和 LoginUserVO 类型
declare namespace API {
  interface User {
    id?: number;
    userAccount?: string;
    userPassword?: string;
    userName?: string;
    userAvatar?: string;
    userRole?: string;
    userStatus?: string;           // 新增：用户状态
    lastLoginTime?: string;        // 新增：最后登录时间
    pagePermissions?: string;      // 新增：页面权限（JSON字符串）
    createTime?: string;
    updateTime?: string;
    isDelete?: number;
  }

  interface LoginUserVO {
    id?: number;
    userAccount?: string;
    userName?: string;
    userAvatar?: string;
    userRole?: string;
    userStatus?: string;           // 新增：用户状态
    lastLoginTime?: string;        // 新增：最后登录时间
    pagePermissions?: string;      // 新增：页面权限（JSON字符串）
    createTime?: string;
  }
}
```

**Verification Steps**:
```bash
# 验证TypeScript编译
cd front
npm run build

# 检查类型定义
npx tsc --noEmit
```

**Notes**:
- ⚠️ `pagePermissions` 在 `InitialState` 中为对象类型（解析后），在 `API` 接口中为字符串类型（原始JSON）
- ✅ 保持与现有代码风格一致
- ✅ 不影响现有类型定义

**Estimated Time**: 15分钟

---

## Task 2: 实现权限加载和解析逻辑

- [x] 2. 在app.tsx中添加权限加载和JSON解析逻辑
  - **Status**: Pending
  - **File**: `front/src/app.tsx`
  - **Description**: 在用户登录时加载并解析页面权限，处理各种错误情况
  - **Details**:
    - 在 `getInitialState()` 函数中初始化 `pagePermissions: {}`
    - 调用 `getLoginUserUsingGet()` 获取用户信息
    - 使用 `JSON.parse()` 解析 `res.data.pagePermissions` 字符串
    - 将解析后的权限对象存储到 `initialState.pagePermissions`
    - **错误处理1**: JSON解析失败 → 跳转 `/404`，输出错误日志
    - **错误处理2**: 权限字段为空 → 跳转 `/404`，输出错误日志
    - **成功处理**: 输出 "✅ 权限加载成功" 日志
    - 不影响现有的用户登录流程和错误处理
  - **_Leverage**:
    - 现有的 `getLoginUserUsingGet()` API调用
    - 现有的 `history` 路由跳转逻辑
    - 现有的 `getInitialState()` 函数结构
    - 现有的错误处理模式
  - **_Requirements**: Requirements 1.2, Design Component 1
  - **_Prompt**:
    ```
    Implement the task for spec frontend-permission-control, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: Frontend Developer specializing in React and state management
    
    Task: Implement permission loading and JSON parsing logic in front/src/app.tsx within the getInitialState() function following Requirements 1.2 and Design Component 1.
    
    Requirements:
    - Initialize pagePermissions: {} in initialState
    - Parse res.data.pagePermissions JSON string using JSON.parse()
    - Store parsed permissions in initialState.pagePermissions
    - Handle JSON parse failure: redirect to /404 with error log
    - Handle empty permissions field: redirect to /404 with error log
    - Log success message "✅ 权限加载成功" on successful parse
    - Do NOT modify existing login flow
    - Do NOT change method signature or return type
    
    Leverage:
    - Existing getLoginUserUsingGet() API call
    - Existing history.push() for navigation
    - Existing try-catch error handling structure
    - Existing loginPath constant
    
    Restrictions:
    - Only ADD code within getInitialState(), do NOT modify other functions
    - Do NOT provide default permissions on error (must redirect to 404)
    - Do NOT change existing error handling for API failures
    - Keep console.log/error for debugging
    
    Success Criteria:
    - [x] pagePermissions initialized in initialState
    - [x] JSON.parse() used to parse permissions string
    - [x] Parse failure redirects to /404 with error log
    - [x] Empty field redirects to /404 with error log
    - [x] Success logged to console
    - [x] Code compiles without errors
    - [x] Existing login flow unaffected
    
    After completing:
    1. Mark task 2 as in progress [-] in tasks.md
    2. Implement the code
    3. Test with valid JSON permissions
    4. Test with invalid JSON (should redirect to 404)
    5. Test with null permissions (should redirect to 404)
    6. Mark as completed [x] in tasks.md
    7. Proceed to Task 3
    ```

**Implementation Code**:
```typescript
// front/src/app.tsx
export async function getInitialState(): Promise<InitialState> {
  const initialState: InitialState = {
    currentUser: undefined,
    pagePermissions: {}, // 新增：存储解析后的权限
  };
  
  const { location } = history;
  if (location.pathname !== loginPath) {
    try {
      const res = await getLoginUserUsingGet();
      initialState.currentUser = res.data;
      
      // 🔑 新增：解析 pagePermissions JSON
      if (res.data?.pagePermissions) {
        try {
          const permissions = JSON.parse(res.data.pagePermissions);
          initialState.pagePermissions = permissions;
          console.log('✅ 权限加载成功:', permissions);
        } catch (error) {
          console.error('❌ 解析权限JSON失败，用户权限配置异常:', error);
          // 权限解析失败，跳转到404页面
          history.push('/404');
          return initialState;
        }
      } else {
        // 权限字段为空，跳转到404页面
        console.error('❌ 用户权限字段为空');
        history.push('/404');
        return initialState;
      }
    } catch (error: any) {
      history.push(`${loginPath}?redirect=${encodeURIComponent(location.pathname)}`);
    }
  }
  return initialState;
}
```

**Verification Steps**:
```bash
# 1. 启动开发服务器
cd front
npm run dev

# 2. 测试场景1：正常登录（有效JSON）
# - 登录管理员账号
# - 检查控制台是否输出 "✅ 权限加载成功"
# - 检查 initialState.pagePermissions 是否正确解析

# 3. 测试场景2：JSON解析失败
# - 修改数据库用户的 pagePermissions 为无效JSON: "{invalid}"
# - 登录该用户
# - 验证是否跳转到 /404 页面
# - 检查控制台输出 "❌ 解析权限JSON失败"

# 4. 测试场景3：权限字段为空
# - 修改数据库用户的 pagePermissions 为 NULL
# - 登录该用户
# - 验证是否跳转到 /404 页面
# - 检查控制台输出 "❌ 用户权限字段为空"
```

**Notes**:
- ⚠️ **不提供默认权限**: 解析失败或字段为空时必须跳转404，不能使用默认权限
- ⚠️ **保持日志清晰**: 使用 ✅ 和 ❌ emoji 方便快速识别
- ✅ **不影响现有流程**: API调用失败时仍重定向到登录页

**Estimated Time**: 30分钟

---

## Task 3: 实现30个业务页面权限函数

- [x] 3. 在access.ts中生成30个业务页面的权限判断函数
  - **Status**: Pending
  - **File**: `front/src/access.ts`
  - **Description**: 根据 `pagePermissions` 为30个业务页面创建独立的权限函数，移除 `canAccessUserManagement`
  - **Details**:
    - 从 `initialState` 解构 `currentUser` 和 `pagePermissions`
    - 保留 `canUser` 和 `canAdmin` 基础权限（向后兼容）
    - **移除** `canAccessUserManagement` 权限函数
    - 为以下**30个业务页面**创建权限函数：
      1. monthly-energy
      2. hourly-energy
      3. airConditioning
      4. injection_workshop
      5. granulation_workshop
      6. office_building
      7. feeding_workshop
      8. granule102
      9. cold-press-103
      10. restoration-104
      11. sintering-105
      12. cleaning-106
      13. beading-107
      14. rubber-109
      15. injection-110
      16. edging-111
      17. final-inspection-112
      18. warehouse-113
      19. elevator-114
      20. office-area-114
      21. conference-room-114
      22. laboratory-114
      23. public-114
      24. air-compressor-114
      25. charging-pile
      26. tool-rd-center
      27. guard-room
      28. canteen
      29. dormitory
    - 每个权限函数使用 `=== true` 进行显式布尔判断
    - 添加清晰的注释说明权限来源和控制逻辑
    - `canAdmin` 仅用于 `/admin` 路由控制，不影响业务页面
  - **_Leverage**:
    - 现有的 `access()` 函数结构
    - 现有的 `canUser` 和 `canAdmin` 权限逻辑
    - Task 1 中定义的 `InitialState` 类型
  - **_Requirements**: Requirements 2.1, Design Component 2
  - **_Prompt**:
    ```
    Implement the task for spec frontend-permission-control, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: Frontend Developer specializing in React access control and Umi Max
    
    Task: Rewrite the access() function in front/src/access.ts to generate 30 business page permission functions based on pagePermissions, following Requirements 2.1 and Design Component 2.
    
    Requirements:
    - Destructure currentUser and pagePermissions from initialState
    - Keep canUser and canAdmin for backward compatibility
    - REMOVE canAccessUserManagement function (UserManagement uses canAdmin)
    - Create 30 permission functions for business pages:
      - Function naming: canAccessXXX (camelCase)
      - Permission check: pagePermissions['key-name'] === true
      - Use explicit boolean comparison (=== true)
    - Add clear comments explaining permission source
    - canAdmin only for /admin route control
    
    Leverage:
    - Existing access() function structure
    - Existing canUser and canAdmin logic
    - InitialState type from Task 1
    
    Restrictions:
    - Do NOT use isAdmin || pagePermissions[key] pattern
    - Do NOT auto-grant permissions to admin for business pages
    - Keep all 30 functions in single return object
    - Do NOT add validation logic (handled in app.tsx)
    
    Success Criteria:
    - [x] 30 business page permission functions created
    - [x] canAccessUserManagement removed
    - [x] Each function uses === true comparison
    - [x] canUser and canAdmin preserved
    - [x] Code compiles without TypeScript errors
    - [x] Clear comments added
    
    After completing:
    1. Mark task 3 as in progress [-] in tasks.md
    2. Implement the code
    3. Verify TypeScript compilation
    4. Count functions (should be 30 + 2 base permissions)
    5. Mark as completed [x] in tasks.md
    6. Proceed to Task 4
    ```

**Implementation Code**:
```typescript
// front/src/access.ts
/**
 * 权限控制
 * 所有用户（包括管理员）统一从 pagePermissions 获取权限
 */
export default function access(initialState: InitialState | undefined) {
  const { currentUser, pagePermissions = {} } = initialState ?? {};
  
  if (!currentUser) {
    return {
      canUser: false,
      canAdmin: false,
    };
  }

  // 判断是否为管理员（仅用于 /admin 路由的访问控制）
  const isAdmin = currentUser.userRole === 'admin';

  // 返回权限对象
  return {
    // 基础权限
    canUser: !!currentUser,
    canAdmin: isAdmin,

    // 🔑 30个业务页面的动态权限（统一从 pagePermissions 读取）
    // 注意：user-management 已移除，由 canAdmin 控制
    canAccessMonthlyEnergy: pagePermissions['monthly-energy'] === true,
    canAccessHourlyEnergy: pagePermissions['hourly-energy'] === true,
    canAccessAirConditioning: pagePermissions['airConditioning'] === true,
    canAccessInjectionWorkshop: pagePermissions['injection_workshop'] === true,
    canAccessGranulationWorkshop: pagePermissions['granulation_workshop'] === true,
    canAccessOfficeBuilding: pagePermissions['office_building'] === true,
    canAccessFeedingWorkshop: pagePermissions['feeding_workshop'] === true,
    canAccessGranule102: pagePermissions['granule102'] === true,
    canAccessColdPress103: pagePermissions['cold-press-103'] === true,
    canAccessRestoration104: pagePermissions['restoration-104'] === true,
    canAccessSintering105: pagePermissions['sintering-105'] === true,
    canAccessCleaning106: pagePermissions['cleaning-106'] === true,
    canAccessBeading107: pagePermissions['beading-107'] === true,
    canAccessRubber109: pagePermissions['rubber-109'] === true,
    canAccessInjection110: pagePermissions['injection-110'] === true,
    canAccessEdging111: pagePermissions['edging-111'] === true,
    canAccessFinalInspection112: pagePermissions['final-inspection-112'] === true,
    canAccessWarehouse113: pagePermissions['warehouse-113'] === true,
    canAccessElevator114: pagePermissions['elevator-114'] === true,
    canAccessOfficeArea114: pagePermissions['office-area-114'] === true,
    canAccessConferenceRoom114: pagePermissions['conference-room-114'] === true,
    canAccessLaboratory114: pagePermissions['laboratory-114'] === true,
    canAccessPublic114: pagePermissions['public-114'] === true,
    canAccessAirCompressor114: pagePermissions['air-compressor-114'] === true,
    canAccessChargingPile: pagePermissions['charging-pile'] === true,
    canAccessToolRDCenter: pagePermissions['tool-rd-center'] === true,
    canAccessGuardRoom: pagePermissions['guard-room'] === true,
    canAccessCanteen: pagePermissions['canteen'] === true,
    canAccessDormitory: pagePermissions['dormitory'] === true,
  };
}
```

**Verification Steps**:
```bash
# 1. 验证TypeScript编译
cd front
npx tsc --noEmit

# 2. 验证权限函数数量
# - 打开 access.ts
# - 统计返回对象中的属性数量
# - 应该有 32 个: 2个基础权限 + 30个业务页面权限

# 3. 验证权限Key一致性
# - 确保所有 pagePermissions['key'] 与后端数据库的key完全一致
# - 例如: 'monthly-energy', 'hourly-energy', 'airConditioning' 等

# 4. 验证移除了 canAccessUserManagement
# - 搜索文件内容，确认没有 canAccessUserManagement
```

**Notes**:
- ⚠️ **严格布尔判断**: 使用 `=== true` 避免隐式类型转换
- ⚠️ **权限Key一致性**: 必须与后端数据库的key完全一致
- ⚠️ **UserManagement特殊处理**: 由 `canAdmin` 控制，不在此处配置
- ✅ **向后兼容**: 保留 `canUser` 和 `canAdmin` 避免影响现有代码

**Estimated Time**: 45分钟

---

## Task 4: 更新路由配置的权限字段

- [x] 4. 在routes.ts中更新30个业务页面路由的access字段
  - **Status**: Pending
  - **File**: `front/config/routes.ts`
  - **Description**: 为30个业务页面路由配置对应的权限标识，确保UserManagement作为/admin子路由无需额外权限配置
  - **Details**:
    - 将30个业务页面的 `access: 'canUser'` 替换为具体的权限函数名（如 `canAccessMonthlyEnergy`）
    - 确保 `/admin` 路由及其子路由使用 `canAdmin` 权限
    - **UserManagement子路由**: 不配置 `access` 字段，继承父路由的 `canAdmin` 权限
    - 保持登录路由、默认重定向、404路由不变
    - 添加注释说明UserManagement的权限继承逻辑
    - 确保路由配置语法正确
  - **30个业务页面路由映射**:
    | 路由Path | 权限函数名 |
    |----------|-----------|
    | `/monthly-energy` | `canAccessMonthlyEnergy` |
    | `/hourly-energy` | `canAccessHourlyEnergy` |
    | `/airConditioning` | `canAccessAirConditioning` |
    | `/injection_workshop` | `canAccessInjectionWorkshop` |
    | `/granulation_workshop` | `canAccessGranulationWorkshop` |
    | `/office_building` | `canAccessOfficeBuilding` |
    | `/feeding_workshop` | `canAccessFeedingWorkshop` |
    | `/granule102` | `canAccessGranule102` |
    | `/cold-press-103` | `canAccessColdPress103` |
    | `/restoration-104` | `canAccessRestoration104` |
    | `/sintering-105` | `canAccessSintering105` |
    | `/cleaning-106` | `canAccessCleaning106` |
    | `/beading-107` | `canAccessBeading107` |
    | `/rubber-109` | `canAccessRubber109` |
    | `/injection-110` | `canAccessInjection110` |
    | `/edging-111` | `canAccessEdging111` |
    | `/final-inspection-112` | `canAccessFinalInspection112` |
    | `/warehouse-113` | `canAccessWarehouse113` |
    | `/elevator-114` | `canAccessElevator114` |
    | `/office-area-114` | `canAccessOfficeArea114` |
    | `/conference-room-114` | `canAccessConferenceRoom114` |
    | `/laboratory-114` | `canAccessLaboratory114` |
    | `/public-114` | `canAccessPublic114` |
    | `/air-compressor-114` | `canAccessAirCompressor114` |
    | `/charging-pile` | `canAccessChargingPile` |
    | `/tool-rd-center` | `canAccessToolRDCenter` |
    | `/guard-room` | `canAccessGuardRoom` |
    | `/canteen` | `canAccessCanteen` |
    | `/dormitory` | `canAccessDormitory` |
  - **_Leverage**:
    - 现有的路由结构和配置
    - 现有的组件路径
    - 现有的图标配置
    - Task 3 中定义的权限函数
  - **_Requirements**: Requirements 3.1, Design Component 3
  - **_Prompt**:
    ```
    Implement the task for spec frontend-permission-control, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: Frontend Developer specializing in routing and Umi Max configuration
    
    Task: Update route access configuration in front/config/routes.ts for 30 business pages, following Requirements 3.1 and Design Component 3.
    
    Requirements:
    - Update 30 business page routes: change access from 'canUser' to specific permission function
    - Keep /admin route and sub-routes using 'canAdmin'
    - UserManagement sub-route: do NOT add access field (inherits canAdmin from parent)
    - Keep login, redirect, and 404 routes unchanged
    - Add comment explaining UserManagement permission inheritance
    - Use exact function names from Task 3 (e.g., canAccessMonthlyEnergy)
    
    Route Mapping (30 routes):
    - /monthly-energy → canAccessMonthlyEnergy
    - /hourly-energy → canAccessHourlyEnergy
    - /airConditioning → canAccessAirConditioning
    - ... (see full mapping table in Details)
    
    Leverage:
    - Existing route structure in routes.ts
    - Existing component paths
    - Permission functions from Task 3
    - Existing icon configurations
    
    Restrictions:
    - Only MODIFY access field, do NOT change path/component/name
    - Do NOT add access field to UserManagement sub-route
    - Do NOT modify /admin route's access (keep canAdmin)
    - Ensure no syntax errors in route configuration
    
    Success Criteria:
    - [x] All 30 business routes updated with correct access field
    - [x] /admin route uses canAdmin
    - [x] UserManagement sub-route has no access field
    - [x] Route config file syntax valid
    - [x] No compilation errors
    - [x] Menu displays correctly based on permissions
    
    After completing:
    1. Mark task 4 as in progress [-] in tasks.md
    2. Implement the code changes
    3. Verify syntax with `npm run build`
    4. Test menu visibility with different user permissions
    5. Mark as completed [x] in tasks.md
    6. Proceed to Task 5
    ```

**Implementation Code** (部分路由示例):
```typescript
// front/config/routes.ts
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      { path: 'login', component: './User/Login' },
      { path: '', redirect: '/user/login' },
    ],
  },
  // ============================================
  // 30个业务页面路由（使用动态权限）
  // ============================================
  {
    path: '/monthly-energy',
    name: '月度能耗统计',
    icon: 'BarChartOutlined',
    component: './MonthlyEnergy',
    access: 'canAccessMonthlyEnergy', // 修改
  },
  {
    path: '/hourly-energy',
    name: '日能耗统计',
    icon: 'LineChartOutlined',
    component: './HourlyEnergy',
    access: 'canAccessHourlyEnergy', // 修改
  },
  {
    path: '/airConditioning',
    name: '114_空调水机主机',
    icon: 'WalletFilled',
    component: './AirConditioning',
    access: 'canAccessAirConditioning', // 修改
  },
  {
    path: '/injection_workshop',
    name: '110注射环保设备',
    icon: 'experiment',
    component: './InjectionWorkshop',
    access: 'canAccessInjectionWorkshop', // 修改
  },
  // ... 其余26个业务页面路由类似修改 ...
  
  // ============================================
  // 管理页路由（使用canAdmin统一控制）
  // ============================================
  {
    path: '/admin',
    icon: 'crown',
    name: '管理页',
    access: 'canAdmin', // 控制整个管理页区域（包括所有子页面）
    routes: [
      { path: '', redirect: 'user-management' },
      { icon: 'table', path: 'user', component: './Admin/User', name: '用户列表' },
      { 
        icon: 'UserOutlined', 
        path: 'user-management', 
        component: './Admin/UserManagement', 
        name: '用户管理系统' 
        // 继承父路由的 canAdmin 权限，无需额外配置 access
      },
    ],
  },
  { path: '/', redirect: '/monthly-energy'},
  { path: '*', layout: false, component: './404' },
];
```

**Verification Steps**:
```bash
# 1. 验证语法正确性
cd front
npm run build

# 2. 验证路由数量
# - 统计配置了 access 字段的业务页面路由
# - 应该有30个业务页面 + 1个管理页

# 3. 启动开发服务器测试菜单显示
npm run dev

# 4. 测试场景1：管理员账号
# - 登录管理员
# - 验证30个业务菜单根据 pagePermissions 显示/隐藏
# - 验证"管理页"菜单显示（因为 canAdmin=true）

# 5. 测试场景2：普通用户账号
# - 登录普通用户
# - 验证仅显示已授权的业务菜单
# - 验证"管理页"菜单不显示（因为 canAdmin=false）
```

**Notes**:
- ⚠️ **UserManagement特殊处理**: 作为 `/admin` 子路由，继承父路由的 `canAdmin` 权限
- ⚠️ **权限函数命名**: 必须与Task 3中定义的函数名完全一致
- ✅ **路由数量核对**: 确保30个业务页面全部配置正确

**Estimated Time**: 1小时

---

## Task 5: 集成测试和验收

- [x] 5. 端到端测试和验证
  - **Status**: Pending
  - **Description**: 验证前端权限控制系统的完整功能和正确性，测试所有场景
  - **Details**:
    - 启动前端开发服务器
    - 使用浏览器进行手动测试
    - 验证5个主要测试场景
    - 检查控制台日志输出
    - 验证TypeScript编译
    - 验证菜单显示/隐藏逻辑
    - 验证路由访问控制
  - **_Requirements**: All Requirements (1-8)
  - **_Prompt**:
    ```
    Implement the task for spec frontend-permission-control, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: QA Engineer and Integration Specialist
    
    Task: Perform comprehensive end-to-end testing for the frontend permission control system, covering all Requirements and ensuring correct menu display and route access control.
    
    Testing Scope:
    
    ### 5.1 管理员完整流程测试
    1. **Test Case**: Admin login and full access
       - Action: Login with admin account
       - Expected:
         - ✅ Console logs "✅ 权限加载成功"
         - ✅ 30 business menus display based on pagePermissions config
         - ✅ "管理页" menu displays (because canAdmin=true)
         - ✅ Can access all authorized business pages
         - ✅ Can access /admin/user-management
         - ✅ Can access /admin/user
    
    ### 5.2 普通用户受限流程测试
    1. **Test Case**: Regular user login with limited permissions
       - Action: Login with regular user account
       - Expected:
         - ✅ Console logs "✅ 权限加载成功"
         - ✅ Only authorized business menus display (default: monthly, hourly)
         - ✅ "管理页" menu does NOT display (because canAdmin=false)
         - ✅ Accessing unauthorized business page redirects to 403
         - ✅ Accessing /admin/user-management redirects to 403
         - ✅ Accessing /admin/user redirects to 403
    
    ### 5.3 权限解析失败测试
    1. **Test Case**: Invalid JSON in pagePermissions
       - Setup: Set user's pagePermissions to invalid JSON: "{invalid}"
       - Action: Login with this user
       - Expected:
         - ✅ Redirects to /404 page
         - ✅ Console logs "❌ 解析权限JSON失败"
    
    ### 5.4 权限字段为空测试
    1. **Test Case**: Null pagePermissions field
       - Setup: Set user's pagePermissions to NULL in database
       - Action: Login with this user
       - Expected:
         - ✅ Redirects to /404 page
         - ✅ Console logs "❌ 用户权限字段为空"
    
    ### 5.5 权限动态调整测试
    1. **Test Case**: Add permission to regular user
       - Setup: Admin adds airConditioning permission to regular user
       - Action: Regular user re-login
       - Expected:
         - ✅ "114_空调水机主机" menu appears
         - ✅ Can access /airConditioning page
         - ✅ "管理页" menu still does NOT display
    
    2. **Test Case**: Remove permission from user
       - Setup: Admin removes monthly-energy permission
       - Action: User re-login
       - Expected:
         - ✅ "月度能耗统计" menu disappears
         - ✅ Accessing /monthly-energy redirects to 403
    
    ### 5.6 TypeScript编译验证
    1. **Test Case**: TypeScript compilation
       - Action: Run `npm run build`
       - Expected:
         - ✅ No TypeScript errors
         - ✅ Build succeeds
    
    ### 5.7 控制台日志验证
    1. **Test Case**: Console output
       - Action: Login with various users
       - Expected:
         - ✅ Success: "✅ 权限加载成功: {object}"
         - ✅ Parse failure: "❌ 解析权限JSON失败，用户权限配置异常"
         - ✅ Empty field: "❌ 用户权限字段为空"
    
    Leverage:
    - Browser DevTools for console inspection
    - Ant Design Pro menu system
    - Database tools for permission modification
    - Backend running for API calls
    
    Success Criteria:
    - [x] All 5 test scenarios pass
    - [x] Admin can access all authorized business pages + admin pages
    - [x] Regular user can only access authorized business pages
    - [x] Unauthorized access redirects to 403
    - [x] Invalid permissions redirect to 404
    - [x] Console logs are clear and accurate
    - [x] TypeScript compiles without errors
    - [x] All 30 business routes configured correctly
    - [x] Menu display logic correct
    
    After completing:
    1. Mark task 5 as in progress [-] in tasks.md
    2. Execute all test scenarios
    3. Document any issues found
    4. Fix any failures
    5. Re-test until all pass
    6. Mark as completed [x] in tasks.md
    7. Update spec status to "Completed"
    ```

**Test Scenarios Summary**:

| 测试场景 | 预期结果 | 验证方法 |
|---------|---------|---------|
| **场景1**: 管理员登录 | 30个业务菜单(根据配置) + 管理页菜单 | 查看侧边栏菜单 |
| **场景2**: 普通用户登录 | 仅已授权业务菜单，无管理页菜单 | 查看侧边栏菜单 |
| **场景3**: JSON解析失败 | 跳转404，控制台错误日志 | 检查页面和控制台 |
| **场景4**: 权限字段为空 | 跳转404，控制台错误日志 | 检查页面和控制台 |
| **场景5**: 权限动态调整 | 菜单增加/减少，访问权限变化 | 修改权限后重新登录 |

**Verification Checklist**:
```markdown
## 测试检查清单

### 管理员测试
- [ ] 登录成功，控制台输出 "✅ 权限加载成功"
- [ ] 30个业务菜单根据 pagePermissions 配置显示
- [ ] "管理页"菜单显示
- [ ] 可访问所有已授权业务页面
- [ ] 可访问 /admin/user-management
- [ ] 可访问 /admin/user

### 普通用户测试
- [ ] 登录成功，控制台输出 "✅ 权限加载成功"
- [ ] 仅显示已授权业务菜单（默认2个）
- [ ] "管理页"菜单不显示
- [ ] 访问未授权业务页面跳转403
- [ ] 访问 /admin/user-management 跳转403
- [ ] 访问 /admin/user 跳转403

### 错误处理测试
- [ ] JSON解析失败跳转404
- [ ] 控制台输出 "❌ 解析权限JSON失败"
- [ ] 权限字段为空跳转404
- [ ] 控制台输出 "❌ 用户权限字段为空"

### 权限动态调整测试
- [ ] 添加权限后重新登录，新菜单出现
- [ ] 可访问新授权的页面
- [ ] 移除权限后重新登录，菜单消失
- [ ] 访问已移除权限的页面跳转403

### 技术验证
- [ ] TypeScript编译无错误
- [ ] 所有30个路由配置正确
- [ ] 菜单显示/隐藏逻辑正确
- [ ] 路由访问控制正确
```

**Notes**:
- ⚠️ **充分测试**: 必须覆盖所有5个测试场景
- ⚠️ **数据准备**: 需要准备管理员和普通用户账号
- ⚠️ **数据库修改**: 测试场景3和4需要修改数据库
- ✅ **记录问题**: 发现任何问题立即记录并修复

**Estimated Time**: 2小时

---

## Summary

本任务列表将设计分解为 5 个主要任务：

1. ✅ **TypeScript类型定义** - 扩展typings.d.ts（3个接口）
2. ✅ **权限加载解析** - 修改app.tsx（JSON解析 + 错误处理）
3. ✅ **权限函数生成** - 重写access.ts（30个权限函数）
4. ✅ **路由权限配置** - 更新routes.ts（30个路由）
5. ⏳ **集成测试** - 端到端测试和验证（5个场景）

每个任务都包含：
- 明确的文件路径和状态标记
- 详细的实现要求和步骤
- 需要复用的组件（`_Leverage`）
- Requirements 引用（`_Requirements`）
- 完整的实现 Prompt（包含角色、任务、限制、成功标准）
- 实现代码示例
- 验证步骤
- 注意事项

**关键原则**：
- 只修改4个文件，不创建新文件
- 30个业务页面权限 + 管理页独立控制
- 错误处理严格（解析失败/字段为空都跳转404）
- 权限Key与后端数据库完全一致

**实现优势**：
✅ **极简化**: 仅修改4个文件，代码清晰  
✅ **低风险**: 基于Umi Max内置机制，稳定可靠  
✅ **易维护**: 权限配置集中，易于扩展  
✅ **向后兼容**: 保留基础权限，不影响现有功能

**开发时间估算**：
- Task 1 (类型定义): 15分钟
- Task 2 (权限加载): 30分钟
- Task 3 (权限函数): 45分钟
- Task 4 (路由配置): 1小时
- Task 5 (集成测试): 2小时

**总计**: ~4.5小时

---

## Next Steps

1. ✅ Requirements已完成
2. ✅ Design已完成
3. ✅ Tasks已完成
4. ⏳ **开始实现**: 按照Task 1 → 2 → 3 → 4 → 5的顺序执行
5. ⏳ 用户验收测试
6. ⏳ 生产环境部署
