package com.yupi.springbootinit.mapper.sqlserver;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;

/**
 * 无压烧结车间电能监控数据 Mapper
 * 使用 SQL Server 数据源
 * 
 * @author yupi
 */
@Mapper
public interface PresslessSinteringMapper extends BaseMapper<TempMonitor> {

    /**
     * 表格分页、表格数据
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
     *  表格分页（带电能表过滤）
     */
    Page<TempMonitor> selectPageByConditionWithFilter(Page<TempMonitor> page,
                                            @Param("deviceId") String deviceId,
                                            @Param("name") String name,
                                            @Param("workshop") String workshop,
                                            @Param("startTime") Date startTime,
                                            @Param("endTime") Date endTime,
                                            @Param("sortField") String sortField,
                                            @Param("sortOrder") String sortOrder,
                                            @Param("electricMeterNames") List<String> electricMeterNames);

    /**
     * 总电能消耗卡片
     */
    TempMonitorStatistics getStatistics(
            @Param("workshop") String workshop,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime
    );

    /**
     * 表格查询不分页用于优化性能
     */
    List<TempMonitor> selectHourlyRawData(
            @Param("workshop") String workshop,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime
    );

    /**
     * 电能消耗卡片
     */
    Double selectEnergyConsumption(
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime,
            @Param("mode") String mode
    );

    /**
     *  查询无压烧结车间的电能表设备名称列表
     * 从 tbl_monitordevice 表中查询 IsElectricMeter=1 的设备
     * @param workshop 车间名称
     * @return 电能表设备名称列表
     */
    List<String> getElectricMeterNames(@Param("workshop") String workshop);
}
