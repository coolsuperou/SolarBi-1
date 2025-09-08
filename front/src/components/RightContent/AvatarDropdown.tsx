import { userLogoutUsingPost } from '@/services/SolarBi-front/userController';
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Avatar, Button, Space } from 'antd';
import { stringify } from 'querystring';
import type { MenuInfo } from 'rc-menu/lib/interface';
import React, { useCallback } from 'react';
import { flushSync } from 'react-dom';
import { Link } from 'umi';
import HeaderDropdown from '../HeaderDropdown';

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu }) => {
  /**
   * 退出登录，并且将当前的 url 保存
   */
  const loginOut = async () => {
    await userLogoutUsingPost();
    const { search, pathname } = window.location;
    const urlParams = new URL(window.location.href).searchParams;
    /** 此方法会跳转到 redirect 参数所在的位置 */
    const redirect = urlParams.get('redirect');
    // Note: There may be security issues, please note
    if (window.location.pathname !== '/user/login' && !redirect) {
      history.replace({
        pathname: '/user/login',
        search: stringify({
          redirect: pathname + search,
        }),
      });
    }
  };

  const { initialState, setInitialState } = useModel('@@initialState');

  const onMenuClick = useCallback(
    (event: MenuInfo) => {
      const { key } = event;
      if (key === 'logout') {
        flushSync(() => {
          setInitialState((s) => ({ ...s, currentUser: undefined }));
        });
        loginOut();
        return;
      }
      history.push(`/account/${key}`);
    },
    [setInitialState],
  );

  const { currentUser } = initialState || {};

  if (!currentUser) {
    return (
      <Link to="/user/login">
        <Button 
          type="primary" 
          shape="round"
          style={{
            background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
            border: '2px solid #00d4ff',
            color: '#fff',
            fontWeight: 'bold',
            boxShadow: '0 0 15px rgba(0, 212, 255, 0.5)',
            textShadow: '0 0 8px rgba(255, 255, 255, 0.6)'
          }}
        >
          登录
        </Button>
      </Link>
    );
  }

  const menuItems = [
    ...(menu
      ? [
          {
            key: 'center',
            icon: <UserOutlined />,
            label: '个人中心',
          },
          {
            key: 'settings',
            icon: <SettingOutlined />,
            label: '个人设置',
          },
          {
            type: 'divider' as const,
          },
        ]
      : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  return (
    <HeaderDropdown
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
    >
      <Space>
        {currentUser?.userAvatar ? (
          <Avatar size="small" src={currentUser?.userAvatar} style={{
            border: '2px solid #00d4ff',
            boxShadow: '0 0 10px rgba(0, 212, 255, 0.5)'
          }} />
        ) : (
          <Avatar size="small" icon={<UserOutlined />} style={{
            backgroundColor: '#00d4ff',
            border: '2px solid #00d4ff',
            boxShadow: '0 0 10px rgba(0, 212, 255, 0.5)'
          }} />
        )}
        <span style={{
          color: '#ffffff',
          fontWeight: '600',
          textShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
          fontSize: '14px'
        }}>{currentUser?.userName ?? '无名'}</span>
      </Space>
    </HeaderDropdown>
  );
};

export const AvatarName = () => {};
