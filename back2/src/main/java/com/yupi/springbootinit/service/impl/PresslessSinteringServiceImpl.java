package com.yupi.springbootinit.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.mapper.sqlserver.PresslessSinteringMapper;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorQueryRequest;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import com.yupi.springbootinit.service.PresslessSinteringService;
import com.yupi.springbootinit.utils.EnergyCalculationUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 无压烧结车间温湿电能监控数据服务实现
 * 使用SQL Server数据源 + MyBatis
 * 🔥 电能计算只统计 tbl_monitordevice 中 IsElectricMeter=1 的设备
 * 
 * @author yupi
 */
@Service
@Slf4j
public class PresslessSinteringServiceImpl implements PresslessSinteringService {

    @Autowired
    private PresslessSinteringMapper presslessSinteringMapper;

    /** 车间名称常量 */
    private static final String WORKSHOP_NAME = "无压烧结";

    /**
     * 🔥 获取电能表设备名称列表（带缓存日志）
     * 从 tbl_monitordevice 查询 IsElectricMeter=1 的设备
     */
    private List<String> getElectricMeterNameList() {
        List<String> names = presslessSinteringMapper.getElectricMeterNames(WORKSHOP_NAME);
        if (names == null || names.isEmpty()) {
            log.warn("未找到无压烧结车间的电能表设备，请检查 tbl_monitordevice 表配置");
            return new ArrayList<>();
        }
        log.info("查询到无压烧结车间电能表设备: {}", names);
        return names;
    }

    /**
     * 🔥 过滤原始数据，只保留电能表设备的数据
     * @param rawData 原始数据
     * @param electricMeterNames 电能表设备名称列表
     * @return 过滤后的数据
     */
    private List<TempMonitor> filterByElectricMeter(List<TempMonitor> rawData, List<String> electricMeterNames) {
        if (rawData == null || rawData.isEmpty()) {
            return new ArrayList<>();
        }
        if (electricMeterNames == null || electricMeterNames.isEmpty()) {
            log.warn("电能表名称列表为空，返回空数据");
            return new ArrayList<>();
        }
        
        List<TempMonitor> filtered = rawData.stream()
                .filter(item -> electricMeterNames.contains(item.getName()))
                .collect(Collectors.toList());
        
        log.info("数据过滤: 原始记录数={}, 过滤后记录数={}, 电能表设备={}", 
                rawData.size(), filtered.size(), electricMeterNames);
        return filtered;
    }

    /**
     * 表格查询（🔥 只显示电能表设备）
     */
    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public Page<TempMonitor> queryByCondition(TempMonitorQueryRequest request) {
        long current = request.getCurrent();
        long size = request.getPageSize();

        // 🔥 获取电能表设备名称列表
        List<String> electricMeterNames = getElectricMeterNameList();
        
        if (electricMeterNames.isEmpty()) {
            log.warn("未找到电能表设备，返回空分页");
            return new Page<>(current, size);
        }

        Page<TempMonitor> page = new Page<>(current, size);

        // 🔥 使用带电能表过滤的查询
        return presslessSinteringMapper.selectPageByConditionWithFilter(
                page,
                request.getDeviceId(),
                request.getName(),
                WORKSHOP_NAME,
                request.getStartTime(),
                request.getEndTime(),
                request.getSortField(),
                request.getSortOrder(),
                electricMeterNames
        );
    }

    /**
     * 总电能查询（🔥 只统计电能表设备）
     */
    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public TempMonitorStatistics getStatistics(String workshop, Date startTime, Date endTime) {
        // 🔥 获取电能表设备名称列表
        List<String> electricMeterNames = getElectricMeterNameList();
        
        // 查询原始数据
        List<TempMonitor> rawData = presslessSinteringMapper.selectHourlyRawData(WORKSHOP_NAME, startTime, endTime);
        
        // 🔥 过滤只保留电能表设备的数据
        List<TempMonitor> filteredData = filterByElectricMeter(rawData, electricMeterNames);
        
        // 计算总电能（取每个设备最新一条记录的电能值求和）
        TempMonitorStatistics statistics = new TempMonitorStatistics();
        
        if (!filteredData.isEmpty()) {
            // 按设备名称分组，取每个设备最新的电能值
            Double totalEnergy = filteredData.stream()
                    .collect(Collectors.groupingBy(TempMonitor::getName))
                    .values().stream()
                    .map(list -> list.stream()
                            .filter(item -> item.getElectricEnergy() != null)
                            .max((a, b) -> a.getUpdateTime().compareTo(b.getUpdateTime()))
                            .map(TempMonitor::getElectricEnergy)
                            .orElse(0.0))
                    .mapToDouble(Double::doubleValue)
                    .sum();
            statistics.setTotalElectricEnergy(totalEnergy);
            log.info("无压烧结总电能统计: {} kWh (仅电能表设备)", totalEnergy);
        } else {
            statistics.setTotalElectricEnergy(0.0);
        }

        // 设置默认值
        if (statistics.getAvgTemperature() == null) statistics.setAvgTemperature(0.0);
        if (statistics.getMinTemperature() == null) statistics.setMinTemperature(0.0);
        if (statistics.getMaxTemperature() == null) statistics.setMaxTemperature(0.0);
        if (statistics.getAvgHumidity() == null) statistics.setAvgHumidity(0.0);
        if (statistics.getMinHumidity() == null) statistics.setMinHumidity(0.0);
        if (statistics.getMaxHumidity() == null) statistics.setMaxHumidity(0.0);
        if (statistics.getAvgElectricEnergy() == null) statistics.setAvgElectricEnergy(0.0);
        if (statistics.getTotalDevices() == null) statistics.setTotalDevices(electricMeterNames.size());

        return statistics;
    }

    /**
     * 小时查询（🔥 只统计电能表设备）
     */
    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public List<HourlyEnergyConsumption> getHourlyEnergyConsumptionQuery(String workshop, String deviceId, Date startTime, Date endTime) {
        log.debug("小时能耗查询，车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", WORKSHOP_NAME, deviceId, startTime, endTime);

        // 🔥 第1步：获取电能表设备名称列表
        List<String> electricMeterNames = getElectricMeterNameList();

        // 🔥 第2步：查询原始数据
        List<TempMonitor> rawData = presslessSinteringMapper.selectHourlyRawData(WORKSHOP_NAME, startTime, endTime);
        log.info("查询到原始数据记录数: {}", rawData.size());

        // 🔥 第3步：过滤只保留电能表设备的数据
        List<TempMonitor> filteredData = filterByElectricMeter(rawData, electricMeterNames);

        // 🔥 第4步：用过滤后的数据进行计算
        List<HourlyEnergyConsumption> result = EnergyCalculationUtils.calculateHourlyEnergyFromRawData(
                filteredData, startTime, endTime, WORKSHOP_NAME
        );

        if (result != null && !result.isEmpty()) {
            log.info("=== 每小时电能消耗数据（无压烧结-仅电能表设备） ===");
            log.info("计算结果总数: {}", result.size());
            for (HourlyEnergyConsumption item : result) {
                log.info("小时: {}, 消耗量: {} kWh", item.getHour(), item.getEnergyConsumption());
            }
        } else {
            log.warn("计算结果为空");
        }

        return result;
    }

    /**
     * 日模式查询（🔥 只统计电能表设备）
     */
    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public List<DailyEnergyConsumption> getDailyEnergyConsumptionQuery(String workshop, String deviceId, Date startTime, Date endTime) {
        log.debug("日能耗查询，车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", WORKSHOP_NAME, deviceId, startTime, endTime);

        // 🔥 第1步：获取电能表设备名称列表
        List<String> electricMeterNames = getElectricMeterNameList();

        // 🔥 第2步：查询原始数据
        List<TempMonitor> rawData = presslessSinteringMapper.selectHourlyRawData(WORKSHOP_NAME, startTime, endTime);
        log.info("查询到原始数据记录数: {}", rawData.size());

        // 🔥 第3步：过滤只保留电能表设备的数据
        List<TempMonitor> filteredData = filterByElectricMeter(rawData, electricMeterNames);

        // 🔥 第4步：用过滤后的数据进行计算
        List<DailyEnergyConsumption> result = EnergyCalculationUtils.calculateDailyEnergyFromRawData(
                filteredData, startTime, endTime, WORKSHOP_NAME
        );

        if (result != null && !result.isEmpty()) {
            log.info("=== 每日电能消耗数据（无压烧结-仅电能表设备） ===");
            for (DailyEnergyConsumption item : result) {
                log.info("日期: {}, 消耗量: {} kWh", item.getDay(), item.getEnergyConsumption());
            }
        }

        return result;
    }

    /**
     * 电能消耗卡片计算（🔥 只统计电能表设备）
     */
    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public Double getEnergyConsumption(Date startTime, Date endTime, String mode) {
        log.debug("电能消耗卡片计算，开始时间: {}, 结束时间: {}, 模式: {}", startTime, endTime, mode);

        // 🔥 第1步：获取电能表设备名称列表
        List<String> electricMeterNames = getElectricMeterNameList();

        // 🔥 第2步：查询原始数据
        List<TempMonitor> rawData = presslessSinteringMapper.selectHourlyRawData(WORKSHOP_NAME, startTime, endTime);
        log.info("查询到原始数据记录数: {}", rawData.size());

        // 🔥 第3步：过滤只保留电能表设备的数据
        List<TempMonitor> filteredData = filterByElectricMeter(rawData, electricMeterNames);

        // 🔥 第4步：根据模式计算总消耗
        Double totalConsumption = 0.0;

        if ("day".equals(mode)) {
            // 日模式
            List<DailyEnergyConsumption> dailyResults = EnergyCalculationUtils.calculateDailyEnergyFromRawData(
                    filteredData, startTime, endTime, WORKSHOP_NAME
            );

            totalConsumption = dailyResults.stream()
                    .filter(item -> item.getEnergyConsumption() != null)
                    .map(DailyEnergyConsumption::getEnergyConsumption)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add)
                    .doubleValue();

            log.info("日模式计算: {}天数据，总消耗: {} kWh (仅电能表设备)", dailyResults.size(), totalConsumption);

        } else {
            // 小时模式
            List<HourlyEnergyConsumption> hourlyResults = EnergyCalculationUtils.calculateHourlyEnergyFromRawData(
                    filteredData, startTime, endTime, WORKSHOP_NAME
            );

            totalConsumption = hourlyResults.stream()
                    .filter(item -> item.getEnergyConsumption() != null)
                    .map(HourlyEnergyConsumption::getEnergyConsumption)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add)
                    .doubleValue();

            log.info("小时模式计算: {}小时数据，总消耗: {} kWh (仅电能表设备)", hourlyResults.size(), totalConsumption);
        }

        return totalConsumption != null ? totalConsumption : 0.0;
    }
}
