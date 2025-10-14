/*
 用户管理系统 - 数据库升级脚本 (方案一)
 
 功能说明：
 1. 添加 userStatus 字段（用户状态：active/inactive）
 2. 添加 lastLoginTime 字段（最后登录时间）
 3. 添加 pagePermissions 字段（页面权限，JSON格式）
 4. 保留所有原有数据
 5. 为现有用户设置默认值
 
 执行前请务必备份数据库！
 
 Date: 10/10/2025
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- 步骤1：添加新字段
-- =============================================

-- 添加用户状态字段
ALTER TABLE `user` 
ADD COLUMN `userStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT '用户状态：active-活跃, inactive-禁用' AFTER `userRole`;

-- 添加最后登录时间字段
ALTER TABLE `user` 
ADD COLUMN `lastLoginTime` datetime NULL DEFAULT NULL COMMENT '最后登录时间' AFTER `userStatus`;

-- 添加页面权限字段（JSON格式存储）
ALTER TABLE `user` 
ADD COLUMN `pagePermissions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '页面访问权限（JSON格式）' AFTER `lastLoginTime`;

-- 为状态字段添加索引（提升查询效率）
ALTER TABLE `user` 
ADD INDEX `idx_userStatus`(`userStatus`) USING BTREE;

-- =============================================
-- 步骤2：数据迁移 - 设置现有用户的默认值
-- =============================================

-- 2.1 将所有未删除的用户状态设置为活跃
UPDATE `user` SET `userStatus` = 'active' WHERE `isDelete` = 0;

-- 2.2 将已删除的用户状态设置为禁用
UPDATE `user` SET `userStatus` = 'inactive' WHERE `isDelete` = 1;

-- 2.3 给管理员用户分配所有权限
UPDATE `user` 
SET `pagePermissions` = '{"perm-monthly":true,"perm-hourly":true,"perm-aircon":true,"perm-office":true,"perm-workshop1":true,"perm-workshop2":true,"perm-workshop3":true,"perm-canteen":true,"perm-dorm":true,"perm-user-mgmt":true}' 
WHERE `userRole` = 'admin' AND `isDelete` = 0;

-- 2.4 给普通用户分配基础权限（月度和日能耗统计）
UPDATE `user` 
SET `pagePermissions` = '{"perm-monthly":true,"perm-hourly":true,"perm-aircon":false,"perm-office":false,"perm-workshop1":false,"perm-workshop2":false,"perm-workshop3":false,"perm-canteen":false,"perm-dorm":false,"perm-user-mgmt":false}' 
WHERE `userRole` = 'user' AND `isDelete` = 0;

-- 2.5 将最后登录时间设置为更新时间（作为初始值）
UPDATE `user` 
SET `lastLoginTime` = `updateTime` 
WHERE `isDelete` = 0 AND `lastLoginTime` IS NULL;

-- =============================================
-- 步骤3：验证数据
-- =============================================

-- 查看更新后的表结构
-- SHOW CREATE TABLE `user`;

-- 查看所有用户的新字段值
-- SELECT id, userAccount, userName, userRole, userStatus, lastLoginTime, 
--        LEFT(pagePermissions, 50) as permissions_preview 
-- FROM `user` 
-- WHERE `isDelete` = 0;

-- =============================================
-- 步骤4：权限配置说明
-- =============================================

/*
页面权限键值对照表：

权限Key              页面名称            路由路径
-----------------   ----------------   --------------------
perm-monthly        月度能耗统计        /monthly-energy
perm-hourly         日能耗统计          /hourly-energy
perm-aircon         空调水机主机        /airConditioning
perm-office         办公楼              /office_building
perm-workshop1      101配料车间         /feeding_workshop
perm-workshop2      102造粒车间         /granulation_workshop
perm-workshop3      103冷压车间         /cold-press-103
perm-canteen        食堂                /canteen
perm-dorm           宿舍楼              /dormitory
perm-user-mgmt      用户管理            /user-management

JSON格式示例：
{
  "perm-monthly": true,
  "perm-hourly": true,
  "perm-aircon": false,
  "perm-office": false,
  "perm-workshop1": false,
  "perm-workshop2": false,
  "perm-workshop3": false,
  "perm-canteen": false,
  "perm-dorm": false,
  "perm-user-mgmt": false
}
*/

-- =============================================
-- 完整的表结构（升级后）
-- =============================================

/*
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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户' ROW_FORMAT = Dynamic;
*/

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- 执行完成！
-- 建议执行后进行以下验证：
-- 1. 检查所有用户的 userStatus 是否正确
-- 2. 检查所有用户的 pagePermissions 是否为有效的 JSON
-- 3. 测试用户登录功能是否正常
-- 4. 测试权限控制功能是否生效
-- =============================================
