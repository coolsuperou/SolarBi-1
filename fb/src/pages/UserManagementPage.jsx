import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import UserSearchForm from '../components/usermanagement/UserSearchForm';
import UserDataTable from '../components/usermanagement/UserDataTable';
import './UserManagementPage.css';

const mockUsers = [
  { id: '1964860733899488082', userAccount: 'sw', userName: '苏卫', userAvatar: null, userRole: '管理员', createTime: '2025-09-08 09:53:33', updateTime: '2025-09-08 10:26:17' },
  { id: '1964884104618412546', userAccount: 'oth', userName: '数据猿', userAvatar: null, userRole: '管理员', createTime: '2025-09-08 10:51:35', updateTime: '2025-09-08 10:51:35' },
  { id: '1964886490759229588', userAccount: 'hgh', userName: '黄广华', userAvatar: null, userRole: '用户', createTime: '2025-09-08 11:07:55', updateTime: '2025-09-08 11:07:55' },
  { id: '1965249979367724450', userAccount: 'test', userName: '测试账号', userAvatar: null, userRole: '用户', createTime: '2025-09-09 10:44:32', updateTime: '2025-09-09 10:44:32' },
];


function UserManagementPage() {
  const [users, setUsers] = useState(mockUsers);

  const handleSearch = (params) => {
    console.log('Searching for users with params:', params);
    // In a real app, you would filter the users based on the search params
    // For now, we just log it
  };

  return (
    <div className="user-management-page">
      <Container fluid>
        <div className="section-container card-bg">
          <div className="section-header">
            <h3 className="section-title">用户管理</h3>
          </div>
          <UserSearchForm onSearch={handleSearch} />
        </div>

        <div className="section-container card-bg mt-4">
          <div className="section-header">
            <h3 className="section-title">查询表格</h3>
            {/* Add buttons like "Create" here if needed */}
          </div>
          <UserDataTable users={users} />
        </div>
      </Container>
    </div>
  );
}

export default UserManagementPage;
