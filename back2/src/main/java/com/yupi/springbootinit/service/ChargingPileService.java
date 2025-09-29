package com.yupi.springbootinit.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorQueryRequest;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;

import java.util.Date;
import java.util.List;

/**
 * 103冷压电能监控数据服务接口
 * 
 * @author yupi
 */
public interface ChargingPileService {




    /**
     * 分页查询温湿电能数据（支持多条件查询）
     */
    Page<TempMonitor> queryByCondition(TempMonitorQueryRequest request);




    /**
     * 获取统计信息
     */
    TempMonitorStatistics getStatistics(String workshop, Date startTime, Date endTime);



    /**
     * 获取每小时电能消耗数据（查询模式-历史数据）
     */
    List<HourlyEnergyConsumption> getHourlyEnergyConsumptionQuery(String workshop, String deviceId, Date startTime, Date endTime);

    /**
     * 获取每日电能消耗数据（查询模式-历史数据）
     */
    List<DailyEnergyConsumption> getDailyEnergyConsumptionQuery(String workshop, String deviceId, Date startTime, Date endTime);

    /**
     * 计算电能消耗差值
     */
    Double getEnergyConsumption(Date startTime, Date endTime, String mode);
}
