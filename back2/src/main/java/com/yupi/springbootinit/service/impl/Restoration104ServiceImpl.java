package com.yupi.springbootinit.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.mapper.sqlserver.PresslessSinteringMapper;
import com.yupi.springbootinit.mapper.sqlserver.Restoration104Mapper;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorQueryRequest;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import com.yupi.springbootinit.service.Restoration104Service;
import com.yupi.springbootinit.utils.EnergyCalculationUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

/**
 * 104还原车间温湿电能监控数据服务实现
 * 使用SQL Server数据源 + MyBatis
 * 注意：104还原的电能数据需要扣除无压烧结的部分
 * 
 * @author yupi
 */
@Service
@Slf4j
public class Restoration104ServiceImpl implements Restoration104Service {

    @Autowired
    private Restoration104Mapper restoration104Mapper;

    @Autowired
    private PresslessSinteringMapper presslessSinteringMapper;






    /**
     * 表格查询
     * @param request
     * @return
     */

    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public Page<TempMonitor> queryByCondition(TempMonitorQueryRequest request) {
        long current = request.getCurrent();
        long size = request.getPageSize();

        Page<TempMonitor> page = new Page<>(current, size);
        String fixedWorkshop = "104还原";

        return restoration104Mapper.selectPageByCondition(
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


    /**
     * 总电能查询（扣除无压烧结）
     * @param workshop
     * @param startTime
     * @param endTime
     * @return
     */
    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public TempMonitorStatistics getStatistics(String workshop, Date startTime, Date endTime) {
        // 服务层也强制限定车间
        String fixedWorkshop = "104还原";
        TempMonitorStatistics statistics = restoration104Mapper.getStatistics(fixedWorkshop, startTime, endTime);

        // 如果统计结果为空，创建一个默认的统计对象
        if (statistics == null) {
            statistics = new TempMonitorStatistics();
            statistics.setTotalElectricEnergy(0.0);
        }

        // 🔥 扣除无压烧结的总电能
        TempMonitorStatistics presslessStats = presslessSinteringMapper.getStatistics("无压烧结", startTime, endTime);
        if (presslessStats != null && presslessStats.getTotalElectricEnergy() != null) {
            double originalEnergy = statistics.getTotalElectricEnergy() != null ? statistics.getTotalElectricEnergy() : 0.0;
            double presslessEnergy = presslessStats.getTotalElectricEnergy();
            double adjustedEnergy = Math.max(0, originalEnergy - presslessEnergy);
            statistics.setTotalElectricEnergy(adjustedEnergy);
            log.info("总电能扣除无压烧结: 原始={}, 无压烧结={}, 调整后={}", originalEnergy, presslessEnergy, adjustedEnergy);
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


    /**
     * 小时查询（扣除无压烧结）
     * @param workshop
     * @param deviceId
     * @param startTime
     * @param endTime
     * @return
     */
    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public List<HourlyEnergyConsumption> getHourlyEnergyConsumptionQuery(String workshop, String deviceId, Date startTime, Date endTime) {
        // 服务层强制限定车间
        String fixedWorkshop = "104还原";
        log.debug("优化版本：使用统一计算工具类，车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", fixedWorkshop, deviceId, startTime, endTime);

        // 🔥 使用现有的非分页查询方法
        List<TempMonitor> rawData = restoration104Mapper.selectHourlyRawData(
                fixedWorkshop, startTime, endTime
        );

        log.info("从非分页查询获取原始数据记录数: {}, 时间范围: {} 到 {}", rawData.size(), startTime, endTime);

        // 🔥 调用统一的计算工具类
        List<HourlyEnergyConsumption> result = EnergyCalculationUtils.calculateHourlyEnergyFromRawData(
                rawData, startTime, endTime, fixedWorkshop
        );

        // 🔥 扣除无压烧结的小时能耗
        List<TempMonitor> presslessRawData = presslessSinteringMapper.selectHourlyRawData("无压烧结", startTime, endTime);
        List<HourlyEnergyConsumption> presslessResult = EnergyCalculationUtils.calculateHourlyEnergyFromRawData(
                presslessRawData, startTime, endTime, "无压烧结"
        );
        
        // 按小时扣除无压烧结的能耗
        if (presslessResult != null && !presslessResult.isEmpty()) {
            for (HourlyEnergyConsumption item : result) {
                for (HourlyEnergyConsumption presslessItem : presslessResult) {
                    // 匹配相同小时的数据
                    if (item.getHour() != null && item.getHour().equals(presslessItem.getHour())) {
                        Double originalConsumption = item.getEnergyConsumption() != null ? item.getEnergyConsumption() : 0.0;
                        Double presslessConsumption = presslessItem.getEnergyConsumption() != null ? presslessItem.getEnergyConsumption() : 0.0;
                        Double adjustedConsumption = Math.max(0, originalConsumption - presslessConsumption);
                        item.setEnergyConsumption(adjustedConsumption);
                        log.debug("小时 {} 扣除无压烧结: 原始={}, 无压烧结={}, 调整后={}", 
                                item.getHour(), originalConsumption, presslessConsumption, adjustedConsumption);
                        break;
                    }
                }
            }
            log.info("已扣除无压烧结的小时能耗数据，无压烧结数据点数: {}", presslessResult.size());
        }

        // 保持原有调试日志
        if (result != null && !result.isEmpty()) {
            log.info("=== 每小时电能消耗数据调试信息（优化版本-104还原，已扣除无压烧结） ===");
            log.info("计算结果总数: {}", result.size());
            for (HourlyEnergyConsumption item : result) {
                log.info("设备: {}, 小时: {}, 开始能耗: {}, 结束能耗: {}, 消耗量: {}, 开始时间: {}, 结束时间: {}",
                        item.getDeviceId(), item.getHour(), item.getStartEnergy(), item.getEndEnergy(),
                        item.getEnergyConsumption(), item.getStartTime(), item.getEndTime());
            }
            log.info("=== 调试信息结束 ===");
        } else {
            log.warn("计算结果为空，原始数据记录数: {}", rawData.size());
        }

        return result;
    }


    /**
     * 日模式查询（扣除无压烧结）
     * @param workshop
     * @param deviceId
     * @param startTime
     * @param endTime
     * @return
     */
    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public List<DailyEnergyConsumption> getDailyEnergyConsumptionQuery(String workshop, String deviceId, Date startTime, Date endTime) {
        String fixedWorkshop = "104还原";
        log.debug("优化版本：使用selectHourlyRawData非分页查询后Java计算日能耗，车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", fixedWorkshop, deviceId, startTime, endTime);

        // 🔥 复用同样的非分页查询方法
        List<TempMonitor> rawData = restoration104Mapper.selectHourlyRawData(
                fixedWorkshop, startTime, endTime
        );

        log.info("从非分页查询获取原始数据记录数: {}, 时间范围: {} 到 {}", rawData.size(), startTime, endTime);

        // 🔥 调用统一工具类的日计算方法
        List<DailyEnergyConsumption> result = EnergyCalculationUtils.calculateDailyEnergyFromRawData(
                rawData, startTime, endTime, fixedWorkshop
        );

        // 🔥 扣除无压烧结的日能耗
        List<TempMonitor> presslessRawData = presslessSinteringMapper.selectHourlyRawData("无压烧结", startTime, endTime);
        List<DailyEnergyConsumption> presslessResult = EnergyCalculationUtils.calculateDailyEnergyFromRawData(
                presslessRawData, startTime, endTime, "无压烧结"
        );
        
        // 按日期扣除无压烧结的能耗
        if (presslessResult != null && !presslessResult.isEmpty()) {
            for (DailyEnergyConsumption item : result) {
                for (DailyEnergyConsumption presslessItem : presslessResult) {
                    // 匹配相同日期的数据
                    if (item.getDay() != null && item.getDay().equals(presslessItem.getDay())) {
                        Double originalConsumption = item.getEnergyConsumption() != null ? item.getEnergyConsumption() : 0.0;
                        Double presslessConsumption = presslessItem.getEnergyConsumption() != null ? presslessItem.getEnergyConsumption() : 0.0;
                        Double adjustedConsumption = Math.max(0, originalConsumption - presslessConsumption);
                        item.setEnergyConsumption(adjustedConsumption);
                        log.debug("日期 {} 扣除无压烧结: 原始={}, 无压烧结={}, 调整后={}", 
                                item.getDay(), originalConsumption, presslessConsumption, adjustedConsumption);
                        break;
                    }
                }
            }
            log.info("已扣除无压烧结的日能耗数据，无压烧结数据点数: {}", presslessResult.size());
        }

        // 保持原有调试日志
        if (result != null && !result.isEmpty()) {
            log.info("=== 每日电能消耗数据调试信息（优化版本-104还原，已扣除无压烧结） ===");
            for (DailyEnergyConsumption item : result) {
                log.info("设备: {}, 日期: {}, 开始能耗: {}, 结束能耗: {}, 消耗量: {}, 开始时间: {}, 结束时间: {}",
                        item.getDeviceId(), item.getDay(), item.getStartEnergy(), item.getEndEnergy(),
                        item.getEnergyConsumption(), item.getStartTime(), item.getEndTime());
            }
            log.info("=== 调试信息结束 ===");
        }

        return result;
    }


    /**
     * 电能消耗卡片计算（扣除无压烧结）
     * @param startTime
     * @param endTime
     * @param mode
     * @return
     */
    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public Double getEnergyConsumption(Date startTime, Date endTime, String mode) {
        String fixedWorkshop = "104还原";
        log.debug("优化版本：使用Java计算总电能消耗，开始时间: {}, 结束时间: {}, 模式: {}", startTime, endTime, mode);

        // 🔥 复用同样的非分页查询方法
        List<TempMonitor> rawData = restoration104Mapper.selectHourlyRawData(
                fixedWorkshop, startTime, endTime
        );

        log.info("从非分页查询获取原始数据记录数: {}", rawData.size());

        // 🔥 获取无压烧结的原始数据
        List<TempMonitor> presslessRawData = presslessSinteringMapper.selectHourlyRawData("无压烧结", startTime, endTime);

        // 🔥 根据模式计算总消耗
        Double totalConsumption = 0.0;
        Double presslessConsumption = 0.0;

        if ("day".equals(mode)) {
            // 日模式：先计算日能耗，再求总和
            List<DailyEnergyConsumption> dailyResults = EnergyCalculationUtils.calculateDailyEnergyFromRawData(
                    rawData, startTime, endTime, fixedWorkshop
            );

            totalConsumption = dailyResults.stream()
                    .filter(item -> item.getEnergyConsumption() != null)
                    .mapToDouble(DailyEnergyConsumption::getEnergyConsumption)
                    .sum();

            // 计算无压烧结的日能耗总和
            List<DailyEnergyConsumption> presslessDailyResults = EnergyCalculationUtils.calculateDailyEnergyFromRawData(
                    presslessRawData, startTime, endTime, "无压烧结"
            );
            presslessConsumption = presslessDailyResults.stream()
                    .filter(item -> item.getEnergyConsumption() != null)
                    .mapToDouble(DailyEnergyConsumption::getEnergyConsumption)
                    .sum();

            log.info("日模式计算: {}天数据，原始总消耗: {} kWh, 无压烧结: {} kWh", dailyResults.size(), totalConsumption, presslessConsumption);

        } else {
            // 小时模式：先计算小时能耗，再求总和
            List<HourlyEnergyConsumption> hourlyResults = EnergyCalculationUtils.calculateHourlyEnergyFromRawData(
                    rawData, startTime, endTime, fixedWorkshop
            );

            totalConsumption = hourlyResults.stream()
                    .filter(item -> item.getEnergyConsumption() != null)
                    .mapToDouble(HourlyEnergyConsumption::getEnergyConsumption)
                    .sum();

            // 计算无压烧结的小时能耗总和
            List<HourlyEnergyConsumption> presslessHourlyResults = EnergyCalculationUtils.calculateHourlyEnergyFromRawData(
                    presslessRawData, startTime, endTime, "无压烧结"
            );
            presslessConsumption = presslessHourlyResults.stream()
                    .filter(item -> item.getEnergyConsumption() != null)
                    .mapToDouble(HourlyEnergyConsumption::getEnergyConsumption)
                    .sum();

            log.info("小时模式计算: {}小时数据，原始总消耗: {} kWh, 无压烧结: {} kWh", hourlyResults.size(), totalConsumption, presslessConsumption);
        }

        // 🔥 扣除无压烧结的消耗
        Double adjustedConsumption = Math.max(0, totalConsumption - presslessConsumption);
        log.info("计算得到总电能消耗: {} kWh (已扣除无压烧结 {} kWh), 模式: {}", adjustedConsumption, presslessConsumption, mode);
        return adjustedConsumption;
    }
}