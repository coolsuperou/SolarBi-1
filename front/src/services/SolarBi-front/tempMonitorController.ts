// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取最新温湿电能数据 GET /api/temp-monitor/latest */
export async function getLatestDataUsingGET(options?: { [key: string]: any }) {
  return request<API.BaseResponseListTempMonitor_>('/api/temp-monitor/latest', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 按车间查询温湿电能数据 GET /api/temp-monitor/workshop/${param0} */
export async function getDataByWorkshopUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDataByWorkshopUsingGETParams,
  options?: { [key: string]: any }
) {
  const { workshop: param0, ...queryParams } = params;
  return request<API.BaseResponseListTempMonitor_>(`/api/temp-monitor/workshop/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取所有车间列表 GET /api/temp-monitor/workshops */
export async function getAllWorkshopsUsingGET(options?: { [key: string]: any }) {
  return request<API.BaseResponseListString_>('/api/temp-monitor/workshops', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 分页查询温湿电能数据（支持多条件查询） POST /api/temp-monitor/query */
export async function queryByConditionUsingPOST(
  body: API.TempMonitorQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageTempMonitor_>('/api/temp-monitor/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取温湿电能数据统计信息 GET /api/temp-monitor/statistics */
export async function getStatisticsUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: {
    /** 车间名称 */
    workshop?: string;
    /** 开始时间 */
    startTime?: string;
    /** 结束时间 */
    endTime?: string;
  },
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseTempMonitorStatistics_>('/api/temp-monitor/statistics', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取设备数量统计 GET /api/temp-monitor/device-count */
export async function getDeviceCountUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: {
    /** 车间名称 */
    workshop?: string;
    /** 开始时间 */
    startTime?: string;
    /** 结束时间 */
    endTime?: string;
  },
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseInt_>('/api/temp-monitor/device-count', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取电能趋势数据 GET /api/temp-monitor/electric-energy-trend */
export async function getElectricEnergyTrendUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: {
    /** 车间 */
    workshop?: string;
    /** 设备ID */
    deviceId?: string;
    /** 开始时间 */
    startTime?: string;
    /** 结束时间 */
    endTime?: string;
    /** 限制数量 */
    limit?: number;
  },
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListTempMonitor_>('/api/temp-monitor/electric-energy-trend', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取每小时电能消耗数据（默认模式-实时更新） GET /api/temp-monitor/electric-energy-hourly-consumption */
export async function getHourlyEnergyConsumptionUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: {
    /** 车间 */
    workshop?: string;
    /** 设备ID */
    deviceId?: string;
    /** 开始时间 */
    startTime?: string;
    /** 结束时间 */
    endTime?: string;
  },
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListHourlyEnergyConsumption_>('/api/temp-monitor/electric-energy-hourly-consumption', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取每小时电能消耗数据（查询模式-历史数据） GET /api/temp-monitor/electric-energy-hourly-consumption-query */
export async function getHourlyEnergyConsumptionQueryUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: {
    /** 车间 */
    workshop?: string;
    /** 设备ID */
    deviceId?: string;
    /** 开始时间 */
    startTime?: string;
    /** 结束时间 */
    endTime?: string;
  },
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListHourlyEnergyConsumption_>('/api/temp-monitor/electric-energy-hourly-consumption-query', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取每日电能消耗数据（查询模式-历史数据） GET /api/temp-monitor/electric-energy-daily-consumption-query */
export async function getDailyEnergyConsumptionQueryUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: {
    /** 车间 */
    workshop?: string;
    /** 设备ID */
    deviceId?: string;
    /** 开始时间 */
    startTime?: string;
    /** 结束时间 */
    endTime?: string;
  },
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListDailyEnergyConsumption_>('/api/temp-monitor/electric-energy-daily-consumption-query', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 刷新缓存并预加载上个时间段数据 POST /api/temp-monitor/refresh-cache */
export async function postRefreshCacheUsingPOST(
  params?: {
    /** 车间名称 */
    workshop?: string;
  },
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/temp-monitor/refresh-cache', {
    method: 'POST',
    params: {
      ...(params || {}),
    },
    ...(options || {}),
  });
}

