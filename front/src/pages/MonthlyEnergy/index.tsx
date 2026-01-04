import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { message } from 'antd';
import { MONTHLY_ENERGY_CONFIG } from './config';
import { getMonthlyEnergy } from '@/services/SolarBi-front/monthlyEnergyController';
import './styles.css';

/**
 * 导出Excel功能 - 使用纯前端方式生成带样式的Excel
 * 通过生成Excel XML格式实现样式支持
 */
const exportToExcel = (data: any, year: number, month: number) => {
  if (!data || !data.workshopList || data.workshopList.length === 0) {
    message.warning('没有数据可导出');
    return;
  }

  try {
    // 生成Excel XML格式
    const generateExcelXML = () => {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<?mso-application progid="Excel.Sheet"?>\n';
      xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
      xml += '  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';

      // 样式定义
      xml += '<Styles>\n';
      // 默认样式
      xml += '<Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Center"/></Style>\n';
      // 标题样式 - 蓝色背景白色加粗字体
      xml += '<Style ss:ID="Title"><Font ss:Bold="1" ss:Size="16" ss:Color="#FFFFFF"/><Interior ss:Color="#4472C4" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/></Style>\n';
      // 表头样式 - 浅蓝色背景白色加粗字体
      xml += '<Style ss:ID="Header"><Font ss:Bold="1" ss:Size="11" ss:Color="#FFFFFF"/><Interior ss:Color="#5B9BD5" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>\n';
      // 车间名称样式 - 浅绿色背景
      xml += '<Style ss:ID="Workshop"><Font ss:Bold="1" ss:Size="10"/><Interior ss:Color="#E2EFDA" ss:Pattern="Solid"/><Alignment ss:Horizontal="Left" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/></Borders></Style>\n';
      // 数据单元格样式
      xml += '<Style ss:ID="Data"><Font ss:Size="10"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><NumberFormat ss:Format="#,##0.00"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/></Borders></Style>\n';
      // 合计行样式 - 橙色背景白色加粗字体
      xml += '<Style ss:ID="Total"><Font ss:Bold="1" ss:Size="11" ss:Color="#FFFFFF"/><Interior ss:Color="#ED7D31" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><NumberFormat ss:Format="#,##0.00"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>\n';
      xml += '</Styles>\n';

      // 工作表
      xml += '<Worksheet ss:Name="月度能耗统计">\n';

      // 列宽设置
      xml += '<Table>\n';
      xml += '<Column ss:Width="120"/>\n'; // 车间列
      for (let i = 0; i < data.daysInMonth; i++) {
        xml += '<Column ss:Width="55"/>\n'; // 日期列
      }
      xml += '<Column ss:Width="100"/>\n'; // 月度合计列

      // 标题行
      xml += '<Row ss:Height="30">\n';
      xml += `<Cell ss:StyleID="Title" ss:MergeAcross="${data.daysInMonth + 1}"><Data ss:Type="String">${year}年${month}月 月度能耗统计表</Data></Cell>\n`;
      xml += '</Row>\n';

      // 空行
      xml += '<Row ss:Height="15"></Row>\n';

      // 表头行
      xml += '<Row ss:Height="25">\n';
      xml += '<Cell ss:StyleID="Header"><Data ss:Type="String">车间</Data></Cell>\n';
      for (let i = 1; i <= data.daysInMonth; i++) {
        xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">${i}日</Data></Cell>\n`;
      }
      xml += '<Cell ss:StyleID="Header"><Data ss:Type="String">月度合计(kWh)</Data></Cell>\n';
      xml += '</Row>\n';

      // 数据行
      data.workshopList.forEach((workshop: string) => {
        const dailyData = data.workshopDailyData[workshop] || [];
        const monthlyTotal = data.workshopMonthlyTotal[workshop] || 0;

        xml += '<Row ss:Height="22">\n';
        xml += `<Cell ss:StyleID="Workshop"><Data ss:Type="String">${escapeXml(workshop)}</Data></Cell>\n`;
        dailyData.forEach((value: number) => {
          if (value === 0) {
            xml += '<Cell ss:StyleID="Data"><Data ss:Type="String">-</Data></Cell>\n';
          } else {
            xml += `<Cell ss:StyleID="Data"><Data ss:Type="Number">${value.toFixed(2)}</Data></Cell>\n`;
          }
        });
        xml += `<Cell ss:StyleID="Data"><Data ss:Type="Number">${monthlyTotal.toFixed(2)}</Data></Cell>\n`;
        xml += '</Row>\n';
      });

      // 合计行
      xml += '<Row ss:Height="25">\n';
      xml += '<Cell ss:StyleID="Total"><Data ss:Type="String">合计</Data></Cell>\n';
      data.dailyTotal.forEach((value: number) => {
        if (value === 0) {
          xml += '<Cell ss:StyleID="Total"><Data ss:Type="String">-</Data></Cell>\n';
        } else {
          xml += `<Cell ss:StyleID="Total"><Data ss:Type="Number">${value.toFixed(2)}</Data></Cell>\n`;
        }
      });
      xml += `<Cell ss:StyleID="Total"><Data ss:Type="Number">${data.monthlyTotal.toFixed(2)}</Data></Cell>\n`;
      xml += '</Row>\n';

      xml += '</Table>\n';
      xml += '</Worksheet>\n';
      xml += '</Workbook>';

      return xml;
    };

    // XML特殊字符转义
    const escapeXml = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const xmlContent = generateExcelXML();

    // 创建下载
    const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `月度能耗统计_${year}年${month}月.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    message.success('导出成功！');
  } catch (error) {
    console.error('导出失败:', error);
    message.error('导出失败，请重试');
  }
};

/**
 * 月度能耗统计表页面 - 完全复刻HTML版本
 * 显示每月每日的能耗数据
 */
const MonthlyEnergyPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [data, setData] = useState<any>(null);

  //  动态计算表格容器高度
  const ROW_HEIGHT_FALLBACK = 35; // 行高（px）
  const HEADER_HEIGHT = 42; // 表头高度（px）
  const FOOTER_HEIGHT = 35; // 合计行高度（px）
  const PADDING = 0; // 容器内边距

  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const [containerHeight, setContainerHeight] = useState(
    `${HEADER_HEIGHT + 2 * ROW_HEIGHT_FALLBACK + FOOTER_HEIGHT + PADDING}px`,
  );



  //  页面类名挂载：隔离全局样式，避免与其他页面冲突
  useEffect(() => {
    const root = document.getElementById('root');
    document.body.classList.add('monthly-energy-page');
    document.documentElement.classList.add('monthly-energy-page');
    root?.classList.add('monthly-energy-page');

    return () => {
      document.body.classList.remove('monthly-energy-page');
      document.documentElement.classList.remove('monthly-energy-page');
      root?.classList.remove('monthly-energy-page');
    };
  }, []);

  // 📏 测量真实行高
  useLayoutEffect(() => {
    if (!data || !data.workshopList) {
      const fallbackHeight = HEADER_HEIGHT + 2 * ROW_HEIGHT_FALLBACK + FOOTER_HEIGHT + PADDING;
      setContainerHeight(`${fallbackHeight}px`);
      return;
    }

    // 等待渲染完成后测量真实行高
    requestAnimationFrame(() => {
      const firstRow = tbodyRef.current?.querySelector('tr') as HTMLElement | null;
      const realRowHeight = firstRow?.getBoundingClientRect().height || ROW_HEIGHT_FALLBACK;
      //  精确计算：表头 + 数据行 + 合计行，滚动条不占用容器高度
      const total = HEADER_HEIGHT + data.workshopList.length * realRowHeight + FOOTER_HEIGHT + PADDING;
      const roundedTotal = Math.round(total);

      setContainerHeight(`${roundedTotal}px`);
    });
  }, [data]);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      console.log('📊 查询月度能耗:', { year, month });
      const response = await getMonthlyEnergy({ year, month });

      if (response.code === 0 && response.data) {
        setData(response.data);
        message.success('数据加载成功');
      } else {
        message.error(response.message || '加载数据失败');
        setData(null);
      }
    } catch (error) {
      console.error('❌ 加载月度能耗数据失败:', error);
      message.error('加载数据失败，请检查网络连接');
      setData(null);
    } finally {
      setLoading(false);
    }
  };



  //  首次进入自动查询当月
  useEffect(() => {
    loadData();
  }, []);

  // 获取数据单元格的颜色
  const getDataColor = (value: number) => {
    if (value > MONTHLY_ENERGY_CONFIG.DATA_THRESHOLD_2) {
      return MONTHLY_ENERGY_CONFIG.DATA_COLOR_2; // 💜 紫色
    }
    if (value > MONTHLY_ENERGY_CONFIG.DATA_THRESHOLD_1) {
      return MONTHLY_ENERGY_CONFIG.DATA_COLOR_1; // 💛 黄色
    }
    return undefined; // 默认颜色
  };

  return (
    <>
      <div className="monthly-energy-container">
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
          <button className="query-button" onClick={loadData} disabled={loading}>
            {loading ? '查询中...' : '查询'}
          </button>
          <button
            className="export-button"
            onClick={() => exportToExcel(data, year, month)}
            disabled={loading || !data}
          >
              导出Excel
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
                    {Array.from({ length: data.daysInMonth }, (_, i) => i + 1).map((day) => (
                      <th key={day}>{day.toString().padStart(2, '0')}日</th>
                    ))}
                  </tr>
                </thead>
                <tbody ref={tbodyRef}>
                  {data.workshopList.map((workshop: string) => {
                    const dailyData = data.workshopDailyData[workshop] || [];
                    return (
                      <tr key={workshop}>
                        <td className="info-cell">{workshop}</td>
                        {dailyData.map((value: number, index: number) => (
                          <td
                            key={index}
                            className="data-cell"
                            style={{ color: getDataColor(value) }}
                          >
                            {value === 0
                              ? MONTHLY_ENERGY_CONFIG.ZERO_DISPLAY
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
                    {data.dailyTotal.map((value: number, index: number) => (
                      <td key={index} className="data-cell">
                        {value === 0
                          ? MONTHLY_ENERGY_CONFIG.ZERO_DISPLAY
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

export default MonthlyEnergyPage;
