import { http } from '@/utils/http'
import type { ApiResponse } from '@/types/user'

// 电能监控相关接口类型定义
export interface TempMonitor {
  id: number
  deviceId: string
  workshop: string
  name: string
  electricEnergy: number
  updateTime: string
}

export interface TempMonitorQueryRequest {
  current?: number
  pageSize?: number
  startTime?: string
  endTime?: string
  workshop?: string
  deviceId?: string
}

export interface Statistics {
  workshop: string
  electricConsumption: number
  totalElectricConsumption: number
}

export interface HourlyEnergyConsumption {
  hour: string
  energyConsumption: number
  startEnergy: number
  endEnergy: number
}

export interface DailyEnergyConsumption {
  day: string
  energyConsumption: number
  startEnergy: number
  endEnergy: number
}

export const powerApi = {
  // 获取最新数据
  getLatestData(): Promise<ApiResponse<TempMonitor[]>> {
    return http.get('/api/temp-monitor/latest')
  },

  // 根据车间获取数据
  getDataByWorkshop(params: { workshop: string }): Promise<ApiResponse<TempMonitor[]>> {
    return http.get('/api/temp-monitor/workshop', { params })
  },

  // 获取所有车间列表
  getAllWorkshops(): Promise<ApiResponse<string[]>> {
    return http.get('/api/temp-monitor/workshops')
  },

  // 条件查询
  queryByCondition(data: TempMonitorQueryRequest): Promise<ApiResponse<{
    records: TempMonitor[]
    total: number
    current: number
    pageSize: number
  }>> {
    return http.post('/api/temp-monitor/query', data)
  },

  // 获取统计数据
  getStatistics(params?: {
    workshop?: string
    startTime?: string
    endTime?: string
  }): Promise<ApiResponse<Statistics>> {
    return http.get('/api/temp-monitor/statistics', { params })
  },

  // 获取电能趋势数据
  getElectricEnergyTrend(params: {
    workshop: string
    startTime?: string
    endTime?: string
    limit?: number
  }): Promise<ApiResponse<TempMonitor[]>> {
    return http.get('/api/temp-monitor/electric-energy-trend', { params })
  },

  // 获取每小时电能消耗数据
  getHourlyEnergyConsumption(params: {
    workshop: string
    deviceId?: string
    startTime?: string
    endTime?: string
  }): Promise<ApiResponse<HourlyEnergyConsumption[]>> {
    return http.get('/api/temp-monitor/electric-energy-hourly-consumption', { params })
  },

  // 获取每小时电能消耗查询数据
  getHourlyEnergyConsumptionQuery(params: {
    workshop: string
    deviceId?: string
    startTime?: string
    endTime?: string
  }): Promise<ApiResponse<HourlyEnergyConsumption[]>> {
    return http.get('/api/temp-monitor/electric-energy-hourly-consumption-query', { params })
  },

  // 获取每日电能消耗查询数据
  getDailyEnergyConsumptionQuery(params: {
    workshop: string
    startTime?: string
    endTime?: string
  }): Promise<ApiResponse<DailyEnergyConsumption[]>> {
    return http.get('/api/temp-monitor/electric-energy-daily-consumption-query', { params })
  }
}
