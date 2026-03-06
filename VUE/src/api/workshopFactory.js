import request from './request'

/**
 * 车间 API 工厂函数
 * @param {string} basePath - 车间 API 路径前缀（如 'aircompressor114'、'sintering-105'）
 * @returns {object} 包含该车间所有 API 方法的对象
 */
export function createWorkshopApi(basePath) {
  return {
    /** 获取统计卡片数据 */
    getStatistics(params) {
      return request.get(`/${basePath}/statistics`, { params })
    },

    /** 获取电能趋势数据 */
    getElectricEnergyTrend(params) {
      return request.get(`/${basePath}/electric-energy-trend`, { params })
    },

    /** 获取实时小时能耗数据 */
    getHourlyEnergyConsumption(params) {
      return request.get(`/${basePath}/electric-energy-hourly-consumption`, { params })
    },

    /** 获取历史小时能耗查询数据（时间范围≤31天） */
    getHourlyEnergyConsumptionQuery(params) {
      return request.get(`/${basePath}/electric-energy-hourly-consumption-query`, { params })
    },

    /** 获取历史日能耗查询数据（时间范围≤90天） */
    getDailyEnergyConsumptionQuery(params) {
      return request.get(`/${basePath}/electric-energy-daily-consumption-query`, { params })
    },

    /** 刷新缓存 */
    refreshCache(params) {
      return request.post(`/${basePath}/refresh-cache`, null, { params })
    },

    /** 分页查询设备数据 */
    queryByCondition(body) {
      return request.post(`/${basePath}/query`, body)
    },

    /** 获取电能消耗量（后端计算差值） */
    getEnergyConsumption(params) {
      return request.get(`/${basePath}/electric-energy-consumption`, { params })
    }
  }
}
