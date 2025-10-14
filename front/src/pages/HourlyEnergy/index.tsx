import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from 'react';
import { message } from 'antd';
import { HOURLY_ENERGY_CONFIG } from './config';
import { getHourlyEnergy } from '@/services/SolarBi-front/hourlyEnergyController';
import './styles.css';

/**
 * 日能耗统计表页面（小时数据）- 完全复刻HTML版本
 * 显示从7:00到次日7:00的24小时能耗数据
 */
const HourlyEnergyPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [day, setDay] = useState(currentDate.getDate());
  const [data, setData] = useState<any>(null);
  
  // 📊 动态计算表格容器高度
  const ROW_HEIGHT_FALLBACK = 35; // 预估行高（px）
  const HEADER_HEIGHT = 50; // 表头高度（px）
  const FOOTER_HEIGHT = 40; // 合计行高度（px）
  const PADDING = 6; // 容器内边距
  
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const [containerHeight, setContainerHeight] = useState(
    `${HEADER_HEIGHT + 2 * ROW_HEIGHT_FALLBACK + FOOTER_HEIGHT + PADDING}px`,
  );
  
  // 🔥 页面类名挂载：隔离全局样式，避免与其他页面冲突
  useEffect(() => {
    const root = document.getElementById('root');
    document.body.classList.add('hourly-energy-page');
    document.documentElement.classList.add('hourly-energy-page');
    root?.classList.add('hourly-energy-page');
    
    return () => {
      document.body.classList.remove('hourly-energy-page');
      document.documentElement.classList.remove('hourly-energy-page');
      root?.classList.remove('hourly-energy-page');
    };
  }, []);
  
  // 📏 测量真实行高，确保容器高度完全精确
  useLayoutEffect(() => {
    if (!data || !data.workshopList) {
      setContainerHeight(`${HEADER_HEIGHT + 2 * ROW_HEIGHT_FALLBACK + FOOTER_HEIGHT + PADDING}px`);
      return;
    }
    
    // 等待渲染完成后测量真实行高
    requestAnimationFrame(() => {
      const firstRow = tbodyRef.current?.querySelector('tr') as HTMLElement | null;
      const realRowHeight = firstRow?.getBoundingClientRect().height || ROW_HEIGHT_FALLBACK;
      const total = HEADER_HEIGHT + data.workshopList.length * realRowHeight + FOOTER_HEIGHT + PADDING;
      setContainerHeight(`${Math.round(total)}px`);
    });
  }, [data]);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      console.log('📊 查询日能耗:', { year, month, day });
      const response = await getHourlyEnergy({ year, month, day });
      
      if (response.code === 0 && response.data) {
        setData(response.data);
        message.success('数据加载成功');
      } else {
        message.error(response.message || '加载数据失败');
        setData(null);
      }
    } catch (error) {
      console.error('❌ 加载小时能耗数据失败:', error);
      message.error('加载数据失败，请检查网络连接');
      setData(null);
    } finally {
      setLoading(false);
    }
  };



  // 🔥 首次进入自动查询当天
  useEffect(() => {
    loadData();
  }, []);

  // 获取数据单元格的颜色
  const getDataColor = (value: number) => {
    if (value > HOURLY_ENERGY_CONFIG.DATA_THRESHOLD_2) {
      return HOURLY_ENERGY_CONFIG.DATA_COLOR_2; // 💜 紫色
    }
    if (value > HOURLY_ENERGY_CONFIG.DATA_THRESHOLD_1) {
      return HOURLY_ENERGY_CONFIG.DATA_COLOR_1; // 💛 黄色
    }
    return undefined; // 默认颜色
  };



  // 获取当月天数
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const allHours = [...HOURLY_ENERGY_CONFIG.HOURS, ...HOURLY_ENERGY_CONFIG.NEXT_DAY_HOURS];

  return (
    <>
      <div className="hourly-energy-container">
        {/* 查询区域 */}
        <div className="query-section">
          <div className="query-group">
            <label className="query-label">年份</label>
            <select 
              className="query-select" 
              value={year} 
              onChange={(e) => setYear(Number(e.target.value))}
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
          <div className="query-group">
            <label className="query-label">月份</label>
            <select 
              className="query-select" 
              value={month.toString().padStart(2, '0')} 
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m.toString().padStart(2, '0')}>
                  {m.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
          <div className="query-group">
            <label className="query-label">日期</label>
            <select 
              className="query-select" 
              value={day.toString().padStart(2, '0')} 
              onChange={(e) => setDay(Number(e.target.value))}
            >
              {Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d.toString().padStart(2, '0')}>
                  {d.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
          <button className="query-button" onClick={loadData} disabled={loading}>
            {loading ? '查询中...' : '查询'}
          </button>
        </div>

        {/* 数据表格 - 始终渲染容器 */}
        <div className="table-container" style={{ height: containerHeight }}>
          <div className="table-wrapper">
            {!data ? (
              // 没有数据时显示加载状态，但保持表格结构
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%', 
                color: '#00d4ff',
                fontSize: '16px'
              }}>
                {loading ? '正在加载数据...' : '暂无数据'}
              </div>
            ) : (
              // 有数据时渲染正常表格
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="info-header">车间</th>
                    {HOURLY_ENERGY_CONFIG.HOURS.map((hour, index) => (
                      <th key={index}>{hour}</th>
                    ))}
                    {HOURLY_ENERGY_CONFIG.NEXT_DAY_HOURS.map((hour, index) => (
                      <th key={`next-${index}`}>
                        {hour}
                        <br />
                        <small className="next-day-mark">次日</small>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody ref={tbodyRef}>
                  {data.workshopList.map((workshop: string) => {
                    const hourlyData = data.workshopHourlyData[workshop] || [];
                    return (
                      <tr key={workshop}>
                        <td className="info-cell">{workshop}</td>
                        {hourlyData.map((value: number, index: number) => (
                          <td
                            key={index}
                            className="data-cell"
                            style={{ color: getDataColor(value) }}
                          >
                            {value === 0 
                              ? HOURLY_ENERGY_CONFIG.ZERO_DISPLAY 
                              : value.toFixed(1)
                            }
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  {/* 合计行 */}
                  <tr className="total-row">
                    <td className="info-cell">合计</td>
                    {data.hourlyTotal.map((value: number, index: number) => (
                      <td key={index} className="data-cell">
                        {value === 0 
                          ? HOURLY_ENERGY_CONFIG.ZERO_DISPLAY 
                          : value.toFixed(1)
                        }
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HourlyEnergyPage;
