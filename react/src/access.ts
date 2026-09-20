/**
 * 权限控制
 * 所有用户（包括管理员）统一从 pagePermissions 获取业务页面权限
 * 管理页面（/admin及其子页面）统一由 canAdmin 控制
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API.LoginUserVO; pagePermissions?: Record<string, boolean> } | undefined) {
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
    canAccessMonthlyEnergy: pagePermissions['monthly-energy'] === true,
    canAccessHourlyEnergy: pagePermissions['hourly-energy'] === true,
    canAccessElectricityCostAllocation: pagePermissions['electricity-cost-allocation'] === true,
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
    canAccessPresslessSintering: pagePermissions['pressless-sintering'] === true,
  };
}
