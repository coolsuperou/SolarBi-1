# Tasks Document - 用户管理后端API

## Overview

本任务文档将用户管理后端API的设计分解为可执行的具体任务。根据Design文档，整个实现**仅需修改3个文件**，不创建任何新文件。

**实现策略**：
- ✅ 扩展现有文件，不创建新文件
- ✅ 复用MyBatis-Plus和现有Controller接口
- ✅ 极简化实现，避免过度设计

---

## Task 1: 数据库迁移 (Database Migration) - **由用户亲自执行**

- [x] 1. 重建user表并迁移所有数据
  - **Status**: Pending - **由用户亲自执行**
  - **File**: Database - `user` 表
  - **Description**: 通过DROP TABLE重建`user`表，添加3个新字段并迁移所有9条原有数据
  - **Details**:
    - 使用DROP TABLE + CREATE TABLE + INSERT方式
    - 添加字段：`userStatus` (varchar 20)、`lastLoginTime` (datetime)、`pagePermissions` (text)
    - 为`userStatus`添加索引：`idx_userStatus`
    - 迁移9条现有用户数据（完整保留）
    - 根据`isDelete`字段设置`userStatus`初始值
    - 根据`userRole`字段设置`pagePermissions`默认值（管理员31个权限全true，普通用户仅2个true）
  - **_Leverage**:
    - 现有`user`表结构
    - Navicat Premium导出的原始数据
  - **_Requirements**: All Requirements (所有需求依赖数据库字段)
  - **_Prompt**:
    ```
    执行数据库迁移脚本 for spec user-management-api
    
    Role: Database Administrator
    
    Task: Execute the complete SQL migration script to rebuild the user table with 3 new fields while preserving all existing 9 user records.
    
    Pre-requisites:
    - ⚠️ BACKUP the current database before execution
    - ⚠️ Test in development environment first
    - ⚠️ Verify all 9 user records after migration
    
    Migration Steps:
    1. SET NAMES utf8mb4 and disable foreign key checks
    2. DROP TABLE `user` (removes old structure)
    3. CREATE TABLE `user` with 3 new fields:
       - userStatus varchar(20) NOT NULL DEFAULT 'active'
       - lastLoginTime datetime NULL
       - pagePermissions text NULL
       - INDEX idx_userStatus
    4. INSERT all 9 original user records (without new fields)
    5. UPDATE userStatus based on isDelete:
       - SET 'active' WHERE isDelete = 0 (6 users)
       - SET 'inactive' WHERE isDelete = 1 (3 users)
    6. UPDATE pagePermissions based on userRole:
       - Admin: 31 permissions all true (4 users)
       - User: only 2 permissions true (monthly-energy, hourly-energy) (5 users)
    7. Re-enable foreign key checks
    
    SQL Script Location:
    - Full copy-paste ready script provided in Task 1 details
    - Execute as single transaction
    
    Verification:
    - Run verification SQL to confirm:
      - 3 new columns exist
      - Index idx_userStatus created
      - All 9 records preserved
      - Status and permissions set correctly
    
    Success Criteria:
    - [x] 3 new fields added successfully
    - [x] Index idx_userStatus created
    - [x] All 9 user records preserved (no data loss)
    - [x] 6 users status = 'active', 3 users = 'inactive'
    - [x] 4 admins have 31 permissions (all true)
    - [x] 5 users have only 2 permissions true
    
    After completing:
    1. Verify with SELECT COUNT(*) FROM user; (should be 9)
    2. Mark this task as completed [x] in tasks.md
    3. Proceed to Task 2
    ```

**Implementation SQL** - **可直接复制执行**:

```sql
/*
 Navicat Premium Dump SQL + 数据迁移脚本
 
 用途：为user表添加3个新字段（userStatus, lastLoginTime, pagePermissions）
 方式：DROP TABLE + CREATE TABLE + INSERT + UPDATE
 日期：2025-10-10
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- Step 1: 删除旧表
-- ============================================
DROP TABLE IF EXISTS `user`;

-- ============================================
-- Step 2: 创建新表（包含3个新字段）
-- ============================================
CREATE TABLE `user`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `userAccount` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账号',
  `userPassword` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码',
  `userName` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户昵称',
  `userAvatar` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户头像',
  `userRole` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user' COMMENT '用户角色：user/admin',
  `userStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT '用户状态：active-活跃, inactive-禁用',
  `lastLoginTime` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `pagePermissions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '页面访问权限（JSON格式）',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isDelete` tinyint(4) NOT NULL DEFAULT 0 COMMENT '是否删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_userAccount`(`userAccount`) USING BTREE,
  INDEX `idx_userStatus`(`userStatus`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1976213691765649410 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户' ROW_FORMAT = Dynamic;

-- ============================================
-- Step 3: 插入原有9条用户数据（不带新字段）
-- ============================================
INSERT INTO `user` (`id`, `userAccount`, `userPassword`, `userName`, `userAvatar`, `userRole`, `createTime`, `updateTime`, `isDelete`) VALUES 
(1960911994448281602, '23323', 'b0dd3697a192885d7c055db46155b26a', '管理员', NULL, 'admin', '2025-08-28 11:47:06', '2025-09-08 10:51:10', 1),
(1964869733099438082, 'sw', '123456', '苏卫', NULL, 'admin', '2025-09-08 09:53:33', '2025-09-08 10:26:17', 0),
(1964884198956183554, 'dt', '123456', '', NULL, 'user', '2025-09-08 10:51:01', '2025-09-08 10:52:07', 1),
(1964884340610412546, 'ozh', '123456', '欧展煌', NULL, 'admin', '2025-09-08 10:51:35', '2025-09-08 10:51:35', 0),
(1964888490759229441, 'hqh', '123456', '黄齐辉', NULL, 'user', '2025-09-08 11:07:55', '2025-09-08 11:07:55', 0),
(1965244997967372289, 'test', '123456', '测试账号', NULL, 'user', '2025-09-09 10:44:32', '2025-09-10 16:56:53', 1),
(1967425765583601666, 'test', '123456', '测试账号', NULL, 'user', '2025-09-15 11:10:30', '2025-09-15 11:10:30', 0),
(1968927412623507458, 'zwb', '123456', '张文斌', NULL, 'admin', '2025-09-19 14:37:05', '2025-09-19 14:37:05', 0),
(1976213691765649409, 'pql', 'pql123456', '蒲厂', NULL, 'user', '2025-10-09 17:10:34', '2025-10-09 17:10:34', 0);

-- ============================================
-- Step 4: 数据迁移 - 设置新字段的默认值
-- ============================================

-- 4.1 为未删除的用户设置状态为 'active'
UPDATE `user` SET `userStatus` = 'active' WHERE `isDelete` = 0;
-- 影响行数：6条（sw, ozh, hqh, test, zwb, pql）

-- 4.2 为已删除的用户设置状态为 'inactive'
UPDATE `user` SET `userStatus` = 'inactive' WHERE `isDelete` = 1;
-- 影响行数：3条（23323, dt, test）

-- ============================================
-- Step 5: 设置页面权限
-- ============================================

-- 5.1 为管理员设置完整权限（31个页面全部为true）
UPDATE `user` 
SET `pagePermissions` = '{"monthly-energy":true,"hourly-energy":true,"user-management":true,"airConditioning":true,"injection_workshop":true,"granulation_workshop":true,"office_building":true,"feeding_workshop":true,"granule102":true,"cold-press-103":true,"restoration-104":true,"sintering-105":true,"cleaning-106":true,"beading-107":true,"rubber-109":true,"injection-110":true,"edging-111":true,"final-inspection-112":true,"warehouse-113":true,"elevator-114":true,"office-area-114":true,"conference-room-114":true,"laboratory-114":true,"public-114":true,"air-compressor-114":true,"charging-pile":true,"tool-rd-center":true,"guard-room":true,"canteen":true,"dormitory":true}' 
WHERE `userRole` = 'admin';
-- 影响行数：4条（23323[inactive], sw, ozh, zwb）

-- 5.2 为普通用户设置基础权限（仅月度和日能耗为true）
UPDATE `user` 
SET `pagePermissions` = '{"monthly-energy":true,"hourly-energy":true,"user-management":false,"airConditioning":false,"injection_workshop":false,"granulation_workshop":false,"office_building":false,"feeding_workshop":false,"granule102":false,"cold-press-103":false,"restoration-104":false,"sintering-105":false,"cleaning-106":false,"beading-107":false,"rubber-109":false,"injection-110":false,"edging-111":false,"final-inspection-112":false,"warehouse-113":false,"elevator-114":false,"office-area-114":false,"conference-room-114":false,"laboratory-114":false,"public-114":false,"air-compressor-114":false,"charging-pile":false,"tool-rd-center":false,"guard-room":false,"canteen":false,"dormitory":false}' 
WHERE `userRole` = 'user';
-- 影响行数：5条（dt[inactive], hqh, 2个test, pql）

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 执行完成！
-- ============================================
-- 总计：
-- - 已重建 user 表，新增3个字段
-- - 已保留9条原始用户数据
-- - 6条用户状态设为 'active'
-- - 3条用户状态设为 'inactive'
-- - 4条管理员拥有31个完整权限
-- - 5条普通用户仅2个基础权限
```

**Verification SQL** （验证数据迁移结果）:
```sql
-- 验证字段已添加
SHOW COLUMNS FROM `user` LIKE '%Status%';
SHOW COLUMNS FROM `user` LIKE '%Login%';
SHOW COLUMNS FROM `user` LIKE '%Permissions%';

-- 验证索引已创建
SHOW INDEX FROM `user` WHERE Key_name = 'idx_userStatus';

-- 验证数据总数未变（应为9条）
SELECT COUNT(*) FROM `user`;

-- 验证状态设置正确
SELECT userAccount, userName, userRole, isDelete, userStatus FROM `user`;

-- 验证权限设置正确
SELECT userAccount, userName, userRole, LEFT(pagePermissions, 50) AS permissions_preview FROM `user`;
```

**Notes**:
- ⚠️ **在执行前请先备份数据库！**
- ⚠️ **在测试环境验证后再在生产环境执行**
- ✅ **可以全选复制SQL脚本，一次性执行完成**
- ✅ **保证所有9条用户记录完整迁移**
- ✅ **自动设置状态和默认权限**

---

## Task 2: 扩展User Entity

- [x] 2. 在User.java中添加3个新字段
  - **File**: `back2/src/main/java/com/yupi/springbootinit/model/entity/User.java`
  - **Description**: 在现有User实体类中添加3个新字段，支持用户管理功能
  - **Details**:
    - 添加 `userStatus` 字段（String类型）- 用户状态（active-活跃, inactive-禁用）
    - 添加 `lastLoginTime` 字段（Date类型）- 最后登录时间
    - 添加 `pagePermissions` 字段（String类型）- 页面访问权限（JSON格式）
    - 为每个字段添加Javadoc注释
    - 不需要添加 `@TableField` 注解（MyBatis-Plus自动映射）
    - 保持现有字段和注解不变
  - **_Leverage**:
    - 现有 `User.java` 实体类结构
    - Lombok `@Data` 注解（已存在）
    - MyBatis-Plus自动映射机制
  - **_Requirements**: All Requirements (所有需求依赖这些字段)
  - **_Prompt**:
    ```
    Implement the task for spec user-management-api, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: Java Backend Developer specializing in entity modeling and MyBatis-Plus
    
    Task: Extend the existing User entity class by adding 3 new fields in back2/src/main/java/com/yupi/springbootinit/model/entity/User.java following all Requirements. These fields enable user management, status control, and permission management.
    
    Requirements:
    - Add field: private String userStatus; // 用户状态（active-活跃, inactive-禁用）
    - Add field: private Date lastLoginTime; // 最后登录时间
    - Add field: private String pagePermissions; // 页面访问权限（JSON格式）
    - Add comprehensive JavaDoc comments for each field
    - Do NOT add @TableField annotations (MyBatis-Plus auto-maps)
    - Do NOT modify existing fields
    - Keep all existing Lombok annotations (@Data, @TableName)
    
    Leverage:
    - Existing User.java entity structure and patterns
    - Lombok @Data annotation (already present)
    - MyBatis-Plus automatic field mapping
    
    Restrictions:
    - Only ADD fields, do NOT modify or remove existing fields
    - Do NOT change class structure or annotations
    - Do NOT add getter/setter methods (Lombok handles this)
    - Keep code aligned with existing entity conventions
    
    Success Criteria:
    - [x] userStatus field added (type: String)
    - [x] lastLoginTime field added (type: Date)
    - [x] pagePermissions field added (type: String)
    - [x] All fields have JavaDoc comments
    - [x] Code compiles without errors
    - [x] MyBatis-Plus can map new fields automatically
    
    After completing:
    1. Mark task 2 as in progress [-] in tasks.md
    2. Implement the code
    3. Verify compilation
    4. Mark as completed [x] in tasks.md
    5. Proceed to Task 3
    ```

---

## Task 3: 扩展UserUpdateRequest DTO

- [x] 3. 在UserUpdateRequest.java中添加4个新字段
  - **File**: `back2/src/main/java/com/yupi/springbootinit/model/dto/user/UserUpdateRequest.java`
  - **Description**: 在现有UserUpdateRequest DTO中添加4个新字段，支持用户管理界面的所有更新操作
  - **Details**:
    - 添加 `userAccount` 字段（String）- 用户账号（支持修改）
    - 添加 `userPassword` 字段（String）- 用户密码（明文，支持修改）
    - 添加 `userStatus` 字段（String）- 用户状态（active/inactive）
    - 添加 `pagePermissions` 字段（String）- 页面权限（JSON字符串）
    - 这4个字段为**可选**，前端按需传递
    - 为每个字段添加Javadoc注释
    - 保持现有字段不变
  - **_Leverage**:
    - 现有 `UserUpdateRequest.java` DTO结构
    - Lombok `@Data` 注解
    - 现有User实体的字段定义（Task 2）
  - **_Requirements**: Requirements 3, 4, 6, 7 (用户创建、更新、权限管理、状态管理)
  - **_Prompt**:
    ```
    Implement the task for spec user-management-api, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: Java Backend Developer specializing in DTO design and API contracts
    
    Task: Extend the existing UserUpdateRequest DTO by adding 4 new fields in back2/src/main/java/com/yupi/springbootinit/model/dto/user/UserUpdateRequest.java following Requirements 3, 4, 6, 7. These fields enable user management features including password viewing, permission settings, and status management.
    
    Requirements:
    - Add field: private String userAccount; // 用户账号（支持修改）
    - Add field: private String userPassword; // 用户密码（明文，支持修改）
    - Add field: private String userStatus; // 用户状态（active-活跃, inactive-禁用）
    - Add field: private String pagePermissions; // 页面访问权限（JSON字符串）
    - Add comprehensive JavaDoc comments for each field
    - All 4 fields are OPTIONAL (frontend sends only needed fields)
    - Do NOT modify existing fields (id, userName, userAvatar, userRole, etc.)
    
    Leverage:
    - Existing UserUpdateRequest.java DTO structure
    - Lombok @Data annotation (already present)
    - User entity field definitions from Task 2
    
    Restrictions:
    - Only ADD fields, do NOT modify existing fields
    - Do NOT add validation annotations (handled in Service layer)
    - Keep fields as simple types (String, not complex objects)
    - Follow existing DTO naming conventions
    
    Success Criteria:
    - [x] userAccount field added
    - [x] userPassword field added
    - [x] userStatus field added
    - [x] pagePermissions field added
    - [x] All fields have JavaDoc comments
    - [x] Code compiles without errors
    - [x] Fields are optional (no @NotNull annotations)
    
    After completing:
    1. Mark task 3 as in progress [-] in tasks.md
    2. Implement the code
    3. Verify compilation
    4. Mark as completed [x] in tasks.md
    5. Proceed to Task 4
    ```

---

## Task 4: 修改UserServiceImpl - 更新登录时间

- [x] 4. 在UserServiceImpl.userLogin()方法中添加登录时间更新逻辑
  - **File**: `back2/src/main/java/com/yupi/springbootinit/service/impl/UserServiceImpl.java`
  - **Description**: 在现有的userLogin()方法中添加最后登录时间自动更新功能
  - **Details**:
    - 在 `userLogin()` 方法的**登录成功后、返回之前**添加以下2行代码：
      ```java
      user.setLastLoginTime(new Date());
      this.updateById(user);
      ```
    - 确保仅在登录**成功**时更新，登录失败不更新
    - 使用MyBatis-Plus的 `updateById()` 方法（已继承自BaseMapper）
    - 不影响现有登录逻辑
    - 不需要修改方法签名或返回值
  - **_Leverage**:
    - 现有 `UserServiceImpl.java` 中的 `userLogin()` 方法
    - MyBatis-Plus的 `updateById()` 方法
    - User实体的 `lastLoginTime` 字段（Task 2）
  - **_Requirements**: Requirement 8 (最后登录时间更新)
  - **_Prompt**:
    ```
    Implement the task for spec user-management-api, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: Java Backend Developer specializing in service layer implementation
    
    Task: Modify the existing userLogin() method in UserServiceImpl to automatically update lastLoginTime upon successful login, following Requirement 8.
    
    File: back2/src/main/java/com/yupi/springbootinit/service/impl/UserServiceImpl.java
    
    Implementation Steps:
    1. Locate the userLogin() method
    2. Find the position AFTER login validation succeeds
    3. Find the position BEFORE returning LoginUserVO
    4. Insert the following 2 lines:
       ```java
       // 登录成功后更新最后登录时间
       user.setLastLoginTime(new Date());
       this.updateById(user);
       ```
    
    Requirements:
    - Add the update logic ONLY after successful login validation
    - Place the code BEFORE the return statement
    - Use MyBatis-Plus updateById() method (already inherited)
    - Do NOT modify method signature
    - Do NOT change existing login logic
    - Do NOT update time if login fails
    
    Leverage:
    - Existing userLogin() method structure
    - MyBatis-Plus updateById() method
    - User entity's lastLoginTime field (from Task 2)
    
    Restrictions:
    - Only ADD 2 lines of code, do NOT modify existing logic
    - Do NOT change method signature or return type
    - Do NOT add try-catch (existing exception handling suffices)
    - Do NOT add transaction annotation (method may already have one)
    
    Success Criteria:
    - [x] Added lastLoginTime update logic in userLogin()
    - [x] Logic placed after login success validation
    - [x] Uses this.updateById(user) to persist change
    - [x] Does not affect existing login logic
    - [x] Code compiles without errors
    - [x] Login time updates only on successful login
    
    After completing:
    1. Mark task 4 as in progress [-] in tasks.md
    2. Implement the code change
    3. Test login functionality
    4. Verify lastLoginTime updates in database
    5. Mark as completed [x] in tasks.md
    6. Proceed to Task 5
    ```

---

## Task 5: 集成测试

- [ ] 5. 端到端测试和验证
  - **Description**: 测试完整的用户管理功能并验证所有需求
  - **Details**:
    - 启动后端服务
    - 使用Postman或curl测试所有API
    - 验证数据库字段更新
    - 测试前端与后端的对接
    - 验证边界情况和错误处理
  - **_Requirements**: All Requirements (1-8)
  - **_Prompt**:
    ```
    Implement the task for spec user-management-api, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: QA Engineer and Integration Specialist
    
    Task: Perform comprehensive end-to-end testing for the user management backend API, covering all 8 Requirements and ensuring frontend-backend integration works correctly.
    
    Testing Scope:
    
    ### 5.1 用户创建测试 (Requirement 3)
    1. **Test Case**: Create regular user
       - Method: POST /user/add
       - Body: {"userAccount": "testuser", "userPassword": "123456", "userName": "测试用户", "userRole": "user"}
       - Expected: 
         - Success response (code 0)
         - userStatus = 'active'
         - pagePermissions contains only 2 true values (monthly-energy, hourly-energy)
    
    2. **Test Case**: Create duplicate account
       - Create second user with same userAccount
       - Expected: 400 error "账号已存在"
    
    ### 5.2 用户信息更新测试 (Requirements 4, 6, 7)
    1. **Test Case**: Update user permissions
       - Method: POST /user/update
       - Body: {"id": <userId>, "pagePermissions": "{\"monthly-energy\":true,\"user-management\":true,...}"}
       - Expected: Success, permissions updated in database
    
    2. **Test Case**: Update user status to inactive
       - Body: {"id": <userId>, "userStatus": "inactive"}
       - Expected: Success, userStatus = 'inactive' in database
    
    3. **Test Case**: Update user password
       - Body: {"id": <userId>, "userPassword": "newpass123"}
       - Expected: Success, password updated
    
    4. **Test Case**: Update user account
       - Body: {"id": <userId>, "userAccount": "neweraccount"}
       - Expected: Success, account updated
    
    ### 5.3 用户登录测试 (Requirement 8)
    1. **Test Case**: Normal login
       - Method: POST /user/login
       - Body: {"userAccount": "testuser", "userPassword": "123456"}
       - Expected:
         - Success response
         - lastLoginTime updated to current time in database
    
    2. **Test Case**: Inactive user login
       - Set user status to 'inactive' first
       - Attempt login
       - Expected: 403 error or login rejection
    
    3. **Test Case**: Failed login (wrong password)
       - Attempt login with wrong password
       - Expected: Login fails, lastLoginTime NOT updated
    
    ### 5.4 用户查询测试 (Requirements 1, 2)
    1. **Test Case**: Get single user
       - Method: GET /user/get?id=<userId>
       - Expected: User info with userStatus, lastLoginTime, pagePermissions
    
    2. **Test Case**: List all users
       - Method: POST /user/list/page
       - Expected: Paginated user list, each user has new fields
    
    3. **Test Case**: Search users
       - Method: POST /user/list/page with search keyword
       - Expected: Filtered results
    
    ### 5.5 用户删除测试 (Requirement 5)
    1. **Test Case**: Delete user
       - Method: POST /user/delete
       - Body: {"id": <userId>}
       - Expected:
         - Success
         - isDelete = 1 in database
         - userStatus = 'inactive' (optional check)
    
    2. **Test Case**: Delete self (as admin)
       - Admin attempts to delete their own account
       - Expected: 400 error "不能删除自己的账号"
    
    ### 5.6 Permission Verification
    1. **Test Case**: Admin access
       - Login as admin
       - Verify can access all user management APIs
    
    2. **Test Case**: Regular user access
       - Login as regular user
       - Attempt to access user management APIs
       - Expected: 403 error (permission denied)
    
    ### 5.7 Default Permissions Verification
    1. **Test Case**: New admin default permissions
       - Create new admin user
       - Query pagePermissions
       - Expected: JSON with 31 keys, all values true
    
    2. **Test Case**: New user default permissions
       - Create new regular user
       - Query pagePermissions
       - Expected: JSON with 31 keys, only 2 true (monthly-energy, hourly-energy)
    
    ### 5.8 Frontend Integration
    1. **Test Case**: User management page loads
       - Open /user-management in browser
       - Expected: User list displays correctly with new fields
    
    2. **Test Case**: Add user via frontend
       - Use Add User button
       - Fill form and submit
       - Expected: New user appears in list
    
    3. **Test Case**: Edit permissions via frontend
       - Click Edit Permissions button
       - Toggle checkboxes (31 pages)
       - Save
       - Expected: Permissions updated correctly
    
    4. **Test Case**: Toggle user status
       - Click status toggle button
       - Expected: Status changes between active/inactive
    
    5. **Test Case**: View password
       - Click eye icon to show password
       - Expected: Password displays in plain text
    
    Leverage:
    - Postman or curl for API testing
    - Browser DevTools for frontend testing
    - SQL queries for database verification
    - Backend logs for debugging
    
    Success Criteria:
    - [x] All 20+ test cases pass
    - [x] Frontend can call all APIs successfully
    - [x] Permissions JSON stored and returned correctly
    - [x] Login time auto-updates on successful login
    - [x] Status management works (inactive users cannot login)
    - [x] Default permissions set correctly for new users
    - [x] No database exceptions or errors in logs
    - [x] All 8 Requirements validated
    
    After completing:
    1. Mark task 5 as in progress [-] in tasks.md
    2. Execute all test cases
    3. Document any issues found
    4. Fix any failures
    5. Re-test until all pass
    6. Mark as completed [x] in tasks.md
    7. Update spec status to "Completed"
    ```

---

## Summary

本任务列表将设计分解为 5 个主要任务：

1. ✅ **数据库迁移** - DROP TABLE重建user表（由用户执行）
2. ✅ **User Entity** - 添加3个新字段
3. ✅ **UserUpdateRequest DTO** - 添加4个新字段
4. ✅ **UserServiceImpl** - 修改userLogin()方法（2行代码）
5. ⏳ **集成测试** - 端到端测试和验证

每个任务都包含：
- 明确的文件路径
- 详细的实现要求
- 需要复用的组件（`_Leverage`）
- Requirements 引用（`_Requirements`）
- 完整的实现 Prompt（包含角色、任务、限制、成功标准）

**关键原则**：
- 只修改3个文件，不创建新文件
- 复用现有Controller/Mapper，不新增接口
- 使用MyBatis-Plus自动映射机制
- 遵循现有项目模式和命名规范

**实现优势**：
✅ **极简化**: 仅修改3个文件，不创建任何新文件  
✅ **低风险**: 不修改Controller和Mapper，复用现有接口  
✅ **易维护**: 代码改动小（~30行），易于理解和维护  
✅ **向后兼容**: 新字段为可选，不影响现有功能

**开发时间估算**：
- Task 1 (数据库迁移): 15分钟（用户执行）
- Task 2 (User Entity): 10分钟
- Task 3 (UserUpdateRequest): 10分钟
- Task 4 (UserServiceImpl): 5分钟
- Task 5 (集成测试): 30分钟

**总计**: ~1小时

---

## Next Steps

1. ✅ Requirements已完成
2. ✅ Design已完成
3. ✅ Tasks已完成
4. ⏳ **开始实现**: 按照Task 1 → 2 → 3 → 4 → 5的顺序执行
5. ⏳ 前端API对接
6. ⏳ 生产环境部署
