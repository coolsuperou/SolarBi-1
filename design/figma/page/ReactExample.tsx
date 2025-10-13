/**
 * 现代化深色主题数据可视化页面 - React示例
 * 
 * 这是一个完整的示例，展示如何将dashboard.html的设计应用到React项目中
 * 可以直接复制到 front/src/pages/ 目录下使用
 */

import React, { useState, useEffect, useRef } from 'react';
import { message } from 'antd';
import * as echarts from 'echarts';
import './ModernDashboard.css';  // 样式文件

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  gradient: string[];
}

// 统计卡片组件
const StatCard: React.FC<StatCardProps> = ({ title, value, unit, icon, gradient }) => {
  return (
    <div className="modern-stat-card">
      <div className="stat-icon" style={{
        background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`
      }}>
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-title">{title}</div>
        <div className="stat-value" style={{
          background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {value} {unit && <span className="stat-unit">{unit}</span>}
        </div>
      </div>
    </div>
  );
};

// 图表组件
interface ChartProps {
  title: string;
  description?: string;
  height?: number;
}

const ModernChart: React.FC<ChartProps> = ({ title, description, height = 400 }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化图表
    chartInstance.current = echarts.init(chartRef.current);

    // 示例数据
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // 配置多条渐变曲线
    const colors = [
      ['#3b82f6', '#2563eb'],  // 蓝色
      ['#a855f7', '#9333ea'],  // 紫色
      ['#06ffa5', '#00e396'],  // 青色
      ['#f472b6', '#ec4899'],  // 粉色
    ];

    const series = colors.map((color, index) => ({
      name: `设备 ${index + 1}`,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      showSymbol: false,
      lineStyle: {
        width: 3,
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: color[0] },
            { offset: 1, color: color[1] }
          ]
        }
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: `${color[0]}40` },
            { offset: 1, color: `${color[0]}08` }
          ]
        }
      },
      data: months.map(() => (Math.random() * 100 + 50).toFixed(1))
    }));

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      grid: {
        left: '3%',
        right: '3%',
        top: '15%',
        bottom: '10%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 10, 20, 0.95)',
        borderColor: '#a855f7',
        borderWidth: 2,
        textStyle: {
          color: '#ffffff',
          fontSize: 12
        },
        axisPointer: {
          lineStyle: {
            color: '#a855f7',
            width: 2
          }
        }
      },
      legend: {
        top: '5%',
        textStyle: {
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: 12
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: months,
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: 11
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: 11,
          formatter: '{value} kW'
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.05)',
            type: 'dashed'
          }
        }
      },
      series: series
    };

    chartInstance.current.setOption(option);

    // 响应式处理
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, []);

  return (
    <div className="modern-chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">{title}</h3>
          {description && <p className="chart-description">{description}</p>}
        </div>
        <button className="chart-menu-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>
      </div>
      <div ref={chartRef} style={{ width: '100%', height: `${height}px` }}></div>
    </div>
  );
};

// 主组件
const ModernDashboardPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('3M');
  const [loading, setLoading] = useState(false);

  // 模拟数据加载
  const loadData = async () => {
    setLoading(true);
    try {
      // 调用API
      // const response = await getDataAPI();
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('数据加载成功');
    } catch (error) {
      message.error('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeRange]);

  return (
    <>
      {/* 背景装饰 */}
      <div className="modern-background-decoration"></div>
      <div className="modern-grid-background"></div>

      <div className="modern-dashboard-container">
        
        {/* 页面头部 */}
        <div className="modern-page-header">
          <h1 className="modern-page-title">电能数据监控</h1>
          
          <div className="modern-header-actions">
            {/* 时间筛选 */}
            <div className="modern-time-filters">
              {['1W', '1M', '3M', '1Y', 'ALL'].map((range) => (
                <button
                  key={range}
                  className={`modern-filter-btn ${timeRange === range ? 'active' : ''}`}
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
            
            {/* 操作按钮 */}
            <button className="modern-action-btn secondary">
              筛选
            </button>
            <button className="modern-action-btn primary">
              导出数据
            </button>
          </div>
        </div>

        {/* 统计卡片区域 */}
        <div className="modern-stats-grid">
          <StatCard
            title="总设备数"
            value={24}
            unit="台"
            icon={<span>🔌</span>}
            gradient={['#3b82f6', '#2563eb']}
          />
          <StatCard
            title="总能耗"
            value={1234.56}
            unit="kWh"
            icon={<span>⚡</span>}
            gradient={['#a855f7', '#9333ea']}
          />
          <StatCard
            title="平均温度"
            value={25.8}
            unit="°C"
            icon={<span>🌡️</span>}
            gradient={['#f472b6', '#ec4899']}
          />
          <StatCard
            title="平均湿度"
            value={65.2}
            unit="%"
            icon={<span>💧</span>}
            gradient={['#06ffa5', '#00e396']}
          />
        </div>

        {/* 主图表区域 */}
        <ModernChart
          title="能耗趋势分析"
          description="展示各设备的能耗变化趋势"
          height={500}
        />

        {/* 底部图表网格 */}
        <div className="modern-charts-grid">
          <ModernChart
            title="设备能耗分布"
            description="各设备能耗占比统计"
            height={300}
          />
          <ModernChart
            title="日能耗对比"
            description="按日统计的能耗数据"
            height={300}
          />
        </div>

      </div>
    </>
  );
};

export default ModernDashboardPage;

