package com.yupi.springbootinit.mapper.sqlserver;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;

/**
 * 103冷压电能监控数据 Mapper
 * 使用 SQL Server 数据源
 * 
 * @author yupi
 */
@Mapper
public interface Rubber109Mapper extends BaseMapper<TempMonitor> {

    /**
     * 表格分页
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
     * 总电能消耗卡片
     */
    TempMonitorStatistics getStatistics(
            @Param("workshop") String workshop,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime
    );


    /**
     * 小时模式查询
     */
    List<HourlyEnergyConsumption> selectHourlyEnergyConsumptionQuery(
            @Param("workshop") String workshop,
            @Param("deviceId") String deviceId,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime
    );

    /**
     * 日模式查询
     */
    List<DailyEnergyConsumption> selectDailyEnergyConsumptionQuery(
            @Param("workshop") String workshop,
            @Param("deviceId") String deviceId,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime
    );

    /**
     * 电能消耗卡片
     */
    Double selectEnergyConsumption(
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime,
            @Param("mode") String mode  // 新增模式参数
    );
}
