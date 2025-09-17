import { updateUserUsingPost } from '@/services/SolarBi-front/userController';
import { ProForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import '@umijs/max';
import { message, Modal } from 'antd';
import React from 'react';
import darkThemeStyles from '@/styles/darkTheme';

interface Props {
  oldData?: API.User;
  visible: boolean;
  onSubmit: (values: API.UserAddRequest) => void;
  onCancel: () => void;
}

/**
 * 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: API.UserUpdateRequest) => {
  const hide = message.loading('正在更新');
  try {
    await updateUserUsingPost(fields);
    hide();
    message.success('更新成功');
    return true;
  } catch (error: any) {
    hide();
    message.error('更新失败，' + error.message);
    return false;
  }
};

/**
 * 更新弹窗
 * @param props
 * @constructor
 */
const UpdateModal: React.FC<Props> = (props) => {
  const { oldData, visible, onSubmit, onCancel } = props;

  if (!oldData) {
    return <></>;
  }

  return (
    <Modal
      destroyOnClose
      title={<span style={{ ...darkThemeStyles.title, fontSize: '18px' }}>编辑用户</span>}
      open={visible}
      footer={null}
      onCancel={() => {
        onCancel?.();
      }}
      width={520}
      styles={{
        content: {
          background: 'linear-gradient(135deg, rgba(10, 25, 41, 0.95), rgba(26, 35, 126, 0.9))',
          border: '2px solid #00d4ff',
          borderRadius: '12px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 40px rgba(0, 212, 255, 0.5)',
        },
        header: {
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 212, 255, 0.08))',
          borderBottom: '2px solid #00d4ff',
          borderRadius: '12px 12px 0 0',
        },
        body: {
          background: 'transparent',
        }
      }}
    >
      <style>{`
        .ant-modal-content {
          background: linear-gradient(135deg, rgba(10, 25, 41, 0.95), rgba(26, 35, 126, 0.9)) !important;
          border: 2px solid #00d4ff !important;
          border-radius: 12px !important;
        }
        
        .ant-modal-header {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 212, 255, 0.08)) !important;
          border-bottom: 2px solid #00d4ff !important;
          border-radius: 12px 12px 0 0 !important;
        }
        
        .ant-modal-body {
          background: transparent !important;
          color: #fff !important;
        }
        
        .ant-form-item-label > label {
          color: #00d4ff !important;
          font-weight: 600 !important;
          text-shadow: 0 0 6px rgba(0, 212, 255, 0.6) !important;
        }
        
        .ant-input, .ant-input-affix-wrapper {
          background: linear-gradient(135deg, rgba(10, 25, 41, 0.8), rgba(26, 35, 126, 0.6)) !important;
          border: 2px solid rgba(0, 212, 255, 0.4) !important;
          border-radius: 8px !important;
          color: #fff !important;
          font-weight: 500 !important;
        }
        
        .ant-input:focus, .ant-input-affix-wrapper:focus {
          border-color: #00d4ff !important;
          box-shadow: 0 0 15px rgba(0, 212, 255, 0.5) !important;
        }
        
        .ant-input::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
        }
        
        .ant-input[disabled] {
          background: rgba(0, 212, 255, 0.1) !important;
          border-color: rgba(0, 212, 255, 0.3) !important;
          color: rgba(255, 255, 255, 0.7) !important;
        }
        
        .ant-select-selector {
          background: linear-gradient(135deg, rgba(10, 25, 41, 0.8), rgba(26, 35, 126, 0.6)) !important;
          border: 2px solid rgba(0, 212, 255, 0.4) !important;
          border-radius: 8px !important;
          color: #fff !important;
        }
        
        .ant-select-selection-item {
          color: #fff !important;
          font-weight: 500 !important;
        }
        
        .ant-select-selection-placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
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
        
        .ant-btn-default {
          background: linear-gradient(135deg, rgba(10, 25, 41, 0.8), rgba(26, 35, 126, 0.6)) !important;
          border: 2px solid rgba(0, 212, 255, 0.4) !important;
          border-radius: 8px !important;
          color: #00d4ff !important;
          font-weight: 600 !important;
        }
        
        .ant-btn:hover {
          transform: translateY(-1px) !important;
        }
        
        .ant-form-item-explain-error {
          color: #ff6b6b !important;
          text-shadow: 0 0 6px rgba(255, 107, 107, 0.6) !important;
        }
      `}</style>
      <ProForm
        layout="vertical"
        initialValues={oldData}
        onFinish={async (values: API.UserAddRequest) => {
          const success = await handleUpdate({
            ...values,
            id: oldData.id as any,
          });
          if (success) {
            onSubmit?.(values);
          }
        }}
        submitter={{
          searchConfig: {
            submitText: '更新',
            resetText: '重置',
          },
        }}
      >
        <ProFormText
          name="userAccount"
          label="账号"
          placeholder="请输入账号"
          disabled
          fieldProps={{
            style: { 
              ...darkThemeStyles.input, 
              fontWeight: 500,
              background: 'rgba(0, 212, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.7)'
            },
          }}
        />
        <ProFormText
          name="userName"
          label="用户名"
          placeholder="请输入用户名"
          fieldProps={{
            style: { ...darkThemeStyles.input, fontWeight: 500 },
          }}
        />
        <ProFormText
          name="userAvatar"
          label="头像"
          placeholder="请输入头像链接"
          fieldProps={{
            style: { ...darkThemeStyles.input, fontWeight: 500 },
          }}
        />
        <ProFormSelect
          name="userRole"
          label="权限"
          placeholder="请选择权限"
          valueEnum={{
            user: {
              text: '用户',
            },
            admin: {
              text: '管理员',
            },
          }}
          rules={[
            {
              required: true,
              message: '权限是必填项！',
            },
          ]}
        />
      </ProForm>
    </Modal>
  );
};
export default UpdateModal;
