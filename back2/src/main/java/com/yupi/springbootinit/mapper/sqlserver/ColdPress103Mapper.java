package com.yupi.springbootinit.mapper.sqlserver;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Select;
import java.util.Date;
import java.util.List;

/**
 * 103冷压电能监控数据 Mapper
 * 使用 SQL Server 数据源
 * 
 * @author yupi
 */
@Mapper
public interface ColdPress103Mapper extends BaseMapper<TempMonitor> {


    /**
     * 查询最新数据
     */
    @Select("SELECT Id, DeviceID, Name, Tem, Hum, MAC, UpdateTime, ElectricEnergy, NodeID, Workshop " +
            "FROM RSWS_TempMonitor_Copy WHERE Workshop = '103冷压' ORDER BY UpdateTime DESC")
    List<TempMonitor> selectLatestData();

    /**
     * 根据车间查询数据
     */
    @Select("SELECT Id, DeviceID, Name, Tem, Hum, MAC, UpdateTime, ElectricEnergy, NodeID, Workshop " +
            "FROM RSWS_TempMonitor_Copy WHERE Workshop = '103冷压' ORDER BY UpdateTime DESC")
    List<TempMonitor> selectByWorkshop(String workshop);

    /**
     * 分页查询温湿电能数据（支持多条件查询）
     */
    Page<TempMonitor> selectPageByCondition(Page<TempMonitor> page,
                                            @Param("deviceId") String deviceId,
                                            @Param("name") String name,
                                            @Param("workshop") String workshop,
                                            @Param("startTime") Date startTime,
                                            @Param("endTime") Date endTime,
                                            @Param("sortField") String sortField,
                                            @Param("sortOrder") String sortOrder);

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
     * 计算电能消耗差值（支持模式参数）
     */
    Double selectEnergyConsumption(
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime,
            @Param("mode") String mode  // 新增模式参数
    );
}
