import React from 'react';
import type { ProColumns } from '@ant-design/pro-components';
import { Badge, Space } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import moment from 'moment';

export const getColumns = (isMobile: boolean): ProColumns<API.TempMonitor>[] => {
  const columns: ProColumns<API.TempMonitor>[] = [
    {
      title: '设备ID',
      dataIndex: 'deviceId',
      valueType: 'text',
      width: 120,
      fixed: 'left',
      copyable: true,
    },
    {
      title: '部门车间',
      dataIndex: 'workshop',
      valueType: 'text',
      width: 140,
      render: (_, record) => (
        <div style={{
          color: '#a855f7 !important',
          textShadow: '0 0 8px rgba(168, 85, 247, 0.8)',
          fontWeight: '700',
          fontSize: '14px'
        }}>
          <Badge
            status="processing"
            text={
              <span style={{
                color: '#a855f7',
                textShadow: '0 0 8px rgba(168, 85, 247, 0.8)',
                fontWeight: '700'
              }}>
                {record.workshop}
              </span>
            }
          />
        </div>
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      valueType: 'text',
      width: 120,
      render: (_, record) => (
        <Space>
          <DatabaseOutlined style={{ color: '#1890ff' }} />
          {record.name}
        </Space>
      ),
    },
    {
      title: '电能度数',
      dataIndex: 'electricEnergy',
      valueType: 'digit',
      width: isMobile ? 5 : 140,
      render: (_, record) => (
        <div style={{
          color: '#ffd700 !important',
          textShadow: '0 0 8px rgba(255, 215, 0, 0.8)',
          fontWeight: '700',
          fontSize: isMobile ? '11px' : '14px'
        }}>
          {isMobile ? (
            <span style={{
              fontWeight: '700',
              color: '#ffd700',
              textShadow: '0 0 8px rgba(255, 215, 0, 0.8)',
              fontSize: '11px'
            }}>
              {(record.electricEnergy || 0).toFixed(2)}
            </span>
          ) : (
            <Space>
              <span style={{
                fontWeight: '700',
                color: '#ffd700',
                textShadow: '0 0 8px rgba(255, 215, 0, 0.8)',
                fontSize: '14px'
              }}>
                {(record.electricEnergy || 0).toFixed(2)}
              </span>
            </Space>
          )}
        </div>
      ),
    },
    {
      title: '时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      width: isMobile ? 100 : 180,
      render: (_, record) => (
        <span style={{
          fontSize: isMobile ? '11px' : '14px',
          color: '#fff',
          whiteSpace: 'nowrap'
        }}>
          {record.updateTime ? moment(record.updateTime).format('MM-DD HH:mm') : '-'}
        </span>
      ),
    },
  ];

  return isMobile
    ? columns.filter(col => ['electricEnergy', 'updateTime'].includes(col.dataIndex as string))
    : columns;
};