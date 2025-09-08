import CreateModal from '@/pages/Admin/User/components/CreateModal';
import UpdateModal from '@/pages/Admin/User/components/UpdateModal';
import { deleteUserUsingPost, listUserByPageUsingPost } from '@/services/SolarBi-front/userController';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import '@umijs/max';
import { Button, message, Space, Typography } from 'antd';
import React, { useRef, useState } from 'react';
import darkThemeStyles from '@/pages/PowerMonitor/styles/darkThemeStyles';

/**
 * 用户管理页面
 *
 * @constructor
 */
const UserAdminPage: React.FC = () => {
  // 是否显示新建窗口
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  // 是否显示更新窗口
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  // 当前用户点击的数据
  const [currentRow, setCurrentRow] = useState<API.User>();

  /**
   * 删除节点
   *
   * @param row
   */
  const handleDelete = async (row: API.User) => {
    const hide = message.loading('正在删除');
    if (!row) return true;
    try {
      await deleteUserUsingPost({
        id: row.id as any,
      });
      hide();
      message.success('删除成功');
      actionRef?.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      message.error('删除失败，' + error.message);
      return false;
    }
  };

  /**
   * 表格列配置
   */
  const columns: ProColumns<API.User>[] = [
    {
      title: 'id',
      dataIndex: 'id',
      valueType: 'text',
      hideInForm: true,
    },
    {
      title: '账号',
      dataIndex: 'userAccount',
      valueType: 'text',
    },
    {
      title: '用户名',
      dataIndex: 'userName',
      valueType: 'text',
    },
    {
      title: '密码',
      dataIndex: 'userPassword',
      valueType: 'password',
      hideInTable: true,
      hideInSearch: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '密码是必填项！',
          },
        ],
      },
    },
    {
      title: '头像',
      dataIndex: 'userAvatar',
      valueType: 'image',
      fieldProps: {
        width: 64,
      },
      hideInSearch: true,
    },
    {
      title: '权限',
      dataIndex: 'userRole',
      valueEnum: {
        user: {
          text: '用户',
        },
        admin: {
          text: '管理员',
        },
      },
    },
    {
      title: '创建时间',
      sorter: true,
      dataIndex: 'createTime',
      valueType: 'dateTime',
      hideInSearch: true,
      hideInForm: true,
    },
    {
      title: '更新时间',
      sorter: true,
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      hideInSearch: true,
      hideInForm: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <Space size="middle">
          <Typography.Link
            onClick={() => {
              setCurrentRow(record);
              setUpdateModalVisible(true);
            }}
          >
            修改
          </Typography.Link>
          <Typography.Link type="danger" onClick={() => handleDelete(record)}>
            删除
          </Typography.Link>
        </Space>
      ),
    },
  ];
  return (
    <div style={{
      ...darkThemeStyles.pageContainer,
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* 背景装饰效果 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        background: `
          radial-gradient(circle at 20% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 60% 40%, rgba(0, 255, 136, 0.06) 0%, transparent 50%)
        `,
        zIndex: -1
      }}></div>

      {/* 网格背景效果 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        zIndex: -1
      }}></div>

      <style>{`
        /* 管理页面深色主题样式 */
        .ant-pro-page-container {
          background: transparent !important;
        }
        
        .ant-pro-table-card {
          background: linear-gradient(135deg, rgba(10, 25, 41, 0.9), rgba(26, 35, 126, 0.7)) !important;
          border: 2px solid #00d4ff !important;
          border-radius: 12px !important;
          backdrop-filter: blur(15px) !important;
          box-shadow: 0 0 30px rgba(0, 212, 255, 0.4), inset 0 0 40px rgba(0, 212, 255, 0.12) !important;
        }
        
        .ant-card-head {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 212, 255, 0.08)) !important;
          border-bottom: 2px solid #00d4ff !important;
        }
        
        .ant-card-head-title {
          color: #00d4ff !important;
          font-weight: 700 !important;
          text-shadow: 0 0 15px rgba(0, 212, 255, 0.8) !important;
        }
        
        .ant-card-body {
          background: transparent !important;
        }
        
        .ant-table {
          background: transparent !important;
          color: #fff !important;
        }
        
        .ant-table-thead th {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.1)) !important;
          border-bottom: 2px solid #00d4ff !important;
          color: #00d4ff !important;
          font-weight: 700 !important;
          text-shadow: 0 0 8px rgba(0, 212, 255, 0.8) !important;
        }
        
        .ant-table-tbody td {
          background: transparent !important;
          border-bottom: 1px solid rgba(0, 212, 255, 0.15) !important;
          color: #fff !important;
          font-weight: 600 !important;
        }
        
        .ant-table-tbody tr:hover td {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(0, 212, 255, 0.05)) !important;
        }
        
        .ant-btn-primary {
          background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%) !important;
          border: 2px solid #00d4ff !important;
          border-radius: 8px !important;
          color: #fff !important;
          font-weight: bold !important;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.5) !important;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.8) !important;
        }
        
        .ant-btn-primary:hover {
          background: linear-gradient(135deg, #00ffff 0%, #00ccff 100%) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 0 25px rgba(0, 212, 255, 0.7) !important;
        }
        
        .ant-input {
          background: linear-gradient(135deg, rgba(10, 25, 41, 0.8), rgba(26, 35, 126, 0.6)) !important;
          border: 2px solid rgba(0, 212, 255, 0.4) !important;
          border-radius: 8px !important;
          color: #fff !important;
          box-shadow: inset 0 0 15px rgba(0, 212, 255, 0.1) !important;
        }
        
        .ant-input:focus {
          border-color: #00d4ff !important;
          box-shadow: 0 0 15px rgba(0, 212, 255, 0.5) !important;
        }
        
        .ant-select-selector {
          background: linear-gradient(135deg, rgba(10, 25, 41, 0.8), rgba(26, 35, 126, 0.6)) !important;
          border: 2px solid rgba(0, 212, 255, 0.4) !important;
          border-radius: 8px !important;
          color: #fff !important;
        }
        
        .ant-select-selection-item {
          color: #fff !important;
        }
        
        .ant-typography {
          color: #fff !important;
        }
        
        .ant-typography-caption {
          color: rgba(255, 255, 255, 0.7) !important;
        }
        
        .ant-pagination {
          margin-top: 20px !important;
        }
        
        .ant-pagination .ant-pagination-item {
          background: linear-gradient(135deg, rgba(10, 25, 41, 0.8), rgba(26, 35, 126, 0.6)) !important;
          border: 2px solid rgba(0, 212, 255, 0.4) !important;
          border-radius: 6px !important;
        }
        
        .ant-pagination .ant-pagination-item a {
          color: #00d4ff !important;
          font-weight: 600 !important;
        }
        
        .ant-pagination .ant-pagination-item-active {
          background: linear-gradient(135deg, #00d4ff, #0099cc) !important;
          border-color: #00d4ff !important;
        }
        
        .ant-pagination .ant-pagination-item-active a {
          color: #fff !important;
        }
      `}</style>
      
      <PageContainer
        header={{
          title: <span style={{ ...darkThemeStyles.title, fontSize: '24px' }}>用户管理</span>,
          breadcrumb: {},
        }}
        style={{ background: 'transparent' }}
      >
      <ProTable<API.User>
        headerTitle={'查询表格'}
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCreateModalVisible(true);
            }}
          >
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={async (params, sort, filter) => {
          const sortField = Object.keys(sort)?.[0];
          const sortOrder = sort?.[sortField] ?? undefined;

          const { data, code } = await listUserByPageUsingPost({
            ...params,
            sortField,
            sortOrder,
            ...filter,
          } as API.UserQueryRequest);

          return {
            success: code === 0,
            data: data?.records || [],
            total: Number(data?.total) || 0,
          };
        }}
        columns={columns}
      />
      <CreateModal
        visible={createModalVisible}
        onSubmit={() => {
          setCreateModalVisible(false);
          actionRef.current?.reload();
        }}
        onCancel={() => {
          setCreateModalVisible(false);
        }}
      />
      <UpdateModal
        visible={updateModalVisible}
        oldData={currentRow}
        onSubmit={() => {
          setUpdateModalVisible(false);
          setCurrentRow(undefined);
          actionRef.current?.reload();
        }}
        onCancel={() => {
          setUpdateModalVisible(false);
        }}
      />
      </PageContainer>
    </div>
  );
};
export default UserAdminPage;
