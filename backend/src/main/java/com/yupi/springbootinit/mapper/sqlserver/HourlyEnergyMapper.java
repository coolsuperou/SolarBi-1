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
     * 查询指定时间范围内有权访问车间的原始监控数据
     * <p>
     * 用于日能耗统计，查询当天 07:00 到次日 08:00 的数据（多查1小时用于计算最后一个小时的能耗）
     * </p>
     * 
     * @param workshopList 允许访问的车间名称列表（为空列表则不返回任何数据）
     * @param startTime 开始时间（当天 07:00）
     * @param endTime 结束时间（次日 08:00）
     * @return 原始监控数据列表，按车间名称和时间排序
     */
    List<TempMonitor> selectAllWorkshopsHourlyData(@Param("workshopList") List<String> workshopList,
                                                    @Param("startTime") Date startTime,
                                                    @Param("endTime") Date endTime);

    /**
     * 🔥 批量查询多个车间的电能表设备（返回车间+设备名称）
     * @param workshopList 车间名称列表
     * @return 电能表设备列表（包含Workshop和Name字段）
     */
    List<TempMonitor> getElectricMetersByWorkshops(@Param("workshopList") List<String> workshopList);
}
