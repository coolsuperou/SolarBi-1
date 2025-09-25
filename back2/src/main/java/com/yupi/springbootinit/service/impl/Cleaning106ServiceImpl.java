package com.yupi.springbootinit.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.mapper.sqlserver.Cleaning106Mapper;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorQueryRequest;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import com.yupi.springbootinit.service.Cleaning106Service;
import com.yupi.springbootinit.service.ColdPress103Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

/**
 * 106清洗车间温湿电能监控数据服务实现
 * 使用SQL Server数据源 + MyBatis
 * 
 * @author yupi
 */
@Service
@Slf4j
public class Cleaning106ServiceImpl implements Cleaning106Service {

    @Autowired
    private Cleaning106Mapper cleaning106Mapper;





    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public Page<TempMonitor> queryByCondition(TempMonitorQueryRequest request) {
        long current = request.getCurrent();
        long size = request.getPageSize();
        
        Page<TempMonitor> page = new Page<>(current, size);
        String fixedWorkshop = "106清洗";
        
        return cleaning106Mapper.selectPageByCondition(
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
        String fixedWorkshop = "106清洗";
        TempMonitorStatistics statistics = cleaning106Mapper.getStatistics(fixedWorkshop, startTime, endTime);
        
        // 如果统计结果为空，创建一个默认的统计对象
        if (statistics == null) {
            statistics = new TempMonitorStatistics();
            statistics.setTotalElectricEnergy(0.0);
        }
        
        // 为保持API完整性，设置其他字段的默认值（统计卡片不需要，但保持兼容性）
        if (statistics.getAvgTemperature() == null) statistics.setAvgTemperature(0.0);
        if (statistics.getMinTemperature() == null) statistics.setMinTemperature(0.0);
        if (statistics.getMaxTemperature() == null) statistics.setMaxTemperature(0.0);
        if (statistics.getAvgHumidity() == null) statistics.setAvgHumidity(0.0);
        if (statistics.getMinHumidity() == null) statistics.setMinHumidity(0.0);
        if (statistics.getMaxHumidity() == null) statistics.setMaxHumidity(0.0);
        if (statistics.getAvgElectricEnergy() == null) statistics.setAvgElectricEnergy(0.0);
        if (statistics.getTotalDevices() == null) statistics.setTotalDevices(0);
        
        return statistics;
    }





    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public List<HourlyEnergyConsumption> getHourlyEnergyConsumptionQuery(String workshop, String deviceId, Date startTime, Date endTime) {
        // 服务层也强制限定车间
        String fixedWorkshop = "106清洗";
        log.debug("从数据库获取每小时电能消耗数据（查询模式-历史数据），车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", fixedWorkshop, deviceId, startTime, endTime);
        
        List<HourlyEnergyConsumption> result = cleaning106Mapper.selectHourlyEnergyConsumptionQuery(fixedWorkshop, deviceId, startTime, endTime);
        
        // 添加调试日志，输出实际查询结果
        if (result != null && !result.isEmpty()) {
            log.info("=== 每小时电能消耗数据调试信息（查询模式-106清洗） ===");
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
        String fixedWorkshop = "106清洗";
        log.debug("从数据库获取每日电能消耗数据（查询模式-历史数据），车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", fixedWorkshop, deviceId, startTime, endTime);
        
        List<DailyEnergyConsumption> result = cleaning106Mapper.selectDailyEnergyConsumptionQuery(fixedWorkshop, deviceId, startTime, endTime);
        
        // 添加调试日志，输出实际查询结果
        if (result != null && !result.isEmpty()) {
            log.info("=== 每日电能消耗数据调试信息（查询模式-106清洗） ===");
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

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public Double getEnergyConsumption(Date startTime, Date endTime, String mode) {
        log.debug("从数据库计算电能消耗差值，开始时间: {}, 结束时间: {}, 模式: {}", startTime, endTime, mode);
        Double consumption = cleaning106Mapper.selectEnergyConsumption(startTime, endTime, mode);
        return consumption != null ? consumption : 0.0;
    }
}