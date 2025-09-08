
import { userLoginUsingPost } from '@/services/SolarBi-front/userController';
import { LockOutlined, UserOutlined, RocketOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText, ProForm } from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { Helmet, history, useModel } from '@umijs/max';
import { message, Tabs, Card, Button } from 'antd';
import React, { useState } from 'react';
import Settings from '../../../../config/defaultSettings';
import { techThemeStyles } from '@/styles/techTheme';

const Login: React.FC = () => {
  const [type, setType] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');
  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      background: 'linear-gradient(135deg, #0a1929 0%, #1a237e 50%, #000051 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 60% 40%, rgba(0, 255, 136, 0.06) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
        zIndex: 0,
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        pointerEvents: 'none',
        zIndex: 1,
      }
    };
  });

  const handleSubmit = async (values: API.UserLoginRequest) => {
    try {
      // 登录
      const res = await userLoginUsingPost({
        ...values,
      });

      const defaultLoginSuccessMessage = '登录成功！';
      message.success(defaultLoginSuccessMessage);

      // 获取重定向路径
      const urlParams = new URL(window.location.href).searchParams;
      const redirectPath = urlParams.get('redirect') || '/power_monitor';

      // 登录成功后直接跳转并刷新页面，确保权限状态立即生效
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 500);
      return;
    } catch (error: any) {
      const defaultLoginFailureMessage = `登录失败，${error.message}`;
      message.error(defaultLoginFailureMessage);
    }
  };

  return (
    <div className={containerClassName}>
      <Helmet>
        <title>
          {'登录'}- {Settings.title}
        </title>
      </Helmet>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Card style={{
          ...techThemeStyles.card,
          width: '400px',
          padding: '20px'
        }}>
          {/* 标题区域 */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              fontSize: '48px',
              color: '#00d4ff',
              marginBottom: 16,
              filter: 'drop-shadow(0 0 15px rgba(0, 212, 255, 0.8))'
            }}>
              <RocketOutlined />
            </div>
            <h1 style={{
              ...techThemeStyles.title,
              fontSize: '28px',
              marginBottom: 8
            }}>
              工具制造电能数据平台
            </h1>
          
          </div>

          <ProForm
            layout="vertical"
            style={{
              background: 'transparent',
              border: 'none'
            }}
            submitter={{
              render: (_, dom) => (
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  style={{
                    ...techThemeStyles.button,
                    width: '100%',
                    height: '48px',
                    fontSize: '16px',
                    marginTop: '16px'
                  }}
                >
                  登录
                </Button>
              ),
            }}
            initialValues={{
              autoLogin: true,
            }}
            onFinish={async (values) => {
              await handleSubmit(values as API.UserLoginRequest);
            }}
          >
            <Tabs
              activeKey={type}
              onChange={setType}
              centered
              items={[
                {
                  key: 'account',
                  label: (
                    <span style={{
                      color: '#00d4ff',
                      fontWeight: 'bold',
                      textShadow: '0 0 8px rgba(0, 212, 255, 0.6)'
                    }}>
                      账户密码登录
                    </span>
                  ),
                },
              ]}
              style={{
                marginBottom: '24px'
              }}
            />

            {type === 'account' && (
              <>
                <ProFormText
                  name="userAccount"
                  fieldProps={{
                    size: 'large',
                    prefix: <UserOutlined style={{ color: '#00d4ff' }} />,
                    style: techThemeStyles.input,
                  }}
                  placeholder={'请输入账号'}
                  rules={[
                    {
                      required: true,
                      message: '账号是必填项！',
                    },
                  ]}
                />
                <ProFormText.Password
                  name="userPassword"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined style={{ color: '#00d4ff' }} />,
                    style: techThemeStyles.input,
                  }}
                  placeholder={'请输入密码'}
                  rules={[
                    {
                      required: true,
                      message: '密码是必填项！',
                    },
                  ]}
                />
              </>
            )}

          </ProForm>
        </Card>
      </div>

      {/* 隐藏任何可能的额外元素 */}
      <style>{`
        .ant-pro-form-login-main .ant-pro-form-login-other,
        .ant-pro-form-login-main .ant-pro-form-login-other *,
        .ant-pro-form-login .ant-pro-form-login-other,
        .ant-pro-form-login .ant-pro-form-login-other *,
        .ant-pro-login-form .ant-pro-login-form-other,
        .ant-pro-login-form .ant-pro-login-form-other *,
        .login-form-actions,
        .login-form-actions *,
        .ant-pro-form-login-container .ant-pro-form-login-other,
        .ant-pro-form-login-container .ant-pro-form-login-desc,
        .ant-pro-form-login-container .ant-pro-form-login-divider,
        .ant-pro-form-login-main .ant-pro-form-login-desc,
        .ant-pro-form-login-main .ant-pro-form-login-divider,
        .ant-pro-form-login-main .ant-pro-form-login-container .ant-pro-form-login-other,
        .ant-pro-form-login-main .ant-pro-form-login-container .ant-pro-form-login-desc,
        .ant-pro-form-login-main .ant-pro-form-login-container .ant-pro-form-login-divider {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          width: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          opacity: 0 !important;
        }

        /* 确保LoginForm容器干净 */
        .ant-pro-form-login-main,
        .ant-pro-form-login,
        .ant-pro-login-form {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }

        /* 隐藏任何可能的底部元素 */
        .ant-pro-form-login-main::after,
        .ant-pro-form-login::after,
        .ant-pro-login-form::after {
          display: none !important;
        }
      `}</style>

    </div>
  );
};
export default Login;
