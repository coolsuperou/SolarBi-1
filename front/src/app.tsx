import Footer from '@/components/Footer';
import { getLoginUserUsingGet } from '@/services/SolarBi-front/userController';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { AvatarDropdown } from './components/RightContent/AvatarDropdown';
import { requestConfig } from './requestConfig';

const loginPath = '/user/login';

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<InitialState> {
  const initialState: InitialState = {
    currentUser: undefined,
  };
  // 如果不是登录页面，执行
  const { location } = history;
  if (location.pathname !== loginPath) {
    try {
      const res = await getLoginUserUsingGet();
      initialState.currentUser = res.data;
    } catch (error: any) {
      // 如果未登录，重定向到登录页面，并保存当前页面作为redirect参数
      const redirectUrl = `${loginPath}?redirect=${encodeURIComponent(location.pathname)}`;
      history.push(redirectUrl);
    }

    // 模拟登录用户
    // const mockUser: API.LoginUserVO = {
    //   userAvatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
    //   userName: 'admin',
    //   userRole: 'admin',
    // };
    // initialState.currentUser = mockUser;
  }
  return initialState;
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
// @ts-ignore
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    avatarProps: {
      render: () => {
        return <AvatarDropdown />;
      },
    },
    // 禁用水印
    // waterMarkProps: {
    //   content: initialState?.currentUser?.userName,
    // },
    footerRender: false,
    menuHeaderRender: undefined,
    // 自定义logo和标题
    logo: () => (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        color: '#00d4ff',
        textShadow: '0 0 10px rgba(0, 212, 255, 0.8)',
        filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.6))'
      }}>
        {/* 火箭图标 SVG */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M12 2L13.09 7.26L18 4L15.74 9.09L21 12L15.74 14.91L18 20L13.09 16.74L12 22L10.91 16.74L6 20L8.26 14.91L3 12L8.26 9.09L6 4L10.91 7.26L12 2Z" 
            fill="currentColor"
          />
          <circle cx="12" cy="12" r="3" fill="#001529" />
        </svg>
      </div>
    ),
    title: () => (
      <span style={{
        color: '#00d4ff',
        fontWeight: 'bold',
        fontSize: '16px',
        textShadow: '0 0 10px rgba(0, 212, 255, 0.8)',
        filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.6))'
      }}>
        工具制造电能数据平台
      </span>
    ),
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...defaultSettings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = requestConfig;
