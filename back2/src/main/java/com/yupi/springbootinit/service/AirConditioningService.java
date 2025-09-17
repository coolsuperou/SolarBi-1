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
 * 114_空调水机主机温湿电能监控数据服务接口
 */
public interface AirConditioningService {

    List<TempMonitor> getLatestData();

    List<TempMonitor> getDataByWorkshop(String workshop);

    List<String> getAllWorkshops();

    List<TempMonitor> getDataByDeviceId(String deviceId);

    Page<TempMonitor> queryByCondition(TempMonitorQueryRequest request);

    TempMonitorStatistics getStatistics(String workshop, Date startTime, Date endTime);

    Integer getDeviceCount(String workshop, Date startTime, Date endTime);

    List<TempMonitor> getElectricEnergyTrend(String workshop, String deviceId, Date startTime, Date endTime, Integer limit);

    List<HourlyEnergyConsumption> getHourlyEnergyConsumption(String workshop, String deviceId, Date startTime, Date endTime);

    List<HourlyEnergyConsumption> getHourlyEnergyConsumptionQuery(String workshop, String deviceId, Date startTime, Date endTime);

    List<DailyEnergyConsumption> getDailyEnergyConsumptionQuery(String workshop, String deviceId, Date startTime, Date endTime);
}

