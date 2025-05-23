import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import '@umijs/max';
import React from 'react';

const Footer: React.FC = () => {
  const defaultMessage = '每天十点睡';
  const currentYear = new Date().getFullYear();
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright={`${currentYear} ${defaultMessage}`}
      links={[
        {
          key: 'codeNav',
          title: '编程导航',
          href: '',
          blankTarget: true,
        },
        {
          key: 'Ant Design',
          title: '编程宝典',
          href: '',
          blankTarget: true,
        },
        {
          key: 'github',
          title: (
            <>
              <GithubOutlined /> 每天十点睡
            </>
          ),
          href: 'https://github.com/coolsuperou/SolarBi-1',
          blankTarget: true,
        },
      ]}
    />
  );
};
export default Footer;
