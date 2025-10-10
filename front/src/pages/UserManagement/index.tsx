import React, { useState, useEffect } from 'react';
import { message, Modal } from 'antd';
import './styles.css';

/**
 * 用户管理系统页面 - 基于HTML设计实现
 */
const UserManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('添加用户');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [passwordVisible, setPasswordVisible] = useState<Record<number, boolean>>({});

  // 表单数据
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user',
    status: 'active',
  });

  // 权限数据
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    'perm-monthly': true,
    'perm-hourly': true,
    'perm-aircon': false,
    'perm-office': false,
    'perm-workshop1': false,
    'perm-workshop2': false,
    'perm-workshop3': false,
    'perm-canteen': false,
    'perm-dorm': false,
    'perm-user-mgmt': true,
  });

  // 初始化示例数据
  useEffect(() => {
    const mockUsers = [
      {
        id: 1,
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        status: 'active',
        createTime: '2025-01-01',
        lastLogin: '2025-10-09 15:30',
      },
      {
        id: 2,
        username: 'user001',
        password: 'user123',
        role: 'user',
        status: 'active',
        createTime: '2025-02-15',
        lastLogin: '2025-10-08 09:20',
      },
      {
        id: 3,
        username: 'zhangsan',
        password: 'zhang123',
        role: 'user',
        status: 'inactive',
        createTime: '2025-03-20',
        lastLogin: '2025-09-30 14:15',
      },
    ];
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
  }, []);

  // 搜索用户
  const handleSearch = () => {
    const filtered = users.filter((user) =>
      Object.values(user).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredUsers(filtered);
  };

  // 切换密码显示/隐藏
  const togglePassword = (userId: number) => {
    setPasswordVisible((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // 打开添加用户模态框
  const openAddUserModal = () => {
    setModalTitle('添加用户');
    setFormData({
      username: '',
      password: '',
      role: 'user',
      status: 'active',
    });
    setCurrentUser(null);
    setUserModalVisible(true);
  };

  // 编辑用户
  const editUser = (user: any) => {
    setModalTitle('编辑用户');
    setFormData({
      username: user.username,
      password: user.password,
      role: user.role,
      status: user.status,
    });
    setCurrentUser(user);
    setUserModalVisible(true);
  };

  // 保存用户
  const handleSaveUser = () => {
    if (!formData.username || !formData.password) {
      message.error('用户名和密码不能为空！');
      return;
    }

    if (currentUser) {
      // 编辑用户
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id ? { ...u, ...formData } : u
        )
      );
      message.success('用户更新成功！');
    } else {
      // 添加新用户
      const newUser = {
        id: users.length + 1,
        ...formData,
        createTime: new Date().toISOString().split('T')[0],
        lastLogin: '-',
      };
      setUsers((prev) => [...prev, newUser]);
      message.success('用户添加成功！');
    }

    setUserModalVisible(false);
    setFilteredUsers(users);
  };

  // 删除用户
  const deleteUser = (userId: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该用户吗？此操作不可恢复！',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setFilteredUsers((prev) => prev.filter((u) => u.id !== userId));
        message.success('用户已删除');
      },
    });
  };

  // 打开权限设置模态框
  const openPermissionModal = (user: any) => {
    setCurrentUser(user);
    setPermissionModalVisible(true);
  };

  // 保存权限
  const savePermissions = () => {
    const selectedPerms = Object.keys(permissions).filter((key) => permissions[key]);
    console.log('保存的权限:', selectedPerms);
    message.success(`权限保存成功！已选择 ${selectedPerms.length} 项权限`);
    setPermissionModalVisible(false);
  };

  return (
    <div className="user-management-container">
      {/* 工具栏 */}
      <div className="toolbar">
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 搜索用户名、角色..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn" onClick={handleSearch}>
            搜索
          </button>
        </div>
        <button className="btn btn-add" onClick={openAddUserModal}>
          ➕ 添加用户
        </button>
      </div>

      {/* 用户表格 */}
      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>角色</th>
              <th>密码</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>最后登录</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td style={{ textAlign: 'center' }}>{user.id}</td>
                <td>{user.username}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                    {user.role === 'admin' ? '管理员' : '普通用户'}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="password-display">
                    {passwordVisible[user.id] ? user.password : '••••••••'}
                  </span>
                  <button
                    className="btn-action btn-password-toggle"
                    onClick={() => togglePassword(user.id)}
                  >
                    👁️ {passwordVisible[user.id] ? '隐藏' : '显示'}
                  </button>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span
                    className={`status-indicator ${
                      user.status === 'active' ? 'status-active' : 'status-inactive'
                    }`}
                  ></span>
                  <span>{user.status === 'active' ? '活跃' : '禁用'}</span>
                </td>
                <td style={{ textAlign: 'center' }}>{user.createTime}</td>
                <td style={{ textAlign: 'center' }}>{user.lastLogin}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-action btn-edit" onClick={() => editUser(user)}>
                      ✏️ 编辑
                    </button>
                    <button
                      className="btn-action btn-permission"
                      onClick={() => openPermissionModal(user)}
                    >
                      🔑 权限
                    </button>
                    <button className="btn-action btn-delete" onClick={() => deleteUser(user.id)}>
                      🗑️ 删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 添加/编辑用户模态框 */}
      <Modal
        title={<span style={{ color: '#00d4ff', fontSize: '20px', fontWeight: 'bold' }}>{modalTitle}</span>}
        open={userModalVisible}
        onOk={handleSaveUser}
        onCancel={() => setUserModalVisible(false)}
        okText="保存"
        cancelText="取消"
        className="user-modal"
      >
        <div className="form-group">
          <label className="form-label">用户名</label>
          <input
            type="text"
            className="form-input"
            placeholder="请输入用户名"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">密码</label>
          <input
            type="password"
            className="form-input"
            placeholder="请输入密码"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">角色</label>
          <select
            className="form-select"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">状态</label>
          <select
            className="form-select"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="active">活跃</option>
            <option value="inactive">禁用</option>
          </select>
        </div>
      </Modal>

      {/* 权限设置模态框 */}
      <Modal
        title={<span style={{ color: '#00d4ff', fontSize: '20px', fontWeight: 'bold' }}>权限设置</span>}
        open={permissionModalVisible}
        onOk={savePermissions}
        onCancel={() => setPermissionModalVisible(false)}
        okText="保存权限"
        cancelText="取消"
        width={600}
        className="permission-modal"
      >
        <div className="form-group">
          <label className="form-label">
            用户: <span style={{ color: '#00ff66' }}>{currentUser?.username}</span>
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">页面访问权限</label>
          <div className="permission-list">
            {[
              { id: 'perm-monthly', icon: '📊', name: '月度能耗统计', desc: '查看和管理月度能耗数据' },
              { id: 'perm-hourly', icon: '📈', name: '日能耗统计', desc: '查看和管理小时能耗数据' },
              { id: 'perm-aircon', icon: '❄️', name: '空调水机主机', desc: '查看空调水机主机数据' },
              { id: 'perm-office', icon: '🏢', name: '办公楼', desc: '查看办公楼能耗数据' },
              { id: 'perm-workshop1', icon: '🏭', name: '101配料车间', desc: '查看配料车间数据' },
              { id: 'perm-workshop2', icon: '🏭', name: '102造粒车间', desc: '查看造粒车间数据' },
              { id: 'perm-workshop3', icon: '🏭', name: '103冷压车间', desc: '查看冷压车间数据' },
              { id: 'perm-canteen', icon: '🍽️', name: '食堂', desc: '查看食堂能耗数据' },
              { id: 'perm-dorm', icon: '🏠', name: '宿舍楼', desc: '查看宿舍楼能耗数据' },
              { id: 'perm-user-mgmt', icon: '👥', name: '用户管理', desc: '管理系统用户和权限' },
            ].map((perm) => (
              <div key={perm.id} className="permission-item">
                <input
                  type="checkbox"
                  className="permission-checkbox"
                  id={perm.id}
                  checked={permissions[perm.id]}
                  onChange={(e) =>
                    setPermissions({ ...permissions, [perm.id]: e.target.checked })
                  }
                />
                <label className="permission-label" htmlFor={perm.id}>
                  <div>
                    {perm.icon} {perm.name}
                  </div>
                  <div className="permission-desc">{perm.desc}</div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
