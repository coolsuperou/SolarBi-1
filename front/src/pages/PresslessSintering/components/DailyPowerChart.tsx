import React from 'react';
import { Card, Badge, Space, Spin } from 'antd';
import { CalendarOutlined, LoadingOutlined } from '@ant-design/icons';
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

interface DailyPowerChartProps {
  chartOptions: any;
  trendData: any[];
  isMobile: boolean;
  isSmallMobile: boolean;
  darkThemeStyles: DarkThemeStyles;
  loading?: boolean;
}

const DailyPowerChart: React.FC<DailyPowerChartProps> = ({ chartOptions, trendData, isMobile, isSmallMobile, darkThemeStyles, loading = false }) => {
  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Space>
            <CalendarOutlined style={{ color: '#00d4ff', filter: 'drop-shadow(0 0 10px rgba(0, 212, 255, 0.6))' }} />
            <span style={darkThemeStyles.title}>无压烧结 日电能消耗监控</span>
          </Space>
          <Space>
            <Badge
              status="processing"
              text={<span style={{ fontSize: '12px', color: '#00d4ff', fontWeight: 'bold', textShadow: '0 0 8px rgba(0, 212, 255, 0.6)' }}>日模式</span>}
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
        {loading ? (
          <div style={{
            height: isMobile ? (isSmallMobile ? 250 : 300) : 400,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#00d4ff',
            fontSize: isMobile ? (isSmallMobile ? '14px' : '15px') : '16px'
          }}>
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: isMobile ? 32 : 40, color: '#00d4ff' }} spin />}
              size="large"
            />
            <div style={{
              marginTop: '20px',
              fontWeight: 'bold',
              fontSize: isMobile ? (isSmallMobile ? '14px' : '15px') : '16px',
              color: '#00d4ff',
              textShadow: '0 0 8px rgba(0, 212, 255, 0.6)'
            }}>
              正在加载日电能数据...
            </div>
          </div>
        ) : trendData.length > 0 && chartOptions.series ? (
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
            <div style={{ marginBottom: '20px', fontSize: isMobile ? (isSmallMobile ? '36px' : '42px') : '48px', opacity: 0.3 }}>📅</div>
            <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: isMobile ? (isSmallMobile ? '14px' : '15px') : '16px' }}>暂无日电能数据</div>
            <div style={{ fontSize: isMobile ? (isSmallMobile ? '12px' : '13px') : '14px', textAlign: 'center', opacity: 0.7 }}>
              当前时间范围内没有有效的日电能记录<br/>
              请检查数据源或调整时间范围
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DailyPowerChart;
