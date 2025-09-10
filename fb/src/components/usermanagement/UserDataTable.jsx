import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import './UserDataTable.css';

function UserDataTable({ users }) {
  const handleEdit = (user) => {
    console.log('Editing user:', user);
  };

  const handleDelete = (user) => {
    console.log('Deleting user:', user);
  };

  return (
    <Table striped hover responsive variant="dark" className="user-table tech-table">
      <thead>
        <tr>
          <th>id</th>
          <th>账号</th>
          <th>用户名</th>
          <th>头像</th>
          <th>权限</th>
          <th>创建时间</th>
          <th>更新时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.userAccount}</td>
            <td>{user.userName}</td>
            <td>{user.userAvatar || '-'}</td>
            <td>
              <Badge bg={user.userRole === '管理员' ? 'success' : 'primary'}>
                {user.userRole}
              </Badge>
            </td>
            <td>{user.createTime}</td>
            <td>{user.updateTime}</td>
            <td>
              <Button variant="link" size="sm" onClick={() => handleEdit(user)}>修改</Button>
              <Button variant="link" size="sm" className="text-danger" onClick={() => handleDelete(user)}>删除</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default UserDataTable;
