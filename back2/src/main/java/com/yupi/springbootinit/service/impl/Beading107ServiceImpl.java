package com.yupi.springbootinit.service.impl;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.mapper.sqlserver.Beading107Mapper;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorQueryRequest;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import com.yupi.springbootinit.service.Beading107Service;
import com.yupi.springbootinit.service.ColdPress103Service;
import com.yupi.springbootinit.utils.EnergyCalculationUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

/**
 * 107串珠车间温湿电能监控数据服务实现
 * 使用SQL Server数据源 + MyBatis
 * 
 * @author yupi
 */
@Service
@Slf4j
public class Beading107ServiceImpl implements Beading107Service {

    @Autowired
    private Beading107Mapper beading107Mapper;




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
        String fixedWorkshop = "107串珠";

        return beading107Mapper.selectPageByCondition(
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
        String fixedWorkshop = "107串珠";
        TempMonitorStatistics statistics = beading107Mapper.getStatistics(fixedWorkshop, startTime, endTime);

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
        String fixedWorkshop = "107串珠";
        log.debug("优化版本：使用统一计算工具类，车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", fixedWorkshop, deviceId, startTime, endTime);

        // 🔥 获取107串珠数据
        List<TempMonitor> rawData = beading107Mapper.selectHourlyRawData(
                fixedWorkshop, startTime, endTime
        );

        // 🔥 获取嵌套表数据
        List<TempMonitor> nestedRawData = beading107Mapper.selectNestedTablesRawData(
                startTime, endTime
        );

        log.info("从非分页查询获取107串珠数据记录数: {}, 嵌套表数据记录数: {}, 时间范围: {} 到 {}",
                rawData.size(), nestedRawData.size(), startTime, endTime);

        // 🔥 分别计算107串珠和嵌套表的小时能耗
        List<HourlyEnergyConsumption> mainResult = EnergyCalculationUtils.calculateHourlyEnergyFromRawData(
                rawData, startTime, endTime, fixedWorkshop
        );
        List<HourlyEnergyConsumption> nestedResult = EnergyCalculationUtils.calculateHourlyEnergyFromRawData(
                nestedRawData, startTime, endTime, "嵌套表"
        );

        // 🔥 减法操作：从主结果中减去嵌套表对应时间的消耗
        Map<Date, Double> nestedMap = nestedResult.stream()
                .collect(Collectors.toMap(
                        HourlyEnergyConsumption::getHour,
                        item -> item.getEnergyConsumption() != null ? item.getEnergyConsumption() : 0.0,
                        Double::sum
                ));

        for (HourlyEnergyConsumption mainItem : mainResult) {
            if (mainItem.getHour() != null && mainItem.getEnergyConsumption() != null) {
                Double nestedConsumption = nestedMap.get(mainItem.getHour());
                if (nestedConsumption != null && nestedConsumption > 0) {
                    Double netConsumption = Math.max(0.0, mainItem.getEnergyConsumption() - nestedConsumption);
                    log.debug("小时: {}, 107串珠: {} kWh, 嵌套表: {} kWh, 净消耗: {} kWh",
                            mainItem.getHour(), mainItem.getEnergyConsumption(), nestedConsumption, netConsumption);
                    mainItem.setEnergyConsumption(netConsumption);
                }
            }
        }

        // 保持原有调试日志
        if (mainResult != null && !mainResult.isEmpty()) {
            log.info("=== 每小时电能消耗数据调试信息（优化版本-107串珠，已减去嵌套表） ===");
            log.info("计算结果总数: {}", mainResult.size());
            for (HourlyEnergyConsumption item : mainResult) {
                log.info("设备: {}, 小时: {}, 开始能耗: {}, 结束能耗: {}, 消耗量: {}, 开始时间: {}, 结束时间: {}",
                        item.getDeviceId(), item.getHour(), item.getStartEnergy(), item.getEndEnergy(),
                        item.getEnergyConsumption(), item.getStartTime(), item.getEndTime());
            }
            log.info("=== 调试信息结束 ===");
        } else {
            log.warn("计算结果为空，原始数据记录数: {}", rawData.size());
        }

        return mainResult;
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
        String fixedWorkshop = "107串珠";
        log.debug("优化版本：使用selectHourlyRawData非分页查询后Java计算日能耗，车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", fixedWorkshop, deviceId, startTime, endTime);

        // 🔥 获取107串珠数据
        List<TempMonitor> rawData = beading107Mapper.selectHourlyRawData(
                fixedWorkshop, startTime, endTime
        );

        // 🔥 获取嵌套表数据
        List<TempMonitor> nestedRawData = beading107Mapper.selectNestedTablesRawData(
                startTime, endTime
        );

        log.info("从非分页查询获取107串珠数据记录数: {}, 嵌套表数据记录数: {}, 时间范围: {} 到 {}",
                rawData.size(), nestedRawData.size(), startTime, endTime);

        // 🔥 分别计算107串珠和嵌套表的日能耗
        List<DailyEnergyConsumption> mainResult = EnergyCalculationUtils.calculateDailyEnergyFromRawData(
                rawData, startTime, endTime, fixedWorkshop
        );
        List<DailyEnergyConsumption> nestedResult = EnergyCalculationUtils.calculateDailyEnergyFromRawData(
                nestedRawData, startTime, endTime, "嵌套表"
        );

        // 🔥 减法操作：从主结果中减去嵌套表对应日期的消耗
        Map<Date, Double> nestedMap = nestedResult.stream()
                .collect(Collectors.toMap(
                        DailyEnergyConsumption::getDay,
                        item -> item.getEnergyConsumption() != null ? item.getEnergyConsumption() : 0.0,
                        Double::sum
                ));

        for (DailyEnergyConsumption mainItem : mainResult) {
            if (mainItem.getDay() != null && mainItem.getEnergyConsumption() != null) {
                Double nestedConsumption = nestedMap.get(mainItem.getDay());
                if (nestedConsumption != null && nestedConsumption > 0) {
                    Double netConsumption = Math.max(0.0, mainItem.getEnergyConsumption() - nestedConsumption);
                    log.debug("日期: {}, 107串珠: {} kWh, 嵌套表: {} kWh, 净消耗: {} kWh",
                            mainItem.getDay(), mainItem.getEnergyConsumption(), nestedConsumption, netConsumption);
                    mainItem.setEnergyConsumption(netConsumption);
                }
            }
        }

        // 保持原有调试日志
        if (mainResult != null && !mainResult.isEmpty()) {
            log.info("=== 每日电能消耗数据调试信息（优化版本-107串珠，已减去嵌套表） ===");
            for (DailyEnergyConsumption item : mainResult) {
                log.info("设备: {}, 日期: {}, 开始能耗: {}, 结束能耗: {}, 消耗量: {}, 开始时间: {}, 结束时间: {}",
                        item.getDeviceId(), item.getDay(), item.getStartEnergy(), item.getEndEnergy(),
                        item.getEnergyConsumption(), item.getStartTime(), item.getEndTime());
            }
            log.info("=== 调试信息结束 ===");
        }

        return mainResult;
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
        String fixedWorkshop = "107串珠";
        log.debug("优化版本：使用Java计算总电能消耗，开始时间: {}, 结束时间: {}, 模式: {}", startTime, endTime, mode);

        // 🔥 获取107串珠数据
        List<TempMonitor> rawData = beading107Mapper.selectHourlyRawData(
                fixedWorkshop, startTime, endTime
        );

        // 🔥 获取嵌套表数据
        List<TempMonitor> nestedRawData = beading107Mapper.selectNestedTablesRawData(
                startTime, endTime
        );

        log.info("从非分页查询获取107串珠数据记录数: {}, 嵌套表数据记录数: {}", rawData.size(), nestedRawData.size());

        // 🔥 根据模式计算总消耗
        Double mainTotalConsumption = 0.0;
        Double nestedTotalConsumption = 0.0;

        if ("day".equals(mode)) {
            // 日模式：先计算日能耗，再求总和
            List<DailyEnergyConsumption> mainDailyResults = EnergyCalculationUtils.calculateDailyEnergyFromRawData(
                    rawData, startTime, endTime, fixedWorkshop
            );
            List<DailyEnergyConsumption> nestedDailyResults = EnergyCalculationUtils.calculateDailyEnergyFromRawData(
                    nestedRawData, startTime, endTime, "嵌套表"
            );

            mainTotalConsumption = mainDailyResults.stream()
                    .filter(item -> item.getEnergyConsumption() != null)
                    .mapToDouble(DailyEnergyConsumption::getEnergyConsumption)
                    .sum();

            nestedTotalConsumption = nestedDailyResults.stream()
                    .filter(item -> item.getEnergyConsumption() != null)
                    .mapToDouble(DailyEnergyConsumption::getEnergyConsumption)
                    .sum();

            log.info("日模式计算: 107串珠总消耗: {} kWh, 嵌套表总消耗: {} kWh", mainTotalConsumption, nestedTotalConsumption);

        } else {
            // 小时模式：先计算小时能耗，再求总和
            List<HourlyEnergyConsumption> mainHourlyResults = EnergyCalculationUtils.calculateHourlyEnergyFromRawData(
                    rawData, startTime, endTime, fixedWorkshop
            );
            List<HourlyEnergyConsumption> nestedHourlyResults = EnergyCalculationUtils.calculateHourlyEnergyFromRawData(
                    nestedRawData, startTime, endTime, "嵌套表"
            );

            mainTotalConsumption = mainHourlyResults.stream()
                    .filter(item -> item.getEnergyConsumption() != null)
                    .mapToDouble(HourlyEnergyConsumption::getEnergyConsumption)
                    .sum();

            nestedTotalConsumption = nestedHourlyResults.stream()
                    .filter(item -> item.getEnergyConsumption() != null)
                    .mapToDouble(HourlyEnergyConsumption::getEnergyConsumption)
                    .sum();

            log.info("小时模式计算: 107串珠总消耗: {} kWh, 嵌套表总消耗: {} kWh", mainTotalConsumption, nestedTotalConsumption);
        }

        // 🔥 计算净消耗
        Double netTotalConsumption = Math.max(0.0, mainTotalConsumption - nestedTotalConsumption);

        log.info("计算得到总电能消耗: {} kWh, 模式: {}（107串珠: {} - 嵌套表: {} = 净消耗: {}）",
                netTotalConsumption, mode, mainTotalConsumption, nestedTotalConsumption, netTotalConsumption);
        return netTotalConsumption;
    }
}