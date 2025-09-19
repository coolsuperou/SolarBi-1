// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取最新温湿电能数据 GET /api/injection-workshop/latest */
export async function getLatestDataUsingGET(options?: { [key: string]: any }) {
  return request<API.BaseResponseListTempMonitor>('/api/injection-workshop/latest', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 按车间查询温湿电能数据 GET /api/injection-workshop/workshop/${param0} */
export async function getDataByWorkshopUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDataByWorkshopUsingGETParams,
  options?: { [key: string]: any },
) {
  const { workshop: param0, ...queryParams } = params;
  return request<API.BaseResponseListTempMonitor>(`/api/injection-workshop/workshop/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取所有车间列表 GET /api/injection-workshop/workshops */
export async function getAllWorkshopsUsingGET(options?: { [key: string]: any }) {
  return request<API.BaseResponseListString>('/api/injection-workshop/workshops', {
    method: 'GET',
    ...(options || {}),
  });
}


/** 分页查询温湿电能数据（支持多条件查询） POST /api/injection-workshop/query */
export async function queryByConditionUsingPOST(
  body: API.TempMonitorQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageTempMonitor>('/api/injection-workshop/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取电能趋势数据（固定110注射环保设备） GET /api/injection-workshop/electric-energy-trend */
export async function getElectricEnergyTrendUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getElectricEnergyTrendUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListTempMonitor>('/api/injection-workshop/electric-energy-trend', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取每小时电能消耗数据（默认模式-实时更新）- 最新小时用最新记录减去开始时间记录 GET /api/injection-workshop/electric-energy-hourly-consumption */
export async function getHourlyEnergyConsumptionUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getHourlyEnergyConsumptionUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListHourlyEnergyConsumption>(
    '/api/injection-workshop/electric-energy-hourly-consumption',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** 获取每小时电能消耗数据（查询模式-历史数据）- 所有小时都用标准逻辑 GET /api/injection-workshop/electric-energy-hourly-consumption-query */
export async function getHourlyEnergyConsumptionQueryUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getHourlyEnergyConsumptionQueryUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListHourlyEnergyConsumption>(
    '/api/injection-workshop/electric-energy-hourly-consumption-query',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** 获取每日电能消耗数据（查询模式-历史数据）- 结束日期以后最新记录减去开始日期以后最新记录 GET /api/injection-workshop/electric-energy-daily-consumption-query */
export async function getDailyEnergyConsumptionQueryUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDailyEnergyConsumptionQueryUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListDailyEnergyConsumption>(
    '/api/injection-workshop/electric-energy-daily-consumption-query',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** 刷新缓存并预加载上个时间段数据 POST /api/injection-workshop/refresh-cache */
export async function refreshCacheUsingPOST(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.refreshCacheUsingPOSTParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean>('/api/injection-workshop/refresh-cache', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取统计数据 GET /api/injection-workshop/statistics */
export async function getStatisticsUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getStatisticsUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseTempMonitorStatistics>('/api/injection-workshop/statistics', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

