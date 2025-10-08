import React from 'react';
import { Card } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';

type DarkThemeStyles = {
  pageContainer: React.CSSProperties;
  card: React.CSSProperties;
  title: React.CSSProperties;
  statisticPrimary: React.CSSProperties;
  statisticSuccess: React.CSSProperties;
  statisticWarning: React.CSSProperties;
  statisticPurple: React.CSSProperties;
  chartBackground: React.CSSProperties;
  button: React.CSSProperties;
  resetButton: React.CSSProperties;
  input: React.CSSProperties;
  table: React.CSSProperties;
  statisticCard: React.CSSProperties;
};

interface DataTableProps {
  columns: ProColumns<API.TempMonitor>[];
  actionRef: React.MutableRefObject<ActionType | undefined>;
  request: (params: any) => Promise<any>;
  isMobile: boolean;
  darkThemeStyles: DarkThemeStyles;
}

const DataTable: React.FC<DataTableProps> = ({ columns, actionRef, request, isMobile, darkThemeStyles }) => {
  return (
    <Card style={{...darkThemeStyles.card, boxShadow: 'none'}} className="no-shadow-card">
      <ProTable<API.TempMonitor>
        headerTitle={<span style={darkThemeStyles.title}>数据列表</span>}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={false}
        className="dark-table"
        showSorterTooltip={false}
        sortDirections={[]}
        request={request}
        columns={columns}
        scroll={{ x: isMobile ? 280 : 'max-content' }}
        rowClassName={() => 'dark-table-row'}
        pagination={{
          pageSize: 20,
          showQuickJumper: true,
          showSizeChanger: false,
          showPrevNextJumpers: true,
          showLessItems: false,
          hideOnSinglePage: false,
          showTotal: (total: number) => {
            const totalPages = Math.ceil(total / 20);
            return `共 ${totalPages} 页，${total} 条数据`;
          },
          style: { color: '#fff' }
        }}
        tableStyle={{
          backgroundColor: 'transparent',
          color: '#fff',
          boxShadow: 'none',
          WebkitBoxShadow: 'none',
          MozBoxShadow: 'none'
        }}
        options={{
          reload: true,
          density: true,
          fullScreen: true,
          setting: true,
        }}
      />
    </Card>
  );
};

export default DataTable;



