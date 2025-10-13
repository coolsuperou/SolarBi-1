export default [
  {
    path: '/user',
    layout: false,
    routes: [
      { path: 'login', component: './User/Login' },
      { path: '', redirect: '/user/login' }, // 重定向到登录页面
    ],
  },
  {
    path: '/monthly-energy',
    name: '月度能耗统计',
    icon: 'BarChartOutlined',
    component: './MonthlyEnergy',
    access: 'canAccessMonthlyEnergy',
  },
  {
    path: '/hourly-energy',
    name: '日能耗统计',
    icon: 'LineChartOutlined',
    component: './HourlyEnergy',
    access: 'canAccessHourlyEnergy',
  },
  {
    path: '/airConditioning',
    name: '114_空调水机主机',
    icon: 'WalletFilled',
    component: './AirConditioning',
    access: 'canAccessAirConditioning',
  },
  {
    path: '/injection_workshop',
    name: '110注射环保设备',
    icon: 'experiment',
    component: './InjectionWorkshop',
    access: 'canAccessInjectionWorkshop',
  },
  {
    path: '/granulation_workshop',
    name: '102造粒环保设备',
    icon: 'build',
    component: './GranulationWorkshop',
    access: 'canAccessGranulationWorkshop',
  },
  {
    path: '/office_building',
    name: '1#办公楼',
    icon: 'home',
    component: './OfficeBuilding',
    access: 'canAccessOfficeBuilding',
  },

  {
    path: '/feeding_workshop',
    name: '101配料',
    icon: 'container',
    component: './FeedingWorkshop',
    access: 'canAccessFeedingWorkshop',
  },
  {
    path: '/granule102',
    name: '102造粒',
    icon: 'build',
    component: './Granule102',
    access: 'canAccessGranule102',
  },
  {
    path: '/cold-press-103',
    name: '103冷压',
    icon: 'GatewayOutlined',
    component: './ColdPress103',
    access: 'canAccessColdPress103',
  },
  {
    path: '/restoration-104',
    name: '104还原',
    icon: 'BgColorsOutlined',
    component: './Restoration104',
    access: 'canAccessRestoration104',
  },
  {
    path: '/sintering-105',
    name: '105烧结',
    component: './Sintering105',
    icon: 'fire', //
    access: 'canAccessSintering105',
  },
  {
    path: '/cleaning-106',
    name: '106清洗',
    component: './Cleaning106',
    icon: 'interaction',
    access: 'canAccessCleaning106',
  },
  {
    path: '/beading-107',
    name: '107串珠',
    component: './Beading107',
    icon: 'link',
    access: 'canAccessBeading107',
  },
  {
    path: '/rubber-109',
    name: '109炼胶',
    component: './Rubber109',
    icon: 'experiment',
    access: 'canAccessRubber109',
  },
  {
    path: '/injection-110',
    name: '110注射',
    component: './Injection110',
    icon: 'control',
    access: 'canAccessInjection110',
  },
  {
    path: '/edging-111',
    name: '111开刃',
    component: './Edging111',
    icon: 'scissor',
    access: 'canAccessEdging111',
  },
  {
    path: '/final-inspection-112',
    name: '112终检',
    component: './FinalInspection112',
    icon: 'ToolFilled',
    access: 'canAccessFinalInspection112',
  },
  {
    path: '/warehouse-113',
    name: '113仓库',
    icon: 'inbox',
    component: './Warehouse113',
    access: 'canAccessWarehouse113',
  },
  {
    path: '/elevator-114',
    name: '114_2#厂房电梯',
    icon: 'BankFilled', // 电梯图标
    component: './Elevator114',
    access: 'canAccessElevator114',
  },
  {
    path: '/office-area-114',
    name: '114_2#楼办公区域',
    icon: 'home', // 办公楼图标
    component: './OfficeArea114',
    access: 'canAccessOfficeArea114',
  },
  {
    path: '/conference-room-114',
    name: '114_2#楼会议室',
    icon: 'team', // 会议室图标
    component: './ConferenceRoom114',
    access: 'canAccessConferenceRoom114',
  },
  {
    path: '/laboratory-114',
    name: '114_2#楼实验室',
    icon: 'experiment', // 实验室图标
    component: './Laboratory114',
    access: 'canAccessLaboratory114',
  },
  {
    path: '/public-114',
    name: '114公共',
    icon: 'global', // 公共区域图标
    component: './Public114',
    access: 'canAccessPublic114',
  },
  {
    path: '/air-compressor-114',
    name: '114空压机',
    icon: 'HddFilled',
    component: './AirCompressor114',
    access: 'canAccessAirCompressor114',
  },
  {
    path: '/charging-pile',
    name: '充电桩',
    icon: 'ApiFilled',
    component: './ChargingPile',
    access: 'canAccessChargingPile',
  },
  {
    path: '/tool-rd-center',
    name: '工具研发中心',
    icon: 'PushpinFilled', // 工具图标，可选：'experiment', 'build', 'setting'
    component: './ToolRDCenter',
    access: 'canAccessToolRDCenter',
  },
  {
    path: '/guard-room',
    name: '门卫室',
    icon: 'InsuranceFilled',
    component: './GuardRoom',
    access: 'canAccessGuardRoom',
  },
  {
    path: '/canteen',
    name: '食堂',
    icon: 'shop', // 食堂图标，可选：'coffee', 'restaurant', 'home'
    component: './Canteen',
    access: 'canAccessCanteen',
  },
  {
    path: '/dormitory',
    name: '宿舍楼',
    icon: 'home', // 宿舍楼图标，可选：'building', 'bank', 'apartment'
    component: './Dormitory',
    access: 'canAccessDormitory',
  },
  {
    path: '/admin',
    icon: 'crown',
    name: '管理页',
    access: 'canAdmin',
    routes: [
      { path: '', redirect: 'user-management' },
      { icon: 'UserOutlined', path: 'user-management', component: './Admin/UserManagement', name: '用户管理' },
    ],
  },
  { path: '/', redirect: '/monthly-energy'},
  { path: '*', layout: false, component: './404' },
];
