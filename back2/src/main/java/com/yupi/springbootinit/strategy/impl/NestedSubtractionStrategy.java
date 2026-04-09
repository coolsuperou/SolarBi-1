package com.yupi.springbootinit.strategy.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.mapper.sqlserver.WorkshopEnergyMapper;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorQueryRequest;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import com.yupi.springbootinit.strategy.WorkshopCalculationStrategy;
import com.yupi.springbootinit.utils.EnergyCalculationUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 嵌套减法计算策略
 * 适用于 Beading107（107串珠）车间的特殊计算策略
 * 需要从主车间能耗中减去嵌套表（105烧结、112终检、101配料）的能耗
 * 
 * 计算逻辑：
 * 1. 查询107串珠主车间的所有设备数据
 * 2. 查询嵌套表数据（105烧结、112终检、101配料的特定设备）
 * 3. 使用 EnergyCalculationUtils 分别计算主车间和嵌套表的能耗
 * 4. 从主车间能耗中减去对应时间点的嵌套表能耗
 * 5. 如果减法结果为负数，则将能耗设置为0
 * 
 * 验证需求: 3.3, 3.7, 6.1-6.7, 10.7
 * 
 * @author 欧展煌
 * @date 2025-01-XX
 */
@Service
@Slf4j
public class NestedSubtractionStrategy implements WorkshopCalculationStrategy {

    @Autowired
    private WorkshopEnergyMapper workshopEnergyMapper;

    /**
     * 分页查询温湿电能数据（支持多条件查询）
     * 验证需求: 3.3
     * 
     * @param workshopName 车间名称
     * @param request 查询请求参数
     * @return 分页结果
     */
    @Override
    public Page<TempMonitor> queryByCondition(String workshopName, TempMonitorQueryRequest request) {
        log.info("嵌套减法策略 - 分页查询车间数据: {}, 页码: {}, 页大小: {}", 
                workshopName, request.getCurrent(), request.getPageSize());
        
        // 创建分页对象
        Page<TempMonitor> page = new Page<>(request.getCurrent(), request.getPageSize());
        
        // 调用 Mapper 查询（嵌套减法策略的分页查询与标准策略相同）
        Page<TempMonitor> result = workshopEnergyMapper.selectPageByCondition(
                page,
                request.getDeviceId(),
                request.getName(),
                workshopName,
                request.getStartTime(),
                request.getEndTime(),
                request.getSortField(),
                request.getSortOrder()
        );
        
        log.info("嵌套减法策略 - 查询完成，共 {} 条记录", result.getTotal());
        return result;
    }

    /**
     * 获取统计信息
     * 验证需求: 3.3
     * 
     * @param workshopName 车间名称
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 统计数据
     */
    @Override
    public TempMonitorStatistics getStatistics(String workshopName, Date startTime, Date endTime) {
        log.info("嵌套减法策略 - 获取统计数据: {}, 时间范围: {} 到 {}", 
                workshopName, startTime, endTime);
        
        // 调用 Mapper 查询统计数据（嵌套减法策略的统计与标准策略相同）
        TempMonitorStatistics statistics = workshopEnergyMapper.getStatistics(
                workshopName, 
                startTime, 
                endTime
        );
        
        log.info("嵌套减法策略 - 统计数据获取完成，总电能: {}", 
                statistics != null ? statistics.getTotalElectricEnergy() : "null");
        return statistics;
    }

    /**
     * 获取每小时电能消耗数据（查询模式-历史数据）
     * 验证需求: 3.7, 6.1-6.7, 10.7
     * 
     * @param workshopName 车间名称
     * @param deviceId 设备ID（嵌套减法策略中不使用此参数，保留用于接口兼容）
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 小时能耗列表
     */
    @Override
    public List<HourlyEnergyConsumption> getHourlyEnergyConsumptionQuery(
            String workshopName, 
            String deviceId, 
            Date startTime, 
            Date endTime) {
        
        log.info("嵌套减法策略 - 查询小时能耗: {}, 时间范围: {} 到 {}", 
                workshopName, startTime, endTime);
        
        // 1. 查询107串珠主车间数据
        log.debug("嵌套减法策略 - 步骤1: 查询主车间数据 {}", workshopName);
        List<TempMonitor> mainData = workshopEnergyMapper.selectHourlyRawData(
                workshopName, 
                startTime, 
                endTime
        );
        log.info("嵌套减法策略 - 主车间原始数据: {} 条", mainData != null ? mainData.size() : 0);
        
        // 2. 查询嵌套表数据（105烧结、112终检、101配料）
        log.debug("嵌套减法策略 - 步骤2: 查询嵌套表数据（105烧结、112终检、101配料）");
        List<TempMonitor> nestedData = workshopEnergyMapper.selectNestedTablesRawData(
                startTime, 
                endTime
        );
        log.info("嵌套减法策略 - 嵌套表原始数据: {} 条", nestedData != null ? nestedData.size() : 0);
        
        // 3. 分别计算主车间和嵌套表的小时能耗
        log.debug("嵌套减法策略 - 步骤3: 计算主车间小时能耗");
        List<HourlyEnergyConsumption> mainResult = 
                EnergyCalculationUtils.calculateHourlyEnergyFromRawData(
                        mainData, 
                        startTime, 
                        endTime, 
                        workshopName
                );
        log.info("嵌套减法策略 - 主车间小时能耗计算完成: {} 个小时数据点", mainResult.size());
        
        log.debug("嵌套减法策略 - 步骤4: 计算嵌套表小时能耗");
        List<HourlyEnergyConsumption> nestedResult = 
                EnergyCalculationUtils.calculateHourlyEnergyFromRawData(
                        nestedData, 
                        startTime, 
                        endTime, 
                        "嵌套表"
                );
        log.info("嵌套减法策略 - 嵌套表小时能耗计算完成: {} 个小时数据点", nestedResult.size());
        
        // 4. 执行减法操作
        log.debug("嵌套减法策略 - 步骤5: 执行减法操作");
        Map<Date, BigDecimal> nestedMap = nestedResult.stream()
                .collect(Collectors.toMap(
                        HourlyEnergyConsumption::getHour,
                        item -> item.getEnergyConsumption() != null ? 
                                item.getEnergyConsumption() : BigDecimal.ZERO,
                        BigDecimal::add
                ));
        
        for (HourlyEnergyConsumption mainItem : mainResult) {
            BigDecimal mainConsumption = mainItem.getEnergyConsumption();
            BigDecimal nestedConsumption = nestedMap.getOrDefault(mainItem.getHour(), BigDecimal.ZERO);
            
            if (nestedConsumption.compareTo(BigDecimal.ZERO) > 0) {
                // 执行减法，确保结果不为负数
                BigDecimal netConsumption = mainConsumption.subtract(nestedConsumption)
                        .max(BigDecimal.ZERO);
                
                log.debug("嵌套减法策略 - 小时: {}, 主车间能耗: {} kWh, 嵌套表能耗: {} kWh, 净消耗: {} kWh",
                        mainItem.getHour(), mainConsumption, nestedConsumption, netConsumption);
                
                mainItem.setEnergyConsumption(netConsumption);
            }
        }
        
        log.info("嵌套减法策略 - 小时能耗减法计算完成，共 {} 个小时数据点", mainResult.size());
        return mainResult;
    }

    /**
     * 获取每日电能消耗数据（查询模式-历史数据）
     * 验证需求: 3.7, 6.1-6.7, 10.7
     * 
     * @param workshopName 车间名称
     * @param deviceId 设备ID（嵌套减法策略中不使用此参数，保留用于接口兼容）
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 日能耗列表
     */
    @Override
    public List<DailyEnergyConsumption> getDailyEnergyConsumptionQuery(
            String workshopName, 
            String deviceId, 
            Date startTime, 
            Date endTime) {
        
        log.info("嵌套减法策略 - 查询日能耗: {}, 时间范围: {} 到 {}", 
                workshopName, startTime, endTime);
        
        // 1. 查询107串珠主车间数据
        log.debug("嵌套减法策略 - 步骤1: 查询主车间数据 {}", workshopName);
        List<TempMonitor> mainData = workshopEnergyMapper.selectHourlyRawData(
                workshopName, 
                startTime, 
                endTime
        );
        log.info("嵌套减法策略 - 主车间原始数据: {} 条", mainData != null ? mainData.size() : 0);
        
        // 2. 查询嵌套表数据（105烧结、112终检、101配料）
        log.debug("嵌套减法策略 - 步骤2: 查询嵌套表数据（105烧结、112终检、101配料）");
        List<TempMonitor> nestedData = workshopEnergyMapper.selectNestedTablesRawData(
                startTime, 
                endTime
        );
        log.info("嵌套减法策略 - 嵌套表原始数据: {} 条", nestedData != null ? nestedData.size() : 0);
        
        // 3. 分别计算主车间和嵌套表的日能耗
        log.debug("嵌套减法策略 - 步骤3: 计算主车间日能耗");
        List<DailyEnergyConsumption> mainResult = 
                EnergyCalculationUtils.calculateDailyEnergyFromRawData(
                        mainData, 
                        startTime, 
                        endTime, 
                        workshopName
                );
        log.info("嵌套减法策略 - 主车间日能耗计算完成: {} 天数据点", mainResult.size());
        
        log.debug("嵌套减法策略 - 步骤4: 计算嵌套表日能耗");
        List<DailyEnergyConsumption> nestedResult = 
                EnergyCalculationUtils.calculateDailyEnergyFromRawData(
                        nestedData, 
                        startTime, 
                        endTime, 
                        "嵌套表"
                );
        log.info("嵌套减法策略 - 嵌套表日能耗计算完成: {} 天数据点", nestedResult.size());
        
        // 4. 执行减法操作
        log.debug("嵌套减法策略 - 步骤5: 执行减法操作");
        Map<Date, BigDecimal> nestedMap = nestedResult.stream()
                .collect(Collectors.toMap(
                        DailyEnergyConsumption::getDay,
                        item -> item.getEnergyConsumption() != null ? 
                                item.getEnergyConsumption() : BigDecimal.ZERO,
                        BigDecimal::add
                ));
        
        for (DailyEnergyConsumption mainItem : mainResult) {
            BigDecimal mainConsumption = mainItem.getEnergyConsumption();
            BigDecimal nestedConsumption = nestedMap.getOrDefault(mainItem.getDay(), BigDecimal.ZERO);
            
            if (nestedConsumption.compareTo(BigDecimal.ZERO) > 0) {
                // 执行减法，确保结果不为负数
                BigDecimal netConsumption = mainConsumption.subtract(nestedConsumption)
                        .max(BigDecimal.ZERO);
                
                log.debug("嵌套减法策略 - 日期: {}, 主车间能耗: {} kWh, 嵌套表能耗: {} kWh, 净消耗: {} kWh",
                        mainItem.getDay(), mainConsumption, nestedConsumption, netConsumption);
                
                mainItem.setEnergyConsumption(netConsumption);
            }
        }
        
        log.info("嵌套减法策略 - 日能耗减法计算完成，共 {} 天数据点", mainResult.size());
        return mainResult;
    }

    /**
     * 计算电能消耗差值
     * 根据 mode 参数调用对应的计算方法
     * 验证需求: 3.3, 3.7
     * 
     * @param workshopName 车间名称
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param mode 计算模式（hour/day）
     * @return 能耗差值
     */
    @Override
    public Double getEnergyConsumption(
            String workshopName, 
            Date startTime, 
            Date endTime, 
            String mode) {
        
        log.info("嵌套减法策略 - 计算能耗差值: {}, 模式: {}, 时间范围: {} 到 {}", 
                workshopName, mode, startTime, endTime);
        
        // 调用 Mapper 的能耗计算方法（嵌套减法策略的能耗差值计算与标准策略相同）
        Double result = workshopEnergyMapper.selectEnergyConsumption(
                workshopName, 
                startTime, 
                endTime, 
                mode
        );
        
        log.info("嵌套减法策略 - 能耗差值计算完成: {} kWh", result);
        return result;
    }
}
