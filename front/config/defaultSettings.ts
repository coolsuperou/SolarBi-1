import { ProLayoutProps } from '@ant-design/pro-components';

/**
 * 默认设置
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'dark',
  // 科技蓝
  colorPrimary: '#00d4ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: '工具制造电能数据平台',
  pwa: true,
  iconfontUrl: '',
  collapsed: true, // 默认收起侧边栏
  token: {
    // 参见ts声明，demo 见文档，通过token 修改样式
    //https://procomponents.ant.design/components/layout#%E9%80%9A%E8%BF%87-token-%E4%BF%AE%E6%94%B9%E6%A0%B7%E5%BC%8F
    header: {
      colorBgHeader: 'rgba(10, 25, 41, 0.95)', // 顶部导航栏背景色
      colorHeaderTitle: '#00d4ff', // 标题颜色
      colorTextMenu: '#ffffff', // 菜单文字颜色
      colorTextMenuSecondary: 'rgba(255, 255, 255, 0.65)', // 次要文字颜色
      colorTextMenuSelected: '#00d4ff', // 选中菜单文字颜色
      colorBgMenuItemSelected: 'rgba(0, 212, 255, 0.1)', // 选中菜单背景色
    },
    sider: {
      colorMenuBackground: 'rgba(10, 25, 41, 0.95)', // 侧边栏背景色
      colorTextMenu: '#ffffff', // 侧边栏菜单文字颜色
      colorTextMenuSelected: '#00d4ff', // 侧边栏选中文字颜色
      colorBgMenuItemSelected: 'rgba(0, 212, 255, 0.1)', // 侧边栏选中背景色
    },
  },
};

export default Settings;
