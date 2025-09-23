package com.yupi.springbootinit.mapper.sqlserver;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.Date;
import java.util.List;

/**
 * 1#办公楼电能监控数据 Mapper
 * 使用 SQL Server 数据源
 * 
 * @author yupi
 */
@Mapper
public interface OfficeBuildingMapper extends BaseMapper<TempMonitor> {




    /**
     * 获取统计信息
     */
    TempMonitorStatistics getStatistics(
            @Param("workshop") String workshop,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime
    );

    /**
     * 获取设备数量
     */
    Integer getDeviceCount(
            @Param("workshop") String workshop,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime
    );

    /**
     * 获取电能趋势数据
     */
    List<TempMonitor> getElectricEnergyTrend(
            @Param("workshop") String workshop,
            @Param("deviceId") String deviceId,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime,
            @Param("limit") Integer limit
    );

    /**
     * 获取每小时电能消耗数据（默认模式-实时更新）
     */
    List<HourlyEnergyConsumption> getHourlyEnergyConsumption(
            @Param("workshop") String workshop,
            @Param("deviceId") String deviceId,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime
    );

    /**
     * 获取每小时电能消耗数据（查询模式-历史数据）
     */
    List<HourlyEnergyConsumption> getHourlyEnergyConsumptionQuery(
            @Param("workshop") String workshop,
            @Param("deviceId") String deviceId,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime
    );

    /**
     * 获取每日电能消耗数据（查询模式-历史数据）
     */
    List<DailyEnergyConsumption> getDailyEnergyConsumptionQuery(
            @Param("workshop") String workshop,
            @Param("deviceId") String deviceId,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime
    );

    /**
     * 统计设备数量
     */
    Integer countDevices(
            @Param("workshop") String workshop,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime
    );

    /**
     * 查询电能趋势数据（用于ServiceImpl）
     */
    List<TempMonitor> selectElectricEnergyTrend(
            @Param("workshop") String workshop,
            @Param("deviceId") String deviceId,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime,
            @Param("limit") Integer limit
    );



    /**
     * 查询每小时电能消耗数据（查询模式，用于ServiceImpl）
     */
    List<HourlyEnergyConsumption> selectHourlyEnergyConsumptionQuery(
            @Param("workshop") String workshop,
            @Param("deviceId") String deviceId,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime
    );

    /**
     * 查询每日电能消耗数据（用于ServiceImpl）
     */
    List<DailyEnergyConsumption> selectDailyEnergyConsumptionQuery(
            @Param("workshop") String workshop,
            @Param("deviceId") String deviceId,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime
    );

    /**
     * 计算电能消耗差值
     */
    Double selectEnergyConsumption(
            @Param("startTime") Date startTime, 
            @Param("endTime") Date endTime
    );
}
