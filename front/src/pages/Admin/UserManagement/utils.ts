/**
 * 用户管理相关的工具函数和常量
 */

/**
 * 所有页面权限的 key 列表
 */
export const ALL_PERMISSION_KEYS = [
  'monthly-energy',
  'hourly-energy',
  'airConditioning',
  'injection_workshop',
  'granulation_workshop',
  'office_building',
  'feeding_workshop',
  'granule102',
  'cold-press-103',
  'restoration-104',
  'sintering-105',
  'cleaning-106',
  'beading-107',
  'rubber-109',
  'injection-110',
  'edging-111',
  'final-inspection-112',
  'warehouse-113',
  'elevator-114',
  'office-area-114',
  'conference-room-114',
  'laboratory-114',
  'public-114',
  'air-compressor-114',
  'charging-pile',
  'tool-rd-center',
  'guard-room',
  'canteen',
  'dormitory',
] as const;

/**
 * 权限类型定义
 */
export type PermissionKey = typeof ALL_PERMISSION_KEYS[number];

/**
 * 创建完整的权限对象
 * 确保所有30个权限都有明确的 true/false 值
 * 
 * @param partialPerms 部分权限对象（可能只包含选中的权限）
 * @returns 完整的权限对象（所有权限都有值）
 * 
 * @example
 * const userPerms = { "monthly-energy": true };
 * const fullPerms = createFullPermissions(userPerms);
 * // 结果: { "monthly-energy": true, "hourly-energy": false, ... 其他28个都是false }
 */
export const createFullPermissions = (
  partialPerms: Record<string, boolean> = {}
): Record<string, boolean> => {
  const fullPerms: Record<string, boolean> = {};
  ALL_PERMISSION_KEYS.forEach(key => {
    // 明确转换为 true/false，确保只有明确为 true 的才是 true
    fullPerms[key] = partialPerms[key] === true;
  });
  return fullPerms;
};

/**
 * 获取默认权限（所有权限为 false）
 */
export const getDefaultPermissions = (): Record<string, boolean> => {
  return createFullPermissions({});
};

/**
 * 统计选中的权限数量
 */
export const countSelectedPermissions = (
  permissions: Record<string, boolean>
): number => {
  return Object.values(permissions).filter(v => v === true).length;
};

/**
 * 统计未选中的权限数量
 */
export const countUnselectedPermissions = (
  permissions: Record<string, boolean>
): number => {
  return Object.values(permissions).filter(v => v !== true).length;
};

