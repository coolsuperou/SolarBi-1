import React, { useState, useEffect } from 'react';
import { message, Modal } from 'antd';
import {
  listUserByPageUsingPost,
  addUserUsingPost,
  updateUserUsingPost,
  deleteUserUsingPost,
} from '@/services/SolarBi-front/userController';
import { createFullPermissions, getDefaultPermissions, PERMISSION_CONFIG, ALL_PERMISSION_KEYS } from './utils';
import './styles.css';

/**
 * 用户管理系统页面 - 使用真实API数据
 */
const UserManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('添加用户');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [passwordVisible, setPasswordVisible] = useState<Record<number, boolean>>({});

  // 表单数据
  const [formData, setFormData] = useState({
    userAccount: '',
    userPassword: '',
    confirmPassword: '',
    userName: '',
    userRole: 'user',
    userStatus: 'active',
  });

  // 🔥 使用统一配置自动生成的默认权限
  const [permissions, setPermissions] = useState<Record<string, boolean>>(getDefaultPermissions());

  // 加载用户列表
  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await listUserByPageUsingPost({
        current: 1,
        pageSize: 100,
        sortField: 'createTime',
        sortOrder: 'descend',
      });

      if (response.code === 0 && response.data) {
        const userList = response.data.records || [];
        setUsers(userList);
        setFilteredUsers(userList);
        message.success('数据加载成功');
      } else {
        message.error('加载用户数据失败：' + response.message);
      }
    } catch (error) {
      console.error('加载用户列表失败:', error);
      message.error('加载用户数据失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载用户
  useEffect(() => {
    loadUsers();
  }, []);

  // 搜索用户
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter((user) =>
      user.userAccount?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userRole?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
    message.info(`找到 ${filtered.length} 个匹配的用户`);
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
      userAccount: '',
      userPassword: '',
      confirmPassword: '',
      userName: '',
      userRole: 'user',
      userStatus: 'active',
    });
    // 重置为默认权限（所有权限为 false）
    setPermissions(getDefaultPermissions());
    setCurrentUser(null);
    setUserModalVisible(true);
  };

  // 编辑用户
  const editUser = (user: any) => {
    setModalTitle('编辑用户');
    setFormData({
      userAccount: user.userAccount || '',
      userPassword: user.userPassword || '',
      confirmPassword: '',
      userName: user.userName || '',
      userRole: user.userRole || 'user',
      userStatus: user.userStatus || 'active',
    });

    // ✅ 修复：解析用户权限并确保包含所有30个权限的完整对象
    try {
      const userPerms = JSON.parse(user.pagePermissions || '{}');
      // 使用工具函数创建完整权限对象：未选中的权限会自动补充为 false
      const fullPerms = createFullPermissions(userPerms);
      setPermissions(fullPerms);
    } catch (error) {
      console.error('解析权限JSON失败:', error);
      message.error('用户权限数据损坏，请联系管理员！');
      // 出错时使用默认权限
      setPermissions(getDefaultPermissions());
    }

    setCurrentUser(user);
    setUserModalVisible(true);
  };

  // 保存用户
  const handleSaveUser = async () => {
    if (!formData.userAccount || !formData.userPassword) {
      message.error('用户账号和密码不能为空！');
      return;
    }

    // 添加用户时验证密码确认
    if (!currentUser && formData.userPassword !== formData.confirmPassword) {
      message.error('两次输入的密码不一致！');
      return;
    }

    // 验证至少选择了一个页面访问权限
    const hasPermission = Object.values(permissions).some(value => value === true);
    if (!hasPermission) {
      message.error('请至少选择一个页面访问权限！');
      return;
    }

    setLoading(true);
    try {
      if (currentUser) {
        // 编辑用户（带权限）
        const permissionsJson = JSON.stringify(permissions);
        const response = await updateUserUsingPost({
          id: currentUser.id,
          userAccount: formData.userAccount,
          userPassword: formData.userPassword,
          userName: formData.userName,
          userRole: formData.userRole,
          userStatus: formData.userStatus,
          pagePermissions: permissionsJson,
        });

        if (response.code === 0) {
          const selectedCount = Object.values(permissions).filter(v => v).length;
          message.success(`用户更新成功！已设置 ${selectedCount} 项权限`);
          setUserModalVisible(false);
          await loadUsers();
        } else {
          message.error('更新失败：' + response.message);
        }
      } else {
        // 添加新用户（带权限）
        const permissionsJson = JSON.stringify(permissions);
        const response = await addUserUsingPost({
          userAccount: formData.userAccount,
          userPassword: formData.userPassword,
          userName: formData.userName,
          userRole: formData.userRole,
          userStatus: formData.userStatus,
          pagePermissions: permissionsJson,
        });

        if (response.code === 0) {
          const selectedCount = Object.values(permissions).filter(v => v).length;
          message.success(`用户创建成功！已设置 ${selectedCount} 项权限`);
          setUserModalVisible(false);
          await loadUsers();
        } else {
          message.error('添加失败：' + response.message);
        }
      }
    } catch (error) {
      console.error('保存用户失败:', error);
      message.error('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 删除用户
  const deleteUser = (userId: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该用户吗？此操作不可恢复！',
      okText: '确定',
      cancelText: '取消',
      className: 'tech-confirm-modal',
      icon: <span style={{ fontSize: '24px' }}>⚠️</span>,
      okButtonProps: {
        className: 'tech-confirm-ok-btn',
        danger: true,
      },
      cancelButtonProps: {
        className: 'tech-confirm-cancel-btn',
      },
      onOk: async () => {
        try {
          const response = await deleteUserUsingPost({ id: userId });
          if (response.code === 0) {
            message.success('用户已删除');
            await loadUsers();
          } else {
            message.error('删除失败：' + response.message);
          }
        } catch (error) {
          console.error('删除用户失败:', error);
          message.error('删除失败，请重试');
        }
      },
    });
  };

  // 打开权限设置模态框
  const openPermissionModal = (user: any) => {
    setCurrentUser(user);

    // ✅ 修复：解析用户权限并确保包含所有30个权限的完整对象
    try {
      const userPerms = JSON.parse(user.pagePermissions || '{}');
      // 使用工具函数创建完整权限对象：未选中的权限会自动补充为 false
      const fullPerms = createFullPermissions(userPerms);
      setPermissions(fullPerms);
    } catch (error) {
      console.error('解析权限JSON失败:', error);
      message.error('用户权限数据损坏，请联系管理员！');
      // 出错时使用默认权限
      setPermissions(getDefaultPermissions());
    }

    setPermissionModalVisible(true);
  };

  // 全选权限（使用统一配置）
  const selectAllPermissions = () => {
    const allTrue: Record<string, boolean> = {};
    ALL_PERMISSION_KEYS.forEach(key => {
      allTrue[key] = true;
    });
    setPermissions(allTrue);
  };

  // 全不选权限（使用统一配置）
  const deselectAllPermissions = () => {
    setPermissions(getDefaultPermissions());
  };

  // 切换权限（点击卡片）
  const togglePermission = (key: string) => {
    setPermissions({ ...permissions, [key]: !permissions[key] });
  };

  // 保存权限
  const savePermissions = async () => {
    if (!currentUser) return;

    // 验证至少选择了一个页面访问权限
    const hasPermission = Object.values(permissions).some(value => value === true);
    if (!hasPermission) {
      message.error('请至少选择一个页面访问权限！');
      return;
    }

    setLoading(true);
    try {
      const permissionsJson = JSON.stringify(permissions);
      const response = await updateUserUsingPost({
        id: currentUser.id,
        pagePermissions: permissionsJson,
      });

      if (response.code === 0) {
        const selectedCount = Object.values(permissions).filter(v => v).length;
        message.success(`权限保存成功！已选择 ${selectedCount} 项权限`);
        setPermissionModalVisible(false);
        await loadUsers();
      } else {
        message.error('保存权限失败：' + response.message);
      }
    } catch (error) {
      console.error('保存权限失败:', error);
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 格式化时间显示
  const formatTime = (time: string) => {
    if (!time) return '-';
    return time.replace('T', ' ').substring(0, 16);
  };

  return (
    <div className="user-management-container">
      {/* 工具栏 */}
      <div className="toolbar">
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 搜索用户账号、昵称、角色..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn" onClick={handleSearch} disabled={loading}>
            搜索
          </button>
        </div>
        <button className="btn btn-add" onClick={openAddUserModal} disabled={loading}>
          ➕ 添加用户
        </button>
      </div>

      {/* 用户表格 */}
      <div className="table-container">
        {loading && <div style={{ textAlign: 'center', padding: '20px', color: '#00d4ff' }}>加载中...</div>}
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户账号</th>
              <th>用户昵称</th>
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
                <td>{user.userAccount}</td>
                <td>{user.userName || '-'}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`role-badge ${user.userRole === 'admin' ? 'role-admin' : 'role-user'}`}>
                    {user.userRole === 'admin' ? '管理员' : '普通用户'}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="password-display">
                    {passwordVisible[user.id] ? user.userPassword : '••••••••'}
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
                      user.userStatus === 'active' ? 'status-active' : 'status-inactive'
                    }`}
                  ></span>
                  <span>{user.userStatus === 'active' ? '活跃' : '禁用'}</span>
                </td>
                <td style={{ textAlign: 'center' }}>{formatTime(user.createTime)}</td>
                <td style={{ textAlign: 'center' }}>{formatTime(user.lastLoginTime)}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-action btn-edit" onClick={() => editUser(user)} disabled={loading}>
                      ✏️ 编辑
                    </button>
                    <button
                      className="btn-action btn-permission"
                      onClick={() => openPermissionModal(user)}
                      disabled={loading}
                    >
                      🔑 权限
                    </button>
                    <button className="btn-action btn-delete" onClick={() => deleteUser(user.id)} disabled={loading}>
                      🗑️ 删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 添加/编辑用户模态框 - 两列布局 */}
      <Modal
        title={null}
        open={userModalVisible}
        onOk={handleSaveUser}
        onCancel={() => setUserModalVisible(false)}
        okText="💾 创建用户"
        cancelText="取消"
        confirmLoading={loading}
        width={1000}
        className="add-user-modal"
        footer={null}
      >
        <div className="add-user-modal-body">
          {/* 左侧：用户基本信息 */}
          <div className="user-info-section">
            <div className="add-section-title">📝 基本信息</div>

            <div className="form-group">
              <label className="form-label">
                用户账号 <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="请输入用户账号（用于登录）"
                value={formData.userAccount}
                onChange={(e) => setFormData({ ...formData, userAccount: e.target.value })}
              />
              <div className="form-help">用于登录系统，建议使用字母和数字组合</div>
            </div>

            <div className="form-group">
              <label className="form-label">用户昵称</label>
              <input
                type="text"
                className="form-input"
                placeholder="请输入用户昵称（可选）"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              />
              <div className="form-help">显示名称，可以使用中文</div>
            </div>

            <div className="form-group">
              <label className="form-label">
                密码 <span className="required">*</span>
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="请输入密码"
                value={formData.userPassword}
                onChange={(e) => setFormData({ ...formData, userPassword: e.target.value })}
              />
              <div className="form-help">建议使用8位以上的强密码</div>
            </div>

            {!currentUser && (
              <div className="form-group">
                <label className="form-label">
                  确认密码 <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="请再次输入密码"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                角色 <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={formData.userRole}
                onChange={(e) => setFormData({ ...formData, userRole: e.target.value })}
              >
                <option value="user">普通用户</option>
                <option value="admin">管理员</option>
              </select>
              <div className="form-help">管理员拥有所有权限</div>
            </div>

            <div className="form-group">
              <label className="form-label">状态</label>
              <select
                className="form-select"
                value={formData.userStatus}
                onChange={(e) => setFormData({ ...formData, userStatus: e.target.value })}
              >
                <option value="active">活跃</option>
                <option value="inactive">禁用</option>
              </select>
            </div>
          </div>

          {/* 右侧：权限设置 */}
          <div className="add-permissions-section">
            <div className="add-permissions-header">
              <div className="add-permissions-title">🔐 页面访问权限</div>
              <div className="quick-actions">
                <button className="permission-quick-btn" onClick={selectAllPermissions} type="button">
                  <span>✓</span> 全选
                </button>
                <button className="permission-quick-btn" onClick={deselectAllPermissions} type="button">
                  <span>✗</span> 全不选
                </button>
              </div>
            </div>

            <div className="permission-stats" style={{ marginBottom: '15px' }}>
              <div className="stat-item">
                已选择 <span className="stat-number">{Object.values(permissions).filter(v => v).length}</span>
              </div>
              <div className="stat-item">
                未选择 <span className="stat-number">{Object.values(permissions).filter(v => !v).length}</span>
              </div>
            </div>

            <div className="add-permissions-grid">
              {/* 🔥 使用统一配置渲染权限卡片 */}
              {PERMISSION_CONFIG.map((perm) => (
                <div
                  key={perm.key}
                  className={`permission-card ${permissions[perm.key] ? 'active' : ''}`}
                  onClick={() => togglePermission(perm.key)}
                >
                  <span className="permission-category-tag">{perm.category}</span>
                  <div className="permission-content">
                    <span className="permission-icon">{perm.icon}</span>
                    <div className="permission-label">
                      <div className="permission-name">{perm.name}</div>
                      <div className="permission-desc">{perm.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="add-modal-footer">
          <div className="footer-info">
            💡 提示：请完整填写用户信息并设置合适的页面访问权限
          </div>
          <div className="footer-actions">
            <button className="btn btn-cancel" onClick={() => setUserModalVisible(false)} disabled={loading}>
              <span className="btn-text">取消</span>
            </button>
            <button className="btn btn-save" onClick={handleSaveUser} disabled={loading}>
              <span className="btn-text">💾 {currentUser ? '保存修改' : '创建用户'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* 权限设置模态框 - 卡片网格布局 */}
      <Modal
        title={<span style={{ color: '#00d4ff', fontSize: '22px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>🔐 页面访问权限设置</span>}
        open={permissionModalVisible}
        onOk={savePermissions}
        onCancel={() => setPermissionModalVisible(false)}
        okText="💾 保存权限"
        cancelText="取消"
        confirmLoading={loading}
        width={1000}
        className="permission-modal"
        footer={null}
      >
        {/* 用户信息 */}
        <div style={{
          padding: '12px 20px',
          background: 'rgba(0, 212, 255, 0.05)',
          borderLeft: '3px solid #00ff66',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <span style={{ color: '#66d9ef' }}>
            用户: <span style={{ color: '#00ff66', fontWeight: 'bold' }}>{currentUser?.userAccount}</span>
            {' '}<span style={{ color: '#999' }}>({currentUser?.userName || '未设置昵称'})</span>
          </span>
        </div>

        {/* 快捷操作 */}
        <div className="permission-quick-actions">
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="permission-quick-btn" onClick={selectAllPermissions}>
              <span>✓</span> 全选
            </button>
            <button className="permission-quick-btn" onClick={deselectAllPermissions}>
              <span>✗</span> 全不选
            </button>
            <button className="permission-quick-btn permission-save-btn" onClick={savePermissions}>
              <span>💾</span> 保存
            </button>
          </div>
          <div className="permission-stats">
            <div className="stat-item">
              已选择 <span className="stat-number">{Object.values(permissions).filter(v => v).length}</span>
            </div>
            <div className="stat-item">
              未选择 <span className="stat-number">{Object.values(permissions).filter(v => !v).length}</span>
            </div>
          </div>
        </div>

        {/* 权限卡片网格 */}
        <div className="permissions-grid">
          {/* 🔥 使用统一配置渲染权限卡片 */}
          {PERMISSION_CONFIG.map((perm) => (
            <div
              key={perm.key}
              className={`permission-card ${permissions[perm.key] ? 'active' : ''}`}
              onClick={() => togglePermission(perm.key)}
            >
              <span className="permission-category-tag">{perm.category}</span>
              <div className="permission-content">
                <span className="permission-icon">{perm.icon}</span>
                <div className="permission-label">
                  <div className="permission-name">{perm.name}</div>
                  <div className="permission-desc">{perm.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
