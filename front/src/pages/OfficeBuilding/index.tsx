import {
  getDailyEnergyConsumptionQueryUsingGET,
  getHourlyEnergyConsumptionQueryUsingGET,
  getStatisticsUsingGET,
  getEnergyConsumptionUsingGET,
  queryByConditionUsingPOST
} from '@/services/SolarBi-front/officeBuildingController';
// 第10行后：添加import
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import DataTable from './components/DataTable';
import {getColumns} from './config/columns';
import {PageContainer} from '@ant-design/pro-components';
import '@umijs/max';
import {message} from 'antd';
import React, {useEffect, useRef, useState} from 'react';
import moment from 'moment';
import StatisticsCards from './components/StatisticsCards';
import SearchForm from './components/SearchForm';
import PowerChart from './components/PowerChart';
import DailyPowerChart from './components/DailyPowerChart';

import darkThemeStyles from '@/styles/darkTheme';
import {pageBackgroundStyles, pageStylesCSS} from '@/styles/pageStyles';
import { TIME_FORMATS } from './config/timeFormats'; // 🔥 引入时间格式配置


// 固定目标车间
const TARGET_WORKSHOP = '1#办公楼';

// 在组件内部定义响应式检测函数的占位，实际在组件内使用state


// 移除未使用的 Select 和 Typography

/**
 * 1#办公楼电能数据监控页面
 *
 * @constructor
 */
const OfficeBuildingPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const startTimeRef = useRef<any>();
  const endTimeRef = useRef<any>();
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>(TARGET_WORKSHOP);
  const [stats, setStats] = useState({
    totalDevices: 0,
    avgTemperature: 0,
    avgHumidity: 0,
    totalElectricEnergy: 0,
  });
  const [energyConsumption, setEnergyConsumption] = useState<number>(0);
  const [currentMode, setCurrentMode] = useState<string>('hour');
  const [searchParams, setSearchParams] = useState<API.TempMonitorQueryRequest>({});
  const [isDefaultTimeRange, setIsDefaultTimeRange] = useState<boolean>(true); // 跟踪是否为默认24小时05分范围
  const [tempSearchParams, setTempSearchParams] = useState<API.TempMonitorQueryRequest>({}); // 临时搜索参数，用于表格刷新

  const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // 基于state的响应式检测函数
  const isMobile = () => screenSize.width <= 768;
  const isSmallMobile = () => screenSize.width <= 480;

  const [showSearch, setShowSearch] = useState(true);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [showChart, setShowChart] = useState(true);
  const [chartOptions, setChartOptions] = useState<any>({});
  const [dailyChartOptions, setDailyChartOptions] = useState<any>({});
  const [dailyTrendData, setDailyTrendData] = useState<any[]>([]);
  const [pollingInterval, setPollingInterval] = useState(5); // 默认5秒
  const [chartRef, setChartRef] = useState<any>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [lastRequestTime, setLastRequestTime] = useState<string>('');
  const [nextUpdateTime, setNextUpdateTime] = useState<string>('');
  const [chartInstance, setChartInstance] = useState<any>(null);
  // 每个设备系列最后一次追加点的时间戳（毫秒），用于防止重复追加
  const [lastXBySeriesRef, setLastXBySeriesRef] = useState<Record<string, number>>({});
  const [axisUpdateTimer, setAxisUpdateTimer] = useState<NodeJS.Timeout | null>(null);
  // 移除手动控制，固定为自动刷新模式

  // 图表加载状态
  const [chartLoading, setChartLoading] = useState<boolean>(false);
  const [dailyChartLoading, setDailyChartLoading] = useState<boolean>(false);

  // 重构: 将所有重置和默认加载逻辑统一
  const loadDefaults = (mode: string) => {
    const now = moment();
    let startTime;
    let endTime;

    if (mode === 'hour') {
      // 小时模式：前端生成最近N小时参数（N可在配置中调整）
      endTime = `${now.format('YYYY-MM-DD HH')}${TIME_FORMATS.HOUR_END}`;
      startTime = `${now.clone().subtract(TIME_FORMATS.DEFAULT_HOUR_RANGE, 'hours').format('YYYY-MM-DD HH')}${TIME_FORMATS.HOUR_START}`;

      setTrendData([]);
      setChartOptions({});
      loadTrendData(false, startTime, endTime);
      loadEnergyConsumption(startTime, endTime);
    } else { // 'day' mode
      // 日模式：最近N天（N可在配置中调整）
      endTime = `${now.clone().add(TIME_FORMATS.DAY_END_OFFSET, 'days').format('YYYY-MM-DD')}${TIME_FORMATS.DAY_END}`;
      startTime = `${now.clone().subtract(TIME_FORMATS.DEFAULT_DAY_RANGE, 'days').format('YYYY-MM-DD')}${TIME_FORMATS.DAY_START}`;

      setDailyTrendData([]);
      setDailyChartOptions({});
      loadDailyTrendData(false, startTime, endTime);
      loadEnergyConsumption(startTime, endTime);
    }

    // 核心: 更新searchParams状态，让表单显示默认值
    setSearchParams({ startTime, endTime });

    // 🔥 重置表格搜索参数为空，让表格使用默认时间范围
    setTempSearchParams({});

    // 重置其他相关状态
    setSelectedWorkshop('');
    setEnergyConsumption(0);
    setIsDefaultTimeRange(true);
    loadStatistics(undefined, startTime, endTime);

    // 🔥 刷新表格数据（稍微延迟确保状态更新完成）
    setTimeout(() => {
      actionRef.current?.reload();
    }, 100);
  };

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 屏幕尺寸变化时重新渲染图表和表格以应用响应式样式
  useEffect(() => {
    // 延迟一点时间确保UI更新完成
    const timer = setTimeout(() => {
      // 重新渲染图表
      if (trendData.length > 0 && chartOptions.series) {
        setChartOptions((prevOptions: any) => ({
          ...prevOptions,
          // 更新Y轴标题的响应式设置
          yAxis: {
            ...(prevOptions.yAxis || {}),
            name: isMobile() ? '' : '电能消耗 (kWh)',
            nameTextStyle: {
              ...(prevOptions.yAxis?.nameTextStyle || {}),
              fontSize: isMobile() ? (isSmallMobile() ? 10 : 11) : 12,
            },
            splitNumber: isMobile() ? 4 : 6,
            axisLabel: {
              ...(prevOptions.yAxis?.axisLabel || {}),
              fontSize: isMobile() ? (isSmallMobile() ? 9 : 10) : 11,
            }
          },
          // 更新X轴的响应式设置
          xAxis: {
            ...(prevOptions.xAxis || {}),
            axisLabel: {
              ...(prevOptions.xAxis?.axisLabel || {}),
              show: true,
              fontSize: isMobile() ? (isSmallMobile() ? 9 : 10) : 11,
              rotate: isMobile() ? 45 : 0
            },
            splitNumber: prevOptions.xAxis?.splitNumber ?
              (isMobile() ? Math.min(6, prevOptions.xAxis.splitNumber as number) : prevOptions.xAxis.splitNumber) :
              (isMobile() ? 4 : 6)
          },
          // 更新图例的响应式设置
          legend: {
            ...(prevOptions.legend || {}),
            textStyle: {
              ...(prevOptions.legend?.textStyle || {}),
              fontSize: isMobile() ? (isSmallMobile() ? 10 : 11) : 12,
            }
          },
          // 更新tooltip的响应式设置
          tooltip: {
            ...(prevOptions.tooltip || {}),
            textStyle: {
              ...(prevOptions.tooltip?.textStyle || {}),
              fontSize: isMobile() ? (isSmallMobile() ? 11 : 12) : 13,
            }
          },
          // 更新grid的响应式设置
          grid: {
            ...(prevOptions.grid || {}),
            left: isMobile() ? (isSmallMobile() ? 45 : 50) : 60,
            right: isMobile() ? 8 : 10,
            top: isMobile() ? (isSmallMobile() ? 40 : 45) : 50,
            bottom: isMobile() ? (isSmallMobile() ? 50 : 55) : 60,
          }
        }));
      }

    }, 100);

    return () => clearTimeout(timer);
  }, [screenSize.width]); // 依赖屏幕宽度变化

  // 重构: 使用一个useEffect处理模式切换和初始加载
  useEffect(() => {
    loadDefaults(currentMode); // 初始加载和模式切换时，加载对应模式的默认数据
  }, [currentMode]); // 当模式改变时，此hook会重新运行

  // 加载统计数据
  const loadStatistics = async (workshop?: string, startTime?: string, endTime?: string) => {
    try {
      // 确保时间格式为 yyyy-MM-dd HH:mm:ss
      const formattedStartTime = startTime ? moment(startTime).format('YYYY-MM-DD HH:mm:ss') : undefined;
      const formattedEndTime = endTime ? moment(endTime).format('YYYY-MM-DD HH:mm:ss') : undefined;

      // 获取统计数据（包含totalElectricEnergy）
      const response = await getStatisticsUsingGET({
        workshop,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
      });

      if (response?.code === 0 && response.data) {
        setStats({
          totalDevices: response.data.totalDevices || 0,
          avgTemperature: Number((response.data.avgTemperature || 0).toFixed(1)),
          avgHumidity: Number((response.data.avgHumidity || 0).toFixed(1)),
          totalElectricEnergy: Number((response.data.totalElectricEnergy || 0).toFixed(2)),
        });
      }
    } catch (error: any) {
      console.error('获取统计数据失败：', error);
    }
  };

// 加载电能消耗数据
  const loadEnergyConsumption = async (startTime: string, endTime: string) => {
    try {
      const formattedStartTime = moment(startTime).format('YYYY-MM-DD HH:mm:ss');
      const formattedEndTime = moment(endTime).format('YYYY-MM-DD HH:mm:ss');

      const response = await getEnergyConsumptionUsingGET({
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        mode: currentMode  // 传递当前模式
      });

      if (response?.code === 0 && response.data !== undefined) {
        setEnergyConsumption(Number(response.data.toFixed(2)));
      } else {
        setEnergyConsumption(0);
      }
    } catch (error: any) {
      console.error('获取电能消耗失败：', error);
      setEnergyConsumption(0);
    }
  };
  // 处理搜索
  const handleSearch = (values: any) => {
    // 🔥 分离显示参数和查询参数

    // 显示参数：保持用户的原始选择（选择框显示用）
    const displayParams: API.TempMonitorQueryRequest = {
      ...values,
      current: 1,
      pageSize: 20,
    };

    // 查询参数：应用TIME_FORMATS配置（后端查询用）
    const queryParams: API.TempMonitorQueryRequest = {
      ...values,
      current: 1,
      pageSize: 20,
    };

    // 处理显示参数的时间格式（不加偏移）
    if (values.startTime) {
      if (currentMode === 'hour') {
        displayParams.startTime = `${moment(values.startTime).format('YYYY-MM-DD HH')}${TIME_FORMATS.HOUR_START}`;
      } else {
        displayParams.startTime = `${moment(values.startTime).format('YYYY-MM-DD')}${TIME_FORMATS.DAY_START}`;
      }
    }
    if (values.endTime) {
      if (currentMode === 'hour') {
        displayParams.endTime = `${moment(values.endTime).format('YYYY-MM-DD HH')}${TIME_FORMATS.HOUR_END}`;
      } else {
        // 日模式：显示参数不加偏移
        displayParams.endTime = `${moment(values.endTime).format('YYYY-MM-DD')}${TIME_FORMATS.DAY_END}`;
      }
    }

    // 处理查询参数的时间格式（加偏移）
    if (values.startTime) {
      if (currentMode === 'hour') {
        queryParams.startTime = `${moment(values.startTime).format('YYYY-MM-DD HH')}${TIME_FORMATS.HOUR_START}`;
      } else {
        queryParams.startTime = `${moment(values.startTime).format('YYYY-MM-DD')}${TIME_FORMATS.DAY_START}`;
      }
    }
    if (values.endTime) {
      if (currentMode === 'hour') {
        queryParams.endTime = `${moment(values.endTime).format('YYYY-MM-DD HH')}${TIME_FORMATS.HOUR_END}`;
      } else {
        // 日模式：查询参数加偏移
        queryParams.endTime = `${moment(values.endTime).clone().add(TIME_FORMATS.DAY_END_OFFSET, 'days').format('YYYY-MM-DD')}${TIME_FORMATS.DAY_END}`;
      }
    }

    // 🔥 关键修复：显示参数用于选择框显示（保持用户选择）
    setSearchParams(displayParams);
    setSelectedWorkshop(values.workshop || '');

    // 查询参数用于实际查询（带偏移）
    setTempSearchParams(queryParams);

    // 判断是否为默认时间范围：如果没有指定时间，则为默认模式
    const isDefaultMode = !queryParams.startTime || !queryParams.endTime;
    setIsDefaultTimeRange(isDefaultMode);

    // 根据时间范围加载电能消耗
    if (queryParams.startTime && queryParams.endTime) {
      // 有时间范围：加载电能消耗
      loadEnergyConsumption(queryParams.startTime, queryParams.endTime);
    } else {
      // 没有时间范围：回到默认模式
      console.log('没有时间范围，触发默认模式加载');
      loadDefaults(currentMode);
      return; // 由 loadDefaults 处理后续逻辑
    }

    // 更新统计数据
    loadStatistics(values.workshop, queryParams.startTime, queryParams.endTime);

    // 根据模式更新对应的图表数据
    if (currentMode === 'hour') {
      loadTrendData(false, queryParams.startTime, queryParams.endTime);
    } else if (currentMode === 'day') {
      loadDailyTrendData(false, queryParams.startTime, queryParams.endTime);
    }

    // 刷新表格
    actionRef.current?.reload();
  };

  // 重构: 简化重置处理函数
  const handleReset = () => {
    loadDefaults(currentMode);
    // 重置表格搜索参数
    setTempSearchParams({});
    actionRef.current?.reload();
  };

  // 重构: 简化模式切换处理函数
  const handleModeChange = (mode: string) => {
    if (mode === currentMode) return;
    setCurrentMode(mode); // 触发useEffect
    message.success(`已切换到${mode === 'hour' ? '小时' : '日'}模式`);

    // 🔥 模式切换时也刷新表格，使用新模式的默认时间范围
    setTimeout(() => {
      actionRef.current?.reload();
    }, 100); // 稍微延迟确保currentMode状态已更新
  };

  // 数据表格请求处理函数 - 与BI图表保持一致的时间范围逻辑
  const handleTableRequest = async (params: any) => {
    try {
      let requestParams = {
        ...tempSearchParams,
        current: params.current,
        pageSize: params.pageSize,
      };

      // 🔥 关键修改：确保表格查询总是有明确的时间范围（与图表逻辑完全一致）
      if (!requestParams.startTime || !requestParams.endTime) {
        // 没有搜索时间范围，使用默认时间范围（与loadDefaults函数一致）
        const now = moment();

        if (currentMode === 'hour') {
          // 小时模式：最近N小时，格式与图表一致
          requestParams.endTime = `${now.format('YYYY-MM-DD HH')}${TIME_FORMATS.HOUR_END}`;
          requestParams.startTime = `${now.clone().subtract(TIME_FORMATS.DEFAULT_HOUR_RANGE, 'hours').format('YYYY-MM-DD HH')}${TIME_FORMATS.HOUR_START}`;
        } else {
          // 日模式：最近N天，格式与图表一致
          requestParams.endTime = `${now.clone().add(TIME_FORMATS.DAY_END_OFFSET, 'days').format('YYYY-MM-DD')}${TIME_FORMATS.DAY_END}`;
          requestParams.startTime = `${now.clone().subtract(TIME_FORMATS.DEFAULT_DAY_RANGE, 'days').format('YYYY-MM-DD')}${TIME_FORMATS.DAY_START}`;
        }

        console.log('📊 表格查询使用默认时间范围（与图表一致）:', {
          mode: currentMode,
          startTime: requestParams.startTime,
          endTime: requestParams.endTime
        });
      } else {
        // 有搜索时间范围，直接使用已格式化的时间（遵循TIME_FORMATS配置）
        // 🔥 不再重新格式化，保持TIME_FORMATS配置的完整性

        console.log('🔍 表格查询使用搜索时间范围:', {
          startTime: requestParams.startTime,
          endTime: requestParams.endTime,
          deviceId: requestParams.deviceId,
          name: requestParams.name
        });
      }

      const response = await queryByConditionUsingPOST(requestParams);

      if (response?.code === 0 && response.data) {
        const totalRecords = response.data.total || 0;
        const currentRecords = response.data.records?.length || 0;

        console.log(`📋 表格查询结果: 当前页 ${currentRecords} 条，总计 ${totalRecords} 条`);

        return {
          data: response.data.records || [],
          success: true,
          total: totalRecords,
        };
      }

      console.warn('表格查询失败:', response?.message);
      return { data: [], success: false, total: 0 };
    } catch (error: any) {
      console.error('表格查询异常:', error);
      message.error('获取数据失败：' + error.message);
      return { data: [], success: false, total: 0 };
    }
  };


  // 加载每日电能消耗数据 - 显示日用电量差值（结束日期以后最近记录 - 开始日期以后最近记录）
  const loadDailyTrendData = async (isRealtime = false, startTime?: string, endTime?: string) => {
    // 设置加载状态
    setDailyChartLoading(true);
    try {
      const requestStartTime = moment().format('HH:mm:ss');
      setLastRequestTime(requestStartTime);

      const targetWorkshop = TARGET_WORKSHOP;

      // 构建请求参数
      const rawStartTime = startTime || searchParams.startTime || undefined;
      const rawEndTime = endTime || searchParams.endTime || undefined;

      const requestParams: any = {
        workshop: targetWorkshop,
        deviceId: undefined,
        startTime: rawStartTime,  // 🔥 直接使用已格式化的时间（遵循TIME_FORMATS配置）
        endTime: rawEndTime,      // 🔥 直接使用已格式化的时间（遵循TIME_FORMATS配置）
      };

      console.log('请求每日电能消耗数据参数:', requestParams);

      // 日模式只使用查询模式API
      console.log('🟡 调用日模式查询API - /electric-energy-daily-consumption-query');
      const response = await getDailyEnergyConsumptionQueryUsingGET(requestParams);

      if (response?.code === 0 && response.data) {
        console.log('获取到每日电能消耗数据:', response.data);
        console.log('数据点数量:', response.data.length);
        console.log('时间范围:', response.data.length > 0 ? {
          first: response.data[0].day,
          last: response.data[response.data.length - 1].day
        } : '无数据');

        // 按设备分组数据
        const deviceGroups: { [key: string]: any[] } = {};

        response.data.forEach((item: API.DailyEnergyConsumption, index: number) => {
          const deviceName = `1#办公楼 `;
          if (!deviceGroups[deviceName]) {
            deviceGroups[deviceName] = [];
          }

          // 将数据点直接对应x轴刻度（例如某天的数据显示在当天00:00）
          const dayTime = new Date(item.day || '').getTime();

          const dataPoint = {
            x: dayTime, // 直接使用日期的时间戳，对应x轴刻度
            y: Number(item.energyConsumption) || 0, // 每日用电量：结束日期以后最近记录 - 开始日期以后最近记录
            time: moment(item.day).format('MM-DD'),
            device: deviceName,
            originalDay: item.day,
            originalEnergyConsumption: item.energyConsumption,
            startEnergy: item.startEnergy, // 日期开始以后最近记录的度数
            endEnergy: item.endEnergy,     // 日期结束以后最近记录的度数
            isRealData: true
          };

          deviceGroups[deviceName].push(dataPoint);
        });

        // 转换为图表系列数据
        const series = Object.keys(deviceGroups).map((deviceName, index) => {
          const colors = ['#40a9ff', '#73d13d', '#faad14', '#ff7a45', '#b37feb', '#36cfc9', '#f759ab', '#ffc53d'];
          const sortedData = deviceGroups[deviceName].sort((a, b) => a.x - b.x);

          // 为了确保线条完整连接，在数据序列的开始和结束处添加延伸点
          if (sortedData.length > 0) {
            const firstPoint = sortedData[0];
            const lastPoint = sortedData[sortedData.length - 1];

            // 在第一个数据点前添加一个延伸点（时间往前1天，值保持一样）
            const extendedStartPoint = {
              ...firstPoint,
              x: firstPoint.x - (24 * 60 * 60 * 1000), // 往前1天
              time: moment(firstPoint.x - (24 * 60 * 60 * 1000)).format('MM-DD'),
              isExtendedPoint: true // 标记为延伸点
            };

            // 将延伸点添加到数据序列中（仅保留开始侧延伸点）
            sortedData.unshift(extendedStartPoint);
          }

          return {
            name: deviceName,
            data: sortedData,
            color: colors[index % colors.length]
          };
        });

        // 计算X轴和Y轴范围
        let maxTime = -Infinity;
        let minTime = Infinity;
        let minValue = Infinity, maxValue = -Infinity;

        series.forEach((s: any) => {
          s.data.forEach((point: any) => {
            maxTime = Math.max(maxTime, point.x);
            minTime = Math.min(minTime, point.x);
            minValue = Math.min(minValue, point.y);
            maxValue = Math.max(maxValue, point.y);
          });
        });

        // 设置轴范围
        let adjustedMaxTime, adjustedMinTime, adjustedMinValue, adjustedMaxValue;

        if (isFinite(maxTime) && isFinite(minTime)) {
          // 如果有搜索时间范围，优先使用搜索范围
          if (startTime && endTime) {
            adjustedMinTime = moment(startTime).valueOf();
            adjustedMaxTime = moment(endTime).subtract(1, 'day').valueOf();
          } else {
            // 默认模式：使用配置的天数范围
            const now = moment();
            adjustedMinTime = now.clone().subtract(TIME_FORMATS.DEFAULT_DAY_RANGE, 'days').valueOf();
            adjustedMaxTime = now.clone().add(1, 'days').valueOf();
          }
        } else {
          const now = moment();
          adjustedMaxTime = now.clone().add(1, 'days').valueOf();
          adjustedMinTime = now.clone().subtract(TIME_FORMATS.DEFAULT_DAY_RANGE, 'days').valueOf();
        }

        if (isFinite(minValue) && isFinite(maxValue)) {
          const valueSpan = maxValue - minValue;
          if (valueSpan < 1) {
            const center = (minValue + maxValue) / 2;
            adjustedMinValue = Math.max(0, center - 5);
            adjustedMaxValue = center + 5;
          } else {
            const valueMargin = valueSpan * 0.1;
            adjustedMinValue = Math.max(0, minValue - valueMargin);
            adjustedMaxValue = maxValue + valueMargin;
          }
        } else {
          adjustedMinValue = 0;
          adjustedMaxValue = undefined;
        }

        // 构建 ECharts 配置
        const echartsSeries = series.map((s: any, index: number) => {
          const techColors = [
            '#00d4ff', '#00ff88', '#ff6b35', '#ff3d71',
            '#a855f7', '#06ffa5', '#ff1744', '#00e5ff'
          ];
          const seriesColor = techColors[index % techColors.length];

          const processedData = (s.data || [])
            .sort((a:any,b:any)=>a.x-b.x)
            .filter((p: any) => p.x && p.y !== null && p.y !== undefined) // 过滤掉无效数据
            .map((p: any) => ({
              value: [p.x, p.y],
              symbol: p.isExtendedPoint ? 'none' : 'circle', // 延伸点不显示符号
              symbolSize: p.isExtendedPoint ? 0 : (isMobile() ? (isSmallMobile() ? 4 : 5) : 6),
              itemStyle: p.isExtendedPoint ? undefined : {
                color: seriesColor,
                borderColor: '#ffffff',
                borderWidth: 1,
                shadowColor: seriesColor,
                shadowBlur: 8
              }
            }));

          return {
            name: s.name,
            type: 'line',
            smooth: true,
            showSymbol: true,
            connectNulls: true, // 强制连接所有数据点，包括延伸点
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: `${seriesColor}40` },
                  { offset: 1, color: `${seriesColor}08` }
                ]
              }
            },
            lineStyle: {
              width: 3,
              color: seriesColor,
              shadowColor: seriesColor,
              shadowBlur: 10,
              shadowOffsetY: 2
            },
            step: false, // 确保使用直线连接，不使用阶梯线
            sampling: 'none', // 不进行采样，保留所有数据点包括延伸点
            emphasis: {
              lineStyle: {
                width: 4,
                shadowBlur: 15
              }
            },
            data: processedData,
            color: seriesColor
          };
        });

        const options = {
          backgroundColor: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#0a1929' },
              { offset: 0.5, color: '#1a237e' },
              { offset: 1, color: '#000051' }
            ]
          },
          title: {
            text: '',
            textStyle: { color: '#00d4ff' }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: { show: false },
              lineStyle: {
                color: '#00d4ff',
                width: 2,
                shadowColor: '#00d4ff',
                shadowBlur: 8
              }
            },
            backgroundColor: 'rgba(10, 25, 41, 0.95)',
            borderColor: '#00d4ff',
            borderWidth: 2,
            textStyle: {
              color: '#ffffff',
              fontSize: isMobile() ? (isSmallMobile() ? 11 : 12) : 13,
              fontWeight: 'bold'
            },
            extraCssText: 'box-shadow: 0 0 20px rgba(0, 212, 255, 0.4); border-radius: 8px;',
            formatter: (params: any[]) => {
              if (!params || params.length === 0) return '';

              const firstParam = params[0];
              if (!firstParam || !firstParam.value || !Array.isArray(firstParam.value) || firstParam.value.length < 2) {
                return '';
              }

              const datetime = moment(firstParam.value[0]);
              const date = datetime.format('YYYY-MM-DD');

              const lines = params
                .filter(p => p && p.value && Array.isArray(p.value) && p.value.length >= 2)
                .map(p => `<span style="color:${p.color}">●</span> ${p.seriesName}: <span style="color:#00d4ff; font-weight:bold">${Number(p.value[1]).toFixed(2)} kWh</span>`);

              const headerFontSize = isMobile() ? (isSmallMobile() ? '12px' : '13px') : '14px';
              return `<div style="color:#fff; text-align:center;">
                        <div style="color:#00d4ff; font-size:${headerFontSize}; font-weight:bold; margin-bottom:6px;">${date} 日用电量</div>
                        ${lines.join('<br/>')}
                      </div>`;
            }
          },
          legend: {
            top: 5,
            textStyle: {
              color: '#00d4ff',
              fontSize: isMobile() ? (isSmallMobile() ? 10 : 11) : 12,
              fontWeight: 'bold'
            }
          },
          grid: {
            left: isMobile() ? (isSmallMobile() ? 45 : 50) : 60,
            right: isMobile() ? 8 : 10,
            top: isMobile() ? (isSmallMobile() ? 40 : 45) : 50,
            bottom: isMobile() ? (isSmallMobile() ? 50 : 55) : 60,
            borderColor: 'rgba(0, 212, 255, 0.2)',
            show: true,
            backgroundColor: 'rgba(0, 212, 255, 0.03)'
          },
          xAxis: {
            type: 'time',
            min: adjustedMinTime,
            max: adjustedMaxTime,
            boundaryGap: [0, 0],
            minInterval: 24 * 3600 * 1000, // 最小间隔1天
            maxInterval: 7 * 24 * 3600 * 1000, // 最大间隔7天
            axisLabel: {
              show: true,
              formatter: (value: number) => moment(value).format('MM-DD'),
              interval: 0,
              showMinLabel: true,
              showMaxLabel: true,
              color: '#00d4ff',
              fontSize: isMobile() ? (isSmallMobile() ? 9 : 10) : 11,
              fontWeight: 'bold',
              rotate: isMobile() ? 45 : 0
            },
            splitNumber: startTime && endTime ?
              Math.max(3, Math.ceil((moment(endTime).valueOf() - moment(startTime).valueOf()) / (1000 * 60 * 60 * 24))) : // 按天数计算
              7, // 默认7天
            axisLine: {
              lineStyle: {
                color: '#00d4ff',
                width: 2,
                shadowColor: '#00d4ff',
                shadowBlur: 4
              }
            },
            axisTick: {
              lineStyle: {
                color: '#00d4ff',
                width: 2
              }
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(0, 212, 255, 0.15)',
                width: 1,
                type: 'dashed'
              }
            }
          },
          yAxis: {
            type: 'value',
            name: isMobile() ? '' : '每日用电量 (kWh)',
            nameTextStyle: {
              color: '#00d4ff',
              fontSize: isMobile() ? (isSmallMobile() ? 10 : 11) : 12,
              fontWeight: 'bold'
            },
            min: adjustedMinValue,
            max: adjustedMaxValue,
            splitNumber: isMobile() ? 4 : 6,
            scale: false,
            axisLabel: {
              formatter: (val: number) => {
                if (val >= 1000) {
                  return `${(val / 1000).toFixed(1)}k`;
                } else if (val >= 1) {
                  return `${val.toFixed(1)}`;
                } else {
                  return `${val.toFixed(2)}`;
                }
              },
              color: '#00d4ff',
              fontSize: isMobile() ? (isSmallMobile() ? 9 : 10) : 11,
              fontWeight: 'bold'
            },
            axisLine: {
              lineStyle: {
                color: '#00d4ff',
                width: 2,
                shadowColor: '#00d4ff',
                shadowBlur: 4
              }
            },
            axisTick: {
              lineStyle: {
                color: '#00d4ff',
                width: 2
              }
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(0, 212, 255, 0.15)',
                width: 1,
                type: 'dashed'
              }
            }
          },
          series: echartsSeries
        } as any;

        setDailyChartOptions(options);
        setDailyTrendData(series);

        // 调试信息：输出图表数据
        console.log('日模式图表系列数据:', series);
        series.forEach((s, index) => {
          console.log(`设备 ${s.name} 数据点:`, s.data.map(p => ({
            time: moment(p.x).format('MM-DD'),
            value: p.y,
            isExtended: p.isExtendedPoint || false
          })));
        });

        // 更新时间显示
        setLastUpdateTime(moment().format('HH:mm:ss'));

        if (series.length === 0) {
          if (!isRealtime) {
            message.warning('查询时间范围内没有有效的每日电能消耗数据，请调整时间范围或检查数据源');
          }
        } else {
          const totalDataPoints = series.reduce((sum, s) => sum + s.data.length, 0);
          console.log(`成功加载 ${totalDataPoints} 个每日电能消耗数据点`);
        }
      } else {
        message.error(response?.message || '获取每日电能消耗数据失败');
      }
    } catch (error: any) {
      console.error('获取每日电能消耗数据失败：', error);
      message.error('获取每日电能消耗数据失败：' + error.message);
    } finally {
      // 无论成功还是失败都要取消加载状态
      setDailyChartLoading(false);
    }
  };

  // 加载每小时电能消耗数据 - 显示小时用电量差值（结束时间以后最近记录 - 开始时间以后最近记录）
  const loadTrendData = async (isRealtime = false, startTime?: string, endTime?: string) => {
    // 设置加载状态
    setChartLoading(true);
    try {
      const requestStartTime = moment().format('HH:mm:ss');
      setLastRequestTime(requestStartTime);

      const targetWorkshop = TARGET_WORKSHOP;

      // 构建请求参数
      const rawStartTime = startTime || searchParams.startTime || undefined;
      const rawEndTime = endTime || searchParams.endTime || undefined;

      const requestParams: any = {
        workshop: targetWorkshop,
        deviceId: undefined,
        startTime: rawStartTime,  // 🔥 直接使用已格式化的时间（遵循TIME_FORMATS配置）
        endTime: rawEndTime,      // 🔥 直接使用已格式化的时间（遵循TIME_FORMATS配置）
      };

      console.log('请求每小时电能消耗数据参数:', requestParams);
      console.log('是否为默认时间范围:', isDefaultTimeRange);
      console.log('当前searchParams:', searchParams);
      console.log('传入的startTime:', startTime);
      console.log('传入的endTime:', endTime);

      // 统一使用查询模式接口
      console.log('🔵 调用查询模式API - /electric-energy-hourly-consumption-query');
      const response = await getHourlyEnergyConsumptionQueryUsingGET(requestParams);

      if (response?.code === 0 && response.data) {
        console.log('获取到每小时电能消耗数据（查询模式）:', response.data);
        console.log('数据点数量:', response.data.length);
        console.log('时间范围:', response.data.length > 0 ? {
          first: response.data[0].hour,
          last: response.data[response.data.length - 1].hour
        } : '无数据');

        // 按设备分组数据
        const deviceGroups: { [key: string]: any[] } = {};

        response.data.forEach((item: API.HourlyEnergyConsumption, index: number) => {
          const deviceName = `1#办公楼 `;
          if (!deviceGroups[deviceName]) {
            deviceGroups[deviceName] = [];
          }

          // 将数据点显示在小时中间（例如8:00-9:00的数据显示在8:30）
          const hourTime = new Date(item.hour || '').getTime();
          const middleOfHour = hourTime + (30 * 60 * 1000); // 加30分钟

                      const dataPoint = {
            x: middleOfHour,
            y: Number(item.energyConsumption) || 0, // 每小时用电量：结束时间以后最近记录 - 开始时间以后最近记录
            time: moment(item.hour).format('MM-DD HH:00'),
              device: deviceName,
            originalHour: item.hour,
            originalEnergyConsumption: item.energyConsumption,
            startEnergy: item.startEnergy, // 8:00以后最近记录的度数
            endEnergy: item.endEnergy,     // 9:00以后最近记录的度数
            isRealData: true
            };

          deviceGroups[deviceName].push(dataPoint);
        });

        // 转换为图表系列数据
        const series = Object.keys(deviceGroups).map((deviceName, index) => {
          const colors = ['#40a9ff', '#73d13d', '#faad14', '#ff7a45', '#b37feb', '#36cfc9', '#f759ab', '#ffc53d'];
          const sortedData = deviceGroups[deviceName].sort((a, b) => a.x - b.x);

          // 为了确保线条完整连接，在数据序列的开始和结束处添加延伸点
          if (sortedData.length > 0) {
            const firstPoint = sortedData[0];
            const lastPoint = sortedData[sortedData.length - 1];

            // 在第一个数据点前添加一个延伸点（时间往前1小时，值保持一样）
            const extendedStartPoint = {
              ...firstPoint,
              x: firstPoint.x - (60 * 60 * 1000), // 往前1小时
              time: moment(firstPoint.x - (60 * 60 * 1000)).format('MM-DD HH:00'),
              isExtendedPoint: true // 标记为延伸点
            };

            // 在最后一个数据点后添加一个延伸点（时间往后1小时，值保持一样）
            const extendedEndPoint = {
              ...lastPoint,
              x: lastPoint.x + (60 * 60 * 1000), // 往后1小时
              time: moment(lastPoint.x + (60 * 60 * 1000)).format('MM-DD HH:00'),
              isExtendedPoint: true // 标记为延伸点
            };

            // 将延伸点添加到数据序列中
            sortedData.unshift(extendedStartPoint);
            sortedData.push(extendedEndPoint);
          }

          return {
            name: deviceName,
            data: sortedData,
            color: colors[index % colors.length]
          };
        });

        // 计算X轴和Y轴范围
        let maxTime = -Infinity;
        let minTime = Infinity;
        let minValue = Infinity, maxValue = -Infinity;

        series.forEach((s: any) => {
          s.data.forEach((point: any) => {
            maxTime = Math.max(maxTime, point.x);
            minTime = Math.min(minTime, point.x);
            minValue = Math.min(minValue, point.y);
            maxValue = Math.max(maxValue, point.y);
          });
        });

        // 设置轴范围
        let adjustedMaxTime, adjustedMinTime, adjustedMinValue, adjustedMaxValue;

        if (isFinite(maxTime) && isFinite(minTime)) {
          // 由于数据点现在显示在小时中间，需要特殊处理时间范围
          // 如果有搜索时间范围，优先使用搜索范围
          if (startTime && endTime) {
            adjustedMinTime = moment(startTime).valueOf();
            adjustedMaxTime = moment(endTime).valueOf();
          } else {
            // 默认模式：使用配置的小时范围，确保实时更新时图表不会缩小
            const now = moment();
            // 固定显示过去N小时到当前时间后2小时的范围
            adjustedMinTime = now.clone().subtract(TIME_FORMATS.DEFAULT_HOUR_RANGE, 'hours').valueOf();
            adjustedMaxTime = now.clone().add(2, 'hours').valueOf();
          }
        } else {
          const now = moment();
          adjustedMaxTime = now.clone().add(2, 'hours').valueOf();
          adjustedMinTime = now.clone().subtract(TIME_FORMATS.DEFAULT_HOUR_RANGE, 'hours').valueOf();
        }

        if (isFinite(minValue) && isFinite(maxValue)) {
          const valueSpan = maxValue - minValue;
          if (valueSpan < 1) {
            const center = (minValue + maxValue) / 2;
            adjustedMinValue = Math.max(0, center - 5);
            adjustedMaxValue = center + 5;
          } else {
            const valueMargin = valueSpan * 0.1;
            adjustedMinValue = Math.max(0, minValue - valueMargin);
            adjustedMaxValue = maxValue + valueMargin;
          }
        } else {
          adjustedMinValue = 0;
          adjustedMaxValue = undefined;
        }

        // 构建 ECharts 配置
        const echartsSeries = series.map((s: any, index: number) => {
          const techColors = [
            '#00d4ff', '#00ff88', '#ff6b35', '#ff3d71',
            '#a855f7', '#06ffa5', '#ff1744', '#00e5ff'
          ];
          const seriesColor = techColors[index % techColors.length];

          const processedData = (s.data || [])
            .sort((a:any,b:any)=>a.x-b.x)
            .filter((p: any) => p.x && p.y !== null && p.y !== undefined) // 过滤掉无效数据
            .map((p: any) => ({
              value: [p.x, p.y],
              symbol: p.isExtendedPoint ? 'none' : 'circle', // 延伸点不显示符号
              symbolSize: p.isExtendedPoint ? 0 : (isMobile() ? (isSmallMobile() ? 4 : 5) : 6),
              itemStyle: p.isExtendedPoint ? undefined : {
                color: seriesColor,
                borderColor: '#ffffff',
                borderWidth: 1,
                shadowColor: seriesColor,
                shadowBlur: 8
              }
            }));

          return {
            name: s.name,
            type: 'line',
            smooth: true,
            showSymbol: true,
            connectNulls: true, // 强制连接所有数据点，即使中间有缺失
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: `${seriesColor}40` },
                  { offset: 1, color: `${seriesColor}08` }
                ]
              }
            },
            lineStyle: {
              width: 3,
              color: seriesColor,
              shadowColor: seriesColor,
              shadowBlur: 10,
              shadowOffsetY: 2
            },
            step: false, // 确保使用直线连接，不使用阶梯线
            sampling: 'none', // 不进行采样，保留所有数据点
            emphasis: {
              lineStyle: {
                width: 4,
                shadowBlur: 15
              }
            },
            data: processedData,
            color: seriesColor
          };
        });

        const options = {
          backgroundColor: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#0a1929' },
              { offset: 0.5, color: '#1a237e' },
              { offset: 1, color: '#000051' }
            ]
          },
          title: {
            text: '',
            textStyle: { color: '#00d4ff' }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: { show: false },
              lineStyle: {
                color: '#00d4ff',
                width: 2,
                shadowColor: '#00d4ff',
                shadowBlur: 8
              }
            },
            backgroundColor: 'rgba(10, 25, 41, 0.95)',
            borderColor: '#00d4ff',
            borderWidth: 2,
            textStyle: {
              color: '#ffffff',
              fontSize: isMobile() ? (isSmallMobile() ? 11 : 12) : 13,
              fontWeight: 'bold'
            },
            extraCssText: 'box-shadow: 0 0 20px rgba(0, 212, 255, 0.4); border-radius: 8px;',
            formatter: (params: any[]) => {
              if (!params || params.length === 0) return '';

              const firstParam = params[0];
              if (!firstParam || !firstParam.value || !Array.isArray(firstParam.value) || firstParam.value.length < 2) {
                return '';
              }

              // 数据点在小时中间，需要计算对应的小时区间
              const datetime = moment(firstParam.value[0]);
              const startHour = datetime.clone().subtract(30, 'minutes'); // 减去30分钟得到开始时间
              const endHour = datetime.clone().add(30, 'minutes'); // 加上30分钟得到结束时间

              const date = startHour.format('YYYY-MM-DD');
              const timeRange = `${startHour.format('HH:00')}-${endHour.format('HH:00')}`;

              const lines = params
                .filter(p => p && p.value && Array.isArray(p.value) && p.value.length >= 2)
                .map(p => `<span style="color:${p.color}">●</span> ${p.seriesName}: <span style="color:#00d4ff; font-weight:bold">${Number(p.value[1]).toFixed(2)} kWh</span>`);

              const headerFontSize = isMobile() ? (isSmallMobile() ? '12px' : '13px') : '14px';
              return `<div style="color:#fff; text-align:center;">
                        <div style="color:#00d4ff; font-size:${headerFontSize}; font-weight:bold; margin-bottom:4px;">${date}</div>
                        <div style="color:#00d4ff; font-size:${headerFontSize}; font-weight:bold; margin-bottom:6px;">${timeRange} 用电量</div>
                        ${lines.join('<br/>')}
                      </div>`;
            }
          },
          legend: {
            top: 5,
            textStyle: {
              color: '#00d4ff',
              fontSize: isMobile() ? (isSmallMobile() ? 10 : 11) : 12,
              fontWeight: 'bold'
            }
          },
          grid: {
            left: isMobile() ? (isSmallMobile() ? 45 : 50) : 60,
            right: isMobile() ? 8 : 10,
            top: isMobile() ? (isSmallMobile() ? 40 : 45) : 50,
            bottom: isMobile() ? (isSmallMobile() ? 50 : 55) : 60,
            borderColor: 'rgba(0, 212, 255, 0.2)',
            show: true,
            backgroundColor: 'rgba(0, 212, 255, 0.03)'
          },
          xAxis: {
            type: 'time',
            min: startTime && endTime ? moment(startTime).valueOf() : adjustedMinTime,
            max: startTime && endTime ? moment(endTime).valueOf() : adjustedMaxTime,
            boundaryGap: [0, 0], // 不留边距，让线条延伸到图表边缘
            minInterval: 3600 * 1000, // 最小间隔1小时
            maxInterval: 24 * 3600 * 1000, // 最大间隔24小时
            axisLabel: {
              show: true,
              formatter: (value: number) => moment(value).format('HH:00'),
              interval: 0, // 强制显示所有小时标签
              showMinLabel: true,
              showMaxLabel: true,
              color: '#00d4ff',
              fontSize: isMobile() ? (isSmallMobile() ? 9 : 10) : 11,
              fontWeight: 'bold',
              rotate: isMobile() ? 45 : 0
            },
            splitNumber: startTime && endTime ?
              Math.max(3, Math.ceil((moment(endTime).valueOf() - moment(startTime).valueOf()) / (1000 * 60 * 60))) : // 按小时数计算
              24, // 默认24小时
            axisLine: {
              lineStyle: {
                color: '#00d4ff',
                width: 2,
                shadowColor: '#00d4ff',
                shadowBlur: 4
              }
            },
            axisTick: {
              lineStyle: {
                color: '#00d4ff',
                width: 2
              }
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(0, 212, 255, 0.15)',
                width: 1,
                type: 'dashed'
              }
            }
          },
          yAxis: {
            type: 'value',
            name: isMobile() ? '' : '每小时用电量 (kWh)',
            nameTextStyle: {
              color: '#00d4ff',
              fontSize: isMobile() ? (isSmallMobile() ? 10 : 11) : 12,
              fontWeight: 'bold'
            },
            min: adjustedMinValue,
            max: adjustedMaxValue,
            splitNumber: isMobile() ? 4 : 6,
            scale: false,
            axisLabel: {
              formatter: (val: number) => {
                if (val >= 1000) {
                  return `${(val / 1000).toFixed(1)}k`;
                } else if (val >= 1) {
                  return `${val.toFixed(1)}`;
                } else {
                  return `${val.toFixed(2)}`;
                }
              },
              color: '#00d4ff',
              fontSize: isMobile() ? (isSmallMobile() ? 9 : 10) : 11,
              fontWeight: 'bold'
            },
            axisLine: {
              lineStyle: {
                color: '#00d4ff',
                width: 2,
                shadowColor: '#00d4ff',
                shadowBlur: 4
              }
            },
            axisTick: {
              lineStyle: {
                color: '#00d4ff',
                width: 2
              }
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(0, 212, 255, 0.15)',
                width: 1,
                type: 'dashed'
              }
            }
          },
          series: echartsSeries
        } as any;

        setChartOptions(options);
        setTrendData(series);

        // 调试信息：输出图表数据
        console.log('图表系列数据:', series);
        series.forEach((s, index) => {
          console.log(`设备 ${s.name} 数据点:`, s.data.map(p => ({
            time: moment(p.x).format('MM-DD HH:mm'),
            value: p.y,
            isExtended: p.isExtendedPoint || false
          })));
        });

        // 更新时间显示
          setLastUpdateTime(moment().format('HH:mm:ss'));

        if (series.length === 0) {
          if (!isRealtime) {
            message.warning('查询时间范围内没有有效的每小时电能消耗数据，请调整时间范围或检查数据源');
          }
        } else {
          const totalDataPoints = series.reduce((sum, s) => sum + s.data.length, 0);
          console.log(`成功加载 ${totalDataPoints} 个每小时电能消耗数据点`);
        }
      } else {
        message.error(response?.message || '获取每小时电能消耗数据失败');
      }
    } catch (error: any) {
      console.error('获取每小时电能消耗数据失败：', error);
      message.error('获取每小时电能消耗数据失败：' + error.message);
    } finally {
      // 无论成功还是失败都要取消加载状态
      setChartLoading(false);
    }
  };

  // 已删除实时更新逻辑，统一使用查询模式



  /**
   * 表格列定义 - 响应式配置
   */
  // 根据屏幕尺寸决定显示的列（抽离到 config/columns）




  return (
    <div style={darkThemeStyles.pageContainer}>
      {/* 背景装饰效果 */}
      <div style={pageBackgroundStyles.backgroundDecoration}></div>

      {/* 网格背景效果 */}
      <div style={pageBackgroundStyles.gridBackground}></div>

      <style dangerouslySetInnerHTML={{ __html: pageStylesCSS }} />
    <PageContainer
      header={{
          title: (<span style={darkThemeStyles.title}>1#办公楼电能数据监控</span>),
        breadcrumb: {},
      }}
        style={{ background: 'transparent' }}
    >
      {/* 统计卡片 */}
      <StatisticsCards energyConsumption={energyConsumption} stats={stats} darkThemeStyles={darkThemeStyles} />

            {/* 搜索和操作区域 */}
      <SearchForm
        darkThemeStyles={darkThemeStyles}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        handleSearch={handleSearch}
        handleReset={handleReset}
        showChart={showChart}
        setShowChart={setShowChart}
        startTimeRef={startTimeRef}
        endTimeRef={endTimeRef}
        currentMode={currentMode}
        onModeChange={handleModeChange}
      />

      {/* 电能趋势图表 */}
      {showChart && (
        <>
          {currentMode === 'hour' && (
            <PowerChart
              chartOptions={chartOptions}
              trendData={trendData}
              isMobile={isMobile()}
              isSmallMobile={isSmallMobile()}
              darkThemeStyles={darkThemeStyles}
              loading={chartLoading}
            />
          )}
          {currentMode === 'day' && (
            <DailyPowerChart
              chartOptions={dailyChartOptions}
              trendData={dailyTrendData}
              isMobile={isMobile()}
              isSmallMobile={isSmallMobile()}
              darkThemeStyles={darkThemeStyles}
              loading={dailyChartLoading}
            />
          )}
        </>
      )}

      {/* 数据表格 */}
      <DataTable
        columns={getColumns(isMobile())}
        actionRef={actionRef}
        request={handleTableRequest}
        isMobile={isMobile()}
        darkThemeStyles={darkThemeStyles}
      />

    </PageContainer>
    </div>
  );
};

export default OfficeBuildingPage;
