import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';

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

interface Stats {
  totalDevices: number;
  avgTemperature: number;
  avgHumidity: number;
  totalElectricEnergy: number;
}

interface StatisticsCardsProps {
  energyConsumption: number;
  stats: Stats;
  darkThemeStyles: DarkThemeStyles;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ energyConsumption, stats, darkThemeStyles }) => {
  return (
    <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
      <Col xs={24} sm={12} md={8}>
        <Card style={{ ...darkThemeStyles.statisticCard, height: '120px', display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #a855f7, transparent)' }}></div>
          <div style={{ width: '100%' }}>
            <Statistic
              title={<span style={{ color: '#fff', fontWeight: 'bold', textShadow: '0 0 8px rgba(255, 255, 255, 0.5)' }}>车间</span>}
              value="114_2#楼办公区域"
              valueStyle={{
                ...darkThemeStyles.statisticPurple,
                fontSize: '16px',
                fontWeight: '700'
              }}
            />
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Card style={{ ...darkThemeStyles.statisticCard, height: '120px', display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #00ff88, transparent)' }}></div>
          <div style={{ width: '100%' }}>
            <Statistic
              title={<span style={{ color: '#fff', fontWeight: 'bold', textShadow: '0 0 8px rgba(255, 255, 255, 0.5)' }}>电能消耗</span>}
              value={Number(energyConsumption.toFixed(2))}
              suffix="kWh"
              precision={2}
              valueStyle={{
                ...darkThemeStyles.statisticSuccess,
                fontSize: '16px',
                fontWeight: '700'
              }}
            />
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Card style={{ ...darkThemeStyles.statisticCard, height: '120px', display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #ff6b35, transparent)' }}></div>
          <div style={{ width: '100%' }}>
            <Statistic
              title={<span style={{ color: '#fff', fontWeight: 'bold', textShadow: '0 0 8px rgba(255, 255, 255, 0.5)' }}>总电能消耗</span>}
              value={Number(stats.totalElectricEnergy.toFixed(2))}
              suffix="kWh"
              precision={2}
              prefix={<ThunderboltOutlined style={{ color: '#ff6b35', filter: 'drop-shadow(0 0 8px rgba(255, 107, 53, 0.6))' }} />}
              valueStyle={darkThemeStyles.statisticWarning}
            />
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default StatisticsCards;



