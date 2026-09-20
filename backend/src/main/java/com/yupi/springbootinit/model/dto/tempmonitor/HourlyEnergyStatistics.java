package com.yupi.springbootinit.model.dto.tempmonitor;

import lombok.Data;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * 日能耗统计数据 DTO
 * <p>
 * 用于封装每日24小时能耗统计数据的API响应
 * 时间范围：当天 07:00 到次日 07:00（共24小时）
 * </p>
 */
@Data
public class HourlyEnergyStatistics implements Serializable {
    
    /**
     * 年份
     */
    private Integer year;
    
    /**
     * 月份
     */
    private Integer month;
    
    /**
     * 日期（查询的目标日期）
     */
    private Integer day;
    
    /**
     * 车间列表（动态获取，按名称排序）
     */
    private List<String> workshopList;
    
    /**
     * 各车间的24小时能耗数据
     * <p>
     * key: 车间名称
     * value: 24小时能耗列表，按时间顺序排列：
     *        索引0: 07:00-08:00
     *        索引1: 08:00-09:00
     *        ...
     *        索引16: 23:00-00:00（当天最后一小时）
     *        索引17: 00:00-01:00（次日第一小时）
     *        ...
     *        索引23: 06:00-07:00（次日最后一小时）
     * </p>
     */
    private Map<String, List<Double>> workshopHourlyData;
    
    /**
     * 每小时全部车间的总能耗
     * <p>
     * 24个元素的列表，每个元素为对应小时所有车间能耗之和
     * 时间顺序与 workshopHourlyData 的 value 列表一致
     * </p>
     */
    private List<Double> hourlyTotal;
    
    private static final long serialVersionUID = 1L;
}
