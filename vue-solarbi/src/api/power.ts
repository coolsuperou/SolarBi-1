import { http } from '@/utils/http'

// 基础响应接口
export interface BaseResponse<T = any> {
  code: number
  data: T
  message: string
}

// 电能监控实体类型（对应后端TempMonitor）
export interface TempMonitor {
  id: number
  deviceId: string
  name: string
  tem: number
  hum: number
  mac: string
  updateTime: string
  electricEnergy: number
  nodeId: number
  workshop: string
}

// 分页查询请求（对应后端TempMonitorQueryRequest）
export interface TempMonitorQueryRequest {
  current: number
  pageSize: number
  startTime?: string
  endTime?: string
  workshop?: string
  deviceId?: string
  name?: string
  sortField?: string
  sortOrder?: string
}

// 分页响应（对应后端Page<TempMonitor>）
export interface PageResponse<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
  countId?: string
  maxLimit?: number
  optimizeCountSql?: boolean
  searchCount?: boolean
  orders?: Array<{
    column: string
    asc: boolean
  }>
}

// 小时电能消耗（对应后端HourlyEnergyConsumption）
export interface HourlyEnergyConsumption {
  deviceId: string
  hour: string
  startTime: string
  endTime: string
  startEnergy: number
  endEnergy: number
  energyConsumption: number
  name: string
  workshop: string
}

// 日电能消耗（对应后端DailyEnergyConsumption）
export interface DailyEnergyConsumption {
  deviceId: string
  day: string
  startTime: string
  endTime: string
  startEnergy: number
  endEnergy: number
  energyConsumption: number
  name: string
  workshop: string
}

// 统计数据（对应后端TempMonitorStatistics）
export interface TempMonitorStatistics {
  avgTemperature: number
  minTemperature: number
  maxTemperature: number
  avgHumidity: number
  minHumidity: number
  maxHumidity: number
  totalElectricEnergy: number
  avgElectricEnergy: number
  minElectricEnergy: number
  maxElectricEnergy: number
  deviceCount: number
}

export const powerApi = {
  // 获取最新温湿电能数据
  getLatestData(): Promise<BaseResponse<TempMonitor[]>> {
    return http.get('/api/temp-monitor/latest')
  },

  // 按车间查询温湿电能数据
  getDataByWorkshop(workshop: string): Promise<BaseResponse<TempMonitor[]>> {
    return http.get(`/api/temp-monitor/workshop/${workshop}`)
  },

  // 获取所有车间列表
  getAllWorkshops(): Promise<BaseResponse<string[]>> {
    return http.get('/api/temp-monitor/workshops')
  },

  // 根据设备ID查询温湿电能数据
  getDataByDeviceId(deviceId: string): Promise<BaseResponse<TempMonitor[]>> {
    return http.get(`/api/temp-monitor/device/${deviceId}`)
  },

  // 分页查询温湿电能数据（支持多条件查询）
  queryByCondition(request: TempMonitorQueryRequest): Promise<BaseResponse<PageResponse<TempMonitor>>> {
    return http.post('/api/temp-monitor/query', request)
  },

  // 获取电能趋势数据（固定114_空调水机主机）
  getElectricEnergyTrend(params: {
    workshop?: string
    deviceId?: string
    startTime?: string
    endTime?: string
    limit?: number
  }): Promise<BaseResponse<TempMonitor[]>> {
    return http.get('/api/temp-monitor/electric-energy-trend', { params })
  },

  // 获取每小时电能消耗数据（默认模式-实时更新）
  getHourlyEnergyConsumption(params: {
    workshop?: string
    deviceId?: string
    startTime?: string
    endTime?: string
  }): Promise<BaseResponse<HourlyEnergyConsumption[]>> {
    return http.get('/api/temp-monitor/electric-energy-hourly-consumption', { params })
  },

  // 获取每小时电能消耗数据（查询模式-历史数据）
  getHourlyEnergyConsumptionQuery(params: {
    workshop?: string
    deviceId?: string
    startTime?: string
    endTime?: string
  }): Promise<BaseResponse<HourlyEnergyConsumption[]>> {
    return http.get('/api/temp-monitor/electric-energy-hourly-consumption-query', { params })
  },

  // 获取每日电能消耗数据（查询模式-历史数据）
  getDailyEnergyConsumptionQuery(params: {
    workshop?: string
    deviceId?: string
    startTime?: string
    endTime?: string
  }): Promise<BaseResponse<DailyEnergyConsumption[]>> {
    return http.get('/api/temp-monitor/electric-energy-daily-consumption-query', { params })
  },

  // 刷新缓存并预加载上个时间段数据
  refreshCache(workshop?: string): Promise<BaseResponse<boolean>> {
    return http.post('/api/temp-monitor/refresh-cache', null, { 
      params: { workshop } 
    })
  }
}

// 类型已通过interface关键字导出，无需重复导出