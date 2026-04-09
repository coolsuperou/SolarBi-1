package com.yupi.springbootinit.strategy;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorQueryRequest;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;

import java.util.Date;
import java.util.List;

/**
 * 车间能耗计算策略接口
 * 定义所有车间能耗计算的统一接口，支持不同的计算策略实现
 * 
 * @author 欧展煌
 */
public interface WorkshopCalculationStrategy {

    /**
     * 分页查询温湿电能数据（支持多条件查询）
     * 
     * @param workshopName 车间名称
     * @param request 查询请求参数
     * @return 分页结果
     */
    Page<TempMonitor> queryByCondition(String workshopName, TempMonitorQueryRequest request);

    /**
     * 获取统计信息
     * 
     * @param workshopName 车间名称
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 统计数据
     */
    TempMonitorStatistics getStatistics(String workshopName, Date startTime, Date endTime);

    /**
     * 获取每小时电能消耗数据（查询模式-历史数据）
     * 
     * @param workshopName 车间名称
     * @param deviceId 设备ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 小时能耗列表
     */
    List<HourlyEnergyConsumption> getHourlyEnergyConsumptionQuery(
            String workshopName, 
            String deviceId, 
            Date startTime, 
            Date endTime
    );

    /**
     * 获取每日电能消耗数据（查询模式-历史数据）
     * 
     * @param workshopName 车间名称
     * @param deviceId 设备ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 日能耗列表
     */
    List<DailyEnergyConsumption> getDailyEnergyConsumptionQuery(
            String workshopName, 
            String deviceId, 
            Date startTime, 
            Date endTime
    );

    /**
     * 计算电能消耗差值
     * 
     * @param workshopName 车间名称
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param mode 计算模式
     * @return 能耗差值
     */
    Double getEnergyConsumption(
            String workshopName, 
            Date startTime, 
            Date endTime, 
            String mode
    );
}
