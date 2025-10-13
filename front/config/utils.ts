/**
 * 权限与路由映射工具
 * 用于根据用户权限动态获取可访问的首页路径
 */

/**
 * 权限 key 到路由 path 的映射表
 * 按照优先级排序：越靠前优先级越高
 */
export const PERMISSION_ROUTE_MAP: Array<{
    key: string;
    path: string;
    name: string;
  }> = [
    { key: 'monthly-energy', path: '/monthly-energy', name: '月度能耗统计' },
    { key: 'hourly-energy', path: '/hourly-energy', name: '日能耗统计' },
    { key: 'airConditioning', path: '/airConditioning', name: '114_空调水机主机' },
    { key: 'injection_workshop', path: '/injection_workshop', name: '110注射环保设备' },
    { key: 'granulation_workshop', path: '/granulation_workshop', name: '102造粒环保设备' },
    { key: 'office_building', path: '/office_building', name: '1#办公楼' },
    { key: 'feeding_workshop', path: '/feeding_workshop', name: '101配料' },
    { key: 'granule102', path: '/granule102', name: '102造粒' },
    { key: 'cold-press-103', path: '/cold-press-103', name: '103冷压' },
    { key: 'restoration-104', path: '/restoration-104', name: '104还原' },
    { key: 'sintering-105', path: '/sintering-105', name: '105烧结' },
    { key: 'cleaning-106', path: '/cleaning-106', name: '106清洗' },
    { key: 'beading-107', path: '/beading-107', name: '107串珠' },
    { key: 'rubber-109', path: '/rubber-109', name: '109炼胶' },
    { key: 'injection-110', path: '/injection-110', name: '110注射' },
    { key: 'edging-111', path: '/edging-111', name: '111开刃' },
    { key: 'final-inspection-112', path: '/final-inspection-112', name: '112终检' },
    { key: 'warehouse-113', path: '/warehouse-113', name: '113仓库' },
    { key: 'elevator-114', path: '/elevator-114', name: '114_2#厂房电梯' },
    { key: 'office-area-114', path: '/office-area-114', name: '114_2#楼办公区域' },
    { key: 'conference-room-114', path: '/conference-room-114', name: '114_2#楼会议室' },
    { key: 'laboratory-114', path: '/laboratory-114', name: '114_2#楼实验室' },
    { key: 'public-114', path: '/public-114', name: '114公共' },
    { key: 'air-compressor-114', path: '/air-compressor-114', name: '114空压机' },
    { key: 'charging-pile', path: '/charging-pile', name: '充电桩' },
    { key: 'tool-rd-center', path: '/tool-rd-center', name: '工具研发中心' },
    { key: 'guard-room', path: '/guard-room', name: '门卫室' },
    { key: 'canteen', path: '/canteen', name: '食堂' },
    { key: 'dormitory', path: '/dormitory', name: '宿舍楼' },
  ];
  
  /**
   * 根据用户权限获取第一个可访问的路由路径
   * @param permissions 用户的权限对象 { 'monthly-energy': true, ... }
   * @returns 第一个可访问的路径，如果没有权限则返回 null
   */
  export const getFirstAccessibleRoute = (
    permissions: Record<string, boolean>
  ): string | null => {
    if (!permissions || Object.keys(permissions).length === 0) {
      console.warn('⚠️ 用户权限为空');
      return null;
    }
  
    // 遍历映射表，找到第一个权限为 true 的路由
    for (const route of PERMISSION_ROUTE_MAP) {
      if (permissions[route.key] === true) {
        console.log(`✅ 找到可访问路由: ${route.name} (${route.path})`);
        return route.path;
      }
    }
  
    console.warn('⚠️ 用户没有任何页面访问权限');
    return null;
  };
  
  /**
   * 获取用户所有可访问的路由列表
   * @param permissions 用户的权限对象
   * @returns 可访问的路由列表
   */
  export const getAllAccessibleRoutes = (
    permissions: Record<string, boolean>
  ): Array<{ key: string; path: string; name: string }> => {
    if (!permissions || Object.keys(permissions).length === 0) {
      return [];
    }
  
    return PERMISSION_ROUTE_MAP.filter(route => permissions[route.key] === true);
  };