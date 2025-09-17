package com.yupi.springbootinit.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorQueryRequest;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;

import java.util.Date;
import java.util.List;

/**
 * 102造粒环保设备温湿电能监控数据服务接口
 * 
 * @author yupi
 */
public interface GranulationWorkshopService {

    /**
     * 获取最新的温湿电能数据
     */
    List<TempMonitor> getLatestData();

    /**
     * 按车间查询数据
     */
    List<TempMonitor> getDataByWorkshop(String workshop);

    /**
     * 获取所有车间列表
     */
    List<String> getAllWorkshops();

    /**
     * 根据设备ID查询数据
     */
    List<TempMonitor> getDataByDeviceId(String deviceId);

    /**
     * 分页查询温湿电能数据（支持多条件查询）
     */
    Page<TempMonitor> queryByCondition(TempMonitorQueryRequest request);

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

