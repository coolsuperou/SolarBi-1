package com.yupi.springbootinit.model.dto.tempmonitor;

import lombok.Data;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * 月度能耗统计数据 DTO
 */
@Data
public class MonthlyEnergyStatistics implements Serializable {
    
    /**
     * 年份
     */
    private Integer year;
    
    /**
     * 月份
     */
    private Integer month;
    
    /**
     * 该月天数
     */
    private Integer daysInMonth;
    
    /**
     * 车间列表（动态获取，按名称排序）
     */
    private List<String> workshopList;
    
    /**
     * 各车间的每日能耗数据
     * key: 车间名称, value: 每日能耗列表（按日期顺序，索引0表示1号）
     */
    private Map<String, List<Double>> workshopDailyData;
    
    /**
     * 各车间的月度总能耗
     * key: 车间名称, value: 月度总能耗
     */
    private Map<String, Double> workshopMonthlyTotal;
    
    /**
     * 每日全部车间的总能耗
     */
    private List<Double> dailyTotal;
    
    /**
     * 月度总能耗
     */
    private Double monthlyTotal;
    
    private static final long serialVersionUID = 1L;
}


