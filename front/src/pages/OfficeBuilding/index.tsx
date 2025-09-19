import {
  getAllWorkshopsUsingGET,
  getDailyEnergyConsumptionQueryUsingGET,
  getElectricEnergyTrendUsingGET,
  getHourlyEnergyConsumptionQueryUsingGET,
  getHourlyEnergyConsumptionUsingGET,
  getStatisticsUsingGET
} from '@/services/SolarBi-front/officeBuildingController';
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

// 固定目标车间
const TARGET_WORKSHOP = '1#办公楼';

/**
 * 1#办公楼电能数据监控页面
 *
 * @constructor
 */
const OfficeBuildingPage: React.FC = () => {
  const startTimeRef = useRef<any>();
  const endTimeRef = useRef<any>();
  const [, setSelectedWorkshop] = useState<string>(TARGET_WORKSHOP);
  const [workshops, setWorkshops] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalDevices: 0,
    avgTemperature: 0,
    avgHumidity: 0,
    totalElectricEnergy: 0,
  });
  const [energyConsumption, setEnergyConsumption] = useState<number>(0);
  const [currentMode, setCurrentMode] = useState<string>('hour');
  const [searchParams, setSearchParams] = useState<API.TempMonitorQueryRequest>({});
  const [isDefaultTimeRange, setIsDefaultTimeRange] = useState<boolean>(true);
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
  const [pollingInterval, setPollingInterval] = useState(5);
  const [chartRef, setChartRef] = useState<any>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [lastRequestTime, setLastRequestTime] = useState<string>('');
  const [nextUpdateTime, setNextUpdateTime] = useState<string>('');
  const [chartInstance, setChartInstance] = useState<any>(null);
  const [lastXBySeriesRef, setLastXBySeriesRef] = useState<Record<string, number>>({});
  const [axisUpdateTimer, setAxisUpdateTimer] = useState<NodeJS.Timeout | null>(null);
  
  // 图表加载状态
  const [chartLoading, setChartLoading] = useState<boolean>(false);
  const [dailyChartLoading, setDailyChartLoading] = useState<boolean>(false);

  // 重构: 将所有重置和默认加载逻辑统一
  const loadDefaults = (mode: string) => {
    const now = moment();
    let startTime;
    let endTime;

    if (mode === 'hour') {
      // 小时模式默认加载最近24小时
      endTime = now.format('YYYY-MM-DD HH:mm:ss');
      startTime = now.clone().subtract(24, 'hours').format('YYYY-MM-DD HH:mm:ss');

      setTrendData([]);
      setChartOptions({});
      loadTrendData(false, startTime, endTime);
      calculateEnergyConsumption(startTime, endTime);
    } else { // 'day' mode
      // 日模式默认加载最近7天
      endTime = now.format('YYYY-MM-DD HH:mm:ss');
      startTime = now.clone().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss');

      setDailyTrendData([]);
      setDailyChartOptions({});
      loadDailyTrendData(false, startTime, endTime);
      calculateDailyEnergyConsumption(startTime, endTime);
    }

    // 核心: 更新searchParams状态，让表单显示默认值
    setSearchParams({ startTime, endTime });

    // 重置其他相关状态
    setSelectedWorkshop('');
    setEnergyConsumption(0);
    setIsDefaultTimeRange(true);
    loadStatistics(undefined, startTime, endTime);
  };

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 屏幕尺寸变化时重新渲染图表
  useEffect(() => {
    const timer = setTimeout(() => {
      // 重新渲染图表
      if (trendData.length > 0 && chartOptions.series) {
        setChartOptions((prevOptions: any) => ({
          ...prevOptions,
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
          legend: {
            ...(prevOptions.legend || {}),
            textStyle: {
              ...(prevOptions.legend?.textStyle || {}),
              fontSize: isMobile() ? (isSmallMobile() ? 10 : 11) : 12,
            }
          },
          tooltip: {
            ...(prevOptions.tooltip || {}),
            textStyle: {
              ...(prevOptions.tooltip?.textStyle || {}),
              fontSize: isMobile() ? (isSmallMobile() ? 11 : 12) : 13,
            }
          },
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
  }, [screenSize.width]);

  // 重构: 使用一个useEffect处理模式切换和初始加载
  useEffect(() => {
    const loadWorkshops = async () => {
      try {
        const response = await getAllWorkshopsUsingGET();
        if (response?.code === 0 && response.data) {
          setWorkshops(response.data);
        }
      } catch (error: any) {
        message.error('获取车间列表失败：' + error.message);
      }
    };

    loadWorkshops();
    loadDefaults(currentMode);
  }, [currentMode]);

  // 加载统计数据
  const loadStatistics = async (workshop?: string, startTime?: string, endTime?: string) => {
    try {
      const formattedStartTime = startTime ? moment(startTime).format('YYYY-MM-DD HH:mm:ss') : undefined;
      const formattedEndTime = endTime ? moment(endTime).format('YYYY-MM-DD HH:mm:ss') : undefined;

      const response = await getStatisticsUsingGET({
        workshop,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
      });

      let totalElectricEnergy = 0;

      if (response?.code === 0 && response.data) {
        setStats({
          totalDevices: response.data.totalDevices || 0,
          avgTemperature: Number((response.data.avgTemperature || 0).toFixed(1)),
          avgHumidity: Number((response.data.avgHumidity || 0).toFixed(1)),
          totalElectricEnergy: Number(totalElectricEnergy.toFixed(2)),
        });
      }
    } catch (error: any) {
      console.error('获取统计数据失败：', error);
    }
  };

  // 处理搜索
  const handleSearch = (values: any) => {
    const queryParams: API.TempMonitorQueryRequest = {
      ...values,
      current: 1,
      pageSize: 20,
    };

    // 处理时间范围
    if (values.startTime) {
      if (currentMode === 'hour') {
        queryParams.startTime = moment(values.startTime).format('YYYY-MM-DD HH:00:00');
      } else {
        queryParams.startTime = moment(values.startTime).format('YYYY-MM-DD 00:00:00');
      }
    }
    if (values.endTime) {
      if (currentMode === 'hour') {
        queryParams.endTime = moment(values.endTime).format('YYYY-MM-DD HH:05:00');
      } else {
        queryParams.endTime = moment(values.endTime).format('YYYY-MM-DD 23:59:59');
      }
    }

    setSearchParams(queryParams);
    setSelectedWorkshop(values.workshop || '');

    const isDefaultMode = !queryParams.startTime || !queryParams.endTime;
    setIsDefaultTimeRange(isDefaultMode);

    // 根据模式和是否有时间范围来计算电能消耗
    if (queryParams.startTime && queryParams.endTime) {
      if (currentMode === 'hour') {
        calculateEnergyConsumption(queryParams.startTime, queryParams.endTime);
      } else if (currentMode === 'day') {
        calculateDailyEnergyConsumption(queryParams.startTime, queryParams.endTime);
      }
    } else {
      loadDefaults(currentMode);
      return;
    }

    // 更新统计数据
    loadStatistics(values.workshop, queryParams.startTime, queryParams.endTime);

    // 根据模式更新对应的图表数据
    if (currentMode === 'hour') {
      loadTrendData(false, queryParams.startTime, queryParams.endTime);
    } else if (currentMode === 'day') {
      loadDailyTrendData(false, queryParams.startTime, queryParams.endTime);
    }
  };

  // 重构: 简化重置处理函数
  const handleReset = () => {
    loadDefaults(currentMode);
  };

  // 重构: 简化模式切换处理函数
  const handleModeChange = (mode: string) => {
    if (mode === currentMode) return;
    setCurrentMode(mode);
    message.success(`已切换到${mode === 'hour' ? '小时' : '日'}模式`);
  };

  // 计算电能消耗
  const calculateEnergyConsumption = async (startTime: string, endTime: string) => {
    try {
      const formattedStartTime = moment(startTime).format('YYYY-MM-DD HH:mm:ss');
      const formattedEndTime = moment(endTime).format('YYYY-MM-DD HH:mm:ss');

      const response = await getElectricEnergyTrendUsingGET({
        workshop: TARGET_WORKSHOP,
        startTime: formattedStartTime,
        endTime: formattedEndTime
      });

      if (response?.code === 0 && response.data && response.data.length > 0) {
        const sortedData = response.data.sort((a: any, b: any) =>
          moment(a.updateTime).valueOf() - moment(b.updateTime).valueOf()
        );

        const startEnergy = Number(sortedData[0].electricEnergy) || 0;
        const endEnergy = Number(sortedData[sortedData.length - 1].electricEnergy) || 0;
        const consumption = Math.max(0, endEnergy - startEnergy);

        setEnergyConsumption(consumption);
      } else {
        setEnergyConsumption(0);
        message.warning('指定时间范围内没有找到电能数据，请检查时间范围或数据源');
      }
    } catch (error: any) {
      console.error('计算电能消耗失败：', error);
      setEnergyConsumption(0);
      message.error(`计算电能消耗失败: ${error.message}`);
    }
  };

  // 计算日模式电能消耗
  const calculateDailyEnergyConsumption = async (startTime: string, endTime: string) => {
    try {
      const formattedStartTime = moment(startTime).format('YYYY-MM-DD HH:mm:ss');
      const formattedEndTime = moment(endTime).format('YYYY-MM-DD HH:mm:ss');

      const response = await getDailyEnergyConsumptionQueryUsingGET({
        workshop: TARGET_WORKSHOP,
        startTime: formattedStartTime,
        endTime: formattedEndTime
      });

      if (response?.code === 0 && response.data && response.data.length > 0) {
        const totalConsumption = response.data.reduce((total: any, item: any) => {
          const dailyConsumption = Number(item.energyConsumption) || 0;
          return total + dailyConsumption;
        }, 0);

        setEnergyConsumption(totalConsumption);
      } else {
        setEnergyConsumption(0);
        message.warning('指定时间范围内没有找到日电能数据，请检查时间范围或数据源');
      }
    } catch (error: any) {
      console.error('计算日模式电能消耗失败：', error);
      setEnergyConsumption(0);
      message.error(`计算日模式电能消耗失败: ${error.message}`);
    }
  };

  // 加载每日电能消耗数据
  const loadDailyTrendData = async (isRealtime = false, startTime?: string, endTime?: string) => {
    setDailyChartLoading(true);
    try {
      const requestStartTime = moment().format('HH:mm:ss');
      setLastRequestTime(requestStartTime);

      const targetWorkshop = TARGET_WORKSHOP;

      const rawStartTime = startTime || searchParams.startTime || undefined;
      const rawEndTime = endTime || searchParams.endTime || undefined;

      const requestParams: any = {
        workshop: targetWorkshop,
        deviceId: undefined,
        startTime: rawStartTime ? moment(rawStartTime).format('YYYY-MM-DD HH:mm:ss') : undefined,
        endTime: rawEndTime ? moment(rawEndTime).format('YYYY-MM-DD HH:mm:ss') : undefined,
      };

      const response = await getDailyEnergyConsumptionQueryUsingGET(requestParams);

      if (response?.code === 0 && response.data) {
        // 按设备分组数据 - 汇总为一条线
        const deviceGroups: { [key: string]: any[] } = {};

        response.data.forEach((item: API.DailyEnergyConsumption) => {
          const deviceName = `1#办公楼`;
          if (!deviceGroups[deviceName]) {
            deviceGroups[deviceName] = [];
          }

          const dayTime = new Date(item.day || '').getTime();

          const dataPoint = {
            x: dayTime,
            y: Number(item.energyConsumption) || 0,
            time: moment(item.day).format('MM-DD'),
            device: deviceName,
            originalDay: item.day,
            originalEnergyConsumption: item.energyConsumption,
            startEnergy: item.startEnergy,
            endEnergy: item.endEnergy,
            isRealData: true
          };

          deviceGroups[deviceName].push(dataPoint);
        });

        // 转换为图表系列数据
        const series = Object.keys(deviceGroups).map((deviceName, index) => {
          const colors = ['#40a9ff', '#73d13d', '#faad14', '#ff7a45', '#b37feb', '#36cfc9', '#f759ab', '#ffc53d'];
          const sortedData = deviceGroups[deviceName].sort((a, b) => a.x - b.x);

          return {
            name: deviceName,
            data: sortedData,
            color: colors[index % colors.length]
          };
        });

        // 生成ECharts配置
        const echartsSeries = series.map((s: any, index: number) => {
          const techColors = [
            '#00d4ff', '#00ff88', '#ff6b35', '#ff3d71',
            '#a855f7', '#06ffa5', '#ff1744', '#00e5ff'
          ];
          const seriesColor = techColors[index % techColors.length];

          const processedData = (s.data || [])
            .sort((a: any, b: any) => a.x - b.x)
            .filter((p: any) => p.x && p.y !== null && p.y !== undefined)
            .map((p: any) => ({
              value: [p.x, p.y],
              symbol: 'circle',
              symbolSize: isMobile() ? (isSmallMobile() ? 4 : 5) : 6,
              itemStyle: {
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
            connectNulls: true,
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
            step: false,
            sampling: 'none',
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
            boundaryGap: [0, 0],
            minInterval: 24 * 3600 * 1000, // 最小间隔1天
            maxInterval: 7 * 24 * 3600 * 1000, // 最大间隔7天
            splitNumber: rawStartTime && rawEndTime ?
              Math.max(3, Math.ceil((moment(rawEndTime).valueOf() - moment(rawStartTime).valueOf()) / (1000 * 60 * 60 * 24))) : // 按天数计算
              7, // 默认7天
            axisLabel: {
              formatter: (value: number) => moment(value).format('MM-DD'),
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
          yAxis: {
            type: 'value',
            name: isMobile() ? '' : '每日用电量 (kWh)',
            nameTextStyle: {
              color: '#00d4ff',
              fontSize: isMobile() ? (isSmallMobile() ? 10 : 11) : 12,
              fontWeight: 'bold'
            },
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
        };

        setDailyChartOptions(options);
        setDailyTrendData(series);
        setLastUpdateTime(moment().format('HH:mm:ss'));
      } else {
        message.error(response?.message || '获取每日电能消耗数据失败');
      }
    } catch (error: any) {
      console.error('获取每日电能消耗数据失败：', error);
      message.error('获取每日电能消耗数据失败：' + error.message);
    } finally {
      setDailyChartLoading(false);
    }
  };

  // 加载每小时电能消耗数据
  const loadTrendData = async (isRealtime = false, startTime?: string, endTime?: string) => {
    setChartLoading(true);
    try {
      const requestStartTime = moment().format('HH:mm:ss');
      setLastRequestTime(requestStartTime);

      const targetWorkshop = TARGET_WORKSHOP;

      const rawStartTime = startTime || searchParams.startTime || undefined;
      const rawEndTime = endTime || searchParams.endTime || undefined;

      const requestParams: any = {
        workshop: targetWorkshop,
        deviceId: undefined,
        startTime: rawStartTime ? moment(rawStartTime).format('YYYY-MM-DD HH:mm:ss') : undefined,
        endTime: rawEndTime ? moment(rawEndTime).format('YYYY-MM-DD HH:mm:ss') : undefined,
      };

      let response;
      if (isDefaultTimeRange) {
        response = await getHourlyEnergyConsumptionUsingGET(requestParams);
      } else {
        response = await getHourlyEnergyConsumptionQueryUsingGET(requestParams);
      }

      if (response?.code === 0 && response.data) {
        // 按设备分组数据 - 汇总为一条线
        const deviceGroups: { [key: string]: any[] } = {};

        response.data.forEach((item: API.HourlyEnergyConsumption) => {
          const deviceName = `1#办公楼`;
          if (!deviceGroups[deviceName]) {
            deviceGroups[deviceName] = [];
          }

          const hourTime = new Date(item.hour || '').getTime();
          const middleOfHour = hourTime + (30 * 60 * 1000);

          const dataPoint = {
            x: middleOfHour,
            y: Number(item.energyConsumption) || 0,
            time: moment(item.hour).format('MM-DD HH:00'),
            device: deviceName,
            originalHour: item.hour,
            originalEnergyConsumption: item.energyConsumption,
            startEnergy: item.startEnergy,
            endEnergy: item.endEnergy,
            isRealData: true
          };

          deviceGroups[deviceName].push(dataPoint);
        });

        // 转换为图表系列数据
        const series = Object.keys(deviceGroups).map((deviceName, index) => {
          const colors = ['#40a9ff', '#73d13d', '#faad14', '#ff7a45', '#b37feb', '#36cfc9', '#f759ab', '#ffc53d'];
          const sortedData = deviceGroups[deviceName].sort((a, b) => a.x - b.x);

          return {
            name: deviceName,
            data: sortedData,
            color: colors[index % colors.length]
          };
        });

        // 生成ECharts配置
        const echartsSeries = series.map((s: any, index: number) => {
          const techColors = [
            '#00d4ff', '#00ff88', '#ff6b35', '#ff3d71',
            '#a855f7', '#06ffa5', '#ff1744', '#00e5ff'
          ];
          const seriesColor = techColors[index % techColors.length];

          const processedData = (s.data || [])
            .sort((a: any, b: any) => a.x - b.x)
            .filter((p: any) => p.x && p.y !== null && p.y !== undefined)
            .map((p: any) => ({
              value: [p.x, p.y],
              symbol: 'circle',
              symbolSize: isMobile() ? (isSmallMobile() ? 4 : 5) : 6,
              itemStyle: {
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
            connectNulls: true,
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
            step: false,
            sampling: 'none',
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
              const time = datetime.format('HH:mm');

              const lines = params
                .filter(p => p && p.value && Array.isArray(p.value) && p.value.length >= 2)
                .map(p => `<span style="color:${p.color}">●</span> ${p.seriesName}: <span style="color:#00d4ff; font-weight:bold">${Number(p.value[1]).toFixed(2)} kWh</span>`);

              const headerFontSize = isMobile() ? (isSmallMobile() ? '12px' : '13px') : '14px';
              return `<div style="color:#fff; text-align:center;">
                        <div style="color:#00d4ff; font-size:${headerFontSize}; font-weight:bold; margin-bottom:6px;">${time} 时电能消耗</div>
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
            min: rawStartTime && rawEndTime ? moment(rawStartTime).valueOf() : undefined,
            max: rawStartTime && rawEndTime ? moment(rawEndTime).valueOf() : undefined,
            boundaryGap: [0, 0], // 不留边距，让线条延伸到图表边缘
            minInterval: 3600 * 1000, // 最小间隔1小时
            maxInterval: 24 * 3600 * 1000, // 最大间隔24小时
            splitNumber: rawStartTime && rawEndTime ?
              Math.max(3, Math.ceil((moment(rawEndTime).valueOf() - moment(rawStartTime).valueOf()) / (1000 * 60 * 60))) : // 按小时数计算
              24, // 默认24小时
            axisLabel: {
              formatter: (value: number) => moment(value).format('HH:mm'),
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
          yAxis: {
            type: 'value',
            name: isMobile() ? '' : '每小时用电量 (kWh)',
            nameTextStyle: {
              color: '#00d4ff',
              fontSize: isMobile() ? (isSmallMobile() ? 10 : 11) : 12,
              fontWeight: 'bold'
            },
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
        };

        setChartOptions(options);
        setTrendData(series);
        setLastUpdateTime(moment().format('HH:mm:ss'));
      } else {
        message.error(response?.message || '获取每小时电能消耗数据失败');
      }
    } catch (error: any) {
      console.error('获取每小时电能消耗数据失败：', error);
      message.error('获取每小时电能消耗数据失败：' + error.message);
    } finally {
      setChartLoading(false);
    }
  };

  return (
    <div style={pageBackgroundStyles as any}>
      <style>{pageStylesCSS}</style>
      <PageContainer
        header={{
          title: (
            <span style={darkThemeStyles.title}>1#办公楼电能数据监控</span>
          ),
          breadcrumb: {},
        }}
        content={false}
        style={darkThemeStyles.pageContainer}
      >
        {/* 统计卡片 */}
        <StatisticsCards
          stats={stats}
          energyConsumption={energyConsumption}
          darkThemeStyles={darkThemeStyles}
        />

        {/* 搜索表单 */}
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
      </PageContainer>
    </div>
  );
};

export default OfficeBuildingPage;