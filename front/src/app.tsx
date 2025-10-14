import Footer from '@/components/Footer';
import { getLoginUserUsingGet } from '@/services/SolarBi-front/userController';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import { Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
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
    pagePermissions: {},
  };
  // 如果不是登录页面，执行
  const { location } = history;
  if (location.pathname !== loginPath) {
    try {
      const res = await getLoginUserUsingGet();
      initialState.currentUser = res.data;
      
      // 🔑 解析并加载用户权限
      if (res.data?.pagePermissions) {
        try {
          const permissions = JSON.parse(res.data.pagePermissions);
          initialState.pagePermissions = permissions;
          console.log('✅ 权限加载成功:', permissions);
        } catch (error) {
          console.error('❌ 解析权限JSON失败，用户权限配置异常:', error);
          history.push('/404'); // JSON解析失败，跳转到404页面
          return initialState; // 提前结束函数执行
        }
      } else {
        console.error('❌ 用户权限字段为空');
        history.push('/404'); // 权限字段为空，跳转到404页面
        return initialState; // 提前结束函数执行
      }
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
    // 自定义侧边栏折叠按钮
    collapsedButtonRender: (collapsed, defaultDom) => {
      return (
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => {
            // 触发默认的折叠逻辑
            if (defaultDom && typeof defaultDom === 'object' && 'props' in defaultDom) {
              const domElement = defaultDom as any;
              if (domElement.props && typeof domElement.props.onClick === 'function') {
                domElement.props.onClick();
              }
            }
          }}
          style={{
            fontSize: '16px',
            width: 36,
            height: 36,
            color: '#00d4ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '6px',
            backgroundColor: 'rgba(0, 212, 255, 0.05)',
            transition: 'all 0.3s ease',
            margin: '8px 8px 8px 12px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 212, 255, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.6)';
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 212, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          title={collapsed ? '展开侧边栏' : '折叠侧边栏'}
        />
      );
    },
    siderMenuType: 'sub', // 设置侧边栏菜单类型
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
