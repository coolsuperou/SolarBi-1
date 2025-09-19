// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取最新温湿电能数据 GET /api/office-building/latest */
export async function getLatestDataUsingGET(options?: { [key: string]: any }) {
  return request<API.BaseResponseListTempMonitor>('/api/office-building/latest', {
    method: 'GET',
    ...(options || {}),
  });
}


/** 获取所有车间列表 GET /api/office-building/workshops */
export async function getAllWorkshopsUsingGET(options?: { [key: string]: any }) {
  return request<API.BaseResponseListString>('/api/office-building/workshops', {
    method: 'GET',
    ...(options || {}),
  });
}



/** 获取统计信息 GET /api/office-building/statistics */
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
  return request<API.BaseResponseTempMonitorStatistics>('/api/office-building/statistics', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取电能趋势数据 GET /api/office-building/electric-energy-trend */
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
  return request<API.BaseResponseListTempMonitor>('/api/office-building/electric-energy-trend', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取每小时电能消耗数据（默认模式-实时更新） GET /api/office-building/electric-energy-hourly-consumption */
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
  return request<API.BaseResponseListHourlyEnergyConsumption>('/api/office-building/electric-energy-hourly-consumption', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取每小时电能消耗数据（查询模式-历史数据） GET /api/office-building/electric-energy-hourly-consumption-query */
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
  return request<API.BaseResponseListHourlyEnergyConsumption>('/api/office-building/electric-energy-hourly-consumption-query', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取每日电能消耗数据（查询模式-历史数据） GET /api/office-building/electric-energy-daily-consumption-query */
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
  return request<API.BaseResponseListDailyEnergyConsumption>('/api/office-building/electric-energy-daily-consumption-query', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 刷新缓存并预加载上个时间段数据 POST /api/office-building/refresh-cache */
export async function refreshCacheUsingPOST(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: {
    /** 车间名称，可为空，默认1#办公楼 */
    workshop?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean>('/api/office-building/refresh-cache', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
