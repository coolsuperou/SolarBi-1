import {
  getLatestDataUsingGET,
  getDataByWorkshopUsingGET,
  getAllWorkshopsUsingGET,
  queryByConditionUsingPOST,
  getStatisticsUsingGET,
  getElectricEnergyTrendUsingGET,
  getHourlyEnergyConsumptionUsingGET,
  getHourlyEnergyConsumptionQueryUsingGET,
  getDailyEnergyConsumptionQueryUsingGET
} from '@/services/SolarBi-front/tempMonitorController';
import { DatabaseOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import '@umijs/max';
import { message, Space, Badge } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import moment from 'moment';
import StatisticsCards from './components/StatisticsCards';
import SearchForm from './components/SearchForm';
import PowerChart from './components/PowerChart';
import DailyPowerChart from './components/DailyPowerChart';
import DataTable from './components/DataTable';
import darkThemeStyles from './styles/darkThemeStyles';
import { getColumns } from './config/columns';

  // 固定目标车间
const TARGET_WORKSHOP = '114_空调水机主机';

// 在组件内部定义响应式检测函数的占位，实际在组件内使用state


// 移除未使用的 Select 和 Typography

/**
 * 电能数据监控页面
 *
 * @constructor
 */
const PowerMonitorPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const startTimeRef = useRef<any>();
  const endTimeRef = useRef<any>();
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>(TARGET_WORKSHOP);
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
  const lastXBySeriesRef = useRef<Record<string, number>>({});
  const [axisUpdateTimer, setAxisUpdateTimer] = useState<NodeJS.Timeout | null>(null);
  // 移除手动控制，固定为自动刷新模式

  // 加载车间列表和统计数据
  // 初始化默认时间范围
  const initializeDefaultTimeRange = async () => {
      try {
        // 获取BI图表默认数据（全部记录）
        const response = await getElectricEnergyTrendUsingGET({
          workshop: TARGET_WORKSHOP,
          deviceId: undefined,
          startTime: undefined,
          endTime: undefined
          // 不设置limit，获取全部数据
        });

        if (response?.code === 0 && response.data && response.data.length > 0) {
          // 按时间排序数据
          const sortedData = response.data.sort((a, b) =>
            moment(a.updateTime).valueOf() - moment(b.updateTime).valueOf()
          );

          // 获取最新记录的时间作为结束时间
          const lastRecord = sortedData[sortedData.length - 1];
          const endMoment = moment(lastRecord.updateTime);

          // 计算24小时05分前的时间作为开始时间
          const startMoment = endMoment.clone().subtract(24, 'hours').subtract(5, 'minutes');

          // 设置时间选择器的默认值
          const startDate = startMoment.format('YYYY-MM-DD');
          const startHour = startMoment.format('HH');
          const endDate = endMoment.format('YYYY-MM-DD');
          const endHour = endMoment.format('HH');

          // 更新UI控件
          setTimeout(() => {
            if (startTimeRef.current) {
              startTimeRef.current.value = startDate;
            }
            if (endTimeRef.current) {
              endTimeRef.current.value = endDate;
            }
            const startHourSelect = document.getElementById('startHour') as HTMLSelectElement;
            const endHourSelect = document.getElementById('endHour') as HTMLSelectElement;
            if (startHourSelect) startHourSelect.value = startHour;
            if (endHourSelect) endHourSelect.value = endHour;
          }, 100);

          // 设置搜索参数状态
          // 默认24小时05分模式：结束时间使用最新记录的实际时间，开始时间使用精确的24小时05分前时间
          // 确保时间格式为 yyyy-MM-dd HH:mm:ss
          const defaultEndTime = lastRecord.updateTime ?
            moment(lastRecord.updateTime).format('YYYY-MM-DD HH:mm:ss') :
            endMoment.format('YYYY-MM-DD HH:mm:ss');
          // 开始时间：最新记录时间减去精确的24小时05分
          const defaultStartTime = lastRecord.updateTime ?
            moment(lastRecord.updateTime).subtract(24, 'hours').subtract(5, 'minutes').format('YYYY-MM-DD HH:mm:ss') :
            startMoment.format('YYYY-MM-DD HH:mm:ss');
          setSearchParams({
            startTime: defaultStartTime,
            endTime: defaultEndTime
          });
          setIsDefaultTimeRange(true); // 标记为默认时间范围
          setTempSearchParams({}); // 默认模式下表格不使用时间范围限制

          // 使用统一的电能消耗计算函数来确保准确性
          calculateEnergyConsumption(defaultStartTime, defaultEndTime);

          console.log('设置默认24小时05分时间范围:', {
            startTime: defaultStartTime,
            endTime: defaultEndTime,
            totalRecords: sortedData.length
          });

          // 使用设置好的时间范围加载图表数据和统计数据
          loadTrendData(false, defaultStartTime, defaultEndTime);
          loadStatistics(TARGET_WORKSHOP, defaultStartTime, defaultEndTime);
        }
      } catch (error: any) {
        console.log('获取默认时间范围失败，使用当前时间作为默认:', error.message);
        // 如果获取失败，使用当前时间设置默认24小时05分范围
        const now = moment();
        const endMoment = now;
        const startMoment = now.clone().subtract(24, 'hours').subtract(5, 'minutes');

        const startDate = startMoment.format('YYYY-MM-DD');
        const startHour = startMoment.format('HH');
        const endDate = endMoment.format('YYYY-MM-DD');
        const endHour = endMoment.format('HH');

        // 设置默认时间范围
        // 默认24小时05分模式：结束时间使用当前实际时间，开始时间使用精确的24小时05分前时间
        const defaultEndTime = now.format('YYYY-MM-DD HH:mm:ss'); // 使用当前实际时间
        const defaultStartTime = now.subtract(24, 'hours').subtract(5, 'minutes').format('YYYY-MM-DD HH:mm:ss'); // 精确的24小时05分前
        setSearchParams({
          startTime: defaultStartTime,
          endTime: defaultEndTime
        });
        setIsDefaultTimeRange(true); // 标记为默认时间范围
        setTempSearchParams({}); // 默认模式下表格不使用时间范围限制

        // 更新UI控件
        setTimeout(() => {
          if (startTimeRef.current) {
            startTimeRef.current.value = startDate;
          }
          if (endTimeRef.current) {
            endTimeRef.current.value = endDate;
          }
          const startHourSelect = document.getElementById('startHour') as HTMLSelectElement;
          const endHourSelect = document.getElementById('endHour') as HTMLSelectElement;
          if (startHourSelect) startHourSelect.value = startHour;
          if (endHourSelect) endHourSelect.value = endHour;
        }, 100);

        // 计算24小时05分电能消耗（即使获取失败也要尝试计算）
        calculateEnergyConsumption(defaultStartTime, defaultEndTime);

        // 使用默认时间范围加载图表数据和统计数据
        loadTrendData(false, defaultStartTime, defaultEndTime);
        loadStatistics(TARGET_WORKSHOP, defaultStartTime, defaultEndTime);
      }
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

      // 重新渲染表格以应用响应式列配置
      if (actionRef.current?.reload) {
        actionRef.current.reload();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [screenSize.width]); // 依赖屏幕宽度变化

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
    initializeDefaultTimeRange(); // 先设置默认时间范围，内部会调用loadTrendData
  }, []);

  // 加载统计数据
  const loadStatistics = async (workshop?: string, startTime?: string, endTime?: string) => {
    try {
      // 确保时间格式为 yyyy-MM-dd HH:mm:ss
      const formattedStartTime = startTime ? moment(startTime).format('YYYY-MM-DD HH:mm:ss') : undefined;
      const formattedEndTime = endTime ? moment(endTime).format('YYYY-MM-DD HH:mm:ss') : undefined;

      // 获取基础统计数据（设备数、温度、湿度）
      const response = await getStatisticsUsingGET({
        workshop,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
      });

      // 获取114_空调水机主机的电能数据
      const electricEnergyResponse = await getDataByWorkshopUsingGET({
        workshop: '114_空调水机主机'
      });

      let totalElectricEnergy = 0;
      if (electricEnergyResponse?.code === 0 && electricEnergyResponse.data && electricEnergyResponse.data.length > 0) {
        // 获取最新一条记录的电能信息（数据通常按时间倒序排列）
        const latestRecord = electricEnergyResponse.data[0];
        totalElectricEnergy = Number(latestRecord.electricEnergy) || 0;
      }

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

    // 处理时间范围 - 根据当前模式使用不同的时间格式
    if (values.startTime) {
      if (currentMode === 'hour') {
        queryParams.startTime = moment(values.startTime).format('YYYY-MM-DD HH:00:00');
      } else {
        // 日模式：开始时间使用当天00:00:00
        queryParams.startTime = moment(values.startTime).format('YYYY-MM-DD 00:00:00');
      }
    }
    if (values.endTime) {
      if (currentMode === 'hour') {
        // 小时模式：结束时间改为选择小时后的05分，例如选择8时查询的是8:05之前的数据
        queryParams.endTime = moment(values.endTime).format('YYYY-MM-DD HH:05:00');
      } else {
        // 日模式：结束时间使用当天23:59:59
        queryParams.endTime = moment(values.endTime).format('YYYY-MM-DD 23:59:59');
      }
    }

    setSearchParams(queryParams);
    setSelectedWorkshop(values.workshop || '');
    
    // 判断是否为默认时间范围：如果没有指定时间，则为默认模式
    const isDefaultMode = !queryParams.startTime || !queryParams.endTime;
    setIsDefaultTimeRange(isDefaultMode);
    setTempSearchParams(isDefaultMode ? {} : queryParams); // 默认模式下表格不使用时间范围限制
    actionRef.current?.reload();

    // 计算电能消耗（仅在小时模式下）
    if (currentMode === 'hour' && queryParams.startTime && queryParams.endTime) {
      console.log('准备计算电能消耗，参数:', {
        startTime: queryParams.startTime,
        endTime: queryParams.endTime,
        workshop: TARGET_WORKSHOP
      });
      calculateEnergyConsumption(queryParams.startTime, queryParams.endTime);
    } else if (currentMode === 'hour' && (!queryParams.startTime || !queryParams.endTime)) {
      console.log('没有时间范围，回到默认模式');
      // 回到默认模式时，重新初始化默认时间范围
      initializeDefaultTimeRange();
      return; // 由initializeDefaultTimeRange内部处理后续逻辑
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

  // 重置搜索
  const handleReset = () => {
    setSearchParams({});
    setSelectedWorkshop('');
    setEnergyConsumption(0);
    setIsDefaultTimeRange(true); // 重置后回到默认时间范围
    setTempSearchParams({}); // 清空表格搜索参数
    
    // 清空日期选择器
    if (startTimeRef.current) {
      startTimeRef.current.value = '';
    }
    if (endTimeRef.current) {
      endTimeRef.current.value = '';
    }
    
    // 只在小时模式下清空小时选择器
    if (currentMode === 'hour') {
      const startHourSelect = document.getElementById('startHour') as HTMLSelectElement;
      const endHourSelect = document.getElementById('endHour') as HTMLSelectElement;
      if (startHourSelect) startHourSelect.selectedIndex = 0;
      if (endHourSelect) endHourSelect.selectedIndex = 0;
    }
    
    // 清空对应模式的图表数据
    if (currentMode === 'day') {
      setDailyTrendData([]);
      setDailyChartOptions({});
    } else {
      setTrendData([]);
      setChartOptions({});
    }
    
    actionRef.current?.reload();
    loadStatistics();
    
    // 根据当前模式重新初始化数据
    if (currentMode === 'hour') {
      // 重新初始化默认24小时05分时间范围，而不是加载全部数据
      initializeDefaultTimeRange();
    } else if (currentMode === 'day') {
      // 日模式重置后，加载默认7天数据
      const now = moment();
      const endTime = now.format('YYYY-MM-DD HH:mm:ss');
      const startTime = now.clone().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss');
      loadDailyTrendData(false, startTime, endTime);
    }
  };

  // 处理模式切换
  const handleModeChange = (mode: string) => {
    setCurrentMode(mode);
    message.success(`已切换到${mode === 'hour' ? '小时' : mode === 'day' ? '日' : '月'}模式`);
    
    // 根据模式调整查询参数或数据展示逻辑
    console.log('当前模式已切换为:', mode);
    
    if (mode === 'day') {
      // 切换到日模式时，执行与重置相同的行为：清空输入并加载默认7天
      setSearchParams({});
      setSelectedWorkshop('');
      setEnergyConsumption(0);
      setIsDefaultTimeRange(true);
      setTempSearchParams({});

      // 清空日期选择器
      if (startTimeRef.current) {
        startTimeRef.current.value = '';
      }
      if (endTimeRef.current) {
        endTimeRef.current.value = '';
      }

      // 清空日模式图表数据
      setDailyTrendData([]);
      setDailyChartOptions({});

      // 加载默认7天范围
      const now = moment();
      const endTime = now.format('YYYY-MM-DD HH:mm:ss');
      const startTime = now.clone().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss');
      loadDailyTrendData(false, startTime, endTime);
    } else if (mode === 'hour') {
      // 切换回小时模式时，重新加载小时数据
      if (searchParams.startTime && searchParams.endTime) {
        loadTrendData(false, searchParams.startTime, searchParams.endTime);
      } else {
        loadTrendData(false);
      }
    }
  };

  // 计算电能消耗
  const calculateEnergyConsumption = async (startTime: string, endTime: string) => {
    try {
      console.log('开始计算电能消耗:', startTime, '到', endTime);

      // 确保时间格式为 yyyy-MM-dd HH:mm:ss
      const formattedStartTime = moment(startTime).format('YYYY-MM-DD HH:mm:ss');
      const formattedEndTime = moment(endTime).format('YYYY-MM-DD HH:mm:ss');

      // 获取整个时间范围内的所有数据
      const response = await getElectricEnergyTrendUsingGET({
        workshop: TARGET_WORKSHOP,
        startTime: formattedStartTime,
        endTime: formattedEndTime
        // 不设置limit，获取全部数据
      });

      console.log('获取时间范围数据响应:', response);

      if (response?.code === 0 && response.data && response.data.length > 0) {
        // 按时间排序数据
        const sortedData = response.data.sort((a, b) =>
          moment(a.updateTime).valueOf() - moment(b.updateTime).valueOf()
        );

        console.log('排序后的数据:', sortedData.length, '条');
        console.log('第一条数据:', sortedData[0]);
        console.log('最后一条数据:', sortedData[sortedData.length - 1]);

        // 取第一条和最后一条记录计算消耗
        const startEnergy = Number(sortedData[0].electricEnergy) || 0;
        const endEnergy = Number(sortedData[sortedData.length - 1].electricEnergy) || 0;
        const consumption = Math.max(0, endEnergy - startEnergy);

        console.log('电能消耗计算结果:', {
          startTime: sortedData[0].updateTime,
          endTime: sortedData[sortedData.length - 1].updateTime,
          startEnergy,
          endEnergy,
          consumption
        });

        setEnergyConsumption(consumption);

        // 静默设置电能消耗，不显示提示信息
      } else {
        setEnergyConsumption(0);
        console.log('API响应详情:', {
          code: response?.code,
          message: response?.message,
          dataLength: response?.data?.length
        });
        message.warning('指定时间范围内没有找到电能数据，请检查时间范围或数据源');
      }
    } catch (error: any) {
      console.error('计算电能消耗失败：', error);
      setEnergyConsumption(0);
      message.error(`计算电能消耗失败: ${error.message}`);
    }
  };

  // 加载每日电能消耗数据 - 显示日用电量差值（结束日期以后最近记录 - 开始日期以后最近记录）
  const loadDailyTrendData = async (isRealtime = false, startTime?: string, endTime?: string) => {
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
        startTime: rawStartTime ? moment(rawStartTime).format('YYYY-MM-DD HH:mm:ss') : undefined,
        endTime: rawEndTime ? moment(rawEndTime).format('YYYY-MM-DD HH:mm:ss') : undefined,
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
          const deviceName = `114_空调水机主机 `;
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
            adjustedMaxTime = moment(endTime).valueOf();
          } else {
            // 默认模式：使用固定的7天范围
            const now = moment();
            adjustedMinTime = now.clone().subtract(7, 'days').valueOf();
            adjustedMaxTime = now.clone().add(1, 'days').valueOf();
          }
        } else {
          const now = moment();
          adjustedMaxTime = now.clone().add(1, 'days').valueOf();
          adjustedMinTime = now.clone().subtract(7, 'days').valueOf();
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
    }
  };

  // 加载每小时电能消耗数据 - 显示小时用电量差值（结束时间以后最近记录 - 开始时间以后最近记录）
  const loadTrendData = async (isRealtime = false, startTime?: string, endTime?: string) => {
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
        startTime: rawStartTime ? moment(rawStartTime).format('YYYY-MM-DD HH:mm:ss') : undefined,
        endTime: rawEndTime ? moment(rawEndTime).format('YYYY-MM-DD HH:mm:ss') : undefined,
      };

      console.log('请求每小时电能消耗数据参数:', requestParams);
      console.log('是否为默认时间范围:', isDefaultTimeRange);
      console.log('当前searchParams:', searchParams);
      console.log('传入的startTime:', startTime);
      console.log('传入的endTime:', endTime);
      
      // 根据是否为默认状态调用不同的API
      let response;
      if (isDefaultTimeRange) {
        // 默认模式：使用实时更新逻辑（最新小时用最新记录减去开始时间记录）
        console.log('🔴 调用默认模式API（实时更新） - /electric-energy-hourly-consumption');
        response = await getHourlyEnergyConsumptionUsingGET(requestParams);
      } else {
        // 查询模式：使用标准逻辑（所有小时都用结束时间以后最近记录减去开始时间以后最近记录）
        console.log('🔵 调用查询模式API（历史数据） - /electric-energy-hourly-consumption-query');
        response = await getHourlyEnergyConsumptionQueryUsingGET(requestParams);
      }

      if (response?.code === 0 && response.data) {
        const modeText = isDefaultTimeRange ? '默认模式-实时更新' : '查询模式-历史数据';
        console.log(`获取到每小时电能消耗数据（${modeText}）:`, response.data);
        console.log('数据点数量:', response.data.length);
        console.log('时间范围:', response.data.length > 0 ? {
          first: response.data[0].hour,
          last: response.data[response.data.length - 1].hour
        } : '无数据');

        // 按设备分组数据
        const deviceGroups: { [key: string]: any[] } = {};

        response.data.forEach((item: API.HourlyEnergyConsumption, index: number) => {
          const deviceName = `114_空调水机主机 `;
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
            // 默认模式：使用固定的24小时范围，确保实时更新时图表不会缩小
            const now = moment();
            // 固定显示过去24小时到当前时间后2小时的范围
            adjustedMinTime = now.clone().subtract(24, 'hours').valueOf();
            adjustedMaxTime = now.clone().add(2, 'hours').valueOf();
          }
        } else {
          const now = moment();
          adjustedMaxTime = now.clone().add(2, 'hours').valueOf();
          adjustedMinTime = now.clone().subtract(24, 'hours').valueOf();
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
    }
  };

  // 智能定时同步已禁用 - 避免自动缩小
  // useEffect(() => {
  //   let dataCheckTimeoutId: NodeJS.Timeout;
  //   let dataCheckIntervalId: NodeJS.Timeout;

  //   // 计算下一个x1:54的时间（01:54, 11:54, 21:54, 31:54, 41:54, 51:54）
  //   const getNextSyncTime = () => {
  //     const now = new Date();
  //     const currentMinute = now.getMinutes();
  //     const currentSecond = now.getSeconds();

  //     // 定义同步时间点：每10分钟的x1:54
  //     const syncMinutes = [1, 11, 21, 31, 41, 51];
  //     const syncSecond = 54;

  //     let nextSyncMinute = null;

  //     // 找到下一个同步分钟
  //     for (const minute of syncMinutes) {
  //       if (currentMinute < minute || (currentMinute === minute && currentSecond < syncSecond)) {
  //         nextSyncMinute = minute;
  //         break;
  //       }
  //     }

  //     const nextSync = new Date(now);

  //     if (nextSyncMinute !== null) {
  //       // 在当前小时内找到了下一个同步点
  //       nextSync.setMinutes(nextSyncMinute, syncSecond, 0);
  //     } else {
  //       // 需要到下一个小时的第一个同步点
  //       nextSync.setHours(nextSync.getHours() + 1);
  //       nextSync.setMinutes(syncMinutes[0], syncSecond, 0);
  //     }

  //     return nextSync.getTime() - now.getTime(); // 返回毫秒差
  //   };

  //   // 数据更新函数
  //   const updateData = () => {
  //     console.log('数据同步更新时间:', moment().format('YYYY-MM-DD HH:mm:ss'));

  //     if (!isDefaultTimeRange) {
  //       // 用户手动搜索的情况：使用搜索参数进行实时更新
  //       console.log('定时更新：用户手动搜索模式，使用固定时间范围');
  //       loadTrendData(true, searchParams.startTime, searchParams.endTime);
  //       loadStatistics(selectedWorkshop, searchParams.startTime, searchParams.endTime);
  //       // 表格也使用搜索参数
  //       setTempSearchParams(searchParams);
  //     } else {
  //       // 默认24小时05分模式：不传递时间范围，让图表自然扩展
  //       console.log('定时更新：默认24小时05分模式，允许图表自然扩展');
  //       loadTrendData(true);
  //       loadStatistics(selectedWorkshop);
  //       // 表格也不使用时间范围限制
  //       setTempSearchParams({});
  //     }

  //     // 刷新表格数据
  //     setTimeout(() => {
  //       actionRef.current?.reload();
  //     }, 100); // 稍微延迟以确保tempSearchParams更新生效
      
  //     // 强制同步图表数据，确保与表格数据一致
  //     setTimeout(() => {
  //       if (!isDefaultTimeRange) {
  //         loadTrendData(false, searchParams.startTime, searchParams.endTime); // 非实时模式，强制重建图表
  //       } else {
  //         loadTrendData(false); // 非实时模式，强制重建图表
  //       }
  //     }, 200); // 在表格更新后再更新图表
  //   };

  //   // 设置首次同步到下一个47分
  //   const initialDelay = getNextSyncTime();
  //   const nextSyncTime = moment().add(initialDelay, 'milliseconds').format('YYYY-MM-DD HH:mm:ss');
  //   console.log('下一次数据同步时间:', nextSyncTime);
  //   setNextUpdateTime(nextSyncTime);

  //   dataCheckTimeoutId = setTimeout(() => {
  //     // 首次同步
  //     updateData();

  //     // 计算并显示下次同步时间
  //     const calculateNextSyncDisplay = () => {
  //       const now = new Date();
  //       const currentMinute = now.getMinutes();
  //       const currentSecond = now.getSeconds();
  //       const syncMinutes = [1, 11, 21, 31, 41, 51];
  //       const syncSecond = 54;

  //       let nextSyncMinute = null;
  //       for (const minute of syncMinutes) {
  //         if (currentMinute < minute || (currentMinute === minute && currentSecond < syncSecond)) {
  //           nextSyncMinute = minute;
  //           break;
  //         }
  //       }

  //       const nextSync = new Date(now);
  //       if (nextSyncMinute !== null) {
  //         nextSync.setMinutes(nextSyncMinute, syncSecond, 0);
  //       } else {
  //         nextSync.setHours(nextSync.getHours() + 1);
  //         nextSync.setMinutes(syncMinutes[0], syncSecond, 0);
  //       }

  //       return moment(nextSync).format('YYYY-MM-DD HH:mm:ss');
  //     };

  //     setNextUpdateTime(calculateNextSyncDisplay());

  //     // 然后每10分钟检查一次是否到了同步时间点（每600000毫秒 = 10分钟）
  //     dataCheckIntervalId = setInterval(() => {
  //       const now = new Date();
  //       const currentMinute = now.getMinutes();
  //       const currentSecond = now.getSeconds();
  //       const syncMinutes = [1, 11, 21, 31, 41, 51];
  //       const syncSecond = 54;

  //       // 检查是否是同步时间点（允许1秒的误差范围）
  //       if (syncMinutes.includes(currentMinute) && Math.abs(currentSecond - syncSecond) <= 1) {
  //         updateData();
  //         // 更新下次同步时间显示
  //         setNextUpdateTime(calculateNextSyncDisplay());
  //       }
  //     }, 60000); // 每1分钟检查一次，确保不会错过同步点
  //   }, initialDelay);

  //   return () => {
  //     if (dataCheckTimeoutId) {
  //       clearTimeout(dataCheckTimeoutId);
  //     }
  //     if (dataCheckIntervalId) {
  //       clearInterval(dataCheckIntervalId);
  //     }
  //   };
  // }, [selectedWorkshop, searchParams]);





  // 图表实时更新 - 仅在默认模式下启用
  useEffect(() => {
    if (!showChart || !isDefaultTimeRange) {
      console.log('停止图表实时更新 - 图表隐藏或非默认模式');
      return;
    }
    
    console.log('启动图表实时更新，间隔30秒（仅默认模式）');
    const chartUpdateInterval = setInterval(() => {
      console.log('图表实时更新检查:', moment().format('HH:mm:ss'), '- 默认模式');
      // 只在默认模式下进行实时更新
      loadTrendData(true);
    }, 30000); // 30秒更新一次，避免过于频繁
    
    return () => {
      console.log('停止图表实时更新');
      clearInterval(chartUpdateInterval);
    };
  }, [showChart, isDefaultTimeRange]); // 移除searchParams依赖，只在默认/查询模式切换时重新执行



  /**
   * 表格列定义 - 响应式配置
   */
  // 根据屏幕尺寸决定显示的列（抽离到 config/columns）
  const columns: ProColumns<API.TempMonitor>[] = getColumns(isMobile());

  // 表格请求函数，与原 ProTable.request 逻辑一致
  const tableRequest = async (params: any) => {
    try {
      let response: any;

      if (Object.keys(tempSearchParams).length > 0) {
        const queryRequest: API.TempMonitorQueryRequest = {
          ...tempSearchParams,
          current: params.current || 1,
          pageSize: params.pageSize || 20,
        };
        response = await queryByConditionUsingPOST(queryRequest);

        if (response?.code === 0 && response.data) {
          return {
            data: response.data.records || [],
            success: true,
            total: response.data.total || 0,
          };
        }
      } else {
        response = await getDataByWorkshopUsingGET({ workshop: TARGET_WORKSHOP });
        if (response?.code === 0 && response.data) {
          return {
            data: response.data || [],
            success: true,
            total: response.data?.length || 0,
          };
        }
      }

      message.error(response?.message || '获取数据失败');
      return {
        data: [],
        success: false,
        total: 0,
      };
    } catch (error: any) {
      message.error('获取数据失败：' + error.message);
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  return (
    <div style={darkThemeStyles.pageContainer}>
      {/* 背景装饰效果 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        background: `
          radial-gradient(circle at 20% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 60% 40%, rgba(0, 255, 136, 0.06) 0%, transparent 50%)
        `,
        zIndex: -1
      }}></div>

      {/* 网格背景效果 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        zIndex: -1
      }}></div>

      <style>{`
        /* ==========  基础表格样式  ========== */
        .dark-table .ant-table {
          background: linear-gradient(135deg, rgba(10, 25, 41, 0.9), rgba(26, 35, 126, 0.7)) !important;
          color: #fff !important;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
          -moz-box-shadow: none !important;
        }

        /* 强制移除表格容器和相关组件的所有阴影 */
        .dark-table,
        .dark-table *,
        .dark-table .ant-pro-table,
        .dark-table .ant-pro-table *,
        .dark-table .ant-card,
        .dark-table .ant-card-body,
        .dark-table .ant-table-wrapper,
        .dark-table .ant-table-container,
        .dark-table .ant-table-content,
        .dark-table .ant-pro-table-list-toolbar,
        .dark-table .ant-pro-table-list-toolbar-container {
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
          -moz-box-shadow: none !important;
          filter: none !important;
        }

        /* 特别针对可能来自global.less的全局样式覆盖 */
        .dark-table .ant-card,
        .dark-table .ant-pro-card,
        .dark-table .ant-tag {
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
          -moz-box-shadow: none !important;
        }

        /* 更高优先级的阴影移除 */
        div.dark-table,
        div.dark-table .ant-table,
        div.dark-table .ant-table *,
        div.dark-table .ant-pro-table,
        div.dark-table .ant-pro-table * {
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
          -moz-box-shadow: none !important;
        }

        /* 特殊无阴影Card类 */
        .no-shadow-card,
        .no-shadow-card.ant-card,
        .no-shadow-card .ant-card-body,
        .no-shadow-card * {
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
          -moz-box-shadow: none !important;
          filter: none !important;
        }

        /* 仅针对表格数据内容移除阴影，保留分页器等其他组件的发光效果 */
        .dark-table .ant-table-tbody,
        .dark-table .ant-table-tbody tr,
        .dark-table .ant-table-tbody td {
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
          -moz-box-shadow: none !important;
        }

        /* ==========  表头样式  ========== */
        .dark-table .ant-table-thead th {
          background: linear-gradient(135deg, #0f1a2e, #1a2742) !important;
          border-bottom: 2px solid #00d4ff !important;
          color: #00d4ff !important;
          font-weight: 700 !important;
          text-shadow: 0 0 8px rgba(0, 212, 255, 0.8), 0 0 16px rgba(0, 212, 255, 0.6) !important;
        }

        /* ==========  表体通用样式  ========== */
        .dark-table .ant-table-tbody td {
          background: linear-gradient(135deg, rgba(10, 25, 41, 0.9), rgba(26, 35, 126, 0.7)) !important;
          border-bottom: 1px solid rgba(0, 212, 255, 0.15) !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          text-decoration: none !important;
          box-shadow: none !important;
        }

        /* 强制移除所有可能的阴影 */
        .dark-table .ant-table-tbody td *,
        .dark-table .ant-table-tbody td span,
        .dark-table .ant-table-tbody td div,
        .dark-table .ant-table-tbody td .ant-space,
        .dark-table .ant-table-tbody td .ant-badge,
        .dark-table .ant-table-tbody td .anticon,
        .dark-table .ant-table-tbody .ant-tag,
        .dark-table .ant-table-tbody .ant-typography,
        .dark-table .ant-table-tbody .ant-space-item {
          box-shadow: none !important;
          filter: none !important;
          -webkit-box-shadow: none !important;
          -moz-box-shadow: none !important;
        }

        /* 覆盖全局标签样式在表格中的阴影 */
        .dark-table .ant-table-tbody .ant-tag {
          box-shadow: none !important;
        }

        /* ==========  默认列样式（白色）========== */
        .dark-table .ant-table-tbody td:nth-child(1),
        .dark-table .ant-table-tbody td:nth-child(3),
        .dark-table .ant-table-tbody td:nth-child(5) {
          color: #ffffff !important;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.8) !important;
        }

        .dark-table .ant-table-tbody td:nth-child(1) *,
        .dark-table .ant-table-tbody td:nth-child(3) *,
        .dark-table .ant-table-tbody td:nth-child(5) * {
          color: #ffffff !important;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.8) !important;
        }

        /* ==========  特殊列样式  ========== */
        /* 部门车间列（第2列）- 紫色发光 */
        .dark-table .ant-table-tbody td:nth-child(2),
        .dark-table .ant-table-tbody td:nth-child(2) * {
          color: #a855f7 !important;
          text-shadow: 0 0 8px rgba(168, 85, 247, 0.8), 0 0 16px rgba(168, 85, 247, 0.6) !important;
          border-bottom: none !important;
        }

        /* 电能度数列（第4列）- 黄色发光 */
        .dark-table .ant-table-tbody td:nth-child(4),
        .dark-table .ant-table-tbody td:nth-child(4) * {
          color: #ffd700 !important;
          text-shadow: 0 0 8px rgba(255, 215, 0, 0.8), 0 0 16px rgba(255, 215, 0, 0.6) !important;
          border-bottom: none !important;
        }

        /* ==========  悬停效果  ========== */
        .dark-table .ant-table-tbody tr:hover td:nth-child(1),
        .dark-table .ant-table-tbody tr:hover td:nth-child(3),
        .dark-table .ant-table-tbody tr:hover td:nth-child(5) {
          background: linear-gradient(135deg, rgba(10, 25, 41, 1), rgba(26, 35, 126, 0.9)) !important;
        }

        .dark-table .ant-table-tbody tr:hover td:nth-child(2) {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(168, 85, 247, 0.12)) !important;
        }

        .dark-table .ant-table-tbody tr:hover td:nth-child(4) {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.08), rgba(255, 215, 0, 0.12)) !important;
        }
        /* ==========  分页器样式  ========== */
        .dark-table .ant-pagination {
          background: linear-gradient(135deg, rgba(10, 25, 41, 0.9), rgba(26, 35, 126, 0.7)) !important;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid rgba(0, 212, 255, 0.2);
        }

        /* 分页项通用样式 */
        .dark-table .ant-pagination .ant-pagination-item,
        .dark-table .ant-pagination .ant-pagination-prev,
        .dark-table .ant-pagination .ant-pagination-next {
          background: linear-gradient(135deg, rgba(10, 25, 41, 0.9), rgba(26, 35, 126, 0.7)) !important;
          border: 2px solid rgba(0, 212, 255, 0.6) !important;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.3) !important;
          min-width: 32px !important;
          height: 32px !important;
          margin: 0 2px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
        }

        /* 悬停效果 */
        .dark-table .ant-pagination .ant-pagination-item:hover,
        .dark-table .ant-pagination .ant-pagination-prev:hover,
        .dark-table .ant-pagination .ant-pagination-next:hover {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 212, 255, 0.2)) !important;
          border-color: #00d4ff !important;
          box-shadow: 0 0 15px rgba(0, 212, 255, 0.5) !important;
          transform: translateY(-1px) !important;
        }

        /* 激活状态 */
        .dark-table .ant-pagination .ant-pagination-item-active {
          background: linear-gradient(135deg, #00d4ff, #0099cc) !important;
          border: 2px solid #ffffff !important;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.8) !important;
          transform: scale(1.1) !important;
        }

        /* 禁用状态 */
        .dark-table .ant-pagination .ant-pagination-disabled {
          background: linear-gradient(135deg, rgba(10, 25, 41, 0.6), rgba(26, 35, 126, 0.4)) !important;
          border: 2px solid rgba(0, 212, 255, 0.3) !important;
          cursor: not-allowed !important;
          opacity: 0.5 !important;
        }

        /* 文字样式 */
        .dark-table .ant-pagination .ant-pagination-item a,
        .dark-table .ant-pagination .ant-pagination-prev a,
        .dark-table .ant-pagination .ant-pagination-next a {
          color: #00d4ff !important;
          font-weight: 700 !important;
          font-size: 14px !important;
          text-shadow: 0 0 8px rgba(0, 212, 255, 0.8) !important;
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          text-decoration: none !important;
        }

        .dark-table .ant-pagination .ant-pagination-item-active a {
          color: #ffffff !important;
          font-weight: 800 !important;
          text-shadow: 0 0 10px rgba(255, 255, 255, 1) !important;
        }

        .dark-table .ant-pagination .ant-pagination-total-text {
          color: #e6f7ff !important;
          font-weight: 600;
          text-shadow: 0 0 4px rgba(230, 247, 255, 0.4);
        }
        /* ==========  表单组件样式  ========== */
        .dark-table .ant-input,
        .dark-table .ant-select-selector {
          background: rgba(26, 35, 50, 0.8) !important;
          border: 1px solid rgba(64, 169, 255, 0.3) !important;
          color: #fff !important;
        }

        .ant-form-item-label > label {
          color: #fff !important;
        }

        .ant-picker {
          background: rgba(26, 35, 50, 0.8) !important;
          border: 1px solid rgba(64, 169, 255, 0.3) !important;
          color: #fff !important;
        }

        .ant-picker-input input {
          color: #fff !important;
        }

        .ant-picker-suffix {
          color: #40a9ff !important;
        }

        /* ==========  标签样式  ========== */
        .ant-tag {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 212, 255, 0.25)) !important;
          border: 1px solid #00d4ff !important;
          color: #00ffff !important;
          font-weight: 600;
          text-shadow: 0 0 6px rgba(0, 255, 255, 0.5);
          box-shadow: 0 2px 8px rgba(0, 212, 255, 0.2);
          border-radius: 4px;
        }

        .dark-table .ant-table-tbody .ant-tag {
          background: linear-gradient(135deg, #00d4ff, #0099cc) !important;
          border: 1px solid #00ffff !important;
          color: #ffffff !important;
          font-weight: 700;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
          box-shadow: none !important;
        }

        /* ==========  其他组件样式  ========== */
        .ant-empty-description {
          color: #fff !important;
        }

        /* ==========  响应式布局  ========== */

        /* 平板适配 (768px - 1024px) */
        @media (max-width: 1024px) {
          .dark-table .ant-table {
            font-size: 13px !important;
          }

          .dark-table .ant-table-thead th {
            padding: 8px 12px !important;
            font-size: 13px !important;
          }

          .dark-table .ant-table-tbody td {
            padding: 8px 12px !important;
            font-size: 13px !important;
          }

          .dark-table .ant-pagination {
            padding: 12px !important;
          }

          .dark-table .ant-pagination .ant-pagination-item,
          .dark-table .ant-pagination .ant-pagination-prev,
          .dark-table .ant-pagination .ant-pagination-next {
            min-width: 28px !important;
            height: 28px !important;
            font-size: 12px !important;
          }
        }

        /* 手机端适配 (最大宽度 768px) */
        @media (max-width: 768px) {
          /* 搜索表单手机端布局 - 保持一行显示 */
          .time-combo-container {
            width: 100% !important;
            flex-direction: row !important;
            height: 40px !important;
            max-width: 260px !important;
          }

          .time-combo-container input[type="date"] {
            width: 150px !important;
            height: 36px !important;
            flex-shrink: 0 !important;
          }

          .time-combo-container select {
            width: 80px !important;
            height: 36px !important;
            flex-shrink: 0 !important;
          }

          .combo-divider {
            display: block !important;
            width: 1px !important;
            height: 36px !important;
          }

          /* 表格手机端滚动 */
          .dark-table .ant-table-wrapper {
            overflow-x: auto !important;
          }

          .dark-table .ant-table {
            min-width: 600px !important;
            font-size: 12px !important;
          }

          .dark-table .ant-table-thead th {
            padding: 6px 8px !important;
            font-size: 12px !important;
            white-space: nowrap !important;
          }

          .dark-table .ant-table-tbody td {
            padding: 6px 8px !important;
            font-size: 12px !important;
            white-space: nowrap !important;
          }

          /* 分页器手机端适配 */
          .dark-table .ant-pagination {
            padding: 8px !important;
            text-align: center !important;
          }

          .dark-table .ant-pagination .ant-pagination-item,
          .dark-table .ant-pagination .ant-pagination-prev,
          .dark-table .ant-pagination .ant-pagination-next {
            min-width: 24px !important;
            height: 24px !important;
            font-size: 11px !important;
            margin: 0 1px !important;
          }

          .dark-table .ant-pagination .ant-pagination-total-text {
            font-size: 12px !important;
          }

          /* 图表手机端适配 */
          .echarts-container {
            height: 300px !important;
          }

          /* 统计卡片手机端适配 */
          .ant-statistic-content {
            font-size: 16px !important;
          }

          .ant-statistic-title {
            font-size: 12px !important;
          }
        }

        /* 小屏幕手机适配 (最大宽度 480px) */
        @media (max-width: 480px) {
          /* 页面边距调整 */
          .ant-pro-page-container-children-content {
            padding: 12px !important;
          }

          /* 卡片间距调整 */
          .ant-row {
            margin-left: -8px !important;
            margin-right: -8px !important;
          }

          .ant-col {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }

          /* 搜索表单紧凑布局 */
          .time-combo-container input[type="date"],
          .time-combo-container select {
            height: 36px !important;
            padding: 4px 6px !important;
            font-size: 12px !important;
          }

          /* 按钮紧凑布局 */
          .ant-btn {
            height: 36px !important;
            padding: 0 12px !important;
            font-size: 12px !important;
          }

          /* 图表进一步适配 */
          .echarts-container {
            height: 250px !important;
          }

          /* 表格进一步压缩 */
          .dark-table .ant-table {
            min-width: 500px !important;
            font-size: 11px !important;
          }

          .dark-table .ant-table-thead th,
          .dark-table .ant-table-tbody td {
            padding: 4px 6px !important;
            font-size: 11px !important;
          }
        }

      `}</style>
    <PageContainer
      header={{
          title: (<span style={darkThemeStyles.title}>电能数据监控</span>),
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
            />
          )}
          {currentMode === 'day' && (
            <DailyPowerChart
              chartOptions={dailyChartOptions}
              trendData={dailyTrendData}
              isMobile={isMobile()}
              isSmallMobile={isSmallMobile()}
              darkThemeStyles={darkThemeStyles}
            />
          )}
        </>
      )}

      {/* 数据表格 */}
      <DataTable
          columns={columns}
        actionRef={actionRef as any}
        request={tableRequest}
        isMobile={isMobile()}
        darkThemeStyles={darkThemeStyles}
      />
    </PageContainer>
    </div>
  );
};

export default PowerMonitorPage;



