import { userLoginUsingPost } from '@/services/SolarBi-front/userController';
import { Helmet, history } from '@umijs/max';
import { message } from 'antd';
import React, { useState } from 'react';
import Settings from '../../../../config/defaultSettings';
import './Login.css';
import backgroundGif from './首页素材.gif';

const Login: React.FC = () => {
  const [userAccount, setUserAccount] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userAccount) {
      message.error('请输入账号');
      return;
    }
    
    if (!userPassword) {
      message.error('请输入密码');
      return;
    }

    setIsLoading(true);
    
    try {
      // 登录
      const res = await userLoginUsingPost({
        userAccount,
        userPassword,
      });

      message.success('登录成功！');

      // 获取重定向路径
      const urlParams = new URL(window.location.href).searchParams;
      const redirectPath = urlParams.get('redirect') || '/power_monitor';

      // 登录成功后直接跳转并刷新页面，确保权限状态立即生效
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 500);
      
    } catch (error: any) {
      const errorMessage = error?.message || '登录失败，请重试';
      message.error(`登录失败，${errorMessage}`);
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Helmet>
        <title>登录 - {Settings.title}</title>
      </Helmet>

      {/* 背景容器 */}
      <div className="login-background-container">
        <img src={backgroundGif} alt="background" className="login-background-gif" />
        <div className="login-background-overlay"></div>
      </div>

      {/* 主容器 */}
      <div className="login-main-container">
        {/* 登录卡片 */}
        <div className="login-card">
          {/* Logo和标题区域 */}
          <div className="login-header-section">
            <h1 className="login-main-title">工具制造电能数据平台</h1>
            <p className="login-subtitle">账户密码登录</p>
          </div>

          {/* 表单区域 */}
          <form className="login-form" onSubmit={handleSubmit}>
            {/* 账号输入框 */}
            <div className="login-form-group">
              <div className="login-input-with-icon">
                <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  type="text"
                  className="login-form-input"
                  placeholder="请输入账号"
                  autoComplete="username"
                  value={userAccount}
                  onChange={(e) => setUserAccount(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* 密码输入框 */}
            <div className="login-form-group">
              <div className="login-input-with-icon">
                <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <div className="login-password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="login-form-input login-password-input"
                    placeholder="请输入密码"
                    autoComplete="current-password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="login-show-password-btn"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 登录按钮 */}
            <button type="submit" className="login-btn" disabled={isLoading}>
              <span className="login-btn-text">{isLoading ? '登录中...' : '登 录'}</span>
              <div className="login-btn-glow"></div>
            </button>
          </form>
        </div>

        {/* 装饰性圆球 */}
        <div className="login-orb login-orb-1"></div>
        <div className="login-orb login-orb-2"></div>
      </div>
    </>
  );
};

export default Login;
