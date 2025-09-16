import { http } from '@/utils/http';
export const powerApi = {
    // 获取最新温湿电能数据
    getLatestData() {
        return http.get('/api/temp-monitor/latest');
    },
    // 按车间查询温湿电能数据
    getDataByWorkshop(workshop) {
        return http.get(`/api/temp-monitor/workshop/${workshop}`);
    },
    // 获取所有车间列表
    getAllWorkshops() {
        return http.get('/api/temp-monitor/workshops');
    },
    // 根据设备ID查询温湿电能数据
    getDataByDeviceId(deviceId) {
        return http.get(`/api/temp-monitor/device/${deviceId}`);
    },
    // 分页查询温湿电能数据（支持多条件查询）
    queryByCondition(request) {
        return http.post('/api/temp-monitor/query', request);
    },
    // 获取电能趋势数据（固定114_空调水机主机）
    getElectricEnergyTrend(params) {
        return http.get('/api/temp-monitor/electric-energy-trend', { params });
    },
    // 获取每小时电能消耗数据（默认模式-实时更新）
    getHourlyEnergyConsumption(params) {
        return http.get('/api/temp-monitor/electric-energy-hourly-consumption', { params });
    },
    // 获取每小时电能消耗数据（查询模式-历史数据）
    getHourlyEnergyConsumptionQuery(params) {
        return http.get('/api/temp-monitor/electric-energy-hourly-consumption-query', { params });
    },
    // 获取每日电能消耗数据（查询模式-历史数据）
    getDailyEnergyConsumptionQuery(params) {
        return http.get('/api/temp-monitor/electric-energy-daily-consumption-query', { params });
    },
    // 刷新缓存并预加载上个时间段数据
    refreshCache(workshop) {
        return http.post('/api/temp-monitor/refresh-cache', null, {
            params: { workshop }
        });
    }
};
// 类型已通过interface关键字导出，无需重复导出
