/**
 * 用户管理相关的工具函数和常量
 * 🔥 权限配置统一在这里管理，新增权限只需要在 PERMISSION_CONFIG 中添加一条即可
 */

/**
 * 权限配置项类型
 */
export interface PermissionItem {
  key: string;
  icon: string;
  name: string;
  desc: string;
  category: string;
}

/**
 * 🔥 统一的权限配置列表
 * 新增权限只需要在这里添加一条配置即可，其他地方会自动生效
 */
export const PERMISSION_CONFIG: PermissionItem[] = [
  { key: 'monthly-energy', icon: '📊', name: '月度能耗统计', desc: '查看月度电能消耗数据', category: '统计' },
  { key: 'hourly-energy', icon: '📈', name: '日能耗统计', desc: '查看日度电能消耗数据', category: '统计' },
  { key: 'airConditioning', icon: '❄️', name: '114_空调水机主机', desc: '空调系统能耗监控', category: '设施' },
  { key: 'injection_workshop', icon: '🏭', name: '110注射环保设备', desc: '注射车间环保监控', category: '车间' },
  { key: 'granulation_workshop', icon: '🏭', name: '102造粒环保设备', desc: '造粒车间环保监控', category: '车间' },
  { key: 'office_building', icon: '🏢', name: '1#办公楼', desc: '办公楼能耗监控', category: '建筑' },
  { key: 'feeding_workshop', icon: '🏭', name: '101配料', desc: '配料车间监控', category: '车间' },
  { key: 'granule102', icon: '🏭', name: '102造粒', desc: '造粒工艺监控', category: '车间' },
  { key: 'cold-press-103', icon: '🏭', name: '103冷压', desc: '冷压工艺监控', category: '车间' },
  { key: 'restoration-104', icon: '🏭', name: '104还原', desc: '还原工艺监控', category: '车间' },
  { key: 'sintering-105', icon: '🔥', name: '105烧结', desc: '烧结工艺监控', category: '车间' },
  { key: 'cleaning-106', icon: '🏭', name: '106清洗', desc: '清洗工艺监控', category: '车间' },
  { key: 'beading-107', icon: '🏭', name: '107串珠', desc: '串珠工艺监控', category: '车间' },
  { key: 'rubber-109', icon: '🏭', name: '109炼胶', desc: '炼胶工艺监控', category: '车间' },
  { key: 'injection-110', icon: '🏭', name: '110注射', desc: '注射工艺监控', category: '车间' },
  { key: 'edging-111', icon: '✂️', name: '111开刃', desc: '开刃工艺监控', category: '车间' },
  { key: 'final-inspection-112', icon: '🔍', name: '112终检', desc: '终检工序监控', category: '车间' },
  { key: 'warehouse-113', icon: '📦', name: '113仓库', desc: '仓库能耗监控', category: '仓储' },
  { key: 'elevator-114', icon: '🏢', name: '114_2#厂房电梯', desc: '电梯能耗监控', category: '设施' },
  { key: 'office-area-114', icon: '🏢', name: '114_2#楼办公区域', desc: '办公区域能耗', category: '建筑' },
  { key: 'conference-room-114', icon: '👥', name: '114_2#楼会议室', desc: '会议室能耗监控', category: '建筑' },
  { key: 'laboratory-114', icon: '🔬', name: '114_2#楼实验室', desc: '实验室能耗监控', category: '建筑' },
  { key: 'public-114', icon: '🏢', name: '114公共', desc: '公共区域监控', category: '设施' },
  { key: 'air-compressor-114', icon: '⚙️', name: '114空压机', desc: '空压机能耗监控', category: '设施' },
  { key: 'charging-pile', icon: '🔌', name: '充电桩', desc: '充电桩能耗监控', category: '设施' },
  { key: 'tool-rd-center', icon: '🔧', name: '工具研发中心', desc: '研发中心能耗', category: '建筑' },
  { key: 'guard-room', icon: '🚪', name: '门卫室', desc: '门卫室能耗监控', category: '建筑' },
  { key: 'canteen', icon: '🍽️', name: '食堂', desc: '食堂能耗监控', category: '生活' },
  { key: 'dormitory', icon: '🏠', name: '宿舍楼', desc: '宿舍楼能耗监控', category: '生活' },
  { key: 'pressless-sintering', icon: '🔥', name: '无压烧结', desc: '无压烧结工艺监控', category: '车间' },
];

/**
 * 🔥 自动生成的权限 key 列表（从 PERMISSION_CONFIG 提取）
 */
export const ALL_PERMISSION_KEYS = PERMISSION_CONFIG.map(p => p.key);

/**
 * 权限类型定义
 */
export type PermissionKey = typeof ALL_PERMISSION_KEYS[number];

/**
 * 创建完整的权限对象
 * 确保所有权限都有明确的 true/false 值
 */
export const createFullPermissions = (
  partialPerms: Record<string, boolean> = {}
): Record<string, boolean> => {
  const fullPerms: Record<string, boolean> = {};
  ALL_PERMISSION_KEYS.forEach(key => {
    fullPerms[key] = partialPerms[key] === true;
  });
  return fullPerms;
};

/**
 * 🔥 自动生成的默认权限对象（所有权限为 false）
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
  return ALL_PERMISSION_KEYS.length - countSelectedPermissions(permissions);
};
