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

import java.util.Date;
import java.util.List;

/**
 * 标准计算策略
 * 适用于大多数车间的标准能耗计算策略
 * 直接调用 WorkshopEnergyMapper 查询数据，使用 EnergyCalculationUtils 工具类计算能耗
 * 
适用车间：Laboratory114（实验室114）、Granule102（颗粒车间102）、Cleaning106（清洗车间106）、
ColdPress103（冷压车间103）、Packaging101（包装车间101）、Assembly201（装配车间201）、
Welding202（焊接车间202）、Painting203（喷涂车间203）、Stamping204（冲压车间204）、
Casting205（铸造车间205）、Forging206（锻造车间206）、Machining207（机加工车间207）、
HeatTreatment208（热处理车间208）、SurfaceTreatment209（表面处理车间209）、
QualityControl210（质检车间210）、Warehouse301（仓储车间301）、
RawMaterial302（原材料车间302）、Finished303（成品车间303）、
Maintenance401（维修车间401）、Utility402（动力车间402）、以及其他所有标准计算车间
ColdPress103（冷压车间103）、以及其他所有标准计算车间，共计 20+ 个车间
 * 
 * @author 欧展煌
 * @date 2025-01-XX
 */
@Service
@Slf4j
public class StandardCalculationStrategy implements WorkshopCalculationStrategy {

    @Autowired
    private WorkshopEnergyMapper workshopEnergyMapper;

    /**
     * 分页查询温湿电能数据（支持多条件查询）
     * 验证需求: 3.2
     * 
     * @param workshopName 车间名称
     * @param request 查询请求参数
     * @return 分页结果
     */
    @Override
    public Page<TempMonitor> queryByCondition(String workshopName, TempMonitorQueryRequest request) {
        log.info("标准策略 - 分页查询车间数据: {}, 页码: {}, 页大小: {}", 
                workshopName, request.getCurrent(), request.getPageSize());
        
        // 创建分页对象
        Page<TempMonitor> page = new Page<>(request.getCurrent(), request.getPageSize());
        
        // 调用 Mapper 查询
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
        
        log.info("标准策略 - 查询完成，共 {} 条记录", result.getTotal());
        return result;
    }

    /**
     * 获取统计信息
     * 验证需求: 3.2
     * 
     * @param workshopName 车间名称
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 统计数据
     */
    @Override
    public TempMonitorStatistics getStatistics(String workshopName, Date startTime, Date endTime) {
        log.info("标准策略 - 获取统计数据: {}, 时间范围: {} 到 {}", 
                workshopName, startTime, endTime);
        
        // 调用 Mapper 查询统计数据
        TempMonitorStatistics statistics = workshopEnergyMapper.getStatistics(
                workshopName, 
                startTime, 
                endTime
        );
        
        log.info("标准策略 - 统计数据获取完成，总电能: {}", 
                statistics != null ? statistics.getTotalElectricEnergy() : "null");
        return statistics;
    }

    /**
     * 获取每小时电能消耗数据（查询模式-历史数据）
     * 验证需求: 3.6
     * 
     * @param workshopName 车间名称
     * @param deviceId 设备ID（标准策略中不使用此参数，保留用于接口兼容）
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
        
        log.info("标准策略 - 查询小时能耗: {}, 时间范围: {} 到 {}", 
                workshopName, startTime, endTime);
        
        // 1. 查询原始数据
        List<TempMonitor> rawData = workshopEnergyMapper.selectHourlyRawData(
                workshopName, 
                startTime, 
                endTime
        );
        
        log.debug("标准策略 - 查询到原始数据 {} 条", rawData != null ? rawData.size() : 0);
        
        // 2. 使用工具类计算小时能耗
        List<HourlyEnergyConsumption> result = EnergyCalculationUtils.calculateHourlyEnergyFromRawData(
                rawData, 
                startTime, 
                endTime, 
                workshopName
        );
        
        log.info("标准策略 - 小时能耗计算完成，共 {} 个小时数据点", result.size());
        return result;
    }

    /**
     * 获取每日电能消耗数据（查询模式-历史数据）
     * 验证需求: 3.6
     * 
     * @param workshopName 车间名称
     * @param deviceId 设备ID（标准策略中不使用此参数，保留用于接口兼容）
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
        
        log.info("标准策略 - 查询日能耗: {}, 时间范围: {} 到 {}", 
                workshopName, startTime, endTime);
        
        // 1. 查询原始数据
        List<TempMonitor> rawData = workshopEnergyMapper.selectHourlyRawData(
                workshopName, 
                startTime, 
                endTime
        );
        
        log.debug("标准策略 - 查询到原始数据 {} 条", rawData != null ? rawData.size() : 0);
        
        // 2. 使用工具类计算日能耗
        List<DailyEnergyConsumption> result = EnergyCalculationUtils.calculateDailyEnergyFromRawData(
                rawData, 
                startTime, 
                endTime, 
                workshopName
        );
        
        log.info("标准策略 - 日能耗计算完成，共 {} 天数据点", result.size());
        return result;
    }

    /**
     * 计算电能消耗差值
     * 根据 mode 参数调用对应的计算方法
     * 验证需求: 3.2, 3.6
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
        
        log.info("标准策略 - 计算能耗差值: {}, 模式: {}, 时间范围: {} 到 {}", 
                workshopName, mode, startTime, endTime);
        
        // 调用 Mapper 的能耗计算方法
        Double result = workshopEnergyMapper.selectEnergyConsumption(
                workshopName, 
                startTime, 
                endTime, 
                mode
        );
        
        log.info("标准策略 - 能耗差值计算完成: {} kWh", result);
        return result;
    }
}
