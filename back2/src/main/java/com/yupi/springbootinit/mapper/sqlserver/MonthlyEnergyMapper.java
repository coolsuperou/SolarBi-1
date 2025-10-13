package com.yupi.springbootinit.mapper.sqlserver;

import com.yupi.springbootinit.model.entity.TempMonitor;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;

/**
 * 月度能耗统计 Mapper
 * 用于查询指定月份的原始监控数据
 */
@Mapper
public interface MonthlyEnergyMapper {

    /**
     * 查询指定时间范围内的原始监控数据
     * @param workshopList 允许访问的车间名称列表（为空列表则不返回任何数据）
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 原始监控数据列表
     */
    List<TempMonitor> selectMonthlyRawData(@Param("workshopList") List<String> workshopList,
                                           @Param("startTime") Date startTime,
                                           @Param("endTime") Date endTime);
}
