import { DefaultFooter } from '@ant-design/pro-components';
import '@umijs/max';
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <DefaultFooter
      style={{
        background: 'linear-gradient(135deg, #0a1929 0%, #1a237e 50%, #000051 100%)',
        color: '#fff',
        borderTop: '2px solid rgba(0, 212, 255, 0.3)',
        padding: '24px 0',
        textAlign: 'center',
      }}
      copyright={`${currentYear} SolarBi 智能监控系统`}
      links={[
        {
          key: 'system',
          title: '系统管理',
          href: '#',
          blankTarget: false,
        },
        {
          key: 'help',
          title: '帮助文档',
          href: '#',
          blankTarget: false,
        },
        {
          key: 'about',
          title: '关于系统',
          href: '#',
          blankTarget: false,
        },
      ]}
    />
  );
};
export default Footer;
