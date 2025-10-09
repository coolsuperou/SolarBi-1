package com.yupi.springbootinit.mapper.sqlserver;

import com.yupi.springbootinit.model.entity.TempMonitor;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;

/**
 * 日能耗统计 Mapper
 * 用于查询指定日期的原始监控数据（24小时范围）
 */
@Mapper
public interface HourlyEnergyMapper {

    /**
     * 查询指定时间范围内所有车间的原始监控数据
     * <p>
     * 用于日能耗统计，查询当天 07:00 到次日 08:00 的数据（多查1小时用于计算最后一个小时的能耗）
     * </p>
     * 
     * @param startTime 开始时间（当天 07:00）
     * @param endTime 结束时间（次日 08:00）
     * @return 原始监控数据列表，按车间名称和时间排序
     */
    List<TempMonitor> selectAllWorkshopsHourlyData(@Param("startTime") Date startTime,
                                                    @Param("endTime") Date endTime);
}
