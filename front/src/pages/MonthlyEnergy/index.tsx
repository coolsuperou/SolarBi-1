import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { getMonthlyEnergy } from '@/services/SolarBi-front/monthlyEnergyController';
import './styles.css';

/**
 * 月度能耗统计表页面 - 完全复刻HTML版本
 */
const MonthlyEnergyPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [data, setData] = useState<any>(null);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getMonthlyEnergy({ year, month });
      if (response.code === 0) {
        setData(response.data);
        message.success('数据加载成功');
      } else {
        message.error(response.message || '加载数据失败');
      }
    } catch (error) {
      console.error('加载月度能耗数据失败:', error);
      message.error('加载数据失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 首次进入自动查询当月
  useEffect(() => {
    loadData();
  }, []);

  if (!data) {
    return (
      <div className="monthly-energy-container">
        <div className="page-title">电能监控月度数据统计表</div>
        <div style={{ textAlign: 'center', padding: '60px', color: '#00d4ff' }}>
          {loading ? '加载中...' : '暂无数据'}
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="monthly-energy-container">
      <div className="page-title">电能监控月度数据统计表</div>

      {/* 查询区域 */}
      <div className="query-section">
        <div className="query-group">
          <label className="query-label">年月</label>
          <select className="query-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>
        <div className="query-group">
          <label className="query-label">月份</label>
          <select className="query-select" value={month.toString().padStart(2, '0')} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m.toString().padStart(2, '0')}>
                {m.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
        <button className="query-button" onClick={loadData} disabled={loading}>
          {loading ? '查询中...' : '查询'}
        </button>
      </div>

      {/* 数据表格 */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th className="info-header">车间</th>
                {Array.from({ length: data.daysInMonth }, (_, i) => i + 1).map((day) => (
                  <th key={day}>{day.toString().padStart(2, '0')}日</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.workshopList.map((workshop: string) => {
                const dailyData = data.workshopDailyData[workshop] || [];
                return (
                  <tr key={workshop}>
                    <td className="info-cell">{workshop}</td>
                    {dailyData.map((value: number, index: number) => (
                      <td
                        key={index}
                        className={`data-cell ${value > 2000 ? 'highlight-value' : ''}`}
                      >
                        {value === 0 ? '-' : value.toFixed(1)}
                      </td>
                    ))}
                  </tr>
                );
              })}

              {/* 合计行 */}
              <tr className="total-row">
                <td className="info-cell">合计</td>
                {data.dailyTotal.map((value: number, index: number) => (
                  <td key={index} className="data-cell">
                    {value.toFixed(1)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};

export default MonthlyEnergyPage;
