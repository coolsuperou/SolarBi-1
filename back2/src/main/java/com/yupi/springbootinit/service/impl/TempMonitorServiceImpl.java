package com.yupi.springbootinit.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.mapper.sqlserver.TempMonitorMapper;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorQueryRequest;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import com.yupi.springbootinit.service.TempMonitorService;
import com.yupi.springbootinit.service.cache.RedisNamespaceService;
import org.springframework.data.redis.core.StringRedisTemplate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Date;
import java.util.List;

/**
 * 温湿电能监控数据服务实现
 * 使用SQL Server数据源 + MyBatis
 * 增加缓存支持，与前端刷新频率保持一致：
 * - 图表数据每10分钟刷新（通过定时任务预加载）
 * - 表格数据每10分钟刷新
 * 参考 CSDN 博客标准实现：https://blog.csdn.net/weixin_44563573/article/details/115630791
 * 
 * @author yupi
 */
@Service
@Slf4j
public class TempMonitorServiceImpl implements TempMonitorService {

    @Autowired
    private TempMonitorMapper tempMonitorMapper;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private RedisNamespaceService namespaceService;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    @Cacheable(cacheNames = com.yupi.springbootinit.config.CacheConfig.CACHE_LATEST_DATA)
    public List<TempMonitor> getLatestData() {
        // 改为从 Redis 快照读取
        String key = namespaceService.buildActiveKey("tempMonitor:h:latestByDevice");
        java.util.Map<Object, Object> map = stringRedisTemplate.opsForHash().entries(key);
        java.util.List<TempMonitor> list = new java.util.ArrayList<>();
        com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
        for (Object v : map.values()) {
            try {
                list.add(om.readValue((String) v, TempMonitor.class));
            } catch (Exception ignore) { }
        }
        list.sort(java.util.Comparator.comparing(TempMonitor::getUpdateTime).reversed());
        return list;
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    @Cacheable(cacheNames = com.yupi.springbootinit.config.CacheConfig.CACHE_BY_WORKSHOP, key = "#workshop == null ? 'ALL' : #workshop")
    public List<TempMonitor> getDataByWorkshop(String workshop) {
        String ws = (workshop == null || workshop.isEmpty()) ? "114_空调水机主机" : workshop;
        String devicesKey = namespaceService.buildActiveKey("tempMonitor:s:devices:byWorkshop:" + ws);
        java.util.Set<String> deviceIds = stringRedisTemplate.opsForSet().members(devicesKey);
        if (deviceIds == null || deviceIds.isEmpty()) return java.util.Collections.emptyList();
        String latestKey = namespaceService.buildActiveKey("tempMonitor:h:latestByDevice");
        java.util.List<Object> fields = new java.util.ArrayList<>(deviceIds);
        java.util.List<Object> vals = stringRedisTemplate.opsForHash().multiGet(latestKey, fields);
        java.util.List<TempMonitor> list = new java.util.ArrayList<>();
        com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
        for (Object v : vals) {
            if (v == null) continue;
            try { list.add(om.readValue((String) v, TempMonitor.class)); } catch (Exception ignore) { }
        }
        list.sort(java.util.Comparator.comparing(TempMonitor::getUpdateTime).reversed());
        return list;
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    @Cacheable(cacheNames = com.yupi.springbootinit.config.CacheConfig.CACHE_WORKSHOPS)
    public List<String> getAllWorkshops() {
        String key = namespaceService.buildActiveKey("tempMonitor:s:workshops");
        java.util.Set<String> s = stringRedisTemplate.opsForSet().members(key);
        return s == null ? java.util.Collections.emptyList() : new java.util.ArrayList<>(s);
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    @Cacheable(cacheNames = com.yupi.springbootinit.config.CacheConfig.CACHE_BY_DEVICE, key = "#deviceId")
    public List<TempMonitor> getDataByDeviceId(String deviceId) {
        if (deviceId == null || deviceId.isEmpty()) return java.util.Collections.emptyList();
        String latestKey = namespaceService.buildActiveKey("tempMonitor:h:latestByDevice");
        Object v = stringRedisTemplate.opsForHash().get(latestKey, deviceId);
        if (v == null) return java.util.Collections.emptyList();
        java.util.List<TempMonitor> list = new java.util.ArrayList<>(1);
        try {
            list.add(new com.fasterxml.jackson.databind.ObjectMapper().readValue((String) v, TempMonitor.class));
        } catch (Exception ignore) { }
        return list;
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    @Cacheable(
            cacheNames = com.yupi.springbootinit.config.CacheConfig.CACHE_QUERY_PAGE,
            key = "(#request.deviceId == null ? 'ALL' : #request.deviceId) + ':' + (#request.name == null ? 'ALL' : #request.name) + ':' + (#request.workshop == null ? 'ALL' : #request.workshop) + ':' + (#request.startTime == null ? 'null' : #request.startTime.time) + ':' + (#request.endTime == null ? 'null' : #request.endTime.time) + ':' + (#request.sortField == null ? 'null' : #request.sortField) + ':' + (#request.sortOrder == null ? 'null' : #request.sortOrder) + ':' + #request.current + ':' + #request.pageSize"
    )
    public Page<TempMonitor> queryByCondition(TempMonitorQueryRequest request) {
        long current = request.getCurrent() > 0 ? request.getCurrent() : 1;
        long size = request.getPageSize() > 0 ? request.getPageSize() : 20;
        String workshop = request.getWorkshop() == null || request.getWorkshop().isEmpty() ? "114_空调水机主机" : request.getWorkshop();

        String key = namespaceService.buildActiveKey("tempMonitor:z:byWorkshop:" + workshop);
        double min = request.getStartTime() == null ? Double.NEGATIVE_INFINITY : request.getStartTime().getTime();
        double max = request.getEndTime() == null ? Double.POSITIVE_INFINITY : request.getEndTime().getTime();
        java.util.Set<String> jsons = stringRedisTemplate.opsForZSet().rangeByScore(key, min, max);
        java.util.List<TempMonitor> all = new java.util.ArrayList<>();
        com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
        if (jsons != null) {
            for (String j : jsons) {
                try { all.add(om.readValue(j, TempMonitor.class)); } catch (Exception ignore) { }
            }
        }
        if (request.getDeviceId() != null && !request.getDeviceId().isEmpty()) {
            all.removeIf(r -> !request.getDeviceId().equals(r.getDeviceId()));
        }
        if (request.getName() != null && !request.getName().isEmpty()) {
            String nameLike = request.getName();
            all.removeIf(r -> r.getName() == null || !r.getName().contains(nameLike));
        }
        java.util.Comparator<TempMonitor> cmp = java.util.Comparator.comparing(TempMonitor::getUpdateTime);
        if (request.getSortOrder() == null || request.getSortOrder().equalsIgnoreCase("descend")) {
            cmp = cmp.reversed();
        }
        all.sort(cmp);

        long total = all.size();
        int from = (int) ((current - 1) * size);
        int to = (int) Math.min(from + size, total);
        java.util.List<TempMonitor> pageRecords = from >= to || from >= total ? java.util.Collections.emptyList() : all.subList(from, to);

        Page<TempMonitor> page = new Page<>(current, size);
        page.setTotal(total);
        page.setRecords(pageRecords);
        return page;
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    @Cacheable(
            cacheNames = com.yupi.springbootinit.config.CacheConfig.CACHE_STATISTICS,
            key = "(#workshop == null ? 'ALL' : #workshop) + ':' + (#startTime == null ? 'null' : #startTime.time) + ':' + (#endTime == null ? 'null' : #endTime.time)"
    )
    public TempMonitorStatistics getStatistics(String workshop, Date startTime, Date endTime) {
        TempMonitorStatistics statistics = tempMonitorMapper.getStatistics(workshop, startTime, endTime);
        // 获取设备数量
        Integer deviceCount = tempMonitorMapper.countDevices(workshop, startTime, endTime);
        statistics.setTotalDevices(deviceCount != null ? deviceCount : 0);
        
        return statistics;
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public Integer getDeviceCount(String workshop, Date startTime, Date endTime) {
        Integer count = tempMonitorMapper.countDevices(workshop, startTime, endTime);
        return count != null ? count : 0;
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    @Cacheable(
            cacheNames = com.yupi.springbootinit.config.CacheConfig.CACHE_TREND,
            key = "(#workshop == null ? '114_空调水机主机' : #workshop) + ':' + (#deviceId == null ? 'ALL' : #deviceId) + ':' + (#startTime == null ? 'null' : #startTime.time) + ':' + (#endTime == null ? 'null' : #endTime.time) + ':' + (#limit == null ? 'ALL' : #limit)"
    )
    public List<TempMonitor> getElectricEnergyTrend(String workshop, String deviceId, Date startTime, Date endTime, Integer limit) {
        String fixedWorkshop = "114_空调水机主机";
        String zkey = (deviceId != null && !deviceId.isEmpty())
                ? namespaceService.buildActiveKey("tempMonitor:z:byDevice:" + deviceId)
                : namespaceService.buildActiveKey("tempMonitor:z:byWorkshop:" + fixedWorkshop);
        double min = startTime == null ? Double.NEGATIVE_INFINITY : startTime.getTime();
        double max = endTime == null ? Double.POSITIVE_INFINITY : endTime.getTime();
        java.util.Set<String> jsons = stringRedisTemplate.opsForZSet().rangeByScore(zkey, min, max);
        java.util.List<TempMonitor> list = new java.util.ArrayList<>();
        com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
        if (jsons != null) {
            for (String j : jsons) {
                try { list.add(om.readValue(j, TempMonitor.class)); } catch (Exception ignore) { }
            }
        }
        list.sort(java.util.Comparator.comparing(TempMonitor::getUpdateTime));
        if (limit != null && limit > 0 && list.size() > limit) {
            return list.subList(list.size() - limit, list.size());
        }
        return list;
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    @Cacheable(
            cacheNames = com.yupi.springbootinit.config.CacheConfig.CACHE_HOURLY_CONS,
            key = "(#workshop == null ? '114_空调水机主机' : #workshop) + ':' + (#deviceId == null ? 'ALL' : #deviceId) + ':' + (#startTime == null ? 'null' : #startTime.time) + ':' + (#endTime == null ? 'null' : #endTime.time)"
    )
    public List<HourlyEnergyConsumption> getHourlyEnergyConsumption(String workshop, String deviceId, Date startTime, Date endTime) {
        String fixedWorkshop = "114_空调水机主机";
        java.util.Date end = endTime != null ? endTime : new java.util.Date();
        java.util.Date start = startTime != null ? startTime : new java.util.Date(end.getTime() - 24L * 3600_000);
        java.util.List<java.util.Date> hours = buildHourlyBoundaries(start, end);

        java.util.Set<String> deviceIds = stringRedisTemplate.opsForSet().members(
                namespaceService.buildActiveKey("tempMonitor:s:devices:byWorkshop:" + fixedWorkshop));
        if (deviceIds == null) deviceIds = java.util.Collections.emptySet();

        java.util.List<HourlyEnergyConsumption> out = new java.util.ArrayList<>();
        for (String did : deviceIds) {
            for (int i = 0; i < hours.size(); i++) {
                java.util.Date hStart = hours.get(i);
                java.util.Date hEnd = new java.util.Date(hStart.getTime() + 3600_000);
                Double startEnergy = firstEnergyAfterOrAt(did, hStart.getTime());
                Double endEnergy;
                if (i == hours.size() - 1) {
                    endEnergy = latestEnergyBeforeOrAt(did, hEnd.getTime());
                    if (endEnergy == null) {
                        endEnergy = firstEnergyAfterOrAt(did, hEnd.getTime());
                    }
                } else {
                    endEnergy = firstEnergyAfterOrAt(did, hEnd.getTime());
                }
                if (startEnergy == null || endEnergy == null) continue;
                if (endEnergy < startEnergy) continue;
                HourlyEnergyConsumption rec = new HourlyEnergyConsumption();
                rec.setDeviceId(did);
                rec.setWorkshop(fixedWorkshop);
                rec.setHour(hStart);
                rec.setStartEnergy(startEnergy);
                rec.setEndEnergy(endEnergy);
                rec.setEnergyConsumption(endEnergy - startEnergy);
                rec.setStartTime(hStart);
                rec.setEndTime(hEnd);
                out.add(rec);
            }
        }
        out.sort(java.util.Comparator.comparing(HourlyEnergyConsumption::getHour));
        return out;
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    @Cacheable(
            cacheNames = com.yupi.springbootinit.config.CacheConfig.CACHE_HOURLY_CONS_QUERY,
            key = "(#workshop == null ? '114_空调水机主机' : #workshop) + ':' + (#deviceId == null ? 'ALL' : #deviceId) + ':' + (#startTime == null ? 'null' : #startTime.time) + ':' + (#endTime == null ? 'null' : #endTime.time)"
    )
    public List<HourlyEnergyConsumption> getHourlyEnergyConsumptionQuery(String workshop, String deviceId, Date startTime, Date endTime) {
        String fixedWorkshop = "114_空调水机主机";
        if (startTime == null || endTime == null || !endTime.after(startTime)) {
            return java.util.Collections.emptyList();
        }
        java.util.List<java.util.Date> hours = buildHourlyBoundaries(startTime, endTime);
        java.util.Set<String> deviceIds = stringRedisTemplate.opsForSet().members(
                namespaceService.buildActiveKey("tempMonitor:s:devices:byWorkshop:" + fixedWorkshop));
        if (deviceIds == null) deviceIds = java.util.Collections.emptySet();
        java.util.List<HourlyEnergyConsumption> out = new java.util.ArrayList<>();
        for (String did : deviceIds) {
            for (java.util.Date hStart : hours) {
                java.util.Date hEnd = new java.util.Date(hStart.getTime() + 3600_000);
                Double startEnergy = firstEnergyAfterOrAt(did, hStart.getTime());
                Double endEnergy = firstEnergyAfterOrAt(did, hEnd.getTime());
                if (startEnergy == null || endEnergy == null) continue;
                if (endEnergy < startEnergy) continue;
                HourlyEnergyConsumption rec = new HourlyEnergyConsumption();
                rec.setDeviceId(did);
                rec.setWorkshop(fixedWorkshop);
                rec.setHour(hStart);
                rec.setStartEnergy(startEnergy);
                rec.setEndEnergy(endEnergy);
                rec.setEnergyConsumption(endEnergy - startEnergy);
                rec.setStartTime(hStart);
                rec.setEndTime(hEnd);
                out.add(rec);
            }
        }
        out.sort(java.util.Comparator.comparing(HourlyEnergyConsumption::getHour));
        return out;
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    @Cacheable(
            cacheNames = com.yupi.springbootinit.config.CacheConfig.CACHE_DAILY_CONS_QUERY,
            key = "(#workshop == null ? '114_空调水机主机' : #workshop) + ':' + (#deviceId == null ? 'ALL' : #deviceId) + ':' + (#startTime == null ? 'null' : #startTime.time) + ':' + (#endTime == null ? 'null' : #endTime.time)"
    )
    public List<DailyEnergyConsumption> getDailyEnergyConsumptionQuery(String workshop, String deviceId, Date startTime, Date endTime) {
        String fixedWorkshop = "114_空调水机主机";
        if (startTime == null || endTime == null || !endTime.after(startTime)) {
            return java.util.Collections.emptyList();
        }
        java.util.List<java.util.Date> days = buildDailyBoundaries(startTime, endTime);
        java.util.Set<String> deviceIds = stringRedisTemplate.opsForSet().members(
                namespaceService.buildActiveKey("tempMonitor:s:devices:byWorkshop:" + fixedWorkshop));
        if (deviceIds == null) deviceIds = java.util.Collections.emptySet();
        java.util.List<DailyEnergyConsumption> out = new java.util.ArrayList<>();
        for (String did : deviceIds) {
            for (java.util.Date dStart : days) {
                java.util.Date dEnd = new java.util.Date(dStart.getTime() + 24L * 3600_000);
                Double startEnergy = firstEnergyAfterOrAt(did, dStart.getTime());
                Double endEnergy;
                java.util.Calendar cal = java.util.Calendar.getInstance();
                cal.setTime(new java.util.Date());
                java.util.Calendar cal2 = java.util.Calendar.getInstance();
                cal2.setTime(dStart);
                boolean isToday = cal.get(java.util.Calendar.YEAR) == cal2.get(java.util.Calendar.YEAR)
                        && cal.get(java.util.Calendar.DAY_OF_YEAR) == cal2.get(java.util.Calendar.DAY_OF_YEAR);
                if (isToday) {
                    endEnergy = latestEnergyBeforeOrAt(did, dEnd.getTime());
                } else {
                    endEnergy = firstEnergyAfterOrAt(did, dEnd.getTime());
                }
                if (startEnergy == null || endEnergy == null) continue;
                if (endEnergy < startEnergy) continue;
                DailyEnergyConsumption rec = new DailyEnergyConsumption();
                rec.setDeviceId(did);
                rec.setWorkshop(fixedWorkshop);
                rec.setDay(dStart);
                rec.setStartEnergy(startEnergy);
                rec.setEndEnergy(endEnergy);
                rec.setEnergyConsumption(endEnergy - startEnergy);
                rec.setStartTime(dStart);
                rec.setEndTime(dEnd);
                out.add(rec);
            }
        }
        out.sort(java.util.Comparator.comparing(DailyEnergyConsumption::getDay));
        return out;
    }

    // ==========================
    // 辅助方法：构建边界与读取能耗
    // ==========================
    private java.util.List<java.util.Date> buildHourlyBoundaries(java.util.Date start, java.util.Date end) {
        java.util.List<java.util.Date> hours = new java.util.ArrayList<>();
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.setTime(start);
        cal.set(java.util.Calendar.MINUTE, 0);
        cal.set(java.util.Calendar.SECOND, 0);
        cal.set(java.util.Calendar.MILLISECOND, 0);
        java.util.Date cur = cal.getTime();
        while (cur.getTime() <= end.getTime()) {
            hours.add(cur);
            cur = new java.util.Date(cur.getTime() + 3600_000);
        }
        return hours;
    }

    private java.util.List<java.util.Date> buildDailyBoundaries(java.util.Date start, java.util.Date end) {
        java.util.List<java.util.Date> days = new java.util.ArrayList<>();
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.setTime(start);
        cal.set(java.util.Calendar.HOUR_OF_DAY, 0);
        cal.set(java.util.Calendar.MINUTE, 0);
        cal.set(java.util.Calendar.SECOND, 0);
        cal.set(java.util.Calendar.MILLISECOND, 0);
        java.util.Date cur = cal.getTime();
        while (cur.getTime() <= end.getTime()) {
            days.add(cur);
            cur = new java.util.Date(cur.getTime() + 24L * 3600_000);
        }
        return days;
    }

    private Double firstEnergyAfterOrAt(String deviceId, long ts) {
        String key = namespaceService.buildActiveKey("tempMonitor:z:byDevice:" + deviceId);
        java.util.Set<String> set = stringRedisTemplate.opsForZSet().rangeByScore(key, ts, Double.POSITIVE_INFINITY, 0, 1);
        if (set == null || set.isEmpty()) return null;
        String json = set.iterator().next();
        try {
            TempMonitor r = objectMapper.readValue(json, TempMonitor.class);
            return r.getElectricEnergy();
        } catch (Exception e) {
            return null;
        }
    }

    private Double latestEnergyBeforeOrAt(String deviceId, long ts) {
        String key = namespaceService.buildActiveKey("tempMonitor:z:byDevice:" + deviceId);
        java.util.Set<String> set = stringRedisTemplate.opsForZSet().reverseRangeByScore(key, ts, Double.NEGATIVE_INFINITY, 0, 1);
        if (set == null || set.isEmpty()) return null;
        String json = set.iterator().next();
        try {
            TempMonitor r = objectMapper.readValue(json, TempMonitor.class);
            return r.getElectricEnergy();
        } catch (Exception e) {
            return null;
        }
    }
}
