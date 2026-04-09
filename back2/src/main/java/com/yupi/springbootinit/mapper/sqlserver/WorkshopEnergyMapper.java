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
 * 车间能耗统一 Mapper
 * 支持动态车间名称参数，适用于所有车间
 * 使用 SQL Server 数据源
 * 
 * @author 欧展煌
 */
@Mapper
public interface WorkshopEnergyMapper extends BaseMapper<TempMonitor> {

    /**
     * 分页查询温湿电能数据
     * 
     * @param page 分页对象
     * @param deviceId 设备ID（可选）
     * @param name 设备名称（可选）
     * @param workshop 车间名称（必需）
     * @param startTime 开始时间（可选）
     * @param endTime 结束时间（可选）
     * @param sortField 排序字段（可选）
     * @param sortOrder 排序方向（可选）
     * @return 分页结果
     */
    Page<TempMonitor> selectPageByCondition(
            Page<TempMonitor> page,
            @Param("deviceId") String deviceId,
            @Param("name") String name,
            @Param("workshop") String workshop,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime,
            @Param("sortField") String sortField,
            @Param("sortOrder") String sortOrder
    );

    /**
     * 获取统计信息
     * 
     * @param workshop 车间名称
     * @param startTime 开始时间（可选）
     * @param endTime 结束时间（可选）
     * @return 统计数据
     */
    TempMonitorStatistics getStatistics(
            @Param("workshop") String workshop,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime
    );

    /**
     * 查询小时原始数据（不分页，用于能耗计算）
     * 
     * @param workshop 车间名称
     * @param startTime 开始时间（可选）
     * @param endTime 结束时间（可选）
     * @return 原始数据列表
     */
    List<TempMonitor> selectHourlyRawData(
            @Param("workshop") String workshop,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime
    );

    /**
     * 查询嵌套表原始数据（仅用于 Beading107 车间）
     * 查询 105烧结、112终检、101配料 的特定设备数据
     * 
     * @param startTime 开始时间（可选）
     * @param endTime 结束时间（可选）
     * @return 嵌套表原始数据列表
     */
    List<TempMonitor> selectNestedTablesRawData(
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime
    );

    /**
     * 计算电能消耗差值
     * 
     * @param workshop 车间名称
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param mode 计算模式（hour/day）
     * @return 能耗差值
     */
    Double selectEnergyConsumption(
            @Param("workshop") String workshop,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime,
            @Param("mode") String mode
    );
}
