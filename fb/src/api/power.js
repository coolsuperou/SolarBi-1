import api from './client';

// 电能监控相关 API
export const powerApi = {
  // 统计信息
  getStatistics(params) {
    return api.get('/temp-monitor/statistics', { params });
  },
  // 设备总数
  getDeviceCount(params) {
    return api.get('/temp-monitor/device-count', { params });
  },
  // 每小时用电量（默认实时）
  getHourly(params) {
    return api.get('/temp-monitor/electric-energy-hourly-consumption', { params });
  },

  // 每小时用电量（历史查询）
  getHourlyQuery(params) {
    return api.get('/temp-monitor/electric-energy-hourly-consumption-query', { params });
  },

  // 每日用电量（历史查询）
  getDailyQuery(params) {
    return api.get('/temp-monitor/electric-energy-daily-consumption-query', { params });
  },

  // 数据详情（分页/条件查询）
  queryDetail(body) {
    return api.post('/temp-monitor/query', body);
  },
};

export default powerApi;


