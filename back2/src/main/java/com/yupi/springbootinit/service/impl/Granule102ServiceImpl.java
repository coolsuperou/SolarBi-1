package com.yupi.springbootinit.service.impl;
import com.yupi.springbootinit.mapper.sqlserver.Granule102Mapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorQueryRequest;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import com.yupi.springbootinit.mapper.sqlserver.Granule102Mapper;
import com.yupi.springbootinit.service.Granule102Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

/**
 * 102造粒温湿电能监控数据服务实现
 * 使用SQL Server数据源 + MyBatis
 * 
 * @author yupi
 */
@Service
@Slf4j
public class Granule102ServiceImpl implements Granule102Service {


    @Autowired
    private Granule102Mapper granule102Mapper;

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public List<TempMonitor> getLatestData() {
        // 服务层也强制限定车间
        String fixedWorkshop = "102造粒";
        log.debug("从数据库获取最新TempMonitor数据，车间: {}", fixedWorkshop);
        return granule102Mapper.selectByWorkshop(fixedWorkshop);
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public List<TempMonitor> getDataByWorkshop(String workshop) {
        // 服务层也强制限定车间
        String fixedWorkshop = "102造粒";
        return granule102Mapper.selectByWorkshop(fixedWorkshop);
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public List<String> getAllWorkshops() {
        // 只返回固定的workshop列表
        return java.util.Arrays.asList("102造粒");
    }



    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public Page<TempMonitor> queryByCondition(TempMonitorQueryRequest request) {
        long current = request.getCurrent();
        long size = request.getPageSize();

        // 创建分页对象
        Page<TempMonitor> page = new Page<>(current, size);

        // 服务层也强制限定车间
        String fixedWorkshop = "102造粒";

        // 调用Mapper进行查询
        return granule102Mapper.selectPageByCondition(
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
        // 服务层也强制限定车间
        String fixedWorkshop = "102造粒";
        TempMonitorStatistics statistics = granule102Mapper.getStatistics(fixedWorkshop, startTime, endTime);

        // 如果统计结果为空，创建一个默认的统计对象
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

        // 获取设备数量
        Integer deviceCount = granule102Mapper.countDevices(fixedWorkshop, startTime, endTime);
        statistics.setTotalDevices(deviceCount != null ? deviceCount : 0);

        return statistics;
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public Integer getDeviceCount(String workshop, Date startTime, Date endTime) {
        // 服务层也强制限定车间
        String fixedWorkshop = "102造粒";
        Integer count = granule102Mapper.countDevices(fixedWorkshop, startTime, endTime);
        return count != null ? count : 0;
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public List<TempMonitor> getElectricEnergyTrend(String workshop, String deviceId, Date startTime, Date endTime, Integer limit) {
        // 服务层也强制限定车间
        String fixedWorkshop = "102造粒";
        log.debug("从数据库获取电能趋势数据，车间: {}, 设备: {}, 数量限制: {}", fixedWorkshop, deviceId, limit);
        return granule102Mapper.selectElectricEnergyTrend(fixedWorkshop, deviceId, startTime, endTime, limit);
    }

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public List<HourlyEnergyConsumption> getHourlyEnergyConsumption(String workshop, String deviceId, Date startTime, Date endTime) {
        // 服务层也强制限定车间
        String fixedWorkshop = "102造粒";
        log.debug("从数据库获取每小时电能消耗数据（默认模式-实时更新），车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", fixedWorkshop, deviceId, startTime, endTime);

        List<HourlyEnergyConsumption> result = granule102Mapper.selectHourlyEnergyConsumption(fixedWorkshop, deviceId, startTime, endTime);

        // 添加调试日志，输出实际查询结果
        if (result != null && !result.isEmpty()) {
            log.info("=== 每小时电能消耗数据调试信息（默认模式-102造粒） ===");
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
        // 服务层也强制限定车间
        String fixedWorkshop = "102造粒";
        log.debug("从数据库获取每小时电能消耗数据（查询模式-历史数据），车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", fixedWorkshop, deviceId, startTime, endTime);

        List<HourlyEnergyConsumption> result = granule102Mapper.selectHourlyEnergyConsumptionQuery(fixedWorkshop, deviceId, startTime, endTime);

        // 添加调试日志，输出实际查询结果
        if (result != null && !result.isEmpty()) {
            log.info("=== 每小时电能消耗数据调试信息（查询模式-102造粒） ===");
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
        // 服务层也强制限定车间
        String fixedWorkshop = "102造粒";
        log.debug("从数据库获取每日电能消耗数据（查询模式-历史数据），车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", fixedWorkshop, deviceId, startTime, endTime);

        List<DailyEnergyConsumption> result = granule102Mapper.selectDailyEnergyConsumptionQuery(fixedWorkshop, deviceId, startTime, endTime);

        // 添加调试日志，输出实际查询结果
        if (result != null && !result.isEmpty()) {
            log.info("=== 每日电能消耗数据调试信息（查询模式-102造粒） ===");
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
