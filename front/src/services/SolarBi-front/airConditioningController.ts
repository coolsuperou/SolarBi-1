// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取最新温湿电能数据（114_空调水机主机） GET /api/air-conditioning/latest */
export async function getLatestDataUsingGET(options?: { [key: string]: any }) {
  return request<API.BaseResponseListTempMonitor>('/api/air-conditioning/latest', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 按车间查询温湿电能数据（114_空调水机主机） GET /api/air-conditioning/workshop/${param0} */
export async function getDataByWorkshopUsingGET(
  params: API.getDataByWorkshopUsingGETParams,
  options?: { [key: string]: any },
) {
  const { workshop: param0, ...queryParams } = params;
  return request<API.BaseResponseListTempMonitor>(`/api/air-conditioning/workshop/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取所有车间列表（114_空调水机主机） GET /api/air-conditioning/workshops */
export async function getAllWorkshopsUsingGET(options?: { [key: string]: any }) {
  return request<API.BaseResponseListString>('/api/air-conditioning/workshops', {
    method: 'GET',
    ...(options || {}),
  });
}



/** 分页查询温湿电能数据（114_空调水机主机，支持多条件查询） POST /api/air-conditioning/query */
export async function queryByConditionUsingPOST(
  body: API.TempMonitorQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageTempMonitor>('/api/air-conditioning/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取统计信息（114_空调水机主机） GET /api/air-conditioning/statistics */
export async function getStatisticsUsingGET(
  params: API.getStatisticsUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseTempMonitorStatistics>('/api/air-conditioning/statistics', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取电能趋势数据（114_空调水机主机） GET /api/air-conditioning/electric-energy-trend */
export async function getElectricEnergyTrendUsingGET(
  params: API.getElectricEnergyTrendUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListTempMonitor>('/api/air-conditioning/electric-energy-trend', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取每小时电能消耗数据（114_空调水机主机，默认模式-实时更新） GET /api/air-conditioning/electric-energy-hourly-consumption */
export async function getHourlyEnergyConsumptionUsingGET(
  params: API.getHourlyEnergyConsumptionUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListHourlyEnergyConsumption>(
    '/api/air-conditioning/electric-energy-hourly-consumption',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** 获取每小时电能消耗数据（114_空调水机主机，查询模式-历史数据） GET /api/air-conditioning/electric-energy-hourly-consumption-query */
export async function getHourlyEnergyConsumptionQueryUsingGET(
  params: API.getHourlyEnergyConsumptionQueryUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListHourlyEnergyConsumption>(
    '/api/air-conditioning/electric-energy-hourly-consumption-query',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** 获取每日电能消耗数据（114_空调水机主机，查询模式-历史数据） GET /api/air-conditioning/electric-energy-daily-consumption-query */
export async function getDailyEnergyConsumptionQueryUsingGET(
  params: API.getDailyEnergyConsumptionQueryUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListDailyEnergyConsumption>(
    '/api/air-conditioning/electric-energy-daily-consumption-query',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** 刷新缓存并预加载上个时间段数据（114_空调水机主机） POST /api/air-conditioning/refresh-cache */
export async function refreshCacheUsingPOST(
  params: API.refreshCacheUsingPOSTParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean>('/api/air-conditioning/refresh-cache', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

