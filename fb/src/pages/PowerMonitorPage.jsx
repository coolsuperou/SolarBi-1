import React, { useState } from 'react';
import { Container, ButtonGroup, ToggleButton } from 'react-bootstrap';
import StatisticsCards from '../components/powermonitor/StatisticsCards';
import PowerChart from '../components/powermonitor/PowerChart';
import DataTable from '../components/powermonitor/DataTable';
import SearchForm from '../components/powermonitor/SearchForm';
import './PowerMonitorPage.css';

// Updated mock data to better match the screenshot's visual style
const mockStats = {
  totalElectricEnergy: 711171.40,
  energyConsumption: 6003.50,
};

const mockHourChartData = [
  { time: '10:00', value: 320 }, { time: '11:00', value: 325 }, { time: '12:00', value: 328 },
  { time: '13:00', value: 325 }, { time: '14:00', value: 326 }, { time: '15:00', value: 324 },
  { time: '16:00', value: 322 }, { time: '17:00', value: 320 }, { time: '18:00', value: 315 },
  { time: '19:00', value: 310 }, { time: '20:00', value: 300 }, { time: '21:00', value: 250 },
  { time: '22:00', value: 220 }, { time: '23:00', value: 180 }, { time: '00:00', value: 150 },
  { time: '01:00', value: 120 }, { time: '02:00', value: 100 }, { time: '03:00', value: 80 },
  { time: '04:00', value: 75 },  { time: '05:00', value: 150 }, { time: '06:00', value: 260 },
  { time: '07:00', value: 300 }, { time: '08:00', value: 330 }, { time: '09:00', value: 340 },
  { time: '10:00', value: 350 },
];

const mockDayChartData = [
    { time: '09-03', value: 4500 }, { time: '09-04', value: 5200 }, { time: '09-05', value: 5500 },
    { time: '09-06', value: 5800 }, { time: '09-07', value: 6000 }, { time: '09-08', value: 6100 },
    { time: '09-09', value: 6050 }, { time: '09-10', value: 2500 },
];

const mockTableData = [
  { id: 1, deviceId: '30107339', workshop: '114_空调水机主机', name: '3AA6-12', energy: 710712.00, timestamp: '09-10 08:42' },
  { id: 2, deviceId: '30107339', workshop: '114_空调水机主机', name: '3AA6-12', energy: 710655.10, timestamp: '09-10 08:32' },
  { id: 3, deviceId: '30107339', workshop: '114_空调水机主机', name: '3AA6-12', energy: 710598.00, timestamp: '09-10 08:22' },
  { id: 4, deviceId: '30107339', workshop: '114_空调水机主机', name: '3AA6-12', energy: 710546.00, timestamp: '09-10 08:12' },
  { id: 5, deviceId: '30107339', workshop: '114_空调水机主机', name: '3AA6-12', energy: 710498.00, timestamp: '09-10 08:02' },
  { id: 6, deviceId: '30107339', workshop: '114_空调水机主机', name: '3AA6-12', energy: 710452.40, timestamp: '09-10 07:52' },
];

function PowerMonitorPage() {
  const [stats, setStats] = useState(mockStats);
  const [tableData, setTableData] = useState(mockTableData);
  const [currentMode, setCurrentMode] = useState('hour'); // 'hour' or 'day'
  const [isChartVisible, setIsChartVisible] = useState(true);

  const modes = [
    { name: '小时模式', value: 'hour' },
    { name: '日模式', value: 'day' },
  ];

  // Placeholder for search logic
  const handleSearch = (params) => {
    console.log('Search Params:', params, 'Mode:', currentMode);
    // Here you would typically fetch new data based on params
  };

  const toggleChartVisibility = () => {
    setIsChartVisible(!isChartVisible);
  };

  const chartData = currentMode === 'hour' ? mockHourChartData : mockDayChartData;
  const chartTitle = currentMode === 'hour' ? '每小时用电量 (kWh)' : '每日用电量 (kWh)';
  const chartYAxisLabel = currentMode === 'hour' ? '每小时用电量 (kWh)' : '每日用电量 (kWh)';

  return (
    <div className="power-monitor-page">
      <Container fluid>
        <StatisticsCards stats={stats} />
        
        <div className="section-container card-bg">
          <div className="section-header">
            <h3 className="section-title">实时监控数据</h3>
            <ButtonGroup className="mode-toggle">
              {modes.map((radio, idx) => (
                <ToggleButton
                  key={idx}
                  id={`radio-${idx}`}
                  type="radio"
                  variant={currentMode === radio.value ? 'info' : 'outline-info'}
                  name="radio"
                  value={radio.value}
                  checked={currentMode === radio.value}
                  onChange={(e) => setCurrentMode(e.currentTarget.value)}
                >
                  {radio.name}
                </ToggleButton>
              ))}
            </ButtonGroup>
          </div>
          <SearchForm 
            onSearch={handleSearch} 
            isChartVisible={isChartVisible}
            toggleChartVisibility={toggleChartVisibility}
            currentMode={currentMode}
          />
        </div>
        
        {isChartVisible && (
          <div className="section-container card-bg mt-4">
            <div className="section-header">
              <h3 className="section-title">114_空调水机主机 实时电能监控</h3>
              <span className="chart-status">{currentMode === 'hour' ? '● 实时刷新中' : '● 日模式'}</span>
            </div>
            <PowerChart data={chartData} title={chartTitle} yAxisLabel={chartYAxisLabel} />
          </div>
        )}
        
        <div className="section-container card-bg mt-4">
           <div className="section-header">
             <h3 className="section-title">数据详情</h3>
           </div>
          <DataTable data={tableData} />
        </div>
      </Container>
    </div>
  );
}

export default PowerMonitorPage;
