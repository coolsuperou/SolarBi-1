export default [
  {
    path: '/user',
    layout: false,
    routes: [
      { path: 'login', component: './User/Login' }, // ✅ 相对路径
      { path: 'register', component: './User/Register' }, // ✅ 相对路径
      { path: '', redirect: '/welcome' }, // ✅ 空路径表示 /user 的默认子路由
    ],
  },
  { path: '/welcome', icon: 'smile', component: './Welcome', name: '欢迎页' },
  {
    path: '/add_chart',
    name: '智能分析',
    icon: 'barChart',
    component: './AddChart',
  },
  {
    path: '/add_chart_async',
    name: '智能分析（异步）',
    icon: 'barChart',
    component: './AddChartAsync',
  },
  {
    path: '/my_chart',
    name: '我的图表',
    icon: 'pieChart',
    component: './MyChart',
  },
  {
    path: '/admin',
    icon: 'crown',
    name: '管理页',
    access: 'canAdmin',
    routes: [
      { path: '', redirect: 'user' }, // ✅ 空路径表示 /admin 的默认子路由
      { icon: 'table', path: 'user', component: './Admin/User', name: '用户管理' },
      { icon: 'table', path: 'chart', component: './Admin/Chart', name: '图表管理' },
    ],
  },
  { path: '/', redirect: '/welcome' }, // ✅ 统一的根路径重定向
  { path: '*', layout: false, component: './404' },
];
