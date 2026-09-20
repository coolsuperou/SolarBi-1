// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';





/** 总电能消耗卡片 GET /api/cold-press-103/statistics */
export async function getStatisticsUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: {
    /** 结束时间 */
    endTime?: string;
    /** 开始时间 */
    startTime?: string;
    /** 车间 */
    workshop?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseTempMonitorStatistics>('/api/cold-press-103/statistics', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取电能趋势数据 GET /api/cold-press-103/electric-energy-trend */
export async function getElectricEnergyTrendUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: {
    /** 设备ID */
    deviceId?: string;
    /** 结束时间 */
    endTime?: string;
    /** 限制数量 */
    limit?: number;
    /** 开始时间 */
    startTime?: string;
    /** 车间 */
    workshop?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListTempMonitor>('/api/cold-press-103/electric-energy-trend', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取每小时电能消耗数据（默认模式-实时更新） GET /api/cold-press-103/electric-energy-hourly-consumption */
export async function getHourlyEnergyConsumptionUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: {
    /** 设备ID */
    deviceId?: string;
    /** 结束时间 */
    endTime?: string;
    /** 开始时间 */
    startTime?: string;
    /** 车间 */
    workshop?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListHourlyEnergyConsumption>('/api/cold-press-103/electric-energy-hourly-consumption', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取每小时电能消耗数据（查询模式-历史数据） GET /api/cold-press-103/electric-energy-hourly-consumption-query */
export async function getHourlyEnergyConsumptionQueryUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: {
    /** 设备ID */
    deviceId?: string;
    /** 结束时间 */
    endTime?: string;
    /** 开始时间 */
    startTime?: string;
    /** 车间 */
    workshop?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListHourlyEnergyConsumption>('/api/cold-press-103/electric-energy-hourly-consumption-query', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取每日电能消耗数据（查询模式-历史数据） GET /api/cold-press-103/electric-energy-daily-consumption-query */
export async function getDailyEnergyConsumptionQueryUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: {
    /** 设备ID */
    deviceId?: string;
    /** 结束时间 */
    endTime?: string;
    /** 开始时间 */
    startTime?: string;
    /** 车间 */
    workshop?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListDailyEnergyConsumption>('/api/cold-press-103/electric-energy-daily-consumption-query', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 刷新缓存并预加载上个时间段数据 POST /api/cold-press-103/refresh-cache */
export async function refreshCacheUsingPOST(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: {
    /** 车间名称，可为空，默认103冷压 */
    workshop?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean>('/api/cold-press-103/refresh-cache', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}










/** 分页查询温湿电能数据（103冷压，支持多条件查询） POST /api/cold-press-103/query */
export async function queryByConditionUsingPOST(
  body: API.TempMonitorQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageTempMonitor>('/api/cold-press-103/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}


/** 获取电能消耗量（103冷压，后端计算差值） GET /api/cold-press-103/electric-energy-consumption */
export async function getEnergyConsumptionUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: {
    /** 开始时间 */
    startTime?: string;
    /** 结束时间 */
    endTime?: string;
    /** 模式：hour/day */
    mode?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseDouble>('/api/cold-press-103/electric-energy-consumption', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
