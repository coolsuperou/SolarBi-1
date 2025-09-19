package com.yupi.springbootinit.service;

import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;

import java.util.Date;
import java.util.List;

/**
 * 1#办公楼电能监控数据服务接口
 * 
 * @author yupi
 */
public interface OfficeBuildingService {

    /**
     * 获取最新的温湿电能数据
     */
    List<TempMonitor> getLatestData();


    /**
     * 获取所有车间列表
     */
    List<String> getAllWorkshops();



    /**
     * 获取统计信息
     */
    TempMonitorStatistics getStatistics(String workshop, Date startTime, Date endTime);

    /**
     * 获取设备数量统计
     */
    Integer getDeviceCount(String workshop, Date startTime, Date endTime);

    /**
     * 获取电能趋势数据
     */
    List<TempMonitor> getElectricEnergyTrend(String workshop, String deviceId, Date startTime, Date endTime, Integer limit);

    /**
     * 获取每小时电能消耗数据（默认模式-实时更新）
     */
    List<HourlyEnergyConsumption> getHourlyEnergyConsumption(String workshop, String deviceId, Date startTime, Date endTime);

    /**
     * 获取每小时电能消耗数据（查询模式-历史数据）
     */
    List<HourlyEnergyConsumption> getHourlyEnergyConsumptionQuery(String workshop, String deviceId, Date startTime, Date endTime);

    /**
     * 获取每日电能消耗数据（查询模式-历史数据）
     */
    List<DailyEnergyConsumption> getDailyEnergyConsumptionQuery(String workshop, String deviceId, Date startTime, Date endTime);
}
