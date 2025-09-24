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
    path: '/power_monitor',
    name: '114_空调水机主机',
    icon: 'thunderbolt',
    component: './PowerMonitor',
    access: 'canUser',
  },
  {
    path: '/injection_workshop',
    name: '110注射环保设备',
    icon: 'experiment',
    component: './InjectionWorkshop',
    access: 'canUser',
  },
  {
    path: '/granulation_workshop',
    name: '102造粒环保设备',
    icon: 'build',
    component: './GranulationWorkshop',
    access: 'canUser',
  },
  {
    path: '/office_building',
    name: '1#办公楼',
    icon: 'home',
    component: './OfficeBuilding',
    access: 'canUser',
  },

  {
    path: '/feeding_workshop',
    name: '101配料',
    icon: 'container',
    component: './FeedingWorkshop',
    access: 'canUser',
  },
  {
    path: '/granule102',
    name: '102造粒',
    icon: 'build',
    component: './Granule102',
    access: 'canUser',
  },
  {
    path: '/cold-press-103',
    name: '103冷压车间',
    icon: 'build',
    component: './ColdPress103',
    access: 'canUser',
  },
  {
    path: '/admin',
    icon: 'crown',
    name: '管理页',
    access: 'canAdmin',
    routes: [
      { path: '', redirect: 'user' },
      { icon: 'table', path: 'user', component: './Admin/User', name: '用户管理' },
    ],
  },
  { path: '/', redirect: '/power_monitor' }, // 重定向到电能监控页面
  { path: '*', layout: false, component: './404' },
];
