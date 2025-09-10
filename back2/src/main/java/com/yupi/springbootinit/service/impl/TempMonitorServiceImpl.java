package com.yupi.springbootinit.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.mapper.sqlserver.TempMonitorMapper;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorQueryRequest;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import com.yupi.springbootinit.service.TempMonitorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    @Cacheable(cacheNames = com.yupi.springbootinit.config.CacheConfig.CACHE_LATEST_DATA)
    public List<TempMonitor> getLatestData() {
        log.debug("从数据库获取最新TempMonitor数据");
        return tempMonitorMapper.selectLatestData();
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    @Cacheable(cacheNames = com.yupi.springbootinit.config.CacheConfig.CACHE_BY_WORKSHOP, key = "#workshop == null ? 'ALL' : #workshop")
    public List<TempMonitor> getDataByWorkshop(String workshop) {
        return tempMonitorMapper.selectByWorkshop(workshop);
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    @Cacheable(cacheNames = com.yupi.springbootinit.config.CacheConfig.CACHE_WORKSHOPS)
    public List<String> getAllWorkshops() {
        return tempMonitorMapper.selectAllWorkshops();
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    @Cacheable(cacheNames = com.yupi.springbootinit.config.CacheConfig.CACHE_BY_DEVICE, key = "#deviceId")
    public List<TempMonitor> getDataByDeviceId(String deviceId) {
        return tempMonitorMapper.selectByDeviceId(deviceId);
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public Page<TempMonitor> queryByCondition(TempMonitorQueryRequest request) {
        long current = request.getCurrent();
        long size = request.getPageSize();
        
        // 创建分页对象
        Page<TempMonitor> page = new Page<>(current, size);
        
        // 调用Mapper进行查询
        return tempMonitorMapper.selectPageByCondition(
            page,
            request.getDeviceId(),
            request.getName(),
            request.getWorkshop(),
            request.getStartTime(),
            request.getEndTime(),
            request.getSortField(),
            request.getSortOrder()
        );
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
    public List<TempMonitor> getElectricEnergyTrend(String workshop, String deviceId, Date startTime, Date endTime, Integer limit) {
        // 服务层也强制限定车间
        String fixedWorkshop = "114_空调水机主机";
        log.debug("从数据库获取电能趋势数据，车间: {}, 设备: {}, 数量限制: {}", fixedWorkshop, deviceId, limit);
        return tempMonitorMapper.selectElectricEnergyTrend(fixedWorkshop, deviceId, startTime, endTime, limit);
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    @Cacheable(
            cacheNames = com.yupi.springbootinit.config.CacheConfig.CACHE_HOURLY_CONS,
            key = "(#workshop == null ? '114_空调水机主机' : #workshop) + ':' + (#deviceId == null ? 'ALL' : #deviceId) + ':' + (#startTime == null ? 'null' : #startTime.time) + ':' + (#endTime == null ? 'null' : #endTime.time)"
    )
    public List<HourlyEnergyConsumption> getHourlyEnergyConsumption(String workshop, String deviceId, Date startTime, Date endTime) {
        // 服务层也强制限定车间
        String fixedWorkshop = "114_空调水机主机";
        log.debug("从数据库获取每小时电能消耗数据（默认模式-实时更新），车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", fixedWorkshop, deviceId, startTime, endTime);
        
        List<HourlyEnergyConsumption> result = tempMonitorMapper.selectHourlyEnergyConsumption(fixedWorkshop, deviceId, startTime, endTime);
        
        // 添加调试日志，输出实际查询结果
        if (result != null && !result.isEmpty()) {
            log.info("=== 每小时电能消耗数据调试信息（默认模式） ===");
            for (HourlyEnergyConsumption item : result) {
                log.info("设备: {}, 小时: {}, 开始能耗: {}, 结束能耗: {}, 消耗量: {}, 开始时间: {}, 结束时间: {}", 
                    item.getDeviceId(), 
                    item.getHour(), 
                    item.getStartEnergy(), 
                    item.getEndEnergy(), 
                    item.getEnergyConsumption(),
                    item.getStartTime(),
                    item.getEndTime());
            }
            log.info("=== 调试信息结束 ===");
        }
        
        return result;
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    @Cacheable(
            cacheNames = com.yupi.springbootinit.config.CacheConfig.CACHE_HOURLY_CONS_QUERY,
            key = "(#workshop == null ? '114_空调水机主机' : #workshop) + ':' + (#deviceId == null ? 'ALL' : #deviceId) + ':' + (#startTime == null ? 'null' : #startTime.time) + ':' + (#endTime == null ? 'null' : #endTime.time)"
    )
    public List<HourlyEnergyConsumption> getHourlyEnergyConsumptionQuery(String workshop, String deviceId, Date startTime, Date endTime) {
        // 服务层也强制限定车间
        String fixedWorkshop = "114_空调水机主机";
        log.debug("从数据库获取每小时电能消耗数据（查询模式-历史数据），车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", fixedWorkshop, deviceId, startTime, endTime);
        
        List<HourlyEnergyConsumption> result = tempMonitorMapper.selectHourlyEnergyConsumptionQuery(fixedWorkshop, deviceId, startTime, endTime);
        
        // 添加调试日志，输出实际查询结果
        if (result != null && !result.isEmpty()) {
            log.info("=== 每小时电能消耗数据调试信息（查询模式） ===");
            for (HourlyEnergyConsumption item : result) {
                log.info("设备: {}, 小时: {}, 开始能耗: {}, 结束能耗: {}, 消耗量: {}, 开始时间: {}, 结束时间: {}", 
                    item.getDeviceId(), 
                    item.getHour(), 
                    item.getStartEnergy(), 
                    item.getEndEnergy(), 
                    item.getEnergyConsumption(),
                    item.getStartTime(),
                    item.getEndTime());
            }
            log.info("=== 调试信息结束 ===");
        }
        
        return result;
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    @Cacheable(
            cacheNames = com.yupi.springbootinit.config.CacheConfig.CACHE_DAILY_CONS_QUERY,
            key = "(#workshop == null ? '114_空调水机主机' : #workshop) + ':' + (#deviceId == null ? 'ALL' : #deviceId) + ':' + (#startTime == null ? 'null' : #startTime.time) + ':' + (#endTime == null ? 'null' : #endTime.time)"
    )
    public List<DailyEnergyConsumption> getDailyEnergyConsumptionQuery(String workshop, String deviceId, Date startTime, Date endTime) {
        // 服务层也强制限定车间
        String fixedWorkshop = "114_空调水机主机";
        log.debug("从数据库获取每日电能消耗数据（查询模式-历史数据），车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", fixedWorkshop, deviceId, startTime, endTime);
        
        List<DailyEnergyConsumption> result = tempMonitorMapper.selectDailyEnergyConsumptionQuery(fixedWorkshop, deviceId, startTime, endTime);
        
        // 添加调试日志，输出实际查询结果
        if (result != null && !result.isEmpty()) {
            log.info("=== 每日电能消耗数据调试信息（查询模式） ===");
            for (DailyEnergyConsumption item : result) {
                log.info("设备: {}, 日期: {}, 开始能耗: {}, 结束能耗: {}, 消耗量: {}, 开始时间: {}, 结束时间: {}", 
                    item.getDeviceId(), 
                    item.getDay(), 
                    item.getStartEnergy(), 
                    item.getEndEnergy(), 
                    item.getEnergyConsumption(),
                    item.getStartTime(),
                    item.getEndTime());
            }
            log.info("=== 调试信息结束 ===");
        }
        
        return result;
    }
}
