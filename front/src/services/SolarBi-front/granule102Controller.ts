// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取最新温湿电能数据（102造粒） GET /granule102/latest */
export async function getLatestDataUsingGET(options?: { [key: string]: any }) {
  return request<API.BaseResponseListTempMonitor_>('/api/granule102/latest', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 按车间查询温湿电能数据（102造粒） GET /granule102/workshop/${param0} */
export async function getDataByWorkshopUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDataByWorkshopUsingGETParams,
  options?: { [key: string]: any },
) {
  const { workshop: param0, ...queryParams } = params;
  return request<API.BaseResponseListTempMonitor_>(`/api/granule102/workshop/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取所有车间列表（102造粒） GET /granule102/workshops */
export async function getAllWorkshopsUsingGET(options?: { [key: string]: any }) {
  return request<API.BaseResponseListString_>('/api/granule102/workshops', {
    method: 'GET',
    ...(options || {}),
  });
}



/** 分页查询温湿电能数据（102造粒，支持多条件查询） POST /granule102/query */
export async function queryByConditionUsingPOST(
  body: API.TempMonitorQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageTempMonitor_>('/api/granule102/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取统计信息（102造粒） GET /granule102/statistics */
export async function getStatisticsUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getStatisticsUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseTempMonitorStatistics_>('/api/granule102/statistics', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取电能趋势数据（102造粒） GET /granule102/electric-energy-trend */
export async function getElectricEnergyTrendUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getElectricEnergyTrendUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListTempMonitor_>('/api/granule102/electric-energy-trend', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取每小时电能消耗数据（102造粒，默认模式-实时更新） GET /granule102/electric-energy-hourly-consumption */
export async function getHourlyEnergyConsumptionUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getHourlyEnergyConsumptionUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListHourlyEnergyConsumption_>('/api/granule102/electric-energy-hourly-consumption', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取每小时电能消耗数据（102造粒，查询模式-历史数据） GET /granule102/electric-energy-hourly-consumption-query */
export async function getHourlyEnergyConsumptionQueryUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getHourlyEnergyConsumptionQueryUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListHourlyEnergyConsumption_>('/api/granule102/electric-energy-hourly-consumption-query', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取每日电能消耗数据（102造粒，查询模式-历史数据） GET /granule102/electric-energy-daily-consumption-query */
export async function getDailyEnergyConsumptionQueryUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDailyEnergyConsumptionQueryUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListDailyEnergyConsumption_>('/api/granule102/electric-energy-daily-consumption-query', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 刷新缓存并预加载上个时间段数据（102造粒） POST /granule102/refresh-cache */
export async function refreshCacheUsingPOST(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.refreshCacheUsingPOSTParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/granule102/refresh-cache', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
