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
public interface Beading107Mapper extends BaseMapper<TempMonitor> {

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
     * 总电能消耗卡片
     */
    TempMonitorStatistics getStatistics(
            @Param("workshop") String workshop,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime
    );


    /**
     * 🔥 表格查询不分页用于优化性能
     */
    List<TempMonitor> selectHourlyRawData(
            @Param("workshop") String workshop,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime
    );

    /**
     * 🔥 查询需要减去的三个嵌套表原始数据
     *      (Workshop = '105烧结' AND DeviceID = '30107338' AND NodeID = '2')
     *       (Workshop = '112终检' AND DeviceID = '30107338' AND NodeID = '1')
     *        (Workshop = '101配料' AND DeviceID = '30107338' AND NodeID = '3
     */
    List<TempMonitor> selectNestedTablesRawData(
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
