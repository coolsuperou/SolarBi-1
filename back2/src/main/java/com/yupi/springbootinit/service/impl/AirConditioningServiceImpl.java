package com.yupi.springbootinit.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.mapper.sqlserver.AirConditioningMapper;
import com.yupi.springbootinit.mapper.sqlserver.AirConditioningMapper;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorQueryRequest;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import com.yupi.springbootinit.service.AirConditioningService;
import com.yupi.springbootinit.utils.EnergyCalculationUtils;
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
        String fixedWorkshop = "103冷压";

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


    /**
     * 总电能查询
     * @param workshop
     * @param startTime
     * @param endTime
     * @return
     */
    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public TempMonitorStatistics getStatistics(String workshop, Date startTime, Date endTime) {
        // 服务层也强制限定车间
        String fixedWorkshop = "103冷压";
        TempMonitorStatistics statistics = airConditioningMapper.getStatistics(fixedWorkshop, startTime, endTime);

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


    /**
     *
     * 小时查询
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
        String fixedWorkshop = "103冷压";
        log.debug("优化版本：使用统一计算工具类，车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", fixedWorkshop, deviceId, startTime, endTime);

        // 🔥 使用现有的非分页查询方法
        List<TempMonitor> rawData = airConditioningMapper.selectHourlyRawData(
                fixedWorkshop, startTime, endTime
        );

        log.info("从非分页查询获取原始数据记录数: {}, 时间范围: {} 到 {}", rawData.size(), startTime, endTime);

        // 🔥 调用统一的计算工具类
        List<HourlyEnergyConsumption> result = EnergyCalculationUtils.calculateHourlyEnergyFromRawData(
                rawData, startTime, endTime, fixedWorkshop
        );

        // 保持原有调试日志
        if (result != null && !result.isEmpty()) {
            log.info("=== 每小时电能消耗数据调试信息（优化版本-103冷压） ===");
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
     * 日模式查询
     * @param workshop
     * @param deviceId
     * @param startTime
     * @param endTime
     * @return
     */
    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public List<DailyEnergyConsumption> getDailyEnergyConsumptionQuery(String workshop, String deviceId, Date startTime, Date endTime) {
        String fixedWorkshop = "103冷压";
        log.debug("优化版本：使用selectHourlyRawData非分页查询后Java计算日能耗，车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", fixedWorkshop, deviceId, startTime, endTime);

        // 🔥 复用同样的非分页查询方法
        List<TempMonitor> rawData = airConditioningMapper.selectHourlyRawData(
                fixedWorkshop, startTime, endTime
        );

        log.info("从非分页查询获取原始数据记录数: {}, 时间范围: {} 到 {}", rawData.size(), startTime, endTime);

        // 🔥 调用统一工具类的日计算方法
        List<DailyEnergyConsumption> result = EnergyCalculationUtils.calculateDailyEnergyFromRawData(
                rawData, startTime, endTime, fixedWorkshop
        );

        // 保持原有调试日志
        if (result != null && !result.isEmpty()) {
            log.info("=== 每日电能消耗数据调试信息（优化版本-103冷压） ===");
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
     * 电能消耗卡片计算
     * @param startTime
     * @param endTime
     * @param mode
     * @return
     */
    @Override
    @Transactional(transactionManager = "secondaryTransactionManager", readOnly = true)
    public Double getEnergyConsumption(Date startTime, Date endTime, String mode) {
        String fixedWorkshop = "103冷压";
        log.debug("优化版本：使用Java计算总电能消耗，开始时间: {}, 结束时间: {}, 模式: {}", startTime, endTime, mode);

        // 🔥 复用同样的非分页查询方法
        List<TempMonitor> rawData = airConditioningMapper.selectHourlyRawData(
                fixedWorkshop, startTime, endTime
        );

        log.info("从非分页查询获取原始数据记录数: {}", rawData.size());

        // 🔥 根据模式计算总消耗
        Double totalConsumption = 0.0;

        if ("day".equals(mode)) {
            // 日模式：先计算日能耗，再求总和
            List<DailyEnergyConsumption> dailyResults = EnergyCalculationUtils.calculateDailyEnergyFromRawData(
                    rawData, startTime, endTime, fixedWorkshop
            );

            totalConsumption = dailyResults.stream()
                    .filter(item -> item.getEnergyConsumption() != null)
                    .mapToDouble(DailyEnergyConsumption::getEnergyConsumption)
                    .sum();

            log.info("日模式计算: {}天数据，总消耗: {} kWh", dailyResults.size(), totalConsumption);

        } else {
            // 小时模式：先计算小时能耗，再求总和
            List<HourlyEnergyConsumption> hourlyResults = EnergyCalculationUtils.calculateHourlyEnergyFromRawData(
                    rawData, startTime, endTime, fixedWorkshop
            );

            totalConsumption = hourlyResults.stream()
                    .filter(item -> item.getEnergyConsumption() != null)
                    .mapToDouble(HourlyEnergyConsumption::getEnergyConsumption)
                    .sum();

            log.info("小时模式计算: {}小时数据，总消耗: {} kWh", hourlyResults.size(), totalConsumption);
        }

        log.info("计算得到总电能消耗: {} kWh, 模式: {}", totalConsumption, mode);
        return totalConsumption != null ? totalConsumption : 0.0;
    }
}
