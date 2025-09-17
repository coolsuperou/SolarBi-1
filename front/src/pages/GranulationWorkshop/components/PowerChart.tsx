import React from 'react';
import { Card, Badge, Space } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

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

interface PowerChartProps {
  chartOptions: any;
  trendData: any[];
  isMobile: boolean;
  isSmallMobile: boolean;
  darkThemeStyles: DarkThemeStyles;
}

const PowerChart: React.FC<PowerChartProps> = ({ chartOptions, trendData, isMobile, isSmallMobile, darkThemeStyles }) => {
  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Space>
            <BarChartOutlined style={{ color: '#00d4ff', filter: 'drop-shadow(0 0 10px rgba(0, 212, 255, 0.6))' }} />
            <span style={darkThemeStyles.title}>102造粒环保设备 实时电能监控</span>
          </Space>
          <Space>
            <Badge
              status="processing"
              text={<span style={{ fontSize: '12px', color: '#00d4ff', fontWeight: 'bold', textShadow: '0 0 8px rgba(0, 212, 255, 0.6)' }}>实时更新中</span>}
            />
          </Space>
        </div>
      }
      style={{ ...darkThemeStyles.card, marginBottom: 16 }}
    >
      <div style={{
        height: isMobile ? (isSmallMobile ? 280 : 330) : 450,
        ...darkThemeStyles.chartBackground
      }}>
        {trendData.length > 0 && chartOptions.series ? (
          <ReactECharts
            option={chartOptions}
            style={{
              height: isMobile ? (isSmallMobile ? 250 : 300) : 400
            }}
            className="echarts-container"
            notMerge={false}
            lazyUpdate={true}
          />
        ) : (
          <div style={{
            height: isMobile ? (isSmallMobile ? 250 : 300) : 400,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#999',
            fontSize: isMobile ? (isSmallMobile ? '14px' : '15px') : '16px'
          }}>
            <div style={{ marginBottom: '20px', fontSize: isMobile ? (isSmallMobile ? '36px' : '42px') : '48px', opacity: 0.3 }}>📊</div>
            <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: isMobile ? (isSmallMobile ? '14px' : '15px') : '16px' }}>暂无电能数据</div>
            <div style={{ fontSize: isMobile ? (isSmallMobile ? '12px' : '13px') : '14px', textAlign: 'center', opacity: 0.7 }}>
              当前时间范围内没有有效的电能记录<br/>
              请检查数据源或调整时间范围
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PowerChart;



