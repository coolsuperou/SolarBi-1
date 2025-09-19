package com.yupi.springbootinit.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.mapper.sqlserver.AirConditioningMapper;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorQueryRequest;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import com.yupi.springbootinit.service.AirConditioningService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@Slf4j
public class AirConditioningServiceImpl implements AirConditioningService {

    @Autowired
    private AirConditioningMapper airConditioningMapper;

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public List<TempMonitor> getLatestData() {
        String fixedWorkshop = "114_空调水机主机";
        log.debug("从数据库获取最新TempMonitor数据，车间: {}", fixedWorkshop);
        return airConditioningMapper.selectByWorkshop(fixedWorkshop);
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public List<TempMonitor> getDataByWorkshop(String workshop) {
        String fixedWorkshop = "114_空调水机主机";
        return airConditioningMapper.selectByWorkshop(fixedWorkshop);
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public List<String> getAllWorkshops() {
        return java.util.Arrays.asList("114_空调水机主机");
    }



    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public Page<TempMonitor> queryByCondition(TempMonitorQueryRequest request) {
        long current = request.getCurrent();
        long size = request.getPageSize();
        Page<TempMonitor> page = new Page<>(current, size);
        String fixedWorkshop = "114_空调水机主机";
        return airConditioningMapper.selectPageByCondition(
            page,
            request.getDeviceId(),
            request.getName(),
            fixedWorkshop,
            request.getStartTime(),
            request.getEndTime(),
            request.getSortField(),
            request.getSortOrder()
        );
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public TempMonitorStatistics getStatistics(String workshop, Date startTime, Date endTime) {
        String fixedWorkshop = "114_空调水机主机";
        TempMonitorStatistics statistics = airConditioningMapper.getStatistics(fixedWorkshop, startTime, endTime);
        if (statistics == null) {
            statistics = new TempMonitorStatistics();
            statistics.setAvgTemperature(0.0);
            statistics.setMinTemperature(0.0);
            statistics.setMaxTemperature(0.0);
            statistics.setAvgHumidity(0.0);
            statistics.setMinHumidity(0.0);
            statistics.setMaxHumidity(0.0);
            statistics.setTotalElectricEnergy(0.0);
            statistics.setAvgElectricEnergy(0.0);
        }
        Integer deviceCount = airConditioningMapper.countDevices(fixedWorkshop, startTime, endTime);
        statistics.setTotalDevices(deviceCount != null ? deviceCount : 0);
        return statistics;
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public Integer getDeviceCount(String workshop, Date startTime, Date endTime) {
        String fixedWorkshop = "114_空调水机主机";
        Integer count = airConditioningMapper.countDevices(fixedWorkshop, startTime, endTime);
        return count != null ? count : 0;
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public List<TempMonitor> getElectricEnergyTrend(String workshop, String deviceId, Date startTime, Date endTime, Integer limit) {
        String fixedWorkshop = "114_空调水机主机";
        log.debug("从数据库获取电能趋势数据，车间: {}, 设备: {}, 数量限制: {}", fixedWorkshop, deviceId, limit);
        return airConditioningMapper.selectElectricEnergyTrend(fixedWorkshop, deviceId, startTime, endTime, limit);
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public List<HourlyEnergyConsumption> getHourlyEnergyConsumption(String workshop, String deviceId, Date startTime, Date endTime) {
        String fixedWorkshop = "114_空调水机主机";
        log.debug("从数据库获取每小时电能消耗数据（默认模式-实时更新），车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", fixedWorkshop, deviceId, startTime, endTime);
        List<HourlyEnergyConsumption> result = airConditioningMapper.selectHourlyEnergyConsumption(fixedWorkshop, deviceId, startTime, endTime);
        if (result != null && !result.isEmpty()) {
            log.info("=== 每小时电能消耗数据调试信息（默认模式-114_空调水机主机） ===");
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
    public List<HourlyEnergyConsumption> getHourlyEnergyConsumptionQuery(String workshop, String deviceId, Date startTime, Date endTime) {
        String fixedWorkshop = "114_空调水机主机";
        log.debug("从数据库获取每小时电能消耗数据（查询模式-历史数据），车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", fixedWorkshop, deviceId, startTime, endTime);
        List<HourlyEnergyConsumption> result = airConditioningMapper.selectHourlyEnergyConsumptionQuery(fixedWorkshop, deviceId, startTime, endTime);
        if (result != null && !result.isEmpty()) {
            log.info("=== 每小时电能消耗数据调试信息（查询模式-114_空调水机主机） ===");
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
    public List<DailyEnergyConsumption> getDailyEnergyConsumptionQuery(String workshop, String deviceId, Date startTime, Date endTime) {
        String fixedWorkshop = "114_空调水机主机";
        log.debug("从数据库获取每日电能消耗数据（查询模式-历史数据），车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", fixedWorkshop, deviceId, startTime, endTime);
        List<DailyEnergyConsumption> result = airConditioningMapper.selectDailyEnergyConsumptionQuery(fixedWorkshop, deviceId, startTime, endTime);
        if (result != null && !result.isEmpty()) {
            log.info("=== 每日电能消耗数据调试信息（查询模式-114_空调水机主机） ===");
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
