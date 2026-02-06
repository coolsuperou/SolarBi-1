import React, { useState, useEffect, useRef } from 'react';
import { message, Modal, Form, Input, InputNumber } from 'antd';
import * as echarts from 'echarts';
import { ELECTRICITY_COST_CONFIG } from './config';
import { 
  getPowerSupplyData, 
  savePowerSupplyData,
  calculateMode1, 
  calculateMode2, 
  calculateMode3 
} from '@/services/SolarBi-front/electricityCostController';
import './styles.css';

/**
 * 电费分摊计算系统页面
 * 根据供电局数据和各部门电量计算电费分摊
 */
const ElectricityCostAllocationPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [calculationMode, setCalculationMode] = useState('mode3');
  const [chartsCollapsed, setChartsCollapsed] = useState(false);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  
  // 编辑弹窗状态
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();

  // 图表引用
  const dept1ChartRef = useRef<HTMLDivElement>(null);
  const dept2ChartRef = useRef<HTMLDivElement>(null);
  const dept1ChartInstance = useRef<echarts.ECharts | null>(null);
  const dept2ChartInstance = useRef<echarts.ECharts | null>(null);

  // 供电局数据
  const [powerSupplyData, setPowerSupplyData] = useState<any>(null);

  // 部门数据
  const [departmentData, setDepartmentData] = useState<any[]>([]);

  // 页面类名挂载
  useEffect(() => {
    const root = document.getElementById('root');
    document.body.classList.add('electricity-cost-page');
    document.documentElement.classList.add('electricity-cost-page');
    root?.classList.add('electricity-cost-page');

    return () => {
      document.body.classList.remove('electricity-cost-page');
      document.documentElement.classList.remove('electricity-cost-page');
      root?.classList.remove('electricity-cost-page');
      
      // 清理图表实例
      if (dept1ChartInstance.current) {
        dept1ChartInstance.current.dispose();
        dept1ChartInstance.current = null;
      }
      if (dept2ChartInstance.current) {
        dept2ChartInstance.current.dispose();
        dept2ChartInstance.current = null;
      }
    };
  }, []);

  // 加载供电局数据
  useEffect(() => {
    loadPowerSupplyData();
  }, [year, month]);

  // 切换计算模式时清空计算结果
  useEffect(() => {
    setCalculationResult(null);
    setDepartmentData([]);
    
    // 清空图表实例,下次有数据时会重新初始化
    if (dept1ChartInstance.current) {
      dept1ChartInstance.current.dispose();
      dept1ChartInstance.current = null;
    }
    if (dept2ChartInstance.current) {
      dept2ChartInstance.current.dispose();
      dept2ChartInstance.current = null;
    }
  }, [calculationMode]);

  // 加载供电局数据
  const loadPowerSupplyData = async () => {
    try {
      const res = await getPowerSupplyData({ year, month });
      if (res.code === 0 && res.data) {
        setPowerSupplyData(res.data);
      } else {
        // 如果没有数据，设置默认值
        setPowerSupplyData(null);
      }
    } catch (error) {
      console.error('加载供电局数据失败:', error);
      setPowerSupplyData(null);
    }
  };

  // 打开编辑弹窗
  const handleOpenEditModal = () => {
    // 设置表单初始值
    editForm.setFieldsValue({
      year,
      month,
      reading1To24: powerSupplyData?.reading1To24 || 0,
      amount1To24: powerSupplyData?.amount1To24 || 0,
      reading25ToEnd: powerSupplyData?.reading25ToEnd || 0,
      amount25ToEnd: powerSupplyData?.amount25ToEnd || 0,
    });
    setEditModalVisible(true);
  };

  // 保存供电局数据
  const handleSavePowerSupplyData = async () => {
    try {
      const values = await editForm.validateFields();
      
      // 自动计算单价
      const unitPrice1To24 = values.reading1To24 > 0 
        ? (values.amount1To24 / values.reading1To24).toFixed(4) 
        : 0;
      const unitPrice25ToEnd = values.reading25ToEnd > 0 
        ? (values.amount25ToEnd / values.reading25ToEnd).toFixed(4) 
        : 0;
      
      const res = await savePowerSupplyData({
        year: values.year,
        month: values.month,
        reading1To24: values.reading1To24,
        amount1To24: values.amount1To24,
        unitPrice1To24: parseFloat(unitPrice1To24),
        reading25ToEnd: values.reading25ToEnd,
        amount25ToEnd: values.amount25ToEnd,
        unitPrice25ToEnd: parseFloat(unitPrice25ToEnd),
      });
      
      if (res.code === 0) {
        message.success('保存成功');
        setEditModalVisible(false);
        // 重新加载数据
        loadPowerSupplyData();
      } else {
        message.error(res.message || '保存失败');
      }
    } catch (error: any) {
      console.error('保存失败:', error);
      message.error(error.message || '保存失败，请重试');
    }
  };

  // 初始化图表
  useEffect(() => {
    // 只在有数据时初始化图表
    if (departmentData.length === 0) return;
    
    if (dept1ChartRef.current && !dept1ChartInstance.current) {
      dept1ChartInstance.current = echarts.init(dept1ChartRef.current);
    }
    if (dept2ChartRef.current && !dept2ChartInstance.current) {
      dept2ChartInstance.current = echarts.init(dept2ChartRef.current);
    }

    // 响应式调整
    const handleResize = () => {
      dept1ChartInstance.current?.resize();
      dept2ChartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [departmentData.length > 0]);

  // 渲染图表 - 单独的effect
  useEffect(() => {
    if (departmentData.length > 0 && dept1ChartInstance.current && dept2ChartInstance.current) {
      renderCharts();
    }
  }, [departmentData]);

  // 渲染图表
  const renderCharts = () => {
    if (!dept1ChartInstance.current || !dept2ChartInstance.current) return;

    // 计算一级部门汇总
    const dept1Summary: { [key: string]: number } = {};
    departmentData.forEach((item) => {
      if (!dept1Summary[item.dept1]) {
        dept1Summary[item.dept1] = 0;
      }
      dept1Summary[item.dept1] += item.cost;
    });

    // 一级部门饼图
    const dept1Option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: ¥{c} ({d}%)',
        backgroundColor: 'rgba(10, 25, 41, 0.9)',
        borderColor: '#00d4ff',
        borderWidth: 1,
        textStyle: { color: '#ffffff' },
      },
      legend: {
        orient: 'vertical',
        right: '10%',
        top: 'center',
        textStyle: { color: '#00d4ff', fontSize: 13 },
        itemWidth: 14,
        itemHeight: 14,
      },
      series: [
        {
          name: '一级部门电费',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 10,
            borderColor: 'rgba(10, 25, 41, 0.8)',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}\n¥{c}\n{d}%',
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 'bold',
          },
          emphasis: {
            label: { show: true, fontSize: 16, fontWeight: 'bold' },
            itemStyle: {
              shadowBlur: 15,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 212, 255, 0.6)',
            },
          },
          labelLine: {
            show: true,
            lineStyle: { color: '#00d4ff', width: 2 },
          },
          data: Object.entries(dept1Summary).map(([name, value]) => ({
            value: value,
            name: name,
            itemStyle: {
              color: (ELECTRICITY_COST_CONFIG.CHART_COLORS.DEPT1 as any)[name] || '#00d4ff',
            },
          })),
        },
      ],
    };

    // 二级部门饼图
    const dept2Option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: ¥{c} ({d}%)',
        backgroundColor: 'rgba(10, 25, 41, 0.9)',
        borderColor: '#00d4ff',
        borderWidth: 1,
        textStyle: { color: '#ffffff' },
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: '#00d4ff', fontSize: 11 },
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 8,
        width: 200,
        height: 360,
      },
      series: [
        {
          name: '二级部门电费',
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: 'rgba(10, 25, 41, 0.8)',
            borderWidth: 2,
          },
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: 13,
              fontWeight: 'bold',
              formatter: '{b}\n¥{c}\n{d}%',
              color: '#ffffff',
            },
            itemStyle: {
              shadowBlur: 15,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 212, 255, 0.6)',
            },
          },
          labelLine: { show: false },
          data: departmentData.map((item, index) => ({
            value: item.cost,
            name: item.dept2,
            itemStyle: {
              color: ELECTRICITY_COST_CONFIG.CHART_COLORS.DEPT2[index % ELECTRICITY_COST_CONFIG.CHART_COLORS.DEPT2.length],
            },
          })),
        },
      ],
    };

    dept1ChartInstance.current.setOption(dept1Option);
    dept2ChartInstance.current.setOption(dept2Option);
  };

  // 计算电费
  const handleCalculate = async () => {
    setLoading(true);
    try {
      let res;
      if (calculationMode === 'mode1') {
        res = await calculateMode1({ year, month });
      } else if (calculationMode === 'mode2') {
        res = await calculateMode2({ year, month });
      } else {
        res = await calculateMode3({ year, month });
      }

      if (res.code === 0 && res.data) {
        setCalculationResult(res.data);
        
        // 更新供电局数据
        if (res.data.powerSupplyData) {
          setPowerSupplyData(res.data.powerSupplyData);
        }
        
        // 更新部门数据
        if (res.data.departmentCostList) {
          setDepartmentData(res.data.departmentCostList);
        }
        
        message.success(`计算完成！总金额: ¥${res.data.totalCost?.toLocaleString() || 0}`);
      } else {
        message.error(res.message || '计算失败');
      }
    } catch (error: any) {
      console.error('计算失败:', error);
      message.error(error.message || '计算失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 导出Excel
  const handleExport = () => {
    const modeName = (ELECTRICITY_COST_CONFIG.MODE_NAMES as any)[calculationMode] || calculationMode;
    message.info(`导出 ${year}年${month}月 电费分摊表\n计算模式: ${modeName}`);
  };

  // 切换图表显示
  const toggleCharts = () => {
    setChartsCollapsed(!chartsCollapsed);
  };

  // 计算汇总数据
  const calculateSummary = () => {
    const summary: { [key: string]: { energy: number; cost: number } } = {};
    departmentData.forEach((item) => {
      if (!summary[item.dept1]) {
        summary[item.dept1] = { energy: 0, cost: 0 };
      }
      summary[item.dept1].energy += item.energy;
      summary[item.dept1].cost += item.cost;
    });
    return summary;
  };

  const summary = calculateSummary();

  return (
    <div className="electricity-cost-page">
      <div className="electricity-cost-container">
        {/* 查询条件 */}
        <div className="query-section">
          <div className="query-row">
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
          </div>

          <div className="query-row">
            <div className="query-group" style={{ gridColumn: '1 / -1' }}>
              <label className="query-label">计算模式</label>
              <select
                className="query-select"
                value={calculationMode}
                onChange={(e) => setCalculationMode(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="mode1">{ELECTRICITY_COST_CONFIG.MODE_DESCRIPTIONS.mode1}</option>
                <option value="mode2">{ELECTRICITY_COST_CONFIG.MODE_DESCRIPTIONS.mode2}</option>
                <option value="mode3">{ELECTRICITY_COST_CONFIG.MODE_DESCRIPTIONS.mode3}</option>
              </select>
            </div>
          </div>

          {/* 1-24日信息卡片 */}
          <div className="info-cards">
            <div className="info-card">
              <div className="info-card-title">1-24日供电局抄表数</div>
              <div className="info-card-value">
                {powerSupplyData?.reading1To24?.toLocaleString() || '0'}{' '}
                <span className="info-card-unit">kWh</span>
              </div>
            </div>
            <div className="info-card">
              <div className="info-card-title">实际总金额</div>
              <div className="info-card-value">
                {powerSupplyData?.amount1To24?.toLocaleString('zh-CN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || '0.00'}{' '}
                <span className="info-card-unit">元</span>
              </div>
            </div>
            <div className="info-card">
              <div className="info-card-title">供电局平均单价</div>
              <div className="info-card-value">
                {powerSupplyData?.reading1To24 && powerSupplyData?.amount1To24
                  ? (powerSupplyData.amount1To24 / powerSupplyData.reading1To24).toFixed(3)
                  : '0.000'}{' '}
                <span className="info-card-unit">元/kWh</span>
              </div>
            </div>
            <div className="info-card">
              <div className="info-card-title">天石源电量</div>
              <div className="info-card-value">
                {(calculationMode === 'mode1' || calculationMode === 'mode3') && calculationResult?.totalEnergy
                  ? calculationResult.totalEnergy.toLocaleString()
                  : calculationMode === 'mode2'
                  ? '-'
                  : '0'}{' '}
                <span className="info-card-unit">kWh</span>
              </div>
            </div>
            <div className="info-card">
              <div className="info-card-title">内部平均单价</div>
              <div className="info-card-value">
                {(calculationMode === 'mode1' || calculationMode === 'mode3') && calculationResult?.avgUnitPrice
                  ? calculationResult.avgUnitPrice.toFixed(3)
                  : calculationMode === 'mode2'
                  ? '-'
                  : '0.000'}{' '}
                <span className="info-card-unit">元/kWh</span>
              </div>
            </div>
          </div>

          {/* 25-月末信息卡片 */}
          <div className="info-cards">
            <div className="info-card">
              <div className="info-card-title">25-月末抄表数</div>
              <div className="info-card-value">
                {powerSupplyData?.reading25ToEnd?.toLocaleString() || '0'}{' '}
                <span className="info-card-unit">kWh</span>
              </div>
            </div>
            <div className="info-card">
              <div className="info-card-title">实际总金额</div>
              <div className="info-card-value">
                {powerSupplyData?.amount25ToEnd?.toLocaleString('zh-CN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || '0.00'}{' '}
                <span className="info-card-unit">元</span>
              </div>
            </div>
            <div className="info-card">
              <div className="info-card-title">供电局平均单价</div>
              <div className="info-card-value">
                {powerSupplyData?.reading25ToEnd && powerSupplyData?.amount25ToEnd
                  ? (powerSupplyData.amount25ToEnd / powerSupplyData.reading25ToEnd).toFixed(3)
                  : '0.000'}{' '}
                <span className="info-card-unit">元/kWh</span>
              </div>
            </div>
            <div className="info-card">
              <div className="info-card-title">天石源电量</div>
              <div className="info-card-value">
                {(calculationMode === 'mode2' || calculationMode === 'mode3') && calculationResult?.totalEnergy
                  ? calculationResult.totalEnergy.toLocaleString()
                  : calculationMode === 'mode1'
                  ? '-'
                  : '0'}{' '}
                <span className="info-card-unit">kWh</span>
              </div>
            </div>
            <div className="info-card">
              <div className="info-card-title">内部平均单价</div>
              <div className="info-card-value">
                {(calculationMode === 'mode2' || calculationMode === 'mode3') && calculationResult?.avgUnitPrice
                  ? calculationResult.avgUnitPrice.toFixed(3)
                  : calculationMode === 'mode1'
                  ? '-'
                  : '0.000'}{' '}
                <span className="info-card-unit">元/kWh</span>
              </div>
            </div>
          </div>

          <div className="query-row">
            <div className="button-group">
              <button className="query-button" onClick={handleCalculate} disabled={loading}>
                {loading ? '计算中...' : '计算电费'}
              </button>
              <button className="edit-button" onClick={handleOpenEditModal} disabled={loading}>
                编辑供电局数据
              </button>
              <button className="export-button" onClick={handleExport} disabled={loading}>
                导出Excel
              </button>
            </div>
          </div>
        </div>

        {/* 图表展示区域 */}
        <div className="chart-container">
          <div className="chart-container-header" onClick={toggleCharts}>
            <span className={`chart-container-icon ${chartsCollapsed ? 'collapsed' : ''}`}>
              ▼
            </span>
            <span className="chart-container-title">电费分布图表</span>
          </div>
          <div className={`charts-section ${chartsCollapsed ? 'collapsed' : ''} ${departmentData.length === 0 ? 'empty' : ''}`}>
            {departmentData.length > 0 ? (
              <>
                <div className="chart-item">
                  <div className="chart-title">一级部门电费分布</div>
                  <div className="chart-wrapper" ref={dept1ChartRef}></div>
                </div>
                <div className="chart-item">
                  <div className="chart-title">二级部门电费分布</div>
                  <div className="chart-wrapper" ref={dept2ChartRef}></div>
                </div>
              </>
            ) : (
              <div className="chart-empty-state">
                <div className="chart-empty-text">请点击"计算电费"按钮获取数据</div>
              </div>
            )}
          </div>
        </div>

        {/* 数据表格 */}
        <div className="table-container">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="dept1-header">一级部门</th>
                  <th className="dept2-header">二级部门</th>
                  <th>月电能值(kWh)</th>
                  <th>分配金额(元)</th>
                </tr>
              </thead>
              <tbody>
                {departmentData.length > 0 ? (
                  departmentData.map((item, index) => {
                    // 计算当前一级部门的第一行索引
                    const firstRowOfDept1 = departmentData.findIndex((d) => d.dept1 === item.dept1);
                    const isFirstRow = index === firstRowOfDept1;
                    // 计算当前一级部门的行数
                    const rowSpan = departmentData.filter((d) => d.dept1 === item.dept1).length;

                    return (
                      <tr key={index}>
                        {isFirstRow && (
                          <td className="dept1-cell" rowSpan={rowSpan}>
                            {item.dept1}
                          </td>
                        )}
                        <td className="dept2-cell">{item.dept2}</td>
                        <td className="data-cell">{item.energy?.toLocaleString() || '0'}</td>
                        <td className="data-cell cost-column">{item.cost?.toLocaleString() || '0'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#00d4ff' }}>
                      请点击"计算电费"按钮获取数据
                    </td>
                  </tr>
                )}
              </tbody>
              {departmentData.length > 0 && (
                <tfoot>
                  {Object.entries(summary).map(([dept1, data], index) => (
                    <tr key={index} className="total-row">
                      {index === 0 && (
                        <td className="dept1-cell" rowSpan={Object.keys(summary).length}>
                          合计
                        </td>
                      )}
                      <td className="dept2-cell">{dept1}</td>
                      <td className="data-cell">{data.energy.toLocaleString()}</td>
                      <td className="data-cell cost-column">{data.cost.toLocaleString()}</td>
                    </tr>
                  ))}
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* 编辑供电局数据弹窗 */}
      <Modal
        title={`编辑供电局数据 - ${year}年${month}月`}
        open={editModalVisible}
        onOk={handleSavePowerSupplyData}
        onCancel={() => setEditModalVisible(false)}
        width={600}
        okText="保存"
        cancelText="取消"
        className="edit-modal"
      >
        <Form
          form={editForm}
          layout="vertical"
          className="edit-form"
        >
          <Form.Item name="year" label="年份" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="month" label="月份" hidden>
            <Input />
          </Form.Item>
          
          <div style={{ marginBottom: 24, padding: 16, background: '#0a1929', borderRadius: 8, border: '1px solid #00d4ff' }}>
            <h3 style={{ color: '#00d4ff', marginBottom: 16 }}>1-24日数据</h3>
            <Form.Item
              name="reading1To24"
              label="供电局抄表数 (kWh)"
              rules={[{ required: true, message: '请输入抄表数' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                placeholder="请输入1-24日抄表数"
              />
            </Form.Item>
            <Form.Item
              name="amount1To24"
              label="供电局金额 (元)"
              rules={[{ required: true, message: '请输入金额' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                placeholder="请输入1-24日金额"
              />
            </Form.Item>
            <div style={{ color: '#00d4ff', fontSize: 12 }}>
              单价将自动计算: {
                editForm.getFieldValue('reading1To24') > 0
                  ? (editForm.getFieldValue('amount1To24') / editForm.getFieldValue('reading1To24')).toFixed(4)
                  : '0.0000'
              } 元/kWh
            </div>
          </div>

          <div style={{ padding: 16, background: '#0a1929', borderRadius: 8, border: '1px solid #00d4ff' }}>
            <h3 style={{ color: '#00d4ff', marginBottom: 16 }}>25-月末数据</h3>
            <Form.Item
              name="reading25ToEnd"
              label="供电局抄表数 (kWh)"
              rules={[{ required: true, message: '请输入抄表数' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                placeholder="请输入25-月末抄表数"
              />
            </Form.Item>
            <Form.Item
              name="amount25ToEnd"
              label="供电局金额 (元)"
              rules={[{ required: true, message: '请输入金额' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                placeholder="请输入25-月末金额"
              />
            </Form.Item>
            <div style={{ color: '#00d4ff', fontSize: 12 }}>
              单价将自动计算: {
                editForm.getFieldValue('reading25ToEnd') > 0
                  ? (editForm.getFieldValue('amount25ToEnd') / editForm.getFieldValue('reading25ToEnd')).toFixed(4)
                  : '0.0000'
              } 元/kWh
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ElectricityCostAllocationPage;
